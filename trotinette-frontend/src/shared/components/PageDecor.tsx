import { motion } from 'framer-motion';

const CYAN   = '#00C2FF';
const RED    = '#E63946';
const PINK   = '#FF2D78';
const PURPLE = '#8B5CF6';

/* ─── Reusable primitives ─────────────────────────────────────────── */

/** Pulsing neon dot with glow */
function NeonDot({ x, y, size, color, delay, dur, side }: {
  x: string; y: string; size: number; color: string; delay: number; dur: number; side?: 'left' | 'right';
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: [0, 0.7, 0.2, 0.7, 0], scale: [0.4, 1.2, 0.6, 1.2, 0.4] }}
      transition={{ duration: dur, delay, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        position: 'absolute',
        ...(side === 'right' ? { right: x } : { left: x }),
        top: y,
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 ${size * 4}px ${color}, 0 0 ${size * 8}px ${color}44`,
        pointerEvents: 'none',
      }}
    />
  );
}

/** Vertical neon line that fades in/out */
function NeonLine({ x, height, color, delay, side }: {
  x: string; height: number; color: string; delay: number; side: 'left' | 'right';
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scaleY: 0 }}
      animate={{ opacity: [0, 0.5, 0.12, 0.5, 0], scaleY: [0, 1, 0.4, 1, 0] }}
      transition={{ duration: 7, delay, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        position: 'absolute',
        [side]: x,
        top: '10%',
        width: 1,
        height,
        background: `linear-gradient(to bottom, transparent, ${color}, transparent)`,
        boxShadow: `0 0 6px ${color}66`,
        transformOrigin: 'top',
        pointerEvents: 'none',
      }}
    />
  );
}

/** Horizontal speed streak that flies across */
function SpeedStreak({ y, width, delay, side, color }: {
  y: string; width: number; delay: number; side: 'left' | 'right'; color?: string;
}) {
  const c = color ?? CYAN;
  const from = side === 'left' ? { x: -60, opacity: 0 } : { x: 60, opacity: 0 };
  const to   = side === 'left'
    ? { x: [null, 0, 35], opacity: [0, 0.6, 0] }
    : { x: [null, 0, -35], opacity: [0, 0.6, 0] };

  return (
    <motion.div
      initial={from}
      animate={to}
      transition={{ duration: 3.5, delay, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        position: 'absolute',
        [side]: 8,
        top: y,
        width,
        height: 1,
        background: `linear-gradient(${side === 'left' ? 'to right' : 'to left'}, ${c}, transparent)`,
        boxShadow: `0 0 4px ${c}44`,
        pointerEvents: 'none',
      }}
    />
  );
}

/** Slowly spinning holographic ring */
function HoloRing({ x, y, size, color, dur, side }: {
  x: string; y: string; size: number; color: string; dur: number; side: 'left' | 'right';
}) {
  return (
    <motion.div
      animate={{ rotate: 360, opacity: [0.08, 0.18, 0.08] }}
      transition={{ rotate: { duration: dur, repeat: Infinity, ease: 'linear' },
                     opacity: { duration: dur / 3, repeat: Infinity, ease: 'easeInOut' } }}
      style={{
        position: 'absolute',
        [side]: x,
        top: y,
        width: size,
        height: size,
        border: `1px solid ${color}`,
        borderRadius: '50%',
        opacity: 0.12,
        pointerEvents: 'none',
      }}
    />
  );
}

/** Horizontal scan-line at top or bottom edge */
function ScanLine({ pos, color, delay }: { pos: 'top' | 'bottom'; color: string; delay: number }) {
  return (
    <motion.div
      animate={{ opacity: [0.04, 0.2, 0.04], scaleX: [0.5, 1, 0.5] }}
      transition={{ duration: 5, delay, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        position: 'absolute',
        [pos]: 0,
        left: '5%',
        right: '5%',
        height: 1,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
}

/** Floating kanji/katakana character that drifts */
function FloatingKanji({ char, x, y, color, delay, dur, side }: {
  char: string; x: string; y: string; color: string; delay: number; dur: number; side: 'left' | 'right';
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: [0, 0.08, 0.03, 0.08, 0], y: [10, -8, 4, -8, 10] }}
      transition={{ duration: dur, delay, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        position: 'absolute',
        [side]: x,
        top: y,
        fontSize: 28,
        fontWeight: 700,
        color,
        textShadow: `0 0 12px ${color}`,
        pointerEvents: 'none',
        userSelect: 'none',
        fontFamily: 'sans-serif',
      }}
    >
      {char}
    </motion.div>
  );
}

/** Glitch-flickering data block */
function GlitchBlock({ x, y, w, h, color, delay, side }: {
  x: string; y: string; w: number; h: number; color: string; delay: number; side: 'left' | 'right';
}) {
  return (
    <motion.div
      animate={{
        opacity: [0, 0.12, 0, 0.08, 0.15, 0, 0.1, 0],
        scaleX: [1, 1.3, 0.8, 1, 1.2, 0.9, 1, 1],
      }}
      transition={{ duration: 4, delay, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        position: 'absolute',
        [side]: x,
        top: y,
        width: w,
        height: h,
        background: color,
        pointerEvents: 'none',
      }}
    />
  );
}

/** Vertical data rain column */
function DataRain({ x, side, color, delay }: {
  x: string; side: 'left' | 'right'; color: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: '-10%' }}
      animate={{ opacity: [0, 0.06, 0.1, 0.06, 0], y: ['-10%', '110%'] }}
      transition={{ duration: 8, delay, repeat: Infinity, ease: 'linear' }}
      style={{
        position: 'absolute',
        [side]: x,
        top: 0,
        width: 1,
        height: '12%',
        background: `linear-gradient(to bottom, transparent, ${color}, transparent)`,
        boxShadow: `0 0 4px ${color}55`,
        pointerEvents: 'none',
      }}
    />
  );
}

/** Expanding energy pulse ring */
function EnergyPulse({ x, y, color, delay, side }: {
  x: string; y: string; color: string; delay: number; side: 'left' | 'right';
}) {
  return (
    <motion.div
      animate={{ scale: [0.3, 1.6], opacity: [0.2, 0] }}
      transition={{ duration: 3, delay, repeat: Infinity, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        [side]: x,
        top: y,
        width: 40,
        height: 40,
        border: `1px solid ${color}`,
        borderRadius: '50%',
        pointerEvents: 'none',
      }}
    />
  );
}

/** Corner bracket decoration */
function CornerBracket({ corner, color }: {
  corner: 'tl' | 'tr' | 'bl' | 'br'; color: string;
}) {
  const isTop  = corner.startsWith('t');
  const isLeft = corner.endsWith('l');
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.06, 0.15, 0.06] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        position: 'absolute',
        [isTop ? 'top' : 'bottom']: 12,
        [isLeft ? 'left' : 'right']: 12,
        width: 20,
        height: 20,
        borderColor: color,
        borderStyle: 'solid',
        borderWidth: 0,
        ...(isTop && isLeft  && { borderTopWidth: 1, borderLeftWidth: 1 }),
        ...(isTop && !isLeft && { borderTopWidth: 1, borderRightWidth: 1 }),
        ...(!isTop && isLeft && { borderBottomWidth: 1, borderLeftWidth: 1 }),
        ...(!isTop && !isLeft && { borderBottomWidth: 1, borderRightWidth: 1 }),
        pointerEvents: 'none',
        opacity: 0.1,
      }}
    />
  );
}

/* ─── Shared base layer (used by every variant) ───────────────────── */
function BaseDecor() {
  return (
    <>
      <ScanLine pos="top"    color={CYAN}       delay={0} />
      <ScanLine pos="bottom" color={`${RED}88`} delay={1.2} />
      <CornerBracket corner="tl" color={CYAN} />
      <CornerBracket corner="tr" color={CYAN} />
      <CornerBracket corner="bl" color={RED} />
      <CornerBracket corner="br" color={RED} />
    </>
  );
}

/* ─── Presets ──────────────────────────────────────────────────────── */

type Variant = 'catalog' | 'productDetail' | 'checkout' | 'orders' | 'auth' | 'info';

interface PageDecorProps {
  /** Controls which set of decorations are shown */
  variant: Variant;
}

/**
 * Cyberpunk futuristic page decorations with Japanese accents.
 * Parent must have `position: relative; overflow: hidden;`.
 */
export function PageDecor({ variant }: PageDecorProps) {
  switch (variant) {
    case 'catalog':       return <CatalogDecor />;
    case 'productDetail': return <ProductDetailDecor />;
    case 'checkout':      return <CheckoutDecor />;
    case 'orders':        return <OrdersDecor />;
    case 'auth':          return <AuthDecor />;
    case 'info':          return <InfoDecor />;
  }
}

/* ────────────────────── Catalog ──────────────────────────────────── */
function CatalogDecor() {
  return (
    <>
      <BaseDecor />
      {/* Left edge effects */}
      <NeonLine x="3%" height={130} color={CYAN}   delay={0}   side="left" />
      <NeonLine x="6%" height={80}  color={PINK}   delay={2.5} side="left" />
      <SpeedStreak y="16%" width={50} delay={0.4}  side="left" />
      <SpeedStreak y="46%" width={38} delay={2}    side="left" color={PINK} />
      <SpeedStreak y="78%" width={55} delay={3.6}  side="left" />
      <NeonDot x="2%"  y="28%" size={4} color={CYAN}   delay={0}   dur={5}   side="left" />
      <NeonDot x="5%"  y="62%" size={3} color={PINK}   delay={1.8} dur={5.5} side="left" />
      <NeonDot x="1%"  y="85%" size={5} color={PURPLE} delay={3.2} dur={4.5} side="left" />
      <HoloRing x="1%" y="12%" size={54} color={CYAN} dur={22} side="left" />
      <FloatingKanji char="速" x="4%" y="40%" color={CYAN} delay={1}   dur={8}  side="left" />
      <FloatingKanji char="電" x="2%" y="70%" color={PINK} delay={3.5} dur={9}  side="left" />
      <DataRain x="8%"  side="left" color={CYAN}   delay={0} />
      <DataRain x="10%" side="left" color={PURPLE} delay={3} />
      <EnergyPulse x="3%" y="50%" color={CYAN} delay={2} side="left" />

      {/* Right edge effects */}
      <NeonLine x="3%" height={110} color={CYAN}   delay={1}   side="right" />
      <NeonLine x="7%" height={65}  color={RED}    delay={3.5} side="right" />
      <SpeedStreak y="22%" width={45} delay={1}    side="right" />
      <SpeedStreak y="55%" width={35} delay={2.6}  side="right" color={PURPLE} />
      <SpeedStreak y="82%" width={50} delay={4}    side="right" />
      <NeonDot x="3%"  y="32%" size={4} color={RED}    delay={0.6} dur={5}   side="right" />
      <NeonDot x="6%"  y="68%" size={3} color={CYAN}   delay={2.2} dur={4.5} side="right" />
      <NeonDot x="2%"  y="15%" size={4} color={PURPLE} delay={4}   dur={6}   side="right" />
      <HoloRing x="1%" y="60%" size={46} color={RED}    dur={19} side="right" />
      <HoloRing x="5%" y="30%" size={32} color={PURPLE} dur={26} side="right" />
      <FloatingKanji char="未" x="3%" y="25%" color={RED}    delay={2}   dur={10} side="right" />
      <FloatingKanji char="来" x="5%" y="75%" color={PURPLE} delay={4.5} dur={8}  side="right" />
      <DataRain x="9%"  side="right" color={RED}  delay={1.5} />
      <DataRain x="11%" side="right" color={PINK} delay={4.5} />
      <GlitchBlock x="4%" y="42%" w={24} h={3} color={CYAN} delay={1.5} side="right" />
      <GlitchBlock x="6%" y="44%" w={16} h={2} color={PINK} delay={1.8} side="right" />
    </>
  );
}

/* ────────────────────── Product Detail ───────────────────────────── */
function ProductDetailDecor() {
  return (
    <>
      <BaseDecor />
      {/* Left — tech-spec vibe */}
      <NeonLine x="2%" height={95}  color={CYAN}   delay={0.2} side="left" />
      <NeonLine x="4%" height={60}  color={PURPLE} delay={3}   side="left" />
      <SpeedStreak y="25%" width={40} delay={0.6}  side="left" />
      <SpeedStreak y="60%" width={32} delay={2.4}  side="left" color={PURPLE} />
      <NeonDot x="1.5%" y="20%" size={4} color={CYAN}   delay={0}   dur={5.5} side="left" />
      <NeonDot x="3%"   y="55%" size={3} color={PINK}   delay={2}   dur={5}   side="left" />
      <NeonDot x="1%"   y="80%" size={4} color={PURPLE} delay={3.5} dur={4.5} side="left" />
      <HoloRing x="0.5%" y="10%" size={44} color={CYAN} dur={24} side="left" />
      <FloatingKanji char="性" x="2.5%" y="35%" color={CYAN}   delay={0.8} dur={9}  side="left" />
      <FloatingKanji char="能" x="3.5%" y="65%" color={PURPLE} delay={3}   dur={10} side="left" />
      <GlitchBlock x="2%" y="15%" w={20} h={2} color={CYAN}   delay={0.5} side="left" />
      <GlitchBlock x="3%" y="17%" w={14} h={2} color={PURPLE} delay={0.8} side="left" />
      <GlitchBlock x="1.5%" y="85%" w={18} h={2} color={PINK} delay={2.5} side="left" />
      <EnergyPulse x="2%" y="45%" color={PURPLE} delay={1.5} side="left" />

      {/* Right — detail accents */}
      <NeonLine x="2%" height={85}  color={CYAN} delay={1}   side="right" />
      <NeonLine x="5%" height={50}  color={RED}  delay={3.8} side="right" />
      <SpeedStreak y="30%" width={38} delay={1.2}  side="right" color={PINK} />
      <SpeedStreak y="70%" width={44} delay={3}    side="right" />
      <NeonDot x="2%"  y="35%" size={3} color={RED}    delay={0.8} dur={5}   side="right" />
      <NeonDot x="4%"  y="65%" size={4} color={CYAN}   delay={2.8} dur={4.5} side="right" />
      <NeonDot x="1%"  y="90%" size={3} color={PURPLE} delay={4.2} dur={6}   side="right" />
      <HoloRing x="1%" y="55%" size={38} color={RED}    dur={20} side="right" />
      <HoloRing x="3%" y="25%" size={28} color={PURPLE} dur={28} side="right" />
      <DataRain x="7%"  side="right" color={RED}    delay={0.5} />
      <DataRain x="9%"  side="right" color={PURPLE} delay={3} />
      <FloatingKanji char="仕" x="4%" y="18%" color={RED} delay={1.5} dur={8} side="right" />
      <FloatingKanji char="様" x="2%" y="82%" color={PINK} delay={4} dur={9} side="right" />
    </>
  );
}

/* ────────────────────── Checkout ─────────────────────────────────── */
function CheckoutDecor() {
  return (
    <>
      <BaseDecor />
      {/* Left — secure/confirmation feel */}
      <NeonLine x="2.5%" height={110} color={CYAN}   delay={0}   side="left" />
      <NeonLine x="5%"  height={65}  color={PURPLE} delay={2.8} side="left" />
      <SpeedStreak y="20%" width={42} delay={0.5}  side="left" />
      <SpeedStreak y="55%" width={34} delay={2.2}  side="left" color={PINK} />
      <SpeedStreak y="85%" width={48} delay={3.8}  side="left" />
      <NeonDot x="2%"  y="25%" size={4} color={CYAN}   delay={0}   dur={5}   side="left" />
      <NeonDot x="4%"  y="60%" size={3} color={PURPLE} delay={1.5} dur={5.5} side="left" />
      <NeonDot x="1%"  y="82%" size={4} color={PINK}   delay={3}   dur={4.5} side="left" />
      <HoloRing x="1%" y="8%"  size={48} color={CYAN}   dur={23} side="left" />
      <FloatingKanji char="決" x="3%" y="38%" color={CYAN}   delay={1}   dur={9}  side="left" />
      <FloatingKanji char="済" x="2%" y="72%" color={PURPLE} delay={3.5} dur={10} side="left" />
      <DataRain x="7%"  side="left" color={CYAN}   delay={0.5} />
      <DataRain x="9%"  side="left" color={PURPLE} delay={3.5} />
      <EnergyPulse x="4%" y="48%" color={CYAN} delay={2.5} side="left" />

      {/* Right */}
      <NeonLine x="2.5%" height={95}  color={CYAN}  delay={1.2} side="right" />
      <NeonLine x="6%"  height={55}  color={RED}   delay={3.5} side="right" />
      <SpeedStreak y="25%" width={40} delay={1}    side="right" />
      <SpeedStreak y="60%" width={32} delay={2.8}  side="right" color={PURPLE} />
      <SpeedStreak y="88%" width={46} delay={4.2}  side="right" />
      <NeonDot x="3%"  y="30%" size={3} color={RED}    delay={0.7} dur={5}   side="right" />
      <NeonDot x="5%"  y="65%" size={4} color={CYAN}   delay={2.4} dur={4.5} side="right" />
      <NeonDot x="1%"  y="18%" size={3} color={PURPLE} delay={3.8} dur={6}   side="right" />
      <HoloRing x="1.5%" y="55%" size={40} color={RED}    dur={20} side="right" />
      <HoloRing x="4%"   y="28%" size={30} color={PURPLE} dur={26} side="right" />
      <GlitchBlock x="3%" y="40%" w={22} h={3} color={CYAN}   delay={2}   side="right" />
      <GlitchBlock x="5%" y="42%" w={14} h={2} color={PINK}   delay={2.3} side="right" />
      <FloatingKanji char="安" x="4%" y="80%" color={RED}  delay={2} dur={8} side="right" />
      <FloatingKanji char="全" x="3%" y="14%" color={PINK} delay={4} dur={9} side="right" />
    </>
  );
}

/* ────────────────────── Orders ───────────────────────────────────── */
function OrdersDecor() {
  return (
    <>
      <BaseDecor />
      {/* Left — tracking/data vibe */}
      <NeonLine x="3%" height={120} color={CYAN}   delay={0.3} side="left" />
      <NeonLine x="5.5%" height={70} color={PINK}  delay={2.6} side="left" />
      <SpeedStreak y="15%" width={45} delay={0.3}  side="left" />
      <SpeedStreak y="50%" width={36} delay={1.8}  side="left" color={PINK} />
      <SpeedStreak y="80%" width={50} delay={3.4}  side="left" />
      <NeonDot x="1.5%" y="22%" size={4} color={CYAN}   delay={0}   dur={5.5} side="left" />
      <NeonDot x="4%"   y="58%" size={3} color={PINK}   delay={1.6} dur={5}   side="left" />
      <NeonDot x="2%"   y="88%" size={5} color={PURPLE} delay={3.4} dur={4.5} side="left" />
      <HoloRing x="0.8%" y="10%" size={50} color={CYAN} dur={24} side="left" />
      <FloatingKanji char="配" x="3%" y="32%" color={CYAN} delay={0.5} dur={9}  side="left" />
      <FloatingKanji char="送" x="2%" y="65%" color={PINK} delay={3}   dur={10} side="left" />
      <DataRain x="8%"  side="left" color={CYAN} delay={0} />
      <DataRain x="10%" side="left" color={PINK} delay={2.5} />
      <DataRain x="12%" side="left" color={PURPLE} delay={5} />
      <GlitchBlock x="2%" y="44%" w={18} h={2} color={CYAN} delay={1}   side="left" />
      <GlitchBlock x="4%" y="46%" w={12} h={2} color={PINK} delay={1.3} side="left" />

      {/* Right */}
      <NeonLine x="3%" height={100} color={CYAN}  delay={0.8} side="right" />
      <NeonLine x="6%" height={55}  color={RED}   delay={3.2} side="right" />
      <SpeedStreak y="20%" width={42} delay={0.8}  side="right" />
      <SpeedStreak y="55%" width={38} delay={2.5}  side="right" color={PURPLE} />
      <SpeedStreak y="85%" width={48} delay={4.1}  side="right" />
      <NeonDot x="2%"  y="28%" size={3} color={RED}    delay={0.5} dur={5}   side="right" />
      <NeonDot x="5%"  y="70%" size={4} color={CYAN}   delay={2}   dur={4.5} side="right" />
      <NeonDot x="1%"  y="12%" size={3} color={PURPLE} delay={3.6} dur={6}   side="right" />
      <HoloRing x="1%" y="58%" size={42} color={RED}    dur={21} side="right" />
      <HoloRing x="4%" y="24%" size={34} color={PURPLE} dur={27} side="right" />
      <EnergyPulse x="3%" y="40%" color={RED}    delay={1.5} side="right" />
      <EnergyPulse x="5%" y="70%" color={PURPLE} delay={4}   side="right" />
      <FloatingKanji char="追" x="4%" y="20%" color={RED}    delay={1.5} dur={8} side="right" />
      <FloatingKanji char="跡" x="3%" y="82%" color={PURPLE} delay={4}   dur={9} side="right" />
    </>
  );
}

/* ────────────────────── Auth ─────────────────────────────────────── */
function AuthDecor() {
  return (
    <>
      <BaseDecor />
      {/* Left — security & identity feel */}
      <NeonLine x="4%" height={85}  color={CYAN}   delay={0}   side="left" />
      <NeonLine x="7%" height={55}  color={PURPLE} delay={2.5} side="left" />
      <SpeedStreak y="30%" width={38} delay={0.6}  side="left" color={PURPLE} />
      <SpeedStreak y="65%" width={32} delay={2.4}  side="left" />
      <NeonDot x="3%"  y="20%" size={3} color={CYAN}   delay={0}   dur={5.5} side="left" />
      <NeonDot x="5%"  y="55%" size={4} color={PURPLE} delay={2}   dur={5}   side="left" />
      <NeonDot x="2%"  y="82%" size={3} color={PINK}   delay={3.5} dur={4.5} side="left" />
      <HoloRing x="2%" y="15%" size={40} color={CYAN}   dur={24} side="left" />
      <HoloRing x="6%" y="50%" size={28} color={PURPLE} dur={30} side="left" />
      <FloatingKanji char="認" x="3%" y="38%" color={CYAN}   delay={0.8} dur={9}  side="left" />
      <FloatingKanji char="証" x="5%" y="72%" color={PURPLE} delay={3}   dur={10} side="left" />
      <DataRain x="9%"  side="left" color={PURPLE} delay={1} />
      <EnergyPulse x="4%" y="45%" color={PURPLE} delay={2} side="left" />
      <GlitchBlock x="3%" y="25%" w={16} h={2} color={CYAN}   delay={1}   side="left" />
      <GlitchBlock x="5%" y="27%" w={10} h={2} color={PURPLE} delay={1.3} side="left" />

      {/* Right */}
      <NeonLine x="4%" height={80}  color={CYAN} delay={1}   side="right" />
      <NeonLine x="6%" height={50}  color={RED}  delay={3.2} side="right" />
      <SpeedStreak y="35%" width={36} delay={1.2} side="right" />
      <SpeedStreak y="70%" width={40} delay={3}   side="right" color={PINK} />
      <NeonDot x="3%"  y="25%" size={4} color={RED}    delay={0.8} dur={5}   side="right" />
      <NeonDot x="6%"  y="60%" size={3} color={CYAN}   delay={2.6} dur={4.5} side="right" />
      <NeonDot x="2%"  y="88%" size={3} color={PURPLE} delay={4}   dur={6}   side="right" />
      <HoloRing x="2%" y="60%" size={34} color={RED}  dur={20} side="right" />
      <HoloRing x="5%" y="35%" size={26} color={PINK} dur={28} side="right" />
      <DataRain x="8%"  side="right" color={RED}  delay={2} />
      <DataRain x="10%" side="right" color={PINK} delay={4.5} />
      <FloatingKanji char="鍵" x="4%" y="15%" color={RED}  delay={1.5} dur={8} side="right" />
      <FloatingKanji char="守" x="3%" y="80%" color={PINK} delay={4}   dur={9} side="right" />
    </>
  );
}

/* ────────────────────── Info ─────────────────────────────────────── */
function InfoDecor() {
  return (
    <>
      <BaseDecor />
      {/* Left — knowledge/info feel */}
      <NeonLine x="2%" height={100} color={CYAN}   delay={0.2} side="left" />
      <NeonLine x="4.5%" height={60} color={PINK}  delay={2.8} side="left" />
      <SpeedStreak y="22%" width={40} delay={0.4}  side="left" />
      <SpeedStreak y="52%" width={34} delay={2}    side="left" color={PINK} />
      <SpeedStreak y="78%" width={46} delay={3.6}  side="left" />
      <NeonDot x="1.5%" y="18%" size={4} color={CYAN}   delay={0}   dur={5.5} side="left" />
      <NeonDot x="3.5%" y="48%" size={3} color={PINK}   delay={1.8} dur={5}   side="left" />
      <NeonDot x="1%"   y="75%" size={4} color={PURPLE} delay={3.2} dur={4.5} side="left" />
      <HoloRing x="0.5%" y="12%" size={46} color={CYAN} dur={22} side="left" />
      <FloatingKanji char="情" x="2%" y="32%" color={CYAN}   delay={1}   dur={9}  side="left" />
      <FloatingKanji char="報" x="3%" y="60%" color={PINK}   delay={3.5} dur={10} side="left" />
      <DataRain x="6%"  side="left" color={CYAN}   delay={0} />
      <DataRain x="8%"  side="left" color={PINK}   delay={2} />
      <DataRain x="10%" side="left" color={PURPLE} delay={4} />
      <EnergyPulse x="2%" y="42%" color={CYAN} delay={2} side="left" />

      {/* Right */}
      <NeonLine x="2%" height={85}  color={CYAN}  delay={1}   side="right" />
      <NeonLine x="5%" height={55}  color={RED}   delay={3.4} side="right" />
      <SpeedStreak y="28%" width={38} delay={1}    side="right" color={PURPLE} />
      <SpeedStreak y="58%" width={32} delay={2.6}  side="right" />
      <SpeedStreak y="82%" width={44} delay={4}    side="right" />
      <NeonDot x="2%"  y="32%" size={3} color={RED}    delay={0.6} dur={5}   side="right" />
      <NeonDot x="4%"  y="62%" size={4} color={CYAN}   delay={2.2} dur={4.5} side="right" />
      <NeonDot x="1%"  y="16%" size={3} color={PURPLE} delay={4}   dur={6}   side="right" />
      <HoloRing x="1%" y="55%" size={38} color={RED}    dur={19} side="right" />
      <HoloRing x="4%" y="30%" size={28} color={PURPLE} dur={26} side="right" />
      <GlitchBlock x="3%" y="48%" w={20} h={3} color={CYAN}   delay={1.5} side="right" />
      <GlitchBlock x="5%" y="50%" w={12} h={2} color={PINK}   delay={1.8} side="right" />
      <FloatingKanji char="知" x="3%" y="22%" color={RED}    delay={2}   dur={8} side="right" />
      <FloatingKanji char="識" x="5%" y="75%" color={PURPLE} delay={4.5} dur={9} side="right" />
    </>
  );
}
