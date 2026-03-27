import React from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useStore } from "@/store/store";
import { Floor } from "./Floor";
import { Character, type CharacterType } from "./Character";
import OperatorCabin from "./OperatorCabin";

function computeServerPositions(count: number): [number, number, number][] {
  const spacing = 2.5;
  const totalWidth = (count - 1) * spacing;
  const startX = -totalWidth / 2;
  return Array.from(
    { length: count },
    (_, i) => [startX + i * spacing, 0, -5.5] as [number, number, number],
  );
}

function computeQueuePositions(count: number): [number, number, number][] {
  const positions: [number, number, number][] = [];
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / 3);
    const col = i % 3;
    positions.push([-1.5 + col * 1.5, 0, 1 + row * 1.5]);
  }
  return positions;
}

function computeServingPosition(
  serverPos: [number, number, number],
): [number, number, number] {
  return [serverPos[0], 0, serverPos[2] + 3.5];
}

function computeDepartPosition(): [number, number, number] {
  return [8, 0, 6];
}

const CHARACTER_TYPES: CharacterType[] = ["oval", "sphere", "capsule"];

function SceneContent() {
  const simConfig = useStore((s) => s.simConfig);
  const simResult = useStore((s) => s.simResult);
  const currentEventIndex = useStore((s) => s.currentEventIndex);

  const serverCount = simConfig.servers;
  const serverPositions = computeServerPositions(serverCount);

  const snapshot = simResult?.snapshots[currentEventIndex] ?? null;

  const serverBusy = snapshot
    ? snapshot.servers.map((s) => s.busy)
    : new Array(serverCount).fill(false);

  const customerElements: React.ReactElement[] = [];

  if (snapshot) {
    for (const server of snapshot.servers) {
      if (server.busy && server.currentCustomer !== null) {
        const srvPos = serverPositions[server.id - 1];
        if (srvPos) {
          const servingPos = computeServingPosition(srvPos);
          const charType = CHARACTER_TYPES[server.currentCustomer % 3];
          customerElements.push(
            <Character
              key={`serving-${server.currentCustomer}`}
              type={charType}
              position={servingPos}
              targetPosition={servingPos}
              state="serving"
            />,
          );
        }
      }
    }

    const queuePositions = computeQueuePositions(snapshot.queue.length);
    snapshot.queue.forEach((custId, idx) => {
      const qPos = queuePositions[idx];
      if (qPos) {
        const charType = CHARACTER_TYPES[custId % 3];
        customerElements.push(
          <Character
            key={`queue-${custId}`}
            type={charType}
            position={qPos}
            targetPosition={qPos}
            state="waiting"
          />,
        );
      }
    });

    if (snapshot.currentEvent?.type === "DEPARTURE") {
      const departPos = computeDepartPosition();
      const charType = CHARACTER_TYPES[snapshot.currentEvent.customerId % 3];
      customerElements.push(
        <Character
          key={`depart-${snapshot.currentEvent.customerId}`}
          type={charType}
          position={departPos}
          targetPosition={[departPos[0] + 3, departPos[1], departPos[2]]}
          state="departing"
        />,
      );
    }

    if (snapshot.currentEvent?.type === "ARRIVAL") {
      const arrivingId = snapshot.currentEvent.customerId;
      const alreadyShown =
        snapshot.servers.some((s) => s.currentCustomer === arrivingId) ||
        snapshot.queue.includes(arrivingId);
      if (!alreadyShown) {
        const charType = CHARACTER_TYPES[arrivingId % 3];
        customerElements.push(
          <Character
            key={`arrive-${arrivingId}`}
            type={charType}
            position={[-8, 0, 6]}
            targetPosition={[0, 0, 4]}
            state="arriving"
          />,
        );
      }
    }
  }

  return (
    <>
      {/* Soft studio lighting */}
      <ambientLight intensity={0.5} color="#e8e8ff" />
      <hemisphereLight args={["#b8d4e8", "#d4c4a8", 0.6]} />
      <directionalLight
        position={[5, 12, 5]}
        intensity={0.7}
        color="#fff5e6"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-radius={8}
        shadow-bias={-0.0001}
      />
      <directionalLight
        position={[-3, 8, -3]}
        intensity={0.3}
        color="#e0e8ff"
      />
      <pointLight position={[0, 6, 0]} intensity={0.4} color="#fff8f0" />

      {/* Floor with all world elements */}
      <Floor />

      {/* Operators at each server position */}
      {serverPositions.map((pos, i) => (
        <OperatorCabin
          key={`operator-${i}`}
          position={[pos[0], 0, pos[2]]}
          busy={serverBusy[i] ?? false}
        />
      ))}

      {/* Customers */}
      {customerElements}
      

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
      shadows={{ type: THREE.PCFSoftShadowMap }}
      camera={{ position: [0, 10, 14], fov: 50 }}
      style={{ width: "100%", height: "100%" }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
    >
      <color attach="background" args={["#e8e4f0"]} />
      <fog attach="fog" args={["#e8e4f0", 20, 50]} />
      <SceneContent />
    </Canvas>
  );
}

export default BankScene;
