import type { FC } from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { BACKDROP_CSS, FONT, PAL, SectionTitle } from "../style";
import { QuantumFig1 } from "../quantum/Figure1Splitting";
import { QuantumFig2 } from "../quantum/Figure2Spectrum";
import { QuantumFig3 } from "../quantum/Figure3Symmetry";
import { ColourlessLattice3D } from "./ColourlessLattice3D";

/* ------------------------------------------------------------------------ *
 * SHOT 05 — WHY THE COLOUR COMES FROM DEFECTS  (02:55 – 03:40, 36 s)
 *
 * Two independent mechanisms, kept apart on purpose (see research notes):
 *   A. defects   — a perfect crystal is nearly colourless; the green comes from
 *                  localised d-d excitations at defect sites (Müller 2017)
 *   B. dehydration — water leaves, the ligand field changes, the colour shifts
 *                  turquoise -> deep blue (Chui 1999)
 *
 * Block order follows QUANTUM-BRIEF.md §1, NOT the order the figures happen to
 * be numbered in:
 *
 *   A  colourless lattice + defect glow   0 – 450   (15 s)
 *   B  Figure 3, symmetry                 450 – 600  5 s
 *   C  Figure 1, d-orbital splitting      600 – 720  4 s
 *   D  Figure 2, absorption -> colour     720 – 810  3 s
 *   E  the swatch morphs                  810 – 1080  9 s
 *
 * TRANSITIONS. All five blocks draw an opaque #0b1020 background, so two of them
 * cannot simply be alpha-blended — the incoming one would wash the outgoing one
 * towards navy instead of overlaying it. Instead the blocks are stacked in
 * reverse DOM order (E at the bottom, A on top) and each block fades OUT over
 * the first XF frames of the next one, revealing a block that has already been
 * building underneath it for XF frames. That is a real cross-dissolve, and it
 * means the incoming block must be mounted XF frames before its boundary — see
 * MOUNT_START below. Do not "fix" the reverse order.
 * ------------------------------------------------------------------------ */

const C = {
  bg: "#0a0d14",
  accent: PAL.lilac,
  cyan: PAL.peach,
  text: PAL.cream,
  body: "#cfc9be",
  muted: PAL.mute,
  green: "#3fbf7f",
  turquoise: "#40c8b0",
  deepBlue: "#1e3a8a",
} as const;

const A_FRAMES = 450;
const F3_FRAMES = 150;
const F1_FRAMES = 120;
const F2_FRAMES = 90;
const SWATCH_FRAMES = 270;
export const SHOT05_FRAMES = A_FRAMES + F3_FRAMES + F1_FRAMES + F2_FRAMES + SWATCH_FRAMES; // 1080

/** block boundaries: B[i] .. B[i+1] is block i */
const B = [
  0,
  A_FRAMES,
  A_FRAMES + F3_FRAMES,
  A_FRAMES + F3_FRAMES + F1_FRAMES,
  A_FRAMES + F3_FRAMES + F1_FRAMES + F2_FRAMES,
  SHOT05_FRAMES,
];

/** cross-dissolve length, frames */
const XF = 10;

/** How early the incoming block is mounted. It has to be large enough that the
 *  block already has something on screen when the outgoing one starts fading —
 *  otherwise the "dissolve" is really a dip through empty navy. 24 frames puts
 *  Figure 1's headings, geometry and levels in before it is ever seen. */
const HEAD = 24;

/** a block is mounted HEAD frames early, and lingers XF frames after its end */
const MOUNT_START = [0, B[1] - HEAD, B[2] - HEAD, B[3] - HEAD, B[4] - HEAD];
const MOUNT_END = [B[1] + XF, B[2] + XF, B[3] + XF, B[4] + XF, SHOT05_FRAMES];

const ramp = (frame: number, start: number, dur = 18): number =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

/* ------------------------------ the swatch ------------------------------ */

const hex = (h: string): [number, number, number] => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];

const mix = (a: string, b: string, t: number): string => {
  const A = hex(a);
  const Bc = hex(b);
  const c = A.map((v, i) => Math.round(v + (Bc[i] - v) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
};

/** Board E, on its own timeline (Sequence gives it a local frame). */
const SwatchBlock: FC = () => {
  const frame = useCurrentFrame();
  const morph = Math.min(1, frame / 90);

  return (
    <AbsoluteFill style={{ background: BACKDROP_CSS }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ fontFamily: FONT }}>
        <SectionTitle opacity={ramp(frame, 0, 22)}>and when the water leaves</SectionTitle>

        <g opacity={ramp(frame, 10, 24)}>
          <rect
            x={760}
            y={330}
            width={400}
            height={250}
            rx={10}
            fill={mix(C.turquoise, C.deepBlue, morph)}
            stroke="#ffffff"
            strokeOpacity={0.14}
            strokeWidth={2}
          />
        </g>

        <g opacity={ramp(frame, 24, 22)}>
          <text x={960} y={650} textAnchor="middle" fontSize={40} fill={C.text} fontWeight={600}>
            {morph < 0.5 ? "hydrated \u2014 turquoise" : "dehydrated \u2014 deep blue"}
          </text>
        </g>

        <g opacity={ramp(frame, 120, 24)}>
          <text x={960} y={760} textAnchor="middle" fontSize={32} fill={C.muted}>
            a direct read-out of what is bound inside
          </text>
        </g>

        <g opacity={ramp(frame, 20, 20)}>
          <text x={110} y={990} fontSize={22} fill={C.muted}>
            {"colour mechanism: M\u00FCller 2017 (UV\u2013vis + CASSCF) \u00B7 turquoise \u2192 deep blue: Chui 1999"}
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* --------------------------------- figure -------------------------------- */

export const HKUST1Colour: FC = () => {
  const frame = useCurrentFrame();

  const fadeOut = interpolate(frame, [SHOT05_FRAMES - 20, SHOT05_FRAMES], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // A fades in from the previous shot, then hands over to B
  const opA = ramp(frame, 0, 20) * (1 - ramp(frame, B[1], XF));
  const opB = 1 - ramp(frame, B[2], XF);
  const opC = 1 - ramp(frame, B[3], XF);
  const opD = 1 - ramp(frame, B[4], XF);

  return (
    <AbsoluteFill style={{ background: BACKDROP_CSS, opacity: fadeOut }}>
      {/* ---- stacked bottom-up: E, D, C, B, A (see the header note) ---- */}

      <Sequence from={MOUNT_START[4]} durationInFrames={MOUNT_END[4] - MOUNT_START[4]}>
        <SwatchBlock />
      </Sequence>

      <Sequence from={MOUNT_START[3]} durationInFrames={MOUNT_END[3] - MOUNT_START[3]}>
        <AbsoluteFill style={{ opacity: opD }}>
          <QuantumFig2 />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={MOUNT_START[2]} durationInFrames={MOUNT_END[2] - MOUNT_START[2]}>
        <AbsoluteFill style={{ opacity: opC }}>
          <QuantumFig1 />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={MOUNT_START[1]} durationInFrames={MOUNT_END[1] - MOUNT_START[1]}>
        <AbsoluteFill style={{ opacity: opB }}>
          <QuantumFig3 />
        </AbsoluteFill>
      </Sequence>

      {/* Board A is the top card, so it needs its own opaque background —
          without it the block mounted underneath would show through the gaps
          in A's sparse layout long before the dissolve is supposed to start. */}
      <AbsoluteFill style={{ backgroundColor: C.bg, opacity: opA }}>
        <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ fontFamily: FONT }}>
          <ColourlessLattice3D frame={frame} />

          <SectionTitle opacity={ramp(frame, 40, 20)}>a perfect crystal is almost colourless</SectionTitle>

          <g opacity={ramp(frame, 150, 20)}>
            <text x={110} y={600} fontSize={32} fill={C.muted}>
              only a few points stay faintly lit
            </text>
          </g>

          <g opacity={ramp(frame, 270, 22)}>
            <text x={110} y={690} fontSize={40} fill={C.green} fontWeight={600}>
              the colour comes from defects
            </text>
            <text x={110} y={740} fontSize={30} fill={C.muted}>
              localised d{"\u2013"}d excitations at defect sites
            </text>
            <text x={110} y={790} fontSize={30} fill={C.text} opacity={ramp(frame, 330, 22)}>
              defects also turn some Cu{"\u00B2\u207A"} into Cu{"\u207A"}
            </text>
            <text x={110} y={834} fontSize={24} fill={C.muted} opacity={ramp(frame, 340, 22)}>
              mixed valence makes those d{"\u2013"}d transitions far stronger
            </text>
            <text x={110} y={884} fontSize={30} fill={C.muted} opacity={ramp(frame, 300, 22)}>
              not a property of the ideal framework
            </text>
          </g>
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
