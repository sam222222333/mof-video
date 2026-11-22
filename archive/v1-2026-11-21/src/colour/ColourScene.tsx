import type { FC, ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { FONT, PAL, BACKDROP_CSS, SectionTitle } from "../style";
import { COLOUR_GREEN, COLOUR_PALE, COLOUR_TURQ } from "../inorganic/ColourSection";
import {
  ARM_C,
  ARM_OF,
  ATOMS,
  AXIS,
  BG,
  BONDS,
  CORE,
  CORE_C,
  CORE_O,
  CU,
  CU_COL,
  N_ARMS,
  P,
  Q_AXIS,
  RADII,
  WATER,
  waterOn,
} from "./paddleModel";

/* ------------------------------------------------------------------------ *
 * COLOUR · why MOF-199 changes colour — 3D, built scene by scene.
 *
 * Local frame 0 = script 0:14.5 ("A missing organic linker ..."). Timed to
 * the SCRIPT for now; nudged to the real vo once it is recorded. No audio in
 * this file — the vo is added separately.
 *
 * Only physical things are 3D (crystals, paddlewheels, waters). Every
 * diagram / label (d–d levels, spectrum bar, icons, captions) is flat SVG.
 *
 *   S1   0 - 225  (14.5 - 22.0)  two crystals -> push into the green one ->
 *                 its paddlewheel -> one linker fades out (✗) -> simple
 *                 two-level d–d diagram, gap shifts                [approved]
 *   S2 225 - 429  (22.0 - 28.8)  a complete paddlewheel joins the defective
 *                 one; both turn side-on (Cu–Cu axis vertical) and a water
 *                 docks on each Cu's open axial site, top and bottom
 *   S3 429 - 678  (28.8 - 37.1)  "square planar": a translucent square on the
 *                 4 O round each Cu of the perfect paddlewheel -> "to square
 *                 pyramidal": it rises to a pyramid with the water at the tip
 *                 -> "absorbs ... red": paddlewheels shrink away, the two
 *                 crystals come back; flat spectrum bar (red = absorbed) + the
 *                 two-level d–d diagram, arrow turns red -> "turquoise": both
 *                 crystals turn light turquoise
 *   S4 678 - 885  (37.1 - 44.0)  "When heated under a vacuum": heat + vacuum
 *                 icons and a warm glow -> small side-on paddlewheels under
 *                 each crystal: "the water molecules leave" -> "colour
 *                 return(s)": crystals go back to green / pale. The
 *                 defective one keeps its missing linker: "heat + vacuum
 *                 removes water, not defects"
 *   S5 885 - 945  (44.0 - 46.0)  hold, then fade out
 * ------------------------------------------------------------------------ */

export const COLOUR_FRAMES = 856; // 14.5 -> 43.0 s @ 30 fps, against the new narration
export const S1_FRAMES = 225;
export const S2_END = 429;
export const S3_END = 678;
export const S4_END = 885;

const W = 1920;
const H = 1080;
const FOV = 40;
const CAM_Z = 25;

/* same crystal colours as the 2-D opening (ColourSection.tsx) */
const CRYSTAL = {
  pale: COLOUR_PALE, // a perfect crystal: almost colourless
  green: COLOUR_GREEN, // a defective crystal: green
};
const TURQ = COLOUR_TURQ; // light turquoise, both crystals once wet
const RED = "#e5484d";
const WATER_O = PAL.lilac; // PaddleV3's water colours
const WATER_H = "#e2e8f0";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (f: number, s: number, d = 18) =>
  interpolate(f, [s, s + d], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
const span = (f: number, a: number, b: number, ease = Easing.inOut(Easing.cubic)) =>
  interpolate(f, [a, b], [0, 1], { ...clamp, easing: ease });
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/* same camera as PaddleV3, for projecting overlay positions */
const CAM = new THREE.PerspectiveCamera(FOV, W / H, 0.5, 300);
CAM.position.set(0, 0, CAM_Z);
CAM.updateMatrixWorld();
CAM.updateProjectionMatrix();
const toScreen = (v: THREE.Vector3) => {
  const p = v.clone().project(CAM);
  return { x: ((p.x + 1) / 2) * W, y: ((1 - p.y) / 2) * H };
};

/* ------------------------------ beats ------------------------------ */
const B = {
  /* S1 */
  labelsIn: 4,
  labelsOut: 34,
  push: [18, 62] as const, // camera pushes into the green crystal
  crystalOut: [46, 68] as const,
  pwIn: [50, 86] as const, // its paddlewheel emerges
  armOut: [84, 114] as const, // "disrupts the paddle wheel structure"
  cross: 104,
  slide: [112, 142] as const, // paddlewheel moves left, diagram room on the right
  ddIn: 126, // "alters the d–d electronic transitions"
  ddShift: [160, 196] as const,
  caption: 132,
  /* S2 */
  s1Out: 225, // S1's diagram, caption and ✗ clear away
  turn: [232, 292] as const, // both paddlewheels turn side-on
  perfectIn: [236, 296] as const, // the complete paddlewheel slides in
  pwLabels: 290,
  waterTop: [322, 380] as const, // "The water binds to open axial positions"
  waterBot: [336, 394] as const,
  perfectLag: 8, // the complete one's waters arrive a beat later
  s2Caption: 350,
  ringsOut: 396,
  /* S3 — boundaries come from vo-quantum-new.csv (the new narration),
     local = absolute - 435:
     "changing the geometry" 834→399, "square pyramidal" 834-925→399-490,
     "absorbs ... red" 925-1083→490-648 */
  s2Out: 399,
  square: 405,
  pyramid: [432, 470] as const,
  backOut: [478, 512] as const, // paddlewheels shrink away, crystals return
  s3ddIn: 490,
  red: 512,
  turq: [545, 610] as const,
  turqLabel: 588,
  /* S4 — "When heated under a vacuum" 1100→665, "water molecules leave"
     1176-1263→741-828, line ends 1273→838 */
  s3Out: 665,
  heat: 672,
  vacuum: 694,
  insetIn: [680, 706] as const,
  leaveTop: [718, 752] as const,
  leaveBot: [728, 762] as const,
  leaveLag: 6, // the perfect one's waters a beat later
  notDefects: 764,
  unturq: [782, 818] as const,
  heatOff: 822,
  /* S5 */
  fadeOut: [820, 856] as const,
};

/* the arm that goes missing: the one sitting at the top of the axial view */
const MISSING = (() => {
  let best = 0;
  let bestY = -Infinity;
  for (let k = 0; k < N_ARMS; k++) {
    const y = ARM_C[k].clone().applyQuaternion(Q_AXIS).y;
    if (y > bestY) {
      bestY = y;
      best = k;
    }
  }
  return best;
})();
const inMissing = (i: number) => ARM_OF.get(i) === MISSING;
const GAP_C = [...CORE_C].find((i) => inMissing(i))!;

/* side-on view: Cu–Cu axis vertical, the four arms turned to the diagonals
   (none pointing straight at the camera, where it would sit on top of the
   axis and hide the waters), tilted a little so it reads as 3D */
const Q_UP = new THREE.Quaternion().setFromUnitVectors(AXIS, new THREE.Vector3(0, 1, 0));
const ARM0 = ARM_C[0].clone().applyQuaternion(Q_UP);
const YAW = Math.atan2(ARM0.z, ARM0.x) - Math.PI / 4;
const Q_SIDE = new THREE.Quaternion()
  .setFromEuler(new THREE.Euler(0.14, 0, 0))
  .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, YAW, 0)))
  .multiply(Q_UP);

/* waters: TOP is on CU[1] (+AXIS side -> up in Q_SIDE), BOT on CU[0] */
const W_TOP = waterOn(CU[1]);
const W_BOT = waterOn(CU[0]);

/* ------------------------------ paddlewheel parts ------------------------------ */
type Ball = { key: string; e: string; p: THREE.Vector3; color: string; em: number; op: number };
type Stick = { key: string; a: THREE.Vector3; b: THREE.Vector3; color: string; op: number; r?: number };

type PaddleOpts = {
  op: number; // whole-model opacity
  armOut: number; // 0..1, the missing linker drifting away (defective only)
  defective: boolean;
  wTop: number; // 0..1, top water docking (0 = not here yet)
  wBot: number;
  dimArms?: number; // 0..1, fades the linker arms back (S3, so the polyhedra read)
};

/** where a water atom sits while docking: far out along the axis, swinging in */
const waterPos = (i: number, w: { cu: number; o: number }, t: number) => {
  const out = P(w.o).sub(P(w.cu)).normalize();
  const side = out.clone().cross(new THREE.Vector3(0.3, 0.2, 1)).normalize();
  return P(i)
    .add(out.multiplyScalar(9 * (1 - t)))
    .add(side.multiplyScalar(4 * (1 - t) * (1 - t)));
};

const paddleParts = (o: PaddleOpts, prefix: string) => {
  const balls: Ball[] = [];
  const sticks: Stick[] = [];
  if (o.op <= 0.01) return { balls, sticks };
  const armDir = ARM_C[MISSING].clone().normalize();
  const gone = (i: number) => o.defective && inMissing(i);
  const waterT = (i: number) => (W_TOP.atoms.has(i) ? o.wTop : o.wBot);
  const waterOf = (i: number) => (W_TOP.atoms.has(i) ? W_TOP : W_BOT);

  const pos = (i: number) => {
    if (WATER.has(i)) return waterPos(i, waterOf(i), waterT(i));
    const p = P(i);
    if (gone(i)) p.add(armDir.clone().multiplyScalar(3 * o.armOut));
    return p;
  };
  const opOf = (i: number) => {
    if (WATER.has(i)) return waterT(i) > 0.001 ? o.op * Math.min(1, waterT(i) * 4) : 0;
    const arm = !CU.includes(i) && !CORE_O.has(i) ? 1 - 0.75 * (o.dimArms ?? 0) : 1;
    return o.op * arm * (gone(i) ? 1 - o.armOut : 1);
  };

  ATOMS.forEach((a, i) => {
    let color: string;
    let em = 0;
    if (a.e === "Cu") {
      color = CU_COL;
      em = 0.45;
    } else if (WATER.has(i)) {
      color = a.e === "O" ? WATER_O : WATER_H;
      em = 0.15;
    } else if (CORE_O.has(i)) color = CORE.O;
    else if (CORE_C.has(i)) color = CORE.C;
    else color = (BG as Record<string, string>)[a.e] ?? BG.C;
    const op = opOf(i);
    if (op > 0.01) balls.push({ key: `${prefix}a${i}`, e: a.e, p: pos(i), color, em, op });
  });

  BONDS.forEach(([i, j], k) => {
    const wi = WATER.has(i);
    const wj = WATER.has(j);
    let op = Math.min(opOf(i), opOf(j));
    let color = BG.bond;
    const coreish = (x: number) => CORE_O.has(x) || CORE_C.has(x) || CU.includes(x) || WATER.has(x);
    if (coreish(i) && coreish(j)) color = CORE.bond;
    if (wi !== wj) {
      // the Cu–OH2 bond only forms once the water has docked
      const t = waterT(wi ? i : j);
      op = o.op * interpolate(t, [0.9, 1], [0, 1], clamp);
      color = PAL.peach;
    }
    if (op > 0.01) sticks.push({ key: `${prefix}b${k}`, a: pos(i), b: pos(j), color, op, r: wi !== wj ? 0.1 : 0.14 });
  });
  return { balls, sticks };
};

const PaddleMesh: FC<{
  parts: { balls: Ball[]; sticks: Stick[] };
  pos: THREE.Vector3;
  q: THREE.Quaternion;
  scale: number;
  children?: ReactNode;
}> = ({ parts, pos, q, scale, children }) => (
  <group position={pos} quaternion={q} scale={scale}>
    {children}
    {parts.balls.map((b) => (
      <mesh key={b.key} position={b.p}>
        <sphereGeometry args={[RADII[b.e] ?? 0.4, 32, 32]} />
        {/* keyed on transparency: three.js only picks up a switch to/from
            transparent when the material is rebuilt */}
        <meshStandardMaterial
          key={b.op < 1 ? "t" : "o"}
          color={b.color}
          emissive={b.color}
          emissiveIntensity={b.em}
          roughness={0.4}
          transparent={b.op < 1}
          opacity={b.op}
        />
      </mesh>
    ))}
    {parts.sticks.map((s) => {
      const d = s.b.clone().sub(s.a);
      return (
        <mesh
          key={s.key}
          position={s.a.clone().add(s.b).multiplyScalar(0.5)}
          quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize())}
        >
          <cylinderGeometry args={[s.r ?? 0.14, s.r ?? 0.14, d.length(), 12]} />
          <meshStandardMaterial key={s.op < 1 ? "t" : "o"} color={s.color} roughness={0.5} transparent={s.op < 1}
            opacity={s.op} />
        </mesh>
      );
    })}
  </group>
);

/* ------------------------------ coordination polyhedra (S3) ------------------------------ */
/* for each Cu: its 4 equatorial O in order round the axis, and its water O */
const COORD = [W_TOP, W_BOT].map((w) => {
  const eq = [...CORE_O].filter((i) => P(i).distanceTo(P(w.cu)) < 2.3);
  const c = eq.reduce((acc, i) => acc.add(P(i)), new THREE.Vector3()).multiplyScalar(1 / eq.length);
  const u = P(eq[0]).sub(c).normalize();
  const v = AXIS.clone().cross(u).normalize();
  const ang = (i: number) => {
    const d = P(i).sub(c);
    return Math.atan2(d.dot(v), d.dot(u));
  };
  return { ring: eq.sort((a, b) => ang(a) - ang(b)).map(P), centre: c, apex: P(w.o) };
});

/** a flat square on the 4 O (grow = 0) rising into a square pyramid with its
 *  tip on the water O (grow = 1) */
const Polyhedron: FC<{ ring: THREE.Vector3[]; centre: THREE.Vector3; apex: THREE.Vector3; grow: number; op: number }> = ({
  ring,
  centre,
  apex,
  grow,
  op,
}) => {
  if (op <= 0.01) return null;
  const tip = centre.clone().lerp(apex, grow);
  const pts = [...ring, tip];
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  // base (two triangles) + four sides to the tip
  geo.setIndex([0, 1, 2, 0, 2, 3, 0, 1, 4, 1, 2, 4, 2, 3, 4, 3, 0, 4]);
  geo.computeVertexNormals();
  const edges: THREE.Vector3[] = [];
  for (let k = 0; k < 4; k++) edges.push(ring[k], ring[(k + 1) % 4]);
  if (grow > 0.02) for (let k = 0; k < 4; k++) edges.push(ring[k], tip);
  const eGeo = new THREE.BufferGeometry().setFromPoints(edges);
  return (
    <>
      {/* drawn last and over the (partly transparent) atoms so it always reads */}
      <mesh geometry={geo} renderOrder={10}>
        <meshBasicMaterial color={PAL.peach} transparent opacity={0.42 * op} side={THREE.DoubleSide}
          depthWrite={false} depthTest={false} />
      </mesh>
      <lineSegments geometry={eGeo} renderOrder={11}>
        <lineBasicMaterial color={PAL.peach} transparent opacity={0.95 * op} depthTest={false} />
      </lineSegments>
    </>
  );
};

/* ------------------------------ crystal ------------------------------ */
const OCTA = new THREE.OctahedronGeometry(2.3, 0);
const OCTA_EDGES = new THREE.EdgesGeometry(OCTA);

const Crystal: FC<{ pos: [number, number, number]; scale: number; color: string; op: number; spin: number }> = ({
  pos,
  scale,
  color,
  op,
  spin,
}) =>
  op <= 0.01 ? null : (
    <group position={pos} scale={scale} rotation={[0.5, spin, 0.15]}>
      <mesh geometry={OCTA}>
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.18}
          roughness={0.18}
          metalness={0}
          flatShading
          transparent
          opacity={0.78 * op}
        />
      </mesh>
      <lineSegments geometry={OCTA_EDGES}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.45 * op} />
      </lineSegments>
    </group>
  );

/* ------------------------------ the scene ------------------------------ */
/** showTitle=false when it sits under ColourFull's permanent "Colour as a diagnostic" title */
export const ColourScene: FC<{ showTitle?: boolean }> = ({ showTitle = true }) => {
  const f = useCurrentFrame();

  /* ---------- S1: crystals + push ---------- */
  const push = span(f, B.push[0], B.push[1], Easing.in(Easing.cubic));
  const spin = f * 0.012;
  const paleOp = 1 - span(f, B.push[0], B.push[0] + 26);
  const greenOp = 1 - span(f, B.crystalOut[0], B.crystalOut[1], Easing.linear);
  const palePos: [number, number, number] = [mix(-4.6, -12, push), 0, 0];
  const greenPos: [number, number, number] = [mix(4.6, 0, push), 0, mix(0, 6, push)];
  const greenScale = mix(1, 6.5, push);

  /* ---------- the defective paddlewheel (S1 ->) ---------- */
  const pwIn = span(f, B.pwIn[0], B.pwIn[1], Easing.out(Easing.cubic));
  const pwOp = ramp(f, B.pwIn[0], 22);
  const slide = span(f, B.slide[0], B.slide[1]);
  const turn = span(f, B.turn[0], B.turn[1]);
  const pwScale = mix(mix(0.3, 0.72, pwIn), 0.7, turn);
  const defPos = new THREE.Vector3(mix(mix(0, -4.4, slide), -5.4, turn), mix(mix(0, 0.5, slide), 0.4, turn), 0);
  const qS1 = Q_AXIS.clone().premultiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -0.25 + 0.25 * pwIn)));
  const q = qS1.clone().slerp(Q_SIDE, turn);
  const armOut = span(f, B.armOut[0], B.armOut[1], Easing.in(Easing.quad));

  /* ---------- the complete paddlewheel (S2 ->) ---------- */
  const perIn = span(f, B.perfectIn[0], B.perfectIn[1], Easing.out(Easing.cubic));
  const perOp = ramp(f, B.perfectIn[0], 24);
  const perPos = new THREE.Vector3(mix(13, 5.4, perIn), 0.4, 0);

  /* ---------- waters (S2) ---------- */
  const dock = (a: number, b: number) => span(f, a, b, Easing.out(Easing.cubic));
  const L = B.perfectLag;
  const pwFade = 1 - span(f, B.backOut[0] + 6, B.backOut[1]); // S3: paddlewheels shrink away
  const polyOn = ramp(f, B.square - 6, 16); // S3: arms stay faded back until the paddlewheels are gone
  const def = paddleParts(
    { op: pwOp * pwFade * (1 - 0.55 * polyOn), armOut, defective: true, wTop: dock(...B.waterTop), wBot: dock(...B.waterBot) },
    "d",
  );
  const per = paddleParts(
    {
      op: perOp * pwFade,
      dimArms: polyOn,
      armOut: 0,
      defective: false,
      wTop: dock(B.waterTop[0] + L, B.waterTop[1] + L),
      wBot: dock(B.waterBot[0] + L, B.waterBot[1] + L),
    },
    "p",
  );

  /* ---------- overlay positions ---------- */
  const at = (v: THREE.Vector3, pos: THREE.Vector3) => toScreen(v.clone().applyQuaternion(q).multiplyScalar(pwScale).add(pos));
  const crossAt = at(P(GAP_C), defPos);
  const paleLabel = toScreen(new THREE.Vector3(-4.6, -3.4, 0));
  const greenLabel = toScreen(new THREE.Vector3(4.6, -3.4, 0));
  const labelsOp = ramp(f, B.labelsIn, 16) * (1 - ramp(f, B.labelsOut, 12));
  const s1Off = 1 - ramp(f, B.s1Out, 18);

  /* landing rings on the water O, per paddlewheel and per site */
  const ring = (o: number, pos: THREE.Vector3, land: number) => {
    const p = at(P(o), pos);
    const t = Math.max(0, (f - land) / 30);
    const r = 30 + 12 * Math.sin(Math.min(t, 1) * Math.PI) * Math.exp(-t * 0.6);
    return { p, r, op: ramp(f, land - 4, 14) * (1 - ramp(f, B.ringsOut, 18)) };
  };
  const rings = [
    ring(W_TOP.o, defPos, B.waterTop[1]),
    ring(W_BOT.o, defPos, B.waterBot[1]),
    ring(W_TOP.o, perPos, B.waterTop[1] + L),
    ring(W_BOT.o, perPos, B.waterBot[1] + L),
  ];
  const defLabel = toScreen(defPos.clone().add(new THREE.Vector3(0, -4.9, 0)));
  const perLabel = toScreen(perPos.clone().add(new THREE.Vector3(0, -4.9, 0)));
  const pwLabelsOp = ramp(f, B.pwLabels, 18) * (1 - ramp(f, B.backOut[0], 16));
  const s2Off = 1 - ramp(f, B.s2Out, 16);

  /* ---------- S3 ---------- */
  const polyOp = ramp(f, B.square, 16) * (1 - ramp(f, B.backOut[0], 14));
  const grow = span(f, B.pyramid[0], B.pyramid[1]);
  const back = span(f, B.backOut[0], B.backOut[1]);
  const pwShrink = mix(1, 0.35, back);
  const crysIn = span(f, B.backOut[0] + 10, B.backOut[1] + 8, Easing.out(Easing.cubic));
  const turq = span(f, B.turq[0], B.turq[1]);
  const unturq = span(f, B.unturq[0], B.unturq[1]); // S4: colour returns
  const tint = (from: string) =>
    "#" + new THREE.Color(from).lerp(new THREE.Color(TURQ), turq * (1 - unturq)).getHexString();
  const CRY_Y = 1.6;
  const s3PaleLabel = toScreen(new THREE.Vector3(-4.6, CRY_Y - 3.4, 0));
  const s3GreenLabel = toScreen(new THREE.Vector3(4.6, CRY_Y - 3.4, 0));
  const s3LabelsOp = ramp(f, B.backOut[1] - 6, 16);

  /* d–d mini diagram + spectrum bar (flat) */
  const s3Off = 1 - ramp(f, B.s3Out, 16);
  const s3dd = ramp(f, B.s3ddIn, 18) * s3Off;
  const redOn = ramp(f, B.red, 14) * s3Off;
  const SPX = 700; // spectrum bar left edge
  const SPW = 760;
  const SPY = 860;
  const redX = SPX + SPW * 0.8;

  /* ---------- S4: heat + vacuum, water leaves ---------- */
  const heatOn = ramp(f, B.heat, 20) * (1 - ramp(f, B.heatOff, 24));
  const vacOn = ramp(f, B.vacuum, 18) * (1 - ramp(f, B.heatOff, 24));
  const insetIn = span(f, B.insetIn[0], B.insetIn[1], Easing.out(Easing.cubic));
  const insetOp = ramp(f, B.insetIn[0], 20);
  const leave = (a: number, b: number) => 1 - span(f, a, b, Easing.in(Easing.quad));
  const LL = B.leaveLag;
  const INSET_Y = -4.6;
  const insetScale = mix(0.12, 0.34, insetIn);
  const insetQ = Q_SIDE.clone().premultiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, (f - B.insetIn[0]) * 0.004, 0)));
  const defInset = paddleParts(
    { op: insetOp, armOut: 1, defective: true, wTop: leave(...B.leaveTop), wBot: leave(...B.leaveBot) },
    "di",
  );
  const perInset = paddleParts(
    {
      op: insetOp,
      armOut: 0,
      defective: false,
      wTop: leave(B.leaveTop[0] + LL, B.leaveTop[1] + LL),
      wBot: leave(B.leaveBot[0] + LL, B.leaveBot[1] + LL),
    },
    "pi",
  );

  /* ---------- S5: fade out ---------- */
  const endFade = 1 - span(f, B.fadeOut[0], B.fadeOut[1], Easing.linear);

  /* ---------- d–d diagram (flat, two levels) ---------- */
  const ddOp = ramp(f, B.ddIn, 20) * s1Off;
  const shift = span(f, B.ddShift[0], B.ddShift[1]);
  const DX = 1260; // left edge of the diagram
  const LW = 300; // level width
  const yLow = 690;
  const yHighBefore = 430;
  const yHigh = mix(yHighBefore, 520, shift);

  return (
    <AbsoluteFill style={{ background: BACKDROP_CSS, opacity: endFade }}>
      <ThreeCanvas width={W} height={H} camera={{ position: [0, 0, CAM_Z], fov: FOV, near: 0.5, far: 300 }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[6, 9, 8]} intensity={1.9} />
        <pointLight position={[-7, -4, 6]} intensity={0.6} color={PAL.lilac} />
        <pointLight position={[0, -8, 6]} intensity={3 * heatOn} color={PAL.peach} />

        <Crystal pos={palePos} scale={1} color={CRYSTAL.pale} op={paleOp} spin={spin} />
        <Crystal pos={greenPos} scale={greenScale} color={CRYSTAL.green} op={greenOp} spin={spin + 0.6} />

        <PaddleMesh parts={def} pos={defPos} q={q} scale={pwScale * pwShrink} />
        <PaddleMesh parts={per} pos={perPos} q={q} scale={pwScale * pwShrink}>
          {COORD.map((c, k) => (
            <Polyhedron key={k} ring={c.ring} centre={c.centre} apex={c.apex} grow={grow} op={polyOp} />
          ))}
        </PaddleMesh>

        {/* S3: the two crystals come back, then both turn turquoise */}
        <Crystal pos={[-4.6, CRY_Y, 0]} scale={mix(0.3, 1, crysIn)} color={tint(CRYSTAL.green)} op={crysIn} spin={spin + 0.6} />
        <Crystal pos={[4.6, CRY_Y, 0]} scale={mix(0.3, 1, crysIn)} color={tint(CRYSTAL.pale)} op={crysIn} spin={spin} />

        {/* S4: small side-on paddlewheels under each crystal; their waters leave */}
        {insetOp > 0.01 && (
          <>
            <PaddleMesh parts={defInset} pos={new THREE.Vector3(-4.6, INSET_Y, 0)} q={insetQ} scale={insetScale} />
            <PaddleMesh parts={perInset} pos={new THREE.Vector3(4.6, INSET_Y, 0)} q={insetQ} scale={insetScale} />
          </>
        )}
      </ThreeCanvas>

      {/* S4: warm wash for "heat" */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(circle at 50% 80%, rgba(253,186,116,0.16) 0%, rgba(253,186,116,0) 60%)",
          opacity: heatOn,
        }}
      />

      <svg width={W} height={H} style={{ position: "absolute", inset: 0, fontFamily: FONT }}>
        {showTitle && <SectionTitle opacity={ramp(f, 0, 16)}>the colour of MOF-199</SectionTitle>}

        {/* S1 crystal labels */}
        <g opacity={labelsOp}>
          <text x={paleLabel.x} y={paleLabel.y} textAnchor="middle" fontSize={32} fill={PAL.white} fontWeight={700}>
            perfect
          </text>
          <text x={greenLabel.x} y={greenLabel.y} textAnchor="middle" fontSize={32} fill={CRYSTAL.green} fontWeight={700}>
            defective
          </text>
        </g>

        {/* ✗ where the linker was */}
        <g opacity={ramp(f, B.cross, 14) * s1Off} transform={`translate(${crossAt.x} ${crossAt.y})`}>
          <circle r={34} fill="#1c1418" stroke="#e2777a" strokeWidth={3.5} />
          <path d="M -14 -14 L 14 14 M 14 -14 L -14 14" stroke="#e2777a" strokeWidth={5} strokeLinecap="round" />
        </g>

        {/* d–d diagram: two levels, one arrow */}
        <g opacity={ddOp}>
          <text x={DX} y={360} fontSize={30} fill={PAL.cream} fontWeight={700}>
            d–d transition
          </text>
          <text x={DX + LW + 40} y={360} textAnchor="end" fontSize={21} fill={PAL.mute}>
            simplified
          </text>
          <line x1={DX} y1={yHighBefore} x2={DX + LW} y2={yHighBefore} stroke={PAL.mute} strokeWidth={3}
            strokeDasharray="8 8" opacity={0.6 * shift} />
          <line x1={DX} y1={yHigh} x2={DX + LW} y2={yHigh} stroke={PAL.cream} strokeWidth={5} strokeLinecap="round" />
          <line x1={DX} y1={yLow} x2={DX + LW} y2={yLow} stroke={PAL.cream} strokeWidth={5} strokeLinecap="round" />
          <text x={DX - 20} y={yLow + 9} textAnchor="end" fontSize={24} fill={PAL.mute}>d</text>
          <text x={DX - 20} y={yHigh + 9} textAnchor="end" fontSize={24} fill={PAL.mute}>d</text>
          <line x1={DX + LW / 2} y1={yLow - 8} x2={DX + LW / 2} y2={yHigh + 22} stroke={PAL.peach} strokeWidth={4} />
          <path d={`M ${DX + LW / 2 - 13} ${yHigh + 26} L ${DX + LW / 2} ${yHigh + 6} L ${DX + LW / 2 + 13} ${yHigh + 26}`}
            fill="none" stroke={PAL.peach} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
          <text x={DX + LW / 2 + 22} y={(yLow + yHigh) / 2 + 8} fontSize={26} fill={PAL.peach} fontWeight={600}>
            ΔE
          </text>
        </g>

        {/* S1 caption */}
        <g opacity={ramp(f, B.caption, 20) * s1Off}>
          <text x={DX} y={790} fontSize={32} fill={PAL.cream}>
            {"missing linker  →"}
          </text>
          <text x={DX} y={832} fontSize={32} fill={PAL.cream}>
            {"different d–d transitions"}
          </text>
        </g>

        {/* S2: paddlewheel labels */}
        <g opacity={pwLabelsOp}>
          <text x={defLabel.x} y={defLabel.y} textAnchor="middle" fontSize={30} fill={CRYSTAL.green} fontWeight={700}>
            defective
          </text>
          <text x={perLabel.x} y={perLabel.y} textAnchor="middle" fontSize={30} fill={PAL.white} fontWeight={700}>
            perfect
          </text>
        </g>

        {/* S2: landing rings on each docked water */}
        {rings.map((r, k) =>
          r.op > 0.01 ? (
            <g key={`r${k}`} opacity={r.op}>
              <circle cx={r.p.x} cy={r.p.y} r={r.r} fill="none" stroke={PAL.peach} strokeWidth={3} />
              <circle cx={r.p.x} cy={r.p.y} r={r.r + 14} fill="none" stroke={PAL.peach} strokeWidth={1.5} opacity={0.35} />
            </g>
          ) : null,
        )}

        {/* S2 caption */}
        <g opacity={ramp(f, B.s2Caption, 20) * s2Off}>
          <text x={W / 2} y={960} textAnchor="middle" fontSize={34} fill={PAL.cream}>
            {"open axial sites bind water"}
          </text>
        </g>

        {/* S3 caption 1: the geometry change */}
        <g opacity={ramp(f, B.square, 16) * (1 - ramp(f, B.backOut[0], 14))}>
          <text x={W / 2} y={960} textAnchor="middle" fontSize={34} fill={PAL.cream}>
            {"square planar"}
            <tspan fill={PAL.peach} fontWeight={700} opacity={ramp(f, B.pyramid[0], 14)}>
              {"  →  square pyramidal"}
            </tspan>
          </text>
        </g>

        {/* S3: crystal labels again */}
        <g opacity={s3LabelsOp}>
          <text x={s3GreenLabel.x} y={s3GreenLabel.y} textAnchor="middle" fontSize={30} fill={PAL.white} fontWeight={700}>
            perfect
          </text>
          <text x={s3PaleLabel.x} y={s3PaleLabel.y} textAnchor="middle" fontSize={30}
            fill={tint(CRYSTAL.green)} fontWeight={700}>
            defective
          </text>
        </g>

        {/* S3: mini d–d diagram, arrow turns red */}
        <g opacity={s3dd}>
          <line x1={250} y1={790} x2={420} y2={790} stroke={PAL.cream} strokeWidth={4} strokeLinecap="round" />
          <line x1={250} y1={900} x2={420} y2={900} stroke={PAL.cream} strokeWidth={4} strokeLinecap="round" />
          <line x1={335} y1={894} x2={335} y2={808} stroke={redOn > 0.5 ? RED : PAL.peach} strokeWidth={4} />
          <path d="M 325 812 L 335 796 L 345 812" fill="none" stroke={redOn > 0.5 ? RED : PAL.peach} strokeWidth={4}
            strokeLinecap="round" strokeLinejoin="round" />
          <text x={250} y={760} fontSize={24} fill={PAL.mute}>d–d</text>
        </g>

        {/* S3: spectrum bar, red marked as absorbed */}
        <defs>
          <linearGradient id="spectrum" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#7c3aed" />
            <stop offset="0.17" stopColor="#3b5bfd" />
            <stop offset="0.35" stopColor="#22c3e6" />
            <stop offset="0.5" stopColor="#34c76f" />
            <stop offset="0.64" stopColor="#f5e04a" />
            <stop offset="0.78" stopColor="#f59a3a" />
            <stop offset="0.9" stopColor={RED} />
            <stop offset="1" stopColor="#b3192a" />
          </linearGradient>
        </defs>
        <g opacity={s3dd}>
          <rect x={SPX} y={SPY} width={SPW} height={30} rx={6} fill="url(#spectrum)" />
          <text x={SPX} y={SPY + 64} fontSize={21} fill={PAL.mute}>violet</text>
          <text x={SPX + SPW} y={SPY + 64} textAnchor="end" fontSize={21} fill={PAL.mute}>red</text>
          <text x={SPX + SPW + 40} y={SPY - 40} fontSize={21} fill={PAL.mute}>simplified</text>
        </g>
        <g opacity={redOn}>
          <rect x={redX} y={SPY - 10} width={SPX + SPW - redX + 6} height={50} rx={8} fill="none" stroke={PAL.cream}
            strokeWidth={3} />
          <text x={redX + (SPX + SPW - redX) / 2} y={SPY - 22} textAnchor="middle" fontSize={26} fill={PAL.cream}
            fontWeight={700}>
            absorbed
          </text>
        </g>

        {/* S3 caption 2 */}
        <g opacity={ramp(f, B.red + 6, 18) * s3Off}>
          <text x={W / 2} y={990} textAnchor="middle" fontSize={34} fill={PAL.cream}>
            {"absorbs red  →  "}
            <tspan fill={TURQ} fontWeight={700} opacity={ramp(f, B.turqLabel, 16)}>
              {"looks turquoise"}
            </tspan>
          </text>
        </g>

        {/* S4: heat + vacuum icons, centred between the crystals */}
        <g opacity={heatOn} transform="translate(880 300)">
          {/* flame */}
          <path d="M 0 -46 C 22 -20 30 -4 22 16 C 16 32 -16 32 -22 16 C -28 0 -14 -12 -8 -26 C -4 -14 4 -12 6 -18 C 8 -26 4 -36 0 -46 Z"
            fill={PAL.peach} opacity={0.9} />
          <text y={70} textAnchor="middle" fontSize={26} fill={PAL.peach} fontWeight={700}>heat</text>
        </g>
        <g opacity={vacOn} transform="translate(1040 300)">
          {/* vacuum gauge */}
          <circle r={34} fill="none" stroke={PAL.cream} strokeWidth={4} />
          <path d="M -24 8 A 26 26 0 0 1 24 8" fill="none" stroke={PAL.mute} strokeWidth={3} />
          <line x1={0} y1={8} x2={-18} y2={-14} stroke={PAL.cream} strokeWidth={4} strokeLinecap="round" />
          <circle r={5} cy={8} fill={PAL.cream} />
          <text y={70} textAnchor="middle" fontSize={26} fill={PAL.cream} fontWeight={700}>vacuum</text>
        </g>

        {/* S4 caption */}
        <g opacity={ramp(f, B.notDefects, 18)}>
          <text x={W / 2} y={1000} textAnchor="middle" fontSize={34} fill={PAL.cream}>
            {"heat + vacuum removes water, "}
            <tspan fill={PAL.peach} fontWeight={700}>{"not defects"}</tspan>
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
