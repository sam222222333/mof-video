import type { FC } from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { BACKDROP_CSS, FONT, PAL } from "../style";
import { COLOUR_OPEN_FRAMES, ColourOpening, ColourTitle } from "../inorganic/ColourSection";
import { COLOUR_FRAMES, ColourScene } from "./ColourScene";

/* ------------------------------------------------------------------------ *
 * COLOUR AS A DIAGNOSTIC — the whole section, 2-D opening + 3-D scene.
 *
 *   0    - 435   ColourOpening (2-D, beats 1-2): ends on the pale and the
 *                green crystal side by side          narration 0:00.2-14.5
 *   435  - 1380  ColourScene (3-D, beats 3-7), local 0 = narration 14.5
 *
 * The join: the 3-D scene's own opening (two crystals + push into the green
 * one) repeats what the 2-D opening just showed, so it is cut. Instead the
 * camera pushes into the 2-D green crystal and cross-fades into the 3-D
 * paddlewheel emerging from it. The 3-D scene keeps its clock (local 0 at
 * 435), so everything after the join stays on the narration.
 *
 * One permanent title over the whole section: <ColourTitle />.
 * ------------------------------------------------------------------------ */

export const COLOUR_FULL_FRAMES = COLOUR_OPEN_FRAMES + COLOUR_FRAMES; // 1291 = 43.03 s (new VO, full length)

const JOIN = COLOUR_OPEN_FRAMES; // 435
const GREEN_AT = { x: 1320, y: 590 }; // the 2-D green crystal (ColourOpening)
const PUSH: [number, number] = [JOIN, JOIN + 52]; // 2-D push into the green crystal
const FADE_2D: [number, number] = [JOIN + 30, JOIN + 54];
const IN_3D: [number, number] = [JOIN + 38, JOIN + 58]; // 3-D paddlewheel emerging

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const ColourFull: FC<{ citations?: boolean }> = ({ citations = false }) => {
  const f = useCurrentFrame();
  const push = interpolate(f, PUSH, [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const zoom = 1 + 6 * push;
  const op2d = 1 - interpolate(f, FADE_2D, [0, 1], clamp);
  const op3d = interpolate(f, IN_3D, [0, 1], clamp);
  // keep the green crystal where it is while zooming in on it, drifting it to centre
  const cx = GREEN_AT.x + (960 - GREEN_AT.x) * push;
  const cy = GREEN_AT.y + (540 - GREEN_AT.y) * push;

  return (
    <AbsoluteFill style={{ background: BACKDROP_CSS, fontFamily: FONT }}>
      {op2d > 0.001 && (
        <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: op2d }}>
          <g transform={`translate(${cx} ${cy}) scale(${zoom}) translate(${-GREEN_AT.x} ${-GREEN_AT.y})`}>
            <ColourOpening frame={f} />
          </g>
        </svg>
      )}

      <Sequence from={JOIN} durationInFrames={COLOUR_FRAMES} name="3-D colour scene">
        {/* its first ~40 f (crystals + push) are covered by the 2-D push above */}
        <AbsoluteFill style={{ opacity: op3d }}>
          <ColourScene showTitle={false} />
        </AbsoluteFill>
      </Sequence>

      {/* one permanent title for the whole section */}
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <ColourTitle />
        {/* The section carries two observations from two different papers:
            green = defect-localised d-d (Müller 2017), turquoise/dark blue =
            hydration state (Chui 1999). Switch at the point the 3-D scene takes
            over, which is where the dehydration argument starts. */}
        {citations && (
          <text x={1848} y={1020} textAnchor="end" fontFamily={FONT} fontSize={19} fill={PAL.mute} opacity={0.6}>
            {f >= 672
              ? "S. S.-Y. Chui et al., Science, 1999, 283, 1148."
              : "K. Müller et al., ACS Appl. Mater. Interfaces, 2017, 9, 37463."}
          </text>
        )}
      </svg>
    </AbsoluteFill>
  );
};
