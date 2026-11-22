import type { FC } from "react";
import { Easing, interpolate } from "remotion";
import { FONT, PAL } from "../style";
import { makeRng, project, type Cam, type Vec3 } from "../quantum/proj3d";
import { NODE_R } from "../quantum/latticeStyle";

/* ------------------------------------------------------------------------ *
 * SHOT 05 · part A — the colourless crystal, as an actual 3-D lattice.
 *
 * Replaces the flat 5×5 sheet of dots. Two things come straight from the team's
 * canvas explainer and are the whole reason for the rewrite:
 *
 *  1. **Painter's algorithm.** Every primitive goes into one array with its own
 *     projected depth, and the array is sorted far-to-near. The defect glow is
 *     inserted at the vacancy's depth, so nodes that are nearer the camera
 *     genuinely cover it. The colour reads as light escaping from one broken
 *     site inside a solid, not as a decal painted behind a flat grid.
 *  2. **Deterministic particles.** A seeded LCG emits a burst from the vacancy.
 *     Same seed every frame, so the render is frame-exact.
 *
 * The vacancy is picked automatically: of all the surface nodes, the one that
 * spends the most of the shot nearest the camera. That way it stays legible as
 * the camera orbits, instead of disappearing behind the lattice for 15 seconds.
 *
 * Timings are unchanged from the flat version so the existing text overlays in
 * HKUST1Colour.tsx still land on the same beats.
 * ------------------------------------------------------------------------ */

const C = {
  green: "#3fbf7f",
  accent: PAL.lilac,
  ghost: "#6b7a99",
} as const;

const N = 4; // nodes per edge
const S = 116; // px per world unit
const CX = 1330;
const CY = 520;
const FOCAL = 14;
const AX = 0.4;
const MID = (N - 1) / 2;

const AY_AT = (frame: number) => 0.55 + 0.1 * (frame / 30);
const AXIS: Vec3 = [MID, MID, MID];

const camAt = (frame: number): Cam => ({
  ay: AY_AT(frame),
  ax: AX,
  S,
  cx: CX,
  cy: CY,
  center: AXIS,
  focal: FOCAL,
});

type Node = { i: number; j: number; k: number; d: number; surface: boolean };

const NODES: Node[] = (() => {
  const out: Node[] = [];
  for (let i = 0; i < N; i += 1)
    for (let j = 0; j < N; j += 1)
      for (let k = 0; k < N; k += 1) {
        const surface = i === 0 || i === N - 1 || j === 0 || j === N - 1 || k === 0 || k === N - 1;
        out.push({ i, j, k, d: i + j + k, surface });
      }
  return out;
})();

const key = (n: Node) => `${n.i}${n.j}${n.k}`;
const pos = (n: Node): Vec3 => [n.i, n.j, n.k];

/** every nearest-neighbour bond */
const EDGES: { a: Node; b: Node }[] = (() => {
  const out: { a: Node; b: Node }[] = [];
  for (const a of NODES) {
    for (const [di, dj, dk] of [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ] as const) {
      const b = NODES.find((n) => n.i === a.i + di && n.j === a.j + dj && n.k === a.k + dk);
      if (b) out.push({ a, b });
    }
  }
  return out;
})();

/** the vacancy: the surface node nearest the camera for most of the orbit */
const DEFECT: Node = (() => {
  let best = NODES[0];
  let bestScore = -Infinity;
  for (const n of NODES) {
    if (!n.surface) continue;
    let score = 0;
    for (let f = 0; f < 450; f += 15) score += project(pos(n), camAt(f)).k;
    if (score > bestScore) {
      bestScore = score;
      best = n;
    }
  }
  return best;
})();

const touchesDefect = (e: { a: Node; b: Node }) => key(e.a) === key(DEFECT) || key(e.b) === key(DEFECT);

/** a handful of nodes stay faintly lit — the shot's opening premise */
const FAINT = new Set(
  NODES.filter((n) => n.surface && key(n) !== key(DEFECT))
    .filter((_, i) => i % 9 === 0)
    .slice(0, 5)
    .map(key),
);

type Particle = { a: number; v: number; r: number; born: number; life: number; hue: string };
const PARTICLES: Particle[] = (() => {
  const rng = makeRng(20260118);
  return Array.from({ length: 46 }, () => ({
    a: rng() * Math.PI * 2,
    v: 0.6 + rng() * 1.9,
    r: 1.2 + rng() * 2.6,
    born: 258 + Math.floor(rng() * 70),
    life: 46 + Math.floor(rng() * 46),
    hue: rng() > 0.72 ? C.green : "#9fe8c4",
  }));
})();

const ramp = (frame: number, start: number, dur = 16): number =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

export const ColourlessLattice3D: FC<{ frame: number; defectAt?: number }> = ({
  frame,
  defectAt = 250,
}) => {
  const cam = camAt(frame);

  // the lattice builds outward from one corner, shell by shell
  const prog = ramp(frame, 10, 78) * 10;
  const particleShift = defectAt - 250;
  const dim = interpolate(frame, [150, 210], [1, 0.45], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const gone = ramp(frame, defectAt, 26);
  const glow = ramp(frame, defectAt + 12, 34);

  const alphaOf = (n: Node): number => {
    const base = Math.max(0, Math.min(1, prog - n.d * 1.05));
    if (base <= 0) return 0;
    if (key(n) === key(DEFECT)) return base * (1 - gone);
    return base * dim;
  };

  const pDefect = project(pos(DEFECT), cam);

  type Item = { z: number; id: string; el: JSX.Element };
  const items: Item[] = [];

  // The glow is centred on the vacancy in SCREEN space but pushed 2.2 world
  // units further back in DEPTH, so the front half of the lattice punches holes
  // in it. Put it at the vacancy's own depth and a 200 px glow in front of
  // everything washes the whole crystal green — the opposite of what this shot
  // says. (Numbers, not vibes: the vacancy ends up frontmost in ~70% of frames,
  // so "at the vacancy's depth" would mean "in front of the lattice".)
  if (glow > 0) {
    items.push({
      z: pDefect.z + 2.2,
      id: "glow",
      el: (
        <circle key="glow" cx={pDefect.x} cy={pDefect.y} r={205 * (0.7 + 0.3 * glow)} fill="url(#s5glow3d)" opacity={glow} />
      ),
    });
  }

  for (const e of EDGES) {
    const a1 = alphaOf(e.a);
    const a2 = alphaOf(e.b);
    const al = Math.min(a1, a2) * (touchesDefect(e) ? 1 - gone : 1);
    if (al <= 0.02) continue;
    const pa = project(pos(e.a), cam);
    const pb = project(pos(e.b), cam);
    const kMid = (pa.k + pb.k) / 2;
    items.push({
      z: (pa.z + pb.z) / 2,
      id: `e${key(e.a)}${key(e.b)}`,
      el: (
        <line
          key={`e${key(e.a)}${key(e.b)}`}
          x1={pa.x}
          y1={pa.y}
          x2={pb.x}
          y2={pb.y}
          stroke="#2b3a5c"
          strokeWidth={Math.max(1, 1.8 * kMid)}
          opacity={al * 0.75}
        />
      ),
    });
  }

  for (const n of NODES) {
    const al = alphaOf(n);
    if (al <= 0.02) continue;
    const p = project(pos(n), cam);
    const faint = FAINT.has(key(n));
    const lit = faint ? ramp(frame, 110 + (n.d + n.i) * 6, 20) : 0;
    items.push({
      z: p.z,
      id: `n${key(n)}`,
      el: (
        <circle
          key={`n${key(n)}`}
          cx={p.x}
          cy={p.y}
          r={NODE_R * p.k}
          fill={lit > 0.4 ? C.accent : "#3a4a6e"}
          opacity={al * 0.9 + 0.1 * lit}
        />
      ),
    });
  }

  items.sort((x, y) => y.z - x.z);

  return (
    <g>
      <defs>
        <radialGradient id="s5glow3d" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={C.green} stopOpacity={0.6} />
          <stop offset="42%" stopColor={C.green} stopOpacity={0.22} />
          <stop offset="100%" stopColor={C.green} stopOpacity={0} />
        </radialGradient>
      </defs>

      {items.map((it) => it.el)}

      {/* ghost of the missing node — drawn last so it is never buried */}
      <circle
        cx={pDefect.x}
        cy={pDefect.y}
        r={NODE_R * pDefect.k + 5}
        fill="none"
        stroke={C.green}
        strokeWidth={2}
        strokeDasharray="4 5"
        opacity={0.85 * gone}
      />

      {/* the burst: deterministic, screen-space, emitted from the vacancy */}
      {PARTICLES.map((p, i) => {
        const age = frame - (p.born + particleShift);
        if (age < 0 || age > p.life) return null;
        const t = age / p.life;
        const dist = age * p.v;
        return (
          <circle
            key={`p${i}`}
            cx={pDefect.x + Math.cos(p.a) * dist}
            cy={pDefect.y + Math.sin(p.a) * dist * 0.9}
            r={p.r * (1 - t * 0.5)}
            fill={p.hue}
            opacity={0.75 * (1 - t)}
          />
        );
      })}
    </g>
  );
};
