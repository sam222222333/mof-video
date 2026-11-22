import type { FC } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { FONT, PAL, BACKDROP_CSS } from "../style";

/* ------------------------------------------------------------------------ *
 * GENERAL INFORMATION — "what is a MOF?" (1073 f = 35.77 s at 30 fps)
 * Cues are the real voice-over's sentence starts (vo-timeline.json, local f):
 *     0-109  question card
 *   119-244  one cell assembles: nodes tick in, linkers follow
 *   244-357  "metal nodes" / "organic ligands" labels
 *   377-501  camera pulls back into a periodic lattice + checklist
 *   501-614  "extends in 3D" / "nano-sized pores" -> pores start to glow
 *   649-802  "up to 90 % empty space" -> fill bar
 *   828-1018 HKUST-1 card
 * The cell is SCHEMATIC (simple cubic), not HKUST-1's real structure.
 * On-screen text says "metal-organic" even though the narrator says "metallic".
 * ------------------------------------------------------------------------ */

const ramp = (f: number, s: number, d = 18): number =>
  interpolate(f, [s, s + d], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
const lin = (f: number, a: number, b: number): number =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const NODE = PAL.lilac;
const LINK = PAL.cream;
const PORE = PAL.peach;

type V3 = [number, number, number];
const N = 5; // nodes per side in the final crystal (4 cells)

export const GENERAL_FRAMES = 1073; // 35.77 s — runs to the first line of Inorganic

export const GeneralInfo: FC = () => {
  const F = useCurrentFrame();

  const head = ramp(F, 0, 12) * (1 - lin(F, 826, 846));
  const scene = ramp(F, 112, 20) * (1 - lin(F, 826, 846));
  const sD = ramp(F, 828, 22);

  // ---- camera
  const g = 1 + 3 * Easing.inOut(Easing.cubic)(lin(F, 380, 520)); // grown extent in cells (1 -> 4)
  const cc = 0.5 + (g - 1) * 0.5; // look-at centre tracks the middle of what exists
  const S = 300 / (0.55 + g * 0.62); // px per lattice unit
  const theta = 0.55 + F * 0.0095;
  const phi = 0.42;
  const cx0 = 960;
  const cy0 = 585;

  const proj = (p: V3): { x: number; y: number; d: number } => {
    const x = p[0] - cc;
    const y = p[1] - cc;
    const z = p[2] - cc;
    const xr = Math.cos(theta) * x + Math.sin(theta) * z;
    const zr = -Math.sin(theta) * x + Math.cos(theta) * z;
    const yr = Math.cos(phi) * y - Math.sin(phi) * zr;
    const d = Math.sin(phi) * y + Math.cos(phi) * zr;
    return { x: cx0 + S * xr, y: cy0 + S * yr, d };
  };

  // ---- visibility of nodes: first cell assembles in order, the rest grows in
  const inCell = (i: number, j: number, k: number) => Math.max(i, j, k) <= 1;
  const nodeP = (i: number, j: number, k: number): number => {
    if (inCell(i, j, k)) return ramp(F, 130 + (i + 2 * j + 4 * k) * 14, 18);
    return Math.max(0, Math.min(1, g - Math.max(i, j, k) + 1));
  };
  const edgeP = (a: V3, b: V3): number => {
    const pa = nodeP(a[0], a[1], a[2]);
    const pb = nodeP(b[0], b[1], b[2]);
    const base = Math.min(pa, pb);
    if (inCell(a[0], a[1], a[2]) && inCell(b[0], b[1], b[2])) {
      const idx = a[0] + 2 * a[1] + 4 * a[2] + (b[0] + 2 * b[1] + 4 * b[2]);
      return Math.min(base, ramp(F, 215 + idx * 9, 24));
    }
    return base;
  };

  type Item = { d: number; el: React.ReactNode };
  const items: Item[] = [];

  // pore glows (behind everything): every cell centre lights up
  const glow = ramp(F, 590, 45);
  const glows: React.ReactNode[] = [];
  if (glow > 0) {
    for (let i = 0; i < N - 1; i++)
      for (let j = 0; j < N - 1; j++)
        for (let k = 0; k < N - 1; k++) {
          const pc = proj([i + 0.5, j + 0.5, k + 0.5]);
          const vis = Math.min(nodeP(i, j, k), nodeP(i + 1, j + 1, k + 1));
          if (vis <= 0) continue;
          glows.push(
            <circle key={`g${i}${j}${k}`} cx={pc.x} cy={pc.y} r={S * 0.42} fill="url(#poreGlow)" opacity={glow * vis} />
          );
        }
  }

  // linkers: node - ring - node
  const rho = 0.17;
  const nodeR = 0.085;
  const perp = (e: V3): V3 => (e[0] ? [0, 1, 0] : e[1] ? [0, 0, 1] : [1, 0, 0]);
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++)
      for (let k = 0; k < N; k++) {
        const a: V3 = [i, j, k];
        for (const e of [[1, 0, 0], [0, 1, 0], [0, 0, 1]] as V3[]) {
          const b: V3 = [i + e[0], j + e[1], k + e[2]];
          if (b[0] >= N || b[1] >= N || b[2] >= N) continue;
          const p = edgeP(a, b);
          if (p <= 0.01) continue;
          const m: V3 = [i + e[0] / 2, j + e[1] / 2, k + e[2] / 2];
          const q = perp(e);
          const ring: string[] = [];
          for (let t = 0; t < 6; t++) {
            const ang = (t * Math.PI) / 3;
            const v: V3 = [
              m[0] + rho * (Math.cos(ang) * e[0] + Math.sin(ang) * q[0]),
              m[1] + rho * (Math.cos(ang) * e[1] + Math.sin(ang) * q[1]),
              m[2] + rho * (Math.cos(ang) * e[2] + Math.sin(ang) * q[2]),
            ];
            const pv = proj(v);
            ring.push(`${pv.x},${pv.y}`);
          }
          const a0 = proj(a);
          const b0 = proj(b);
          const e1 = proj([m[0] - rho * e[0], m[1] - rho * e[1], m[2] - rho * e[2]]);
          const e2 = proj([m[0] + rho * e[0], m[1] + rho * e[1], m[2] + rho * e[2]]);
          const md = proj(m);
          const w = Math.max(2, S * 0.022);
          items.push({
            d: md.d,
            el: (
              <g key={`e${i}${j}${k}${e.join("")}`} opacity={p} stroke={LINK} strokeLinecap="round" strokeLinejoin="round">
                <line x1={a0.x} y1={a0.y} x2={e1.x} y2={e1.y} strokeWidth={w} />
                <line x1={e2.x} y1={e2.y} x2={b0.x} y2={b0.y} strokeWidth={w} />
                <polygon points={ring.join(" ")} fill="none" strokeWidth={w * 0.85} />
              </g>
            ),
          });
        }
      }

  // nodes
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++)
      for (let k = 0; k < N; k++) {
        const p = nodeP(i, j, k);
        if (p <= 0.01) continue;
        const pp = proj([i, j, k]);
        items.push({
          d: pp.d,
          el: (
            <circle
              key={`n${i}${j}${k}`}
              cx={pp.x}
              cy={pp.y}
              r={S * nodeR * (0.5 + 0.5 * p)}
              fill="url(#nodeGrad)"
              opacity={p}
            />
          ),
        });
      }
  items.sort((u, v) => v.d - u.d); // far first

  // ---- labels
  const labCell = ramp(F, 250, 20) * (1 - lin(F, 377, 397));
  // leader targets: left-most node of the first cell, left-most lower linker
  let nodePt = proj([0, 0, 0]);
  for (const a of [0, 1]) for (const b of [0, 1]) for (const c of [0, 1]) {
    const q = proj([a, b, c]);
    if (q.x < nodePt.x) nodePt = q;
  }
  let linkPt = { x: 9999, y: 0, d: 0 };
  for (const a of [0, 1]) for (const b of [0, 1]) for (const c of [0, 1]) {
    for (const e of [[1, 0, 0], [0, 1, 0], [0, 0, 1]] as V3[]) {
      if ((e[0] && a) || (e[1] && b) || (e[2] && c)) continue;
      const q = proj([a + e[0] / 2, b + e[1] / 2, c + e[2] / 2]);
      if (q.y > cy0 + 20 && q.x < linkPt.x) linkPt = q;
    }
  }
  const labPore = ramp(F, 690, 20);
  const porePt = proj([1.5, 1.5, 1.5]);
  const bar = ramp(F, 715, 50);

  return (
    <AbsoluteFill style={{ background: BACKDROP_CSS, fontFamily: FONT }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ fontFamily: FONT }}>
        <defs>
          <radialGradient id="nodeGrad" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#e0e7ff" />
            <stop offset="45%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#3730a3" />
          </radialGradient>
          <radialGradient id="poreGlow">
            <stop offset="0%" stopColor={PORE} stopOpacity={0.55} />
            <stop offset="100%" stopColor={PORE} stopOpacity={0} />
          </radialGradient>
        </defs>

        <text x={120} y={130} fontSize={46} fontWeight={800} fill={PAL.lilac} opacity={head}>
          What is a metal–organic framework (MOF)?
        </text>

        <g opacity={scene}>
          {glows}
          {items.map((it) => it.el)}

          {/* cell labels with leader lines */}
          <g opacity={labCell}>
            <line x1={470} y1={430} x2={nodePt.x} y2={nodePt.y} stroke={NODE} strokeWidth={2} opacity={0.7} />
            <text x={460} y={438} textAnchor="end" fontSize={34} fontWeight={700} fill={NODE}>
              metal node
            </text>
            <text x={460} y={474} textAnchor="end" fontSize={24} fill={PAL.mute}>
              metal ion or cluster
            </text>
            <line x1={470} y1={800} x2={linkPt.x} y2={linkPt.y} stroke={LINK} strokeWidth={2} opacity={0.7} />
            <text x={460} y={808} textAnchor="end" fontSize={34} fontWeight={700} fill={LINK}>
              organic linker
            </text>
            <text x={960} y={1010} textAnchor="middle" fontSize={26} fill={PAL.mute}>
              schematic cell
            </text>
          </g>


          {/* checklist: each property fades in, then its tick draws */}
          {[
            ["ordered", 390],
            ["crystalline", 440],
            ["periodic", 490],
            ["extends in 3D", 540],
            ["nano-sized pores", 590],
          ].map(([label, t], i) => {
            const p = ramp(F, t as number, 18);
            const tk = ramp(F, (t as number) + 14, 16);
            const out = 1 - lin(F, 630, 650);
            const y = 430 + i * 92;
            return (
              <g key={label as string} opacity={p * out} transform={`translate(0,${(1 - p) * 10})`}>
                <path
                  d={`M 128 ${y - 10} L 146 ${y + 10} L 182 ${y - 28}`}
                  fill="none"
                  stroke="#4ade80"
                  strokeWidth={8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - tk}
                />
                <text x={210} y={y + 4} fontSize={40} fontWeight={600} fill={PAL.cream}>
                  {label}
                </text>
              </g>
            );
          })}

          {/* pores */}
          <g opacity={labPore}>
            <line x1={1450} y1={330} x2={porePt.x + 30} y2={porePt.y - 10} stroke={PORE} strokeWidth={2} opacity={0.8} />
            <text x={1460} y={338} fontSize={34} fontWeight={700} fill={PORE}>
              pores: empty space
            </text>
            <rect x={600} y={965} width={720} height={26} rx={13} fill={NODE} fillOpacity={0.5} />
            <rect x={600} y={965} width={720 * 0.9 * bar} height={26} rx={13} fill={PORE} />
            <text x={600} y={950} fontSize={32} fontWeight={700} fill={PORE}>
              up to ≈ 90 % empty space
            </text>
            <text x={1320} y={950} textAnchor="end" fontSize={28} fill={PAL.cream}>
              → huge surface area
            </text>
          </g>
        </g>

        {/* HKUST-1 */}
        <g opacity={sD} transform={`translate(0,${(1 - sD) * 14})`}>
          <text x={960} y={440} textAnchor="middle" fontSize={34} fill={PAL.mute}>
            one example, the focus of this video
          </text>
          <text x={960} y={560} textAnchor="middle" fontSize={120} fontWeight={800} fill={PAL.lilac}>
            HKUST-1
          </text>
          <text x={960} y={640} textAnchor="middle" fontSize={50} fill={PAL.cream}>
            also known as MOF-199
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
