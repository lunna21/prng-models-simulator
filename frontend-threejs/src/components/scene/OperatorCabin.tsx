

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface OperatorCabinProps {
  position: [number, number, number];
  busy: boolean;
}

function plasticMaterial(color: string, roughness = 0.34, clearcoat = 0.8) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={roughness}
      metalness={0}
      clearcoat={clearcoat}
      clearcoatRoughness={0.2}
    />
  );
}

// Scalloped collar ring made of overlapping spheres around the neck
function ScallopedCollar({
  y,
  radius,
  color,
}: {
  y: number;
  radius: number;
  color: string;
}) {
  const count = 10;
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * radius, y, Math.sin(angle) * radius]}
            castShadow
          >
            <sphereGeometry args={[0.075, 12, 12]} />
            {plasticMaterial(color, 0.35, 0.75)}
          </mesh>
        );
      })}
    </>
  );
}

// ── Monitor screen lines (scanlines illusion via stacked boxes) ──────────────
function MonitorScreen() {
  const lineCount = 5;
  return (
    <>
      {Array.from({ length: lineCount }).map((_, i) => (
        <mesh
          key={i}
          position={[0, 0.06 - i * 0.03, 0]}
          castShadow={false}
        >
          <boxGeometry args={[0.28, 0.008, 0.01]} />
          <meshPhysicalMaterial
            color="#00FF88"
            emissive="#00FF88"
            emissiveIntensity={0.9}
            roughness={0.1}
            metalness={0}
          />
        </mesh>
      ))}
      {/* Cursor blink placeholder — controlled in useFrame via ref */}
      <mesh position={[-0.1, -0.06, 0]}>
        <boxGeometry args={[0.04, 0.012, 0.01]} />
        <meshPhysicalMaterial
          color="#00FF88"
          emissive="#00FF88"
          emissiveIntensity={1.2}
          roughness={0.1}
          metalness={0}
        />
      </mesh>
    </>
  );
}

// ── Star burst particle (static, decorative) ─────────────────────────────────
function StarBurst({
  position,
  scale,
  color,
}: {
  position: [number, number, number];
  scale: number;
  color: string;
}) {
  return (
    <mesh position={position} scale={[scale, scale, scale]}>
      <tetrahedronGeometry args={[0.05, 0]} />
      <meshPhysicalMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.6}
        roughness={0.28}
        metalness={0}
      />
    </mesh>
  );
}

function OperatorCabin({ position, busy }: OperatorCabinProps) {
  const groupRef      = useRef<THREE.Group>(null);
  const operatorRef   = useRef<THREE.Group>(null);
  const bodyMeshRef   = useRef<THREE.Mesh>(null);       // NEW: squash & stretch
  const headGroupRef  = useRef<THREE.Group>(null);      // NEW: head look
  const leftArmRef    = useRef<THREE.Group>(null);
  const rightArmRef   = useRef<THREE.Group>(null);
  const leftAntennaRef  = useRef<THREE.Group>(null);
  const rightAntennaRef = useRef<THREE.Group>(null);
  const heartRef      = useRef<THREE.Group>(null);
  const monitorGlowRef = useRef<THREE.Mesh>(null);      // NEW: monitor pulse
  const burstGroupRef = useRef<THREE.Group>(null);      // NEW: joy-burst stars

  // ── Transition tracking ────────────────────────────────────────────────────
  // OPERATOR_BASE_Y: the resting local-y of operatorRef within the main group.
  // MUST match the JSX position prop below so useFrame never stomps on it.
  const OPERATOR_BASE_Y  = 1.22;
  const prevBusyRef      = useRef<boolean>(busy);
  const transitionTRef   = useRef<number>(-999);
  const squashPhaseRef   = useRef<number>(0);   // 0=none, active>0
  const squashTimerRef   = useRef<number>(0);
  const jumpOffsetRef    = useRef<number>(0);   // extra y offset during joy-jump
  const isBecameBusyRef  = useRef<boolean>(false); // persists across frames

  const bobOffset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    // ── Detect busy transition ─────────────────────────────────────────────
    const justBecameBusy = busy && !prevBusyRef.current;
    const justBecameIdle = !busy && prevBusyRef.current;
    if (justBecameBusy || justBecameIdle) {
      transitionTRef.current = t;
      squashPhaseRef.current = 1;
      squashTimerRef.current = 0;
      jumpOffsetRef.current  = 0;
      isBecameBusyRef.current = justBecameBusy; // persist for whole animation
      prevBusyRef.current = busy;
    }

    // ── Main body bobbing ──────────────────────────────────────────────────
    if (groupRef.current) {
      const bob = Math.sin(t * 2 + bobOffset) * 0.012;
      groupRef.current.position.y = position[1] + bob;
    }

    // ── Squash & Stretch on transition ─────────────────────────────────────
    // Pivot is at the center of the body (y=0 in operatorRef local space).
    // When sy != 1 we compensate position.y so the VISUAL BOTTOM stays fixed:
    //   bottom_world = OPERATOR_BASE_Y + posYOffset - halfBodyH * sy = OPERATOR_BASE_Y - halfBodyH
    //   → posYOffset = halfBodyH * (sy - 1)   (negative when squashing → moves group down to
    //     keep bottom flush, positive when stretching → rises for joy-jump feel)
    const HALF_BODY_H = 0.72; // approximate half-height of capsule body (visual)

    if (operatorRef.current && squashPhaseRef.current > 0) {
      squashTimerRef.current += 1 / 60;
      const dt = squashTimerRef.current;

      let sy = 1, sxz = 1;
      if (dt < 0.08) {
        const p = dt / 0.08;
        sy  = THREE.MathUtils.lerp(1, 0.78, p);
        sxz = THREE.MathUtils.lerp(1, 1.22, p);
      } else if (dt < 0.18) {
        const p = (dt - 0.08) / 0.10;
        sy  = THREE.MathUtils.lerp(0.78, 1.28, p);
        sxz = THREE.MathUtils.lerp(1.22, 0.84, p);
      } else if (dt < 0.38) {
        const p = (dt - 0.18) / 0.20;
        const elastic = 1 + Math.sin(p * Math.PI * 2.5) * 0.055 * (1 - p);
        sy  = elastic;
        sxz = 1 + (1 - elastic) * 0.4; // mild counter-axis
      } else {
        sy = 1; sxz = 1;
        squashPhaseRef.current  = 0;
        isBecameBusyRef.current = false;
        jumpOffsetRef.current   = 0;
      }

      operatorRef.current.scale.set(sxz, sy, sxz);

      // Pivot compensation: keep visual bottom anchored
      const pivotCompensation = HALF_BODY_H * (sy - 1);

      // Joy-jump arc: only when transitioning TO busy, during stretch phase
      if (isBecameBusyRef.current && dt >= 0.08 && dt < 0.26) {
        jumpOffsetRef.current = Math.sin(((dt - 0.08) / 0.18) * Math.PI) * 0.18;
      } else if (squashPhaseRef.current === 0) {
        jumpOffsetRef.current = 0;
      }

      // Always base on OPERATOR_BASE_Y — never set to 0!
      operatorRef.current.position.y = OPERATOR_BASE_Y + pivotCompensation + jumpOffsetRef.current;
    } else if (operatorRef.current) {
      // Ensure scale and position are clean when no animation is running
      operatorRef.current.scale.set(1, 1, 1);
      operatorRef.current.position.y = OPERATOR_BASE_Y;
    }

    // ── Star-burst visibility when transitioning to busy ──────────────────
    if (burstGroupRef.current) {
      const age = t - transitionTRef.current;
      const show = busy && age < 0.55;
      burstGroupRef.current.visible = show;
      if (show) {
        // Expand outward
        const progress = age / 0.55;
        const scale = THREE.MathUtils.lerp(0.4, 1.6, progress);
        burstGroupRef.current.scale.setScalar(scale);
        // Fade via rotation (purely cosmetic spin)
        burstGroupRef.current.rotation.y = progress * Math.PI;
        burstGroupRef.current.rotation.z = progress * Math.PI * 0.5;
      }
    }

    // ── Operator body animation ────────────────────────────────────────────
    if (operatorRef.current) {
      const targetRotX = busy ? 0.15 : 0;
      operatorRef.current.rotation.x = THREE.MathUtils.lerp(
        operatorRef.current.rotation.x,
        targetRotX,
        0.1
      );
      const sway = Math.sin(t * (busy ? 4 : 1.5)) * (busy ? 0.04 : 0.02);
      operatorRef.current.rotation.z = sway;
    }

    // ── Head: look side-to-side slowly when idle ───────────────────────────
    if (headGroupRef.current) {
      if (!busy) {
        // Slow, curious look left/right — uses a sharp sin to feel deliberate
        const lookAngle = Math.sin(t * 0.7) * 0.28;
        headGroupRef.current.rotation.y = THREE.MathUtils.lerp(
          headGroupRef.current.rotation.y,
          lookAngle,
          0.04
        );
        // Slight nod
        headGroupRef.current.rotation.x = THREE.MathUtils.lerp(
          headGroupRef.current.rotation.x,
          Math.sin(t * 0.4) * 0.05,
          0.05
        );
      } else {
        // Snap forward when busy
        headGroupRef.current.rotation.y = THREE.MathUtils.lerp(
          headGroupRef.current.rotation.y,
          0,
          0.12
        );
        headGroupRef.current.rotation.x = THREE.MathUtils.lerp(
          headGroupRef.current.rotation.x,
          0,
          0.12
        );
      }
    }

    // ── Antennas: whiplash when busy, lazy sway when idle ─────────────────
    if (leftAntennaRef.current && rightAntennaRef.current) {
      if (busy) {
        // Whiplash: atan-shaped pulse instead of constant sine
        const lash = Math.atan(Math.sin(t * 15) * 4) * 0.12;
        leftAntennaRef.current.rotation.z  =  lash;
        rightAntennaRef.current.rotation.z = -lash;
      } else {
        leftAntennaRef.current.rotation.z  =  Math.sin(t * 4) * 0.05;
        rightAntennaRef.current.rotation.z = -Math.sin(t * 4) * 0.05;
      }
    }

    // ── Arms ──────────────────────────────────────────────────────────────
    if (busy) {
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -0.5 + Math.sin(t * 10) * 0.1;
        leftArmRef.current.position.y = 0.04 + Math.cos(t * 12) * 0.02;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -0.3 + Math.sin(t * 8 + 1.2) * 0.2;
      }
    } else {
      if (leftArmRef.current) {
        leftArmRef.current.position.y = 0;
        leftArmRef.current.rotation.z = 0.75 + Math.sin(t * 2) * 0.05;
        leftArmRef.current.rotation.x = -0.35;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.z = -0.72 + Math.cos(t * 2) * 0.05;
        rightArmRef.current.rotation.x = -0.3;
      }
    }

    // ── Heart ─────────────────────────────────────────────────────────────
    if (heartRef.current) {
      if (busy) {
        const pulse = 1 + Math.sin(t * 10) * 0.2;
        heartRef.current.scale.setScalar(pulse);
        heartRef.current.rotation.y = Math.sin(t * 5) * 0.2;
      } else {
        heartRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.05);
        heartRef.current.rotation.y = 0;
      }
    }

    // ── Monitor glow pulse ─────────────────────────────────────────────────
    if (monitorGlowRef.current) {
      const mat = monitorGlowRef.current.material as THREE.MeshPhysicalMaterial;
      mat.emissiveIntensity = busy
        ? 0.6 + Math.sin(t * 6) * 0.3        // flickery when busy
        : 0.25 + Math.sin(t * 1.2) * 0.1;    // gentle idle pulse
    }
  });

  const statusColor = busy ? "#FF6B9D" : "#2ECC71";

  const counterBase = "#C0AED8";
  const counterRim  = "#E8C87A";
  const bodyBlue    = "#6FCBFF";
  const coatBlue    = "#4A90D9";
  const hatColor    = "#5479D8";
  const collarPurp  = "#9B7FC8";
  const antennaBlue = "#5AAEE8";
  const heartPink   = "#FF6B9D";
  const starYellow  = "#FFD93D";
  const screenGreen = "#00FF88";

  return (
    <group ref={groupRef} position={position}>
      {/* ── COUNTER ──────────────────────────────────────────────────────── */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.05, 1.1, 1.1, 48]} />
        {plasticMaterial(counterBase, 0.4, 0.5)}
      </mesh>

      <mesh position={[0, 0.72, 0]} castShadow>
        <cylinderGeometry args={[1.06, 1.06, 0.14, 48]} />
        {plasticMaterial(counterRim, 0.3, 0.65)}
      </mesh>

      <mesh position={[0, 0.72, 0]} receiveShadow>
        <cylinderGeometry args={[1.0, 1.0, 0.06, 48]} />
        {plasticMaterial(counterRim, 0.28, 0.7)}
      </mesh>

      {/* ── BACK PANEL WITH MONITOR ──────────────────────────────────────── */}
      {/* Panel body */}
      <mesh position={[0, 2.05, -0.72]} castShadow>
        <boxGeometry args={[1.7, 1.4, 0.12]} />
        {plasticMaterial("#C8B8E0", 0.38, 0.5)}
      </mesh>
      {/* Panel face inset */}
      <mesh position={[0, 2.05, -0.66]}>
        <boxGeometry args={[1.55, 1.25, 0.04]} />
        {plasticMaterial("#FAF0E0", 0.3, 0.55)}
      </mesh>

      {/* CRT-style monitor bezel */}
      <mesh position={[0.35, 2.1, -0.62]} castShadow>
        <boxGeometry args={[0.58, 0.46, 0.06]} />
        {plasticMaterial("#2A2A3A", 0.5, 0.3)}
      </mesh>
      {/* Monitor screen */}
      <mesh ref={monitorGlowRef} position={[0.35, 2.1, -0.59]}>
        <boxGeometry args={[0.46, 0.34, 0.01]} />
        <meshPhysicalMaterial
          color="#001A0A"
          emissive={screenGreen}
          emissiveIntensity={0.4}
          roughness={0.15}
          metalness={0}
        />
      </mesh>
      {/* Scanlines & cursor on the screen surface */}
      <group position={[0.35, 2.1, -0.585]}>
        <MonitorScreen />
      </group>

      {/* Small decorative logo on panel (heart badge) */}
      <mesh position={[-0.42, 2.52, -0.62]} scale={[1.1, 1.0, 0.4]} castShadow>
        <sphereGeometry args={[0.08, 16, 16]} />
        {plasticMaterial(heartPink, 0.3, 0.7)}
      </mesh>
      <mesh position={[-0.30, 2.52, -0.62]} scale={[1.1, 1.0, 0.4]} castShadow>
        <sphereGeometry args={[0.08, 16, 16]} />
        {plasticMaterial(heartPink, 0.3, 0.7)}
      </mesh>

      {/* ── OPERATOR ─────────────────────────────────────────────────────── */}
      {/* NOTE: position.y here MUST equal OPERATOR_BASE_Y (1.22) — useFrame always
          restores to that value; if they differ the character snaps on first frame. */}
      <group ref={operatorRef} position={[0.1, 1.22, -0.12]}>
        {/* Body */}
        <mesh ref={bodyMeshRef} scale={[1.28, 1.1, 1.15]} castShadow>
          <capsuleGeometry args={[0.38, 0.52, 12, 28]} />
          {plasticMaterial(bodyBlue, 0.3, 0.9)}
        </mesh>

        {/* Coat layer */}
        <mesh position={[0, -0.22, 0.02]} scale={[1.3, 1, 1.18]} castShadow>
          <cylinderGeometry args={[0.38, 0.42, 0.38, 30]} />
          {plasticMaterial(coatBlue, 0.35, 0.8)}
        </mesh>

        {/* Shoulder accents */}
        <mesh position={[-0.34, 0.13, 0.06]} scale={[1.2, 0.9, 1]} castShadow>
          <sphereGeometry args={[0.11, 14, 14]} />
          {plasticMaterial(coatBlue, 0.35, 0.8)}
        </mesh>
        <mesh position={[0.34, 0.13, 0.06]} scale={[1.2, 0.9, 1]} castShadow>
          <sphereGeometry args={[0.11, 14, 14]} />
          {plasticMaterial(coatBlue, 0.35, 0.8)}
        </mesh>

        {/* Scalloped collar */}
        <ScallopedCollar y={0.46} radius={0.28} color={collarPurp} />
        <mesh position={[0, 0.46, 0]} castShadow>
          <cylinderGeometry args={[0.27, 0.27, 0.07, 28]} />
          {plasticMaterial(collarPurp, 0.36, 0.7)}
        </mesh>

        {/* ── HEAD GROUP (animates independently) ───────────────────────── */}
        <group ref={headGroupRef} position={[0, 0.6, 0]}>
          {/* Hat */}
          <mesh position={[0, 0.28, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.23, 0.16, 26]} />
            {plasticMaterial(hatColor, 0.35, 0.75)}
          </mesh>
          {/* Hat brim */}
          <mesh position={[0, 0.19, 0]} castShadow>
            <cylinderGeometry args={[0.31, 0.31, 0.045, 26]} />
            {plasticMaterial(hatColor, 0.35, 0.75)}
          </mesh>
          {/* Hat band */}
          <mesh position={[0, 0.26, 0]} castShadow>
            <torusGeometry args={[0.21, 0.02, 10, 26]} />
            {plasticMaterial(collarPurp, 0.34, 0.75)}
          </mesh>
          {/* Top button */}
          <mesh position={[0, 0.38, 0]} castShadow>
            <sphereGeometry args={[0.024, 12, 12]} />
            {plasticMaterial(starYellow, 0.3, 0.8)}
          </mesh>

          {/* Left antenna */}
          <group ref={leftAntennaRef} position={[-0.1, 0.48, 0.04]}>
            <mesh castShadow>
              <sphereGeometry args={[0.075, 14, 14]} />
              {plasticMaterial(antennaBlue, 0.3, 0.8)}
            </mesh>
            <mesh position={[0, -0.09, -0.01]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.1, 10]} />
              {plasticMaterial(antennaBlue, 0.32, 0.7)}
            </mesh>
          </group>

          {/* Right antenna */}
          <group ref={rightAntennaRef} position={[0.1, 0.48, 0.04]}>
            <mesh castShadow>
              <sphereGeometry args={[0.075, 14, 14]} />
              {plasticMaterial(antennaBlue, 0.3, 0.8)}
            </mesh>
            <mesh position={[0, -0.09, -0.01]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.1, 10]} />
              {plasticMaterial(antennaBlue, 0.32, 0.7)}
            </mesh>
          </group>

          {/* ── Joy-burst star explosion (hidden by default) ───────────── */}
          <group ref={burstGroupRef} visible={false} position={[0, 0.5, 0]}>
            {[
              { p: [ 0.22,  0.18,  0.05] as [number,number,number], s: 1.4, c: starYellow },
              { p: [-0.20,  0.22, -0.04] as [number,number,number], s: 1.1, c: "#FF9F43" },
              { p: [ 0.06,  0.28,  0.18] as [number,number,number], s: 1.2, c: starYellow },
              { p: [-0.14,  0.10,  0.22] as [number,number,number], s: 0.9, c: heartPink  },
              { p: [ 0.18, -0.05,  0.20] as [number,number,number], s: 1.0, c: "#FF9F43" },
              { p: [-0.22,  0.04,  0.14] as [number,number,number], s: 1.3, c: starYellow },
              { p: [ 0.0,   0.30, -0.12] as [number,number,number], s: 1.0, c: heartPink  },
              { p: [ 0.24,  0.14, -0.10] as [number,number,number], s: 0.8, c: "#FFFACD"  },
            ].map((star, i) => (
              <StarBurst key={i} position={star.p} scale={star.s} color={star.c} />
            ))}
          </group>
        </group>
        {/* ── End HEAD GROUP ──────────────────────────────────────────────── */}

        {/* Left arm */}
        <group ref={leftArmRef}>
          <mesh
            position={[-0.62, 0.04, 0.28]}
            rotation={[-0.35, 0.15, 0.75]}
            castShadow
          >
            <capsuleGeometry args={[0.09, 0.28, 8, 16]} />
            {plasticMaterial(coatBlue, 0.35, 0.8)}
          </mesh>
        </group>

        {/* Right arm */}
        <group ref={rightArmRef}>
          <mesh
            position={[0.6, -0.1, 0.3]}
            rotation={[-0.3, -0.1, -0.72]}
            castShadow
          >
            <capsuleGeometry args={[0.09, 0.24, 8, 16]} />
            {plasticMaterial(coatBlue, 0.35, 0.8)}
          </mesh>
        </group>

        {/* Chest heart */}
        <group ref={heartRef} position={[0.01, -0.06, 0.46]}>
          <mesh position={[-0.065, 0.05, 0]} castShadow>
            <sphereGeometry args={[0.09, 16, 16]} />
            {plasticMaterial(heartPink, 0.28, 0.88)}
          </mesh>
          <mesh position={[0.065, 0.05, 0]} castShadow>
            <sphereGeometry args={[0.09, 16, 16]} />
            {plasticMaterial(heartPink, 0.28, 0.88)}
          </mesh>
          <mesh position={[0, -0.03, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
            <boxGeometry args={[0.115, 0.115, 0.06]} />
            {plasticMaterial(heartPink, 0.28, 0.88)}
          </mesh>
          <mesh position={[0, 0.0, -0.03]} castShadow>
            <sphereGeometry args={[0.12, 16, 16]} />
            {plasticMaterial("#f7d9e6", 0.34, 0.65)}
          </mesh>
        </group>

        {/* Coat star decorations */}
        <mesh position={[-0.28, -0.1, 0.4]} rotation={[0, 0, 0.3]} castShadow>
          <tetrahedronGeometry args={[0.06, 0]} />
          {plasticMaterial(starYellow, 0.32, 0.75)}
        </mesh>
        <mesh position={[0.3, -0.18, 0.4]} rotation={[0.1, 0, -0.4]} castShadow>
          <tetrahedronGeometry args={[0.055, 0]} />
          {plasticMaterial(starYellow, 0.32, 0.75)}
        </mesh>
        <mesh position={[0.42, 0.08, 0.36]} rotation={[0.2, 0.1, 0.5]} castShadow>
          <tetrahedronGeometry args={[0.045, 0]} />
          {plasticMaterial(starYellow, 0.32, 0.75)}
        </mesh>
      </group>

      {/* Status ring */}
      <mesh
        position={[0, 0.02, 1.3]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <ringGeometry args={[0.42, 0.54, 36]} />
        <meshPhysicalMaterial
          color={statusColor}
          emissive={statusColor}
          emissiveIntensity={0.4}
          roughness={0.3}
          metalness={0}
        />
      </mesh>
    </group>
  );
}

export default OperatorCabin;