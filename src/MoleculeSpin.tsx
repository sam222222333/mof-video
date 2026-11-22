import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";

const R_C = 1.4;
const R_H = 2.5;
const N = 6;

const ring = (r: number) =>
  Array.from({ length: N }, (_, i) => {
    const a = (i / N) * Math.PI * 2;
    return new THREE.Vector3(r * Math.cos(a), r * Math.sin(a), 0);
  });

const CARBONS = ring(R_C);
const HYDROGENS = ring(R_H);

const Atom: React.FC<{ pos: THREE.Vector3; color: string; radius: number }> = ({
  pos,
  color,
  radius,
}) => (
  <mesh position={pos}>
    <sphereGeometry args={[radius, 32, 32]} />
    <meshStandardMaterial color={color} roughness={0.3} metalness={0.15} />
  </mesh>
);

const Bond: React.FC<{ a: THREE.Vector3; b: THREE.Vector3; color: string }> = ({
  a,
  b,
  color,
}) => {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const dir = b.clone().sub(a);
  const len = dir.length();
  const q = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.clone().normalize(),
  );
  return (
    <mesh position={mid} quaternion={q}>
      <cylinderGeometry args={[0.08, 0.08, len, 16]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

export const MoleculeSpin: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const angle = (frame / 300) * Math.PI * 2;

  const titleIn = spring({
    frame: frame - 8,
    fps,
    config: { damping: 200 },
    durationInFrames: 35,
  });
  const subIn = spring({
    frame: frame - 34,
    fps,
    config: { damping: 200 },
    durationInFrames: 30,
  });
  const lineIn = spring({
    frame: frame - 50,
    fps,
    config: { damping: 200 },
    durationInFrames: 30,
  });

  const rise = (p: number) => interpolate(p, [0, 1], [46, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b1020" }}>
      <ThreeCanvas width={1080} height={1080} camera={{ position: [0, 0, 9], fov: 45 }}>
        <color attach="background" args={["#0b1020"]} />
        <ambientLight intensity={0.65} />
        <directionalLight position={[5, 8, 5]} intensity={1.3} />
        <pointLight position={[-5, -3, 4]} intensity={0.5} color="#4da3ff" />
        <group position={[2.5, 0.35, 0]} rotation={[0.35, angle, 0.1]}>
          {CARBONS.map((p, i) => (
            <Atom key={`c${i}`} pos={p} color="#2b2b2b" radius={0.32} />
          ))}
          {HYDROGENS.map((p, i) => (
            <Atom key={`h${i}`} pos={p} color="#e8e8e8" radius={0.18} />
          ))}
          {CARBONS.map((p, i) => (
            <Bond key={`cc${i}`} a={p} b={CARBONS[(i + 1) % N]} color="#8a8a8a" />
          ))}
          {CARBONS.map((p, i) => (
            <Bond key={`ch${i}`} a={p} b={HYDROGENS[i]} color="#5a5a5a" />
          ))}
        </group>
      </ThreeCanvas>

      <div style={{ position: "absolute", left: 72, top: 300, width: 540 }}>
        <div
          style={{
            opacity: titleIn,
            transform: `translateY(${rise(titleIn)}px)`,
            fontSize: 24,
            letterSpacing: 9,
            fontWeight: 700,
            color: "#4da3ff",
          }}
        >
          METAL–ORGANIC FRAMEWORKS
        </div>
        <div
          style={{
            opacity: titleIn,
            transform: `translateY(${rise(titleIn)}px)`,
            fontSize: 90,
            fontWeight: 800,
            lineHeight: 1.05,
            color: "#f2f5ff",
            marginTop: 22,
            letterSpacing: -1,
          }}
        >
          Built to hold
          <br />
          the future
        </div>
        <div
          style={{
            opacity: subIn,
            transform: `translateY(${rise(subIn)}px)`,
            fontSize: 30,
            color: "#8fa3c8",
            marginTop: 30,
          }}
        >
          Structure determines function
        </div>
        <div
          style={{
            opacity: lineIn,
            height: 3,
            width: interpolate(lineIn, [0, 1], [0, 180]),
            background: "linear-gradient(90deg, #4da3ff, #00e5ff)",
            marginTop: 36,
            borderRadius: 2,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
