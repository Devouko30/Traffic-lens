'use client';
import { useEffect, useRef, useState, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ScrollExpandMediaProps {
  mediaSrc: string;
  mediaType?: 'video' | 'image';
  posterSrc?: string;
  overlaySrc?: string;
  title?: string;
  date?: string;
  scrollToExpand?: string;
  /** Called on every scroll tick so parent can fade the bg video */
  onProgress?: (p: number) => void;
  children?: ReactNode;
}

const ScrollExpandMedia = ({
  mediaSrc,
  mediaType = 'image',
  posterSrc,
  overlaySrc,
  title,
  date,
  scrollToExpand,
  onProgress,
  children,
}: ScrollExpandMediaProps) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setScrollProgress(0);
    setShowContent(false);
    setMediaFullyExpanded(false);
  }, [mediaType]);

  useEffect(() => {
    const handleWheel = (e: Event) => {
      const we = e as unknown as WheelEvent;
      if (mediaFullyExpanded && we.deltaY < 0 && window.scrollY <= 5) {
        setMediaFullyExpanded(false);
        e.preventDefault();
      } else if (!mediaFullyExpanded) {
        e.preventDefault();
        const next = Math.min(Math.max(scrollProgress + we.deltaY * 0.0009, 0), 1);
        setScrollProgress(next);
        onProgress?.(next);
        if (next >= 1) { setMediaFullyExpanded(true); setShowContent(true); }
        else if (next < 0.75) setShowContent(false);
      }
    };
    const handleTouchStart = (e: Event) => {
      setTouchStartY((e as unknown as TouchEvent).touches[0].clientY);
    };
    const handleTouchMove = (e: Event) => {
      const te = e as unknown as TouchEvent;
      if (!touchStartY) return;
      const deltaY = touchStartY - te.touches[0].clientY;
      if (mediaFullyExpanded && deltaY < -20 && window.scrollY <= 5) {
        setMediaFullyExpanded(false);
        e.preventDefault();
      } else if (!mediaFullyExpanded) {
        e.preventDefault();
        const factor = deltaY < 0 ? 0.008 : 0.005;
        const next = Math.min(Math.max(scrollProgress + deltaY * factor, 0), 1);
        setScrollProgress(next);
        onProgress?.(next);
        if (next >= 1) { setMediaFullyExpanded(true); setShowContent(true); }
        else if (next < 0.75) setShowContent(false);
        setTouchStartY(te.touches[0].clientY);
      }
    };
    const handleTouchEnd = () => setTouchStartY(0);
    const handleScroll = () => { if (!mediaFullyExpanded) window.scrollTo(0, 0); };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [scrollProgress, mediaFullyExpanded, touchStartY, onProgress]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const panelW = 300 + scrollProgress * (isMobile ? 650 : 1250);
  const panelH = 400 + scrollProgress * (isMobile ? 200 : 400);
  const textShift = scrollProgress * (isMobile ? 180 : 150);
  const firstWord = title?.split(' ')[0] ?? '';
  const restTitle = title?.split(' ').slice(1).join(' ') ?? '';
  const overlayOpacity = Math.max(0, (scrollProgress - 0.3) / 0.7);

  return (
    <div ref={sectionRef} style={{ overflow: 'hidden' }}>
      <section style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100dvh' }}>
        <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100dvh' }}>

          <div style={{ width: '100%', maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100dvh', position: 'relative' }}>

              {/* ── Expanding panel ── */}
              <div style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: panelW, height: panelH,
                maxWidth: '95vw', maxHeight: '85vh',
                borderRadius: 16, overflow: 'hidden',
                boxShadow: '0 0 80px rgba(0,0,0,0.8)',
              }}>
                {mediaType === 'video' ? (
                  <video src={mediaSrc} poster={posterSrc} autoPlay muted loop playsInline
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <img src={mediaSrc} alt={title ?? ''}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}

                {/* Detection overlay */}
                {overlaySrc && (
                  <div style={{ position: 'absolute', inset: 0, opacity: overlayOpacity, transition: 'opacity 0.1s' }}>
                    <img src={overlaySrc} alt="AI detection"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {/* scanlines */}
                    <div style={{
                      position: 'absolute', inset: 0, pointerEvents: 'none',
                      backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.08) 3px,rgba(0,0,0,0.08) 4px)',
                    }} />
                  </div>
                )}

                {/* Dim that lifts on scroll */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(0,0,0,0.4)',
                  opacity: Math.max(0, 0.4 - scrollProgress * 0.35),
                }} />

                {/* Yellow border glow */}
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: 16, pointerEvents: 'none',
                  boxShadow: `inset 0 0 0 1px rgba(212,255,51,${scrollProgress * 0.3})`,
                  opacity: scrollProgress,
                }} />
              </div>

              {/* ── Title ── */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 8, position: 'relative', zIndex: 10, width: '100%' }}>
                <h2 style={{
                  fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 900,
                  color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em',
                  transform: `translateX(-${textShift}vw)`,
                  textShadow: '0 2px 20px rgba(0,0,0,0.8)',
                  margin: 0,
                }}>
                  {firstWord}
                </h2>
                <h2 style={{
                  fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 900,
                  color: '#D4FF33', textTransform: 'uppercase', letterSpacing: '0.06em',
                  transform: `translateX(${textShift}vw)`,
                  textShadow: '0 0 24px rgba(212,255,51,0.35)',
                  margin: 0,
                }}>
                  {restTitle}
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginTop: 8 }}>
                  {date && (
                    <p style={{
                      fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.18em', color: 'rgba(255,255,255,0.55)',
                      transform: `translateX(-${textShift}vw)`, margin: 0,
                    }}>
                      {date}
                    </p>
                  )}
                  {scrollToExpand && (
                    <p style={{
                      fontSize: 11, color: 'rgba(255,255,255,0.3)',
                      transform: `translateX(${textShift}vw)`, margin: 0,
                    }}>
                      {scrollToExpand}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Revealed content ── */}
            <motion.section
              style={{ width: '100%', padding: '40px 32px' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: showContent ? 1 : 0 }}
              transition={{ duration: 0.7 }}
            >
              {children}
            </motion.section>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ScrollExpandMedia;
