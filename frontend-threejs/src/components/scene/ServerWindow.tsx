interface ServerWindowProps {
  position: [number, number, number];
  busy: boolean;
  serverId: number;
}

export function ServerWindow({ position, busy, serverId: _serverId }: ServerWindowProps) {
  const color = busy ? '#ef4444' : '#22c55e'; // red when busy, green when idle
  const glassColor = busy ? '#fca5a5' : '#bbf7d0';

  return (
    <group position={position}>
      {/* Counter desk */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 1, 0.8]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>

      {/* Window frame / divider */}
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[1.9, 1.4, 0.1]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      {/* Glass */}
      <mesh position={[0, 1.6, 0.06]}>
        <boxGeometry args={[1.6, 1.1, 0.02]} />
        <meshStandardMaterial
          color={glassColor}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Status light */}
      <mesh position={[0.7, 2.4, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Server label */}
      <mesh position={[0, 2.5, 0.1]}>
        <planeGeometry args={[0.8, 0.3]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  );
}

export default ServerWindow;
