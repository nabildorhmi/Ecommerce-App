import { useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Box from '@mui/material/Box';

/* ─── Cyberpunk colour palette ──────────────────────────────────────── */
const CYAN    = '#00C2FF';
const RED     = '#E63946';
const PINK    = '#FF2D78';
const PURPLE  = '#8B5CF6';
const NEON_GN = '#39FF14';
const DARK    = '#0B0B0E';
const STEEL   = '#12121A';

/* ─── Shared materials (created once) ───────────────────────────────── */
const cyanCol   = new THREE.Color(CYAN);
const redCol    = new THREE.Color(RED);
const pinkCol   = new THREE.Color(PINK);
const purpleCol = new THREE.Color(PURPLE);
const neonGnCol = new THREE.Color(NEON_GN);

/* ─── Futuristic electric scooter ───────────────────────────────────── */
function CyberScooter() {
  const group      = useRef<THREE.Group>(null!);
  const frontWheel = useRef<THREE.Mesh>(null!);
  const rearWheel  = useRef<THREE.Mesh>(null!);
  const hubGlow1   = useRef<THREE.Mesh>(null!);
  const hubGlow2   = useRef<THREE.Mesh>(null!);
  const headlight  = useRef<THREE.SpotLight>(null!);
  const tailGlow   = useRef<THREE.Mesh>(null!);
  const underglow  = useRef<THREE.Mesh>(null!);
  const batteryLed = useRef<THREE.Mesh>(null!);
  const screenRef  = useRef<THREE.Mesh>(null!);
  const ring1      = useRef<THREE.Mesh>(null!);
  const ring2      = useRef<THREE.Mesh>(null!);
  const ring3      = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    /* gentle hover & sway */
    group.current.rotation.y = Math.sin(t * 0.35) * 0.32 - 0.22;
    group.current.position.y = Math.sin(t * 0.75) * 0.06;

    /* spin wheels */
    frontWheel.current.rotation.x += 0.06;
    rearWheel.current.rotation.x  += 0.06;

    /* hub motor pulse */
    const hubPulse = 0.45 + Math.sin(t * 3) * 0.25;
    (hubGlow1.current.material as THREE.MeshBasicMaterial).opacity = hubPulse;
    (hubGlow2.current.material as THREE.MeshBasicMaterial).opacity = hubPulse;

    /* underglow breath */
    const ugPulse = 0.32 + Math.sin(t * 2) * 0.14;
    (underglow.current.material as THREE.MeshBasicMaterial).opacity = ugPulse;

    /* tail light pulse */
    const tailP = 0.5 + Math.sin(t * 4) * 0.3;
    (tailGlow.current.material as THREE.MeshBasicMaterial).opacity = tailP;

    /* battery LED blink */
    const ledP = 0.3 + Math.sin(t * 5.5) * 0.25;
    (batteryLed.current.material as THREE.MeshBasicMaterial).opacity = ledP;

    /* screen flicker */
    const scP = 0.55 + Math.sin(t * 6) * 0.15;
    (screenRef.current.material as THREE.MeshBasicMaterial).opacity = scP;

    /* holographic data rings */
    ring1.current.rotation.z += 0.012;
    ring1.current.rotation.x  = 0.3 + Math.sin(t * 0.6) * 0.1;
    ring2.current.rotation.x += 0.008;
    ring2.current.rotation.z  = 0.4 + Math.cos(t * 0.5) * 0.15;
    ring3.current.rotation.y += 0.01;
    ring3.current.rotation.z += 0.007;
  });

  return (
    <group ref={group}>
      {/* ── 1. DECK (flat platform with bevelled edges) ─────────── */}
      <mesh position={[0.05, 0.02, 0]}>
        <boxGeometry args={[0.72, 0.04, 0.16]} />
        <meshStandardMaterial color={STEEL} metalness={0.95} roughness={0.08}
          emissive={cyanCol} emissiveIntensity={0.12} />
      </mesh>
      {/* Deck edge neon strip – left */}
      <mesh position={[0.05, 0.02, 0.082]}>
        <boxGeometry args={[0.72, 0.012, 0.005]} />
        <meshBasicMaterial color={CYAN} transparent opacity={0.8} />
      </mesh>
      {/* Deck edge neon strip – right */}
      <mesh position={[0.05, 0.02, -0.082]}>
        <boxGeometry args={[0.72, 0.012, 0.005]} />
        <meshBasicMaterial color={CYAN} transparent opacity={0.8} />
      </mesh>

      {/* ── 2. BATTERY HOUSING (under deck) ─────────────────────── */}
      <mesh position={[0.08, -0.03, 0]}>
        <boxGeometry args={[0.42, 0.05, 0.12]} />
        <meshStandardMaterial color="#0a0a12" metalness={0.9} roughness={0.1}
          emissive={purpleCol} emissiveIntensity={0.15} />
      </mesh>
      {/* Battery LED indicator */}
      <mesh ref={batteryLed} position={[0.25, -0.02, 0.065]}>
        <boxGeometry args={[0.06, 0.015, 0.005]} />
        <meshBasicMaterial color={NEON_GN} transparent opacity={0.5} />
      </mesh>

      {/* ── 3. STEM / COLUMN ────────────────────────────────────── */}
      <mesh position={[-0.3, 0.28, 0]} rotation={[0, 0, -0.12]}>
        <cylinderGeometry args={[0.022, 0.028, 0.52, 10]} />
        <meshStandardMaterial color={DARK} metalness={0.95} roughness={0.06}
          emissive={cyanCol} emissiveIntensity={0.25} />
      </mesh>
      {/* LED strip on stem */}
      <mesh position={[-0.3, 0.28, 0.028]} rotation={[0, 0, -0.12]}>
        <boxGeometry args={[0.008, 0.42, 0.004]} />
        <meshBasicMaterial color={PINK} transparent opacity={0.65} />
      </mesh>

      {/* ── 4. HANDLEBAR T-BAR ──────────────────────────────────── */}
      <mesh position={[-0.335, 0.53, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.014, 0.014, 0.32, 8]} />
        <meshStandardMaterial color={DARK} metalness={0.95} roughness={0.06}
          emissive={cyanCol} emissiveIntensity={0.3} />
      </mesh>
      {/* Grip left */}
      <mesh position={[-0.335, 0.53, 0.165]}>
        <cylinderGeometry args={[0.02, 0.02, 0.04, 8]} />
        <meshStandardMaterial color="#222" metalness={0.4} roughness={0.65}
          emissive={redCol} emissiveIntensity={0.25} />
      </mesh>
      {/* Grip right */}
      <mesh position={[-0.335, 0.53, -0.165]}>
        <cylinderGeometry args={[0.02, 0.02, 0.04, 8]} />
        <meshStandardMaterial color="#222" metalness={0.4} roughness={0.65}
          emissive={redCol} emissiveIntensity={0.25} />
      </mesh>

      {/* ── 5. DISPLAY SCREEN (on stem top) ────────────────────── */}
      <mesh ref={screenRef} position={[-0.31, 0.46, 0.03]} rotation={[0.15, 0.12, 0]}>
        <planeGeometry args={[0.06, 0.035]} />
        <meshBasicMaterial color={CYAN} transparent opacity={0.6} />
      </mesh>

      {/* ── 6. FRONT FORK ───────────────────────────────────────── */}
      <mesh position={[-0.32, -0.02, 0]} rotation={[0, 0, -0.12]}>
        <cylinderGeometry args={[0.012, 0.012, 0.2, 6]} />
        <meshStandardMaterial color="#1a1a22" metalness={0.92} roughness={0.1} />
      </mesh>

      {/* ── 7. FRONT FENDER (curved arc) ────────────────────────── */}
      <mesh position={[-0.33, 0.06, 0]} rotation={[0, 0, 0.3]}>
        <torusGeometry args={[0.15, 0.012, 4, 16, Math.PI * 0.65]} />
        <meshStandardMaterial color={STEEL} metalness={0.9} roughness={0.1}
          emissive={cyanCol} emissiveIntensity={0.15} />
      </mesh>

      {/* ── 8. FRONT WHEEL ──────────────────────────────────────── */}
      <mesh ref={frontWheel} position={[-0.34, -0.11, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.16, 0.035, 10, 24]} />
        <meshStandardMaterial color="#111118" metalness={0.92} roughness={0.1}
          emissive={cyanCol} emissiveIntensity={0.2} />
      </mesh>
      {/* Front hub glow */}
      <mesh ref={hubGlow1} position={[-0.34, -0.11, 0.015]} rotation={[0, 0, 0]}>
        <circleGeometry args={[0.06, 16]} />
        <meshBasicMaterial color={CYAN} transparent opacity={0.5} />
      </mesh>

      {/* ── 9. REAR SWINGARM ────────────────────────────────────── */}
      <mesh position={[0.28, -0.03, 0]} rotation={[0, 0, 0.08]}>
        <boxGeometry args={[0.22, 0.025, 0.04]} />
        <meshStandardMaterial color="#111118" metalness={0.9} roughness={0.12} />
      </mesh>

      {/* ── 10. REAR WHEEL (hub motor) ──────────────────────────── */}
      <mesh ref={rearWheel} position={[0.38, -0.11, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.16, 0.035, 10, 24]} />
        <meshStandardMaterial color="#111118" metalness={0.92} roughness={0.1}
          emissive={pinkCol} emissiveIntensity={0.18} />
      </mesh>
      {/* Rear hub glow (motor) */}
      <mesh ref={hubGlow2} position={[0.38, -0.11, 0.015]} rotation={[0, 0, 0]}>
        <circleGeometry args={[0.07, 16]} />
        <meshBasicMaterial color={PINK} transparent opacity={0.5} />
      </mesh>
      {/* Rear fender */}
      <mesh position={[0.38, 0.02, 0]} rotation={[0, 0, -0.25]}>
        <torusGeometry args={[0.13, 0.01, 4, 16, Math.PI * 0.55]} />
        <meshStandardMaterial color={STEEL} metalness={0.9} roughness={0.1}
          emissive={pinkCol} emissiveIntensity={0.12} />
      </mesh>

      {/* ── 11. TAIL LIGHT ──────────────────────────────────────── */}
      <mesh ref={tailGlow} position={[0.42, 0.04, 0]}>
        <boxGeometry args={[0.015, 0.035, 0.1]} />
        <meshBasicMaterial color={RED} transparent opacity={0.65} />
      </mesh>

      {/* ── 12. HEADLIGHT BEAM ──────────────────────────────────── */}
      <spotLight ref={headlight} position={[-0.35, 0.42, 0]}
        target-position={[-2, -0.5, 0]}
        color={CYAN} intensity={1.2} distance={2.5}
        angle={0.35} penumbra={0.6} />
      {/* Headlight lens */}
      <mesh position={[-0.345, 0.42, 0]}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshBasicMaterial color={CYAN} transparent opacity={0.8} />
      </mesh>

      {/* ── 13. UNDERGLOW (neon strip under deck) ───────────────── */}
      <mesh ref={underglow} position={[0.05, -0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.7, 0.18]} />
        <meshBasicMaterial color={CYAN} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* ── 14. HOLOGRAPHIC DATA RINGS ──────────────────────────── */}
      <mesh ref={ring1} rotation={[0.3, 0, 0]}>
        <torusGeometry args={[0.55, 0.006, 4, 64]} />
        <meshBasicMaterial color={CYAN} transparent opacity={0.4} />
      </mesh>
      <mesh ref={ring2} rotation={[Math.PI / 2, 0, 0.4]}>
        <torusGeometry args={[0.68, 0.004, 4, 64]} />
        <meshBasicMaterial color={PURPLE} transparent opacity={0.28} />
      </mesh>
      <mesh ref={ring3} rotation={[1.2, 0.5, 0.3]}>
        <torusGeometry args={[0.62, 0.003, 4, 64]} />
        <meshBasicMaterial color={PINK} transparent opacity={0.2} />
      </mesh>

      {/* ── 15. SCENE LIGHTING ──────────────────────────────────── */}
      <pointLight position={[0, -0.2, 0]}    color={CYAN}   intensity={0.8} distance={1.4} />
      <pointLight position={[-0.5, 0.15, 0]} color={CYAN}   intensity={0.5} distance={1} />
      <pointLight position={[0.45, -0.08, 0]} color={PINK}  intensity={0.4} distance={0.8} />
      <pointLight position={[0, 0.6, 0.8]}   color={PURPLE} intensity={0.3} distance={2} />
    </group>
  );
}

/* ─── Floating Katakana characters (ミライテック = MiraiTech) ─────── */
const KANJI = ['ミ', 'ラ', 'イ', 'テ', 'ッ', 'ク', '未', '来', '電', '動'];
const KANJI_COUNT = KANJI.length;

/* Pre-compute orbit data at module level (avoids impure function in render) */
const KANJI_ORBITS = KANJI.map((_, i) => ({
  radius: 0.85 + Math.random() * 0.55,
  speed:  0.15 + Math.random() * 0.2,
  offset: (i / KANJI_COUNT) * Math.PI * 2,
  y:      (Math.random() - 0.5) * 0.7,
  tilt:   (Math.random() - 0.5) * 0.6,
}));

function FloatingKanji() {
  const groupRef = useRef<THREE.Group>(null!);

  const orbits = KANJI_ORBITS;

  /* Create canvas textures for each character */
  const textures = useMemo(() =>
    KANJI.map((char) => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, 64, 64);
      ctx.font = 'bold 44px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      ctx.fillText(char, 32, 34);
      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;
      return tex;
    }),
  []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const children = groupRef.current.children as THREE.Mesh[];
    for (let i = 0; i < KANJI_COUNT; i++) {
      const o = orbits[i];
      const angle = t * o.speed + o.offset;
      children[i].position.x = Math.cos(angle) * o.radius;
      children[i].position.z = Math.sin(angle) * o.radius * 0.35;
      children[i].position.y = o.y + Math.sin(t * 0.8 + i) * 0.08;
      children[i].lookAt(0, children[i].position.y, 0);
      const mat = children[i].material as THREE.MeshBasicMaterial;
      mat.opacity = 0.15 + Math.sin(t * 1.8 + i * 1.1) * 0.1;
    }
  });

  const colors = [CYAN, PINK, CYAN, PURPLE, PINK, CYAN, RED, CYAN, PINK, PURPLE];

  return (
    <group ref={groupRef}>
      {KANJI.map((_, i) => (
        <mesh key={i} position={[0, 0, 0]}>
          <planeGeometry args={[0.12, 0.12]} />
          <meshBasicMaterial
            map={textures[i]}
            color={colors[i % colors.length]}
            transparent
            opacity={0.2}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Neon-grid ground texture (created once at module level) ───────── */
const GRID_TEXTURE = (() => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = '#00C2FF';
  ctx.lineWidth = 1;
  const step = 16;
  for (let x = 0; x <= 256; x += step) {
    ctx.globalAlpha = 0.3;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 256); ctx.stroke();
  }
  for (let y = 0; y <= 256; y += step) {
    ctx.globalAlpha = 0.3;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y); ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
})();

function NeonGrid() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    GRID_TEXTURE.offset.x = t * 0.05;
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.12 + Math.sin(t * 1.5) * 0.04;
  });

  return (
    <mesh ref={meshRef} position={[0, -0.32, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[3, 3]} />
      <meshBasicMaterial map={GRID_TEXTURE} transparent opacity={0.14} depthWrite={false} />
    </mesh>
  );
}

/* ─── Energy particles (multi-colour cyberpunk) ─────────────────────── */
const PARTICLE_COUNT = 60;

const INIT_PARTICLE_DATA = (() => {
  const pos   = new Float32Array(PARTICLE_COUNT * 3);
  const col   = new Float32Array(PARTICLE_COUNT * 3);
  const palette = [cyanCol, pinkCol, purpleCol, neonGnCol, redCol];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 2.8;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 1.4;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
    const c = palette[i % palette.length];
    col[i * 3]     = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }
  return { pos, col };
})();

function EnergyParticles() {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => new Float32Array(INIT_PARTICLE_DATA.pos), []);
  const colors    = useMemo(() => new Float32Array(INIT_PARTICLE_DATA.col), []);

  useFrame(({ clock }) => {
    const p = ref.current.geometry.attributes.position.array as Float32Array;
    const t = clock.elapsedTime;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      p[i * 3] -= 0.018 + Math.sin(t + i) * 0.004;
      p[i * 3 + 1] += Math.sin(t * 1.5 + i * 0.7) * 0.001;
      if (p[i * 3] < -1.5) {
        p[i * 3]     = 1.5;
        p[i * 3 + 1] = (Math.random() - 0.5) * 1.4;
        p[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute args={[positions, 3]} attach="attributes-position" />
        <bufferAttribute args={[colors, 3]}    attach="attributes-color" />
      </bufferGeometry>
      <pointsMaterial size={0.018} transparent opacity={0.55} vertexColors depthWrite={false} />
    </points>
  );
}

/* ─── Pulse ring effect (expanding ring that fades) ─────────────────── */
function PulseRing() {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const cycle = (t * 0.6) % 1;          // 0→1 repeating
    const scale = 0.3 + cycle * 1.2;
    ref.current.scale.set(scale, scale, scale);
    (ref.current.material as THREE.MeshBasicMaterial).opacity = (1 - cycle) * 0.18;
  });

  return (
    <mesh ref={ref} position={[0, -0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.48, 0.5, 48]} />
      <meshBasicMaterial color={CYAN} transparent opacity={0.18} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

/* ─── Public component ──────────────────────────────────────────────── */
interface MiniScooter3DProps {
  width?:  number | string;
  height?: number | string;
}

export function MiniScooter3D({ width = 200, height = 140 }: MiniScooter3DProps) {
  return (
    <Box sx={{ width, height, pointerEvents: 'none', flexShrink: 0, userSelect: 'none' }}>
      <Canvas
        camera={{ position: [0, 0.5, 2.4], fov: 42 }}
        gl={{ alpha: true, antialias: true }}
        style={{ width: '100%', height: '100%' }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.12} />
        <pointLight position={[3, 3, 2]}   color={CYAN}   intensity={0.55} />
        <pointLight position={[-2, -1, 1]}  color={RED}    intensity={0.2} />
        <pointLight position={[0, 2, -1]}   color={PURPLE} intensity={0.25} />
        <Suspense fallback={null}>
          <CyberScooter />
          <FloatingKanji />
          <NeonGrid />
          <EnergyParticles />
          <PulseRing />
        </Suspense>
      </Canvas>
    </Box>
  );
}
