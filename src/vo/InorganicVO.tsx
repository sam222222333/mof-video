import type { FC } from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { Inorganic, INORGANIC_FRAMES } from "../Inorganic";
import { FrameTag } from "./FrameTag";

/* InorganicVO: isolated test bed for the Inorganic section + its narration track;
 * `Inorganic` itself has no <Audio>, so Assembly is silent.
 * Basis: vo-timeline.json (whisper-1, 30 fps); section = absolute 1430-3314
 * (47.68-110.48 s), local = absolute - 1430; audio 1872, picture 1906; last audible f3390.
 * Cues (local): #10 0-60 / #11 80-150 / #12 150-264 / #13 288-417 / #14 443-572 /
 *   #15 577-672 / #16 705-805 / #17 933-1068 / #18 1236-1374 / #19 1406-1519 /
 *   #20 1559-1704 / #21 1704-1884.
 * Segments (Inorganic.tsx): nodes 0-270 #10-12 / modularity 270-570 #13-14 /
 *   v3a 570-933 #15-16 / hsab 933-1616 #17-20 (683 fr, 88 cut) /
 *   v3b 1616-1906 #21 + collapse tail (290 fr, 0.97x). */

export const INORGANIC_VO_FRAMES = INORGANIC_FRAMES;

export const InorganicVO: FC = () => (
  <AbsoluteFill>
    <Inorganic />
    {/* Pre-baked `public/vo-inorganic.wav`: ffmpeg joins vo.m4a 47.667-83.0 s and
        84.667-113.0 s, dropping the 50-frame gap. Two <Sequence><Audio> would both
        start at 0 in Studio preview (echo); one track plays the same in both. */}
    <Audio src={staticFile("vo-inorganic.wav")} />
    <FrameTag />
  </AbsoluteFill>
);
