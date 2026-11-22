import type { FC } from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { InorganicExp, INORGANIC_EXP_FRAMES } from "../InorganicExp";
import { FrameTag } from "./FrameTag";

/* ------------------------------------------------------------------------ *
 * InorganicExpVO - experimental cut: Zaid's pre-rendered node sequence, no
 * modularity, same narration.
 *
 * Only 0-933 differs from the main cut (nodes + modularity 570 -> node geometry
 * 600, v3a 363 -> 333); the 933 boundary is unchanged, so the back half and the
 * narration timing stay identical. Audio: public/vo-inorganic-exp.wav.
 * ------------------------------------------------------------------------ */

export const INORGANIC_EXP_VO_FRAMES = INORGANIC_EXP_FRAMES;

export const InorganicExpVO: FC = () => (
  <AbsoluteFill>
    <InorganicExp />
    <Audio src={staticFile("vo-inorganic-exp.wav")} />
    <FrameTag />
  </AbsoluteFill>
);
