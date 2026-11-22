import type { FC } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";
import { BACKDROP_CSS, FONT, PAL } from "../style";
import {
  CRY,
  Diamond,
  FlowScene,
  FutureTitle,
  INK,
  LIQ,
  clamp,
  hash,
  ramp,
} from "./FlowFuture";

/* ------------------------------------------------------------------------ *
 * FUTURE OF MOFs - closing scene; the "Future of MOFs" title is permanent.
 *   shot  narration                                  frames (30 fps)
 *   1     batch -> continuous flow                   0    - 286
 *   2     drug delivery                              286  - 660
 *   3     conductive MOFs, solid-state battery       660  - 920
 *   4     grid storage, greener future               920  - 1134
 *   5     "Thank you for watching" + fade out        1134 - 1180
 * Flat schematics, no circles; every shot takes a local frame prop.
 * ------------------------------------------------------------------------ */

/* Shot cuts from the Future part of vo-timeline.json, silences removed.
   local = absolute - 7726; the 11 sentences span 1403 frames; 7 gaps of >= 15
   frames keep 8 frames each, 225 frames cut -> vo-future.wav 1178 frames (39.27 s).
   Sentence cues in the new timeline (local frames, 30 fps):
     #1 0-129     #5 425-524    #9   924-992
     #2 145-235   #6 524-656    #10  992-1130
     #3 247-282   #7 664-810    #11 1138-1178
     #4 303-404   #8 826-916
   Shot cues at silence midpoints: 0-286, 286-660, 660-920, 920-1134, 1134-1180. */
export const FUTURE_SHOTS = [0, 286, 660, 920, 1134, 1180] as const;
export const FUTURE_FRAMES = 1180;

type SubItem = { a: number; b: number; text: string };

/** Sub-heading under the permanent title (y 170). */
const Sub: FC<{ f: number; items: SubItem[] }> = ({ f, items }) => (
  <g>
    {items.map((it, i) => (
      <text
        key={i}
        x={120}
        y={170}
        fontFamily={FONT}
        fontSize={30}
        fontWeight={700}
        fill={PAL.cream}
        opacity={ramp(f, it.a, it.a + 14) * (1 - ramp(f, it.b - 14, it.b))}
      >
        {it.text}
      </text>
    ))}
  </g>
);

/** Bottom caption chip, one at a time. */
const Cap: FC<{ f: number; items: SubItem[]; y?: number }> = ({ f, items, y = 940 }) => (
  <g>
    {items.map((it, i) => {
      const o = ramp(f, it.a, it.a + 14) * (1 - ramp(f, it.b - 14, it.b));
      const w = Math.max(520, it.text.length * 19 + 80);
      return (
        <g key={i} opacity={o} transform={`translate(0,${(1 - o) * 12})`}>
          <rect x={960 - w / 2} y={y - 52} width={w} height={84} rx={20} fill="rgba(165,180,252,0.10)" stroke="rgba(165,180,252,0.4)" strokeWidth={1.5} />
          <text x={960} y={y + 2} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={700} fill={PAL.white}>
            {it.text}
          </text>
        </g>
      );
    })}
  </g>
);

const hexPts = (cx: number, cy: number, r: number) =>
  Array.from({ length: 6 })
    .map((_, k) => `${cx + r * Math.cos((k * Math.PI) / 3 + Math.PI / 6)},${cy + r * Math.sin((k * Math.PI) / 3 + Math.PI / 6)}`)
    .join(" ");

/* A small, honest footnote used wherever a MOF diagram is drawn. */
const Simplified: FC<{ o?: number }> = ({ o = 1 }) => (
  <text x={960} y={1032} textAnchor="middle" fontFamily={FONT} fontSize={22} fill={PAL.mute} opacity={o * 0.9}>
    simplified MOF diagram
  </text>
);

/* =========================== SHOT 2 · DRUG DELIVERY ===================== */
/* A MOF particle as a cubic framework: metal nodes joined by organic linkers,
 * open cavities between them (oblique projection, 3 x 3 x 3 cavities). */
const CS = 60;
const CDX = 30;
const CDY = -22;
const cp = (i: number, j: number, k: number) => ({
  x: i * CS + k * CDX - 135,
  y: j * CS + k * CDY - 57,
});
const CUBE_EDGES = (() => {
  const e: { a: { x: number; y: number }; b: { x: number; y: number }; k: number }[] = [];
  for (let k = 0; k <= 3; k++)
    for (let j = 0; j <= 3; j++)
      for (let i = 0; i <= 3; i++) {
        if (i < 3) e.push({ a: cp(i, j, k), b: cp(i + 1, j, k), k });
        if (j < 3) e.push({ a: cp(i, j, k), b: cp(i, j + 1, k), k });
        if (k < 3) e.push({ a: cp(i, j, k), b: cp(i, j, k + 1), k: k + 0.5 });
      }
  return e.sort((p, q) => q.k - p.k);
})();
const CUBE_NODES = (() => {
  const n: { x: number; y: number; k: number }[] = [];
  for (let k = 3; k >= 0; k--)
    for (let j = 0; j <= 3; j++) for (let i = 0; i <= 3; i++) n.push({ ...cp(i, j, k), k });
  return n;
})();
const CAV = (() => {
  const c: { x: number; y: number; k: number }[] = [];
  for (let k = 2; k >= 0; k--)
    for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) c.push({ ...cp(i + 0.5, j + 0.5, k + 0.5), k });
  return c;
})();

/** Two-tone capsule = one drug dose. `a` is its rotation in degrees. */
const Pill: FC<{ x: number; y: number; a?: number; k?: number; o?: number }> = ({ x, y, a = 0, k = 1, o = 1 }) => {
  const L = 26 * k;
  const W = 13 * k;
  const r = W / 2;
  return (
    <g transform={`translate(${x},${y}) rotate(${a})`} opacity={o}>
      <rect x={-L / 2} y={-r} width={L} height={W} rx={r} fill={PAL.peach} />
      <path d={`M 0 ${-r} H ${L / 2 - r} A ${r} ${r} 0 0 1 ${L / 2 - r} ${r} H 0 Z`} fill="#f8fafc" />
      <rect x={-L / 2} y={-r} width={L} height={W} rx={r} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={1.2} />
    </g>
  );
};

const Drug: FC<{ f: number }> = ({ f }) => {
  const N = CAV.length;
  const e = { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) } as const;
  const s = interpolate(f, [255, 307], [1.8, 0.9], e);
  const px = interpolate(f, [255, 307], [640, 1225], e);
  const py = 610;
  const cellX = 1565;
  const oVessel = ramp(f, 258, 285);

  const blob = Array.from({ length: 28 })
    .map((_, k) => {
      const a = (k / 28) * Math.PI * 2;
      const r = 185 + 16 * Math.sin(3 * a + 0.6) + 8 * Math.sin(5 * a);
      return `${cellX + r * Math.cos(a)},${py + r * 0.92 * Math.sin(a)}`;
    })
    .join(" ");
  const hit = clamp((f - 345) / 50);
  const tIn = (i: number) => 130 + (i / N) * 85;
  const tOut = (i: number) => 313 + (i / N) * 36;

  return (
    <g>
      <g opacity={oVessel}>
        <line x1={120} y1={py - 160} x2={1360} y2={py - 160} stroke={INK} strokeWidth={5} opacity={0.55} />
        <line x1={120} y1={py + 160} x2={1360} y2={py + 160} stroke={INK} strokeWidth={5} opacity={0.55} />
        <text x={150} y={py + 205} fontFamily={FONT} fontSize={22} fill={PAL.mute}>
          bloodstream
        </text>
        <polygon points={blob} fill={`rgba(244,114,182,${0.22 - hit * 0.12})`} stroke="#f472b6" strokeWidth={4} strokeLinejoin="round" opacity={0.95} />
        <polygon points={hexPts(cellX + 20, py, 52 - hit * 22)} fill={`rgba(190,24,93,${0.55 - hit * 0.35})`} stroke="#f472b6" strokeWidth={3} />
        <text x={cellX} y={py + 235} textAnchor="middle" fontFamily={FONT} fontSize={24} fill="#f9a8d4">
          cancer cell
        </text>
      </g>

      <g transform={`translate(${px},${py}) scale(${s})`}>
        {CUBE_EDGES.map((ed, i) => (
          <line
            key={"e" + i}
            x1={ed.a.x}
            y1={ed.a.y}
            x2={ed.b.x}
            y2={ed.b.y}
            stroke={PAL.lilac}
            strokeWidth={(ed.k > 2 ? 2.2 : 3.2) / Math.sqrt(s)}
            opacity={ramp(f, 4 + (3 - ed.k) * 8, 34 + (3 - ed.k) * 8) * (0.4 + 0.6 * (1 - ed.k / 3.4))}
            strokeLinecap="round"
          />
        ))}
        {CUBE_NODES.map((n, i) => {
          const z = 15 - n.k * 1.6;
          return (
            <rect
              key={"n" + i}
              x={n.x - z / 2}
              y={n.y - z / 2}
              width={z}
              height={z}
              rx={3}
              fill="#818cf8"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth={1.2 / s}
              opacity={ramp(f, 10 + (3 - n.k) * 8, 36 + (3 - n.k) * 8) * (0.55 + 0.45 * (1 - n.k / 3))}
            />
          );
        })}
        {(() => {
          const a0 = tIn(0);
          const sx = 330 + hash(3) * 200;
          const sy = (hash(17) - 0.5) * 420;
          const u = ramp(f, a0, a0 + 40);
          const lo = ramp(f, a0 - 6, a0 + 4) * (1 - ramp(f, a0 + 46, a0 + 70));
          return (
            <text x={sx + (CAV[0].x - sx) * u + 24} y={sy + (CAV[0].y - sy) * u - 22} fontFamily={FONT} fontSize={30 / s} fontWeight={800} fill={PAL.peach} opacity={lo}>
              drug
            </text>
          );
        })()}
        {CAV.map((p, i) => {
          const a = tIn(i);
          const b = tOut(i);
          const sx = 330 + hash(i + 3) * 200;
          const sy = (hash(i + 17) - 0.5) * 420;
          if (f >= a && f < a + 40) {
            const u = ramp(f, a, a + 40);
            return <Pill key={"i" + i} x={sx + (p.x - sx) * u} y={sy + (p.y - sy) * u} a={hash(i + 31) * 360 * (1 - u) + 20} />;
          }
          if (f >= a + 40 && f < b) return <Pill key={"f" + i} x={p.x} y={p.y} a={20 + hash(i + 31) * 40 - 20} />;
          if (f >= b && f < b + 30) {
            const u = ramp(f, b, b + 30);
            const tx = (cellX - px) / s + (hash(i + 5) - 0.5) * 120;
            const ty = ((hash(i + 8) - 0.5) * 140) / s;
            return <Pill key={"o" + i} x={p.x + (tx - p.x) * u} y={p.y + (ty - p.y) * u} a={20 + u * 200 * (hash(i + 31) - 0.3)} k={1 - 0.3 * u} o={1 - 0.6 * u} />;
          }
          return null;
        })}
      </g>
    </g>
  );
};

const DrugScene: FC<{ f: number }> = ({ f }) => (
  <g>
    <Sub
      f={f}
      items={[
        { a: 0, b: 130, text: "MOFs as nano-carriers for drug delivery" },
        { a: 130, b: 257, text: "loading the pores" },
        { a: 257, b: 999, text: "Targeted delivery" },
      ]}
    />
    <Drug f={f} />
    <Cap
      f={f}
      items={[
        { a: 30, b: 128, text: "metal nodes + organic linkers make a porous framework" },
        { a: 138, b: 252, text: "pores absorb high volumes of small-molecule drugs or proteins" },
        { a: 267, b: 317, text: "carried through the body to the target" },
        { a: 329, b: 999, text: "drug released at the cancer cell" },
      ]}
    />
    <Simplified o={ramp(f, 24, 44)} />
  </g>
);

/* ====================== SHOT 3 · CONDUCTIVE MOF + BATTERY =============== */
/* Honeycomb 2-D MOF in the style of M3(HITP)2: organic ligands (small rings)
 * at the vertices, metal nodes (M) on the bonds, hexagonal pores between. */
const Lattice: FC<{
  cx: number;
  cy: number;
  cols: number;
  rows: number;
  L: number;
  o?: number;
  label?: boolean;
}> = ({ cx, cy, cols, rows, L, o = 1, label = true }) => {
  const w = L * Math.sqrt(3);
  const x0 = cx - ((cols - 1) * w) / 2 - w / 4;
  const y0 = cy - ((rows - 1) * L * 1.5) / 2;
  const verts = new Map<string, { x: number; y: number }>();
  const edges = new Map<string, [{ x: number; y: number }, { x: number; y: number }]>();
  const key = (p: { x: number; y: number }) => `${Math.round(p.x)}_${Math.round(p.y)}`;
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const hx = x0 + i * w + (j % 2 ? w / 2 : 0);
      const hy = y0 + j * L * 1.5;
      const pts = Array.from({ length: 6 }).map((_, k) => {
        const a = (k * Math.PI) / 3 + Math.PI / 6;
        return { x: hx + L * Math.cos(a), y: hy + L * Math.sin(a) };
      });
      pts.forEach((p) => verts.set(key(p), p));
      for (let k = 0; k < 6; k++) {
        const a = pts[k];
        const b = pts[(k + 1) % 6];
        const ek = [key(a), key(b)].sort().join("|");
        edges.set(ek, [a, b]);
      }
    }
  const lg = L * 0.2;
  return (
    <g opacity={o}>
      {[...edges.values()].map(([a, b], i) => (
        <line key={"b" + i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={PAL.lilac} strokeWidth={Math.max(2, L * 0.05)} opacity={0.8} />
      ))}
      {[...verts.values()].map((p, i) => (
        <polygon key={"l" + i} points={hexPts(p.x, p.y, lg)} fill="rgba(129,140,248,0.35)" stroke={PAL.lilac} strokeWidth={Math.max(1.5, L * 0.04)} />
      ))}
      {[...edges.values()].map(([a, b], i) => {
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const z = Math.max(9, L * 0.25);
        return (
          <g key={"m" + i}>
            <rect x={mx - z / 2} y={my - z / 2} width={z} height={z} rx={2} fill={PAL.peach} />
            {label && L > 40 && (
              <text x={mx} y={my + 4} textAnchor="middle" fontFamily={FONT} fontSize={z * 0.8} fontWeight={800} fill="#1f2937">
                M
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
};

/** Zig-zag path along the top edges of one hex row (for electron flow). */
const rowPath = (cx: number, cy: number, cols: number, rows: number, L: number, j: number) => {
  const w = L * Math.sqrt(3);
  const x0 = cx - ((cols - 1) * w) / 2 - w / 4;
  const y0 = cy - ((rows - 1) * L * 1.5) / 2;
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < cols; i++) {
    const hx = x0 + i * w + (j % 2 ? w / 2 : 0);
    const hy = y0 + j * L * 1.5;
    pts.push({ x: hx - (w / 2), y: hy - L / 2 });
    pts.push({ x: hx, y: hy - L });
  }
  const last = pts[pts.length - 2];
  pts.push({ x: last.x + w / 2, y: last.y + L / 2 });
  return pts;
};
const along = (pts: { x: number; y: number }[], d: number) => {
  const seg: number[] = [];
  let tot = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const l = Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y);
    seg.push(l);
    tot += l;
  }
  let t = ((d % tot) + tot) % tot;
  for (let i = 0; i < seg.length; i++) {
    if (t <= seg[i]) {
      const u = t / seg[i];
      return { x: pts[i].x + (pts[i + 1].x - pts[i].x) * u, y: pts[i].y + (pts[i + 1].y - pts[i].y) * u };
    }
    t -= seg[i];
  }
  return pts[pts.length - 1];
};

const Battery: FC<{ f: number }> = ({ f }) => {
  const oLayer = ramp(f, 4, 26) * (1 - ramp(f, 108, 132));
  const oBat = ramp(f, 112, 138);
  const ECOL = "#67e8f9";
  const glow = ramp(f, 195, 225);
  const LC = { cx: 960, cy: 520, cols: 9, rows: 4, L: 62 };
  const rowsE = [0, 1, 2, 3];

  return (
    <g>
      {/* conductive 2-D MOF layer: a ghost layer below shows the stacking */}
      <g opacity={oLayer}>
        <g transform="translate(14,14)" opacity={0.16}>
          <Lattice {...LC} label={false} />
        </g>
        <Lattice {...LC} />
        {rowsE.map((j) => {
          const pts = rowPath(LC.cx, LC.cy, LC.cols, LC.rows, LC.L, j);
          return (
            <g key={j}>
              <polyline points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={ECOL} strokeWidth={4} opacity={0.35} strokeLinejoin="round" />
              {[0, 1, 2].map((k) => {
                const p = along(pts, f * 3.2 + k * 330 + j * 90);
                return <rect key={k} x={p.x - 7} y={p.y - 7} width={14} height={14} fill={ECOL} stroke="#fff" strokeWidth={1.5} />;
              })}
            </g>
          );
        })}
        <text x={960} y={792} textAnchor="middle" fontFamily={FONT} fontSize={24} fill={PAL.mute}>
          2D conductive MOF: electrons delocalise along the linkers and metal nodes
        </text>
        <text x={960} y={828} textAnchor="middle" fontFamily={FONT} fontSize={21} fill={PAL.mute} opacity={0.8}>
          M = metal node · small ring = organic ligand · layers stack like graphite
        </text>
      </g>

      {/* battery cell */}
      <g opacity={oBat}>
        <rect x={300} y={330} width={1320} height={440} rx={26} fill="rgba(10,13,20,0.4)" stroke={INK} strokeWidth={5} />
        <rect x={1620} y={510} width={34} height={80} rx={6} fill={INK} opacity={0.8} />
        <rect x={330} y={360} width={230} height={380} rx={10} fill="rgba(129,140,248,0.25)" stroke={LIQ} strokeWidth={3} />
        <text x={445} y={560} textAnchor="middle" fontFamily={FONT} fontSize={26} fontWeight={700} fill={PAL.white}>
          Anode
        </text>
        <rect x={560} y={360} width={460} height={380} fill="rgba(165,180,252,0.07)" />
        <text x={790} y={724} textAnchor="middle" fontFamily={FONT} fontSize={22} fill={PAL.mute}>
          solid electrolyte
        </text>
        <rect x={1020} y={360} width={570} height={380} rx={10} fill={`rgba(253,186,116,${0.06 + glow * 0.1})`} stroke={PAL.peach} strokeWidth={3} />
        <Lattice cx={1305} cy={550} cols={7} rows={5} L={36} label={false} o={0.95} />
        <text x={1305} y={316} textAnchor="middle" fontFamily={FONT} fontSize={26} fontWeight={700} fill={PAL.peach}>
          MOF electrode
        </text>
        {Array.from({ length: 9 }).map((_, i) => {
          const x = 560 + ((f * 4 + i * 80) % 720);
          const y = 420 + hash(i + 2) * 280;
          return <Diamond key={i} x={x} y={y} s={9} fill={PAL.peach} o={x > 1050 ? 0.5 : 1} />;
        })}
      </g>

      <g opacity={oBat * glow}>
        <rect x={1020} y={360} width={570} height={380} rx={10} fill="none" stroke="#fde68a" strokeWidth={3} strokeDasharray="14 10" />
      </g>

    </g>
  );
};

const BatteryScene: FC<{ f: number }> = ({ f }) => (
  <g>
    <Sub
      f={f}
      items={[
        { a: 0, b: 118, text: "conductive MOFs" },
        { a: 118, b: 188, text: "Next-generation solid-state batteries" },
        { a: 188, b: 999, text: "MOFs as electrode materials" },
      ]}
    />
    <Battery f={f} />
    <Cap f={f} items={[{ a: 18, b: 112, text: "electrons flow through the framework: it conducts" }]} y={920} />
    {[
      { a: 126, text: "a MOF inside a solid-state battery cell" },
      { a: 186, text: "high surface area: more pore wall for the ions" },
      { a: 232, text: "helping reduce reliance on rare earth minerals" },
      { a: 256, text: "rare earth minerals", strike: true },
    ].map((r, i) => {
      const o = ramp(f, r.a, r.a + 16);
      const y = 842 + i * 52;
      const sw = ramp(f, 276, 306);
      return (
        <g key={i} opacity={o} transform={`translate(${(1 - o) * 18},0)`}>
          <text x={300} y={y} fontFamily={FONT} fontSize={30} fontWeight={800} fill={PAL.lilac}>
            {r.strike ? "↳" : i + 1}
          </text>
          <text x={350} y={y} fontFamily={FONT} fontSize={32} fontWeight={700} fill={r.strike ? PAL.mute : PAL.white}>
            {r.text}
          </text>
          {r.strike && <line x1={346} y1={y - 11} x2={346 + 306 * sw} y2={y - 11} stroke="#f87171" strokeWidth={5} strokeLinecap="round" />}
        </g>
      );
    })}
    <Simplified o={ramp(f, 14, 34)} />
  </g>
);


/* =========================== SHOT 4 · GRID + GREENER ==================== */
const Grid: FC<{ f: number }> = ({ f }) => {
  const fill = clamp((f - 40) / 130);
  const lit = f > 150;
  const green = ramp(f, 175, 235);
  const rot = f * 3.2;
  const dash = -f * 3;
  const flowY = 600;
  const oA = ramp(f, 6, 26);
  const oB = ramp(f, 30, 50);
  const oC = ramp(f, 60, 82);

  const house = (x: number, on: boolean) => (
    <g key={x}>
      <rect x={x} y={flowY + 40} width={80} height={64} fill={on ? "rgba(253,224,71,0.35)" : "rgba(10,13,20,0.6)"} stroke={on ? "#fde047" : INK} strokeWidth={3} />
      <polygon points={`${x - 10},${flowY + 40} ${x + 40},${flowY} ${x + 90},${flowY + 40}`} fill="none" stroke={on ? "#fde047" : INK} strokeWidth={3} strokeLinejoin="round" />
    </g>
  );

  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#4ade80" opacity={0.1 * green} />

      {/* solar */}
      <g opacity={oA}>
        <polygon points="190,560 450,560 500,690 140,690" fill="rgba(129,140,248,0.3)" stroke={LIQ} strokeWidth={4} strokeLinejoin="round" />
        {[0.33, 0.66].map((u) => (
          <line key={u} x1={190 - 50 * u + 260 * u} y1={560 + 130 * 0} x2={140 + 360 * u} y2={690} stroke={LIQ} strokeWidth={2} opacity={0.7} />
        ))}
        <line x1={165} y1={625} x2={475} y2={625} stroke={LIQ} strokeWidth={2} opacity={0.7} />
        <polygon
          points={Array.from({ length: 16 })
            .map((_, k) => {
              const a = (k * Math.PI) / 8;
              const r = k % 2 ? 22 : 40;
              return `${250 + r * Math.cos(a + rot * 0.01)},${400 + r * Math.sin(a + rot * 0.01)}`;
            })
            .join(" ")}
          fill="#fde047"
          opacity={0.95}
        />
        <text x={320} y={745} textAnchor="middle" fontFamily={FONT} fontSize={24} fill={PAL.mute}>
          solar
        </text>
      </g>

      {/* wind */}
      <g opacity={oB}>
        <line x1={700} y1={470} x2={700} y2={700} stroke={INK} strokeWidth={8} />
        {[0, 120, 240].map((a) => (
          <polygon
            key={a}
            points="696,470 704,470 700,350"
            fill={INK}
            opacity={0.95}
            transform={`rotate(${rot + a} 700 470)`}
          />
        ))}
        <rect x={690} y={460} width={20} height={20} fill={PAL.lilac} />
        <text x={700} y={745} textAnchor="middle" fontFamily={FONT} fontSize={24} fill={PAL.mute}>
          wind
        </text>
      </g>

      {/* feed lines into the battery */}
      <g opacity={oC} fill="none" strokeLinejoin="round">
        <path d="M 500 650 L 600 650 L 600 650 L 940 650" stroke={PAL.peach} strokeWidth={5} strokeDasharray="12 14" strokeDashoffset={dash} />
        <path d="M 700 700 L 700 740 L 740 740" stroke="none" />
        <path d={`M 1240 ${flowY + 50} L 1500 ${flowY + 50}`} stroke={PAL.peach} strokeWidth={5} strokeDasharray="12 14" strokeDashoffset={dash} />
      </g>

      {/* MOF battery */}
      <g opacity={oC}>
        <rect x={940} y={470} width={300} height={310} rx={22} fill="rgba(10,13,20,0.55)" stroke={INK} strokeWidth={5} />
        <rect x={1060} y={446} width={60} height={24} rx={5} fill={INK} />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect
            key={i}
            x={970}
            y={740 - (i + 1) * 54}
            width={240}
            height={42}
            rx={6}
            fill={PAL.peach}
            opacity={clamp(fill * 5 - i) * 0.9}
          />
        ))}
        <text x={1090} y={830} textAnchor="middle" fontFamily={FONT} fontSize={24} fill={PAL.mute}>
          MOF battery storage
        </text>
      </g>

      {/* grid + homes */}
      <g opacity={oC}>
        {house(1520, lit)}
        {house(1650, lit)}
        <line x1={1500} y1={flowY + 50} x2={1760} y2={flowY - 40} stroke={INK} strokeWidth={0} />
        <text x={1640} y={745} textAnchor="middle" fontFamily={FONT} fontSize={24} fill={PAL.mute}>
          grid
        </text>
      </g>

      <g opacity={green}>
        <text x={960} y={290} textAnchor="middle" fontFamily={FONT} fontSize={56} fontWeight={800} fill="#86efac">
          a greener future
        </text>
      </g>
    </g>
  );
};

const GridScene: FC<{ f: number }> = ({ f }) => (
  <g>
    <Sub f={f} items={[{ a: 0, b: 999, text: "grid storage for renewable energy" }]} />
    <Grid f={f} />
    <Cap
      f={f}
      items={[
        { a: 20, b: 165, text: "storing solar and wind power for when it is needed" },
        { a: 180, b: 999, text: "paving the way to a greener future" },
      ]}
      y={950}
    />
  </g>
);

/* ============================== SHOT 5 · END ============================ */
const EndScene: FC<{ f: number }> = ({ f }) => {
  // Closing narration ends at local 44. The card fades in from local 6 to 30
  // (last beat is 46 frames); black-out covers the final 16 frames.
  const o = ramp(f, 6, 30); // ramp(f, from, to): an interval, not (from, duration)
  return (
    <text x={960} y={560} textAnchor="middle" fontFamily={FONT} fontSize={76} fontWeight={800} fill={PAL.cream} opacity={o}>
      Thank you for watching
    </text>
  );
};

/* ============================ COMPOSITE ================================= */
const XF = 18; // cross-fade frames

/* ============================ CITATION LAYER ============================ */
/* Only rendered by the citation cut (AssemblyVOCite). Beat 3 splits in two:
 * the honeycomb half cites the semiconductor paper, the battery half the
 * solid-electrolyte one. Beats 4 and 5 have no source yet and show nothing. */
const FUT_CITES: { from: number; to: number; text: string }[] = [
  { from: 660, to: 778, text: "D. Sheberla et al., J. Am. Chem. Soc., 2014, 136, 8859." },
  { from: 778, to: 920, text: "J. Am. Chem. Soc., 2026, mixed ion–electron MOF." },
];

export const FutureOfMofs: FC<{ citations?: boolean }> = ({ citations = false }) => {
  const frame = useCurrentFrame();
  const S = FUTURE_SHOTS;
  const scenes = [
    (f: number) => <FlowScene frame={f} />,
    (f: number) => <DrugScene f={f} />,
    (f: number) => <BatteryScene f={f} />,
    (f: number) => <GridScene f={f} />,
    (f: number) => <EndScene f={f} />,
  ];
  const black = ramp(frame, FUTURE_FRAMES - 16, FUTURE_FRAMES - 2);

  return (
    <AbsoluteFill style={{ background: BACKDROP_CSS, fontFamily: FONT }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <FutureTitle />
        {scenes.map((render, i) => {
          const a = S[i];
          const b = S[i + 1];
          if (frame < a - XF || frame > b + XF) return null;
          const oIn = i === 0 ? 1 : ramp(frame, a - XF, a);
          const oOut = i === scenes.length - 1 ? 1 : 1 - ramp(frame, b - XF, b);
          return (
            <g key={i} opacity={Math.min(oIn, oOut)}>
              {render(frame - a)}
            </g>
          );
        })}
        {citations && (() => {
          const hit = FUT_CITES.find((c) => frame >= c.from && frame < c.to);
          if (!hit) return null;
          const fade = Math.min(
            ramp(frame, hit.from, hit.from + 16),
            frame >= hit.to - 16 ? 1 - ramp(frame, hit.to - 16, hit.to) : 1,
          );
          return (
            <text
              x={1848}
              y={1020}
              textAnchor="end"
              fontFamily={FONT}
              fontSize={19}
              fill={PAL.mute}
              opacity={fade * 0.6}
            >
              {hit.text}
            </text>
          );
        })()}
        <rect x={0} y={0} width={1920} height={1080} fill="#000" opacity={black} />
      </svg>
    </AbsoluteFill>
  );
};
