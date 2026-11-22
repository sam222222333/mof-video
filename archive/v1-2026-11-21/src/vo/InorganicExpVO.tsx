import type { FC } from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { InorganicExp, INORGANIC_EXP_FRAMES } from "../InorganicExp";
import { FrameTag } from "./FrameTag";

/* ------------------------------------------------------------------------ *
 * InorganicExpVO — experimental cut: Zaid's pre-rendered node sequence replaces
 * the nodes + modularity beats, with the same narration.
 *
 * This version keeps the 933 boundary, so it reuses vo-inorganic-exp.wav: only the
 * 0-933 split changed (nodes + modularity 570 -> node geometry 600, v3a 363 -> 333)
 * and everything after 933 is identical. The two cuts can therefore be compared
 * directly without a second bake.
 * ------------------------------------------------------------------------ */

export const INORGANIC_EXP_VO_FRAMES = INORGANIC_EXP_FRAMES;

export const InorganicExpVO: FC = () => (
  <AbsoluteFill>
    <InorganicExp />
    <Audio src={staticFile("vo-inorganic-exp.wav")} />
    <FrameTag />
  </AbsoluteFill>
);
