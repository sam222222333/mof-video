import type { FC } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import pw from "../data/paddlewheel-solvated.json";
import { FONT, PAL as BASE_PAL, BACKDROP_CSS, SectionTitle } from "../style";

/* ------------------------------------------------------------------------ *
 * SHOT 04 · 4a, version 3 — 38 s @ 30 fps (1140 frames)
 *
 *   paddlewheel down the axis -> side view + three distances ->
 *   heating drives off both axial waters (one, then the other) ->
 *   open metal sites -> CO2 binds at one -> but: moisture + heat ->
 *   Cu–carboxylate bonds break, the wheel falls apart (schematic).
 *
 * No Jahn–Teller here (separate section). No footnote (by request).
 * Distances are Chui 1999 literature values, not the model's own.
 * Overlay is projected with a real THREE camera matching the canvas camera.
 * ------------------------------------------------------------------------ */

const W = 1920;
const H = 1080;
const FOV = 40;
const CAM_Z = 25;

// Palette and background come from src/style.tsx; only a copper highlight is added
const PAL = { ...BASE_PAL, cu: "#7dd3fc" };

/* softer background colours: real element hues, just quieter */
const BG = { C: "#64708a", O: "#a8646e", H: "#9aa3b5", bond: "#4e586c" };
const CORE = { C: "#d5dde8", O: "#ef6b6b", bond: "#9aa6b8" };

type Atom = { e: string; x: number; y: number; z: number };
const ATOMS = pw.atoms as Atom[];
const BONDS = pw.bonds as [number, number][];
const WATER = new Set(pw.waterAtoms as number[]);
const P = (i: number) => new THREE.Vector3(ATOMS[i].x, ATOMS[i].y, ATOMS[i].z);
const CU = ATOMS.map((a, i) => (a.e === "Cu" ? i : -1)).filter((i) => i >= 0);
const AXIS = P(CU[1]).sub(P(CU[0])).normalize();

const CORE_O = new Set(
  ATOMS.map((_, i) => i).filter(
    (i) => ATOMS[i].e === "O" && !WATER.has(i) && CU.some((c) => P(c).distanceTo(P(i)) < 2.3),
  ),
);
const CORE_C = new Set(
  BONDS.flatMap(([i, j]) =>
    CORE_O.has(i) && ATOMS[j].e === "C" ? [j] : CORE_O.has(j) && ATOMS[i].e === "C" ? [i] : [],
  ),
);

/* the four linker arms = connected components once Cu and water are removed */
const ARM_OF = new Map<number, number>();
(() => {
  const adj = new Map<number, number[]>();
  ATOMS.forEach((_, i) => {
    if (!WATER.has(i) && !CU.includes(i)) adj.set(i, []);
  });
  BONDS.forEach(([a, b]) => {
    if (adj.has(a) && adj.has(b)) {
      adj.get(a)!.push(b);
      adj.get(b)!.push(a);
    }
  });
  let k = 0;
  for (const s of adj.keys()) {
    if (ARM_OF.has(s)) continue;
    const st = [s];
    while (st.length) {
      const x = st.pop()!;
      if (ARM_OF.has(x)) continue;
      ARM_OF.set(x, k);
      st.push(...adj.get(x)!);
    }
    k++;
  }
})();
const N_ARMS = Math.max(...ARM_OF.values()) + 1;
const ARM_C = Array.from({ length: N_ARMS }, (_, k) => {
  const ids = [...ARM_OF.entries()].filter(([, a]) => a === k).map(([i]) => i);
  return ids.reduce((acc, i) => acc.add(P(i)), new THREE.Vector3()).multiplyScalar(1 / ids.length);
});
/* deterministic tumble axes per arm */
const ARM_SPIN = [
  new THREE.Vector3(0.3, 1, 0.2).normalize(),
  new THREE.Vector3(-1, 0.4, 0.5).normalize(),
  new THREE.Vector3(0.6, -0.3, 1).normalize(),
  new THREE.Vector3(-0.2, -1, 0.7).normalize(),
];

/* waters: B (on CU[1]) leaves first, then A (on CU[0]) */
const waterOn = (cu: number) => {
  const o = (pw.axialO as number[]).find((x) => P(x).distanceTo(P(cu)) < 2.6)!;
  return { cu, o, atoms: new Set([...WATER].filter((i) => P(i).distanceTo(P(o)) < 1.2)) };
};
const WB = waterOn(CU[1]);
const WA = waterOn(CU[0]);
const EQ_OF_B = [...CORE_O].filter((i) => P(i).distanceTo(P(WB.cu)) < 2.3);

const RADII: Record<string, number> = { Cu: 0.74, O: 0.58, C: 0.54, H: 0.34 };

/* ------------------------------ camera ------------------------------ */
const Q_AXIS = new THREE.Quaternion()
  .setFromEuler(new THREE.Euler(0.18, -0.22, 0))
  .multiply(new THREE.Quaternion().setFromUnitVectors(AXIS, new THREE.Vector3(0, 0, 1)));
const Q_SIDE = new THREE.Quaternion()
  .setFromEuler(new THREE.Euler(Math.PI / 4 + 0.25, 0.25, 0))
  .multiply(new THREE.Quaternion().setFromUnitVectors(AXIS, new THREE.Vector3(1, 0, 0)));

const CAM = new THREE.PerspectiveCamera(FOV, W / H, 0.5, 300);
CAM.position.set(0, 0, CAM_Z);
CAM.updateMatrixWorld();
CAM.updateProjectionMatrix();
const toScreen = (v: THREE.Vector3, q: THREE.Quaternion, zoom: number) => {
  const p = v.clone().multiplyScalar(zoom).applyQuaternion(q).project(CAM);
  return { x: ((p.x + 1) / 2) * W, y: ((1 - p.y) / 2) * H };
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (f: number, s: number, d = 18) =>
  interpolate(f, [s, s + d], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
const span = (f: number, a: number, b: number, ease = Easing.inOut(Easing.cubic)) =>
  interpolate(f, [a, b], [0, 1], { ...clamp, easing: ease });

/* ------------------------------ beats ------------------------------ */
export const V3_FRAMES = 1140;
const B = {
  title: 10,
  caption: 40,
  swingStart: 125,
  swingEnd: 225,
  mCuCu: 245,
  mEq: 285,
  mAx: 325,
  measuresOut: 420,
  heatText: 440,
  glowB: 465,
  leaveB: [495, 585] as const,
  siteB: 570,
  glowA: 540,
  leaveA: [570, 660] as const,
  siteA: 645,
  openText: 665,
  textSwap1: 715,
  co2In: [730, 810] as const,
  co2Text: 760,
  but: 860,
  co2Out: [860, 900] as const,
  watersIn: [870, 960] as const,
  snap: [950, 1010] as const,
  apart: [990, 1110] as const,
  collapseText: 1000,
  fadeOut: 1115,
};

/* incoming waters for the collapse: start far away, land near the core */
const W_OFFS = [...WB.atoms].map((i) => ({ e: ATOMS[i].e, d: P(i).sub(P(WB.o)) }));
const INCOMING = [
  { from: new THREE.Vector3(14, 6, 4), to: P(WB.o).add(AXIS.clone().multiplyScalar(0.2)) },
  { from: new THREE.Vector3(-12, 9, 7), to: P(WA.o).add(AXIS.clone().multiplyScalar(-0.2)) },
  { from: new THREE.Vector3(4, 12, 8), to: new THREE.Vector3(1.4, 3.4, -1.6) },
  { from: new THREE.Vector3(10, -6, 9), to: new THREE.Vector3(-1.6, -3.2, 1.8) },
];

type Ball = { key: string; e: string; p: THREE.Vector3; color: string; em: number; op: number; scale?: number };
type Stick = { key: string; a: THREE.Vector3; b: THREE.Vector3; color: string; op: number; em?: number; r?: number };

export const PaddleV3: FC<{ durationInFrames?: number; offset?: number; timeScale?: number }> = ({
  durationInFrames = V3_FRAMES,
  offset = 0,
  timeScale = 1,
}) => {
  const f = offset + useCurrentFrame() * timeScale;

  /* ---------- orientation + zoom ---------- */
  const swing = span(f, B.swingStart, B.swingEnd);
  const q = Q_AXIS.clone().slerp(Q_SIDE, swing);
  const preSpin = interpolate(f, [0, B.swingEnd], [-0.35, 0], { ...clamp, easing: Easing.out(Easing.quad) });
  const drift = interpolate(f, [B.swingEnd, durationInFrames], [0, -0.3], clamp);
  q.premultiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, drift, preSpin)));
  const zoom =
    interpolate(swing, [0, 1], [0.84, 1.1]) * interpolate(f, [B.apart[0], B.apart[1]], [1, 0.58], clamp);

  /* ---------- water leaving (B then A) ---------- */
  const glowB = span(f, B.glowB, B.glowB + 25, Easing.linear);
  const glowA = span(f, B.glowA, B.glowA + 25, Easing.linear);
  const lvB = span(f, B.leaveB[0], B.leaveB[1], Easing.in(Easing.quad));
  const lvA = span(f, B.leaveA[0], B.leaveA[1], Easing.in(Easing.quad));
  const fadeW = (lv: number) => 1 - interpolate(lv, [0.5, 1], [0, 1], clamp);
  const outB = P(WB.o).sub(P(WB.cu)).normalize();
  const outA = P(WA.o).sub(P(WA.cu)).normalize();

  /* ---------- collapse ---------- */
  const snapK = (k: number) => span(f, B.snap[0] + k * 7, B.snap[0] + k * 7 + 12, Easing.linear); // 0..1 per bond
  const apart = span(f, B.apart[0], B.apart[1], Easing.inOut(Easing.quad));

  const armPos = (i: number) => {
    const k = ARM_OF.get(i)!;
    const c = ARM_C[k];
    const dir = c.clone().normalize();
    const rq = new THREE.Quaternion().setFromAxisAngle(ARM_SPIN[k % 4], 0.9 * apart);
    return P(i).sub(c).applyQuaternion(rq).add(c).add(dir.multiplyScalar(3.2 * apart));
  };
  const cuPos = (i: number) => {
    const sgn = i === CU[1] ? 1 : -1;
    return P(i).add(AXIS.clone().multiplyScalar(sgn * 1.2 * apart));
  };
  const posOf = (i: number): THREE.Vector3 => {
    if (CU.includes(i)) return cuPos(i);
    if (WB.atoms.has(i)) return P(i).add(outB.clone().multiplyScalar(8 * lvB));
    if (WA.atoms.has(i)) return P(i).add(outA.clone().multiplyScalar(8 * lvA));
    return armPos(i);
  };

  /* ---------- build the scene ---------- */
  const heat = Math.max(
    0.55 * span(f, B.heatText, B.heatText + 30) * (1 - span(f, B.openText, B.openText + 40)),
    span(f, B.but, B.but + 60),
  );

  const balls: Ball[] = [];
  const sticks: Stick[] = [];

  ATOMS.forEach((a, i) => {
    let color: string;
    let em = 0;
    let op = 1;
    let scale = 1;
    if (a.e === "Cu") {
      color = PAL.cu;
      em = 0.45;
    } else if (WATER.has(i)) {
      const isB = WB.atoms.has(i);
      const g = isB ? glowB : glowA;
      color = a.e === "O" ? PAL.lilac : "#e2e8f0";
      em = 0.15 + 0.4 * g;
      scale = 1 + 0.15 * g;
      op = fadeW(isB ? lvB : lvA);
    } else if (CORE_O.has(i)) color = CORE.O;
    else if (CORE_C.has(i)) color = CORE.C;
    else color = (BG as Record<string, string>)[a.e] ?? BG.C;
    if (op > 0.01) balls.push({ key: `a${i}`, e: a.e, p: posOf(i), color, em, op, scale });
  });

  let cuOk = 0;
  BONDS.forEach(([i, j], k) => {
    const wi = WATER.has(i);
    const wj = WATER.has(j);
    let op = 1;
    let em = 0;
    let color = BG.bond;
    const coreish = (x: number) => CORE_O.has(x) || CORE_C.has(x) || CU.includes(x) || WATER.has(x);
    if (coreish(i) && coreish(j)) color = CORE.bond;
    if (wi || wj) {
      const isB = WB.atoms.has(i) || WB.atoms.has(j);
      const lv = isB ? lvB : lvA;
      const breaking = wi !== wj; // Cu–OH2
      op = breaking ? 1 - interpolate(lv, [0, 0.12], [0, 1], clamp) : fadeW(lv);
    } else if (CU.includes(i) !== CU.includes(j)) {
      // Cu–O(carboxylate): these snap in the collapse, one after another
      const s = snapK(cuOk++);
      em = s < 0.5 ? s * 2 : 0;
      color = s > 0.02 && s < 0.6 ? PAL.peach : color;
      op = 1 - interpolate(s, [0.45, 1], [0, 1], clamp);
    } else if (CU.includes(i) && CU.includes(j)) {
      op = 1 - span(f, B.snap[1], B.snap[1] + 20, Easing.linear);
    }
    if (op > 0.01) sticks.push({ key: `b${k}`, a: posOf(i), b: posOf(j), color, op, em });
  });

  /* CO2: O=C=O, lands end-on at the open site of CU[1] */
  const co2In = span(f, B.co2In[0], B.co2In[1], Easing.out(Easing.cubic));
  const co2Out = span(f, B.co2Out[0], B.co2Out[1], Easing.linear);
  const co2Op = ramp(f, B.co2In[0], 15) * (1 - co2Out);
  if (co2Op > 0.01) {
    const site = P(WB.cu).add(outB.clone().multiplyScalar(2.45));
    const side = new THREE.Vector3(0, 1, 0).cross(outB).normalize();
    const travel = outB.clone().multiplyScalar(7).add(side.multiplyScalar(4)).multiplyScalar(1 - co2In);
    const away = outB.clone().multiplyScalar(5 * co2Out);
    const o1 = site.clone().add(travel).add(away);
    const c = o1.clone().add(outB.clone().multiplyScalar(1.16));
    const o2 = c.clone().add(outB.clone().multiplyScalar(1.16));
    balls.push({ key: "co2o1", e: "O", p: o1, color: CORE.O, em: 0.15, op: co2Op });
    balls.push({ key: "co2c", e: "C", p: c, color: "#e5e7eb", em: 0.1, op: co2Op });
    balls.push({ key: "co2o2", e: "O", p: o2, color: CORE.O, em: 0.15, op: co2Op });
    sticks.push({ key: "co2b1", a: o1, b: c, color: "#cbd5e1", op: co2Op, r: 0.2 });
    sticks.push({ key: "co2b2", a: c, b: o2, color: "#cbd5e1", op: co2Op, r: 0.2 });
    // the new weak contact to copper, once landed
    if (co2In > 0.97 && co2Out < 0.3)
      sticks.push({ key: "co2cu", a: P(WB.cu), b: o1, color: PAL.peach, op: 0.7 * (1 - co2Out * 3), r: 0.09 });
  }

  /* incoming waters for the collapse */
  INCOMING.forEach((w, n) => {
    const t = span(f, B.watersIn[0] + n * 8, B.watersIn[1] + n * 8, Easing.out(Easing.cubic));
    const op = ramp(f, B.watersIn[0] + n * 8, 15);
    if (op <= 0.01) return;
    const o = w.from.clone().lerp(w.to, t);
    // ride along with the pieces once things fall apart
    const ride = o.clone().normalize().multiplyScalar(3 * apart);
    o.add(ride);
    const pts = W_OFFS.map((x) => ({ e: x.e, p: o.clone().add(x.d) }));
    pts.forEach((x, m) =>
      balls.push({ key: `iw${n}_${m}`, e: x.e, p: x.p, color: x.e === "O" ? PAL.lilac : "#e2e8f0", em: 0.15, op }),
    );
    const oo = pts.find((x) => x.e === "O")!.p;
    pts.filter((x) => x.e === "H").forEach((x, m) =>
      sticks.push({ key: `iwb${n}_${m}`, a: oo, b: x.p, color: CORE.bond, op }),
    );
  });

  /* ---------- overlay helpers ---------- */
  const S = (v: THREE.Vector3) => toScreen(v, q, zoom);
  const eqO = EQ_OF_B.map((i) => ({ i, z: P(i).applyQuaternion(q).z })).sort((a, b) => b.z - a.z)[0].i;
  const measuresOn = 1 - ramp(f, B.measuresOut, 20);
  const measures = [
    { a: CU[0], b: CU[1], name: "Cu – Cu", val: "2.628 Å", col: PAL.cu, s: B.mCuCu, dx: -360, dy: -110 },
    { a: WB.cu, b: eqO, name: "Cu – O  (equatorial)", val: "1.952 Å", col: "#ef8f8f", s: B.mEq, dx: -360, dy: 150 },
    { a: WB.cu, b: WB.o, name: "Cu – OH₂  (axial)", val: "2.165 Å", col: PAL.lilac, s: B.mAx, dx: 300, dy: -150 },
  ];

  const ringAt = (o: number, start: number, end: number) => {
    const p = S(P(o));
    const t = Math.max(0, (f - start) / 30);
    const r = 34 + 12 * Math.sin(Math.min(t, 1) * Math.PI) * Math.exp(-t * 0.6);
    const op = ramp(f, start, 20) * (1 - ramp(f, end, 15));
    return { p, r, op };
  };
  const rings = [ringAt(WB.o, B.siteB, B.co2In[1] - 10), ringAt(WA.o, B.siteA, B.watersIn[0] + 40)];

  const fadeIn = ramp(f, 0, 22);
  const fadeOut = interpolate(f, [B.fadeOut, durationInFrames], [1, 0], clamp);

  /* caption blocks (lower left). Each block fades in, and out when the next arrives. */
  const block = (a: number, b: number) => ramp(f, a, 20) * (1 - ramp(f, b, 18));

  return (
    <AbsoluteFill style={{ background: BACKDROP_CSS, opacity: fadeIn * fadeOut }}>
      <ThreeCanvas width={W} height={H} camera={{ position: [0, 0, CAM_Z], fov: FOV, near: 0.5, far: 300 }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[6, 9, 8]} intensity={1.9} />
        <pointLight position={[-7, -4, 6]} intensity={0.6} color={PAL.lilac} />
        <pointLight position={[0, -8, 6]} intensity={3.5 * heat} color={PAL.peach} />
        <group quaternion={q} scale={zoom}>
          {balls.map((b) => (
            <mesh key={b.key} position={b.p} scale={b.scale ?? 1}>
              <sphereGeometry args={[RADII[b.e] ?? 0.4, 32, 32]} />
              <meshStandardMaterial
                color={b.color}
                emissive={b.color}
                emissiveIntensity={b.em}
                roughness={0.4}
                transparent={b.op < 1}
                opacity={b.op}
              />
            </mesh>
          ))}
          {sticks.map((s) => {
            const d = s.b.clone().sub(s.a);
            return (
              <mesh
                key={s.key}
                position={s.a.clone().add(s.b).multiplyScalar(0.5)}
                quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize())}
              >
                <cylinderGeometry args={[s.r ?? 0.14, s.r ?? 0.14, d.length(), 12]} />
                <meshStandardMaterial
                  color={s.color}
                  emissive={s.color}
                  emissiveIntensity={s.em ?? 0}
                  roughness={0.5}
                  transparent={s.op < 1}
                  opacity={s.op}
                />
              </mesh>
            );
          })}
        </group>
      </ThreeCanvas>

      {/* warm wash for "heat" */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(circle at 50% 75%, rgba(253,186,116,0.16) 0%, rgba(253,186,116,0) 60%)",
          opacity: heat,
        }}
      />

      <svg width={W} height={H} style={{ position: "absolute", inset: 0, fontFamily: FONT }}>
        <SectionTitle opacity={ramp(f, B.title, 20)}>the paddlewheel</SectionTitle>
        <g opacity={ramp(f, B.caption, 20) * (1 - ramp(f, B.swingStart + 20, 20))}>
          <text x={120} y={196} fontSize={32} fill={PAL.cream}>
            {"two Cu²⁺ ions bridged by four carboxylates"}
          </text>
          <text x={120} y={238} fontSize={24} fill={PAL.mute}>
            {"looking straight down the Cu–Cu axis"}
          </text>
        </g>

        {measures.map((m, k) => {
          const A = S(posOf(m.a));
          const Bp = S(posOf(m.b));
          const p = ramp(f, m.s, 18) * measuresOn;
          if (p <= 0.001) return null;
          const mx = (A.x + Bp.x) / 2;
          const my = (A.y + Bp.y) / 2;
          const lx = mx + m.dx;
          const ly = my + m.dy;
          const anchor = m.dx > 40 ? "start" : m.dx < -40 ? "end" : "middle";
          const tip = m.dx > 40 ? lx - 14 : m.dx < -40 ? lx + 14 : lx;
          const draw = ramp(f, m.s, 18);
          return (
            <g key={k} opacity={p}>
              <line x1={A.x} y1={A.y} x2={A.x + (Bp.x - A.x) * draw} y2={A.y + (Bp.y - A.y) * draw}
                stroke={m.col} strokeWidth={6} strokeLinecap="round" opacity={0.9} />
              <circle cx={A.x} cy={A.y} r={6} fill={m.col} />
              <circle cx={Bp.x} cy={Bp.y} r={6} fill={m.col} />
              <line x1={mx} y1={my} x2={tip} y2={ly - 12} stroke={m.col} strokeWidth={1.6} strokeDasharray="5 6" opacity={0.6} />
              <circle cx={tip} cy={ly - 12} r={4} fill={m.col} />
              <text x={lx} y={ly - 30} textAnchor={anchor} fontSize={24} fontWeight={600} fill={m.col}>
                {m.name}
              </text>
              <text x={lx} y={ly + 14} textAnchor={anchor} fontSize={38} fontWeight={700} fill={PAL.cream}>
                {m.val}
              </text>
            </g>
          );
        })}

        {rings.map((r, k) =>
          r.op > 0.01 ? (
            <g key={`r${k}`} opacity={r.op}>
              <circle cx={r.p.x} cy={r.p.y} r={r.r} fill="none" stroke={PAL.peach} strokeWidth={3} />
              <circle cx={r.p.x} cy={r.p.y} r={r.r + 14} fill="none" stroke={PAL.peach} strokeWidth={1.5} opacity={0.35} />
            </g>
          ) : null,
        )}

        {/* captions, lower left */}
        <g opacity={block(B.heatText, B.textSwap1)}>
          <text x={120} y={808} fontSize={34} fill={PAL.cream}>
            {"heating drives off"}
          </text>
          <text x={120} y={852} fontSize={34} fill={PAL.cream}>
            {"the axial water"}
          </text>
        </g>
        <g opacity={block(B.openText, B.textSwap1)}>
          <text x={120} y={912} fontSize={34} fill={PAL.peach} fontWeight={700}>
            {"→  open metal sites"}
          </text>
        </g>
        <g opacity={block(B.co2Text, B.but)}>
          <text x={120} y={860} fontSize={34} fill={PAL.cream}>
            {"an open Cu site binds CO₂"}
          </text>
          <text x={120} y={904} fontSize={24} fill={PAL.mute}>
            {"a reactive site for CO₂ adsorption"}
          </text>
        </g>
        <g opacity={block(B.but, B.collapseText)}>
          <text x={120} y={860} fontSize={34} fill={PAL.cream}>
            {"but water and heat"}
          </text>
          <text x={120} y={904} fontSize={34} fill={PAL.cream}>
            {"attack the Cu–O bonds…"}
          </text>
        </g>
        <g opacity={ramp(f, B.collapseText, 20)}>
          <text x={120} y={860} fontSize={34} fill={PAL.peach} fontWeight={700}>
            {"early MOFs degraded and collapsed"}
          </text>
          <text x={120} y={904} fontSize={34} fill={PAL.cream}>
            {"on exposure to moisture and heat"}
          </text>
        </g>
        <text x={1800} y={1010} textAnchor="end" fontSize={21} fill={PAL.mute} opacity={ramp(f, B.watersIn[0], 20) * 0.9}>
          schematic
        </text>
      </svg>
    </AbsoluteFill>
  );
};
