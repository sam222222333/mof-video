import type { FC } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Hook } from "./hook/Hook";
import { GeneralInfo } from "./hook/GeneralInfo";
import { InorganicExp } from "./InorganicExp";
import { OrganicLinkers } from "./organic/OrganicLinkers";
import { ColourFull, COLOUR_FULL_FRAMES } from "./colour/ColourFull";
import { Applications } from "./applications/Applications";
import { FutureOfMofs, FUTURE_FRAMES } from "./future/FutureOfMofs";
import { Credits, CREDITS_FRAMES } from "./Credits";

/* ------------------------------------------------------------------------ *
 * ASSEMBLY VO CITE — a copy of AssemblyVO with the scene 07 and 08 citations
 * switched on. Nothing else differs: same seven sections, same lengths, same
 * single audio track.
 *
 * This composition exists so the citations can be judged on screen while the
 * master (AssemblyVO) stays exactly as it is. If the citation layout is accepted,
 * the two `citations` props in this file are the only change needed to promote it.
 *
 * What is cited and what is not, as of 2026-11-21:
 *   07 current uses   all four beats have a source
 *   08 future         beats 1-3 have a source (beat 3 splits: semiconductor for
 *                     the honeycomb half, solid electrolyte for the battery half)
 *                     beat 4 (rare earths, grid storage) has none yet
 *
 * Refs are drawn top-right, 21 px, muted, so they read at 720p without competing
 * with the beat.
 * ------------------------------------------------------------------------ */

const HOOK = 357;
const GENERAL = 1073;
const INORGANIC = 1853;
const ORGANIC = 1830;
const COLOUR = COLOUR_FULL_FRAMES; // 1291
const CURRENT = 1150;
const FUTURE = FUTURE_FRAMES; // 1180
const CREDITS = CREDITS_FRAMES; // 676

export const ASSEMBLY_VO_CITE_FRAMES =
  HOOK + GENERAL + INORGANIC + ORGANIC + COLOUR + CURRENT + FUTURE + CREDITS; // 9410

export const AssemblyVOCite: FC = () => {
  const a = 0;
  const b = a + HOOK;
  const c = b + GENERAL;
  const d = c + INORGANIC;
  const e = d + ORGANIC;
  const f = e + COLOUR;
  const g = f + CURRENT;
  const h = g + FUTURE;

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
          <Hook citations />
        </Sequence>
        <Sequence from={b} durationInFrames={GENERAL} name="02 general info">
          <GeneralInfo citations />
        </Sequence>
        <Sequence from={c} durationInFrames={INORGANIC} name="04 inorganic">
          <InorganicExp citations />
        </Sequence>
        <Sequence from={d} durationInFrames={ORGANIC} name="05 organic">
          <OrganicLinkers citations />
        </Sequence>
        <Sequence from={e} durationInFrames={COLOUR} name="06 colour">
          <ColourFull citations />
        </Sequence>
        <Sequence from={f} durationInFrames={CURRENT} name="07 current uses">
          <Applications citations />
        </Sequence>
        <Sequence from={g} durationInFrames={FUTURE} name="08 future">
          <FutureOfMofs citations />
        </Sequence>

        <Sequence from={h} durationInFrames={CREDITS} name="09 credits">
          <Credits />
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
