import type { FC } from "react";
import { TeamClip } from "./TeamClip";
import { TEAM_SHOT02_SECONDS } from "./mofScene";

/* ------------------------------------------------------------------------ *
 * The team's 50 s canvas, whole, as they authored it.
 *
 * Kept for reference and comparison only — the cut no longer uses it as one
 * piece. The film now takes three slices of it along the group script's section
 * boundaries: `Hook` and `BasicInfo` in ./Sections.tsx, and the node-geometry
 * slice that opens the `Inorganic` composition.
 * ------------------------------------------------------------------------ */

export const TEAM_SHOT02_FRAMES = TEAM_SHOT02_SECONDS * 30; // 1500 = 50 s

export const Shot02Team: FC = () => <TeamClip from={0} />;
