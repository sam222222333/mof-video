import type { FC } from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { GeneralInfo, GENERAL_FRAMES } from "../hook/GeneralInfo";
import { FrameTag } from "./FrameTag";

/* ------------------------------------------------------------------------ *
 * GeneralInfoVO - isolated test bench: the General information section plus its
 * narration.
 *
 * Narration sentence 3 ("So what is a metallic organic framework or MOF?")
 * starts at f357 = 11.90 s of the whole take.
 *
 * Sentence starts, local frames (vo-timeline.json):
 *   #3 0-109    #4 119-244   #5 244-357   #6 377-501
 *   #7 501-614  #8 649-802   #9 828-1018
 * ------------------------------------------------------------------------ */

export const GENERAL_INFO_VO_FRAMES = GENERAL_FRAMES;

export const GeneralInfoVO: FC = () => (
  <AbsoluteFill>
    <GeneralInfo />
    <Audio src={staticFile("vo-general.wav")} />
    <FrameTag />
  </AbsoluteFill>
);
