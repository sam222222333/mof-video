import type { FC } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Hook } from "./hook/Hook";
import { GeneralInfo } from "./hook/GeneralInfo";
import { InorganicExp } from "./InorganicExp";
import { OrganicVideo, ORGANIC_VIDEO_FRAMES as ORGANIC_NEW_FRAMES } from "./organic-v2/OrganicVideo";
import { ColourFull, COLOUR_FULL_FRAMES } from "./colour/ColourFull";
import { Applications } from "./applications/Applications";
import { FutureVideo, FUTURE_VIDEO_FRAMES } from "./future/FutureVideo";
import { Credits, CREDITS_FRAMES } from "./Credits";

/* ------------------------------------------------------------------------ *
 * ASSEMBLY NEW VO - full master, sections in script order, one audio track.
 * One <Audio src="vo-assembly-new.wav"> only: per-section *VO components carry
 * their own <Audio>, and Studio ignores <Audio startFrom> (all tracks start at
 * 0). The wav is atrim+apad per section then concatenated to the frame count,
 * except the future section: that one ships as a rendered mp4 with its own
 * narration, so the wav is cut at its first frame (260.6 s = 7818).
 * 01 hook 357 / 02 general info 1073 / 04 inorganic 1853 / 05 organic 2094 /
 * 06 colour COLOUR_FULL_FRAMES / 07 current uses 1150 / 08 future FUTURE_VIDEO_FRAMES
 * 09 credits CREDITS_FRAMES (507)
 * 1920x1080 layout scaled by 0.6667 -> 1280x720 for review.
 * ------------------------------------------------------------------------ */

const HOOK = 357;
const GENERAL = 1073;
const INORGANIC = 1853;
const ORGANIC = ORGANIC_NEW_FRAMES; // 2094, includes the 3-D paddlewheel insert
const COLOUR = COLOUR_FULL_FRAMES; // 1291
const CURRENT = 1150;
const FUTURE = FUTURE_VIDEO_FRAMES; // 1548
const CREDITS = CREDITS_FRAMES; // 507

export const ASSEMBLY_NEW_VO_FRAMES =
  HOOK + GENERAL + INORGANIC + ORGANIC + COLOUR + CURRENT + FUTURE + CREDITS; // 9873

export const AssemblyNewVO: FC = () => {
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
      <Audio src={staticFile("vo-assembly-new.wav")} />
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
          <OrganicVideo />
        </Sequence>
        <Sequence from={e} durationInFrames={COLOUR} name="06 colour">
          <ColourFull />
        </Sequence>
        <Sequence from={f} durationInFrames={CURRENT} name="07 current uses">
          <Applications />
        </Sequence>
        <Sequence from={g} durationInFrames={FUTURE} name="08 future">
          <FutureVideo />
        </Sequence>

        <Sequence from={h} durationInFrames={CREDITS} name="09 credits">
          <Credits />
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
