import type { FC } from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { Hook, HOOK_FRAMES } from "../hook/Hook";
import { FrameTag } from "./FrameTag";

/* ------------------------------------------------------------------------ *
 * HookVO - isolated test bench; does not touch Hook.tsx / Assembly.tsx.
 *
 * Picture: Hook, already retimed to the narration (357 frames).
 * Audio:   public/vo-hook.wav, whole take, starting at frame 0.
 * Audio past 357 frames is cut by the composition length.
 * ------------------------------------------------------------------------ */

export const HOOK_VO_FRAMES = HOOK_FRAMES;

export const HookVO: FC = () => (
  <AbsoluteFill>
    <Hook />
    <Audio src={staticFile("vo-hook.wav")} />
    <FrameTag />
  </AbsoluteFill>
);
