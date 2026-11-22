import type { FC } from "react";
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { FONT, PAL } from "../style";

/**
 * The organic section as a finished picture, supplied as a rendered file.
 *
 * It is 2094 frames at 30 fps, 1920x1080, and carries no audio of its own —
 * the narration comes from the assembly's single voice track, which places
 * eight seconds of silence over the 3-D paddlewheel clip.
 *
 * The frame is a flat file, so the citation cannot be drawn inside it the way
 * the other sections do it. It is overlaid here instead, in the same position
 * and at the same size as everywhere else in the film.
 */
export const ORGANIC_VIDEO_FRAMES = 2094;

/** HKUST-1 is Cu3(BTC)2, so BTC is literally its linker — one source covers
 *  the whole section, including the tritopic / 120 degree / MOF-199 claims. */
const CITE = "S. S.-Y. Chui et al., Science, 1999, 283, 1148.";

export const OrganicVideo: FC<{ citations?: boolean }> = ({ citations = false }) => {
  const frame = useCurrentFrame();
  // Matches the fade the other sections use for their citation layer.
  const o = Math.min(1, Math.max(0, (frame - 20) / 24)) * 0.6;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b1020" }}>
      <OffthreadVideo src={staticFile("organic-final.mp4")} muted />
      {citations && (
        <svg
          viewBox="0 0 1920 1080"
          width={1920}
          height={1080}
          style={{ position: "absolute", inset: 0 }}
        >
          <text
            x={1848}
            y={1020}
            textAnchor="end"
            fontFamily={FONT}
            fontSize={19}
            fill={PAL.mute}
            opacity={o}
          >
            {CITE}
          </text>
        </svg>
      )}
    </AbsoluteFill>
  );
};
