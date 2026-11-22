import type { FC } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Hook, BasicInfo, HOOK_FRAMES, BASIC_INFO_FRAMES } from "./team/Sections";
import { Inorganic, INORGANIC_FRAMES } from "./Inorganic";
import { OrganicLinkers } from "./organic/OrganicLinkers";
import { HKUST1Colour, SHOT05_FRAMES } from "./shot05/HKUST1Colour";

/* ------------------------------------------------------------------------ *
 * ASSEMBLY — the whole film, in the group script's section order.
 *
 *   Hook                1 g of a MOF = 40 tennis courts        (team canvas)
 *   Basic information   what a MOF is, then modularity         (team canvas)
 *   Inorganic           nodes -> paddlewheel -> HSAB -> open site
 *   Organic             the linker
 *   Quantum             why the colour comes from defects (still `Shot05`)
 *
 * Sections are named after the script now, not after the old Shot 01–08
 * numbering. Hook / Basic information / the node half of Inorganic are three
 * slices of the team's single 50 s canvas — see src/team/Sections.tsx.
 *
 * Still missing: Current uses and Future. Those two have no footage at all.
 * The corner label is for matching sections against the script while reviewing;
 * it must be removed for the final cut.
 * ------------------------------------------------------------------------ */

const LABEL = {
  position: "absolute" as const,
  right: 90,
  bottom: 46,
  fontSize: 20,
  letterSpacing: 3,
  color: "#94a3b8",
  opacity: 0.45,
  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
};

const Tag: FC<{ text: string }> = ({ text }) => <div style={LABEL}>{text}</div>;

const ORGANIC = 750; // 25 s
const QUANTUM = SHOT05_FRAMES; // 1080 = 36 s

export const ASSEMBLY_FRAMES =
  HOOK_FRAMES + BASIC_INFO_FRAMES + INORGANIC_FRAMES + ORGANIC + QUANTUM; // 4182 = 2:19

export const Assembly: FC = () => {
  const hook = 0;
  const basic = hook + HOOK_FRAMES;
  const inorg = basic + BASIC_INFO_FRAMES;
  const organic = inorg + INORGANIC_FRAMES;
  const quantum = organic + ORGANIC;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0d14" }}>
      {/* every section is authored at 1920x1080; the review cut is 1280x720 */}
      <AbsoluteFill
        style={{
          width: 1920,
          height: 1080,
          transform: "scale(0.6666666666666666)",
          transformOrigin: "top left",
        }}
      >
        <Sequence from={hook} durationInFrames={HOOK_FRAMES} name="hook">
          <Hook />
          <Tag text={"HOOK"} />
        </Sequence>

        <Sequence from={basic} durationInFrames={BASIC_INFO_FRAMES} name="basic information">
          <BasicInfo />
          <Tag text={"BASIC INFORMATION"} />
        </Sequence>

        <Sequence from={inorg} durationInFrames={INORGANIC_FRAMES} name="inorganic">
          <Inorganic />
          <Tag text={"INORGANIC \u00B7 HKUST-1 AND THE OPEN SITE"} />
        </Sequence>

        <Sequence from={organic} durationInFrames={ORGANIC} name="organic">
          <OrganicLinkers />
          <Tag text={"ORGANIC \u2014 THE LINKER"} />
        </Sequence>

        <Sequence from={quantum} durationInFrames={QUANTUM} name="quantum">
          <HKUST1Colour />
          <Tag text={"QUANTUM \u00B7 WHY THE COLOUR COMES FROM DEFECTS"} />
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
