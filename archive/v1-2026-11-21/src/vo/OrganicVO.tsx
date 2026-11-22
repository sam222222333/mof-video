import type { FC } from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { OrganicLinkers } from "../organic/OrganicLinkers";
import { FrameTag } from "./FrameTag";

/* ------------------------------------------------------------------------ *
 * OrganicVO — the organic section with its own narration, opening on
 * "Now, let's take a look at the organic linkers."
 *
 * The inorganic bake stops at endAt=3390, which clips that line (its first frames
 * would otherwise bleed into the tail of the previous section), so the sentence
 * has to be carried here instead. Otherwise the film loses a whole line.
 *
 * The start must sit earlier than the 3430 that whisper reports. Per-frame energy
 * puts the "Now" onset at f3420 (-114.6 -> f3422 -45.2 -> f3424 -26.2): whisper
 * marked the sentence start 10 frames late, and cutting at 3430 would remove the
 * attack of the N. f3390 is the last audible frame of the previous section,
 * f3392-3418 is fully silent (-180 dBFS), and f3420 is the onset.
 *
 * vo-timeline.json puts the organic section at absolute frames 3430-5162. The
 * audio here covers 3420-5162 = 1742 frames (58.07 s); the picture runs 1830
 * frames, leaving 88 frames of quiet tail.
 *
 * A baked vo-organic.wav is required; public/vo.m4a plus endAt does not work.
 * The Studio preview ignores <Audio endAt> (the same bug as ignoring startFrom on
 * Sequence-nested audio) and plays local 1786 as source frame 5206, which is the
 * "The colour of an MOF..." line from the quantum section. It sounds like the next
 * section's speech bleeding into this one. Rendered output is correct (measured at
 * -200 dBFS after local 1744) but the preview is alarming. A standalone file simply
 * runs out of data at 1742, so bleed is structurally impossible.
 *
 * Bake command (the stripped ffmpeg has no m4a muxer, so wav only):
 *   npx remotion ffmpeg -i public/vo.m4a -filter_complex \
 *     "[0:a]atrim=start=114.0:end=172.0667,asetpts=PTS-STARTPTS[a]" \
 *     -map "[a]" -c:a pcm_s16le -ar 44100 -f wav -y public/vo-organic.wav
 * ------------------------------------------------------------------------ */

export const ORGANIC_VO_FRAMES = 1830;

export const OrganicVO: FC = () => (
  <AbsoluteFill>
    <OrganicLinkers />
    <Audio src={staticFile("vo-organic.wav")} />
    <FrameTag />
  </AbsoluteFill>
);
