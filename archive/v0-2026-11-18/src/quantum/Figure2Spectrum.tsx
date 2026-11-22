import type { FC } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

/* ------------------------------------------------------------------------ *
 * QUANTUM FIGURE 2 — absorption vs observed colour
 * Spec: mof-video/QUANTUM-FIGS-SPEC.md (Figure 2)
 *
 * Accuracy contract:
 *  - The observed colour is the COMPLEMENT of the absorbed light. Wording stays
 *    directional ("absorbs more orange -> looks bluer"); no claim is made about
 *    a precise wavelength, because the HKUST-1 bands are broad.
 *  - Band positions are drawn from the approximate ranges in the spec
 *    (hydrated ~600-650 nm, dehydrated ~570-600 nm) and are marked with "~".
 *  - Swatch hex values are approximate and marked with "~".
 * ------------------------------------------------------------------------ */

const C = {
  bg: "#0b1020",
  accent: "#4da3ff",
  text: "#eaf1ff",
  body: "#c8d4ea",
  muted: "#8fa3c8",
  turquoise: "#40c8b0",
  deepBlue: "#1e3a8a",
  deepBlueText: "#6ea8ff",
  ink: "#050912",
} as const;

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const ramp = (frame: number, start: number, dur = 14): number =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

/* ---------------------------------- layout -------------------------------- */

const NM_MIN = 380;
const NM_MAX = 750;
const BAR_X0 = 130;
const BAR_X1 = 1330;
const BAR_Y = 280;
const BAR_H = 68;
const BAR_BOTTOM = BAR_Y + BAR_H;

const nmToX = (nm: number): number =>
  BAR_X0 + ((nm - NM_MIN) / (NM_MAX - NM_MIN)) * (BAR_X1 - BAR_X0);

const TICKS = [380, 450, 500, 550, 600, 650, 700, 750];

/** Broad absorption bands, drawn as soft dark blobs across the spectrum bar. */
const BANDS = [
  {
    key: "dehydrated",
    nmFrom: 570,
    nmTo: 597,
    color: C.deepBlueText,
    label: "dehydrated",
    range: "absorbs \u2248 570\u2013600 nm",
    swatch: C.deepBlue,
    swatchLabel: "\u2248 deep blue",
    swatchHex: "\u2248 #1e3a8a",
    chipCx: 735,
  },
  {
    key: "hydrated",
    nmFrom: 603,
    nmTo: 650,
    color: C.turquoise,
    label: "hydrated",
    range: "absorbs \u2248 600\u2013650 nm",
    swatch: C.turquoise,
    swatchLabel: "\u2248 turquoise",
    swatchHex: "\u2248 #40c8b0",
    chipCx: 985,
  },
] as const;

const CHIP_Y = 480;
const CHIP_W = 200;
const CHIP_H = 100;

/* --------------------------------- arrows --------------------------------- */

const LeaderArrow: FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  progress: number;
}> = ({ x1, y1, x2, y2, color, progress }) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const ex = x1 + dx * progress;
  const ey = y1 + dy * progress;
  const head = progress > 0.92;
  return (
    <g opacity={progress > 0 ? 1 : 0}>
      <line
        x1={x1}
        y1={y1}
        x2={ex}
        y2={ey}
        stroke={color}
        strokeWidth={2}
        strokeOpacity={0.75}
        strokeDasharray="5 6"
        strokeLinecap="round"
      />
      {head ? (
        <path
          d={`M ${x2 - 10 * ux - 6 * uy} ${y2 - 10 * uy + 6 * ux} L ${x2} ${y2} L ${x2 - 10 * ux + 6 * uy} ${y2 - 10 * uy - 6 * ux}`}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
    </g>
  );
};

/* ---------------------------------- figure --------------------------------- */

export const QuantumFig2: FC = () => {
  const frame = useCurrentFrame();

  const barIn = ramp(frame, 0, 16);
  const barRise = interpolate(barIn, [0, 1], [14, 0]);
  const ticksIn = ramp(frame, 6, 14);
  const axisIn = ramp(frame, 10, 12);
  const bandLabelIn = ramp(frame, 18, 14);
  const blobIn = ramp(frame, 20, 18);
  const chipAIn = ramp(frame, 44, 14);
  const chipBIn = ramp(frame, 52, 14);
  const capIn = ramp(frame, 64, 14);
  const subIn = ramp(frame, 74, 14);

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <svg
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        style={{ fontFamily: FONT }}
      >
        <defs>
          <linearGradient id="qfig2-spectrum" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6b2fb8" />
            <stop offset="19%" stopColor="#3b3bd6" />
            <stop offset="32%" stopColor="#2f9fe0" />
            <stop offset="46%" stopColor="#3fbf7f" />
            <stop offset="57%" stopColor="#d8d84a" />
            <stop offset="70%" stopColor="#e08a2f" />
            <stop offset="86%" stopColor="#c33b2f" />
            <stop offset="100%" stopColor="#7a1f1f" />
          </linearGradient>

          {/* one ink gradient per band: a soft-edged vertical slice of the spectrum */}
          {BANDS.map((b) => (
            <linearGradient
              key={`grad-${b.key}`}
              id={`qfig2-band-${b.key}`}
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop offset="0%" stopColor={C.ink} stopOpacity={0} />
              <stop offset="16%" stopColor={C.ink} stopOpacity={0.82} />
              <stop offset="50%" stopColor={C.ink} stopOpacity={0.96} />
              <stop offset="84%" stopColor={C.ink} stopOpacity={0.82} />
              <stop offset="100%" stopColor={C.ink} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>

        {/* spectrum bar */}
        <g opacity={barIn} transform={`translate(0, ${barRise})`}>
          <rect
            x={BAR_X0}
            y={BAR_Y}
            width={BAR_X1 - BAR_X0}
            height={BAR_H}
            rx={4}
            fill="url(#qfig2-spectrum)"
          />

          {/* absorption bands: broad soft slices, never sharp lines */}
          {BANDS.map((b) => {
            const xFrom = nmToX(b.nmFrom);
            const xTo = nmToX(b.nmTo);
            return (
              <rect
                key={`band-${b.key}`}
                x={xFrom - 4}
                y={BAR_Y - 14}
                width={xTo - xFrom + 8}
                height={BAR_H + 28}
                fill={`url(#qfig2-band-${b.key})`}
                opacity={blobIn}
              />
            );
          })}

          <rect
            x={BAR_X0}
            y={BAR_Y}
            width={BAR_X1 - BAR_X0}
            height={BAR_H}
            rx={4}
            fill="none"
            stroke="#ffffff"
            strokeOpacity={0.12}
            strokeWidth={2}
          />
        </g>

        {/* wavelength axis */}
        <g opacity={ticksIn}>
          {TICKS.map((nm) => (
            <g key={`tick-${nm}`}>
              <line
                x1={nmToX(nm)}
                y1={BAR_BOTTOM}
                x2={nmToX(nm)}
                y2={BAR_BOTTOM + 10}
                stroke={C.muted}
                strokeWidth={2}
                strokeOpacity={0.8}
              />
              <text
                x={nmToX(nm)}
                y={BAR_BOTTOM + 34}
                textAnchor="middle"
                fontSize={20}
                fill={C.muted}
              >
                {nm}
              </text>
            </g>
          ))}
        </g>
        <text
          x={BAR_X0}
          y={BAR_BOTTOM + 96}
          fontSize={20}
          fill={C.muted}
          opacity={axisIn}
        >
          {"approx. wavelength (nm)"}
        </text>

        {/* state labels above the bar, pointing at their band */}
        {BANDS.map((b) => {
          const cx = nmToX((b.nmFrom + b.nmTo) / 2);
          const anchorEnd = b.key === "dehydrated";
          return (
            <g key={`label-${b.key}`} opacity={bandLabelIn}>
              <line
                x1={cx}
                y1={BAR_Y - 10}
                x2={cx}
                y2={BAR_Y}
                stroke={b.color}
                strokeWidth={2.5}
              />
              <text
                x={cx}
                y={BAR_Y - 44}
                textAnchor={anchorEnd ? "end" : "start"}
                fontSize={24}
                fill={b.color}
                fontWeight={600}
              >
                {b.label}
              </text>
              <text
                x={cx}
                y={BAR_Y - 16}
                textAnchor={anchorEnd ? "end" : "start"}
                fontSize={20}
                fill={C.muted}
              >
                {b.range}
              </text>
            </g>
          );
        })}

        {/* band -> swatch, one arrow each, no crossings */}
        {BANDS.map((b) => {
          const cx = nmToX((b.nmFrom + b.nmTo) / 2);
          const p = b.key === "dehydrated" ? chipAIn : chipBIn;
          return (
            <LeaderArrow
              key={`lead-${b.key}`}
              x1={cx}
              y1={BAR_BOTTOM + 6}
              x2={b.chipCx}
              y2={CHIP_Y - 8}
              color={b.color}
              progress={p}
            />
          );
        })}

        {/* the two observed colours */}
        {BANDS.map((b) => {
          const p = b.key === "dehydrated" ? chipAIn : chipBIn;
          const s = interpolate(p, [0, 1], [0.94, 1]);
          const rise = interpolate(p, [0, 1], [10, 0]);
          return (
            <g
              key={`chip-${b.key}`}
              opacity={p}
              transform={`translate(${b.chipCx}, ${CHIP_Y + CHIP_H / 2 + rise}) scale(${s}) translate(${-b.chipCx}, ${-(CHIP_Y + CHIP_H / 2)})`}
            >
              <rect
                x={b.chipCx - CHIP_W / 2}
                y={CHIP_Y}
                width={CHIP_W}
                height={CHIP_H}
                rx={8}
                fill={b.swatch}
                stroke="#ffffff"
                strokeOpacity={0.14}
                strokeWidth={2}
              />
              <text
                x={b.chipCx}
                y={CHIP_Y + CHIP_H + 44}
                textAnchor="middle"
                fontSize={24}
                fill={b.color}
                fontWeight={600}
              >
                {b.swatchLabel}
              </text>
              <text
                x={b.chipCx}
                y={CHIP_Y + CHIP_H + 72}
                textAnchor="middle"
                fontSize={22}
                fill={C.muted}
              >
                {b.label}
              </text>
            </g>
          );
        })}

        {/* colour value, marked approximate */}
        <g opacity={chipBIn}>
          {BANDS.map((b) => (
            <text
              key={`hex-${b.key}`}
              x={b.chipCx}
              y={CHIP_Y + CHIP_H + 100}
              textAnchor="middle"
              fontSize={20}
              fill={C.muted}
              opacity={0.85}
            >
              {b.swatchHex}
            </text>
          ))}
        </g>

        {/* the one sentence that ties absorption to appearance */}
        <text
          x={960}
          y={790}
          textAnchor="middle"
          fontSize={34}
          fill={C.text}
          opacity={capIn}
        >
          {"absorbs more orange  \u2192  looks bluer"}
        </text>
        <text
          x={960}
          y={832}
          textAnchor="middle"
          fontSize={22}
          fill={C.muted}
          opacity={subIn}
        >
          {"the colour you see is the light that is not absorbed"}
        </text>

        <g opacity={subIn} fill={C.muted} fontSize={20}>
          <text x={130} y={960}>
            {"broad bands \u2014 these positions are approximate (thin-film UV\u2013vis)"}
          </text>
          <text x={1800} y={960} textAnchor="end">
            {"M\u00FCller 2017 (ACS Appl. Mater. Interfaces) \u00B7 Chui 1999 (Science)"}
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
