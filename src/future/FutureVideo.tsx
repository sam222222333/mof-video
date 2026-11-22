import type { FC } from "react";
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { FONT, PAL } from "../style";

/**
 * The future section as a finished picture, supplied as a rendered file.
 *
 * It is 1548 frames at 30 fps, 1920x1080 — 51.6 s, ending on a black fade
 * after the closing card. Unlike the organic file this one carries its own
 * narration: it is played unmuted and takes over from the assembly's voice
 * track at this section's first frame (the track is cut there).
 *
 * The frame is a flat file, so the citation is overlaid here rather than
 * drawn inside the section.
 */
export const FUTURE_VIDEO_FRAMES = 1548;

/** Conductive-MOF claim; sits over the conductive segment (26–30 s). */
const CITE = "D. Sheberla et al., J. Am. Chem. Soc., 2014, 136, 8859.";
const CITE_FROM = 780;
const CITE_TO = 900;

export const FutureVideo: FC<{ citations?: boolean }> = ({ citations = false }) => {
  const frame = useCurrentFrame();
  const inWindow = frame >= CITE_FROM && frame < CITE_TO;
  // Same fade the other sections use for their citation layer.
  const o = Math.min(1, Math.max(0, (frame - CITE_FROM) / 24)) * 0.6;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b1020" }}>
      <OffthreadVideo src={staticFile("future-section-with-audio.mp4")} />
      {citations && inWindow && (
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
