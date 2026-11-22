import { Composition, Folder } from "remotion";
import { MoleculeSpin } from "./MoleculeSpin";
import { PaddlewheelDemo } from "./PaddlewheelDemo";
import { Shot01ColdOpen } from "./Shot01ColdOpen";
import { QuantumFig1 } from "./quantum/Figure1Splitting";
import { QuantumFig2 } from "./quantum/Figure2Spectrum";
import { QuantumFig3 } from "./quantum/Figure3Symmetry";
import { QuantumFull, QUANTUM_FRAMES } from "./quantum/QuantumFull";
import { ColourFull, COLOUR_FULL_FRAMES } from "./colour/ColourFull";
import { HKUST1Colour, SHOT05_FRAMES } from "./shot05/HKUST1Colour";
import { PaddleCloseUp } from "./inorganic/PaddleCloseUp";
import { OpenSite } from "./inorganic/OpenSite";
import { HsabFull } from "./inorganic/HsabFull";
import { PaddleV3, V3_FRAMES } from "./inorganic/PaddleV3";
import { Inorganic, INORGANIC_FRAMES } from "./Inorganic";
import { InorganicExp, INORGANIC_EXP_FRAMES } from "./InorganicExp";
import { Applications } from "./applications/Applications";
import { CatalysisScene1 } from "./applications/CatalysisScene1";
import { FutureOfMofs, FUTURE_FRAMES } from "./future/FutureOfMofs";
import { FlowFuture, FLOW_FUTURE_FRAMES } from "./future/FlowFuture";
import { Shot02Team, TEAM_SHOT02_FRAMES } from "./team/Shot02Team";
import { DesertClip, DESERT_FRAMES } from "./team/DesertClip";
import { Hook, HOOK_FRAMES } from "./hook/Hook";
import { GeneralInfo, GENERAL_FRAMES } from "./hook/GeneralInfo";
import { HookVO, HOOK_VO_FRAMES } from "./vo/HookVO";
import { GeneralInfoVO, GENERAL_INFO_VO_FRAMES } from "./vo/GeneralInfoVO";
import { InorganicVO, INORGANIC_VO_FRAMES } from "./vo/InorganicVO";
import { InorganicExpVO, INORGANIC_EXP_VO_FRAMES } from "./vo/InorganicExpVO";
import { Assembly, ASSEMBLY_FRAMES } from "./Assembly";
import { AssemblyVO, ASSEMBLY_VO_FRAMES } from "./AssemblyVO";
import { OrganicLinkers } from "./organic/OrganicLinkers";
import { OrganicVO, ORGANIC_VO_FRAMES } from "./vo/OrganicVO";
import { QuantumVO, QUANTUM_VO_FRAMES } from "./vo/QuantumVO";
import { ColourVO, COLOUR_VO_FRAMES } from "./vo/ColourVO";
import { CurrentVO, CURRENT_VO_FRAMES } from "./vo/CurrentVO";
import { FutureVO, FUTURE_VO_FRAMES } from "./vo/FutureVO";

/* ------------------------------------------------------------------------ *
 * SIDEBAR LAYOUT
 *
 * Composition ids may only contain a-z A-Z 0-9 CJK and "-", so grouping is
 * done with <Folder> (not with slashes in the id). The id itself is what
 * `remotion render <id>` takes, and it must stay globally unique.
 *
 *   (top level)  Assembly            <- the only thing that belongs outside
 *   Hook         Hook
 *   General info GeneralInfo
 *   Inorganic    Inorganic · PaddleV3 · Hsab
 *   Organic      Organic
 *   Quantum      QuantumFull · Fig1 · Fig2 · Fig3
 *   VO           HookVO · GeneralInfoVO · InorganicVO · OrganicVO · QuantumVO · ColourVO
 *   Archive      everything replaced — kept for comparison, never in the cut
 * ------------------------------------------------------------------------ */

const HD = { fps: 30, width: 1920, height: 1080 } as const;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* the assembled film — review only, silent by design (audio lives in VO) */}
      <Composition id="AssemblyVO" component={AssemblyVO} durationInFrames={ASSEMBLY_VO_FRAMES} width={1280} height={720} fps={30} />
      <Composition
        id="Assembly"
        component={Assembly}
        durationInFrames={ASSEMBLY_FRAMES}
        fps={30}
        width={1280}
        height={720}
      />

      <Folder name="Hook">
        <Composition id="Hook" component={Hook} durationInFrames={HOOK_FRAMES} {...HD} />
      </Folder>

      <Folder name="General-info">
        <Composition id="GeneralInfo" component={GeneralInfo} durationInFrames={GENERAL_FRAMES} {...HD} />
      </Folder>

      <Folder name="Inorganic">
        {/* The film uses the experimental cut (NodeGeometry opening, timed to
            vo-inorganic-exp.wav). The previous version stays available as InorganicOld. */}
        <Composition id="Inorganic" component={InorganicExp} durationInFrames={INORGANIC_EXP_FRAMES} {...HD} />
        <Composition id="InorganicOld" component={Inorganic} durationInFrames={INORGANIC_FRAMES} {...HD} />
        <Composition id="InorganicExp" component={InorganicExp} durationInFrames={INORGANIC_EXP_FRAMES} {...HD} />
        <Composition
          id="InorganicPaddleV3"
          component={PaddleV3}
          durationInFrames={V3_FRAMES}
          {...HD}
          defaultProps={{ durationInFrames: V3_FRAMES }}
        />
        <Composition
          id="InorganicHsab"
          component={HsabFull}
          durationInFrames={721}
          {...HD}
          defaultProps={{ durationInFrames: 683 }}
        />
      </Folder>

      <Folder name="Organic">
        <Composition id="Organic" component={OrganicLinkers} durationInFrames={1830} {...HD} />
      </Folder>

      <Folder name="Quantum">
        {/* The film uses the rebuilt ColourFull (real octahedra plus a 3D paddlewheel)
            in place of the earlier quantum figures. The previous version stays as QuantumOld. */}
        <Composition id="QuantumFull" component={ColourFull} durationInFrames={COLOUR_FULL_FRAMES} {...HD} />
        <Composition id="QuantumOld" component={QuantumFull} durationInFrames={QUANTUM_FRAMES} {...HD} />
        <Composition id="ColourFull" component={ColourFull} durationInFrames={COLOUR_FULL_FRAMES} {...HD} />
        <Composition id="QuantumFig1" component={QuantumFig1} durationInFrames={120} {...HD} />
        <Composition id="QuantumFig2" component={QuantumFig2} durationInFrames={90} {...HD} />
        <Composition id="QuantumFig3" component={QuantumFig3} durationInFrames={150} {...HD} />
        <Composition id="Shot05" component={HKUST1Colour} durationInFrames={SHOT05_FRAMES} {...HD} />
      </Folder>

      <Folder name="VO">
        <Composition id="HookVO" component={HookVO} durationInFrames={HOOK_VO_FRAMES} {...HD} />
        <Composition id="GeneralInfoVO" component={GeneralInfoVO} durationInFrames={GENERAL_INFO_VO_FRAMES} {...HD} />
        <Composition id="InorganicVO" component={InorganicExpVO} durationInFrames={INORGANIC_EXP_VO_FRAMES} {...HD} />
        <Composition id="InorganicOldVO" component={InorganicVO} durationInFrames={INORGANIC_VO_FRAMES} {...HD} />
        <Composition id="InorganicExpVO" component={InorganicExpVO} durationInFrames={INORGANIC_EXP_VO_FRAMES} {...HD} />
        <Composition id="OrganicVO" component={OrganicVO} durationInFrames={ORGANIC_VO_FRAMES} {...HD} />
        <Composition id="QuantumVO" component={ColourVO} durationInFrames={COLOUR_VO_FRAMES} {...HD} />
        <Composition id="QuantumOldVO" component={QuantumVO} durationInFrames={QUANTUM_VO_FRAMES} {...HD} />
        <Composition id="ColourVO" component={ColourVO} durationInFrames={COLOUR_VO_FRAMES} {...HD} />
        <Composition id="CurrentVO" component={CurrentVO} durationInFrames={CURRENT_VO_FRAMES} {...HD} />
        <Composition id="FutureVO" component={FutureVO} durationInFrames={FUTURE_VO_FRAMES} {...HD} />
      </Folder>

      <Folder name="WIP">
        <Composition id="Applications" component={Applications} durationInFrames={1150} {...HD} />
        <Composition id="CatalysisScene1" component={CatalysisScene1} durationInFrames={330} {...HD} />
        <Composition id="FutureOfMofs" component={FutureOfMofs} durationInFrames={FUTURE_FRAMES} {...HD} />
        <Composition id="FlowFuture" component={FlowFuture} durationInFrames={FLOW_FUTURE_FRAMES} {...HD} />
      </Folder>

      <Folder name="Archive">
        <Composition id="InorganicPaddle" component={PaddleCloseUp} durationInFrames={240} {...HD} defaultProps={{ durationInFrames: 240 }} />
        <Composition id="InorganicOpenSite" component={OpenSite} durationInFrames={300} {...HD} defaultProps={{ durationInFrames: 300 }} />
        <Composition id="Shot02Team" component={Shot02Team} durationInFrames={TEAM_SHOT02_FRAMES} {...HD} />
        <Composition id="Desert" component={DesertClip} durationInFrames={DESERT_FRAMES} {...HD} />
        <Composition id="Shot01ColdOpen" component={Shot01ColdOpen} durationInFrames={180} {...HD} />
        <Composition id="Molecule" component={MoleculeSpin} durationInFrames={300} fps={30} width={1080} height={1080} />
        <Composition id="Paddlewheel" component={PaddlewheelDemo} durationInFrames={150} {...HD} />
      </Folder>
    </>
  );
};
