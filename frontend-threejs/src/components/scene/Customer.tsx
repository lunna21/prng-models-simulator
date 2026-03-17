import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CustomerMeshProps {
  position: [number, number, number];
  targetPosition: [number, number, number];
  state: 'waiting' | 'serving' | 'departing' | 'arriving';
  label: string;
}

const STATE_COLORS: Record<string, string> = {
  waiting: '#f59e0b',   // amber
  serving: '#3b82f6',   // blue
  departing: '#10b981', // green
  arriving: '#8b5cf6',  // purple
};

export function CustomerMesh({ position, targetPosition, state, label: _label }: CustomerMeshProps) {
  const meshRef = useRef<THREE.Group>(null);
  const currentPos = useRef(new THREE.Vector3(...position));

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const target = new THREE.Vector3(...targetPosition);
    currentPos.current.lerp(target, Math.min(delta * 3, 1));
    meshRef.current.position.copy(currentPos.current);
  });

  const color = STATE_COLORS[state] || '#9ca3af';

  return (
    <group ref={meshRef} position={position}>
      {/* Body */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <capsuleGeometry args={[0.2, 0.4, 4, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.05, 0]} castShadow>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

export default CustomerMesh;
