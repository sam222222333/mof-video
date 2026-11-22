import type { FC } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { TeamClip } from "./team/TeamClip";
import { INORGANIC_NODES, INORGANIC_NODES_FRAMES, BASIC_INFO } from "./team/Sections";
import { HsabFull } from "./inorganic/HsabFull";
import { PaddleV3 } from "./inorganic/PaddleV3";

/* ------------------------------------------------------------------------ *
 * INORGANIC - the HKUST-1 case (1994 frames = 66.5 s)
 *
 * vo cues (local frames)      shot
 * #10-12    0- 264            a    0-270   nodes (team canvas, 9 s)
 * #13-15  288- 672            b  270-570   modularity (team canvas, 10 s)
 * #16     705-805             c  570-933   paddlewheel forms, 1.83x
 * #17-19  933-1519            d  933-1616  Pearson HSAB grid
 * #20-21 1559-1884            e 1654-1994  open sites, water attack, collapse
 * ------------------------------------------------------------------------ */

export const MODULARITY_FRAMES = 300; // 10 s
export const HSAB_FRAMES = 721; // #17-#20 span 933-1704, 50-frame gap removed

const NODES_END = INORGANIC_NODES_FRAMES; // 270
const MOD_END = NODES_END + MODULARITY_FRAMES; // 570
const V3A_FRAMES = 363; // 570 -> 933
const HSAB_AT = MOD_END + V3A_FRAMES; // 933

// Boundaries follow vo-timeline.json local frames:
//   #17 933-1068  #18 1236-1374  #19 1406-1519  #20 1559-1704  #21 1704-1884
// HSAB covers #17-#20; v3b covers only the #21 collapse.
const HSAB_WINDOW = 683; // 933 -> 1616, 50- and 38-frame gaps removed
const V3B_AT = HSAB_AT + HSAB_WINDOW; // 1654
const V3B_FRAMES = 340; // 1654 -> 1994, #21 ends at 1796; 198 frames of picture follow

// squeeze v3's first 665 frames (wheel forms .. open sites) into 363
const V3A_SCALE = 665 / V3A_FRAMES; // ≈1.83
// v3b plays 1:1. offset 800 skips the CO2 uptake block (co2In 730-810, part of
// the CO2-capture beat) and starts just before co2Out (860-900):
//   800-870   CO2 clears
//   870-960   waters in
//   950-1010  Cu-O bonds break (snap)
//   990-1110  wheel falls apart, fade out
// #21 ends at 1796; the last 198 frames (6.6 s) are picture only.
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
