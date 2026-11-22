import type { FC } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { BACKDROP_CSS, FONT, PAL } from "../style";

/* ------------------------------------------------------------------------ *
 * QUANTUM FIGURE 1 — d-orbital splitting: hydrated vs dehydrated
 * Spec: mof-video/QUANTUM-FIGS-SPEC.md (Figure 1)
 *
 * Accuracy contract (do not break when editing):
 *  - Level ordering and gaps are QUALITATIVE (tetragonal Cu2+ field). The only
 *    statement that must survive is: removing the axial ligand makes the gap
 *    across the top group LARGER.
 *  - Cu2+ is d9 -> exactly one hole, drawn as a single open circle in the
 *    highest level of each panel (never two).
 *  - The excitation arrow is drawn in the HOLE picture required by the spec: a
 *    d-d absorption moves the hole down, i.e. an electron moves up. The
 *    footnote states this so the arrow cannot be misread as emission.
 * ------------------------------------------------------------------------ */

const C = {
  bg: "#0a0d14",
  accent: PAL.lilac,
  cyan: PAL.peach,
  text: PAL.cream,
  body: "#cfc9be",
  muted: PAL.mute,
  line: "#6b7a99",
  plane: "#3a4a6e",
  oxygen: "#d96a6a",
} as const;

/** 0 -> 1 ramp with easing; used for every animated element in this figure. */
const ramp = (frame: number, start: number, dur = 12): number =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

type Level = { y: number; label: string; note?: string };

/* Level rows top -> bottom on screen = high -> low in energy. */
const HYDRATED: Level[] = [
  { y: 490, label: "dx\u00B2\u2212y\u00B2" },
  { y: 576, label: "dz\u00B2" },
  { y: 642, label: "dxy" },
  { y: 766, label: "dxz, dyz", note: "(degenerate)" },
];

const DEHYDRATED: Level[] = [
  { y: 490, label: "dx\u00B2\u2212y\u00B2" },
  { y: 622, label: "dxy" },
  { y: 682, label: "dz\u00B2" },
  { y: 842, label: "dxz, dyz", note: "(degenerate)" },
];

const LEVEL_START = 8;
const LEVEL_STAGGER = 4.5; // 150 ms at 30 fps
const LEVEL_DUR = 12;

/* ---------------------------------- atoms --------------------------------- */

const CU = { x: 220, y: 150, r: 17 };
const AXIAL = { x: 220, y: 46, r: 16 };
const EQUATORIAL = [
  { x: 326, y: 116, r: 16 }, // back right
  { x: 114, y: 116, r: 16 }, // back left
  { x: 114, y: 184, r: 16 }, // front left
  { x: 326, y: 184, r: 16 }, // front right
];

/** Trim a bond line so it stops at the edge of each atom circle. */
const bondLine = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  r1: number,
  r2: number,
) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const d = Math.hypot(dx, dy) || 1;
  return {
    x1: x1 + (dx / d) * r1,
    y1: y1 + (dy / d) * r1,
    x2: x2 - (dx / d) * r2,
    y2: y2 - (dy / d) * r2,
  };
};

const AtomCircle: FC<{
  cx: number;
  cy: number;
  r: number;
  stroke: string;
  fill?: string;
  label?: string;
  dashed?: boolean;
}> = ({ cx, cy, r, stroke, fill = "none", label, dashed }) => (
  <g>
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill={fill}
      stroke={stroke}
      strokeWidth={2.5}
      strokeDasharray={dashed ? "4 5" : undefined}
    />
    {label ? (
      <text
        x={cx}
        y={cy + 7}
        textAnchor="middle"
        fontSize={20}
        fill={stroke}
        fontWeight={600}
      >
        {label}
      </text>
    ) : null}
  </g>
);

/* ------------------------------ local geometry ----------------------------- */

/** Square-pyramidal (hydrated) or square-planar + empty site (dehydrated). */
const Geometry: FC<{ hydrated: boolean; opacity: number; rise: number }> = ({
  hydrated,
  opacity,
  rise,
}) => {
  const bonds = EQUATORIAL.map((o) =>
    bondLine(CU.x, CU.y, o.x, o.y, CU.r, o.r),
  );
  const axialBond = bondLine(CU.x, CU.y, AXIAL.x, AXIAL.y, CU.r, AXIAL.r);

  return (
    <g transform={`translate(0, ${rise})`} opacity={opacity}>
      {/* the coordination plane, read at a glance */}
      <ellipse
        cx={CU.x}
        cy={CU.y}
        rx={150}
        ry={48}
        fill="none"
        stroke={C.plane}
        strokeWidth={2}
        strokeDasharray="3 7"
        opacity={0.85}
      />

      {/* back pair of oxygens */}
      {EQUATORIAL.slice(0, 2).map((o, i) => (
        <g key={`back${i}`}>
          <line
            {...bonds[i]}
            stroke={C.line}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <AtomCircle cx={o.x} cy={o.y} r={o.r} stroke={C.oxygen} label="O" />
        </g>
      ))}

      {/* axial ligand: water when hydrated, empty site when dehydrated */}
      {hydrated ? (
        <g>
          <line
            {...axialBond}
            stroke={C.line}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <AtomCircle
            cx={AXIAL.x}
            cy={AXIAL.y}
            r={AXIAL.r}
            stroke={C.oxygen}
            label="O"
          />
          <text x={AXIAL.x + 26} y={AXIAL.y + 7} fontSize={20} fill={C.muted}>
            {"H\u2082O"}
          </text>
        </g>
      ) : (
        <g>
          <line
            x1={CU.x}
            y1={CU.y - CU.r - 2}
            x2={AXIAL.x}
            y2={AXIAL.y + AXIAL.r + 4}
            stroke={C.plane}
            strokeWidth={2.5}
            strokeDasharray="4 5"
            strokeLinecap="round"
          />
          <AtomCircle
            cx={AXIAL.x}
            cy={AXIAL.y}
            r={AXIAL.r}
            stroke={C.plane}
            dashed
          />
          <text x={AXIAL.x + 26} y={AXIAL.y + 7} fontSize={20} fill={C.muted}>
            empty site
          </text>
        </g>
      )}

      {/* copper */}
      <AtomCircle
        cx={CU.x}
        cy={CU.y}
        r={CU.r}
        stroke={C.accent}
        fill={C.bg}
        label="Cu"
      />

      {/* front pair of oxygens, drawn last so the plane reads correctly */}
      {EQUATORIAL.slice(2).map((o, i) => (
        <g key={`front${i}`}>
          <line
            {...bonds[i + 2]}
            stroke={C.line}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <AtomCircle cx={o.x} cy={o.y} r={o.r} stroke={C.oxygen} label="O" />
        </g>
      ))}
    </g>
  );
};

/* --------------------------------- one panel -------------------------------- */

const Panel: FC<{
  frame: number;
  cx: number;
  kicker: string;
  name: string;
  hydrated: boolean;
  levels: Level[];
  deltaTop: number;
  deltaBottom: number;
  deltaStart: number;
  deltaWord: string;
  pulse: number;
  showArrow: boolean;
}> = ({
  frame,
  cx,
  kicker,
  name,
  hydrated,
  levels,
  deltaTop,
  deltaBottom,
  deltaStart,
  deltaWord,
  pulse,
  showArrow,
}) => {
  const headIn = ramp(frame, 2, 14);
  const geoIn = ramp(frame, 8, 20);
  const geoRise = interpolate(geoIn, [0, 1], [12, 0]);

  const deltaP = ramp(frame, deltaStart, 16);
  const deltaEnd = deltaTop + (deltaBottom - deltaTop) * deltaP;
  const deltaMid = (deltaTop + deltaBottom) / 2;
  const deltaLabelIn = ramp(frame, deltaStart + 8, 10);

  const holeIn = ramp(frame, 92, 12);
  const arrowP = showArrow ? ramp(frame, 100, 16) : 0;
  // The arrow finishes at 116; then the hole — d9 has exactly one — travels down
  // to the next level. That IS the absorption: in the hole picture an electron
  // going up looks like the hole going down. The levels themselves do not move:
  // delta is fixed by the geometry, so the bracket must NOT grow here.
  const dropP = showArrow ? ramp(frame, 118, 24) : 0;
  const holeY = levels[0].y + (levels[1].y - levels[0].y) * dropP;

  const bracketX = cx + 225;
  const tick = 16;
  const arrowX = cx + 30;
  const arrowTop = deltaTop + 12;
  const arrowBottom = deltaBottom - 20;

  return (
    <g>
      <defs>
        <radialGradient id={`holeglow${cx}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={C.cyan} stopOpacity={0.55} />
          <stop offset="100%" stopColor={C.cyan} stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* panel heading */}
      <g opacity={headIn}>
        <text
          x={cx}
          y={110}
          textAnchor="middle"
          fontSize={24}
          letterSpacing={10}
          fill={C.accent}
          fontWeight={700}
        >
          {kicker}
        </text>
        <text x={cx} y={154} textAnchor="middle" fontSize={34} fill={C.text}>
          {name}
        </text>
      </g>

      {/* geometry above the ladder */}
      <g transform={`translate(${cx - 220}, 196)`}>
        <Geometry hydrated={hydrated} opacity={geoIn} rise={geoRise} />
      </g>

      {/* energy levels */}
      {levels.map((lv, i) => {
        const p = ramp(frame, LEVEL_START + i * LEVEL_STAGGER, LEVEL_DUR);
        const dx = interpolate(p, [0, 1], [-10, 0]);
        const isTop = i === 0;
        return (
          <g key={`${lv.label}${i}`} opacity={p} transform={`translate(${dx}, 0)`}>
            <line
              x1={cx - 80}
              y1={lv.y}
              x2={cx + 200}
              y2={lv.y}
              stroke={isTop ? C.accent : C.line}
              strokeWidth={isTop ? 3 : 2.5}
              strokeLinecap="round"
            />
            <text
              x={cx - 96}
              y={lv.y + 8}
              textAnchor="end"
              fontSize={24}
              fill={isTop ? C.text : C.body}
            >
              {lv.label}
            </text>
            {lv.note ? (
              <text
                x={cx - 96}
                y={lv.y + 32}
                textAnchor="end"
                fontSize={20}
                fill={C.muted}
              >
                {lv.note}
              </text>
            ) : null}
          </g>
        );
      })}

      {/* the gap that changes: Delta */}
      <g opacity={deltaLabelIn}>
        <text
          x={bracketX + 16}
          y={deltaMid - 6}
          fontSize={30 * (1 + 0.12 * pulse)}
          fill={C.accent}
          fontWeight={700}
        >
          {"\u0394"}
        </text>
        <text
          x={bracketX + 16}
          y={deltaMid + 26}
          fontSize={20}
          fill={C.muted}
          opacity={0.9 + 0.1 * pulse}
        >
          {deltaWord}
        </text>
      </g>
      <path
        d={`M ${bracketX - tick} ${deltaTop} H ${bracketX} V ${deltaEnd} H ${bracketX - tick}`}
        fill="none"
        stroke={C.accent}
        strokeWidth={2.5}
        strokeOpacity={0.85 + 0.15 * pulse}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={deltaP > 0.01 ? 1 : 0}
      />

      {/* d9: exactly one hole — and it moves, because that is the transition */}
      <g opacity={holeIn}>
        <circle
          cx={cx + 160}
          cy={holeY}
          r={30}
          fill={`url(#holeglow${cx})`}
          opacity={0.45 + 0.55 * dropP}
        />
        <circle
          cx={cx + 160}
          cy={holeY}
          r={8}
          fill={C.bg}
          stroke={C.cyan}
          strokeWidth={2.5}
        />
      </g>

      {/* d-d excitation, drawn in the hole picture (see footnote) */}
      {showArrow ? (
        <g opacity={Math.min(1, arrowP * 1.6)}>
          <line
            x1={arrowX}
            y1={arrowTop}
            x2={arrowX}
            y2={arrowTop + (arrowBottom - arrowTop) * arrowP}
            stroke={C.cyan}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          {arrowP > 0.85 ? (
            <path
              d={`M ${arrowX - 9} ${arrowBottom - 12} L ${arrowX} ${arrowBottom - 1} L ${arrowX + 9} ${arrowBottom - 12}`}
              fill="none"
              stroke={C.cyan}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
          <text
            x={arrowX + 16}
            y={deltaMid + 8}
            fontSize={22}
            fill={C.cyan}
            opacity={arrowP}
          >
            {"d\u2013d"}
          </text>
        </g>
      ) : null}
    </g>
  );
};

/* ---------------------------------- figure --------------------------------- */

export const QuantumFig1: FC = () => {
  const frame = useCurrentFrame();

  // the right-hand Delta gets a subtle pulse once both brackets exist
  const pulse = interpolate(frame, [72, 82, 94], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  const headIn = ramp(frame, 0, 12);
  // the "schematic / not to scale" disclaimer is on screen the whole time
  const footIn = ramp(frame, 4, 14);

  return (
    <AbsoluteFill style={{ background: BACKDROP_CSS }}>
      <svg
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        style={{ fontFamily: FONT }}
      >
        <text
          x={960}
          y={72}
          textAnchor="middle"
          fontSize={22}
          letterSpacing={3}
          fill={C.muted}
          opacity={headIn}
        >
          {"Cu\u00B2\u207A  \u00B7  d\u2079  \u2014  one hole in the d shell"}
        </text>

        <Panel
          frame={frame}
          cx={500}
          kicker="HYDRATED"
          name="square pyramidal"
          hydrated
          levels={HYDRATED}
          deltaTop={490}
          deltaBottom={576}
          deltaStart={38}
          deltaWord="smaller gap"
          pulse={0}
          showArrow
        />

        <Panel
          frame={frame}
          cx={1400}
          kicker="DEHYDRATED"
          name="square planar"
          hydrated={false}
          levels={DEHYDRATED}
          deltaTop={490}
          deltaBottom={622}
          deltaStart={44}
          deltaWord="larger gap"
          pulse={pulse}
          showArrow={false}
        />

        {/* footnotes — the honesty layer */}
        <g opacity={footIn} fill={C.muted} fontSize={20}>
          <text x={120} y={948}>
            {"schematic \u2014 level ordering and gaps not to scale"}
          </text>
          <text x={120} y={978}>
            {
              "arrow shows the hole: in d\u2079 absorption moves the hole down (electron promoted up)"
            }
          </text>
          <text x={1800} y={978} textAnchor="end">
            {"Chui 1999 (Science) \u00B7 M\u00FCller 2017 (ACS Appl. Mater. Interfaces)"}
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
