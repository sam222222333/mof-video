import type { FC } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { FONT, PAL, BACKDROP_CSS } from "../style";

/* ------------------------------------------------------------------------ *
 * HOOK — opens the whole film (~11.9 s)
 *
 * TIMING — re-cut to the recorded voice-over (see vo-timeline.json):
 *   line 00  f0–69    "What substance has the highest surface area?"
 *   line 01  f96–166  "The answer is metal-organic frameworks."
 *   line 02  f185–337 "... 40 tennis courts."
 *   337–357 = the breath before the next section.
 *
 * Narration: "What substance has the highest surface area? The answer is
 * metal-organic frameworks. A single gram of a metal-organic framework can have
 * a surface area of up to about 40 tennis courts."
 *
 * The 40 is only true as a LANGMUIR figure for MOF-210 (10,400 m2/g; Furukawa
 * et al., Science 2010, 329, 424). Its BET area is 6,240 m2/g (about 24 courts).
 * Both are on screen so the claim is checkable. Court = 260.8 m2 (doubles).
 * ------------------------------------------------------------------------ */

const COURT_M2 = 260.8;
const LANGMUIR = 10400;
const BET = 6240;
const N = Math.round(LANGMUIR / COURT_M2); // 40

/** section length follows the VO, not the old 15 s budget */
export const HOOK_FRAMES = 357; // 11.9 s

const ramp = (f: number, s: number, d = 18): number =>
  interpolate(f, [s, s + d], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
const lin = (f: number, a: number, b: number): number =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** one doubles court, drawn to scale 23.77 x 10.97 */
const Court: FC<{ x: number; y: number; w: number; p: number }> = ({ x, y, w, p }) => {
  const h = (w * 10.97) / 23.77;
  const sx = w * (6.4 / 23.77); // service line distance from net
  const alley = h * (1.37 / 10.97);
  const line = { stroke: PAL.cream, strokeWidth: 1.6, fill: "none" } as const;
  return (
    <g opacity={p} transform={`translate(${x},${y + (1 - p) * 10})`}>
      <rect width={w} height={h} {...line} fill="#2f5d8f" fillOpacity={0.6} />
      <line x1={0} y1={alley} x2={w} y2={alley} {...line} />
      <line x1={0} y1={h - alley} x2={w} y2={h - alley} {...line} />
      <line x1={w / 2 - sx} y1={alley} x2={w / 2 - sx} y2={h - alley} {...line} />
      <line x1={w / 2 + sx} y1={alley} x2={w / 2 + sx} y2={h - alley} {...line} />
      <line x1={w / 2 - sx} y1={h / 2} x2={w / 2 + sx} y2={h / 2} {...line} />
      <line x1={w / 2} y1={0} x2={w / 2} y2={h} stroke={PAL.white} strokeWidth={2.4} />
    </g>
  );
};

export const Hook: FC<{ citations?: boolean }> = ({ citations = false }) => {
  const F = useCurrentFrame();

  const q = ramp(F, 0, 18) * (1 - lin(F, 69, 89));
  const a = ramp(F, 92, 18) * (1 - lin(F, 166, 186));
  const body = ramp(F, 188, 20);

  const cols = 8;
  const w = 150;
  const gx = 16;
  const gy = 14;
  const h = (w * 10.97) / 23.77;
  const gridW = cols * w + (cols - 1) * gx;
  const x0 = (1920 - gridW) / 2;
  const y0 = 395;

  const fill = lin(F, 205, 305); // courts appear one by one
  const shown = Math.round(fill * N);
  const count = shown;
  const src = ramp(F, 320, 18);

  return (
    <AbsoluteFill style={{ background: BACKDROP_CSS, fontFamily: FONT }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ fontFamily: FONT }}>
        {/* question */}
        <g opacity={q} transform={`translate(0,${(1 - q) * 14})`}>
          <text x={960} y={500} textAnchor="middle" fontSize={78} fontWeight={800} fill={PAL.cream}>
            What substance has the
          </text>
          <text x={960} y={595} textAnchor="middle" fontSize={78} fontWeight={800} fill={PAL.lilac}>
            highest surface area?
          </text>
        </g>

        {/* answer */}
        <g opacity={a} transform={`translate(0,${(1 - a) * 14})`}>
          <text x={960} y={528} textAnchor="middle" fontSize={96} fontWeight={800} fill={PAL.lilac}>
            Metal–organic frameworks
          </text>
          <text x={960} y={606} textAnchor="middle" fontSize={40} fill={PAL.mute}>
            MOFs
          </text>
        </g>

        {/* payoff */}
        <g opacity={body}>
          <text x={960} y={160} textAnchor="middle" fontSize={44} fill={PAL.mute}>
            1 gram of MOF-210 can have a surface area of up to
          </text>
          <text x={960} y={262} textAnchor="middle" fontSize={104} fontWeight={800} fill={PAL.peach}>
            ≈ {count}
            <tspan fontSize={54} fill={PAL.cream} fontWeight={700}> tennis courts</tspan>
          </text>
          <text x={960} y={330} textAnchor="middle" fontSize={30} fill={PAL.mute}>
            10,400 m² (Langmuir) ÷ 260.8 m² per court
          </text>
          {Array.from({ length: N }, (_, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const p = i < shown ? 1 : i === shown ? (fill * N - shown) : 0;
            return (
              <Court
                key={i}
                x={x0 + col * (w + gx)}
                y={y0 + row * (h + gy)}
                w={w}
                p={Math.max(0, Math.min(1, i < shown ? 1 : p))}
              />
            );
          })}
        </g>

        {/* source + honest context */}
        <g opacity={src}>
          <text x={960} y={960} textAnchor="middle" fontSize={26} fill={PAL.mute}>
            MOF-210 · Langmuir 10,400 m²/g · BET {BET.toLocaleString("en-GB")} m²/g (≈ 24 courts)
          </text>
          <text x={960} y={1000} textAnchor="middle" fontSize={22} fill={PAL.mute} fillOpacity={0.8}>
            doubles court = 23.77 × 10.97 m ≈ 260.8 m²
          </text>
        </g>
      </svg>
      {citations && (
        <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <text x={1848} y={1020} textAnchor="end" fontFamily={FONT} fontSize={19} fill={PAL.mute} opacity={0.6}>
            H. Furukawa et al., Science, 2010, 329, 424.
          </text>
        </svg>
      )}
    </AbsoluteFill>
  );
};
