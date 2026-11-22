import type { FC } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { NodeGeometry, NODE_GEOM_FRAMES } from "./inorganic/NodeGeometry";
import { PaddleV3 } from "./inorganic/PaddleV3";
import { HsabFull } from "./inorganic/HsabFull";

/* ------------------------------------------------------------------------ *
 * INORGANIC — EXPERIMENTAL CUT  (1906 frames = 63.5 s, same as the main cut)
 *
 * Only the front of the section differs from `Inorganic.tsx`:
 *
 *   main cut     nodes (team canvas, 270) + modularity (team canvas, 300) + v3a (363)
 *   this cut     node geometry (Zaid's pre-rendered 600-frame sequence)      + v3a (333)
 *
 * Both put the HSAB block at 933 and therefore keep the whole back half —
 * HSAB window, v3b, total length — byte-identical to the main cut. That is
 * deliberate: the baked narration `public/vo-inorganic.wav` is 1872 frames
 * and only lines up if the 933 boundary does not move. Changing
 * INORGANIC_FRAMES here would desync the audio, not just this section.
 *
 * Why drop modularity: "swap the metal / stretch the linker" is the same
 * argument the Organic section makes at length, and the narration lines it
 * covered (#15, "other divalent or trivalent metals can be used") are picked
 * up by the node sequence's L5 highlight instead (Zn²⁺ brightens, Zr⁴⁺ does
 * not, because 4+ is not divalent).
 *
 * What this fixes: #13 ("the oxidation number determines the number of
 * linkers and the coordination geometry") used to land on modularity, whose
 * picture said nothing about oxidation numbers. It now lands on the node
 * sequence's L3, which is exactly that sentence: Zn²⁺ / Cu²⁺ / Zr⁴⁺ with
 * their oxidation states, plus the geometry names and connection counts.
 * ------------------------------------------------------------------------ */

// NodeGeometry's 600 frames cover narration frames 0-702 (the pre-rendered
// sequence is compressed by 0.855), so six sentence gaps totalling 103 frames are
// cut out of 0-600 here to make the opening line up. Every boundary then moves
// 103 frames earlier: 933 -> 830, 1616 -> 1513.
const HSAB_AT = 830; // 933 - 103
const V3A_FRAMES = HSAB_AT - NODE_GEOM_FRAMES; // 230 (600 -> 830)
const V3A_SCALE = 665 / V3A_FRAMES; // ≈2.89, v3's first 665 frames squeezed

const HSAB_WINDOW = 683; // 933 -> 1616 (same as the main cut)
const V3B_AT = HSAB_AT + HSAB_WINDOW; // 1513
// Same tail as the main cut: offset 800, 1:1 speed, 340 frames, so the sequence
// runs water attack -> bond breaking -> full collapse. The previous settings
// (offset 665, 290 frames) only reached internal frame 945, so snap (950) and
// apart (990) never played and the ending never broke apart on screen.
const V3B_FRAMES = 340; // 1616 -> 1956
const V3B_INNER = 1140 - 800; // 340 internal frames
const V3B_SCALE = V3B_INNER / V3B_FRAMES; // = 1.0

export const INORGANIC_EXP_FRAMES = V3B_AT + V3B_FRAMES; // 1853 = 61.8 s

export const InorganicExp: FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0d14" }}>
      <Sequence from={0} durationInFrames={NODE_GEOM_FRAMES} name="node geometry">
        <NodeGeometry durationInFrames={NODE_GEOM_FRAMES} />
      </Sequence>

      <Sequence from={NODE_GEOM_FRAMES} durationInFrames={V3A_FRAMES} name="paddlewheel">
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
