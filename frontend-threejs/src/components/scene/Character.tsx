import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type CharacterType = "oval" | "sphere" | "capsule";

interface CharacterProps {
  type: CharacterType;
  position: [number, number, number];
  targetPosition: [number, number, number];
  state: "waiting" | "serving" | "departing" | "arriving";
  label?: string;
  queueIndex?: number; // position in queue, drives animation offset
}

const COLORS = {
  oval: {
    body: "#5BB8F5", // soft sky blue
    arms: "#FF9A5C", // warm orange
    legs: "#FFD95A", // sunny yellow
    shoes: "#FFF0A0", // pale yellow shoe tip
    center: "#FF6BAE", // pink badge
    antenna: "#9B7FE8", // soft purple tip
  },
  sphere: {
    body: "#FF7EB3", // bubblegum pink
    arms: "#A673E8", // purple
    legs: "#A673E8", // purple
    shoes: "#C9ACFF", // pale purple shoe tip
    center: "#5BCEF5", // cyan badge
    antenna: "#FFD95A", // yellow (not used on sphere but kept for parity)
  },
  capsule: {
    body: "#52D68A", // mint green
    arms: "#FF9A5C", // orange
    legs: "#FFD95A", // yellow
    shoes: "#FFF0A0", // pale yellow shoe tip
    center: "#FF6BAE", // pink badge
    antenna: "#9B7FE8", // purple (not used on capsule)
  },
};

function plasticMat(color: string, roughness = 0.3) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={roughness}
      metalness={0.0}
      clearcoat={1.0}
      clearcoatRoughness={0.15}
      reflectivity={0.4}
    />
  );
}

// ─── OVAL CHARACTER (like the big blue one in the image) ───────────────────────
function OvalCharacter() {
  const c = COLORS.oval;
  return (
    <group>
      {/* Big egg-shaped body: tall & wide, slight X squish */}
      <mesh position={[0, 0.72, 0]} scale={[1.22, 1.0, 0.9]} castShadow>
        <capsuleGeometry args={[0.38, 0.52, 12, 32]} />
        {plasticMat(c.body)}
      </mesh>

      {/* Antenna stems */}
      <mesh position={[-0.19, 1.27, 0]} rotation={[0, 0, 0.42]} castShadow>
        <cylinderGeometry args={[0.025, 0.03, 0.18, 12]} />
        {plasticMat(c.body)}
      </mesh>
      <mesh position={[0.19, 1.27, 0]} rotation={[0, 0, -0.42]} castShadow>
        <cylinderGeometry args={[0.025, 0.03, 0.18, 12]} />
        {plasticMat(c.body)}
      </mesh>
      {/* Antenna tips (purple balls) */}
      <mesh position={[-0.27, 1.38, 0]} castShadow>
        <sphereGeometry args={[0.055, 18, 18]} />
        {plasticMat(c.antenna)}
      </mesh>
      <mesh position={[0.27, 1.38, 0]} castShadow>
        <sphereGeometry args={[0.055, 18, 18]} />
        {plasticMat(c.antenna)}
      </mesh>

      {/* Chunky arms – no elbows, angled outward+downward */}
      <mesh position={[-0.68, 0.52, 0]} rotation={[0, 0, 0.72]} castShadow>
        <capsuleGeometry args={[0.115, 0.28, 8, 20]} />
        {plasticMat(c.arms)}
      </mesh>
      <mesh position={[0.68, 0.52, 0]} rotation={[0, 0, -0.72]} castShadow>
        <capsuleGeometry args={[0.115, 0.28, 8, 20]} />
        {plasticMat(c.arms)}
      </mesh>

      {/* Stubby legs */}
      <mesh position={[-0.22, 0.14, 0]} castShadow>
        <capsuleGeometry args={[0.11, 0.18, 8, 16]} />
        {plasticMat(c.legs)}
      </mesh>
      <mesh position={[0.22, 0.14, 0]} castShadow>
        <capsuleGeometry args={[0.11, 0.18, 8, 16]} />
        {plasticMat(c.legs)}
      </mesh>
      {/* Rounded boots */}
      <mesh position={[-0.22, -0.02, -0.06]} scale={[1.1, 0.7, 1.3]} castShadow>
        <sphereGeometry args={[0.12, 16, 16]} />
        {plasticMat(c.shoes)}
      </mesh>
      <mesh position={[0.22, -0.02, -0.06]} scale={[1.1, 0.7, 1.3]} castShadow>
        <sphereGeometry args={[0.12, 16, 16]} />
        {plasticMat(c.shoes)}
      </mesh>

      {/* Front badge circle */}
      <mesh position={[0, 0.72, -0.47]} castShadow>
        <sphereGeometry args={[0.13, 22, 22]} />
        {plasticMat(c.center)}
      </mesh>
    </group>
  );
}

// ─── SPHERE CHARACTER (like the small pink one in the image) ───────────────────
function SphereCharacter() {
  const c = COLORS.sphere;
  return (
    <group scale={0.8}>
      {/* Big round body */}
      <mesh position={[0, 0.58, 0]} castShadow>
        <sphereGeometry args={[0.46, 32, 32]} />
        {plasticMat(c.body)}
      </mesh>

      {/* Arms – short capsules */}
      <mesh position={[-0.44, 0.46, 0]} rotation={[0, 0, 0.8]} castShadow>
        <capsuleGeometry args={[0.09, 0.2, 8, 16]} />
        {plasticMat(c.arms)}
      </mesh>
      <mesh position={[0.44, 0.46, 0]} rotation={[0, 0, -0.8]} castShadow>
        <capsuleGeometry args={[0.09, 0.2, 8, 16]} />
        {plasticMat(c.arms)}
      </mesh>

      {/* Stubby legs */}
      <mesh position={[-0.14, 0.1, 0]} castShadow>
        <capsuleGeometry args={[0.09, 0.14, 6, 14]} />
        {plasticMat(c.legs)}
      </mesh>
      <mesh position={[0.14, 0.1, 0]} castShadow>
        <capsuleGeometry args={[0.09, 0.14, 6, 14]} />
        {plasticMat(c.legs)}
      </mesh>
      {/* Boots */}
      <mesh
        position={[-0.14, -0.04, -0.05]}
        scale={[1.0, 0.65, 1.2]}
        castShadow
      >
        <sphereGeometry args={[0.11, 14, 14]} />
        {plasticMat(c.shoes)}
      </mesh>
      <mesh position={[0.14, -0.04, -0.05]} scale={[1.0, 0.65, 1.2]} castShadow>
        <sphereGeometry args={[0.11, 14, 14]} />
        {plasticMat(c.shoes)}
      </mesh>

      {/* Front badge */}
      <mesh position={[0, 0.52, -0.44]} castShadow>
        <sphereGeometry args={[0.1, 18, 18]} />
        {plasticMat(c.center)}
      </mesh>
    </group>
  );
}

// ─── CAPSULE CHARACTER (like the tall green one in the image) ──────────────────
function CapsuleCharacter() {
  const c = COLORS.capsule;
  return (
    <group>
      {/* Tall pill body */}
      <mesh position={[0, 0.72, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.58, 12, 28]} />
        {plasticMat(c.body)}
      </mesh>

      {/* Arms */}
      <mesh position={[-0.44, 0.56, 0]} rotation={[0, 0, 0.55]} castShadow>
        <capsuleGeometry args={[0.1, 0.25, 8, 18]} />
        {plasticMat(c.arms)}
      </mesh>
      <mesh position={[0.44, 0.56, 0]} rotation={[0, 0, -0.55]} castShadow>
        <capsuleGeometry args={[0.1, 0.25, 8, 18]} />
        {plasticMat(c.arms)}
      </mesh>

      {/* Legs */}
      <mesh position={[-0.15, 0.12, 0]} castShadow>
        <capsuleGeometry args={[0.09, 0.17, 6, 14]} />
        {plasticMat(c.legs)}
      </mesh>
      <mesh position={[0.15, 0.12, 0]} castShadow>
        <capsuleGeometry args={[0.09, 0.17, 6, 14]} />
        {plasticMat(c.legs)}
      </mesh>
      {/* Boots */}
      <mesh
        position={[-0.15, -0.04, -0.05]}
        scale={[1.0, 0.65, 1.2]}
        castShadow
      >
        <sphereGeometry args={[0.11, 14, 14]} />
        {plasticMat(c.shoes)}
      </mesh>
      <mesh position={[0.15, -0.04, -0.05]} scale={[1.0, 0.65, 1.2]} castShadow>
        <sphereGeometry args={[0.11, 14, 14]} />
        {plasticMat(c.shoes)}
      </mesh>

      {/* Front badge */}
      <mesh position={[0, 0.7, -0.31]} castShadow>
        <sphereGeometry args={[0.09, 16, 16]} />
        {plasticMat(c.center)}
      </mesh>
    </group>
  );
}

// ─── ANIMATED WRAPPER ──────────────────────────────────────────────────────────
export function Character({
  type,
  position,
  targetPosition,
  state,
  label: _label,
  queueIndex = 0,
}: CharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const currentPos = useRef(new THREE.Vector3(...position));

  // per-character animation offset so they don't all move in sync
  const offset =
    queueIndex * 1.3 + (type === "oval" ? 0 : type === "sphere" ? 2.1 : 4.4);

  useFrame((_, delta) => {
    if (!groupRef.current || !bodyRef.current) return;

    // ── smooth movement toward target ──
    const target = new THREE.Vector3(...targetPosition);
    currentPos.current.lerp(target, Math.min(delta * 3.5, 1));
    groupRef.current.position.copy(currentPos.current);

    const t = Date.now() * 0.001 + offset;

    if (state === "waiting") {
      // gentle idle bounce
      const bounce = Math.sin(t * 1.6) * 0.018;
      groupRef.current.position.y += bounce;

      // subtle sway left/right (impatient waiting)
      const sway = Math.sin(t * 0.8) * 0.022;
      bodyRef.current.rotation.z = sway;

      // very slight forward lean then back
      const lean = Math.sin(t * 0.55 + 1.2) * 0.015;
      bodyRef.current.rotation.x = lean;

      // tiny weight-shift (scale asymmetry)
      const squish = 1 + Math.sin(t * 1.6) * 0.012;
      bodyRef.current.scale.set(squish, 2 - squish + 0.006, squish);
    } else if (state === "arriving") {
      // hop in from the side
      const hopBounce = Math.abs(Math.sin(t * 4)) * 0.08;
      groupRef.current.position.y += hopBounce;
      bodyRef.current.rotation.z = Math.sin(t * 4) * 0.06;
      bodyRef.current.scale.set(1, 1, 1);
    } else if (state === "serving") {
      // happy wiggle at the front of the queue
      const wiggle = Math.sin(t * 3.2) * 0.05;
      bodyRef.current.rotation.z = wiggle;
      const jump = Math.abs(Math.sin(t * 2.4)) * 0.03;
      groupRef.current.position.y += jump;
      bodyRef.current.scale.set(1, 1, 1);
    } else if (state === "departing") {
      // lean forward as they walk away
      bodyRef.current.rotation.x = -0.18;
      const stepBounce = Math.abs(Math.sin(t * 5)) * 0.05;
      groupRef.current.position.y += stepBounce;
      bodyRef.current.scale.set(1, 1, 1);
    } else {
      bodyRef.current.rotation.set(0, 0, 0);
      bodyRef.current.scale.set(1, 1, 1);
    }
  });

  const renderCharacter = () => {
    switch (type) {
      case "oval":
        return <OvalCharacter />;
      case "sphere":
        return <SphereCharacter />;
      case "capsule":
        return <CapsuleCharacter />;
      default:
        return <OvalCharacter />;
    }
  };

  return (
    <group ref={groupRef} position={position}>
      <group ref={bodyRef}>{renderCharacter()}</group>
    </group>
  );
}

export default Character;
