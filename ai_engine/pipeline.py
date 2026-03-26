"""
Traffic Lens Africa — AI Engine (Enhanced)
YOLOv8 + ByteTrack + ANPR + Speed estimation + Redis pub/sub
Integrates vehicle-tracking-counting approach for robust multi-class detection.
"""

import os
import json
import time
import base64
import threading
from datetime import datetime, timezone
from typing import Optional

import cv2
import numpy as np
import easyocr
import redis
from ultralytics import YOLO
import supervision as sv

# ── Config ───────────────────────────────────────────────────────────────────
SITE_ID         = os.getenv("SITE_ID", "site_default")
RTSP_URL        = os.getenv("RTSP_URL", "sample.mp4")
REDIS_URL       = os.getenv("REDIS_URL", "redis://localhost:6379")
MJPEG_PORT      = int(os.getenv("MJPEG_PORT", "8889"))
TARGET_FPS      = int(os.getenv("TARGET_FPS", "10"))
CONF_THRESHOLD  = float(os.getenv("CONF_THRESHOLD", "0.45"))
LINE_Y_RATIO    = float(os.getenv("LINE_Y_RATIO", "0.6"))
PLATE_CONF_MIN  = float(os.getenv("PLATE_CONF_MIN", "0.55"))
RECONNECT_DELAY = int(os.getenv("RECONNECT_DELAY", "5"))
THUMB_SIZE      = int(os.getenv("THUMB_SIZE", "96"))   # px — thumbnail width for WS events

# COCO class IDs → human labels
YOLO_VEHICLE_IDS = {2: "car", 3: "motorcycle", 5: "bus", 7: "truck"}

# Color palette per class (BGR for OpenCV)
CLASS_COLORS = {
    "car":        (0, 200, 255),
    "truck":      (0, 80, 255),
    "bus":        (0, 255, 120),
    "motorcycle": (255, 160, 0),
}

# ── Redis ─────────────────────────────────────────────────────────────────────
r = redis.from_url(REDIS_URL, decode_responses=True)

# ── EasyOCR (lazy, CPU) ───────────────────────────────────────────────────────
_ocr: Optional[easyocr.Reader] = None


def get_ocr() -> easyocr.Reader:
    global _ocr
    if _ocr is None:
        _ocr = easyocr.Reader(["en"], gpu=False)
    return _ocr


def read_plate(frame: np.ndarray, box: np.ndarray) -> tuple[str, float]:
    """Crop + OCR the vehicle bounding box. Returns (plate_text, confidence)."""
    x1, y1, x2, y2 = box.astype(int)
    h, w = frame.shape[:2]
    pad_x = int((x2 - x1) * 0.25)
    pad_y = int((y2 - y1) * 0.15)
    cx1, cy1 = max(0, x1 - pad_x), max(0, y1 - pad_y)
    cx2, cy2 = min(w, x2 + pad_x), min(h, y2 + pad_y)
    crop = frame[cy1:cy2, cx1:cx2]
    if crop.size == 0:
        return "UNREAD", 0.0
    # Focus on lower 40% of crop (plate is usually at bottom of vehicle)
    plate_region = crop[int(crop.shape[0] * 0.6):, :]
    if plate_region.size == 0:
        plate_region = crop
    results = get_ocr().readtext(plate_region)
    if not results:
        return "UNREAD", 0.0
    best = max(results, key=lambda r: r[2])
    text, conf = best[1].upper().replace(" ", ""), best[2]
    # Basic plate validation: alphanumeric, 3-10 chars
    cleaned = "".join(c for c in text if c.isalnum())
    if conf < PLATE_CONF_MIN or len(cleaned) < 3 or len(cleaned) > 12:
        return "UNREAD", conf
    return cleaned, conf


def make_thumbnail(frame: np.ndarray, box: np.ndarray) -> str:
    """Crop vehicle and return base64-encoded JPEG thumbnail."""
    x1, y1, x2, y2 = box.astype(int)
    h, w = frame.shape[:2]
    pad = 10
    cx1, cy1 = max(0, x1 - pad), max(0, y1 - pad)
    cx2, cy2 = min(w, x2 + pad), min(h, y2 + pad)
    crop = frame[cy1:cy2, cx1:cx2]
    if crop.size == 0:
        return ""
    # Resize to fixed width
    ratio = THUMB_SIZE / max(crop.shape[1], 1)
    new_w = THUMB_SIZE
    new_h = max(1, int(crop.shape[0] * ratio))
    resized = cv2.resize(crop, (new_w, new_h))
    _, buf = cv2.imencode(".jpg", resized, [cv2.IMWRITE_JPEG_QUALITY, 70])
    return base64.b64encode(buf.tobytes()).decode("utf-8")


def publish_event(event: dict) -> None:
    r.publish("traffic:events", json.dumps(event))


# ── MJPEG server ──────────────────────────────────────────────────────────────
import socketserver
import http.server

_mjpeg_frame: bytes = b""
_mjpeg_lock = threading.Lock()


class MJPEGHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def do_GET(self):
        if self.path != "/stream":
            self.send_response(404)
            self.end_headers()
            return
        self.send_response(200)
        self.send_header("Content-Type", "multipart/x-mixed-replace; boundary=frame")
        self.end_headers()
        try:
            while True:
                with _mjpeg_lock:
                    frame = _mjpeg_frame
                if frame:
                    self.wfile.write(b"--frame\r\n")
                    self.wfile.write(b"Content-Type: image/jpeg\r\n\r\n")
                    self.wfile.write(frame)
                    self.wfile.write(b"\r\n")
                time.sleep(0.05)
        except (BrokenPipeError, ConnectionResetError):
            pass


def start_mjpeg_server() -> None:
    server = socketserver.ThreadingTCPServer(("0.0.0.0", MJPEG_PORT), MJPEGHandler)
    server.daemon_threads = True
    threading.Thread(target=server.serve_forever, daemon=True).start()
    print(f"[MJPEG] http://0.0.0.0:{MJPEG_PORT}/stream")


def push_mjpeg_frame(frame: np.ndarray) -> None:
    global _mjpeg_frame
    _, buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 78])
    with _mjpeg_lock:
        _mjpeg_frame = buf.tobytes()


# ── Logging ───────────────────────────────────────────────────────────────────
import logging as _logging
_log = _logging.getLogger("ai_engine")
_logging.basicConfig(level=_logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")


def open_capture(url: str) -> cv2.VideoCapture:
    while True:
        cap = cv2.VideoCapture(url)
        if cap.isOpened():
            _log.info(f"Opened: {url}")
            return cap
        _log.warning(f"Cannot open {url}, retrying in {RECONNECT_DELAY}s…")
        time.sleep(RECONNECT_DELAY)


# ── Main pipeline ─────────────────────────────────────────────────────────────
def run() -> None:
    _log.info(f"Starting — site={SITE_ID}  source={RTSP_URL}")
    start_mjpeg_server()

    # Use yolov8n for speed; swap to yolov8s/m for better accuracy
    model = YOLO("yolov8n.pt")
    model.fuse()

    tracker = sv.ByteTracker(
        track_activation_threshold=0.25,
        lost_track_buffer=30,
        minimum_matching_threshold=0.8,
        frame_rate=TARGET_FPS,
    )

    cap = open_capture(RTSP_URL)
    frame_w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    line_y  = int(frame_h * LINE_Y_RATIO)

    # Per-track state
    prev_cy:  dict[int, float] = {}
    prev_ts:  dict[int, float] = {}
    counted:  set[int]         = set()
    consecutive_failures = 0

    frame_interval = 1.0 / TARGET_FPS
    last_time = 0.0

    # Publish a heartbeat every 5 s so the frontend knows the engine is alive
    last_heartbeat = 0.0

    while True:
        ret, frame = cap.read()
        if not ret:
            consecutive_failures += 1
            is_file = not RTSP_URL.startswith("rtsp://")
            if is_file:
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                consecutive_failures = 0
            elif consecutive_failures >= 10:
                _log.warning("Stream lost — reconnecting…")
                cap.release()
                time.sleep(RECONNECT_DELAY)
                cap = open_capture(RTSP_URL)
                frame_w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                frame_h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                line_y  = int(frame_h * LINE_Y_RATIO)
                consecutive_failures = 0
            continue
        consecutive_failures = 0

        now = time.time()
        if now - last_time < frame_interval:
            continue
        last_time = now

        # Heartbeat
        if now - last_heartbeat > 5.0:
            r.publish("traffic:events", json.dumps({
                "type": "heartbeat",
                "site_id": SITE_ID,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }))
            last_heartbeat = now

        # ── Detection ────────────────────────────────────────────────────────
        results = model(frame, verbose=False)[0]
        boxes_xyxy  = results.boxes.xyxy.cpu().numpy()
        confidences = results.boxes.conf.cpu().numpy()
        class_ids   = results.boxes.cls.cpu().numpy().astype(int)

        mask = np.array([
            cid in YOLO_VEHICLE_IDS and confidences[i] >= CONF_THRESHOLD
            for i, cid in enumerate(class_ids)
        ])
        if mask.any():
            boxes_xyxy  = boxes_xyxy[mask]
            confidences = confidences[mask]
            class_ids   = class_ids[mask]
        else:
            boxes_xyxy  = np.empty((0, 4))
            confidences = np.empty((0,))
            class_ids   = np.empty((0,), dtype=int)

        detections = sv.Detections(
            xyxy=boxes_xyxy,
            confidence=confidences,
            class_id=class_ids,
        )

        # ── Tracking ─────────────────────────────────────────────────────────
        detections = tracker.update_with_detections(detections)

        # ── Line crossing + event publish ─────────────────────────────────────
        labels = []
        for box, tid, cid, conf in zip(
            detections.xyxy,
            detections.tracker_id,
            detections.class_id,
            detections.confidence,
        ):
            if tid is None:
                labels.append("")
                continue

            cx = (box[0] + box[2]) / 2
            cy = (box[1] + box[3]) / 2
            vehicle_class = YOLO_VEHICLE_IDS.get(int(cid), "car")
            labels.append(f"#{tid} {vehicle_class} {conf:.0%}")

            if tid not in counted:
                prev = prev_cy.get(tid)
                if prev is not None:
                    crossed_down = prev < line_y <= cy
                    crossed_up   = prev > line_y >= cy
                    if crossed_down or crossed_up:
                        direction = "N" if cy > prev else "S"
                        counted.add(tid)

                        # Speed estimate (px/s)
                        dt = now - prev_ts.get(tid, now)
                        speed_px_s = abs(cy - prev) / dt if dt > 0 else 0.0

                        # Plate OCR (only for cars/trucks — skip motorcycles for speed)
                        plate, plate_conf = "UNREAD", 0.0
                        if vehicle_class in ("car", "truck", "bus"):
                            plate, plate_conf = read_plate(frame, box)

                        # Thumbnail
                        thumb = make_thumbnail(frame, box)

                        event = {
                            "type":        "vehicle",
                            "site_id":     SITE_ID,
                            "timestamp":   datetime.now(timezone.utc).isoformat(),
                            "track_id":    int(tid),
                            "class":       vehicle_class,
                            "direction":   direction,
                            "plate":       plate,
                            "confidence":  round(float(conf), 3),
                            "speed_px_s":  round(speed_px_s, 1),
                            "thumb":       thumb,
                        }
                        publish_event(event)
                        _log.info(f"[Event] {vehicle_class} {direction} plate={plate} conf={conf:.2f}")

                prev_cy[tid] = cy
                prev_ts[tid] = now

        # ── Annotate frame ────────────────────────────────────────────────────
        annotated = frame.copy()

        # Draw bounding boxes per class color
        for box, tid, cid, conf in zip(
            detections.xyxy,
            detections.tracker_id,
            detections.class_id,
            detections.confidence,
        ):
            if tid is None:
                continue
            vc = YOLO_VEHICLE_IDS.get(int(cid), "car")
            color = CLASS_COLORS.get(vc, (0, 200, 255))
            x1, y1, x2, y2 = box.astype(int)
            cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)
            label = f"#{tid} {vc}"
            (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
            cv2.rectangle(annotated, (x1, y1 - th - 6), (x1 + tw + 4, y1), color, -1)
            cv2.putText(annotated, label, (x1 + 2, y1 - 4),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)

        # Counting line with gradient effect
        cv2.line(annotated, (0, line_y), (frame_w, line_y), (0, 0, 220), 3)
        cv2.line(annotated, (0, line_y - 1), (frame_w, line_y - 1), (0, 60, 255), 1)

        # Glassmorphism-style overlay (semi-transparent dark bar at top)
        overlay = annotated.copy()
        cv2.rectangle(overlay, (0, 0), (frame_w, 52), (5, 5, 8), -1)
        cv2.addWeighted(overlay, 0.65, annotated, 0.35, 0, annotated)

        # Site + count overlay
        total_in_frame = len([t for t in detections.tracker_id if t is not None])
        cv2.putText(annotated, SITE_ID.upper(),
                    (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        cv2.putText(annotated, f"IN FRAME: {total_in_frame}  |  COUNTED: {len(counted)}",
                    (10, 48), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (180, 180, 180), 1)

        push_mjpeg_frame(annotated)

    cap.release()


if __name__ == "__main__":
    run()
