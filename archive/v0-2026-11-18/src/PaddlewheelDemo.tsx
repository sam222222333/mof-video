import {
  AbsoluteFill,
  interpolate,
  spring,
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

const Atom: React.FC<{ a: AtomData }> = ({ a }) => (
  <mesh position={[a.x, a.y, a.z]}>
    <sphereGeometry args={[RADII[a.e] ?? 0.15, 24, 24]} />
    <meshStandardMaterial
      color={COLORS[a.e] ?? "#999999"}
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

export const PaddlewheelDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const angle = interpolate(frame, [0, durationInFrames], [0.35, Math.PI * 1.15]);

  const titleIn = spring({
    frame: frame - 8,
    fps,
    config: { damping: 200 },
    durationInFrames: 30,
  });
  const subIn = spring({
    frame: frame - 30,
    fps,
    config: { damping: 200 },
    durationInFrames: 30,
  });
  const lineIn = spring({
    frame: frame - 48,
    fps,
    config: { damping: 200 },
    durationInFrames: 30,
  });

  const rise = (p: number) => interpolate(p, [0, 1], [40, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b1020" }}>
      <ThreeCanvas
        width={1920}
        height={1080}
        camera={{ position: [0, 0, 8.5], fov: 45 }}
      >
        <color attach="background" args={["#0b1020"]} />
        <ambientLight intensity={0.75} />
        <directionalLight position={[6, 8, 6]} intensity={1.4} />
        <pointLight position={[-6, -4, 5]} intensity={0.6} color="#4da3ff" />
        <group position={[1.05, 0.15, 0]} rotation={[0.25, angle, 0.08]}>
          {data.atoms.map((a, i) => (
            <Atom key={`a${i}`} a={a} />
          ))}
          {data.bonds.map(([i, j], k) => (
            <Bond key={`b${k}`} from={data.atoms[i]} to={data.atoms[j]} />
          ))}
        </group>
      </ThreeCanvas>

      <div style={{ position: "absolute", left: 84, top: 640, width: 760 }}>
        <div
          style={{
            opacity: titleIn,
            transform: `translateY(${rise(titleIn)}px)`,
            fontSize: 34,
            letterSpacing: 10,
            fontWeight: 700,
            color: "#4da3ff",
            fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          HKUST-1
        </div>
        <div
          style={{
            opacity: titleIn,
            transform: `translateY(${rise(titleIn)}px)`,
            fontSize: 76,
            fontWeight: 800,
            color: "#f2f5ff",
            marginTop: 14,
            lineHeight: 1.1,
            letterSpacing: -1,
            fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          The Cu₂ paddlewheel
        </div>
        <div
          style={{
            opacity: subIn,
            transform: `translateY(${rise(subIn)}px)`,
            fontSize: 30,
            color: "#9fb2d0",
            marginTop: 22,
            fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          d⁹ Cu²⁺ → Jahn–Teller elongation → open metal site
        </div>
        <div
          style={{
            opacity: lineIn,
            height: 3,
            width: interpolate(lineIn, [0, 1], [0, 220]),
            background: "linear-gradient(90deg, #4da3ff, #00e5ff)",
            marginTop: 30,
            borderRadius: 2,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
