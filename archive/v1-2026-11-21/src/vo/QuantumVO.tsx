import type { FC } from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { QuantumFull, QUANTUM_FRAMES } from "../quantum/QuantumFull";
import { FrameTag } from "./FrameTag";

/* ------------------------------------------------------------------------ *
 * QuantumVO — the quantum section paired with its own narration track.
 *
 * All audio lives here. QuantumFull contains no <Audio> of its own, so the
 * section is silent when it is mounted inside Assembly.
 *
 * Timing comes from vo-timeline.json (whisper-1, 30 fps). The quantum section
 * occupies absolute frames 5196-6467 of vo.m4a, and local = absolute - 5196.
 * Picture and audio are both 1271 frames, so there is neither slack nor gap.
 *
 * Sentence onsets (local frames):
 *   #33 l0-166     colour identifies the build   #34 l184-296  perfect crystal, nearly colourless
 *   #35 l322-392   hue comes from defects        #36 l392-506  missing linker breaks the paddlewheel
 *   #37 l519-625   altered d-d transition        #38 l661-718  sensitivity to water
 *   #39 l744-834   water binds the open axial site
 *   #40 l861-934   square planar -> square pyramidal
 *   #41 l951-1080  absorbs red -> turquoise      #42 l1096-1184 heat under vacuum, water leaves
 *   #43 l1184-1271 coordination and colour return
 *
 * Scene boundaries in QuantumFull.tsx against the same table:
 *   A    0-166    title           #33
 *   B  166-322    perfect crystal  #34
 *   C  322-392    node disappears  #35
 *   D  392-661    missing linker   #36 #37
 *   E1 661-861    water binds      #38 #39
 *   E2 861-951    level diagram    #40
 *   F  951-1096   spectrum + swatch #41
 *   G 1096-1271   vacuum restores  #42 #43
 *
 * Both ends of the audio are measured, not assumed. f5196 is already inside the
 * section (the first real onset of #33 is f5202, so starting six frames early is
 * silent); f6466 is the last audible frame and silence begins at f6468, while the
 * Current uses section does not start until f6515. The bake covers exactly
 * 173.2-215.5667 s.
 *
 * The section holds 9 internal pauses totalling 197 frames (15.5%). All of them
 * are ordinary sentence gaps, the longest 1.03 s, so nothing needed cutting here,
 * unlike the 5.3 s hole in Inorganic.
 * ------------------------------------------------------------------------ */

export const QUANTUM_VO_FRAMES = QUANTUM_FRAMES;

export const QuantumVO: FC = () => (
  <AbsoluteFill>
    <QuantumFull />
    {/* Audio is pre-baked to public/vo-quantum.wav (42.37 s / 1271 frames).
        <Audio startFrom/endAt> is avoided because the Studio preview ignores both
        props: it makes two tracks start from zero together, or lets one section run
        past its end into the next section's speech. Rendered output is correct, but
        the preview is not. A standalone file simply has no data after its last frame. */}
    <Audio src={staticFile("vo-quantum.wav")} />
    <FrameTag />
  </AbsoluteFill>
);
