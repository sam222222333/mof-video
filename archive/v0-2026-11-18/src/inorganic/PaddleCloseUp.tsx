import type { FC } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { FONT, PAL, VIGNETTE_CSS } from "../style";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import pw from "../data/paddlewheel-solvated.json";

/* ------------------------------------------------------------------------ *
 * SHOT 04 · 4a — the paddlewheel, with the three distances that matter
 *
 * Narration: "HKUST-1 is built from a paddlewheel: two copper ions bridged by
 * four carboxylate groups. Each copper sits in a square plane of four oxygens,
 * with one water molecule pointing axially."
 *
 * Geometry: models/paddlewheel.pdb (DFT-relaxed, Angstrom) + the two axial
 * waters added from the experimental structure (see scripts/build-data.py).
 * The labels quote the literature values used in the script (Chui 1999);
 * the rendered bond lengths differ by a few percent because they come from a
 * different refinement, so the figure says "structure: COD 2300380".
 * ------------------------------------------------------------------------ */

const C = {
  bg: "#0a0d14",
  text: PAL.cream,
  muted: PAL.mute,
  cu: PAL.lilac,
  o: "#e85d5d",
  c: "#9aa4b2",
  h: "#e8e8e8",
  accent: PAL.lilac,
  cuPair: PAL.peach,
  axial: "#d9d2c5",
};

const FOV = 40;
const CAM_D = 24; // Angstrom
const W = 1920;
const H = 1080;
const FOCAL = H / 2 / Math.tan(((FOV / 2) * Math.PI) / 180);

const RADII: Record<string, number> = { Cu: 0.74, O: 0.58, C: 0.54, H: 0.34 };
const COLORS: Record<string, string> = { Cu: C.cu, O: C.o, C: C.c, H: C.h };

type Vec3 = [number, number, number];

const rot = (p: Vec3, ry: number, rx: number): Vec3 => {
  const cy = Math.cos(ry);
  const sy = Math.sin(ry);
  const cx = Math.cos(rx);
  const sx = Math.sin(rx);
  const x1 = p[0] * cy + p[2] * sy;
  const z1 = -p[0] * sy + p[2] * cy;
  const y1 = p[1] * cx - z1 * sx;
  const z2 = p[1] * sx + z1 * cx;
  return [x1, y1, z2];
};

/** camera at (0,0,CAM_D) looking down -z */
const project = (p: Vec3): { x: number; y: number; depth: number } => {
  const z = p[2] - CAM_D; // negative in front of the camera
  const k = FOCAL / -z;
  return { x: W / 2 + p[0] * k, y: H / 2 - p[1] * k, depth: -z };
};

const ATOMS = pw.atoms as { e: string; x: number; y: number; z: number }[];
const BONDS = pw.bonds as [number, number][];
const WATER = pw.waterAtoms as number[];
const AXIAL_O = pw.axialO as number[];

const pos = (i: number): Vec3 => [ATOMS[i].x, ATOMS[i].y, ATOMS[i].z];
const cuIdx = ATOMS.map((a, i) => (a.e === "Cu" ? i : -1)).filter((i) => i >= 0);
const CENTROID = ATOMS.reduce(
  (acc, a) => [acc[0] + a.x / ATOMS.length, acc[1] + a.y / ATOMS.length, acc[2] + a.z / ATOMS.length],
  [0, 0, 0],
) as Vec3;

/** the four equatorial oxygens of the first copper, ordered around the axis */
const equatorialO = (() => {
  const cu = pos(cuIdx[0]);
  const cand = ATOMS.map((a, i) => ({ i, e: a.e, d: Math.hypot(...(pos(i).map((v, k) => v - cu[k]) as Vec3)) }))
    .filter((a) => a.e === "O" && a.d < 2.3 && a.d > 1.6 && !AXIAL_O.includes(a.i));
  // order by angle in a frame perpendicular to the Cu-Cu axis
  const axis: Vec3 = pos(cuIdx[1]).map((v, k) => v - cu[k]) as Vec3;
  const al = Math.hypot(...axis);
  const u: Vec3 = [axis[0] / al, axis[1] / al, axis[2] / al];
  const ref: Vec3 = Math.abs(u[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
  const e1: Vec3 = [
    u[1] * ref[2] - u[2] * ref[1],
    u[2] * ref[0] - u[0] * ref[2],
    u[0] * ref[1] - u[1] * ref[0],
  ];
  const e1l = Math.hypot(...e1);
  const v1: Vec3 = [e1[0] / e1l, e1[1] / e1l, e1[2] / e1l];
  const v2: Vec3 = [
    u[1] * v1[2] - u[2] * v1[1],
    u[2] * v1[0] - u[0] * v1[2],
    u[0] * v1[1] - u[1] * v1[0],
  ];
  return cand
    .map((a) => {
      const r = pos(a.i).map((v, k) => v - cu[k]) as Vec3;
      const ang = Math.atan2(r[0] * v2[0] + r[1] * v2[1] + r[2] * v2[2],
                           r[0] * v1[0] + r[1] * v1[1] + r[2] * v1[2]);
      return { i: a.i, ang };
    })
    .sort((a, b) => a.ang - b.ang)
    .slice(0, 4);
})();

const ramp = (frame: number, start: number, dur = 14): number =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

type Measure = {
  a: Vec3;
  b: Vec3;
  bond: string; // who to whom
  value: string;
  color: string;
  start: number;
  tagY: number; // fixed label row on the right, so labels never collide
};

export const PaddleCloseUp: FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();

  const spin = interpolate(frame, [0, durationInFrames], [0.42, 1.75], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const tiltX = 0.3;
  const R = (p: Vec3) => project(rot(p, spin, tiltX));

  const measures: Measure[] = [
    {
      a: pos(cuIdx[0]),
      b: pos(cuIdx[1]),
      bond: "Cu \u2013 Cu",
      value: "2.628 \u00C5",
      color: C.cuPair,
      start: 28,
      tagY: 300,
    },
    {
      a: pos(cuIdx[0]),
      b: pos(equatorialO[0].i),
      bond: "Cu \u2013 O  (equatorial)",
      value: "1.952 \u00C5",
      color: C.cu,
      start: 52,
      tagY: 500,
    },
    {
      a: pos(cuIdx[0]),
      b: pos(AXIAL_O[0]),
      bond: "Cu \u2013 OH\u2082  (axial)",
      value: "2.165 \u00C5",
      color: C.axial,
      start: 76,
      tagY: 700,
    },
  ];

  const fadeIn = ramp(frame, 0, 22);
  const fadeOut = interpolate(frame, [durationInFrames - 22, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const capIn = ramp(frame, 104, 16);
  // once the structure is understood, fade the organic frame back so the
  // coordination environment and the three distances have room to read
  const frameFade = interpolate(frame, [90, 120], [1, 0.22], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const opacityFor = (e: string) => (e === "Cu" || e === "O" ? 1 : frameFade);

  // the square plane of four oxygens, drawn as a translucent quad
  const planePts = equatorialO.map((o) => R(pos(o.i)));

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, opacity: fadeIn * fadeOut }}>
      <ThreeCanvas width={W} height={H} camera={{ position: [0, 0, CAM_D], fov: FOV, near: 0.5, far: 300 }}>
        <color attach="background" args={[C.bg]} />
        <ambientLight intensity={0.95} />
        <directionalLight position={[6, 9, 8]} intensity={1.9} />
        <pointLight position={[-7, -4, 6]} intensity={0.8} color={C.cu} />
        <group rotation={[tiltX, spin, 0.03]}>
          <group position={[-CENTROID[0], -CENTROID[1], -CENTROID[2]]}>
          {ATOMS.map((a, i) => (
            <mesh key={`a${i}`} position={[a.x, a.y, a.z]}>
              <sphereGeometry args={[RADII[a.e] ?? 0.4, 24, 24]} />
              <meshStandardMaterial
                color={COLORS[a.e] ?? "#999"}
                emissive={a.e === "Cu" ? C.cu : "#000000"}
                emissiveIntensity={a.e === "Cu" ? 0.45 : 0}
                roughness={0.35}
                metalness={0.1}
                transparent={a.e !== "Cu" && a.e !== "O"}
                opacity={opacityFor(a.e)}
              />
            </mesh>
          ))}
          {BONDS.map(([i, j], k) => {
            const s = new THREE.Vector3(...pos(i));
            const e = new THREE.Vector3(...pos(j));
            const mid = s.clone().add(e).multiplyScalar(0.5);
            const d = e.clone().sub(s);
            const q = new THREE.Quaternion().setFromUnitVectors(
              new THREE.Vector3(0, 1, 0),
              d.clone().normalize(),
            );
            return (
              <mesh key={`b${k}`} position={mid} quaternion={q}>
                <cylinderGeometry args={[0.14, 0.14, d.length(), 12]} />
                <meshStandardMaterial
                  color="#7c8798"
                  roughness={0.5}
                  transparent
                  opacity={0.25 + 0.6 * frameFade}
                />
              </mesh>
            );
          })}
          </group>
        </group>
      </ThreeCanvas>

      {/* the WebGL canvas paints its own flat background, so the film's vignette
          has to sit on top of it rather than behind */}
      <AbsoluteFill style={{ background: VIGNETTE_CSS, pointerEvents: "none" }} />

      {/* measurement overlay: projected in 2D so labels stay crisp */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, fontFamily: FONT }}>
        {/* square plane of the four equatorial oxygens */}
        {equatorialO.map((o, k) => {
          const p = R(pos(o.i));
          const q = planePts[(k + 1) % planePts.length];
          const a = ramp(frame, 8 + k * 4, 16);
          return (
            <line
              key={`pl${k}`}
              x1={p.x}
              y1={p.y}
              x2={q.x}
              y2={q.y}
              stroke={C.cu}
              strokeWidth={2}
              strokeDasharray="6 7"
              opacity={0.3 * a}
            />
          );
        })}

        {measures.map((m, k) => {
          const A = R(m.a);
          const B = R(m.b);
          const p = ramp(frame, m.start, 18);
          const mx = A.x + (B.x - A.x) * 0.5;
          const my = A.y + (B.y - A.y) * 0.5;
          const dx = B.x - A.x;
          const dy = B.y - A.y;
          const TAG_X = 1420;
          return (
            <g key={`m${k}`} opacity={p}>
              <line
                x1={A.x}
                y1={A.y}
                x2={A.x + dx * p}
                y2={A.y + dy * p}
                stroke={m.color}
                strokeWidth={2.5}
                strokeLinecap="round"
              />
              {p > 0.9 ? (
                <>
                  <circle cx={B.x} cy={B.y} r={5} fill={m.color} />
                  <line
                    x1={mx}
                    y1={my}
                    x2={TAG_X - 26}
                    y2={m.tagY - 12}
                    stroke={m.color}
                    strokeWidth={1.8}
                    strokeDasharray="7 6"
                    opacity={0.55}
                  />
                  <circle cx={TAG_X - 26} cy={m.tagY - 12} r={4} fill={m.color} />
                  <text x={TAG_X} y={m.tagY - 6} fontSize={24} fill={m.color} fontWeight={600}>
                    {m.bond}
                  </text>
                  <text x={TAG_X} y={m.tagY + 36} fontSize={40} fill={C.text} fontWeight={600}>
                    {m.value}
                  </text>
                </>
              ) : null}
            </g>
          );
        })}

        {/* the four framework numbers used to be a 3 s card of their own; they
            live in this corner now so the shot stays a single beat */}
        <g opacity={ramp(frame, 74, 18)}>
          <text x={110} y={92} fontSize={19} letterSpacing={6} fill={C.accent} fontWeight={700}>
            THE FRAMEWORK
          </text>
          <text x={110} y={130} fontSize={25} fill={C.text} fontWeight={600}>
            {"Fm\u20133m  \u00B7  a = 26.343 \u00C5"}
          </text>
          <text x={110} y={162} fontSize={21} fill={C.muted}>
            {"channels \u2248 1 nm  \u00B7  porosity \u2248 40 %"}
          </text>
        </g>

        <g opacity={capIn}>
          <text x={110} y={980} fontSize={22} fill={C.muted}>
            {"paddlewheel \u00B7 74 atoms \u00B7 structure: COD 2300380 \u00B7 distances: Chui 1999 (Science)"}
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
