import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';

const CYAN   = '#00C2FF';
const RED    = '#E63946';
const PINK   = '#FF2D78';
const PURPLE = '#8B5CF6';

/* ─── Primitives ─────────────────────────────────────────────────────── */

function NeonDot({ x, y, size, color, delay, dur, side }: {
  x: string; y: string; size: number; color: string; delay: number; dur: number; side?: 'left' | 'right';
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: [0, 0.75, 0.2, 0.75, 0], scale: [0.3, 1.2, 0.5, 1.2, 0.3] }}
      transition={{ duration: dur, delay, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        position: 'absolute',
        ...(side === 'right' ? { right: x } : { left: x }),
        top: y, width: size, height: size, borderRadius: '50%',
        background: color,
        boxShadow: `0 0 ${size * 4}px ${color}, 0 0 ${size * 10}px ${color}33`,
        pointerEvents: 'none',
      }}
    />
  );
}

function NeonLine({ x, height, color, delay, side }: {
  x: string; height: number; color: string; delay: number; side: 'left' | 'right';
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scaleY: 0 }}
      animate={{ opacity: [0, 0.55, 0.15, 0.55, 0], scaleY: [0, 1, 0.4, 1, 0] }}
      transition={{ duration: 7, delay, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        position: 'absolute', [side]: x, top: '12%', width: 1, height,
        background: `linear-gradient(to bottom, transparent, ${color}, transparent)`,
        boxShadow: `0 0 8px ${color}55`,
        transformOrigin: 'top', pointerEvents: 'none',
      }}
    />
  );
}

function SpeedStreak({ y, width, delay, side, color }: {
  y: string; width: number; delay: number; side: 'left' | 'right'; color?: string;
}) {
  const c = color ?? CYAN;
  const from = side === 'left' ? { x: -70, opacity: 0 } : { x: 70, opacity: 0 };
  const to   = side === 'left'
    ? { x: [null, 0, 40], opacity: [0, 0.65, 0] }
    : { x: [null, 0, -40], opacity: [0, 0.65, 0] };
  return (
    <motion.div initial={from} animate={to}
      transition={{ duration: 3.5, delay, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        position: 'absolute', [side]: 10, top: y, width, height: 1,
        background: `linear-gradient(${side === 'left' ? 'to right' : 'to left'}, ${c}, transparent)`,
        boxShadow: `0 0 6px ${c}44`,
        pointerEvents: 'none',
      }}
    />
  );
}

function HoloRing({ x, y, size, color, dur, side }: {
  x: string; y: string; size: number; color: string; dur: number; side: 'left' | 'right';
}) {
  return (
    <motion.div
      animate={{ rotate: 360, opacity: [0.08, 0.2, 0.08] }}
      transition={{
        rotate:  { duration: dur, repeat: Infinity, ease: 'linear' },
        opacity: { duration: dur / 3, repeat: Infinity, ease: 'easeInOut' },
      }}
      style={{
        position: 'absolute', [side]: x, top: y, width: size, height: size,
        border: `1px solid ${color}`, borderRadius: '50%', opacity: 0.12, pointerEvents: 'none',
      }}
    />
  );
}

function DataRain({ x, side, color, delay }: {
  x: string; side: 'left' | 'right'; color: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: '-15%' }}
      animate={{ opacity: [0, 0.08, 0.14, 0.08, 0], y: ['-15%', '115%'] }}
      transition={{ duration: 7, delay, repeat: Infinity, ease: 'linear' }}
      style={{
        position: 'absolute', [side]: x, top: 0, width: 1, height: '15%',
        background: `linear-gradient(to bottom, transparent, ${color}, transparent)`,
        boxShadow: `0 0 5px ${color}44`,
        pointerEvents: 'none',
      }}
    />
  );
}

function GlitchBlock({ x, y, w, h, color, delay, side }: {
  x: string; y: string; w: number; h: number; color: string; delay: number; side: 'left' | 'right';
}) {
  return (
    <motion.div
      animate={{ opacity: [0, 0.14, 0, 0.1, 0.18, 0, 0.12, 0], scaleX: [1, 1.4, 0.7, 1, 1.3, 0.8, 1, 1] }}
      transition={{ duration: 4.5, delay, repeat: Infinity, ease: 'easeInOut' }}
      style={{ position: 'absolute', [side]: x, top: y, width: w, height: h, background: color, pointerEvents: 'none' }}
    />
  );
}

function EnergyPulse({ x, y, color, delay, side }: {
  x: string; y: string; color: string; delay: number; side: 'left' | 'right';
}) {
  return (
    <motion.div
      animate={{ scale: [0.2, 1.8], opacity: [0.25, 0] }}
      transition={{ duration: 3.5, delay, repeat: Infinity, ease: 'easeOut' }}
      style={{
        position: 'absolute', [side]: x, top: y, width: 50, height: 50,
        border: `1px solid ${color}`, borderRadius: '50%', pointerEvents: 'none',
      }}
    />
  );
}

function FloatingKanji({ char, x, y, color, delay, dur, side }: {
  char: string; x: string; y: string; color: string; delay: number; dur: number; side: 'left' | 'right';
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: [0, 0.1, 0.04, 0.1, 0], y: [12, -10, 5, -10, 12] }}
      transition={{ duration: dur, delay, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        position: 'absolute', [side]: x, top: y,
        fontSize: 32, fontWeight: 700, color, textShadow: `0 0 16px ${color}`,
        pointerEvents: 'none', userSelect: 'none', fontFamily: 'sans-serif',
      }}
    >
      {char}
    </motion.div>
  );
}

function CornerBracket({ corner, color }: { corner: 'tl' | 'tr' | 'bl' | 'br'; color: string }) {
  const isTop  = corner.startsWith('t');
  const isLeft = corner.endsWith('l');
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.05, 0.18, 0.05] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        position: 'absolute',
        [isTop ? 'top' : 'bottom']: 8,
        [isLeft ? 'left' : 'right']: 8,
        width: 24, height: 24,
        borderColor: color, borderStyle: 'solid', borderWidth: 0,
        ...(isTop && isLeft  && { borderTopWidth: 1, borderLeftWidth: 1 }),
        ...(isTop && !isLeft && { borderTopWidth: 1, borderRightWidth: 1 }),
        ...(!isTop && isLeft && { borderBottomWidth: 1, borderLeftWidth: 1 }),
        ...(!isTop && !isLeft && { borderBottomWidth: 1, borderRightWidth: 1 }),
        pointerEvents: 'none',
      }}
    />
  );
}

/**
 * Cyberpunk futuristic decorations flanking the hero carousel.
 * Renders absolutely-positioned animations on left/right sides with
 * Japanese kanji, neon effects, data rain, glitch blocks, and energy pulses.
 */
export function HeroSideDecor() {
  return (
    <>
      {/* ═══════ CORNER BRACKETS ═══════ */}
      <CornerBracket corner="tl" color={CYAN} />
      <CornerBracket corner="tr" color={CYAN} />
      <CornerBracket corner="bl" color={PINK} />
      <CornerBracket corner="br" color={RED} />

      {/* ═══════ LEFT SIDE ═══════ */}

      {/* Kanji watermark — vertical */}
      <Typography
        component={motion.p}
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: [0.03, 0.06, 0.03], x: 0 }}
        transition={{ opacity: { duration: 6, repeat: Infinity, ease: 'easeInOut' }, x: { duration: 1.2, delay: 0.3 } }}
        sx={{
          position: 'absolute',
          left: { xs: 8, md: 28, lg: 48 },
          top: '50%', transform: 'translateY(-50%)',
          writingMode: 'vertical-rl',
          fontFamily: '"Noto Serif JP", serif',
          fontSize: { xs: '1.6rem', md: '2.4rem', lg: '3rem' },
          color: CYAN, letterSpacing: '0.35em',
          textShadow: `0 0 20px ${CYAN}33`,
          userSelect: 'none', pointerEvents: 'none', zIndex: 1,
        }}
      >
        未来電動技術
      </Typography>

      {/* Neon lines */}
      <NeonLine x="18%" height={110} color={CYAN}   delay={0}   side="left" />
      <NeonLine x="10%" height={75}  color={PINK}   delay={2}   side="left" />
      <NeonLine x="14%" height={50}  color={PURPLE} delay={4.5} side="left" />

      {/* Speed streaks */}
      <SpeedStreak y="28%" width={55} delay={0.5} side="left" />
      <SpeedStreak y="52%" width={42} delay={2.2} side="left" color={PINK} />
      <SpeedStreak y="76%" width={48} delay={3.8} side="left" />

      {/* Neon dots */}
      <NeonDot x="5%"  y="22%" size={4} color={CYAN}   delay={0}   dur={5}   side="left" />
      <NeonDot x="14%" y="58%" size={3} color={PINK}   delay={1.5} dur={6}   side="left" />
      <NeonDot x="8%"  y="82%" size={5} color={PURPLE} delay={3}   dur={4.5} side="left" />
      <NeonDot x="12%" y="40%" size={3} color={CYAN}   delay={4.5} dur={5.5} side="left" />

      {/* Holo rings */}
      <HoloRing x="3%"  y="12%" size={65} color={CYAN}   dur={20} side="left" />
      <HoloRing x="10%" y="55%" size={40} color={PURPLE} dur={28} side="left" />

      {/* Data rain */}
      <DataRain x="20%" side="left" color={CYAN}   delay={0} />
      <DataRain x="22%" side="left" color={PURPLE} delay={2.5} />
      <DataRain x="16%" side="left" color={PINK}   delay={5} />

      {/* Floating kanji */}
      <FloatingKanji char="速" x="6%"  y="35%" color={CYAN}   delay={1}   dur={9}  side="left" />
      <FloatingKanji char="電" x="12%" y="68%" color={PINK}   delay={3.5} dur={10} side="left" />
      <FloatingKanji char="力" x="3%"  y="15%" color={PURPLE} delay={6}   dur={8}  side="left" />

      {/* Glitch blocks */}
      <GlitchBlock x="8%"  y="48%" w={28} h={3} color={CYAN}   delay={1.5} side="left" />
      <GlitchBlock x="11%" y="50%" w={18} h={2} color={PINK}   delay={1.8} side="left" />

      {/* Energy pulse */}
      <EnergyPulse x="6%" y="42%" color={CYAN} delay={2} side="left" />

      {/* ═══════ RIGHT SIDE ═══════ */}

      {/* Kanji watermark — vertical right */}
      <Typography
        component={motion.p}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: [0.025, 0.05, 0.025], x: 0 }}
        transition={{ opacity: { duration: 7, repeat: Infinity, ease: 'easeInOut' }, x: { duration: 1.2, delay: 0.5 } }}
        sx={{
          position: 'absolute',
          right: { xs: 8, md: 28, lg: 48 },
          top: '50%', transform: 'translateY(-50%)',
          writingMode: 'vertical-rl',
          fontFamily: '"Noto Serif JP", serif',
          fontSize: { xs: '1.3rem', md: '2rem', lg: '2.6rem' },
          color: RED, letterSpacing: '0.3em',
          textShadow: `0 0 18px ${RED}33`,
          userSelect: 'none', pointerEvents: 'none', zIndex: 1,
        }}
      >
        速度革命
      </Typography>

      {/* Neon lines */}
      <NeonLine x="18%" height={95}  color={CYAN}   delay={1}   side="right" />
      <NeonLine x="8%"  height={65}  color={RED}    delay={3.5} side="right" />
      <NeonLine x="13%" height={45}  color={PURPLE} delay={5}   side="right" />

      {/* Speed streaks */}
      <SpeedStreak y="24%" width={50} delay={1.2} side="right" />
      <SpeedStreak y="48%" width={40} delay={2.8} side="right" color={PURPLE} />
      <SpeedStreak y="72%" width={58} delay={4.2} side="right" color={PINK} />

      {/* Neon dots */}
      <NeonDot x="6%"  y="32%" size={4} color={RED}    delay={0.8} dur={5.5} side="right" />
      <NeonDot x="15%" y="68%" size={3} color={CYAN}   delay={2.5} dur={4}   side="right" />
      <NeonDot x="10%" y="18%" size={5} color={PURPLE} delay={4}   dur={6}   side="right" />
      <NeonDot x="4%"  y="85%" size={3} color={PINK}   delay={5.5} dur={5}   side="right" />

      {/* Holo rings */}
      <HoloRing x="2%"  y="62%" size={55} color={RED}    dur={18} side="right" />
      <HoloRing x="12%" y="30%" size={40} color={CYAN}   dur={25} side="right" />
      <HoloRing x="7%"  y="80%" size={30} color={PURPLE} dur={32} side="right" />

      {/* Data rain */}
      <DataRain x="20%" side="right" color={RED}    delay={1} />
      <DataRain x="22%" side="right" color={PINK}   delay={3.5} />
      <DataRain x="17%" side="right" color={PURPLE} delay={6} />

      {/* Floating kanji */}
      <FloatingKanji char="未" x="8%"  y="25%" color={RED}    delay={2}   dur={10} side="right" />
      <FloatingKanji char="来" x="14%" y="55%" color={PURPLE} delay={4.5} dur={8}  side="right" />
      <FloatingKanji char="風" x="5%"  y="78%" color={PINK}   delay={7}   dur={9}  side="right" />

      {/* Glitch blocks */}
      <GlitchBlock x="9%"  y="38%" w={24} h={3} color={RED}    delay={2}   side="right" />
      <GlitchBlock x="12%" y="40%" w={16} h={2} color={PURPLE} delay={2.3} side="right" />
      <GlitchBlock x="6%"  y="72%" w={20} h={2} color={PINK}   delay={4}   side="right" />

      {/* Energy pulses */}
      <EnergyPulse x="8%"  y="35%" color={RED}    delay={1.5} side="right" />
      <EnergyPulse x="14%" y="65%" color={PURPLE} delay={4}   side="right" />

      {/* ═══════ HORIZONTAL ACCENT LINES ═══════ */}

      {/* Top scan-line */}
      <motion.div
        animate={{ opacity: [0.06, 0.22, 0.06], scaleX: [0.6, 1, 0.6] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: 0, left: '8%', right: '8%', height: 1,
          background: `linear-gradient(90deg, transparent, ${CYAN}, transparent)`,
          boxShadow: `0 0 8px ${CYAN}33`,
          pointerEvents: 'none', zIndex: 1,
        }}
      />

      {/* Bottom scan-line */}
      <motion.div
        animate={{ opacity: [0.04, 0.16, 0.04], scaleX: [0.5, 1, 0.5] }}
        transition={{ duration: 5.5, delay: 1, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', bottom: 0, left: '8%', right: '8%', height: 1,
          background: `linear-gradient(90deg, transparent, ${PINK}88, transparent)`,
          boxShadow: `0 0 6px ${PINK}22`,
          pointerEvents: 'none', zIndex: 1,
        }}
      />

      {/* Mid horizontal glitch line */}
      <motion.div
        animate={{ opacity: [0, 0.08, 0, 0.12, 0], scaleX: [0.3, 0.9, 0.4, 1, 0.3] }}
        transition={{ duration: 6, delay: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '50%', left: '15%', right: '15%', height: 1,
          background: `linear-gradient(90deg, transparent, ${PURPLE}66, transparent)`,
          pointerEvents: 'none', zIndex: 1,
        }}
      />
    </>
  );
}
