import type { FC } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { LATTICE_LINE, LATTICE_LINE_W, NODE_FILL, NODE_R } from "./latticeStyle";

/* ------------------------------------------------------------------------ *
 * QUANTUM FIGURE 3 — broken symmetry = colour
 * Spec: mof-video/QUANTUM-FIGS-SPEC.md (Figure 3)
 *
 * Accuracy contract:
 *  - This is a CONCEPT illustration of Müller et al. 2017 (defects localise the
 *    d-d excitation). It is not a simulation, so it is labelled "schematic".
 *  - The lattice itself never turns green: the colour lives at the defect.
 *
 * Draw order matters: bonds, then the glow, then the nodes. The glow has to sit
 * BEHIND the lattice, otherwise it reads as the crystal changing colour.
 *
 * Node glyph, radius, fill and bond colour come from ./latticeStyle so this
 * figure and the Shot 05 opening draw the same lattice. See P3 in STATE.md.
 * ------------------------------------------------------------------------ */

const C = {
  bg: "#0b1020",
  text: "#eaf1ff",
  muted: "#8fa3c8",
  green: "#3fbf7f",
  divider: "#1a2440",
} as const;

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const ramp = (frame: number, start: number, dur = 12): number =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

/* ---------------------------------- lattice -------------------------------- */

const COLS = 7;
const ROWS = 5;
const SPACING = 84;
const NODE_OPACITY = 0.45;

const LAT_Y0 = 282;
const LEFT_X0 = 480 - ((COLS - 1) * SPACING) / 2;
const RIGHT_X0 = 1440 - ((COLS - 1) * SPACING) / 2;

/** the vacancy sits at the centre of the right-hand lattice */
const HOLD_C = 3;
const HOLD_R = 2;
const holdX = RIGHT_X0 + HOLD_C * SPACING;
const holdY = LAT_Y0 + HOLD_R * SPACING;

/** lattice strain: near neighbours relax towards the vacancy */
const STRAIN_RADIUS = 2.6; // in lattice units
const STRAIN_MAX = 18; // px

const strainVector = (
  col: number,
  row: number,
): { dx: number; dy: number; amount: number } => {
  const dc = col - HOLD_C;
  const dr = row - HOLD_R;
  const d = Math.hypot(dc, dr);
  if (d === 0 || d > STRAIN_RADIUS) {
    return { dx: 0, dy: 0, amount: 0 };
  }
  const falloff = 1 - d / STRAIN_RADIUS;
  const amount = STRAIN_MAX * falloff;
  return { dx: (-dc / d) * amount, dy: (-dr / d) * amount, amount };
};

type Seg = { c1: number; r1: number; c2: number; r2: number };

/** every nearest-neighbour bond of the grid, built once */
const SEGS: Seg[] = (() => {
  const out: Seg[] = [];
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      if (col < COLS - 1) out.push({ c1: col, r1: row, c2: col + 1, r2: row });
      if (row < ROWS - 1) out.push({ c1: col, r1: row, c2: col, r2: row + 1 });
    }
  }
  return out;
})();

const touchesVacancy = (s: Seg): boolean =>
  (s.c1 === HOLD_C && s.r1 === HOLD_R) || (s.c2 === HOLD_C && s.r2 === HOLD_R);

/* ---------------------------------- panels --------------------------------- */

/** The left lattice: nothing moves, nothing is missing. */
const PerfectLattice: FC<{ frame: number }> = ({ frame }) => (
  <g>
    {SEGS.map((s, i) => {
      const p = ramp(frame, 2 + i * 0.12, 8);
      if (p <= 0) return null;
      return (
        <line
          key={`b${i}`}
          x1={LEFT_X0 + s.c1 * SPACING}
          y1={LAT_Y0 + s.r1 * SPACING}
          x2={LEFT_X0 + s.c1 * SPACING + (s.c2 - s.c1) * SPACING * p}
          y2={LAT_Y0 + s.r1 * SPACING + (s.r2 - s.r1) * SPACING * p}
          stroke={LATTICE_LINE}
          strokeWidth={LATTICE_LINE_W}
          opacity={NODE_OPACITY * 0.75 * p}
        />
      );
    })}
    {Array.from({ length: ROWS }).map((_, row) =>
      Array.from({ length: COLS }).map((__, col) => {
        const i = row * COLS + col;
        const p = ramp(frame, 2 + i * 0.5, 8);
        if (p <= 0) return null;
        return (
          <circle
            key={`n${col}-${row}`}
            cx={LEFT_X0 + col * SPACING}
            cy={LAT_Y0 + row * SPACING}
            r={NODE_R * interpolate(p, [0, 1], [0.45, 1])}
            fill={NODE_FILL}
            opacity={NODE_OPACITY * p}
          />
        );
      }),
    )}
  </g>
);

/** The right lattice: bonds follow the strained positions, and the four bonds
 *  to the vacancy disappear exactly when the node does. */
const DefectLattice: FC<{ frame: number; holeOut: number; strain: number }> = ({
  frame,
  holeOut,
  strain,
}) => {
  const at = (col: number, row: number) => {
    const s = strainVector(col, row);
    return {
      x: RIGHT_X0 + col * SPACING + s.dx * strain,
      y: LAT_Y0 + row * SPACING + s.dy * strain,
    };
  };

  return (
    <g>
      {SEGS.map((s, i) => {
        const p = ramp(frame, 36 + i * 0.12, 8);
        if (p <= 0) return null;
        const a = at(s.c1, s.r1);
        const b = at(s.c2, s.r2);
        const alive = touchesVacancy(s) ? 1 - holeOut : 1;
        if (alive <= 0.01) return null;
        return (
          <line
            key={`b${i}`}
            x1={a.x}
            y1={a.y}
            x2={a.x + (b.x - a.x) * p}
            y2={a.y + (b.y - a.y) * p}
            stroke={LATTICE_LINE}
            strokeWidth={LATTICE_LINE_W}
            opacity={NODE_OPACITY * 0.75 * p * alive}
          />
        );
      })}

      {Array.from({ length: ROWS }).map((_, row) =>
        Array.from({ length: COLS }).map((__, col) => {
          const i = row * COLS + col;
          const p = ramp(frame, 36 + i * 0.5, 8);
          if (p <= 0) return null;

          const baseX = RIGHT_X0 + col * SPACING;
          const baseY = LAT_Y0 + row * SPACING;
          const s = strainVector(col, row);

          if (col === HOLD_C && row === HOLD_R) {
            const shrink = interpolate(holeOut, [0, 1], [1, 0.25]);
            return (
              <circle
                key={`n${col}-${row}`}
                cx={baseX}
                cy={baseY}
                r={NODE_R * shrink * p}
                fill={NODE_FILL}
                opacity={NODE_OPACITY * p * (1 - holeOut)}
              />
            );
          }

          return (
            <circle
              key={`n${col}-${row}`}
              cx={baseX + s.dx * strain}
              cy={baseY + s.dy * strain}
              r={NODE_R * interpolate(p, [0, 1], [0.45, 1])}
              fill={NODE_FILL}
              opacity={NODE_OPACITY * p}
            />
          );
        }),
      )}
    </g>
  );
};

/* ---------------------------------- figure --------------------------------- */

export const QuantumFig3: FC = () => {
  const frame = useCurrentFrame();

  const leftCapIn = ramp(frame, 24, 14);
  const rightCapIn = ramp(frame, 58, 14);

  // the defect
  const holeOut = ramp(frame, 70, 14);
  const ghostIn = ramp(frame, 78, 12);
  const strain = ramp(frame, 76, 30);
  const glowIn = ramp(frame, 80, 34);
  const ripple = interpolate(frame, [84, 126], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const headline = "colour needs broken symmetry";
  const typed = Math.round(
    interpolate(frame, [116, 146], [0, headline.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const headlineIn = ramp(frame, 138, 12);
  const dividerIn = ramp(frame, 30, 16);

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <svg
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        style={{ fontFamily: FONT }}
      >
        <defs>
          <radialGradient id="qfig3-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={C.green} stopOpacity={0.5} />
            <stop offset="40%" stopColor={C.green} stopOpacity={0.18} />
            <stop offset="100%" stopColor={C.green} stopOpacity={0} />
          </radialGradient>
        </defs>

        <line
          x1={960}
          y1={220}
          x2={960}
          y2={760}
          stroke={C.divider}
          strokeWidth={2}
          opacity={dividerIn}
        />

        {/* LEFT — perfect lattice */}
        <PerfectLattice frame={frame} />
        <text
          x={480}
          y={700}
          textAnchor="middle"
          fontSize={28}
          fill={C.muted}
          opacity={leftCapIn}
        >
          {"perfect lattice  \u2192  colourless"}
        </text>

        {/* RIGHT — the same lattice with one defect */}

        {/* glow sits BEHIND the lattice: the colour lives at the defect, it does
            not recolour the crystal */}
        <circle
          cx={holdX}
          cy={holdY}
          r={170}
          fill="url(#qfig3-glow)"
          opacity={glowIn}
        />

        <DefectLattice frame={frame} holeOut={holeOut} strain={strain} />

        {/* ripple travelling outward from the vacancy */}
        <circle
          cx={holdX}
          cy={holdY}
          r={24 + 236 * ripple}
          fill="none"
          stroke={C.green}
          strokeWidth={2}
          opacity={0.5 * (1 - ripple)}
        />

        {/* ghost of the missing node */}
        <circle
          cx={holdX}
          cy={holdY}
          r={NODE_R + 5}
          fill="none"
          stroke={C.green}
          strokeWidth={2}
          strokeDasharray="4 5"
          opacity={0.85 * ghostIn}
        />

        <text
          x={1440}
          y={700}
          textAnchor="middle"
          fontSize={28}
          fill={C.green}
          opacity={rightCapIn}
        >
          {"defect  \u2192  colour"}
        </text>

        {/* the one line it all comes down to */}
        <text
          x={636}
          y={880}
          fontSize={46}
          fill={C.text}
          letterSpacing={1.5}
          opacity={typed > 0 ? 1 : 0}
        >
          {headline.slice(0, typed)}
        </text>

        <text
          x={960}
          y={968}
          textAnchor="middle"
          fontSize={20}
          fill={C.muted}
          opacity={headlineIn}
        >
          {
            "schematic, not a simulation \u2014 after M\u00FCller et al. 2017 (ACS Appl. Mater. Interfaces)"
          }
        </text>
      </svg>
    </AbsoluteFill>
  );
};
