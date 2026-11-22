import type { FC } from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { Hook, HOOK_FRAMES } from "../hook/Hook";
import { FrameTag } from "./FrameTag";

/* ------------------------------------------------------------------------ *
 * HookVO — hook section with the opening lines of the narration.
 *
 * Picture: Hook, already retimed against the narration (357 frames).
 * Audio: vo-hook.wav, baked from the first 11.23 s of vo.m4a.
 *
 * The track starts at frame 0 of the composition, so the hook's picture and the
 * three opening lines share an origin. The file is padded to exactly 357 frames.
 * ------------------------------------------------------------------------ */

export const HOOK_VO_FRAMES = HOOK_FRAMES;

export const HookVO: FC = () => (
  <AbsoluteFill>
    <Hook />
    <Audio src={staticFile("vo-hook.wav")} />
    <FrameTag />
  </AbsoluteFill>
);
