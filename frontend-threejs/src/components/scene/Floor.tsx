import { useMemo } from "react";
import * as THREE from "three";

interface FloorProps {
  width?: number;
  depth?: number;
}

// ─── Tile texture: beveled large cream tiles ──────────────────────────────
function createTileTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d")!;

  const tileSize = 256;

  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      const x = col * tileSize;
      const y = row * tileSize;
      const lum = 244 + Math.floor(Math.random() * 8);
      ctx.fillStyle = `rgb(${lum},${lum - 1},${lum - 3})`;
      ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);

      // Bevel highlight top-left
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + 4, y + tileSize - 4);
      ctx.lineTo(x + 4, y + 4);
      ctx.lineTo(x + tileSize - 4, y + 4);
      ctx.stroke();

      // Bevel shadow bottom-right
      ctx.strokeStyle = "rgba(0,0,0,0.05)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + tileSize - 4, y + 4);
      ctx.lineTo(x + tileSize - 4, y + tileSize - 4);
      ctx.lineTo(x + 4, y + tileSize - 4);
      ctx.stroke();
    }
  }

  // Grout lines
  ctx.strokeStyle = "#D4CEC6";
  ctx.lineWidth = 4;
  for (let x = 0; x <= 1024; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }
  for (let y = 0; y <= 1024; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

// ─── Counter area tile: warm lavanda tint ────────────────────────────────
function createCounterTileTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  const tileSize = 128;
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      const x = col * tileSize;
      const y = row * tileSize;
      ctx.fillStyle = "#E2D8F0";
      ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 4, y + tileSize - 4);
      ctx.lineTo(x + 4, y + 4);
      ctx.lineTo(x + tileSize - 4, y + 4);
      ctx.stroke();
    }
  }
  ctx.strokeStyle = "#C8BED8";
  ctx.lineWidth = 4;
  for (let x = 0; x <= 512; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y <= 512; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 2);
  return texture;
}

// ─── Wall gradient: deep lilac → soft mint ───────────────────────────────
function createWallGradientTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d")!;

  const gradient = ctx.createLinearGradient(0, 0, 0, 1024);
  gradient.addColorStop(0.0, "#B8A8DC");
  gradient.addColorStop(0.26, "#CBBBEA");
  gradient.addColorStop(0.52, "#D7CAEE");
  gradient.addColorStop(0.76, "#C5E2D3");
  gradient.addColorStop(1.0, "#ABD9BA");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 1024);

  // Star speckles on upper half
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  const stars: [number, number, number][] = [
    [40, 55, 3],
    [110, 28, 2.5],
    [175, 75, 2],
    [240, 38, 3],
    [310, 90, 2],
    [380, 22, 2.5],
    [450, 65, 2],
    [60, 130, 2],
    [200, 115, 3],
    [340, 140, 2],
    [480, 110, 2.5],
    [90, 185, 2],
    [270, 170, 2.5],
    [420, 195, 2],
  ];
  for (const [sx, sy, sr] of stars) {
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}

// ─── Carpet texture: mint green with weave lines ─────────────────────────
function createCarpetTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#72C99C";
  ctx.fillRect(0, 0, 256, 512);

  // Edge vignette
  const cg = ctx.createLinearGradient(0, 0, 256, 0);
  cg.addColorStop(0, "rgba(0,0,0,0.10)");
  cg.addColorStop(0.12, "rgba(0,0,0,0)");
  cg.addColorStop(0.88, "rgba(0,0,0,0)");
  cg.addColorStop(1, "rgba(0,0,0,0.10)");
  ctx.fillStyle = cg;
  ctx.fillRect(0, 0, 256, 512);

  // Horizontal weave
  ctx.strokeStyle = "rgba(255,255,255,0.14)";
  ctx.lineWidth = 1.5;
  for (let y = 8; y < 512; y += 10) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }

  return new THREE.CanvasTexture(canvas);
}

// ─── Queue post ───────────────────────────────────────────────────────────
function QueuePost({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.05, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.18, 0.2, 0.1, 22]} />
        <meshPhysicalMaterial
          color="#DCC882"
          roughness={0.36}
          metalness={0}
          clearcoat={0.55}
        />
      </mesh>
      <mesh position={[0, 0.54, 0]} castShadow>
        <cylinderGeometry args={[0.036, 0.04, 0.9, 14]} />
        <meshPhysicalMaterial
          color="#EAD898"
          roughness={0.3}
          metalness={0}
          clearcoat={0.65}
        />
      </mesh>
      <mesh position={[0, 1.01, 0]} castShadow>
        <sphereGeometry args={[0.082, 20, 20]} />
        <meshPhysicalMaterial
          color="#EAD898"
          roughness={0.25}
          metalness={0}
          clearcoat={0.75}
        />
      </mesh>
    </group>
  );
}

// ─── Queue rope ───────────────────────────────────────────────────────────
function QueueRope({
  from,
  to,
  sag = 0.07,
}: {
  from: [number, number, number];
  to: [number, number, number];
  sag?: number;
}) {
  const geo = useMemo(() => {
    const mid = new THREE.Vector3(
      (from[0] + to[0]) / 2,
      (from[1] + to[1]) / 2 - sag,
      (from[2] + to[2]) / 2,
    );
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(...from),
      mid,
      new THREE.Vector3(...to),
    ]);
    return new THREE.TubeGeometry(curve, 28, 0.026, 8, false);
  }, [from, to, sag]);

  return (
    <mesh geometry={geo} castShadow>
      <meshPhysicalMaterial
        color="#7BBFDB"
        roughness={0.42}
        metalness={0}
        clearcoat={0.45}
      />
    </mesh>
  );
}

// ─── Foot markers ─────────────────────────────────────────────────────────
function FootMarkers({ z }: { z: number }) {
  return (
    <>
      {([-1.2, 0, 1.2] as number[]).map((x) => (
        <mesh
          key={x}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[x, 0.025, z]}
          receiveShadow
        >
          <planeGeometry args={[0.32, 0.2]} />
          <meshPhysicalMaterial
            color="#FFFFFF"
            roughness={0.3}
            metalness={0}
            clearcoat={0.7}
            opacity={0.9}
            transparent
          />
        </mesh>
      ))}
    </>
  );
}

// ─── Dividing step between queue zone and counter zone ───────────────────
function CounterStep() {
  return (
    <group>
      {/* Full-width raised step */}
      <mesh position={[0, 0.048, -1.35]} castShadow receiveShadow>
        <boxGeometry args={[14, 0.096, 0.3]} />
        <meshPhysicalMaterial
          color="#C0B0D4"
          roughness={0.4}
          metalness={0}
          clearcoat={0.4}
        />
      </mesh>
      {/* Gold nosing strip */}
      <mesh position={[0, 0.1, -1.22]} castShadow>
        <boxGeometry args={[14, 0.022, 0.055]} />
        <meshPhysicalMaterial
          color="#E0C87A"
          roughness={0.26}
          metalness={0.05}
          clearcoat={0.72}
        />
      </mesh>
    </group>
  );
}

// ─── Puffy decoration tree ────────────────────────────────────────────────
function DecorationTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Pot body */}
      <mesh position={[0, 0.26, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.2, 0.52, 22]} />
        <meshPhysicalMaterial
          color="#F2EEE8"
          roughness={0.38}
          clearcoat={0.55}
        />
      </mesh>
      {/* Pot rim */}
      <mesh position={[0, 0.54, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.26, 0.07, 22]} />
        <meshPhysicalMaterial
          color="#E8E2DC"
          roughness={0.38}
          clearcoat={0.4}
        />
      </mesh>
      {/* Trunk */}
      <mesh position={[0, 0.92, 0]} castShadow>
        <cylinderGeometry args={[0.072, 0.1, 0.8, 12]} />
        <meshPhysicalMaterial color="#9C7C50" roughness={0.68} />
      </mesh>
      {/* Main canopy */}
      <mesh position={[0, 1.54, 0]} castShadow>
        <sphereGeometry args={[0.56, 22, 22]} />
        <meshPhysicalMaterial
          color="#48B870"
          roughness={0.42}
          clearcoat={0.38}
        />
      </mesh>
      {/* Secondary puff clusters */}
      <mesh position={[0.24, 1.44, 0.14]} castShadow>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshPhysicalMaterial
          color="#5ACC80"
          roughness={0.42}
          clearcoat={0.32}
        />
      </mesh>
      <mesh position={[-0.2, 1.4, -0.1]} castShadow>
        <sphereGeometry args={[0.26, 14, 14]} />
        <meshPhysicalMaterial
          color="#42B268"
          roughness={0.44}
          clearcoat={0.3}
        />
      </mesh>
    </group>
  );
}

// ─── Wall picture frames ──────────────────────────────────────────────────
function WallFrames() {
  const frames = [
    {
      x: -4.45,
      y: 1.25,
      z: -0.03,
      innerColor: "#C8DEBA",
      accent: "#8FD1A7",
      w: 1.36,
      h: 1.18,
      rot: -0.11,
    },
    {
      x: -1.85,
      y: 0.88,
      z: 0.02,
      innerColor: "#BED4DC",
      accent: "#7BBFDB",
      w: 1.2,
      h: 0.96,
      rot: 0.08,
    },
    {
      x: 1.85,
      y: 1.08,
      z: -0.01,
      innerColor: "#D4C8B8",
      accent: "#E8C87A",
      w: 1.22,
      h: 0.95,
      rot: -0.07,
    },
    {
      x: 4.55,
      y: 0.82,
      z: 0.03,
      innerColor: "#C8C4DC",
      accent: "#AFA2E8",
      w: 1.34,
      h: 1.02,
      rot: 0.12,
    },
  ];

  return (
    <group position={[0, 2.4, -7.88]}>
      {frames.map(({ x, y, z, innerColor, accent, w, h, rot }, i) => (
        <group key={x} position={[x, y, z]} rotation={[0, 0, rot]}>
          {/* Soft shadow plate */}
          <mesh position={[0.04, -0.04, -0.03]}>
            <boxGeometry args={[w + 0.2, h + 0.2, 0.04]} />
            <meshStandardMaterial color="#9f8eb7" transparent opacity={0.2} />
          </mesh>

          {/* Outer chunky frame */}
          <mesh castShadow>
            <boxGeometry args={[w + 0.2, h + 0.2, 0.1]} />
            <meshPhysicalMaterial
              color="#E8DACA"
              roughness={0.36}
              metalness={0}
              clearcoat={0.45}
            />
          </mesh>

          {/* Inner bezel */}
          <mesh position={[0, 0, 0.04]} castShadow>
            <boxGeometry args={[w + 0.08, h + 0.08, 0.05]} />
            <meshPhysicalMaterial
              color="#F3E8D8"
              roughness={0.3}
              metalness={0}
              clearcoat={0.52}
            />
          </mesh>

          {/* Art panel */}
          <mesh position={[0, 0, 0.075]}>
            <planeGeometry args={[w, h]} />
            <meshPhysicalMaterial
              color={innerColor}
              roughness={0.28}
              metalness={0}
              clearcoat={0.6}
            />
          </mesh>

          {/* Accent stripe */}
          <mesh position={[0, h * 0.24, 0.082]}>
            <planeGeometry args={[w * 0.62, h * 0.12]} />
            <meshStandardMaterial color={accent} />
          </mesh>

          {/* Central icon per frame */}
          {i === 0 && (
            <group position={[0, -0.04, 0.09]}>
              <mesh position={[-0.09, 0.05, 0]}>
                <sphereGeometry args={[0.08, 14, 14]} />
                <meshPhysicalMaterial
                  color="#91DDA8"
                  roughness={0.32}
                  clearcoat={0.7}
                />
              </mesh>
              <mesh position={[0.09, 0.05, 0]}>
                <sphereGeometry args={[0.08, 14, 14]} />
                <meshPhysicalMaterial
                  color="#91DDA8"
                  roughness={0.32}
                  clearcoat={0.7}
                />
              </mesh>
              <mesh position={[0, -0.02, 0]} rotation={[0, 0, Math.PI / 4]}>
                <boxGeometry args={[0.12, 0.12, 0.05]} />
                <meshPhysicalMaterial
                  color="#91DDA8"
                  roughness={0.32}
                  clearcoat={0.7}
                />
              </mesh>
            </group>
          )}

          {i === 1 && (
            <group position={[0.02, -0.02, 0.09]}>
              <mesh position={[-0.06, 0, 0]} rotation={[0, 0, 0.65]}>
                <boxGeometry args={[0.03, 0.11, 0.03]} />
                <meshPhysicalMaterial
                  color="#FFFFFF"
                  roughness={0.24}
                  clearcoat={0.45}
                />
              </mesh>
              <mesh position={[0.02, 0.02, 0]} rotation={[0, 0, -0.8]}>
                <boxGeometry args={[0.03, 0.19, 0.03]} />
                <meshPhysicalMaterial
                  color="#FFFFFF"
                  roughness={0.24}
                  clearcoat={0.45}
                />
              </mesh>
            </group>
          )}

          {i === 2 && (
            <mesh position={[0, -0.02, 0.09]} rotation={[0.1, 0.15, 0.4]}>
              <torusGeometry args={[0.1, 0.03, 10, 20]} />
              <meshPhysicalMaterial
                color="#F7E3A1"
                roughness={0.28}
                clearcoat={0.6}
              />
            </mesh>
          )}

          {i === 3 && (
            <group position={[0, -0.02, 0.09]}>
              <mesh rotation={[0, 0, 0.2]}>
                <tetrahedronGeometry args={[0.095, 0]} />
                <meshPhysicalMaterial
                  color="#C6B9F2"
                  roughness={0.32}
                  clearcoat={0.65}
                />
              </mesh>
              <mesh position={[0, 0, 0.02]} rotation={[0, 0, -0.25]}>
                <tetrahedronGeometry args={[0.05, 0]} />
                <meshPhysicalMaterial
                  color="#FFFFFF"
                  roughness={0.3}
                  clearcoat={0.52}
                />
              </mesh>
            </group>
          )}

          {/* Bottom peg accent */}
          <mesh position={[0, -(h * 0.5) - 0.08, 0.02]} castShadow>
            <cylinderGeometry args={[0.05, 0.06, 0.08, 14]} />
            <meshPhysicalMaterial
              color="#EAD7BE"
              roughness={0.34}
              clearcoat={0.4}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── Ceiling light with soft glow halo ───────────────────────────────────
function CeilingLight({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[2.4, 0.07, 0.32]} />
        <meshPhysicalMaterial
          color="#FFF8D8"
          emissive="#FFECAA"
          emissiveIntensity={0.65}
          roughness={0.18}
          clearcoat={0.75}
        />
      </mesh>
      {/* Glow halo plane beneath */}
      <mesh position={[0, -0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.8, 0.55]} />
        <meshStandardMaterial
          color="#FFF5CC"
          emissive="#FFF5CC"
          emissiveIntensity={0.4}
          transparent
          opacity={0.16}
        />
      </mesh>
    </group>
  );
}

// ─── Skirting boards along back wall ─────────────────────────────────────
function Skirting({ width }: { width: number }) {
  return (
    <>
      <mesh position={[0, 0.12, -7.72]} castShadow>
        <boxGeometry args={[width, 0.24, 0.08]} />
        <meshPhysicalMaterial
          color="#D4C8DC"
          roughness={0.42}
          clearcoat={0.38}
        />
      </mesh>
      <mesh position={[0, 0.25, -7.7]} castShadow>
        <boxGeometry args={[width, 0.025, 0.05]} />
        <meshPhysicalMaterial
          color="#E8DFF0"
          roughness={0.28}
          clearcoat={0.6}
        />
      </mesh>
    </>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────
export function Floor({ width = 20, depth = 16 }: FloorProps) {
  const tileTexture = useMemo(() => createTileTexture(), []);
  const counterTileTexture = useMemo(() => createCounterTileTexture(), []);
  const wallGradTexture = useMemo(() => createWallGradientTexture(), []);
  const carpetTexture = useMemo(() => createCarpetTexture(), []);

  const postsLeft: Array<[number, number, number]> = [
    [-2.4, 0, 6.0],
    [-2.4, 0, 3.5],
    [-2.4, 0, 1.0],
  ];
  const postsRight: Array<[number, number, number]> = [
    [2.4, 0, 6.0],
    [2.4, 0, 3.5],
    [2.4, 0, 1.0],
  ];

  return (
    <group>
      {/* ── MAIN FLOOR TILES ─────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial map={tileTexture} />
      </mesh>

      {/* ── COUNTER AREA FLOOR — lavanda tile ────────────────── */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, -3.8]}
        receiveShadow
      >
        <planeGeometry args={[width, 8.5]} />
        <meshStandardMaterial map={counterTileTexture} />
      </mesh>

      {/* ── DIVIDING STEP ────────────────────────────────────── */}
      <CounterStep />

      {/* ── GREEN CARPET RUNNER ──────────────────────────────── */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.012, 3.2]}
        receiveShadow
      >
        <planeGeometry args={[4.2, 8.5]} />
        <meshPhysicalMaterial
          map={carpetTexture}
          roughness={0.52}
          metalness={0}
          clearcoat={0.12}
        />
      </mesh>
      {/* Carpet edge bars */}
      {([-2.2, 2.2] as number[]).map((x) => (
        <mesh key={x} position={[x, 0.018, 3.2]} receiveShadow castShadow>
          <boxGeometry args={[0.065, 0.036, 8.5]} />
          <meshPhysicalMaterial color="#58A882" roughness={0.48} />
        </mesh>
      ))}

      {/* ── FOOT MARKERS on carpet ───────────────────────────── */}
      <FootMarkers z={5.2} />
      <FootMarkers z={3.5} />
      <FootMarkers z={1.8} />
      <FootMarkers z={0.1} />

      {/* ── QUEUE POSTS & ROPES ──────────────────────────────── */}
      {postsLeft.map((pos, i) => (
        <QueuePost key={`L${i}`} position={pos} />
      ))}
      {postsRight.map((pos, i) => (
        <QueuePost key={`R${i}`} position={pos} />
      ))}

      <QueueRope from={[-2.4, 1.01, 6.0]} to={[-2.4, 1.01, 3.5]} />
      <QueueRope from={[-2.4, 1.01, 3.5]} to={[-2.4, 1.01, 1.0]} />
      <QueueRope from={[2.4, 1.01, 6.0]} to={[2.4, 1.01, 3.5]} />
      <QueueRope from={[2.4, 1.01, 3.5]} to={[2.4, 1.01, 1.0]} />

      {/* ── BACK WALL ────────────────────────────────────────── */}
      <mesh position={[0, 3.8, -(depth / 2) + 0.06]}>
        <planeGeometry args={[width, 9]} />
        <meshStandardMaterial map={wallGradTexture} side={THREE.FrontSide} />
      </mesh>

      {/* ── SIDE WALLS ───────────────────────────────────────── */}
      <mesh
        position={[-(width / 2) + 0.06, 3.8, 0]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[depth, 9]} />
        <meshStandardMaterial map={wallGradTexture} side={THREE.FrontSide} />
      </mesh>
      <mesh
        position={[width / 2 - 0.06, 3.8, 0]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <planeGeometry args={[depth, 9]} />
        <meshStandardMaterial map={wallGradTexture} side={THREE.FrontSide} />
      </mesh>

      {/* ── SKIRTING BOARDS ──────────────────────────────────── */}
      <Skirting width={width} />

      {/* ── CEILING LIGHTS ───────────────────────────────────── */}
      <CeilingLight position={[-1.4, 5.5, -2.5]} />
      <CeilingLight position={[1.4, 5.5, -2.5]} />
      <CeilingLight position={[0.0, 5.5, 1.5]} />

      {/* ── DECORATION TREES ─────────────────────────────────── */}
      <DecorationTree position={[-8.2, 0, 5.0]} />
      <DecorationTree position={[8.2, 0, 5.0]} />
      <DecorationTree position={[-8.2, 0, -1.5]} />
      <DecorationTree position={[8.2, 0, -1.5]} />

      {/* ── WALL FRAMES ──────────────────────────────────────── */}
      <WallFrames />
    </group>
  );
}

export default Floor;
