import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { AnimatePresence, motion, useMotionValue, animate } from 'framer-motion';
import { useHeroBanners } from '../../admin/api/heroBanners';

const CYAN = '#00C2FF';
const PINK = '#FF2D78';

/* ─── Segmented progress bar ─────────────────────────────────────────── */
function ProgressBar({ duration, resetKey, current, total }: {
  duration: number; resetKey: number; current: number; total: number;
}) {
  const scaleX = useMotionValue(0);

  useEffect(() => {
    scaleX.set(0);
    const ctrl = animate(scaleX, 1, { duration: duration / 1000, ease: 'linear' });
    return () => ctrl.stop();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, duration]);

  return (
    <Box sx={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, zIndex: 5,
      display: 'flex', gap: '2px',
    }}>
      {Array.from({ length: total }).map((_, i) => (
        <Box key={i} sx={{ flex: 1, bgcolor: 'rgba(255,255,255,0.06)', overflow: 'hidden', borderRadius: 0.5 }}>
          {i < current ? (
            /* Already played — full bar */
            <Box sx={{ width: '100%', height: '100%', background: `linear-gradient(90deg, ${CYAN}, ${CYAN}AA)` }} />
          ) : i === current ? (
            /* Active segment — animated fill */
            <motion.div style={{
              width: '100%', height: '100%',
              background: `linear-gradient(90deg, ${CYAN}, ${PINK}AA)`,
              scaleX, transformOrigin: 'left',
            }} />
          ) : null}
        </Box>
      ))}
    </Box>
  );
}

/* ─── Ken-Burns zoom on active image ─────────────────────────────────── */
function SlideImage({ src, alt, duration, objectPosition }: {
  src: string; alt: string; duration: number; objectPosition?: string;
}) {
  return (
    <motion.div
      initial={{ scale: 1.02 }}
      animate={{ scale: 1.1 }}
      transition={{ duration: duration / 1000 + 0.8, ease: 'linear' }}
      style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
    >
      <Box
        component="img"
        src={src}
        alt={alt}
        sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: objectPosition ?? 'center center', display: 'block' }}
      />
    </motion.div>
  );
}

/* ─── Neon border glow overlay ───────────────────────────────────────── */
function NeonBorderOverlay() {
  return (
    <motion.div
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
        borderRadius: 'inherit',
        boxShadow: `inset 0 0 30px rgba(0,194,255,0.08), inset 0 0 60px rgba(0,194,255,0.03)`,
      }}
    />
  );
}

/**
 * Hero image carousel — crossfade + directional slide transitions,
 * Ken-Burns zoom, segmented progress bar, cyberpunk overlays.
 */
export function HeroCarousel() {
  const { data } = useHeroBanners();
  const banners = (data?.data ?? []).filter((b) => b.image);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [resetKey, setResetKey] = useState(0);
  const DURATION = 6000;

  const count = banners.length;

  // Auto-advance
  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(() => {
      setResetKey((k) => k + 1);
      setDirection(1);
      setIndex((prev) => (prev + 1) % count);
    }, DURATION);
    return () => clearInterval(id);
  }, [count]);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (count <= 1) return;
      setResetKey((k) => k + 1);
      setDirection(dir);
      setIndex((prev) => (prev + dir + count) % count);
    },
    [count],
  );

  const goTo = useCallback(
    (i: number) => {
      if (i === index) return;
      setResetKey((k) => k + 1);
      setDirection(i > index ? 1 : -1);
      setIndex(i);
    },
    [index],
  );

  if (count === 0) {
    return (
      <Box
        sx={{
          width: { xs: '100%', md: 'min(100%, calc(44vh * (21 / 9)))' },
          mx: 'auto',
          aspectRatio: { xs: '16/9', md: '21/9' },
          borderRadius: 3,
          bgcolor: '#0B0B0E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(0,194,255,0.08)',
        }}
      >
        <Typography sx={{ color: 'rgba(0,194,255,0.2)', fontSize: '0.75rem', letterSpacing: '0.2em' }}>
          NO BANNER
        </Typography>
      </Box>
    );
  }

  const current = banners[index];

  /* Crossfade + directional slide + scale */
  const variants = {
    enter: (d: number) => ({
      x: d > 0 ? 60 : -60,
      opacity: 0,
      scale: 0.96,
      filter: 'brightness(0.6)',
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      filter: 'brightness(1)',
    },
    exit: (d: number) => ({
      x: d > 0 ? -60 : 60,
      opacity: 0,
      scale: 1.03,
      filter: 'brightness(0.5)',
    }),
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: { xs: '100%', md: 'min(100%, calc(44vh * (21 / 9)))' },
        mx: 'auto',
        aspectRatio: { xs: '16/9', md: '21/9' },
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid rgba(0,194,255,0.06)',
        boxShadow: '0 0 40px rgba(0,194,255,0.06), 0 4px 30px rgba(0,0,0,0.4)',
      }}
    >
      {/* Neon border glow */}
      <NeonBorderOverlay />

      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={current.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            opacity:    { duration: 0.55, ease: 'easeInOut' },
            x:          { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
            scale:      { duration: 0.55, ease: 'easeInOut' },
            filter:     { duration: 0.55, ease: 'easeInOut' },
          }}
          style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
        >
          {/* Link wrapper — same tab, no-op when link is null */}
          <Box
            component={current.link ? 'a' : 'div'}
            {...(current.link ? { href: current.link } : {})}
            sx={{
              display: 'block',
              width: '100%',
              height: '100%',
              textDecoration: 'none',
              cursor: current.link ? 'pointer' : 'default',
              position: 'absolute',
              inset: 0,
            }}
          >
            {/* Ken-Burns zoom on the image while it's active */}
            <SlideImage
              src={current.image!.hero}
              alt={current.title ?? 'Banner'}
              duration={DURATION}
              objectPosition={current.object_position}
            />

            {/* Dark cinematic gradient */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: `
                  linear-gradient(to top, rgba(11,11,14,0.88) 0%, rgba(11,11,14,0.25) 45%, transparent 100%),
                  linear-gradient(to right, rgba(11,11,14,0.3) 0%, transparent 20%, transparent 80%, rgba(11,11,14,0.3) 100%)
                `,
                zIndex: 1,
              }}
            />

            {/* CRT scanline texture */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)',
                pointerEvents: 'none',
                zIndex: 2,
              }}
            />

            {/* Subtle vignette overlay */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(ellipse at center, transparent 50%, rgba(11,11,14,0.35) 100%)',
                pointerEvents: 'none',
                zIndex: 2,
              }}
            />

            {/* Title / subtitle / CTA hint */}
            {(current.title || current.subtitle) && (
              <Box sx={{ position: 'absolute', bottom: 46, left: 18, right: 18, zIndex: 3 }}>
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  {current.title && (
                    <Typography
                      sx={{
                        fontSize: { xs: '0.92rem', md: '1.2rem' },
                        fontWeight: 800,
                        color: '#F5F7FA',
                        letterSpacing: '0.05em',
                        textShadow: `0 2px 12px rgba(0,0,0,0.8), 0 0 20px rgba(0,194,255,0.15)`,
                        mb: 0.5,
                        lineHeight: 1.25,
                      }}
                    >
                      {current.title}
                    </Typography>
                  )}
                  {current.subtitle && (
                    <Typography
                      sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.08em' }}
                    >
                      {current.subtitle}
                    </Typography>
                  )}
                  {current.link && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, mt: 0.8 }}>
                      <motion.div
                        animate={{ width: [16, 24, 16] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ height: 2, background: `linear-gradient(90deg, ${CYAN}, ${PINK})`, borderRadius: 1 }}
                      />
                      <Typography sx={{
                        fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        background: `linear-gradient(90deg, ${CYAN}, ${PINK})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}>
                        EXPLORER
                      </Typography>
                    </Box>
                  )}
                </motion.div>
              </Box>
            )}
          </Box>
        </motion.div>
      </AnimatePresence>

      {/* Segmented progress bar */}
      {count > 1 && (
        <ProgressBar duration={DURATION} resetKey={resetKey} current={index} total={count} />
      )}

      {/* Navigation */}
      {count > 1 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 14,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            zIndex: 6,
          }}
        >
          <IconButton
            size="small"
            onClick={() => go(-1)}
            sx={{
              p: 0.4,
              color: 'rgba(255,255,255,0.8)',
              bgcolor: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(0,194,255,0.12)',
              transition: 'all 0.25s',
              '&:hover': { bgcolor: 'rgba(0,194,255,0.25)', color: CYAN, borderColor: 'rgba(0,194,255,0.35)' },
            }}
          >
            <KeyboardArrowLeftIcon sx={{ fontSize: 16 }} />
          </IconButton>

          {banners.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === index ? 20 : 6,
                opacity: i === index ? 1 : 0.3,
              }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={() => goTo(i)}
              style={{
                height: 6,
                borderRadius: 3,
                background: i === index ? `linear-gradient(90deg, ${CYAN}, ${PINK})` : CYAN,
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: i === index ? `0 0 8px ${CYAN}55` : 'none',
              }}
            />
          ))}

          <IconButton
            size="small"
            onClick={() => go(1)}
            sx={{
              p: 0.4,
              color: 'rgba(255,255,255,0.8)',
              bgcolor: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(0,194,255,0.12)',
              transition: 'all 0.25s',
              '&:hover': { bgcolor: 'rgba(0,194,255,0.25)', color: CYAN, borderColor: 'rgba(0,194,255,0.35)' },
            }}
          >
            <KeyboardArrowRightIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      )}

      {/* Slide counter */}
      {count > 1 && (
        <Box sx={{
          position: 'absolute', top: 12, right: 14, zIndex: 6,
          display: 'flex', alignItems: 'center', gap: 0.5,
          bgcolor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)',
          borderRadius: 1.5, px: 1, py: 0.3,
          border: '1px solid rgba(0,194,255,0.1)',
        }}>
          <Typography sx={{ fontSize: '0.58rem', fontWeight: 700, color: CYAN, fontFamily: 'monospace' }}>
            {String(index + 1).padStart(2, '0')}
          </Typography>
          <Box sx={{ width: 8, height: 1, bgcolor: 'rgba(255,255,255,0.2)' }} />
          <Typography sx={{ fontSize: '0.58rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>
            {String(count).padStart(2, '0')}
          </Typography>
        </Box>
      )}
    </Box>
  );
}