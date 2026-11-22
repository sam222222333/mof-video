import type { FC } from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { Inorganic, INORGANIC_FRAMES } from "../Inorganic";
import { FrameTag } from "./FrameTag";

/* ------------------------------------------------------------------------ *
 * InorganicVO — the inorganic section paired with its own narration track.
 *
 * All audio lives here. Inorganic contains no <Audio> of its own, so the
 * section is silent when it is mounted inside Assembly.
 *
 * Timing comes from vo-timeline.json (whisper-1, 30 fps). The inorganic section
 * occupies absolute frames 1430-3314 of vo.m4a (47.68-110.48 s) and
 * local = absolute - 1430. Audio is 1872 frames, picture 1906: the last 34 frames
 * are the natural fade of the collapsing framework, not a pad of silent black.
 *
 * Sentence onsets (local frames):
 *   #10 l0-60    #11 l80-150   #12 l150-264  #13 l288-417
 *   #14 l443-572 #15 l577-672  #16 l705-805  #17 l933-1068
 *   #18 l1236-1374 #19 l1406-1519 #20 l1559-1704 #21 l1704-1884
 *
 * Section boundaries in Inorganic.tsx against the same table:
 *   nodes      0-270   #10 #11 #12
 *   modularity 270-570 #13 #14  (#13 discusses node geometry but lands on the
 *                                swap-the-metal beat; still open)
 *   v3a        570-933 #15 #16
 *   hsab       933-1616 #17 #18 #19 #20  -- 683 frames (was 771; 50+38 frames of
 *                                           sentence gap were cut out)
 *   v3b        1616-1906 #21 + collapse tail -- 290 frames at 0.97x; the frames
 *                                             cut from hsab were not given away
 *
 * The second bake ends at endAt=3390 because that is measured: f3390 is the last
 * audible frame (-80 dBFS), everything is zero from f3392, and the "Now" onset
 * does not rise until f3424. Cutting at 3390 carries not one extra byte.
 * ------------------------------------------------------------------------ */

export const INORGANIC_VO_FRAMES = INORGANIC_FRAMES;

export const InorganicVO: FC = () => (
  <AbsoluteFill>
    <Inorganic />
    {/* Audio is pre-baked to public/vo-inorganic.wav. ffmpeg spliced 47.667-83.0 s
        and 84.667-113.0 s of vo.m4a into a single 63.67 s track, which removes the
        50 frames (1.67 s) of sentence gap that used to sit between them.
        Two <Sequence><Audio> pairs are not used because the Studio preview starts
        both from zero, which sounds like two tracks fighting. Rendered output is
        clean; only the preview misbehaves. One file behaves the same in both. */}
    <Audio src={staticFile("vo-inorganic.wav")} />
    <FrameTag />
  </AbsoluteFill>
);
