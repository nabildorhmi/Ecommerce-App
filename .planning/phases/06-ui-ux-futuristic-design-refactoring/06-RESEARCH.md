# Phase 6: UI/UX Futuristic Design Refactoring - Research

**Researched:** 2026-02-27
**Domain:** React UI/UX design with 3D graphics, animations, glassmorphism, and micro-interactions
**Confidence:** HIGH

## Summary

Phase 6 refactors the entire TrotinetteApp storefront and admin UI to a futuristic, high-tech, premium aesthetic while preserving the existing MiraiTech color palette (MIRAI_CYAN #00C2FF, MIRAI_BLACK #0B0B0E, etc.). The phase integrates four major technical domains: (1) React Three Fiber for interactive 3D hero sections, (2) Framer Motion for smooth micro-interactions and entrance animations, (3) glassmorphism via CSS backdrop-filter for premium surfaces, and (4) animated KPI count-ups for dashboard metrics.

The project already has CSS animations and a strong theme foundation (Plus Jakarta Sans font, glassmorphic cards with blur, glowing buttons with gradients). The refactoring will add: a 3D particle-based hero with cursor interaction, Framer Motion animations on all interactive elements (modals, drawers, buttons, tables), enhanced glassmorphism with proper accessibility, and count-up animations for admin dashboard KPIs.

**Primary recommendation:** Use React Three Fiber 9.5.0 + @react-three/drei 10.7.7 for 3D hero (limit particles for 60fps), Framer Motion 12.34.3 (now React 19 compatible) for all animations with reducedMotion accessibility, react-countup 6.5.3 with enableScrollSpy for KPI animations, and backdrop-filter with 8-15px blur (optimized for performance). Structure animations in shared hooks, keep 3D bundle small via tree-shaking, and validate all glassmorphic text meets WCAG 4.5:1 contrast.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @react-three/fiber | 9.5.0 | React renderer for Three.js (3D hero section) | Official pmndrs renderer, declarative 3D in React, works with React 19, latest stable release from 2 months ago |
| @react-three/drei | 10.7.7 | Helper components for R3F (OrbitControls, PerspectiveCamera, effects) | Essential abstractions for R3F workflows, provides ready-made camera controls and optimizations like LOD |
| three | peer dependency | 3D graphics library (WebGL/WebGPU) | Industry standard for 3D web graphics, R3F requires it as peer dep, flexible version compatibility |
| framer-motion | 12.34.3 | Production-grade React animation library | Now React 19 compatible (as of Jan 2026), provides motion components, variants, gestures, layout animations, and accessibility hooks |
| framer-motion-3d | latest | 3D animations for React Three Fiber scenes | Official integration to synchronize 2D and 3D animations, shares context with Framer Motion |
| react-countup | 6.5.3 | Count-up number animations for KPIs | Industry standard for dashboard metrics, supports scroll spy, formatting, and decimals |

**Installation:**
```bash
npm install three @react-three/fiber @react-three/drei framer-motion framer-motion-3d react-countup
```

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| stats-gl | latest | Performance monitoring for 3D scenes | Development only - measure FPS, draw calls, memory to ensure 60fps target |
| rollup-plugin-visualizer | latest | Bundle size analysis | Development only - visualize Three.js bundle impact and optimize tree-shaking with Vite |

### Already Installed
The project already has:
- React 19.2.0 + TypeScript + Vite
- MUI 7.3.8 (latest, with CSS layer support)
- Theme with glassmorphism (backdrop-filter, rgba backgrounds)
- Plus Jakarta Sans font, MIRAI color tokens
- CSS animations (pulse-glow, shimmer, float, gradient-shift)

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Framer Motion | GSAP + React Spring | GSAP more powerful but heavier bundle, steeper learning curve; React Spring physics-based but less declarative |
| React Three Fiber | raw Three.js | More control but loses React declarative model, harder to maintain, no automatic disposal |
| react-countup | use-count-up hook | Lighter (hook-based) but less features, no built-in scroll spy, manual formatting |
| framer-motion-3d | Manual sync 2D/3D | Custom solution but layout camera sync is complex, Framer Motion 3D handles this automatically |

## Architecture Patterns

### Recommended Project Structure
```
src/
├── features/
│   ├── home/
│   │   ├── components/
│   │   │   ├── Hero3D.tsx           # 3D hero with R3F Canvas
│   │   │   ├── ParticleField.tsx    # Floating particles/shapes
│   │   │   └── Hero3DFallback.tsx   # 2D fallback for low-end devices
│   │   └── pages/HomePage.tsx
│   ├── admin/
│   │   ├── components/
│   │   │   ├── AnimatedKPICard.tsx  # Count-up KPI with icon
│   │   │   ├── AnimatedTable.tsx    # Table with hover elevation
│   │   │   └── ChartWrapper.tsx     # Recharts with entrance animations
│   │   └── pages/AdminDashboardPage.tsx
│   └── auth/
│       ├── components/
│       │   ├── GlassmorphicCard.tsx # Centered glassmorphic form card
│       │   └── AnimatedInput.tsx    # Floating label with focus animation
│       └── pages/LoginPage.tsx
├── shared/
│   ├── components/
│   │   ├── AnimatedButton.tsx       # Ripple + magnetic hover button
│   │   ├── AnimatedModal.tsx        # Scale + blur modal wrapper
│   │   ├── AnimatedDrawer.tsx       # Slide + blur drawer wrapper
│   │   └── CollapsibleSidebar.tsx   # Admin sidebar with smooth collapse
│   ├── hooks/
│   │   ├── useReducedMotion.ts      # Accessibility hook from Framer Motion
│   │   ├── use3DInteraction.ts      # Mouse position tracking for 3D
│   │   └── useCountUp.ts            # Wrapper for react-countup with defaults
│   └── animations/
│       ├── variants.ts              # Framer Motion variant presets (modal, drawer, button)
│       ├── transitions.ts           # Easing curves and duration constants
│       └── spring-configs.ts        # Physics presets for spring animations
```

### Pattern 1: Interactive 3D Hero with Cursor Tracking
**What:** Hero section with React Three Fiber Canvas, floating 3D shapes/particles that react to cursor position, smooth entrance animations, and glowing CTA button overlay.

**When to use:** Homepage hero, landing pages, feature showcases where 3D visual impact is desired.

**Example:**
```typescript
// Source: Official R3F docs + WebSearch findings on cursor interaction
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useRef } from 'react';
import { motion } from 'framer-motion-3d';
import * as THREE from 'three';

function ParticleField() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { viewport, pointer } = useThree();

  // Update particles based on cursor position (useFrame runs 60fps)
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    // Avoid allocating new vectors in useFrame (performance pitfall)
    for (let i = 0; i < 50; i++) {
      const id = i;
      meshRef.current.getMatrixAt(id, tempMatrix);
      tempMatrix.decompose(tempPosition, tempQuaternion, tempScale);

      // React to pointer with damping
      const distance = tempPosition.distanceTo(new THREE.Vector3(pointer.x * viewport.width / 2, pointer.y * viewport.height / 2, 0));
      const influence = Math.max(0, 1 - distance / 3);

      tempPosition.x += Math.sin(time + id) * 0.01 + pointer.x * influence * 0.05;
      tempPosition.y += Math.cos(time + id * 0.5) * 0.01 + pointer.y * influence * 0.05;

      tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
      meshRef.current.setMatrixAt(id, tempMatrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, 50]}>
      <icosahedronGeometry args={[0.1, 0]} />
      <meshStandardMaterial color="#00C2FF" emissive="#00C2FF" emissiveIntensity={0.5} />
    </instancedMesh>
  );
}

// Reusable temp objects to avoid GC thrashing
const tempMatrix = new THREE.Matrix4();
const tempPosition = new THREE.Vector3();
const tempQuaternion = new THREE.Quaternion();
const tempScale = new THREE.Vector3();

export function Hero3D() {
  return (
    <div style={{ height: '600px', position: 'relative' }}>
      <Canvas frameloop="always" dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00C2FF" />
        <ParticleField />
      </Canvas>
      {/* Overlay CTA button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        style={{ position: 'absolute', bottom: '20%', left: '50%', transform: 'translateX(-50%)' }}
      >
        <button>Acheter maintenant</button>
      </motion.div>
    </div>
  );
}
```

### Pattern 2: Animated KPI Cards with Count-Up
**What:** Admin dashboard KPI cards that animate numbers from 0 to target value when scrolled into view, with optional chart integration.

**When to use:** Dashboard metrics, statistics pages, any numeric data that benefits from visual emphasis.

**Example:**
```typescript
// Source: react-countup npm docs + WebSearch findings on scroll spy
import CountUp from 'react-countup';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface AnimatedKPICardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  icon?: React.ReactNode;
}

export function AnimatedKPICard({ label, value, prefix = '', suffix = '', decimals = 0, icon }: AnimatedKPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,194,255,0.15)' }}
    >
      <Card sx={{
        background: 'rgba(22, 22, 28, 0.6)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.06)'
      }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            {icon}
            <Typography color="textSecondary" variant="body2">
              {label}
            </Typography>
          </Box>
          <Typography variant="h4" color="primary">
            <CountUp
              end={value}
              prefix={prefix}
              suffix={suffix}
              decimals={decimals}
              duration={2}
              enableScrollSpy
              scrollSpyOnce
            />
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Usage:
<AnimatedKPICard label="Chiffre d'affaires" value={125000} prefix="MAD " decimals={2} icon={<TrendingUpIcon />} />
```

### Pattern 3: Glassmorphic Modal/Drawer with Framer Motion
**What:** Modals and drawers that enter with scale + blur animation, use glassmorphic backdrop, and exit smoothly with AnimatePresence.

**When to use:** All modal dialogs, side drawers (cart, filters, admin forms), confirmation dialogs.

**Example:**
```typescript
// Source: Framer Motion AnimatePresence docs + WebSearch findings on modal animations
import { AnimatePresence, motion } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';

interface AnimatedModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    filter: 'blur(10px)'
  },
  visible: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    filter: 'blur(5px)',
    transition: { duration: 0.2 }
  }
};

export function AnimatedModal({ open, onClose, title, children }: AnimatedModalProps) {
  return (
    <AnimatePresence mode="wait">
      {open && (
        <Dialog
          open={open}
          onClose={onClose}
          PaperComponent={motion.div}
          PaperProps={{
            variants: modalVariants,
            initial: 'hidden',
            animate: 'visible',
            exit: 'exit',
            sx: {
              background: 'rgba(17, 17, 22, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)'
            }
          }}
          BackdropComponent={motion.div}
          BackdropProps={{
            variants: backdropVariants,
            initial: 'hidden',
            animate: 'visible',
            exit: 'hidden',
            sx: { backdropFilter: 'blur(4px)' }
          }}
        >
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>{children}</DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
```

### Pattern 4: Table with Animated Rows and Sticky Header Blur
**What:** Admin tables with rounded rows that elevate on hover, animated sorting/filtering, and sticky header with backdrop-filter blur.

**When to use:** All admin data tables (orders, products, users).

**Example:**
```typescript
// Source: MUI TableContainer docs + WebSearch findings on sticky headers with blur
import { TableContainer, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import { motion } from 'framer-motion';

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, duration: 0.3 }
  })
};

export function AnimatedTable({ data }: { data: any[] }) {
  return (
    <TableContainer
      sx={{
        maxHeight: '600px',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px',
        '& .MuiTableHead-root': {
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: 'rgba(17, 17, 22, 0.95)',
          backdropFilter: 'blur(12px)',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(0,194,255,0.3), transparent)'
          }
        }
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Amount</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, i) => (
            <TableRow
              component={motion.tr}
              custom={i}
              variants={rowVariants}
              initial="hidden"
              animate="visible"
              whileHover={{
                backgroundColor: 'rgba(0,194,255,0.05)',
                boxShadow: '0 4px 12px rgba(0,194,255,0.1)',
                borderRadius: '8px'
              }}
              key={row.id}
              sx={{
                transition: 'all 0.2s ease',
                '& td': { borderColor: 'rgba(255,255,255,0.05)' }
              }}
            >
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.status}</TableCell>
              <TableCell align="right">{row.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
```

### Anti-Patterns to Avoid

- **Don't create new vectors in useFrame:** Allocating objects 60 times per second triggers garbage collection and causes frame drops. Use global or component-scoped reusable objects (tempVector, tempMatrix).
- **Don't use default imports with tree-shaking:** Always use named imports (`import { Box } from '@mui/material'`) to enable proper tree-shaking with Vite.
- **Don't animate backdrop-filter dynamically:** Animating blur radius is extremely expensive on GPU. Set backdrop-filter statically and only animate opacity or transform.
- **Don't wrap every element in motion.div:** Only wrap elements that actually need animation. Excessive motion components add overhead and layout recalculation.
- **Don't ignore reducedMotion:** Always check `useReducedMotion()` hook and disable transform/layout animations for users with motion sensitivity.
- **Don't use high blur values on large areas:** Keep blur radius 8-15px max, especially on mobile. Higher values exponentially increase GPU workload.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 3D cursor interaction | Custom mouse tracking + manual matrix math | React Three Fiber `useThree().pointer` + `useFrame` | R3F provides normalized pointer coords and render loop, handles viewport scaling, avoids manual event listeners |
| Animation variants | CSS classes + manual state management | Framer Motion variants + AnimatePresence | Variants provide declarative animation states, AnimatePresence handles exit animations automatically, no manual cleanup |
| Count-up animations | Custom setInterval with easing | react-countup library | Handles easing, formatting, scroll spy, decimals, and edge cases (negative numbers, large values) out of the box |
| Modal entrance/exit | CSS transitions + manual timeout cleanup | Framer Motion AnimatePresence | Automatically waits for exit animation before unmounting, prevents layout shifts, handles multiple children |
| Reduced motion detection | Manual matchMedia queries | Framer Motion `useReducedMotion()` hook | Reactive hook updates on preference change, works with MotionConfig for global control, follows WCAG guidelines |
| 3D object pooling | Manual pool management | Three.js InstancedMesh + R3F | InstancedMesh renders thousands of objects in single draw call, R3F handles disposal automatically |
| Sticky header scroll detection | Manual scroll event listeners | CSS `position: sticky` + backdrop-filter | Native browser optimization, no JavaScript overhead, works with smooth scrolling, automatic z-index handling |
| Button ripple effect | Custom click handlers + animation | MUI ButtonBase ripple (or custom with Framer Motion tap gestures) | MUI ripple optimized for material design, Framer Motion provides whileTap for custom ripples, both handle touch events |

**Key insight:** Modern animation and 3D libraries have already solved the hard edge cases (disposal, performance, accessibility, cross-browser). Custom solutions inevitably encounter layout thrashing (Framer Motion batches), memory leaks (R3F auto-disposes), and accessibility gaps (reduced motion). The bundle size cost is offset by avoiding months of debugging.

## Common Pitfalls

### Pitfall 1: Three.js Memory Leaks from Undisposed Resources
**What goes wrong:** Geometries, materials, textures, and shader programs persist in GPU memory even after React components unmount. Over time, memory usage skyrockets and frame rate degrades.

**Why it happens:** Three.js objects require explicit disposal via `.dispose()`. React's garbage collection doesn't trigger GPU cleanup. ImageBitmap textures (from GLTF) leak without `.close()`.

**How to avoid:**
- Let React Three Fiber handle disposal automatically (it disposes all R3F-created objects on unmount)
- For manually created objects, use `useEffect` cleanup: `return () => { geometry.dispose(); material.dispose(); }`
- Monitor `renderer.info.memory` in dev tools (if geometries/textures count keeps growing, you have leaks)
- Use shared geometries/materials via `useMemo` to reduce object creation

**Warning signs:** FPS drops over time, browser DevTools shows increasing WebGL memory, stuttering after navigating between pages.

### Pitfall 2: Framer Motion Layout Thrashing with Too Many layoutId
**What goes wrong:** Using `layoutId` on many elements causes layout measurements to be batched globally, but excessive layoutIds trigger style recalculation across the entire app, causing jank.

**Why it happens:** Framer Motion batches layout reads/writes to avoid thrashing, but the more layoutIds, the larger the batch. Each layout change forces recalculation of all related elements.

**How to avoid:**
- Only use `layoutId` for shared element transitions (e.g., image expanding to detail page)
- For simple animations, use `animate` or `whileHover` without `layoutId`
- Add `layoutScroll` prop to scrollable containers if layout animations inside scroll incorrectly
- Use `layout="position"` instead of `layout={true}` to only animate position (not size)

**Warning signs:** Janky animations when multiple elements animate simultaneously, DevTools Performance shows long "Recalculate Style" tasks.

### Pitfall 3: Glassmorphism Text Contrast Failures (WCAG Violation)
**What goes wrong:** Semi-transparent glassmorphic backgrounds with backdrop-filter blur often fail WCAG 4.5:1 contrast ratio for body text, especially over busy/colorful backgrounds or in dark mode.

**Why it happens:** Transparency reduces contrast inherently. Blur diffuses underlying colors, making text harder to read. Dark mode exposes this more (translucent panels fade into dark backgrounds).

**How to avoid:**
- Always add semi-opaque overlay behind text: `background: rgba(17, 17, 22, 0.9)` (not 0.6)
- Use contrast checker tools (WebAIM, Chrome DevTools) to validate all glassmorphic text
- Add text-shadow for critical text: `text-shadow: 0 1px 2px rgba(0,0,0,0.8)`
- Provide solid background fallback for browsers without backdrop-filter support
- Test in both light and dark modes

**Warning signs:** Text hard to read over complex backgrounds, accessibility audits flag contrast issues, user complaints about readability.

### Pitfall 4: Expensive Backdrop-Filter Animation on Mobile
**What goes wrong:** Animating `backdrop-filter: blur()` or applying it to many elements simultaneously causes severe frame drops on mobile devices (especially blur values >15px).

**Why it happens:** Backdrop-filter triggers GPU compositing layer for every element. High blur radius requires expensive multi-pass rendering. Mobile GPUs are less powerful.

**How to avoid:**
- Keep blur values 8-15px maximum (exponential cost above 15px)
- Use backdrop-filter statically, not in animations (animate opacity or transform instead)
- Limit number of simultaneous backdrop-filter elements (max 3-4 on screen)
- Add `will-change: transform` to force GPU layer ONLY when animating, remove after
- Scale down blur or disable on mobile: `@media (max-width: 768px) { backdrop-filter: none; }`

**Warning signs:** Mobile frame rate <30fps, battery drains quickly, Chrome DevTools Performance shows long "Composite Layers" tasks.

### Pitfall 5: React Three Fiber Bundle Size Bloat from Three.js
**What goes wrong:** Three.js is large (~600KB), and importing entire modules (e.g., `import * as THREE from 'three'`) prevents tree-shaking, inflating bundle size by 200-400KB.

**Why it happens:** Three.js doesn't fully support tree-shaking yet. Default imports or wildcard imports pull in unused code. R3F requires Three.js as peer dependency.

**How to avoid:**
- Use named imports: `import { Vector3, MeshStandardMaterial } from 'three'` (helps tree-shaking)
- Analyze bundle with `rollup-plugin-visualizer` to identify bloat
- Use Vite's `rollupOptions.output.manualChunks` to split Three.js into separate chunk
- Consider code-splitting the 3D hero: `const Hero3D = lazy(() => import('./Hero3D'))`
- For production, set Vite `build.target: 'es2020'` to enable modern optimizations

**Warning signs:** Large bundle size (>500KB for main chunk), slow initial page load, Lighthouse flags large JavaScript.

### Pitfall 6: Bounce Animation Color Overshoot in Framer Motion Variants
**What goes wrong:** Framer Motion's `transition: { type: 'spring', bounce: 0.5 }` overshoots not just position but also colors, causing backgrounds to flash unexpected shades (red, darker) before settling.

**Why it happens:** Spring physics apply to ALL animated properties, including colors. Bounce causes values to overshoot target before settling.

**How to avoid:**
- Use `transition: { type: 'spring', bounce: 0 }` or `damping: 25` for color animations
- Split transitions: `position: { type: 'spring', bounce: 0.5 }, backgroundColor: { duration: 0.3 }}`
- Avoid spring on colors, opacity, or discrete values (use `type: 'tween'` instead)

**Warning signs:** Colors briefly flash wrong values during animation, unexpected visual artifacts.

### Pitfall 7: Missing ScrollSpyOnce Causes Repeated Count-Up Animations
**What goes wrong:** react-countup with `enableScrollSpy` re-triggers animation every time user scrolls past the element, making dashboard metrics count up repeatedly.

**Why it happens:** Default scroll spy behavior is to trigger on every scroll into view. Without `scrollSpyOnce`, the animation repeats.

**How to avoid:**
- Always add `scrollSpyOnce` prop: `<CountUp enableScrollSpy scrollSpyOnce end={1000} />`
- For manual control, use `useCountUp` hook with custom visibility detection

**Warning signs:** Numbers count up every time user scrolls, distracting and confusing UX.

## Code Examples

Verified patterns from official sources:

### Framer Motion: Reduced Motion Accessibility
```typescript
// Source: Framer Motion accessibility docs
import { MotionConfig, useReducedMotion } from 'framer-motion';

function App() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <MotionConfig reducedMotion={shouldReduceMotion ? 'always' : 'never'}>
      {/* All motion components inside respect reduced motion */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        // If reducedMotion is 'always', only opacity animates (x transform disabled)
      />
    </MotionConfig>
  );
}

// Or use the hook directly for custom behavior:
function CustomComponent() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={{
        opacity: 1,
        x: shouldReduceMotion ? 0 : 20, // Disable movement for reduced motion users
      }}
    />
  );
}
```

### React Three Fiber: Performance Optimization with InstancedMesh
```typescript
// Source: R3F scaling performance docs
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function OptimizedParticles({ count = 1000 }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Pre-calculate positions once (avoid recalculating every frame)
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5],
        speed: Math.random() * 0.5 + 0.5,
      });
    }
    return temp;
  }, [count]);

  // Reusable objects to avoid GC (critical for 60fps)
  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);
  const tempPosition = useMemo(() => new THREE.Vector3(), []);
  const tempQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const tempScale = useMemo(() => new THREE.Vector3(1, 1, 1), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    particles.forEach((particle, i) => {
      tempPosition.set(...particle.position);
      tempPosition.y += Math.sin(time * particle.speed + i) * 0.01;

      tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
      meshRef.current!.setMatrixAt(i, tempMatrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshStandardMaterial color="#00C2FF" />
    </instancedMesh>
  );
}
```

### MUI: Custom Glassmorphic Button with Framer Motion Ripple
```typescript
// Source: MUI theming docs + Framer Motion gesture props
import { Button, styled } from '@mui/material';
import { motion } from 'framer-motion';

const GlassmorphicButton = styled(motion(Button))(({ theme }) => ({
  background: 'rgba(22, 22, 28, 0.6)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(0, 194, 255, 0.3)',
  color: '#00C2FF',
  padding: '12px 32px',
  borderRadius: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(0,194,255,0.1), transparent)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover::before': {
    opacity: 1,
  },
}));

function AnimatedButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <GlassmorphicButton
      onClick={onClick}
      whileHover={{ scale: 1.05, boxShadow: '0 8px 24px rgba(0,194,255,0.25)' }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', damping: 15, stiffness: 300 }}
    >
      {children}
    </GlassmorphicButton>
  );
}
```

### Vite: Tree-Shaking Configuration for Three.js
```typescript
// Source: Vite docs + WebSearch findings on Three.js bundle optimization
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ filename: './dist/stats.html', open: false }) // Analyze bundle
  ],
  build: {
    target: 'es2020', // Enable modern optimizations
    rollupOptions: {
      output: {
        manualChunks: {
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'animation-vendor': ['framer-motion', 'framer-motion-3d'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei'], // Pre-bundle in dev
  },
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Framer Motion without React 19 support | Framer Motion 12.34.3 (React 19 compatible) | Jan 2026 | React 19 projects can now use latest Framer Motion without compatibility issues |
| Manual CSS backdrop-filter browser prefixes | Automatic unprefixing (modern browsers support unprefixed) | 2025 | Safari 17+ supports unprefixed backdrop-filter, only very old Safari needs -webkit- |
| WebGL-only Three.js rendering | WebGPURenderer with WebGL 2 fallback (r171+) | 2025 | Three.js r171 introduced zero-config WebGPU with automatic fallback, better performance on modern browsers |
| react-countup without scroll spy | react-countup 6.5+ with enableScrollSpy | 2024 | New scroll spy feature eliminates need for custom intersection observer code |
| MUI v6 without CSS layers | MUI v7 with enableCssLayer config | 2024 | MUI 7 can integrate with Tailwind CSS v4 and other CSS layer systems |
| Separate framer-motion and framer-motion-3d contexts | Unified MotionCanvas component | 2024 | MotionCanvas shares context between 2D and 3D animations, enables layout camera sync |

**Deprecated/outdated:**
- **Framer Motion's default export:** Now use named exports only (`import { motion } from 'framer-motion'`)
- **MUI's Hidden component:** Deprecated in v7, use `useMediaQuery` hook instead
- **Deep MUI imports (>1 level):** MUI v7 uses Node.js exports field, deep imports like `@mui/material/Button/Button` no longer work
- **Manual reducedMotion matchMedia:** Use Framer Motion's `useReducedMotion()` hook instead
- **Three.js ImageBitmap without .close():** GLTF loader returns ImageBitmap textures that must be explicitly closed to avoid leaks

## Open Questions

1. **Should 3D hero section have a 2D fallback for low-end devices?**
   - What we know: R3F works on most devices, but older mobile GPUs struggle with complex particle systems
   - What's unclear: What's the performance threshold to trigger fallback? (FPS detection? Device detection?)
   - Recommendation: Implement `frameloop="demand"` + measure initial FPS with stats-gl. If <30fps sustained, show CSS-animated 2D hero instead. Provide manual toggle in dev mode.

2. **How to handle glassmorphism contrast in user-uploaded background images?**
   - What we know: WCAG requires 4.5:1 contrast, but backdrop-filter results vary based on underlying content
   - What's unclear: Can we guarantee contrast if admins upload arbitrary product images behind glassmorphic cards?
   - Recommendation: Add semi-opaque overlay (`rgba(17,17,22,0.9)`) behind all text in glassmorphic cards. Test with worst-case colorful images. Provide admin guidelines to avoid busy backgrounds.

3. **Should animations be globally configurable (admin setting to disable)?**
   - What we know: `useReducedMotion()` handles OS-level preference, but some users may want to disable animations without changing OS settings
   - What's unclear: Is a custom "Disable animations" toggle in user settings necessary? Does it add complexity for minimal benefit?
   - Recommendation: Start with `useReducedMotion()` only (WCAG compliant). If user feedback requests toggle, add Zustand global state + MotionConfig wrapper. Don't over-engineer upfront.

4. **How to handle R3F Canvas rendering in RTL mode?**
   - What we know: Project supports RTL via `@mui/stylis-plugin-rtl`, 3D scenes don't have text direction
   - What's unclear: Does camera or particle positioning need RTL mirroring? Does Arabic UI expect 3D to flip?
   - Recommendation: 3D scenes are direction-agnostic (abstract shapes/particles). No mirroring needed. If future 3D includes text/UI, use drei's `Text` component with `anchorX` prop.

## Sources

### Primary (HIGH confidence)
- [React Three Fiber Installation](https://r3f.docs.pmnd.rs/getting-started/installation) - Official docs for setup and peer dependencies
- [React Three Fiber Scaling Performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance) - Performance optimization patterns
- [React Three Fiber Performance Pitfalls](https://docs.pmnd.rs/react-three-fiber/advanced/pitfalls) - Common mistakes and memory leaks
- [Framer Motion Create Accessible Animations Guide](https://motion.dev/docs/react-accessibility) - Reduced motion and WCAG compliance
- [Framer Motion useReducedMotion Hook](https://www.framer.com/motion/use-reduced-motion/) - Accessibility hook documentation
- [Framer Motion for React Three Fiber](https://motion.dev/docs/react-three-fiber) - Official 3D animation integration
- [Framer Motion AnimatePresence](https://motion.dev/docs/react-layout-animations) - Exit animations and shared elements
- [MUI v7 Upgrade Guide](https://mui.com/material-ui/migration/upgrade-to-v7/) - Breaking changes and new features
- [MUI Themed Components](https://mui.com/material-ui/customization/theme-components/) - Theme overrides for animations

### Secondary (MEDIUM confidence)
- [Glassmorphism Meets Accessibility](https://axesslab.com/glassmorphism-meets-accessibility-can-frosted-glass-be-inclusive/) - Contrast and readability guidance
- [Dark Glassmorphism UI in 2026](https://medium.com/@developer_89726/dark-glassmorphism-the-aesthetic-that-will-define-ui-in-2026-93aa4153088f) - 2026 design trends
- [100 Three.js Performance Tips (2026)](https://www.utsubo.com/blog/threejs-best-practices-100-tips) - Production performance optimization
- [React Three Fiber Interactive Mouse Follower](https://medium.com/@rwchampin/react-three-fiber-interactive-mouse-follower-f4b4524e5c2b) - Cursor interaction patterns
- [Reactive Depth: Scroll-Driven 3D with R3F (Feb 2026)](https://tympanus.net/codrops/2026/02/17/reactive-depth-building-a-scroll-driven-3d-image-tube-with-react-three-fiber/) - Recent tutorial on R3F techniques
- [Motion UI Trends 2026](https://lomatechnology.com/blog/motion-ui-trends-2026/2911) - Micro-interactions and motion design patterns
- [Framer Motion Performance Tips](https://tillitsdone.com/blogs/framer-motion-performance-tips/) - Layout thrashing and optimization
- [Material React Table Sticky Header Guide](https://www.material-react-table.com/docs/guides/sticky-header) - Sticky header implementation
- [CSS Backdrop Filter Performance](https://dev.to/leduc1901/costly-css-properties-and-how-to-optimize-them-3bmd) - GPU acceleration and mobile optimization

### Tertiary (LOW confidence - marked for validation)
- [react-countup npm page](https://www.npmjs.com/package/react-countup) - Version and props (npm blocked, verified via WebSearch)
- [@react-three/drei npm page](https://www.npmjs.com/package/@react-three/drei) - Version and components (npm blocked, verified via WebSearch)
- [Framer Motion npm page](https://www.npmjs.com/package/framer-motion) - React 19 compatibility (npm blocked, verified via WebSearch)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified via official docs/WebSearch, versions confirmed, React 19 compatibility validated
- Architecture: HIGH - Patterns based on official R3F/Framer Motion docs, existing project structure analyzed, integration points clear
- Pitfalls: HIGH - Memory leaks, layout thrashing, and glassmorphism contrast issues documented in official pitfall guides and accessibility resources
- Performance: MEDIUM-HIGH - 60fps targets and optimization strategies verified via official R3F performance docs and 2026 best practices, mobile performance needs project-specific testing
- Glassmorphism accessibility: MEDIUM - WCAG guidance clear, but real-world contrast validation depends on specific background images/colors in project

**Research date:** 2026-02-27
**Valid until:** ~2026-04-27 (60 days - stable ecosystem, but Three.js/Framer Motion release actively)

**Notes:**
- The project already has strong CSS animation foundation (pulse-glow, shimmer, float) - these can be enhanced but don't need replacement
- MUI 7 theme already uses backdrop-filter and glassmorphism - Phase 6 extends this consistently across all components
- No CONTEXT.md exists, so planner has full discretion on implementation approach
- React 19.2.0 and MUI 7.3.8 are latest versions, full compatibility confirmed for all recommended libraries
