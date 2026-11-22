import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import data from "./data/paddlewheel.json";

type AtomData = { e: string; x: number; y: number; z: number };

const COLORS: Record<string, string> = {
  Cu: "#4da3ff",
  O: "#e85d5d",
  C: "#9aa4b2",
  H: "#e8e8e8",
};

const RADII: Record<string, number> = {
  Cu: 0.30,
  O: 0.19,
  C: 0.16,
  H: 0.11,
};

const Atom: React.FC<{ a: AtomData; cuGlow: number }> = ({ a, cuGlow }) => (
  <mesh position={[a.x, a.y, a.z]}>
    <sphereGeometry args={[RADII[a.e] ?? 0.15, 24, 24]} />
    <meshStandardMaterial
      color={COLORS[a.e] ?? "#999999"}
      emissive={a.e === "Cu" ? "#4da3ff" : "#000000"}
      emissiveIntensity={a.e === "Cu" ? cuGlow : 0}
      roughness={0.34}
      metalness={0.12}
    />
  </mesh>
);

const Bond: React.FC<{ from: AtomData; to: AtomData }> = ({ from, to }) => {
  const start = new THREE.Vector3(from.x, from.y, from.z);
  const end = new THREE.Vector3(to.x, to.y, to.z);
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const dir = end.clone().sub(start);
  const len = dir.length();
  const q = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.clone().normalize(),
  );
  return (
    <mesh position={mid} quaternion={q}>
      <cylinderGeometry args={[0.065, 0.065, len, 12]} />
      <meshStandardMaterial color="#7c8798" roughness={0.5} />
    </mesh>
  );
};

/**
 * SHOT 01 — COLD OPEN (25 s, 750 frames)
 * Black -> structure fades in from darkness -> slow quarter turn ->
 * slow push-in on the two Cu atoms -> title fades in at 18 s.
 */
export const Shot01: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // fade the whole object in from black (1 s)
  const objOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // a quarter turn across the shot
  const angle = interpolate(
    frame,
    [0, durationInFrames],
    [0.30, 0.30 + Math.PI / 2],
    { extrapolateRight: "clamp" },
  );

  // slow push-in: camera comes closer over the whole shot
  const camZ = interpolate(frame, [0, durationInFrames], [9.4, 7.9], {
    extrapolateRight: "clamp",
  });

  // CO2 flash on the Cu atoms near the end
  const cuGlow = interpolate(frame, [600, 750], [0, 0.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // title appears at 18 s (540 frames)
  const titleIn = interpolate(frame, [540, 575], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(titleIn, [0, 1], [14, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      <AbsoluteFill style={{ opacity: objOpacity }}>
        <ThreeCanvas
          width={1920}
          height={1080}
          camera={{ position: [0, 0, camZ], fov: 45, near: 0.1, far: 100 }}
        >
          <color attach="background" args={["#000000"]} />
          <ambientLight intensity={0.55} />
          <directionalLight position={[5, 7, 6]} intensity={1.2} />
          <pointLight position={[-6, -3, 5]} intensity={0.5} color="#4da3ff" />
          <group position={[0.35, 0.1, 0]} rotation={[0.22, angle, 0.05]}>
            {data.atoms.map((a, i) => (
              <Atom key={`a${i}`} a={a} cuGlow={cuGlow} />
            ))}
            {data.bonds.map(([i, j], k) => (
              <Bond key={`b${k}`} from={data.atoms[i]} to={data.atoms[j]} />
            ))}
          </group>
        </ThreeCanvas>
      </AbsoluteFill>

      {/* title, bottom left */}
      <div
        style={{
          position: "absolute",
          left: 110,
          bottom: 130,
          opacity: titleIn,
          transform: `translateY(${titleY}px)`,
          fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 30,
            letterSpacing: 12,
            fontWeight: 700,
            color: "#4da3ff",
          }}
        >
          HKUST-1
        </div>
        <div
          style={{
            fontSize: 34,
            color: "#c8d4ea",
            marginTop: 12,
            fontWeight: 400,
            letterSpacing: 1,
          }}
        >
          a metal–organic framework
        </div>
      </div>
    </AbsoluteFill>
  );
};
