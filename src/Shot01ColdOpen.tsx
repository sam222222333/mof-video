import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import data from "./data/paddlewheel.json";

type AtomData = { e: string; x: number; y: number; z: number };
type PaddleData = { atoms: AtomData[]; bonds: [number, number][] };

const pd = data as unknown as PaddleData;

const COLORS: Record<string, string> = {
  Cu: "#4da3ff",
  O: "#e8635f",
  C: "#8f9bab",
  H: "#dfe6ef",
};

const RADII: Record<string, number> = {
  Cu: 0.30,
  O: 0.19,
  C: 0.16,
  H: 0.11,
};

/** Self-illumination so atoms stay readable while the scene is still near-black. */
const SELF_LIT: Record<string, number> = {
  Cu: 1,
  O: 0.34,
  C: 0.16,
  H: 0.1,
};

const Atom: React.FC<{ a: AtomData; glow: number }> = ({ a, glow }) => {
  const selfLit = (SELF_LIT[a.e] ?? 0.2) * glow;
  return (
    <mesh position={[a.x, a.y, a.z]}>
      <sphereGeometry args={[RADII[a.e] ?? 0.15, 28, 28]} />
      <meshStandardMaterial
        color={COLORS[a.e] ?? "#999999"}
        roughness={a.e === "Cu" ? 0.26 : 0.42}
        metalness={a.e === "Cu" ? 0.28 : 0.1}
        emissive={a.e === "Cu" ? "#2f6bff" : COLORS[a.e] ?? "#8899aa"}
        emissiveIntensity={selfLit}
      />
    </mesh>
  );
};

const Bond: React.FC<{ from: AtomData; to: AtomData; glow: number }> = ({
  from,
  to,
  glow,
}) => {
  const start = new THREE.Vector3(from.x, from.y, from.z);
  const end = new THREE.Vector3(to.x, to.y, to.z);
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const dir = end.clone().sub(start);
  const len = dir.length();
  const q = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.clone().normalize(),
  );
  const touchesCu = from.e === "Cu" || to.e === "Cu";
  return (
    <mesh position={mid} quaternion={q}>
      <cylinderGeometry args={[touchesCu ? 0.07 : 0.058, touchesCu ? 0.07 : 0.058, len, 12]} />
      <meshStandardMaterial
        color={touchesCu ? "#5f7fae" : "#6b7686"}
        roughness={0.55}
        emissive="#2a4a7a"
        emissiveIntensity={0.18 * glow}
      />
    </mesh>
  );
};

export const Shot01ColdOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  /**
   * 0 – 1 s : absolute black.
   * 1 – 3 s : the object is lit out of the darkness (lights ramp, nothing moves fast).
   */
  const reveal = interpolate(frame, [30, 92], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  /** Roughly a quarter turn over the shot, eased so it drifts rather than spins. */
  const angle = interpolate(frame, [26, durationInFrames - 2], [-0.1, Math.PI / 2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });

  /** Very slow push-in — the shallow-DOF "breathing" of the shot. */
  const push = interpolate(frame, [24, durationInFrames], [1, 1.13], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  const drift = interpolate(frame, [0, durationInFrames], [0, -0.055], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const keyLight = 0.015 + reveal * 1.35;
  const ambient = 0.005 + reveal * 0.24;
  const rimLight = Math.pow(reveal, 1.25) * 2.1;
  const fillLight = Math.pow(reveal, 1.6) * 0.7;
  const glow = Math.pow(reveal, 2);

  /** On-screen credit, bottom left (script: fades in late in the shot). */
  const creditIn = interpolate(frame, [126, 164], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const creditRule = interpolate(frame, [134, 172], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const vignette = 0.55 + reveal * 0.45;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {/* --- 3D: single paddlewheel, lit out of black --- */}
      <AbsoluteFill
        style={{
          WebkitMaskImage:
            "radial-gradient(ellipse 76% 86% at 50% 48%, black 34%, transparent 96%)",
          maskImage:
            "radial-gradient(ellipse 76% 86% at 50% 48%, black 34%, transparent 96%)",
        }}
      >
        <ThreeCanvas
          width={width}
          height={height}
          camera={{ position: [0, 0, 8.6], fov: 42 }}
          gl={{ antialias: true, alpha: true }}
        >
          <color attach="background" args={["#000000"]} />
          <ambientLight intensity={ambient} />
          <directionalLight position={[4.5, 6.5, 7]} intensity={keyLight} color="#eaf2ff" />
          <directionalLight position={[-6, -2.5, 3]} intensity={fillLight} color="#5f8dff" />
          <pointLight position={[-3.4, 1.9, 4.2]} intensity={rimLight} color="#3f7dff" />
          <pointLight position={[3.6, -1.6, 3.4]} intensity={rimLight * 0.45} color="#6fa8ff" />
          <group
            position={[0, drift, 0]}
            scale={push}
            rotation={[0.24, angle, 0.06]}
          >
            {pd.atoms.map((a, i) => (
              <Atom key={`a${i}`} a={a} glow={glow} />
            ))}
            {pd.bonds.map(([i, j], k) => (
              <Bond key={`b${k}`} from={pd.atoms[i]} to={pd.atoms[j]} glow={glow} />
            ))}
          </group>
        </ThreeCanvas>
      </AbsoluteFill>

      {/* --- soft haze behind the object, reads as depth --- */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 30% 38% at 50% 47%, rgba(38,86,190,0.30) 0%, rgba(18,40,94,0.12) 45%, transparent 72%)",
          opacity: Math.pow(reveal, 1.5) * 0.9,
          mixBlendMode: "screen",
        }}
      />

      {/* --- shallow-DOF vignette: edges fall into the dark --- */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 58% 70% at 50% 47%, transparent 26%, rgba(0,0,0,0.45) 62%, rgba(0,0,0,0.92) 88%, #000 100%)",
          opacity: vignette,
        }}
      />

      {/* --- bottom-left credit --- */}
      <div
        style={{
          position: "absolute",
          left: 88,
          bottom: 78,
          opacity: creditIn,
          transform: `translateY(${interpolate(creditIn, [0, 1], [14, 0])}px)`,
        }}
      >
        <div
          style={{
            fontSize: 25,
            fontWeight: 600,
            letterSpacing: 9,
            color: "#8cb8ff",
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
          }}
        >
          HKUST-1
        </div>
        <div
          style={{
            fontSize: 17,
            fontWeight: 400,
            letterSpacing: 2.6,
            color: "rgba(188,206,232,0.62)",
            marginTop: 9,
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
          }}
        >
          a metal–organic framework
        </div>
        <div
          style={{
            height: 1,
            width: interpolate(creditRule, [0, 1], [0, 196]),
            marginTop: 14,
            background:
              "linear-gradient(90deg, rgba(140,184,255,0.75), rgba(140,184,255,0))",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
