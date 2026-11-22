import type { FC } from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { GeneralInfo, GENERAL_FRAMES } from "../hook/GeneralInfo";
import { FrameTag } from "./FrameTag";

/* ------------------------------------------------------------------------ *
 * GeneralInfoVO — the general-information section with its own narration.
 *
 * Sentence 3 ("So what is a metal-organic framework or MOF?") begins at
 * f357 = 11.90 s of the recording, so the bake starts there.
 *
 * Sentence onsets (local frames from vo-timeline.json):
 *   #3 l0-109    #4 l119-244   #5 l244-357   #6 l377-501
 *   #7 l501-614  #8 l649-802   #9 l828-1018
 * ------------------------------------------------------------------------ */

export const GENERAL_INFO_VO_FRAMES = GENERAL_FRAMES;

export const GeneralInfoVO: FC = () => (
  <AbsoluteFill>
    <GeneralInfo />
    <Audio src={staticFile("vo-general.wav")} />
    <FrameTag />
  </AbsoluteFill>
);
