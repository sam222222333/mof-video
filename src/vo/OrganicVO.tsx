import type { FC } from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { OrganicLinkers } from "../organic/OrganicLinkers";
import { FrameTag } from "./FrameTag";

/* OrganicVO: Organic section + its own narration; opens with "Now, let's take a
 * look at the organic linkers." (cut from InorganicVO at endAt 3390).
 * Audio starts 3420, not whisper's 3430: "Now" onset is f3420 (-114.6 / -45.2 / -26.2).
 * vo-timeline.json: Organic = absolute 3430-5162; audio 3420-5162 = 1742 frames
 * (58.07 s), picture 1830 frames (88 frozen at tail).
 * Baked vo-organic.wav only: Studio ignores <Audio endAt>; vo.m4a + endAt leaks the
 * Quantum lines at local 1786. Rebuild with npx remotion ffmpeg -i public/vo.m4a
 *   -filter_complex "[0:a]atrim=start=114.0:end=172.0667,asetpts=PTS-STARTPTS[a]"
 *   -map "[a]" -c:a pcm_s16le -ar 44100 -f wav -y public/vo-organic.wav
 */

export const ORGANIC_VO_FRAMES = 1830;

export const OrganicVO: FC = () => (
  <AbsoluteFill>
    <OrganicLinkers />
    <Audio src={staticFile("vo-organic.wav")} />
    <FrameTag />
  </AbsoluteFill>
);
