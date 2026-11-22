import type { FC } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { BACKDROP_CSS, FONT, PAL } from "../style";

/* ------------------------------------------------------------------------ *
 * SHOT 04d · HSAB, start to finish — retimed to the REAL narration, not an
 * estimate. Replaces the old `Hsab.tsx` (grid) + `StrongestPair.tsx`
 * (bridge card) with one continuous 585-frame (19.5 s) scene.
 *
 * Real voice-over timestamps (vo.m4a):
 *   1:16.1  #17  "Pearson's HSAB theory can be used to predict the
 *                 stability of an MOF."                           5.0 s
 *   1:21.1  #18  "The metal centres act as Lewis acids and the
 *                 organic ligands as Lewis bases."                 5.9 s
 *   1:27.0  #19  "The strongest interactions are between the hard
 *                 acids and bases and vice versa."                 4.9 s
 *   1:31.9  #20  "Chemists use these principles to select suitable
 *                 metals and linkers"                              3.7 s
 *   1:35.6  -- hands off to PaddleV3's collapse half (#21)
 *
 * Four beats, local frames at 30 fps:
 *   A   0 -  99   title: "HSAB theory"
 *   B  99 - 276   metal node = Lewis acid, linker = Lewis base
 *   C 276 - 474   one mismatch clashes (hard acid + soft base) -> cross;
 *                 then hard-hard and soft-soft lock -> two ticks
 *   D 474 - 585   the two ticks become the real example pairs
 *                 (carboxylate/Zr-Al, pyrazolate/M2+), then hand off
 *
 * Beat A was originally 150 f but sat idle after its ~0.6 s reveal, while
 * beat C (the busiest beat: a clash, a recoil, an X, two separate lock-ins,
 * two labels) only had 147 f and felt rushed. Moved 51 f from A to C.
 *
 * Each beat component below takes its LOCAL frame as an explicit `frame`
 * prop rather than calling useCurrentFrame() itself -- the render harness
 * used to QA this (and some minimal Remotion shims generally) treat
 * useCurrentFrame() as a single global counter with no <Sequence> frame-
 * offsetting, so a child relying on the hook directly would see the wrong
 * number. Threading frame as a prop works identically in a real Remotion
 * project and in the harness.
 * ------------------------------------------------------------------------ */

const C = {
  cream: PAL.cream,
  lilac: PAL.lilac,
  peach: PAL.peach,
  mute: PAL.mute,
  green: "#3fbf7f",
  red: "#e2777a",
} as const;

const ramp = (frame: number, start: number, dur = 16): number =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

const holdFade = (frame: number, dur: number, inDur = 16, outDur = 16): number =>
  ramp(frame, 0, inDur) * (1 - ramp(frame, dur - outDur, outDur));

/* ----------------------------- Beat A ----------------------------------- */

const BeatA: FC<{ frame: number; dur: number }> = ({ frame, dur }) => {
  const op = holdFade(frame, dur, 18, 6);
  const ringIn = ramp(frame, 10, 40);

  return (
    <g opacity={op}>
      <circle cx={960} cy={520} r={210 + (1 - ringIn) * 70} fill="none" stroke={C.mute} strokeWidth={1.5} opacity={0.3 * ringIn} />
      <text x={960} y={503} textAnchor="middle" fontSize={68} fill={C.cream} fontWeight={800}>
        HSAB theory
      </text>
      <text x={960} y={562} textAnchor="middle" fontSize={32} fill={C.mute}>
        predicting which MOFs survive water and heat
      </text>
    </g>
  );
};

/* ----------------------------- Beat B ----------------------------------- */

const BeatB: FC<{ frame: number; dur: number }> = ({ frame, dur }) => {
  const op = holdFade(frame, dur, 6, 6);
  // This beat is deliberately brisker. M, L and the arrow used to be spread over 95
  // frames; they now compress into 38: M 2-14, L 14-28, arrow 30-42, so the arrow is
  // in place by absolute f1112 instead of waiting until f1170. #18 now opens at B's
  // local 75 (absolute local 215), still leaving 33 frames of margin.
  const mIn = ramp(frame, 2, 12);
  const lIn = ramp(frame, 14, 14);
  const arrowIn = ramp(frame, 30, 12);

  return (
    <g opacity={op}>
      <text x={960} y={160} textAnchor="middle" fontSize={30} fill={C.mute}>
        the metal centres act as Lewis acids, the linkers as Lewis bases
      </text>

      <g opacity={mIn}>
        <circle cx={660} cy={520} r={90} fill="#16304f" stroke={C.lilac} strokeWidth={3} />
        <text x={660} y={533} textAnchor="middle" fontSize={42} fill={C.lilac} fontWeight={700}>
          M
        </text>
        <text x={660} y={642} textAnchor="middle" fontSize={30} fill={C.cream} fontWeight={600}>
          metal node
        </text>
        <text x={660} y={674} textAnchor="middle" fontSize={25} fill={C.mute}>
          Lewis acid
        </text>
      </g>

      <g opacity={lIn}>
        <circle cx={1260} cy={520} r={90} fill="#2b2a1f" stroke={C.cream} strokeWidth={3} />
        <text x={1260} y={533} textAnchor="middle" fontSize={42} fill={C.cream} fontWeight={700}>
          L
        </text>
        <text x={1260} y={642} textAnchor="middle" fontSize={30} fill={C.cream} fontWeight={600}>
          organic linker
        </text>
        <text x={1260} y={674} textAnchor="middle" fontSize={25} fill={C.mute}>
          Lewis base
        </text>
      </g>

      {/* the lone pair is donated BY the linker (Lewis base) TO the metal
          (Lewis acid) -- arrow runs linker -> metal, not the other way */}
      <g opacity={arrowIn}>
        <line x1={1170} y1={520} x2={760} y2={520} stroke={C.peach} strokeWidth={3} strokeDasharray="8 8" />
        <path d="M 776 506 L 757 520 L 776 534" fill="none" stroke={C.peach} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        <text x={960} y={492} textAnchor="middle" fontSize={24} fill={C.peach}>
          lone pair
        </text>
      </g>
    </g>
  );
};

/* ----------------------------- Beat C ----------------------------------- */

const CROSS_AT = 460; // y of the clash/match row

const Clash: FC<{ frame: number; start: number }> = ({ frame, start }) => {
  const t = frame - start;
  const inOp = ramp(frame, start, 10);
  const close = interpolate(t, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const ax = interpolate(close, [0, 1], [460, 880]);
  const bx = interpolate(close, [0, 1], [1460, 1040]);
  const recoil = interpolate(t, [30, 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const axR = ax - recoil * 90;
  const bxR = bx + recoil * 90;
  const burst = interpolate(t, [26, 36], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const burstFade = interpolate(t, [36, 48], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const xIn = ramp(frame, start + 34, 12);
  const fadeAway = 1 - ramp(frame, start + 54, 14);

  return (
    <g opacity={inOp * fadeAway}>
      <circle cx={axR} cy={CROSS_AT} r={46} fill="#16304f" stroke={C.lilac} strokeWidth={3.5} />
      <text x={axR} y={CROSS_AT + 10} textAnchor="middle" fontSize={29} fill={C.lilac} fontWeight={700}>
        hard A
      </text>
      <circle cx={bxR} cy={CROSS_AT} r={46} fill="#2b2a1f" stroke={C.peach} strokeWidth={3.5} />
      <text x={bxR} y={CROSS_AT + 10} textAnchor="middle" fontSize={29} fill={C.peach} fontWeight={700}>
        soft B
      </text>

      {/* impact spark */}
      <g opacity={burst * burstFade}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x2 = 960 + Math.cos(rad) * 62;
          const y2 = CROSS_AT + Math.sin(rad) * 62;
          return <line key={deg} x1={960} y1={CROSS_AT} x2={x2} y2={y2} stroke={C.red} strokeWidth={3.5} />;
        })}
      </g>

      <g opacity={xIn}>
        <circle cx={960} cy={CROSS_AT} r={48} fill="#1c1418" stroke={C.red} strokeWidth={3.5} />
        <path d={`M 940 ${CROSS_AT - 19} L 980 ${CROSS_AT + 19} M 980 ${CROSS_AT - 19} L 940 ${CROSS_AT + 19}`} stroke={C.red} strokeWidth={5} strokeLinecap="round" />
      </g>
      <g opacity={xIn}>
        <text x={960} y={CROSS_AT + 96} textAnchor="middle" fontSize={32} fill={C.red} fontWeight={600}>
          hard acid + soft base — mismatch
        </text>
      </g>
    </g>
  );
};

const Tick: FC<{ frame: number; x: number; start: number; color: string; dim: string; tag: string }> = ({
  frame,
  x,
  start,
  color,
  dim,
  tag,
}) => {
  const t = frame - start;
  const inOp = ramp(frame, start, 10);
  const close = interpolate(t, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const ax = interpolate(close, [0, 1], [x - 280, x - 47]);
  const bx = interpolate(close, [0, 1], [x + 280, x + 47]);
  const lock = ramp(frame, start + 28, 14);
  const tagIn = ramp(frame, start + 36, 16);

  return (
    <g opacity={inOp}>
      <line x1={x - 47} y1={CROSS_AT} x2={x + 47} y2={CROSS_AT} stroke={C.green} strokeWidth={4} opacity={lock} />
      <circle cx={ax} cy={CROSS_AT} r={46} fill={dim} stroke={color} strokeWidth={3 + lock * 2.5} style={{ filter: lock > 0.5 ? `drop-shadow(0 0 ${8 * lock}px ${color})` : undefined }} />
      <circle cx={bx} cy={CROSS_AT} r={46} fill={dim} stroke={color} strokeWidth={3 + lock * 2.5} style={{ filter: lock > 0.5 ? `drop-shadow(0 0 ${8 * lock}px ${color})` : undefined }} />
      <g opacity={lock}>
        <circle cx={x} cy={CROSS_AT - 78} r={29} fill="#0a0d14" stroke={C.green} strokeWidth={3.5} />
        <path d={`M ${x - 11} ${CROSS_AT - 78} l 8 10 l 16 -21`} fill="none" stroke={C.green} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g opacity={tagIn}>
        <text x={x} y={CROSS_AT + 102} textAnchor="middle" fontSize={31} fill={C.green} fontWeight={600}>
          {tag}
        </text>
      </g>
    </g>
  );
};

const BeatC: FC<{ frame: number; dur: number }> = ({ frame, dur }) => {
  const op = holdFade(frame, dur, 6, 6);
  const headIn = ramp(frame, 0, 18);

  return (
    <g opacity={op}>
      <g opacity={headIn}>
        <text x={960} y={290} textAnchor="middle" fontSize={52} fill={C.cream} fontWeight={700}>
          the strongest interactions
        </text>
        <text x={960} y={336} textAnchor="middle" fontSize={32} fill={C.mute}>
          hard with hard, soft with soft — and vice versa
        </text>
      </g>
      <Clash frame={frame} start={8} />
      <Tick frame={frame} x={620} start={66} color={C.lilac} dim="#16304f" tag="hard acid + hard base" />
      <Tick frame={frame} x={1300} start={96} color={C.peach} dim="#2b2a1f" tag="soft acid + soft base" />
    </g>
  );
};

/* ----------------------------- Beat D ----------------------------------- */

const Card: FC<{
  frame: number;
  x: number;
  color: string;
  base: string;
  acid: string;
  note: string;
  tag: string;
  start: number;
}> = ({ frame, x, color, base, acid, note, tag, start }) => {
  const inOp = ramp(frame, start, 18);
  const slideY = interpolate(frame, [start, start + 18], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const noteIn = ramp(frame, start + 20, 14);

  return (
    <g opacity={inOp} transform={`translate(0,${slideY})`}>
      <rect x={x - 360} y={410} width={720} height={200} rx={16} fill="rgba(255,255,255,0.03)" stroke={color} strokeWidth={2} />
      <text x={x - 326} y={468} fontSize={32} fill={C.cream} fontWeight={700}>
        {base}
      </text>
      <text x={x + 326} y={468} textAnchor="end" fontSize={22} fill={color} fontWeight={700}>
        {tag}
      </text>
      <text x={x - 326} y={514} fontSize={29} fill={color} fontWeight={600}>
        {"+  " + acid}
      </text>
      <g opacity={noteIn}>
        <text x={x - 326} y={566} fontSize={23} fill={C.mute}>
          {note}
        </text>
      </g>
    </g>
  );
};

const BeatD: FC<{ frame: number; dur: number }> = ({ frame, dur }) => {
  const op = holdFade(frame, dur, 6, 14);
  const headIn = ramp(frame, 0, 14);

  return (
    <g opacity={op}>
      <g opacity={headIn}>
        <text x={960} y={320} textAnchor="middle" fontSize={32} fill={C.mute}>
          chemists use these principles to select suitable metals and linkers
        </text>
      </g>
      <Card frame={frame} x={580} color={C.lilac} base="carboxylate" acid={"Zr⁴⁺ / Al³⁺"} note="high-valence cations → hydrolytically stable" tag="hard" start={4} />
      <Card frame={frame} x={1340} color={C.peach} base="pyrazolate" acid={"M²⁺"} note="binds transition metals in the +2 state" tag="soft" start={16} />
    </g>
  );
};

/* ----------------------------- Top level --------------------------------- */

// Retimed to hsab-vo.m4a (19.35 s). The vo is split in the gap after
// "vice versa" (audio f462) and the second half is delayed by 30 f, giving
// the extra 1 s of breathing room after #19 (see Inorganic.tsx). Scene-local
// frames @ 30 fps, with that pause already applied:
//   #17 "Pearson's HSAB theory ... stability of an MOF."   f14  - f142
//   #18 "The metal centres ... Lewis bases."               f164 - f311
//        ("metal" f174, "organic ligands" f261, "Lewis bases" f294)
//   #19 "The strongest interactions ... vice versa,"       f341 - f458
//        ("hard acids" f393, "bases" f417, "vice versa" f435)
//   -- 1 s pause (f462 -> f492) --
//   #20 "chemists use these principles ... linkers."      f500 - f609
// The four beats sit on the real sentence boundaries from vo-timeline.json
// (local frames within the HSAB window):
//   #17 0-135   #18 303-441   #19 473-586   #20 626-771
// The original cut was timed against a compressed hsab-vo.m4a (158/178/162/147).
// This uses the real narration spans instead, otherwise nothing lands between 645
// and 771, which is exactly where the picture went blank.
// Real sentence boundaries (local frames after the 50-frame gap was cut):
//   #17 0-135   #18 253-391   #19 423-536   #20 576-721
// The old #17 -> #18 gap was 160 frames (5.3 s) of picture milling about with no
// voice. 50 frames were cut from the audio and M/L/arrow were compressed on the
// picture side, shortening both ends at once.
// All four beats now fade out over 6 frames (was 22/20/14/12). Each beat faded fully
// to black before the next faded up, and that black stretch was the source of the
// blank frames. A_LEN can also go no higher than 140: beyond that BeatA has finished
// fading and BeatB has not started rendering.
const A_LEN = 140; // 0..140, #17 (0-135) plus 5 frames of margin; longer brings back the black gap
const B_LEN = 245; // 140..385, M/L/arrow compressed into 38 frames (was 95); #18 lands at 215
const C_LEN = 153; // 385..538  #19
const D_LEN = 145; // 538..683  #20

const A_END = A_LEN;
const B_END = A_END + B_LEN;
const C_END = B_END + C_LEN;
const D_END = C_END + D_LEN;

export const HsabFull: FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const fadeOut = interpolate(frame, [durationInFrames - 1, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: BACKDROP_CSS, opacity: fadeOut }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ fontFamily: FONT }}>
        {frame < A_END && <BeatA frame={frame} dur={A_LEN} />}
        {frame >= A_END && frame < B_END && <BeatB frame={frame - A_END} dur={B_LEN} />}
        {frame >= B_END && frame < C_END && <BeatC frame={frame - B_END} dur={C_LEN} />}
        {frame >= C_END && frame < D_END && <BeatD frame={frame - C_END} dur={D_LEN} />}
      </svg>
    </AbsoluteFill>
  );
};
