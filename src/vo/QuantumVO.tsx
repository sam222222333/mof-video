import type { FC } from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { QuantumFull, QUANTUM_FRAMES } from "../quantum/QuantumFull";
import { FrameTag } from "./FrameTag";

/* QuantumVO: isolated test bed for the Quantum section + its narration track.
 * Audio only here; `QuantumFull` has no <Audio>, so Assembly is silent.
 * Basis: vo-timeline.json (whisper-1, 30 fps); section = absolute 5196-6467,
 * local = absolute - 5196; 1271 picture frames, 1271 audio frames.
 * Cues (local): #33 0-166 color/assembly / #34 184-296 colorless /
 *   #35 322-392 defects / #36 392-506 missing linker / #37 519-625 d-d shift /
 *   #38 661-718 water-sensitive / #39 744-834 axial water / #40 861-934 pyramidal /
 *   #41 951-1080 absorbs red / #42 1096-1184 vacuum / #43 1184-1271 color back.
 * Beats: A 0-166 / B 166-322 / C 322-392 / D 392-661 / E1 661-861 / E2 861-951 /
 *   F 951-1096 / G 1096-1271. Baked 173.2-215.5667 s; longest silence 1.03 s. */

export const QUANTUM_VO_FRAMES = QUANTUM_FRAMES;

export const QuantumVO: FC = () => (
  <AbsoluteFill>
    <QuantumFull />
    {/* Pre-baked `public/vo-quantum.wav` (42.37 s / 1271 frames). Studio does not
        honour <Audio startFrom/endAt>; a separate file simply runs out of samples. */}
    <Audio src={staticFile("vo-quantum.wav")} />
    <FrameTag />
  </AbsoluteFill>
);
