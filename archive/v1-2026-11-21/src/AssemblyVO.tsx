import type { FC } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Hook } from "./hook/Hook";
import { GeneralInfo } from "./hook/GeneralInfo";
import { InorganicExp } from "./InorganicExp";
import { OrganicLinkers } from "./organic/OrganicLinkers";
import { ColourFull, COLOUR_FULL_FRAMES } from "./colour/ColourFull";
import { Applications } from "./applications/Applications";
import { FutureOfMofs, FUTURE_FRAMES } from "./future/FutureOfMofs";

/* ------------------------------------------------------------------------ *
 * ASSEMBLY VO — the full master. Seven sections in script order, all audio from one track.
 *
 * The per-section *VO components are not reused here because each of them carries
 * its own <Audio>, and the Studio preview ignores <Audio startFrom>: every track
 * starts at frame 0 and seven narrations play on top of each other. Instead there is
 * a single <Audio src="vo-assembly.wav">, where each section was atrimmed and apadded
 * to its own picture length and then concatenated, so the track matches the picture
 * frame for frame (8772 frames = 292.400 s).
 *
 * Sections and lengths:
 *   01 hook            357
 *   02 general info   1073
 *   04 inorganic      1853   InorganicExp (NodeGeometry opening)
 *   05 organic        1830
 *   06 colour         1291   ColourFull (real octahedra + 3D paddlewheel)
 *   07 current uses   1150
 *   08 future         1218
 *
 * Composed at 1920x1080 and scaled by 0.6667 to 1280x720. Review passes run at 720p,
 * which saves well over half the render time.
 * ------------------------------------------------------------------------ */

const HOOK = 357;
const GENERAL = 1073;
const INORGANIC = 1853;
const ORGANIC = 1830;
const COLOUR = COLOUR_FULL_FRAMES; // 1291
const CURRENT = 1150;
const FUTURE = FUTURE_FRAMES; // 1218

export const ASSEMBLY_VO_FRAMES =
  HOOK + GENERAL + INORGANIC + ORGANIC + COLOUR + CURRENT + FUTURE; // 8772

export const AssemblyVO: FC = () => {
  const a = 0;
  const b = a + HOOK;
  const c = b + GENERAL;
  const d = c + INORGANIC;
  const e = d + ORGANIC;
  const f = e + COLOUR;
  const g = f + CURRENT;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b1020" }}>
      <Audio src={staticFile("vo-assembly.wav")} />
      <AbsoluteFill
        style={{
          width: 1920,
          height: 1080,
          transform: "scale(0.6666666666666666)",
          transformOrigin: "top left",
        }}
      >
        <Sequence from={a} durationInFrames={HOOK} name="01 hook">
          <Hook />
        </Sequence>
        <Sequence from={b} durationInFrames={GENERAL} name="02 general info">
          <GeneralInfo />
        </Sequence>
        <Sequence from={c} durationInFrames={INORGANIC} name="04 inorganic">
          <InorganicExp />
        </Sequence>
        <Sequence from={d} durationInFrames={ORGANIC} name="05 organic">
          <OrganicLinkers />
        </Sequence>
        <Sequence from={e} durationInFrames={COLOUR} name="06 colour">
          <ColourFull />
        </Sequence>
        <Sequence from={f} durationInFrames={CURRENT} name="07 current uses">
          <Applications />
        </Sequence>
        <Sequence from={g} durationInFrames={FUTURE} name="08 future">
          <FutureOfMofs />
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
