interface ServerWindowProps {
  position: [number, number, number];
  busy: boolean;
  serverId: number;
}

export function ServerWindow({ position, busy, serverId: _serverId }: ServerWindowProps) {
  const statusColor = busy ? '#FF6B9D' : '#2ECC71';
  const glassColor = busy ? '#ffccd5' : '#ccf5e0';

  return (
    <group position={position}>
      {/* Counter desk - soft gray with warm tint */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 1, 0.8]} />
        <meshPhysicalMaterial
          color="#d8d0e0"
          roughness={0.4}
          metalness={0.0}
          clearcoat={0.3}
        />
      </mesh>

      {/* Window frame / divider - soft purple */}
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[1.9, 1.4, 0.1]} />
        <meshPhysicalMaterial
          color="#a898c8"
          roughness={0.35}
          metalness={0.0}
          clearcoat={0.5}
        />
      </mesh>

      {/* Glass - soft transparent */}
      <mesh position={[0, 1.6, 0.06]}>
        <boxGeometry args={[1.6, 1.1, 0.02]} />
        <meshPhysicalMaterial
          color={glassColor}
          transparent
          opacity={0.25}
          roughness={0.1}
          metalness={0.0}
          clearcoat={1}
        />
      </mesh>

      {/* Status light - bubble style */}
      <mesh position={[0.7, 2.4, 0]} castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshPhysicalMaterial
          color={statusColor}
          emissive={statusColor}
          emissiveIntensity={0.4}
          roughness={0.2}
          metalness={0.0}
          clearcoat={1}
        />
      </mesh>

      {/* Server label - soft dark */}
      <mesh position={[0, 2.5, 0.1]}>
        <planeGeometry args={[0.8, 0.3]} />
        <meshStandardMaterial color="#4a4060" />
      </mesh>
    </group>
  );
}

export default ServerWindow;
