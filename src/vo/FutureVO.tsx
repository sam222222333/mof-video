import type { FC } from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { FutureOfMofs, FUTURE_FRAMES } from "../future/FutureOfMofs";

/* ------------------------------------------------------------------------ *
 * FUTURE — picture plus narration (46.77 s = 1403 frames).
 *
 * public/vo-future.wav is the Future section of vo.m4a (absolute 7726-9129):
 *   npx remotion ffmpeg -i public/vo.m4a -filter_complex \
 *     "[0:a]atrim=start=257.5333:end=304.3,asetpts=PTS-STARTPTS[a]" \
 *     -map "[a]" -c:a pcm_s16le -ar 44100 -f wav -y public/vo-future.wav
 *
 * The picture runs 1420 frames — narration ends at 1403, so the last 17
 * frames are the closing beat without voice. Pre-baked file, not
 * <Audio startFrom/endAt>, because the Studio preview ignores both props.
 * ------------------------------------------------------------------------ */

export const FUTURE_VO_FRAMES = FUTURE_FRAMES;

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
    future
  </div>
);

export const FutureVO: FC = () => (
  <AbsoluteFill>
    <FutureOfMofs />
    <Audio src={staticFile("vo-future.wav")} />
    <Tag />
  </AbsoluteFill>
);
