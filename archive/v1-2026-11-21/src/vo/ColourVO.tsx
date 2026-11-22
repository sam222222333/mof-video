import type { FC } from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { COLOUR_FULL_FRAMES, ColourFull } from "../colour/ColourFull";

/* ------------------------------------------------------------------------ *
 * COLOUR — the picture plus its narration, for review in Studio.
 *
 * The audio is a pre-baked file (public/vo-quantum.wav, 43.05 s), not a
 * <Audio startFrom/endAt> over public/vo.m4a: the Studio preview ignores both
 * of those props — with startFrom it plays every Sequence's audio from zero
 * (sounds like an echo), and with endAt it keeps playing past the section and
 * bleeds the next section's first line in. A file that simply ends has neither
 * problem.
 *
 *   npx remotion ffmpeg -i public/vo-quantum-new.m4a -ar 44100 \
 *     -c:a pcm_s16le -f wav -y public/vo-quantum.wav
 *
 * 1291 frames = 43.03 s, matching COLOUR_FULL_FRAMES exactly.
 * ------------------------------------------------------------------------ */

export const COLOUR_VO_FRAMES = COLOUR_FULL_FRAMES;

const Tag: FC = () => (
  <div
    style={{
      position: "absolute",
      right: 40,
      bottom: 24,
      fontSize: 20,
      letterSpacing: 2,
      color: "#8fa3c8",
      opacity: 0.5,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}
  >
    colour
  </div>
);

export const ColourVO: FC = () => (
  <AbsoluteFill>
    <ColourFull />
    <Audio src={staticFile("vo-quantum.wav")} />
    <Tag />
  </AbsoluteFill>
);
