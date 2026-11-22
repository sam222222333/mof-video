import { Composition } from "remotion";
import { MoleculeSpin } from "./MoleculeSpin";
import { PaddlewheelDemo } from "./PaddlewheelDemo";
import { Shot01ColdOpen } from "./Shot01ColdOpen";
import { Shot01 } from "./Shot01";
import { QuantumFig1 } from "./quantum/Figure1Splitting";
import { QuantumFig2 } from "./quantum/Figure2Spectrum";
import { QuantumFig3 } from "./quantum/Figure3Symmetry";
import { PaddleCloseUp } from "./inorganic/PaddleCloseUp";
import { OpenSite } from "./inorganic/OpenSite";
import { Hsab } from "./inorganic/Hsab";
import { Inorganic, INORGANIC_FRAMES } from "./Inorganic";
import { Shot02Team, TEAM_SHOT02_FRAMES } from "./team/Shot02Team";
import { Hook, BasicInfo, HOOK_FRAMES, BASIC_INFO_FRAMES } from "./team/Sections";
import { Assembly, ASSEMBLY_FRAMES } from "./Assembly";
import { OrganicLinkers } from "./organic/OrganicLinkers";
import { HKUST1Colour, SHOT05_FRAMES } from "./shot05/HKUST1Colour";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Molecule"
        component={MoleculeSpin}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="Paddlewheel"
        component={PaddlewheelDemo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Shot01ColdOpen"
        component={Shot01ColdOpen}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Shot01"
        component={Shot01}
        durationInFrames={750}
        fps={30}
        width={1920}
        height={1080}
      />
      {/* quantum section figures (§6) — pure SVG, previewable on their own */}
      <Composition
        id="QuantumFig1"
        component={QuantumFig1}
        durationInFrames={120}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="QuantumFig2"
        component={QuantumFig2}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="QuantumFig3"
        component={QuantumFig3}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      {/* Shot 05 (§6) — why the colour comes from defects, 36 s */}
      <Composition
        id="Shot05"
        component={HKUST1Colour}
        durationInFrames={SHOT05_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      {/* §5 organic — the linker half, 25 s */}
      <Composition
        id="Organic"
        component={OrganicLinkers}
        durationInFrames={750}
        fps={30}
        width={1920}
        height={1080}
      />
      {/* everything finished, in script order — for review, not the final cut */}
      <Composition
        id="Assembly"
        component={Assembly}
        durationInFrames={ASSEMBLY_FRAMES}
        fps={30}
        width={1280}
        height={720}
      />
      {/* §2 — the team's canvas explainer (replaces our Shot02 in the cut) */}
      {/* the script's sections, each its own composition */}
      <Composition
        id="Hook"
        component={Hook}
        durationInFrames={HOOK_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="BasicInfo"
        component={BasicInfo}
        durationInFrames={BASIC_INFO_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Shot02Team"
        component={Shot02Team}
        durationInFrames={TEAM_SHOT02_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      {/* Shot 02 (§2) — 2D type + wireframe, 40 s */}
{/* Shot 04 (§4) — full section, plus each part on its own */}
      <Composition
        id="Inorganic"
        component={Inorganic}
        durationInFrames={INORGANIC_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="InorganicPaddle"
        component={PaddleCloseUp}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ durationInFrames: 240 }}
      />
      <Composition
        id="InorganicHsab"
        component={Hsab}
        durationInFrames={360}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ durationInFrames: 360 }}
      />
      <Composition
        id="InorganicOpenSite"
        component={OpenSite}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ durationInFrames: 300 }}
      />
</>
  );
};
