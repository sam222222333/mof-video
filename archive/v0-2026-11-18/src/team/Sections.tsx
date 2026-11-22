import type { FC } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { TeamClip } from "./TeamClip";

/* ------------------------------------------------------------------------ *
 * The team's 50 s canvas, sliced along the group script's section boundaries.
 *
 * Their animation was authored as one continuous 50 s piece, but it happens to
 * change subject at four clean points. Those points are also where the script
 * changes section, so the same footage now supplies Hook, Basic information and
 * the node half of Inorganic — each as its own composition, in the script's
 * order. Nothing is re-rendered; each slice is just `draw(t + offset)`.
 *
 *   36.6 – 48.6   Hook            "1 g of a MOF = 40 tennis courts"
 *    0.0 – 17.4   Basic info      what a MOF is, metal + linker, the lattice
 *   26.4 – 36.4   Basic info      modularity: swap the metal / stretch the linker
 *   17.4 – 26.4   Inorganic       the node decides the geometry (prepended to
 *                                 the Inorganic composition)
 *
 * The 48.6 – 50 s tail is a static hold and is dropped.
 * ------------------------------------------------------------------------ */

export const TEAM_FPS = 30;
const frames = (seconds: number) => Math.round(seconds * TEAM_FPS);

export const HOOK = { from: 36.6, seconds: 12.0 } as const;
export const BASIC_INFO = {
  first: { from: 0.0, seconds: 17.4 },
  second: { from: 26.4, seconds: 10.0 },
} as const;
export const INORGANIC_NODES = { from: 17.4, seconds: 9.0 } as const;

export const HOOK_FRAMES = frames(HOOK.seconds); // 360
export const BASIC_INFO_FRAMES =
  frames(BASIC_INFO.first.seconds) + frames(BASIC_INFO.second.seconds); // 822
export const INORGANIC_NODES_FRAMES = frames(INORGANIC_NODES.seconds); // 270

/** the hook: the surface-area bragging right, at the top of the film */
export const Hook: FC = () => <TeamClip from={HOOK.from} />;

/** what a MOF is, then modularity — the two general beats, back to back */
export const BasicInfo: FC = () => {
  const a = frames(BASIC_INFO.first.seconds);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={a}>
        <TeamClip from={BASIC_INFO.first.from} />
      </Sequence>
      <Sequence from={a} durationInFrames={frames(BASIC_INFO.second.seconds)}>
        <TeamClip from={BASIC_INFO.second.from} />
      </Sequence>
    </AbsoluteFill>
  );
};
