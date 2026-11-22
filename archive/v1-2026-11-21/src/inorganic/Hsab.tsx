import type { FC } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { BACKDROP_CSS, FONT, PAL, SectionTitle } from "../style";

/* ------------------------------------------------------------------------ *
 * SHOT 04 · closing card — Pearson HSAB, and why the right pair survives.
 *
 * Source: the group script, "Inorganic ~ 60 seconds":
 *   "The metal centres act as Lewis acids and the organic ligands as Lewis
 *    bases. The strongest interactions are between HA-HB and vice versa.
 *    Chemists use these principles to select suitable metals and linkers to
 *    design stable MOFs that do not collapse on exposure to moisture and heat,
 *    which was a significant problem with early MOFs."
 * plus one line lifted from the Organic paragraph: "Carboxylates are hard
 * linkers used to bind high valence cations whereas a soft linker like
 * pyrazolate is used to bind transition metals in the +2 oxidation state."
 *
 * The closing line is the script's own aside — "(water leaves creates a reactive
 * site for absorption of CO2)" — which is why this card sits AFTER the open-site
 * shot rather than before it: the empty coordination site from 4d is exactly
 * the Lewis acid that CO2 binds to.
 *
 * Kept honest: Cu2+ is a borderline acid, not a hard one, so the soft row says
 * "M2+" the way the script does instead of labelling copper "soft".
 * ------------------------------------------------------------------------ */

const C = {
  bg: "#0a0d14",
  accent: PAL.lilac,
  cyan: PAL.peach,
  text: PAL.cream,
  body: "#cfc9be",
  muted: PAL.mute,
  green: "#3fbf7f",
  cream: PAL.cream,
} as const;

const ramp = (frame: number, start: number, dur = 14): number =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

/* the 2×2 Pearson square: index [acid][base] */
const CELLS = [
  { acid: "hard acid", base: "hard base", strong: true },
  { acid: "hard acid", base: "soft base", strong: false },
  { acid: "soft acid", base: "hard base", strong: false },
  { acid: "soft acid", base: "soft base", strong: true },
];

const CELL_W = 250;
const CELL_H = 104;
const GX = 900;
const GY = 350;

export const Hsab: FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();

  const fadeIn = ramp(frame, 0, 14);
  const fadeOut = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Beats follow the narration in vo-timeline.json (local frames, HSAB window is
  // 771 frames = 933-1704):
  //   #17 0-135 title and M/L laid out · #18 303-441 acid/base labelled
  //   #19 473-586 pairing grid · #20 626-771 worked examples
  const acidIn = ramp(frame, 60, 26);
  const baseIn = ramp(frame, 120, 26);
  const arrowIn = ramp(frame, 180, 26);
  const closeIn = ramp(frame, 690, 24);

  return (
    <AbsoluteFill style={{ background: BACKDROP_CSS, opacity: fadeIn * fadeOut }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ fontFamily: FONT }}>
        <g opacity={ramp(frame, 4, 26)}>
          <SectionTitle>hard and soft</SectionTitle>
          <text x={120} y={172} fontSize={24} fill={C.muted}>
            {"why some MOFs survive water and heat, and some do not"}
          </text>
        </g>

        {/* left: the acid / base pair the whole thing rests on */}
        <g opacity={acidIn}>
          <circle cx={230} cy={330} r={62} fill="#16304f" stroke={C.accent} strokeWidth={2.5} />
          <text x={230} y={340} textAnchor="middle" fontSize={30} fill={C.accent} fontWeight={700}>
            M
          </text>
          <text x={318} y={324} fontSize={26} fill={C.text} fontWeight={600}>
            metal node
          </text>
          <text x={318} y={352} fontSize={21} fill={C.muted}>
            Lewis acid
          </text>
        </g>

        <g opacity={baseIn}>
          <circle cx={230} cy={600} r={62} fill="#2b2a1f" stroke={C.cream} strokeWidth={2.5} />
          <text x={230} y={610} textAnchor="middle" fontSize={30} fill={C.cream} fontWeight={700}>
            L
          </text>
          <text x={318} y={594} fontSize={26} fill={C.text} fontWeight={600}>
            organic linker
          </text>
          <text x={318} y={622} fontSize={21} fill={C.muted}>
            Lewis base
          </text>
        </g>

        {/* the bond: a lone pair going one way */}
        <g opacity={arrowIn}>
          <line x1={230} y1={396} x2={230} y2={534} stroke={C.cyan} strokeWidth={2.5} strokeDasharray="7 7" />
          <path d="M 221 520 L 230 535 L 239 520" fill="none" stroke={C.cyan} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          <text x={246} y={470} fontSize={21} fill={C.cyan}>
            {"lone pair"}
          </text>
        </g>

        {/* right: the Pearson square */}
        <g opacity={ramp(frame, 460, 22)}>
          <text x={GX} y={300} fontSize={22} fill={C.muted}>
            hard base
          </text>
          <text x={GX + CELL_W} y={300} fontSize={22} fill={C.muted}>
            soft base
          </text>
          <text x={GX - 22} y={GY + 52} textAnchor="end" fontSize={22} fill={C.muted}>
            {"hard"}
          </text>
          <text x={GX - 22} y={GY + 78} textAnchor="end" fontSize={22} fill={C.muted}>
            {"acid"}
          </text>
          <text x={GX - 22} y={GY + CELL_H + 44} textAnchor="end" fontSize={22} fill={C.muted}>
            {"soft"}
          </text>
          <text x={GX - 22} y={GY + CELL_H + 70} textAnchor="end" fontSize={22} fill={C.muted}>
            {"acid"}
          </text>
        </g>

        {CELLS.map((cell, i) => {
          const row = i < 2 ? 0 : 1;
          const col = i % 2;
          const p = ramp(frame, 484 + i * 14, 14);
          const x = GX + col * CELL_W;
          const y = GY + row * CELL_H;
          return (
            <g key={`${cell.acid}-${cell.base}`} opacity={p}>
              <rect
                x={x}
                y={y}
                width={CELL_W - 14}
                height={CELL_H - 14}
                rx={8}
                fill={cell.strong ? "rgba(63,191,127,0.14)" : "rgba(143,163,200,0.06)"}
                stroke={cell.strong ? C.green : "#2b3a5c"}
                strokeWidth={cell.strong ? 2.5 : 1.8}
              />
              <text
                x={x + (CELL_W - 14) / 2}
                y={y + 48}
                textAnchor="middle"
                fontSize={24}
                fill={cell.strong ? C.green : C.muted}
                fontWeight={600}
              >
                {cell.strong ? "strong pair" : "weak pair"}
              </text>
              <text
                x={x + (CELL_W - 14) / 2}
                y={y + 78}
                textAnchor="middle"
                fontSize={19}
                fill={C.muted}
              >
                {cell.strong ? "stable framework" : "falls apart"}
              </text>
            </g>
          );
        })}

        {/* the two pairs that actually get used */}
        <g opacity={ramp(frame, 630, 22)}>
          <text x={110} y={822} fontSize={24} fill={C.cream}>
            {"carboxylate  (hard base)"}
          </text>
          <text x={560} y={822} fontSize={24} fill={C.accent}>
            {"+ Zr\u2074\u207A / Al\u00B3\u207A  (hard acid)"}
          </text>
          <text x={110} y={862} fontSize={21} fill={C.muted}>
            {"high-valence cations \u2192 hydrolytically stable"}
          </text>

          <text x={110} y={932} fontSize={24} fill={C.cream}>
            {"pyrazolate  (soft base)"}
          </text>
          <text x={560} y={932} fontSize={24} fill={C.accent}>
            {"+ M\u00B2\u207A  (soft acid)"}
          </text>
          <text x={110} y={972} fontSize={21} fill={C.muted}>
            {"binds transition metals in the +2 oxidation state"}
          </text>
        </g>

        {/* the bridge back to the open site */}
        <g opacity={closeIn}>
          <text x={120} y={1030} fontSize={22} fill={C.cyan}>
            {"\u2014 and when the water leaves, that empty Cu site is a Lewis acid \u2014 which is where CO\u2082 binds"}
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
