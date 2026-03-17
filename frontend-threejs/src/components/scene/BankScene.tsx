import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useStore } from '@/store/store';
import { Floor } from './Floor';
import { ServerWindow } from './ServerWindow';
import { CustomerMesh } from './Customer';

function computeServerPositions(count: number): [number, number, number][] {
  const spacing = 2.5;
  const totalWidth = (count - 1) * spacing;
  const startX = -totalWidth / 2;
  return Array.from({ length: count }, (_, i) => [
    startX + i * spacing,
    0,
    -5,
  ] as [number, number, number]);
}

function computeQueuePositions(count: number): [number, number, number][] {
  const positions: [number, number, number][] = [];
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / 4);
    const col = i % 4;
    positions.push([
      -2 + col * 1.2,
      0,
      2 + row * 1.2,
    ]);
  }
  return positions;
}

function computeServingPosition(serverPos: [number, number, number]): [number, number, number] {
  return [serverPos[0], 0, serverPos[2] + 1.5];
}

function computeDepartPosition(): [number, number, number] {
  return [8, 0, 6];
}

function SceneContent() {
  const simConfig = useStore((s) => s.simConfig);
  const simResult = useStore((s) => s.simResult);
  const currentEventIndex = useStore((s) => s.currentEventIndex);

  const serverCount = simConfig.servers;
  const serverPositions = computeServerPositions(serverCount);

  // Get current snapshot
  const snapshot = simResult?.snapshots[currentEventIndex] ?? null;

  // Determine server busy states
  const serverBusy = snapshot
    ? snapshot.servers.map((s) => s.busy)
    : new Array(serverCount).fill(false);

  // Compute customer positions based on snapshot
  const customerElements: React.ReactElement[] = [];

  if (snapshot) {
    // Customers being served
    for (const server of snapshot.servers) {
      if (server.busy && server.currentCustomer !== null) {
        const srvPos = serverPositions[server.id - 1];
        if (srvPos) {
          const servingPos = computeServingPosition(srvPos);
          customerElements.push(
            <CustomerMesh
              key={`serving-${server.currentCustomer}`}
              position={servingPos}
              targetPosition={servingPos}
              state="serving"
              label={`C${server.currentCustomer}`}
            />
          );
        }
      }
    }

    // Customers in queue
    const queuePositions = computeQueuePositions(snapshot.queue.length);
    snapshot.queue.forEach((custId, idx) => {
      const qPos = queuePositions[idx];
      if (qPos) {
        customerElements.push(
          <CustomerMesh
            key={`queue-${custId}`}
            position={qPos}
            targetPosition={qPos}
            state="waiting"
            label={`C${custId}`}
          />
        );
      }
    });

    // Show recent departures (from current event)
    if (snapshot.currentEvent?.type === 'DEPARTURE') {
      const departPos = computeDepartPosition();
      customerElements.push(
        <CustomerMesh
          key={`depart-${snapshot.currentEvent.customerId}`}
          position={departPos}
          targetPosition={[departPos[0] + 3, departPos[1], departPos[2]]}
          state="departing"
          label={`C${snapshot.currentEvent.customerId}`}
        />
      );
    }

    // Show arriving customer
    if (snapshot.currentEvent?.type === 'ARRIVAL') {
      const arrivingId = snapshot.currentEvent.customerId;
      // Check if not already shown (serving or queue)
      const alreadyShown =
        snapshot.servers.some((s) => s.currentCustomer === arrivingId) ||
        snapshot.queue.includes(arrivingId);
      if (!alreadyShown) {
        customerElements.push(
          <CustomerMesh
            key={`arrive-${arrivingId}`}
            position={[-8, 0, 6]}
            targetPosition={[0, 0, 4]}
            state="arriving"
            label={`C${arrivingId}`}
          />
        );
      }
    }
  }

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-3, 8, -3]} intensity={0.3} />

      {/* Floor */}
      <Floor />

      {/* Server windows */}
      {serverPositions.map((pos, i) => (
        <ServerWindow
          key={`server-${i}`}
          position={pos}
          busy={serverBusy[i] ?? false}
          serverId={i + 1}
        />
      ))}

      {/* Customers */}
      {customerElements}

      {/* Rope barriers for queue (decorative) */}
      {serverCount > 0 && (
        <group position={[0, 0, 1]}>
          {/* Left barrier post */}
          <mesh position={[-3, 0.4, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
            <meshStandardMaterial color="#854d0e" />
          </mesh>
          {/* Right barrier post */}
          <mesh position={[3, 0.4, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
            <meshStandardMaterial color="#854d0e" />
          </mesh>
        </group>
      )}

      {/* Camera controls */}
      <OrbitControls
        makeDefault
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={5}
        maxDistance={25}
      />
    </>
  );
}

export function BankScene() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 10, 14], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
    >
      <SceneContent />
    </Canvas>
  );
}

export default BankScene;
