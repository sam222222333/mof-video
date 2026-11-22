import type { FC } from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { Applications } from "../applications/Applications";

/* ------------------------------------------------------------------------ *
 * CURRENT USES — picture plus narration (37.97 s = 1139 frames).
 *
 * public/vo-current.wav was cut from public/vo.m4a:
 *   npx remotion ffmpeg -i public/vo.m4a -filter_complex \
 *     "[0:a]atrim=start=217.1667:end=255.1333,asetpts=PTS-STARTPTS[a]" \
 *     -map "[a]" -c:a pcm_s16le -ar 44100 -f wav -y public/vo-current.wav
 *
 * The picture runs 1150 frames — the narration ends at 1139, so the last
 * 11 frames are the closing beat without voice. A pre-baked file rather than
 * <Audio startFrom/endAt> because the Studio preview ignores both props.
 * ------------------------------------------------------------------------ */

export const CURRENT_VO_FRAMES = 1150;

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
    current uses
  </div>
);

export const CurrentVO: FC = () => (
  <AbsoluteFill>
    <Applications />
    <Audio src={staticFile("vo-current.wav")} />
    <Tag />
  </AbsoluteFill>
);
