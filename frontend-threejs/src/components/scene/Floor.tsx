interface FloorProps {
  width?: number;
  depth?: number;
}

export function Floor({ width = 20, depth = 16 }: FloorProps) {
  return (
    <group>
      {/* Main floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>

      {/* Floor grid lines */}
      <gridHelper
        args={[Math.max(width, depth), Math.max(width, depth), '#cbd5e1', '#e2e8f0']}
        position={[0, 0.01, 0]}
      />

      {/* Waiting area marker */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 3]} receiveShadow>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial color="#f1f5f9" transparent opacity={0.6} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 1.5, -depth / 2 + 0.05]}>
        <boxGeometry args={[width, 3, 0.1]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>

      {/* Side walls */}
      <mesh position={[-width / 2 + 0.05, 1.5, 0]}>
        <boxGeometry args={[0.1, 3, depth]} />
        <meshStandardMaterial color="#94a3b8" transparent opacity={0.3} />
      </mesh>
      <mesh position={[width / 2 - 0.05, 1.5, 0]}>
        <boxGeometry args={[0.1, 3, depth]} />
        <meshStandardMaterial color="#94a3b8" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

export default Floor;
