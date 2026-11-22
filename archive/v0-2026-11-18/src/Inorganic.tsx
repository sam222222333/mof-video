import type { FC } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { TeamClip } from "./team/TeamClip";
import { INORGANIC_NODES, INORGANIC_NODES_FRAMES } from "./team/Sections";
import { PaddleCloseUp } from "./inorganic/PaddleCloseUp";
import { Hsab } from "./inorganic/Hsab";
import { OpenSite } from "./inorganic/OpenSite";

/* ------------------------------------------------------------------------ *
 * INORGANIC — the HKUST-1 case and the open site   (1170 frames = 39 s)
 *
 * The group script's Inorganic paragraph, in its own order:
 *
 *   "First let's look at the metallic nodes... the oxidation number determines
 *    the number of linkers and the coordination geometry. In the HKUST-1
 *    structure the most common metal used is Cu2+... it forms a 4-armed, square
 *    planar unit that looks like a paddlewheel. Pearsons HSAB can be used to
 *    predict the stability... design stable MOFs that do not collapse on
 *    exposure to moisture and heat... (water leaves creates a reactive site for
 *    absorption of CO2)"
 *
 *   a   0 –  270   the node sets the geometry         (team canvas, 9 s)
 *                  — the team already animated coordination 6 / 4 / 12 on their
 *                  own beats, so this is their footage, not a new build
 *   b 270 –  510   paddlewheel + three distances + corner numbers    8 s
 *   c 510 –  870   Pearson HSAB: hard-hard vs soft-soft             12 s
 *   d 870 – 1170   the water leaves, leaving the site CO2 wants     10 s
 *
 * Formerly "Shot 04". Renamed 2026-11-18 to match the script's section names.
 * What used to be in here and why it went: old 4b LinkerCard (the linker half
 * duplicates Organic; its four framework numbers moved into the corner of 4a)
 * and old 4c FrameworkTiling (cut — the tiled wireframe read as mush).
 * ------------------------------------------------------------------------ */

export const PADDLE_FRAMES = 240;
export const HSAB_FRAMES = 360;
export const OPEN_FRAMES = 300;
export const INORGANIC_FRAMES =
  INORGANIC_NODES_FRAMES + PADDLE_FRAMES + HSAB_FRAMES + OPEN_FRAMES; // 1170 = 39 s

const B = INORGANIC_NODES_FRAMES;
const C = B + PADDLE_FRAMES;
const D = C + HSAB_FRAMES;

export const Inorganic: FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b1020" }}>
      <Sequence from={0} durationInFrames={INORGANIC_NODES_FRAMES} name="nodes">
        <TeamClip from={INORGANIC_NODES.from} />
      </Sequence>
      <Sequence from={B} durationInFrames={PADDLE_FRAMES} name="paddlewheel">
        <PaddleCloseUp durationInFrames={PADDLE_FRAMES} />
      </Sequence>
      <Sequence from={C} durationInFrames={HSAB_FRAMES} name="hard and soft">
        <Hsab durationInFrames={HSAB_FRAMES} />
      </Sequence>
      <Sequence from={D} durationInFrames={OPEN_FRAMES} name="open site">
        <OpenSite durationInFrames={OPEN_FRAMES} />
      </Sequence>
    </AbsoluteFill>
  );
};
