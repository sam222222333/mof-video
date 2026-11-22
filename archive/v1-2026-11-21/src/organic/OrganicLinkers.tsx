import type { FC } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { FONT, PAL, BACKDROP_CSS } from "../style";

/* ------------------------------------------------------------------------ *
 * §5 ORGANIC — the linker is the tuneable half  (02:40 – 03:05, 25 s)
 *
 * Every statement on screen comes from Zaid's organic notes, transcribed in
 * ZAID-NOTES.md. Nothing is added beyond that slide:
 *   - carboxylates and N-heterocycles are anionic donors, made by deprotonation
 *   - a good linker needs a rigid core, a defined geometry, and the right length
 *   - 1,4 = linear 180°, 1,3,5 = trigonal 120°
 *   - longer linker -> bigger pore; short = terephthalate/UiO-66, long =
 *     biphenyl-4,4'-dicarboxylate/UiO-67
 *
 * Deliberately 2D: this is structure notation, not a scene.
 * ------------------------------------------------------------------------ */

const C = {
  bg: "#0a0d14",
  accent: PAL.lilac,
  cyan: PAL.peach,
  text: PAL.cream,
  body: "#cfc9be",
  muted: PAL.mute,
  warm: PAL.peach,
  green: "#3fbf7f",
} as const;

const ramp = (frame: number, start: number, dur = 18): number =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

/** hexagon vertices, vertex 0 at the top */
const ring = (cx: number, cy: number, r: number, rot = -Math.PI / 2): [number, number][] =>
  Array.from({ length: 6 }, (_, k) => {
    const a = rot + (k * Math.PI) / 3;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as [number, number];
  });

const pathOf = (pts: [number, number][]) =>
  `M ${pts.map((p) => p.join(" ")).join(" L ")} Z`;

/** benzene ring + carboxylate groups on the given vertex indices */
const Linker: FC<{
  cx: number;
  cy: number;
  r: number;
  at: number[];
  progress: number;
  color?: string;
  rot?: number;
}> = ({ cx, cy, r, at, progress, color = C.body, rot }) => {
  const pts = ring(cx, cy, r, rot);
  return (
    <g opacity={progress}>
      <path d={pathOf(pts)} fill="none" stroke={color} strokeWidth={3} strokeLinejoin="round" />
      <circle cx={cx} cy={cy} r={r * 0.56} fill="none" stroke={color} strokeWidth={2} opacity={0.8} />
      {at.map((k) => {
        const p = pts[k] ?? pts[0];
        const dx = p[0] - cx;
        const dy = p[1] - cy;
        const l = Math.hypot(dx, dy) || 1;
        const ux = dx / l;
        const uy = dy / l;
        const ex = p[0] + ux * 46 * progress;
        const ey = p[1] + uy * 46 * progress;
        return (
          <g key={k}>
            <line x1={p[0]} y1={p[1]} x2={ex} y2={ey} stroke={color} strokeWidth={3} />
            {ux < -0.25 ? (
              // left-pointing group: written "-O2C" so the bond still meets the C
              <text x={ex + ux * 18} y={ey + uy * 16 + 8} textAnchor="end" fontSize={26} fill={C.accent}>
                {"\u207BO\u2082C"}
              </text>
            ) : (
              // C is the first letter; for straight-up/down groups centre that C on the bond
              <text
                x={ux > 0.25 ? ex + ux * 18 : ex - 8}
                y={ey + uy * 16 + 8}
                textAnchor="start"
                fontSize={26}
                fill={C.accent}
              >
                {"CO\u2082\u207B"}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
};


/* ------------------------------------------------------------------------ *
 * Act D, rebuilt after watching the team's work.
 *
 * It used to be two finished pictures side by side — terephthalate on the left,
 * biphenyl on the right — and the viewer had to spot the difference. Their
 * "stretch the linker" beat does it as one continuous move instead: the ring
 * count grows, and the two nodes are pushed apart by the growth, so the pore
 * between them opens up in the same gesture. That is the actual claim from
 * Zaid's notes ("longer linker, bigger pore"), shown rather than compared.
 *
 * Stopped at two rings on purpose: terephthalate -> biphenyl is what the notes
 * cover. A third ring would be terphenyl, which is outside them.
 * ------------------------------------------------------------------------ */

const CELL_R = 52; // ring radius
const CELL_BOND = 24; // inter-ring bond length
const NODE_R = 26;

/** node-centre to node-centre distance for a given growth 0 (one ring) .. 1 (two rings) */
const cellSide = (grow: number) => 2 * CELL_R + CELL_BOND * grow + 2 * CELL_R * grow + 180;

/**
 * The framework cell: four metal nodes joined by four linkers, a pore in the middle.
 * grow = 0 -> one ring per linker (terephthalate); grow = 1 -> two rings (biphenyl).
 * Drawn around the origin; the caller translates it.
 */
const FrameworkCell: FC<{ grow: number; labels: number; poreLabel?: string }> = ({ grow, labels, poreLabel = "pore" }) => {
  const r = CELL_R;
  const W = 2 * r + CELL_BOND * grow + 2 * r * grow;
  const L = cellSide(grow);
  const half = L / 2;
  const poreR = half - 84;

  const left = -W / 2;
  const aCx = left + r;
  const bondX1 = left + 2 * r;
  const bondX2 = bondX1 + CELL_BOND * grow;
  const rB = r * grow;
  const bCx = bondX2 + rB;

  /** one linker laid out along x, centred on 0 */
  const strut = (
    <g>
      {[-1, 1].map((sd) => {
        const ringEdge = sd * (W / 2);
        const cX = sd * (W / 2 + 16);
        const oX = sd * (W / 2 + 38);
        const nX = sd * (half - NODE_R + 3);
        return (
          <g key={sd} stroke={PAL.cream} strokeWidth={3} strokeLinecap="round">
            {/* ring -> carboxylate C, C -> two O, each O -> metal node */}
            <line x1={ringEdge} y1={0} x2={cX} y2={0} />
            <line x1={cX} y1={0} x2={oX} y2={-14} />
            <line x1={cX} y1={0} x2={oX} y2={14} />
            <line x1={oX} y1={-14} x2={nX} y2={-9} strokeWidth={2} stroke={PAL.lilac} />
            <line x1={oX} y1={14} x2={nX} y2={9} strokeWidth={2} stroke={PAL.lilac} />
            <circle cx={oX} cy={-14} r={5.5} fill={PAL.lilac} stroke="none" />
            <circle cx={oX} cy={14} r={5.5} fill={PAL.lilac} stroke="none" />
          </g>
        );
      })}
      <path d={pathOf(ring(aCx, 0, r, 0))} fill="none" stroke={PAL.cream} strokeWidth={3} strokeLinejoin="round" />
      <circle cx={aCx} cy={0} r={r * 0.56} fill="none" stroke={PAL.cream} strokeWidth={2} opacity={0.8} />
      {grow > 0.02 ? (
        <>
          <line x1={bondX1} y1={0} x2={bondX2} y2={0} stroke={PAL.cream} strokeWidth={3} />
          <path d={pathOf(ring(bCx, 0, rB, 0))} fill="none" stroke={PAL.cream} strokeWidth={3} strokeLinejoin="round" />
          <circle cx={bCx} cy={0} r={rB * 0.56} fill="none" stroke={PAL.cream} strokeWidth={2} opacity={0.8} />
        </>
      ) : null}
    </g>
  );

  const corners: [number, number][] = [
    [-half, -half],
    [half, -half],
    [half, half],
    [-half, half],
  ];

  return (
    <g>
      <circle cx={0} cy={0} r={poreR} fill="rgba(253,186,116,0.09)" stroke={PAL.peach} strokeWidth={2.5} />
      <text x={0} y={9} textAnchor="middle" fontSize={24} fill={PAL.peach} opacity={labels}>
        {poreLabel}
      </text>

      <g transform={`translate(0, ${-half})`}>{strut}</g>
      <g transform={`translate(0, ${half})`}>{strut}</g>
      <g transform={`translate(${-half}, 0) rotate(90)`}>{strut}</g>
      <g transform={`translate(${half}, 0) rotate(90)`}>{strut}</g>

      {corners.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={NODE_R} fill={PAL.indigo} stroke={PAL.lilac} strokeWidth={2.5} />
      ))}

      <g opacity={labels}>
        <text x={-half - NODE_R - 18} y={-half + 8} textAnchor="end" fontSize={24} fill={PAL.mute}>
          metal node
        </text>
        <text x={0} y={-half - r - 24} textAnchor="middle" fontSize={24} fill={PAL.mute}>
          organic linker
        </text>
      </g>
    </g>
  );
};

/** a small arrow pointing along (dx, dy), tip at (x, y) */
const Arrow: FC<{ x: number; y: number; dx: number; dy: number; len: number; color: string }> = ({
  x,
  y,
  dx,
  dy,
  len,
  color,
}) => {
  const l = Math.hypot(dx, dy);
  const ux = dx / l;
  const uy = dy / l;
  const tx = x - ux * len;
  const ty = y - uy * len;
  const hx = -uy;
  const hy = ux;
  return (
    <g stroke={color} strokeWidth={4} strokeLinecap="round" fill="none">
      <line x1={tx} y1={ty} x2={x} y2={y} />
      <path d={`M ${x - ux * 16 + hx * 10} ${y - uy * 16 + hy * 10} L ${x} ${y} L ${x - ux * 16 - hx * 10} ${y - uy * 16 - hy * 10}`} />
    </g>
  );
};


/** key shown under the cell: what the small dots are */
const CellKey: FC<{ opacity: number }> = ({ opacity }) => (
  <g opacity={opacity} fontSize={22} fill={PAL.mute}>
    <circle cx={126} cy={983} r={6} fill={PAL.lilac} />
    <text x={142} y={991}>oxygen of the carboxylate group</text>
    <circle cx={540} cy={983} r={11} fill={PAL.indigo} stroke={PAL.lilac} strokeWidth={2} />
    <text x={560} y={991}>metal node</text>
    <text x={1800} y={991} textAnchor="end" fontStyle="italic">simplified 2D diagram</text>
  </g>
);

/* ------------------------------------------------------------------------ *
 * Section 1 — rigid core. Same cell as the length section, one ring per linker.
 * Squeeze it from the corners: nothing moves (nodes keep their distance, pore
 * stays open). Slide: "a rigid core ... so the nodes stay a fixed distance apart
 * and the pores do not collapse".
 * ------------------------------------------------------------------------ */
const RigidCore: FC<{ frame: number }> = ({ frame }) => {
  const cx = 1290;
  const cy = 560;
  const half = cellSide(0) / 2;
  const cellIn = ramp(frame, 212, 22);
  const labels = ramp(frame, 250, 18);

  // two squeeze pulses
  const t = (frame - 330) / 45;
  const pulse = t >= 0 && t <= 2 ? Math.sin(Math.PI * t) ** 2 : 0;
  const arrowsIn = ramp(frame, 322, 12) * (1 - ramp(frame, 425, 12));
  const dimIn = ramp(frame, 345, 20);

  const corners: [number, number][] = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ];

  return (
    <g>
      <CellKey opacity={ramp(frame, 250, 18)} />
      <g opacity={ramp(frame, 205, 20)}>
        <text x={120} y={360} fontSize={44} fill={PAL.cream} fontWeight={600}>
          rigid core
        </text>
      </g>
      <text x={120} y={425} fontSize={30} fill={C.body} opacity={ramp(frame, 240, 18)}>
        so the nodes stay a fixed distance apart
      </text>
      <text x={120} y={475} fontSize={30} fill={C.body} opacity={ramp(frame, 290, 18)}>
        and the pores do not collapse
      </text>

      <g transform={`translate(${cx}, ${cy})`} opacity={cellIn}>
        <FrameworkCell grow={0} labels={labels} poreLabel="pore" />

        {/* squeeze from the corners: the cell does not move */}
        <g opacity={arrowsIn}>
          {corners.map(([sx, sy], i) => {
            const gap = half + NODE_R * 0.7 + 48 - 30 * pulse; // tip distance per axis: pushes in on each pulse
            return (
              <Arrow
                key={i}
                x={sx * gap}
                y={sy * gap}
                dx={-sx}
                dy={-sy}
                len={52}
                color={PAL.lilac}
              />
            );
          })}
        </g>

        {/* fixed-distance dimension line under the bottom edge */}
        <g opacity={dimIn}>
          <line x1={-half} y1={half + 62} x2={half} y2={half + 62} stroke={PAL.mute} strokeWidth={2} />
          <line x1={-half} y1={half + 50} x2={-half} y2={half + 74} stroke={PAL.mute} strokeWidth={2} />
          <line x1={half} y1={half + 50} x2={half} y2={half + 74} stroke={PAL.mute} strokeWidth={2} />
          <text x={0} y={half + 106} textAnchor="middle" fontSize={24} fill={PAL.mute}>
            fixed distance
          </text>
        </g>
      </g>
    </g>
  );
};

const LengtheningLinker: FC<{ frame: number; t0: number }> = ({ frame, t0 }) => {
  const build = ramp(frame, t0 + 8, 18);
  const grow = interpolate(frame, [t0 + 26, t0 + 86], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  const cx = 960;
  const cy = 570;
  const labelsIn = 1;
  const capOut = 1 - interpolate(grow, [0.35, 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const capIn = interpolate(grow, [0.7, 0.85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const note = ramp(frame, t0 + 80, 18);

  return (
    <g opacity={build}>
      <CellKey opacity={1} />
      <g transform={`translate(${cx}, ${cy})`}>
        <FrameworkCell grow={grow} labels={labelsIn} />
      </g>

      {/* captions cross-fade with the structure */}
      <g opacity={capOut}>
        <text x={cx} y={885} textAnchor="middle" fontSize={32} fill={PAL.cream}>
          terephthalate
        </text>
        <text x={cx} y={927} textAnchor="middle" fontSize={26} fill={PAL.mute}>
          {"UiO-66 \u00B7 smaller pore"}
        </text>
      </g>
      <g opacity={capIn}>
        <text x={cx} y={885} textAnchor="middle" fontSize={32} fill={PAL.cream}>
          {"biphenyl-4,4\u2032-dicarboxylate"}
        </text>
        <text x={cx} y={927} textAnchor="middle" fontSize={26} fill={PAL.mute}>
          {"UiO-67 \u00B7 bigger pore"}
        </text>
      </g>

      {/* the point of the whole act */}
      <text x={1560} y={cy - 10} textAnchor="middle" fontSize={38} fontWeight={700} fill={PAL.peach} opacity={note}>
        {"longer linker"}
      </text>
      <text x={1560} y={cy + 42} textAnchor="middle" fontSize={38} fontWeight={700} fill={PAL.peach} opacity={note}>
        {"\u2192 bigger pore"}
      </text>
    </g>
  );
};

/* ------------------------------------------------------------------------ *
 * Diagrams for the opening (deprotonation, lone pairs) and the later screens
 * (BTC, paddlewheel, hard vs soft). Timed to the voice-over in
 * ../../SCRIPT.md (about 150 words per minute).
 * ------------------------------------------------------------------------ */

const INK = PAL.cream;

const lin = (frame: number, a: number, b: number) =>
  interpolate(frame, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** 0 -> 1 -> 1 -> 0 window */
const win = (frame: number, a: number, b: number, c: number, d: number) =>
  interpolate(frame, [a, b, c, d], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Charge: FC<{ x: number; y: number; color: string }> = ({ x, y, color }) => (
  <g>
    <circle cx={x} cy={y} r={11} fill="none" stroke={color} strokeWidth={2} />
    <line x1={x - 5.5} y1={y} x2={x + 5.5} y2={y} stroke={color} strokeWidth={2} />
  </g>
);

/** a lone pair: two dots placed across the given direction */
const LonePair: FC<{ x: number; y: number; angle: number; color: string }> = ({ x, y, angle, color }) => {
  const a = (angle * Math.PI) / 180;
  const px = -Math.sin(a) * 5;
  const py = Math.cos(a) * 5;
  return (
    <g fill={color}>
      <circle cx={x + px} cy={y + py} r={3.4} />
      <circle cx={x - px} cy={y - py} r={3.4} />
    </g>
  );
};

/** a metal cation: filled circle with its charge inside */
const Metal: FC<{ x: number; y: number; r?: number; label: string; opacity?: number }> = ({
  x,
  y,
  r = 30,
  label,
  opacity = 1,
}) => (
  <g opacity={opacity}>
    <circle cx={x} cy={y} r={r} fill={PAL.indigo} stroke={PAL.lilac} strokeWidth={2.5} />
    <text x={x} y={y + 8} textAnchor="middle" fontSize={22} fill={PAL.white}>
      {label}
    </text>
  </g>
);

const polar = (p: [number, number], deg: number, d: number): [number, number] => [
  p[0] + d * Math.cos((deg * Math.PI) / 180),
  p[1] + d * Math.sin((deg * Math.PI) / 180),
];

/** bonds of a small ring around the origin; N ends are shortened so the label fits */
const drawRing = (verts: [number, number][], isN: boolean[], dbl: boolean[]) =>
  verts.map((a, i) => {
    const n = verts.length;
    const b = verts[(i + 1) % n];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const ux = (b[0] - a[0]) / len;
    const uy = (b[1] - a[1]) / len;
    const sa = isN[i] ? 16 : 0;
    const sb = isN[(i + 1) % n] ? 16 : 0;
    const x1 = a[0] + ux * sa;
    const y1 = a[1] + uy * sa;
    const x2 = b[0] - ux * sb;
    const y2 = b[1] - uy * sb;
    let inner = null;
    if (dbl[i]) {
      let nx = -uy;
      let ny = ux;
      const mx = (a[0] + b[0]) / 2;
      const my = (a[1] + b[1]) / 2;
      if (nx * -mx + ny * -my < 0) {
        nx = -nx;
        ny = -ny;
      }
      inner = (
        <line
          x1={x1 + ux * 8 + nx * 9}
          y1={y1 + uy * 8 + ny * 9}
          x2={x2 - ux * 8 + nx * 9}
          y2={y2 - uy * 8 + ny * 9}
          stroke={INK}
          strokeWidth={3}
          strokeLinecap="round"
        />
      );
    }
    return (
      <g key={i}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth={3} strokeLinecap="round" />
        {inner}
      </g>
    );
  });

/**
 * R-C(=O)-O(-H): dp 0 = carboxylic acid, 1 = carboxylate (H has left as H+).
 * neg = which oxygen carries the charge (the C=O / C-O⁻ pair swaps between the two resonance forms)
 */
const CarboxylateDiagram: FC<{ dp: number; lone?: number; neg?: "O1" | "O2"; loneDeg?: [number, number] }> = ({
  dp,
  lone = 0,
  neg = "O2",
  loneDeg = [0, 0],
}) => {
  const O1 = [0, -82];
  const O2 = [71, 41];
  const R = [-71, 41];
  const hOp = dp < 0.5 ? 1 : Math.max(0, 1 - (dp - 0.5) * 2);
  const oneDbl = neg === "O2"; // O1 is the C=O in the first form, O2 in the second
  const d = [0.866, 0.5];
  const nn = [-0.5, 0.866];
  return (
    <g>
      <line x1={R[0] + 14} y1={R[1] - 8} x2={-6} y2={6} stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <text x={R[0] - 6} y={R[1] + 12} textAnchor="end" fontSize={34} fill={INK} fontStyle="italic">
        R
      </text>
      {/* C-O1 (top) */}
      {oneDbl ? (
        <g>
          <line x1={-5} y1={-6} x2={-5} y2={O1[1] + 22} stroke={INK} strokeWidth={3} strokeLinecap="round" />
          <line x1={5} y1={-6} x2={5} y2={O1[1] + 22} stroke={INK} strokeWidth={3} strokeLinecap="round" />
        </g>
      ) : (
        <line x1={0} y1={-6} x2={0} y2={O1[1] + 22} stroke={INK} strokeWidth={3} strokeLinecap="round" />
      )}
      <text x={O1[0]} y={O1[1] + 12} textAnchor="middle" fontSize={34} fill={INK}>
        O
      </text>
      {/* C-O2 (lower right) */}
      {oneDbl ? (
        <line x1={6} y1={6} x2={O2[0] - 14} y2={O2[1] - 12} stroke={INK} strokeWidth={3} strokeLinecap="round" />
      ) : (
        <g>
          {[-1, 1].map((s) => (
            <line
              key={s}
              x1={4 + s * nn[0] * 4.5}
              y1={4 + s * nn[1] * 4.5}
              x2={O2[0] - 15 * d[0] * 0.95 + s * nn[0] * 4.5}
              y2={O2[1] - 15 * d[1] * 0.95 - 6 + s * nn[1] * 4.5}
              stroke={INK}
              strokeWidth={3}
              strokeLinecap="round"
            />
          ))}
        </g>
      )}
      <text x={O2[0]} y={O2[1] + 12} textAnchor="middle" fontSize={34} fill={INK}>
        O
      </text>
      {/* the acidic H, leaving as H+ */}
      {oneDbl ? (
        <g>
          <line
            x1={O2[0] + 12}
            y1={O2[1] + 7}
            x2={O2[0] + 25}
            y2={O2[1] + 14}
            stroke={INK}
            strokeWidth={3}
            strokeLinecap="round"
            opacity={1 - dp}
          />
          <text
            x={O2[0] + 36 + dp * 60}
            y={O2[1] + 28 - dp * 48}
            textAnchor="middle"
            fontSize={30}
            fill={dp < 0.4 ? INK : PAL.peach}
            opacity={hOp}
          >
            {dp < 0.4 ? "H" : "H\u207A"}
          </text>
        </g>
      ) : null}
      <g opacity={dp}>
        {oneDbl ? (
          <Charge x={O2[0] + 34} y={O2[1] - 18} color={PAL.lilac} />
        ) : (
          <Charge x={O1[0] - 30} y={O1[1] - 14} color={PAL.lilac} />
        )}
      </g>
      <g opacity={lone}>
        <LonePair x={O1[0] + 27} y={O1[1] + 4} angle={loneDeg[0]} color={PAL.lilac} />
        <LonePair x={O2[0] + 27} y={O2[1] - 2} angle={loneDeg[1]} color={PAL.lilac} />
      </g>
    </g>
  );
};

type ImidForm = "N1" | "N3";

/** imidazole (dp 0, N-H) -> imidazolate (dp 1); neg = which N carries the charge */
const ImidazolateForm: FC<{
  neg: ImidForm;
  dp?: number;
  lone?: number;
  loneDeg?: number;
  r?: number;
  loneOther?: number;
  loneOtherDeg?: number;
}> = ({ neg, dp = 1, lone = 0, loneDeg = 0, r = 66, loneOther = 0, loneOtherDeg = 0 }) => {
  const at = (deg: number): [number, number] => [r * Math.cos((deg * Math.PI) / 180), r * Math.sin((deg * Math.PI) / 180)];
  const C2 = at(-90);
  const N3 = at(-18);
  const C4 = at(54);
  const C5 = at(126);
  const N1 = at(198);
  const verts = [C2, N3, C4, C5, N1];
  const isN = [false, true, false, false, true];
  // edges: 0 C2-N3, 1 N3-C4, 2 C4-C5, 3 C5-N1, 4 N1-C2; C4=C5 in both forms
  const dbl = [neg === "N1", false, true, false, neg === "N3"];
  const negP = neg === "N1" ? N1 : N3;
  const tn = Math.atan2(negP[1], negP[0]) * (180 / Math.PI);
  const side = neg === "N1" ? -1 : 1;
  const ch = polar(negP, tn + side * 70, 38);
  const hOp = dp < 0.5 ? 1 : Math.max(0, 1 - (dp - 0.5) * 2);
  const hPos = polar(N1, 198, 42 + dp * 70);
  const bondEnd = polar(N1, 198, 28);
  const bondStart = polar(N1, 198, 14);
  const lp = polar(negP, loneDeg, 29);
  const otherP = neg === "N1" ? N3 : N1; // the second (neutral) N donates its lone pair too
  const lp2 = polar(otherP, loneOtherDeg, 29);
  return (
    <g>
      {drawRing(verts, isN, dbl)}
      {[N3, N1].map((p, i) => (
        <text key={i} x={p[0]} y={p[1] + 12} textAnchor="middle" fontSize={34} fill={INK}>
          N
        </text>
      ))}
      {neg === "N1" ? (
        <g>
          <line
            x1={bondStart[0]}
            y1={bondStart[1]}
            x2={bondEnd[0]}
            y2={bondEnd[1]}
            stroke={INK}
            strokeWidth={3}
            strokeLinecap="round"
            opacity={1 - dp}
          />
          <text x={hPos[0]} y={hPos[1] + 10} textAnchor="middle" fontSize={30} fill={dp < 0.4 ? INK : PAL.peach} opacity={hOp}>
            {dp < 0.4 ? "H" : "H⁺"}
          </text>
        </g>
      ) : null}
      <g opacity={dp}>
        <Charge x={ch[0]} y={ch[1]} color={PAL.peach} />
      </g>
      <g opacity={lone}>
        <LonePair x={lp[0]} y={lp[1]} angle={loneDeg} color={PAL.peach} />
      </g>
      <g opacity={loneOther}>
        <LonePair x={lp2[0]} y={lp2[1]} angle={loneOtherDeg} color={PAL.peach} />
      </g>
    </g>
  );
};

/**
 * Pyrazolate: five-membered ring with two ADJACENT N atoms.
 *   form "A": charge on N1 (N2=C3, C4=C5);  form "B": charge on N2 (N1=C5, C3=C4)
 *   form "deloc": aromatic circle, charge shared by both N; rotated so the N-N edge is on top
 * Returns the ring around the origin plus the positions of the two N atoms.
 */
const pyrazolateGeom = (r: number, rotDeg: number) => {
  const ang = [-90, -18, 54, 126, 198].map((d) => d + rotDeg);
  const verts = ang.map((d) => [r * Math.cos((d * Math.PI) / 180), r * Math.sin((d * Math.PI) / 180)] as [number, number]);
  return { verts, ang }; // 0 N2, 1 N1, 2 C5, 3 C4, 4 C3
};

const PyrazolateRing: FC<{ form: "A" | "B" | "deloc"; r?: number }> = ({ form, r = 52 }) => {
  const rot = form === "deloc" ? -36 : 0;
  const { verts, ang } = pyrazolateGeom(r, rot);
  const isN = [true, true, false, false, false];
  const dbl =
    form === "A"
      ? [false, false, true, false, true]
      : form === "B"
        ? [false, true, false, true, false]
        : [false, false, false, false, false];
  const negIdx = form === "A" ? 1 : 0;
  const negAng = ang[negIdx];
  const ch = polar(verts[negIdx], negAng + (form === "A" ? 70 : -70), 36);
  return (
    <g>
      {drawRing(verts, isN, dbl)}
      {form === "deloc" ? (
        <>
          <circle cx={0} cy={4} r={r * 0.5} fill="none" stroke={INK} strokeWidth={2} opacity={0.8} />
          <Charge x={0} y={4} color={PAL.peach} />
        </>
      ) : null}
      {[0, 1].map((i) => (
        <text key={i} x={verts[i][0]} y={verts[i][1] + 12} textAnchor="middle" fontSize={34} fill={INK}>
          N
        </text>
      ))}
      {form !== "deloc" ? <Charge x={ch[0]} y={ch[1]} color={PAL.peach} /> : null}
    </g>
  );
};

/** Cu2 paddlewheel seen along the metal-metal axis: a metal pair with four carboxylate "paddles" */
const PaddleWheel: FC<{ labels: number }> = ({ labels }) => {
  const arms = [0, 90, 180, 270];
  return (
    <g>
      {arms.map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <line x1={34} y1={0} x2={148} y2={0} stroke={INK} strokeWidth={3} strokeLinecap="round" opacity={0} />
          <line x1={90} y1={0} x2={134} y2={0} stroke={INK} strokeWidth={3} strokeLinecap="round" />
          {[-1, 1].map((sg) => (
            <g key={sg}>
              <line x1={90} y1={0} x2={64} y2={sg * 17} stroke={INK} strokeWidth={3} strokeLinecap="round" />
              <line x1={64} y1={sg * 17} x2={36} y2={sg * 11} stroke={PAL.lilac} strokeWidth={2} strokeLinecap="round" />
              <circle cx={64} cy={sg * 17} r={5.5} fill={PAL.lilac} />
            </g>
          ))}
        </g>
      ))}
      <circle cx={0} cy={0} r={34} fill={PAL.indigo} stroke={PAL.lilac} strokeWidth={2.5} />
      {arms.map((a) => (
        <text
          key={a}
          x={Math.cos((a * Math.PI) / 180) * 156}
          y={Math.sin((a * Math.PI) / 180) * 156 + 10}
          textAnchor="middle"
          fontSize={28}
          fill={INK}
          fontStyle="italic"
        >
          R
        </text>
      ))}
      <g opacity={labels}>
        <line x1={138} y1={-96} x2={92} y2={-18} stroke={PAL.peach} strokeWidth={2} />
        <text x={142} y={-104} fontSize={28} fill={PAL.peach} fontWeight={600}>
          {"“paddle”"}
        </text>
      </g>
    </g>
  );
};

/* ---------------------------------- figure -------------------------------- */

const TRACK = [
  ["1", "rigid core", 120],
  ["2", "defined geometry", 400],
  ["3", "right length", 780],
] as const;

export const OrganicLinkers: FC = () => {
  const frame = useCurrentFrame();
  const F = frame;

  const fadeOut = 1 - lin(F, 1810, 1830);

  /* ---------------------------- A: deprotonation, lone pairs ---------------------------- */
  const actA = win(F, 0, 22, 423, 453); // hands over to "good" here: segment A must start
                                        // yielding exactly when #25 begins at 423
  const dp1 = ramp(F, 140, 40);
  const dp2 = ramp(F, 205, 40);
  const form2 = ramp(F, 250, 24);
  const lone = ramp(F, 352, 14);
  const metalIn = ramp(F, 356, 20);
  const carbIn = ramp(F, 100, 24); // carboxylic acid drawing (appears with its label)
  const imidIn = ramp(F, 165, 24); // imidazole drawing (appears with its label)
  const rise = (p: number) => (1 - p) * 18; // gentle upward settle while fading in
  const capA1 = 1 - lin(dp1, 0, 0.35); // "carboxylic acid" fades out first
  const capA2 = lin(dp1, 0.65, 1); // then "carboxylate: ..." fades in
  const capB1 = 1 - lin(dp2, 0, 0.35);
  const capB2 = lin(dp2, 0.65, 1);
  const bondIn = ramp(F, 398, 16);

  /* ------------------------- shared title + tracker (rigid core onwards) ------------------------- */
  // #25 begins at 423 with "a good linker has a rigid core", so the title card has
  // to finish switching before that frame
  const good = interpolate(F, [423, 453], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const act1 = 1 - lin(F, 935, 955);
  const act2 = Math.min(lin(F, 935, 955), 1 - lin(F, 1280, 1300));
  const act3 = lin(F, 1612, 1632);
  const tracker = [act1, act2, act3];
  // hard vs soft is a side note: the shared title + tracker step aside and return for "right length"
  const titleOp = good * Math.max(1 - lin(F, 1275, 1295), lin(F, 1612, 1632));
  const sideOp = Math.min(lin(F, 1292, 1312), 1 - lin(F, 1598, 1618));

  /* ------------------------------------ BTC position ------------------------------------ */
  const btcX = interpolate(F, [945, 1005], [1360, 620], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const btcIn = ramp(F, 700, 22); // #27 names benzene-1,3,5-tricarboxylate at 730;
                                  // the old value of 822 landed 92 frames late
  const btcOut = 1 - lin(F, 1285, 1305); // BTC + paddlewheel leave before hard/soft
  const btcY = 590;

  /* geometry annotations (angle arcs) */
  const arcs = [-90, 30, 150];
  const arcIn = ramp(F, 1040, 24);
  const arcPath = (a1: number, a2: number, rr: number) => {
    const p1 = polar([0, 0], a1, rr);
    const p2 = polar([0, 0], a2, rr);
    return `M ${p1[0]} ${p1[1]} A ${rr} ${rr} 0 0 1 ${p2[0]} ${p2[1]}`;
  };

  return (
    <AbsoluteFill style={{ background: BACKDROP_CSS, opacity: fadeOut }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ fontFamily: FONT }}>
        {/* =============================== A: ORGANIC LINKERS =============================== */}
        <g opacity={actA}>
          <text x={120} y={130} fontSize={46} fill={PAL.lilac} fontWeight={800}>
            organic linkers
          </text>

          <g opacity={ramp(F, 104, 20)}>
            <text x={120} y={330} fontSize={34} fill={C.warm} fontWeight={600}>
              {"carboxylate"}
            </text>
            <text x={120} y={390} fontSize={38} fill={C.text}>
              {"RCO₂H  →  RCO₂⁻  +  H⁺"}
            </text>
            <text x={120} y={432} fontSize={24} fill={C.muted}>
              {"from a carboxylic acid"}
            </text>
          </g>

          <g opacity={ramp(F, 168, 20)}>
            <text x={120} y={540} fontSize={34} fill={C.cyan} fontWeight={600}>
              {"N-heterocycle (imidazole)"}
            </text>
            <text x={120} y={600} fontSize={38} fill={C.text}>
              {"N–H  →  N⁻  +  H⁺"}
            </text>
            <text x={120} y={642} fontSize={24} fill={C.muted}>
              {"the imidazolate linker family"}
            </text>
          </g>

          <text x={120} y={760} fontSize={32} fill={C.body} opacity={ramp(F, 255, 20)}>
            {"a base deprotonates the acidic H, giving anionic donors"}
          </text>
          <text x={120} y={812} fontSize={32} fill={C.body} opacity={ramp(F, 345, 20)}>
            {"these donors bind metal cations through their lone pairs"}
          </text>

          {/* carboxylic acid -> carboxylate (two resonance forms) */}
          <g opacity={carbIn} transform={`translate(0, ${rise(carbIn)})`}>
            <g transform="translate(1280, 330)">
              <CarboxylateDiagram dp={dp1} neg="O2" />
            </g>
            <g opacity={form2}>
              <text x={1435} y={345} textAnchor="middle" fontSize={44} fill={C.muted}>
                {"\u2194"}
              </text>
              <g transform="translate(1590, 330)">
                <CarboxylateDiagram dp={1} neg="O1" lone={lone} loneDeg={[0, 14]} />
              </g>
            </g>
            <text x={1435} y={500} textAnchor="middle" fontSize={24} fill={C.muted} opacity={capA1}>
              carboxylic acid
            </text>
            <text x={1435} y={500} textAnchor="middle" fontSize={24} fill={C.muted} opacity={capA2 * (1 - form2)}>
              carboxylate
            </text>
            <text x={1435} y={500} textAnchor="middle" fontSize={24} fill={C.muted} opacity={form2}>
              carboxylate: charge on either O
            </text>
          </g>

          {/* imidazole -> imidazolate (two resonance forms) */}
          <g opacity={imidIn} transform={`translate(0, ${rise(imidIn)})`}>
            <g transform="translate(1280, 690)">
              <ImidazolateForm neg="N1" dp={dp2} />
            </g>
            <g opacity={form2}>
              <text x={1435} y={700} textAnchor="middle" fontSize={44} fill={C.muted}>
                {"\u2194"}
              </text>
              <g transform="translate(1590, 690)">
                <ImidazolateForm neg="N3" dp={1} lone={lone} loneDeg={8} loneOther={lone} loneOtherDeg={208} />
              </g>
            </g>
            <text x={1435} y={830} textAnchor="middle" fontSize={24} fill={C.muted} opacity={capB1}>
              imidazole
            </text>
            <text x={1435} y={830} textAnchor="middle" fontSize={24} fill={C.muted} opacity={capB2 * (1 - form2)}>
              imidazolate
            </text>
            <text x={1435} y={830} textAnchor="middle" fontSize={24} fill={C.muted} opacity={form2}>
              imidazolate: charge on either N
            </text>
          </g>

          {/* donors bind metal cations through their lone pairs (bonds draw in toward the metal) */}
          <g>
            <line
              x1={1632}
              y1={252}
              x2={1632 + (1728 - 1632) * bondIn}
              y2={252 + (250 - 252) * bondIn}
              stroke={PAL.lilac}
              strokeWidth={2.5}
              strokeDasharray="7 7"
              opacity={bondIn > 0.02 ? 1 : 0}
            />
            <line
              x1={1702}
              y1={371}
              x2={1702 + (1764 - 1702) * bondIn}
              y2={371 + (388 - 371) * bondIn}
              stroke={PAL.lilac}
              strokeWidth={2.5}
              strokeDasharray="7 7"
              opacity={bondIn > 0.02 ? 1 : 0}
            />
            <Metal x={1760} y={250} label={"M\u207F\u207A"} opacity={metalIn} />
            <Metal x={1795} y={396} label={"M\u207F\u207A"} opacity={metalIn} />
            <text x={1795} y={456} textAnchor="middle" fontSize={22} fill={C.muted} opacity={metalIn}>
              metal cations
            </text>
            <line
              x1={1673}
              y1={673}
              x2={1673 + (1766 - 1673) * bondIn}
              y2={673 + (690 - 673) * bondIn}
              stroke={PAL.peach}
              strokeWidth={2.5}
              strokeDasharray="7 7"
              opacity={bondIn > 0.02 ? 1 : 0}
            />
            <line
              x1={1493}
              y1={652}
              x2={1493 + (1425 - 1493) * bondIn}
              y2={652 + (616 - 652) * bondIn}
              stroke={PAL.peach}
              strokeWidth={2.5}
              strokeDasharray="7 7"
              opacity={bondIn > 0.02 ? 1 : 0}
            />
            <Metal x={1395} y={600} label={"M\u207F\u207A"} opacity={metalIn} />
            <Metal x={1800} y={690} label={"M\u207F\u207A"} opacity={metalIn} />
            <text x={1800} y={750} textAnchor="middle" fontSize={22} fill={C.muted} opacity={metalIn}>
              metal cation
            </text>
          </g>
        </g>

        {/* ===================== shared title + tracker (rigid core onwards) ===================== */}
        <g opacity={titleOp}>
          <text x={120} y={130} fontSize={46} fill={PAL.lilac} fontWeight={800}>
            what makes a good linker
          </text>
          {TRACK.map(([n, label, x], i) => {
            const a = tracker[i];
            return (
              <g key={n} opacity={0.4 + 0.6 * a}>
                <text x={x} y={200} fontSize={30} fontWeight={a > 0.5 ? 700 : 400} fill={a > 0.5 ? PAL.cream : PAL.mute}>
                  <tspan fill={a > 0.5 ? PAL.lilac : PAL.mute}>{n}</tspan>
                  {"  " + label}
                </text>
                <rect x={x} y={214} width={a * 120} height={3} rx={1.5} fill={PAL.lilac} />
              </g>
            );
          })}
        </g>

        {/* side-note heading for the hard vs soft screen */}
        <text x={120} y={130} fontSize={46} fill={PAL.lilac} fontWeight={800} opacity={sideOp}>
          matching linker to metal
        </text>

        {/* ============================ 1a: rigid core (framework cell) ============================ */}
        <g opacity={win(F, 423, 445, 585, 610)}>
          <RigidCore frame={F - 233} />
        </g>

        {/* ===================== 1b: N-heterocycle or benzene ring, then BTC ===================== */}
        <g opacity={win(F, 590, 612, 700, 725)}>
          <text x={120} y={360} fontSize={44} fill={PAL.cream} fontWeight={600} opacity={ramp(F, 600, 18)}>
            often based on
          </text>
          <text x={120} y={425} fontSize={30} fill={C.warm} opacity={ramp(F, 615, 18)}>
            an N-heterocycle
          </text>
          <text x={120} y={475} fontSize={30} fill={C.body} opacity={ramp(F, 640, 18)}>
            or a benzene ring
          </text>
          <g transform="translate(1190, 520)" opacity={ramp(F, 615, 20)}>
            <ImidazolateForm neg="N1" dp={0} r={70} />
          </g>
          <text x={1190} y={650} textAnchor="middle" fontSize={26} fill={C.text} opacity={ramp(F, 625, 18)}>
            N-heterocycle (imidazole)
          </text>
          <g transform="translate(1590, 520)" opacity={ramp(F, 645, 20)}>
            <path d={pathOf(ring(0, 0, 84))} fill="none" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
            <circle cx={0} cy={0} r={47} fill="none" stroke={INK} strokeWidth={2} opacity={0.8} />
          </g>
          <text x={1590} y={650} textAnchor="middle" fontSize={26} fill={C.text} opacity={ramp(F, 655, 18)}>
            benzene ring
          </text>
        </g>

        {/* ===================== BTC (stays through geometry, moves left) ===================== */}
        <g opacity={btcIn * btcOut} transform={`translate(${btcX}, ${btcY})`}>
          <Linker cx={0} cy={0} r={92} at={[0, 2, 4]} progress={ramp(F, 730, 22)} />
          <text x={0} y={235} textAnchor="middle" fontSize={32} fill={C.text} opacity={ramp(F, 765, 16)}>
            BTC
          </text>
          <text x={0} y={275} textAnchor="middle" fontSize={24} fill={C.muted} opacity={ramp(F, 780, 16)}>
            benzene-1,3,5-tricarboxylate
          </text>
          <text x={0} y={318} textAnchor="middle" fontSize={28} fill={C.warm} fontWeight={600} opacity={ramp(F, 860, 16)}>
            used in MOF-199
          </text>

          {/* 120 degree angles between the three binding groups */}
          <g opacity={arcIn}>
            {arcs.map((a) => {
              const e = polar([0, 0], a, 150);
              return <line key={a} x1={0} y1={0} x2={e[0]} y2={e[1]} stroke={PAL.lilac} strokeWidth={1.8} strokeDasharray="5 6" opacity={0.7} />;
            })}
            {arcs.map((a, i) => {
              const b = arcs[(i + 1) % 3] + (i === 2 ? 360 : 0);
              const m = (a + b) / 2;
              const lp = polar([0, 0], m, 138);
              return (
                <g key={a}>
                  <path d={arcPath(a, b, 108)} fill="none" stroke={PAL.peach} strokeWidth={2.5} />
                  <text x={lp[0]} y={lp[1] + 8} textAnchor="middle" fontSize={24} fill={PAL.peach} fontWeight={600}>
                    {"120°"}
                  </text>
                </g>
              );
            })}
          </g>
        </g>

        {/* ======================== 2: defined geometry (text + paddlewheel) ======================== */}
        <g opacity={win(F, 950, 972, 1280, 1305)}>
          <text x={120} y={300} fontSize={44} fill={PAL.cream} fontWeight={600} opacity={ramp(F, 960, 18)}>
            tritopic
          </text>
          <text x={120} y={350} fontSize={30} fill={C.body} opacity={ramp(F, 1005, 18)}>
            three binding groups, 120° apart
          </text>
          <text x={120} y={395} fontSize={30} fill={C.body} opacity={ramp(F, 1090, 18)}>
            giving a trigonal planar shape
          </text>

          <text x={1000} y={618} textAnchor="middle" fontSize={64} fill={C.muted} opacity={ramp(F, 1150, 18)}>
            {"→"}
          </text>
          <g transform="translate(1440, 590)" opacity={ramp(F, 1155, 22)}>
            <PaddleWheel labels={ramp(F, 1215, 18)} />
          </g>
          <text x={1440} y={825} textAnchor="middle" fontSize={32} fill={C.text} opacity={ramp(F, 1175, 18)}>
            paddlewheel
          </text>
          <text x={1440} y={865} textAnchor="middle" fontSize={24} fill={C.muted} opacity={ramp(F, 1185, 18)}>
            two metals, four paddles
          </text>
        </g>

        {/* ============================== 3: hard vs soft donors ============================== */}
        <g opacity={win(F, 1285, 1307, 1600, 1625)}>
          <line x1={960} y1={290} x2={960} y2={920} stroke={PAL.mute} strokeWidth={1.5} opacity={0.35} />

          {/* left: carboxylate, hard: each oxygen binds a different metal (bridging) */}
          <g opacity={ramp(F, 1300, 20)}>
            <text x={120} y={330} fontSize={44} fill={C.warm} fontWeight={600}>
              carboxylate
            </text>
            <text x={120} y={378} fontSize={30} fill={C.muted}>
              hard donor
            </text>
            <g transform="translate(330, 590)">
              <line x1={-14} y1={0} x2={-62} y2={0} stroke={INK} strokeWidth={3} strokeLinecap="round" />
              <text x={-88} y={12} textAnchor="middle" fontSize={34} fill={INK} fontStyle="italic">
                R
              </text>
              {[-1, 1].map((sg) => {
                const ox = 56;
                const oy = sg * 32;
                const mx = 215;
                const my = sg * 66;
                const dx = mx - ox;
                const dy = my - oy;
                const len = Math.hypot(dx, dy);
                const ex = mx - (dx / len) * 44;
                const ey = my - (dy / len) * 44;
                return (
                  <g key={sg}>
                    <line x1={0} y1={0} x2={ox} y2={oy} stroke={INK} strokeWidth={3} strokeLinecap="round" />
                    <line x1={ox + (dx / len) * 12} y1={oy + (dy / len) * 12} x2={ex} y2={ey} stroke={PAL.lilac} strokeWidth={2.5} strokeDasharray="7 7" />
                    <circle cx={ox} cy={oy} r={7} fill={PAL.lilac} />
                    <Metal x={mx} y={my} r={42} label={"M\u2074\u207A"} />
                  </g>
                );
              })}
            </g>
            <text x={400} y={760} textAnchor="middle" fontSize={24} fill={C.muted}>
              each oxygen binds a different metal
            </text>
          </g>
          <text x={120} y={865} fontSize={32} fill={C.text} opacity={ramp(F, 1380, 20)}>
            typically binds high-valence cations
          </text>

          {/* right: pyrazolate, soft: two resonance forms, then bridging two metals */}
          <g opacity={ramp(F, 1440, 20)}>
            <text x={1010} y={330} fontSize={44} fill={C.warm} fontWeight={600}>
              pyrazolate
            </text>
            <text x={1010} y={378} fontSize={30} fill={C.muted}>
              soft donor
            </text>
            <g transform="translate(1240, 452)">
              <PyrazolateRing form="A" r={46} />
            </g>
            <text x={1410} y={464} textAnchor="middle" fontSize={44} fill={C.muted}>
              {"\u2194"}
            </text>
            <g transform="translate(1580, 452)">
              <PyrazolateRing form="B" r={46} />
            </g>
            <text x={1410} y={533} textAnchor="middle" fontSize={22} fill={C.muted}>
              charge on either N
            </text>
          </g>
          <g opacity={ramp(F, 1485, 20)}>
            <g transform="translate(1410, 724)">
              <PyrazolateRing form="deloc" r={52} />
              {[-126, -54].map((deg) => {
                const n = polar([0, 0], deg, 52);
                const m = polar(n, deg, 98);
                const e1 = polar(n, deg, 24);
                const e2 = polar(n, deg, 98 - 32);
                return (
                  <g key={deg}>
                    <line x1={e1[0]} y1={e1[1]} x2={e2[0]} y2={e2[1]} stroke={PAL.peach} strokeWidth={2.5} strokeDasharray="7 7" />
                    <Metal x={m[0]} y={m[1]} r={32} label={"M\u00B2\u207A"} />
                  </g>
                );
              })}
            </g>
            <text x={1410} y={806} textAnchor="middle" fontSize={22} fill={C.muted}>
              each N binds a metal
            </text>
          </g>
          <text x={1010} y={865} fontSize={32} fill={C.text} opacity={ramp(F, 1520, 20)}>
            typically binds transition metals
          </text>
          <text x={1010} y={910} fontSize={32} fill={C.text} opacity={ramp(F, 1540, 20)}>
            in the +2 oxidation state
          </text>
        </g>

        {/* ================================ 4: right length ================================ */}
        <g opacity={ramp(F, 1615, 24)}>
          <LengtheningLinker frame={F} t0={1625} />
        </g>

        {/* key + simplified-diagram note, rigid core onwards */}
      </svg>
    </AbsoluteFill>
  );
};
