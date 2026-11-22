import type { FC } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { TeamClip } from "./team/TeamClip";
import { INORGANIC_NODES, INORGANIC_NODES_FRAMES, BASIC_INFO } from "./team/Sections";
import { HsabFull } from "./inorganic/HsabFull";
import { PaddleV3 } from "./inorganic/PaddleV3";

/* ------------------------------------------------------------------------ *
 * INORGANIC — the HKUST-1 case   (1906 frames = 63.5 s)
 *
 * Boundaries follow the real voice-over (vo-timeline.json, local frames):
 *
 *   #10-12     0 -  264   "the metallic nodes … single ions or clusters"
 *     a        0 -  270   node sets the geometry      (team canvas, 9 s)
 *   #13-15   288 -  672   "oxidation number … copper 2+ … other metals"
 *     b      270 -  570   modularity                  (team canvas, 10 s)
 *   #16      705 -  805   "four-armed, square planar … paddle wheel"
 *     c      570 -  933   paddlewheel forms, heated, waters leave  (363 f @ 1.83x)
 *   #17-19   933 - 1519   "Pearson HSAB … Lewis acids … hard-hard"
 *     d      933 - 1409   Pearson HSAB grid           (476 f: 360 s of motion, then hold)
 *   #20-21  1559 - 1884   "select metals and linkers … do not collapse on moisture and heat"
 *     e     1409 - 1884   open sites, CO2, then water breaks the wheel and it falls apart
 *          1884 - 2000   black, breathing room before Organic
 *
 * Why v3 is split in two: the narrator names the paddle wheel at 705-805, then
 * spends 933-1519 entirely on HSAB theory, then comes back to stability at
 * 1559-1884 where the collapse belongs. Keeping v3 whole after HSAB would have
 * shown the paddle wheel 7.5 s late; splitting it puts the wheel where it is
 * named and the collapse where it is described.
 *
 * `PaddleV3` covers what used to be two separate builds (4a distances + 4d
 * water leaving): down the axis -> side view with three distances -> heating
 * drives off both axial waters one at a time -> two open metal sites -> CO2
 * binds at one -> but moisture and heat break the Cu-carboxylate bonds and the
 * wheel falls apart.
 *
 * `PaddleCloseUp.tsx` and `OpenSite.tsx` are still in the tree and still
 * registered as `InorganicPaddle` / `InorganicOpenSite` for side-by-side
 * comparison — they are just no longer in the cut.
 * ------------------------------------------------------------------------ */

export const MODULARITY_FRAMES = 300; // 10 s
export const HSAB_FRAMES = 721; // real span of #17-#20, after 50 frames of sentence gap were cut

const NODES_END = INORGANIC_NODES_FRAMES; // 270
const MOD_END = NODES_END + MODULARITY_FRAMES; // 570
const V3A_FRAMES = 363; // 570 -> 933
const HSAB_AT = MOD_END + V3A_FRAMES; // 933

// Every boundary below is aligned to the real narration local frames from vo-timeline.json:
//   #17 933-1068  #18 1236-1374  #19 1406-1519  #20 1559-1704  #21 1704-1884
// The HSAB card covers the whole of #17-#20; v3b only handles the collapse in #21.
const HSAB_WINDOW = 683; // 933 -> 1616, after cutting 50 + 38 frames of gap
const V3B_AT = HSAB_AT + HSAB_WINDOW; // 1654
const V3B_FRAMES = 340; // 1654 -> 1994; #21 ends at 1796 and the remaining 198 frames play out without voice

// squeeze v3's first 665 frames (wheel forms .. open sites) into 363
const V3A_SCALE = 665 / V3A_FRAMES; // ≈1.83
// v3b is the water attack and the collapse, played at 1:1 with no compression.
// The offset moved from 665 to 800 because the CO2 adsorption beat (co2In 730-810)
// belongs to Current uses (carbon capture) and should not occupy #21, whose whole
// sentence is about the framework falling apart in moisture and heat. 800 starts
// before co2Out (860-900); water arrives from 870 and 340 frames cover internal
// 800-1140:
//   800-870   CO2 clears out
//   870-960   water molecules crowd in        <- watersIn
//   950-1010  Cu-O bonds break                <- snap
//   990-1110  the wheel comes apart and fades <- apart / fadeOut
// #21 finishes at 1796; the last 198 frames (6.6 s) carry no voice and let the
// picture close the section on its own.
const V3B_INNER = 1140 - 800; // 340
const V3B_SCALE = V3B_INNER / V3B_FRAMES; // = 1.0

export const INORGANIC_FRAMES = V3B_AT + V3B_FRAMES; // 1994 = 66.5 s

export const Inorganic: FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0d14" }}>
      <Sequence from={0} durationInFrames={NODES_END} name="nodes">
        <TeamClip from={INORGANIC_NODES.from} />
      </Sequence>
      <Sequence from={NODES_END} durationInFrames={MODULARITY_FRAMES} name="modularity">
        <TeamClip from={BASIC_INFO.second.from} />
      </Sequence>
      <Sequence from={MOD_END} durationInFrames={V3A_FRAMES} name="paddlewheel">
        <PaddleV3 timeScale={V3A_SCALE} />
      </Sequence>
      <Sequence from={HSAB_AT} durationInFrames={HSAB_WINDOW} name="hard and soft">
        <HsabFull durationInFrames={HSAB_WINDOW} />
      </Sequence>
      <Sequence from={V3B_AT} durationInFrames={V3B_FRAMES} name="open sites and collapse">
        <PaddleV3 offset={800} timeScale={V3B_SCALE} />
      </Sequence>
    </AbsoluteFill>
  );
};
