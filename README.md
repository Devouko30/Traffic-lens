# Traffic Lens Africa

AI-powered traffic monitoring — vehicle counting, classification, and ANPR from live camera feeds.

## Stack

| Layer | Technology |
|---|---|
| Detection | YOLOv8n (Ultralytics) |
| Tracking | ByteTrack (supervision) |
| Plate reading | EasyOCR |
| Video ingestion | OpenCV + RTSP |
| MJPEG stream | Built-in Python HTTP server |
| Backend API | FastAPI + SQLAlchemy 2 async |
| Database | PostgreSQL 16 |
| Live cache | Redis 7 |
| Frontend | React 18 + Vite + Tailwind + Recharts |
| Reverse proxy | Nginx |
| Containers | Docker Compose |

## Project structure

```
traffic-lens/
├── ai_engine/       YOLOv8 + ByteTrack + ANPR pipeline
├── backend/         FastAPI REST + WebSocket API
├── frontend/        React dashboard
├── infra/           docker-compose + nginx
└── .env.example
```

## Quick start (local, with a sample video)

### 1. Prerequisites
- Docker Desktop (or Docker Engine + Compose v2)
- A sample `.mp4` file placed at `ai_engine/sample.mp4`

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env — set JWT_SECRET to something random
```

### 3. Build and run
```bash
cd infra
docker compose up --build
```

Open http://localhost — you'll see the landing page.  
Open http://localhost/dashboard — sign in (register first via the API).

### 4. Register your first user
```bash
curl -X POST http://localhost/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"yourpassword"}'
```

### 5. Create a site
```bash
TOKEN=$(curl -s -X POST http://localhost/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"yourpassword"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

curl -X POST http://localhost/api/v1/sites \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id":"site_19_mombasa","name":"Site 19","location":"Mombasa Bonje","rtsp_url":"sample.mp4","line_y_ratio":0.6}'
```

## Pointing at a real RTSP camera

Set `RTSP_URL` in your `.env`:
```
RTSP_URL=rtsp://admin:password@192.168.1.100:554/stream1
```

Common formats:
- Hikvision: `rtsp://user:pass@ip:554/Streaming/Channels/101`
- Dahua: `rtsp://user:pass@ip:554/cam/realmonitor?channel=1&subtype=0`

## GPU acceleration

Uncomment the `deploy.resources` block in `infra/docker-compose.yml` and ensure the NVIDIA Container Toolkit is installed on the host.

## Deploying to a Linux server

```bash
# On the server
git clone <your-repo> traffic-lens
cd traffic-lens
cp .env.example .env && nano .env   # set real secrets + RTSP_URL
cd infra
docker compose up -d --build
```

Point your domain's DNS A record at the server IP, then add an SSL termination layer (Certbot + nginx on the host, or Cloudflare proxy).

## Development (without Docker)

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn backend.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**AI engine:**
```bash
cd ai_engine
pip install -r requirements.txt
SITE_ID=test RTSP_URL=sample.mp4 REDIS_URL=redis://localhost:6379 python pipeline.py
```
