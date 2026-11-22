import type { FC } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { FONT, PAL, BACKDROP_CSS, VIGNETTE_CSS } from "../style";
import { ColourlessLattice3D } from "../shot05/ColourlessLattice3D";
import { project, type Cam, type Vec3 } from "./proj3d";

/* QUANTUM 1.0: color story rebuilt to the real narration (local frames).
 * Cues: #33 0-166 color/assembly / #34 184-296 colorless / #35 322-392 defects /
 *   #36 392-506 missing linker / #37 519-625 d-d shift / #38 661-718 water /
 *   #39 744-834 axial water / #40 861-934 pyramidal / #41 951-1080 absorbs red /
 *   #42 1096-1184 vacuum / #43 1184-1271 color returns.
 * Beats: A title 0-166 / B perfect 166-322 / C defect 322-392 / D missing linker
 *   392-661 / E water 661-951 / F color 951-1096 / G recovery 1096-1271.
 * Technique follows src/organic/OrganicLinkers.tsx: 3-step tracker, text left,
 * graphics right, measured labels, elements appearing in sequence.
 * 1291 frames = 43.03 s. */

export const QUANTUM_FRAMES = 1291; // new VO 43.03 s

const C = {
  text: "#e7eaf3",
  body: "#c3cbdc",
  muted: "#8b96ab",
  warm: "#f3c08a",
  lilac: "#a5b4fc",
  cu: "#7dd3fc", // Cu2+, same blue as PaddleV3
  oxy: "#f08a80", // O
  carb: "#9aa7bd", // C
  green: "#3fbf7f", // defect green, Müller 2017; do not change
  turquoise: "#40c8b0",
  deepBlue: "#1e3a8a",
};

const lin = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
const ramp = (f: number, start: number, dur = 18) => lin(f, start, start + dur);
const win = (f: number, i0: number, i1: number, o0: number, o1: number) =>
  Math.min(lin(f, i0, i1), 1 - lin(f, o0, o1));

/* ---------------------------- tracker ----------------------------------- */

const STEPS = ["defects", "water", "colour"];

const Tracker: FC<{ on: number; opacity: number }> = ({ on, opacity }) => (
  <g opacity={opacity}>
    {STEPS.map((s, i) => {
      const active = i === on;
      return (
        <g key={s}>
          <text
            x={120 + i * 250}
            y={205}
            fontSize={26}
            fill={active ? C.text : C.muted}
            fontWeight={active ? 700 : 500}
            opacity={active ? 1 : 0.75}
          >
            {`${i + 1} ${s}`}
          </text>
          <line
            x1={120 + i * 250}
            y1={218}
            x2={120 + i * 250 + (active ? 118 : 62)}
            y2={218}
            stroke={active ? C.text : "transparent"}
            strokeWidth={2}
          />
        </g>
      );
    })}
  </g>
);

/* ------------------------- A: title ------------------------------------- */

const BeatA: FC<{ frame: number }> = ({ frame }) => {
  const op = win(frame, 0, 20, 146, 166);
  const rule = ramp(frame, 26, 34);
  return (
    <g opacity={op}>
      <text x={120} y={130} fontSize={46} fill={PAL.lilac} fontWeight={800}>
        where the colour comes from
      </text>
      <text x={120} y={180} fontSize={28} fill={C.muted} opacity={ramp(frame, 14, 24)}>
        a perfect crystal is almost colourless — the colour is a property of its defects
      </text>
      <line x1={120} y1={300} x2={120 + 640 * rule} y2={300} stroke={C.lilac} strokeWidth={2} opacity={0.45} />
      <text x={120} y={372} fontSize={34} fill={C.body} opacity={ramp(frame, 52, 26)}>
        MOF-199 · HKUST-1
      </text>
      <text x={120} y={420} fontSize={24} fill={C.muted} opacity={ramp(frame, 66, 26)}>
        the colour you see is a read-out of what is inside the pores
      </text>
    </g>
  );
};

/* ------------------------- B: perfect lattice --------------------------- */

const COLS = 9;
const ROWS = 5;

/* B + C as one beat: perfect lattice -> one node missing, same camera. Two separate
   Beats each rendered ColourlessLattice3D, so the cross-dissolve double-exposed two
   lattices. One instance runs component frames 20-242, defect at defectAt 157
   (in-beat 137); text still swaps in two groups, by opacity, not by Beat. */
const BeatBC: FC<{ frame: number; dur: number }> = ({ frame, dur }) => {
  const op = win(frame, 0, 24, dur - 20, dur);
  const foot = ramp(frame, 34, 24);
  // Text must hard-cut here: a cross-dissolve double-images two sets of glyphs,
  // a blank gap blinks worse. Cut point = the defect frame (in-beat 156).
  const showB = frame < 137; // defect frame (in-beat) = 337 - 200
  const showC = frame >= 137;

  return (
    <g opacity={op}>
      <ColourlessLattice3D frame={frame + 20} defectAt={157} />
      <Tracker on={0} opacity={1} />

      {/* B: perfect crystal */}
      <text x={120} y={380} fontSize={44} fill={PAL.cream} fontWeight={600} opacity={showB ? ramp(frame, 4, 20) : 0}>
        a perfect crystal
      </text>
      <text x={120} y={436} fontSize={30} fill={C.warm} opacity={showB ? ramp(frame, 22, 20) : 0}>
        almost colourless
      </text>
      <text x={120} y={492} fontSize={24} fill={C.muted} opacity={showB ? ramp(frame, 40, 20) : 0}>
        no localised d–d excitation to absorb visible light
      </text>

      {/* C: one node missing, timed to the green glow */}
      <text x={120} y={380} fontSize={44} fill={PAL.cream} fontWeight={600} opacity={showC ? 1 : 0}>
        remove one node
      </text>
      <text x={120} y={436} fontSize={30} fill={C.green} opacity={showC ? 1 : 0}>
        and the lattice is no longer perfect
      </text>
      <text x={120} y={492} fontSize={24} fill={C.muted} opacity={showC ? 1 : 0}>
        the vacancy emits <tspan fill={C.green}>green</tspan> — that is the defect colour
      </text>
      <text x={120} y={540} fontSize={22} fill={C.muted} opacity={showC ? 0.8 : 0}>
        (the dehydrated framework is deep blue — a different effect, see 3)
      </text>

      <text x={960} y={984} textAnchor="middle" fontSize={22} fill={C.muted} opacity={0.7 * foot}>
        schematic lattice — nodes only, linkers omitted
      </text>
    </g>
  );
};

/* ------------------ D: a missing linker breaks the paddlewheel ---------- */

/* Top-down, 2D. A project() 3D view fails: all four carboxylate arms lie in one
   plane, so any oblique camera flattens the cross to a line. Lighting matches the
   B/C lattice: soft Cu halo, green breathing glow at the vacancy. */
const DWX = 1300;
const DWY = 500;
const ARM = 236;
const AO = 88;

const Bridge: FC<{ ang: number; op: number; gone?: number }> = ({ ang, op, gone = 0 }) => {
  const a = (ang * Math.PI) / 180;
  const cu: [number, number] = [DWX, DWY];
  const o: [number, number] = [DWX + Math.cos(a) * AO, DWY + Math.sin(a) * AO];
  const c: [number, number] = [DWX + Math.cos(a) * ARM, DWY + Math.sin(a) * ARM];
  return (
    <g>
      <line x1={cu[0]} y1={cu[1]} x2={o[0]} y2={o[1]} stroke={C.carb} strokeWidth={5} opacity={op * (1 - 0.45 * gone)} />
      <line x1={o[0]} y1={o[1]} x2={c[0]} y2={c[1]} stroke={C.carb} strokeWidth={4} opacity={op * (1 - gone)} />
      <circle cx={o[0]} cy={o[1]} r={12} fill={C.oxy} opacity={op * (1 - 0.4 * gone)} />
      <circle cx={c[0]} cy={c[1]} r={9} fill={C.carb} opacity={op * (1 - gone)} />
    </g>
  );
};

const BeatD: FC<{ frame: number; dur: number }> = ({ frame, dur }) => {
  const op = win(frame, 0, 22, dur - 24, dur);
  const draw = ramp(frame, 6, 34);
  const gone = ramp(frame, 96, 28);
  const hole = ramp(frame, 116, 30);
  const tilt = ramp(frame, 150, 50);
  const pulse = 0.5 + 0.5 * Math.sin(frame / 11);
  const vx = DWX + AO + 42;
  const vy = DWY;

  return (
    <g opacity={op}>
      <defs>
        <radialGradient id="qCuGlow">
          <stop offset="0%" stopColor={C.cu} stopOpacity={0.5} />
          <stop offset="100%" stopColor={C.cu} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="qVacGlow">
          <stop offset="0%" stopColor={C.green} stopOpacity={0.42} />
          <stop offset="100%" stopColor={C.green} stopOpacity={0} />
        </radialGradient>
      </defs>

      <Tracker on={0} opacity={1} />
      <text x={120} y={372} fontSize={44} fill={PAL.cream} fontWeight={600} opacity={ramp(frame, 10, 22)}>
        a missing linker
      </text>
      <text x={120} y={426} fontSize={30} fill={C.warm} opacity={ramp(frame, 30, 22)}>
        one carboxylate bridge is gone
      </text>
      <text x={120} y={478} fontSize={30} fill={C.body} opacity={ramp(frame, 62, 22)}>
        the paddlewheel is no longer four-fold
      </text>
      <text x={120} y={534} fontSize={24} fill={C.muted} opacity={ramp(frame, 96, 22)}>
        that Cu keeps only three donors
      </text>
      <text x={120} y={580} fontSize={24} fill={C.muted} opacity={ramp(frame, 128, 22)}>
        so its d–d transition energy shifts
      </text>

      <g transform={`rotate(${-6 * tilt} ${DWX} ${DWY})`}>
        <circle cx={DWX} cy={DWY} r={128} fill="url(#qCuGlow)" opacity={draw} />
        {[90, 180, 270].map((a) => (
          <Bridge key={a} ang={a} op={draw} />
        ))}
        <Bridge ang={0} op={draw} gone={gone} />

        <circle cx={DWX} cy={DWY} r={44} fill={C.cu} opacity={0.18 * draw} />
        <circle cx={DWX} cy={DWY} r={30} fill={C.cu} opacity={draw} />
        <text x={DWX} y={DWY + 10} textAnchor="middle" fontSize={26} fill="#0c1a2a" fontWeight={700} opacity={draw}>
          Cu
        </text>
      </g>

      <g opacity={hole}>
        <circle cx={vx} cy={vy} r={72} fill="url(#qVacGlow)" opacity={0.55 + 0.45 * pulse} />
        <circle cx={vx} cy={vy} r={38} fill="none" stroke={C.green} strokeWidth={2.2} strokeDasharray="8 8" />
        <text x={vx + 54} y={vy - 20} fontSize={22} fill={C.green}>
          defect site
        </text>
        <text x={vx + 54} y={vy + 8} fontSize={18} fill={C.muted}>
          one donor short
        </text>
      </g>

      <text x={DWX} y={DWY + ARM + 96} textAnchor="middle" fontSize={22} fill={C.muted} opacity={0.8 * draw}>
        four carboxylates at 90° · viewed down the Cu–Cu axis
      </text>
    </g>
  );
};

/* ------------------- E1: water binds to the axial position -------------- */

/* Side view of one Cu: four equatorial O in a plane, axial site empty; water drifts
   in from lower right and binds -> square pyramidal. */
const ECX = 1360;
const ECY = 500;

const BeatE1: FC<{ frame: number; dur: number }> = ({ frame, dur }) => {
  const op = win(frame, 0, 24, dur - 20, dur);
  const plane = ramp(frame, 6, 28);
  const water = lin(frame, 52, 132);
  const bound = ramp(frame, 120, 30);
  const wX = ECX + 250 * (1 - water);
  const wY = ECY + 210 * (1 - water) - 116 * water;

  return (
    <g opacity={op}>
      <Tracker on={1} opacity={1} />
      <text x={120} y={372} fontSize={44} fill={PAL.cream} fontWeight={600} opacity={ramp(frame, 8, 22)}>
        water comes back
      </text>
      <text x={120} y={426} fontSize={30} fill={C.warm} opacity={ramp(frame, 34, 22)}>
        it binds to the open axial position
      </text>
      <text x={120} y={478} fontSize={30} fill={C.body} opacity={ramp(frame, 88, 22)}>
        square planar → square pyramidal
      </text>
      <text x={120} y={524} fontSize={22} fill={C.muted} opacity={0.85 * ramp(frame, 104, 22)}>
        5-coordinate — the opposite axial site faces the pore, so it is not octahedral
      </text>

      {/* equatorial donors: four O seen edge-on as a flattened rhombus */}
      <g opacity={plane}>
        <ellipse cx={ECX} cy={ECY} rx={244} ry={64} fill="none" stroke={C.carb} strokeWidth={2} strokeDasharray="6 7" opacity={0.7} />
        {/* edge-on: side O at the ellipse ends, front/back projected to the middle
                  so neither collides with the axial water */}
              {[[-1, 0], [1, 0], [0, -0.22], [0, 0.22]].map(([ux, uy], i) => (
          <circle key={i} cx={ECX + ux * 244} cy={ECY + uy * 244} r={15} fill={C.oxy} />
        ))}
        <text x={ECX + 262} y={ECY + 8} fontSize={21} fill={C.muted}>
          4 × O (carboxylate)
        </text>
      </g>

      {/* Cu centre with the same radial glow */}
      <defs>
        <radialGradient id="qEcuGlow">
          <stop offset="0%" stopColor={C.cu} stopOpacity={0.48} />
          <stop offset="100%" stopColor={C.cu} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="qWaterGlow">
          <stop offset="0%" stopColor={C.cu} stopOpacity={0.5} />
          <stop offset="100%" stopColor={C.cu} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g opacity={plane}>
        <circle cx={ECX} cy={ECY} r={176} fill="url(#qEcuGlow)" />
        <circle cx={ECX} cy={ECY} r={50} fill={C.cu} opacity={0.22} />
        <circle cx={ECX} cy={ECY} r={36} fill={C.cu} />
      </g>

      {/* the empty axial site */}
      <g opacity={plane * (1 - bound)}>
        <circle cx={ECX} cy={ECY - 116} r={28} fill="none" stroke={C.green} strokeWidth={2} strokeDasharray="6 6" />
        <text x={ECX} y={ECY - 164} textAnchor="middle" fontSize={23} fill={C.green}>
          open axial site
        </text>
      </g>

      {/* incoming water */}
      <g opacity={water > 0.02 ? 1 : 0}>
        <g transform={`translate(${wX}, ${wY})`}>
          <circle cx={0} cy={0} r={21} fill={C.oxy} opacity={0.95} />
          <circle cx={-25} cy={-18} r={9} fill={C.body} opacity={0.95} />
          <circle cx={25} cy={-18} r={9} fill={C.body} opacity={0.95} />
        </g>
      </g>

      {/* glow at the moment of binding */}
      <g opacity={bound}>
        <circle cx={ECX} cy={ECY - 66} r={86} fill="url(#qWaterGlow)" />
      </g>

      {/* the new axial bond */}
      <g opacity={bound}>
        <line x1={ECX} y1={ECY - 36} x2={ECX} y2={ECY - 96} stroke={C.cu} strokeWidth={4.5} strokeDasharray="7 6" />
        <text x={ECX + 34} y={ECY - 62} fontSize={24} fill={C.cu}>
          Cu–OH₂ 2.17 Å
        </text>
        <text x={ECX} y={ECY - 164} textAnchor="middle" fontSize={23} fill={C.cu}>
          axial water bound
        </text>
      </g>
    </g>
  );
};

/* ------------------- E2: the splitting shrinks --------------------------- */

const BeatE2: FC<{ frame: number; dur: number }> = ({ frame, dur }) => {
  const op = win(frame, 0, 22, dur - 18, dur);
  const lev = ramp(frame, 10, 46);
  const brace = ramp(frame, 54, 28);
  const xL = 1120;
  const xR = 1700;
  // gap = yLow - yTop must shrink: yTop moves down from 384 (gap 256) to 452 (gap 188).
  const yTop0 = 384; // gap 256
  const yTop1 = 452; // gap 188
  const yTop = yTop0 + (yTop1 - yTop0) * lev;
  const yLow = 640;

  return (
    <g opacity={op}>
      <Tracker on={1} opacity={1} />
      <text x={120} y={372} fontSize={44} fill={PAL.cream} fontWeight={600}>
        the gap shrinks
      </text>
      <text x={120} y={426} fontSize={30} fill={C.body}>
        the axial ligand pushes the d levels together
      </text>
      <text x={120} y={482} fontSize={24} fill={C.muted}>
        smaller Δ → absorbs further into the red
      </text>

      {/* #40 first half is the geometry change: the coordination sphere stays as
           a small icon so geometry and level narrowing share one screen */}
      <g opacity={ramp(frame, 18, 26)} transform="translate(740 590)">
        <ellipse cx={0} cy={0} rx={72} ry={21} fill="none" stroke={C.carb} strokeWidth={1.6} strokeDasharray="5 5" opacity={0.7} />
        {[[-1, 0], [1, 0], [0, -0.5], [0, 0.5]].map(([ux, uy], i) => (
          <circle key={i} cx={ux * 72} cy={uy * 21} r={6} fill={C.oxy} />
        ))}
        <circle cx={0} cy={0} r={16} fill={C.cu} opacity={0.9} />
        <line x1={0} y1={-16} x2={0} y2={-44} stroke={C.cu} strokeWidth={2.4} strokeDasharray="5 4" />
        <circle cx={0} cy={-52} r={9} fill={C.oxy} />
        <circle cx={-9} cy={-60} r={4} fill={C.body} />
        <circle cx={9} cy={-60} r={4} fill={C.body} />
        <text x={0} y={52} textAnchor="middle" fontSize={17} fill={C.muted}>
          5-coordinate
        </text>
      </g>

      {[
        { y: yTop, label: "dx²−y²", strong: true },
        { y: yLow, label: "dxy, dz², dxz, dyz", strong: false },
      ].map((l) => (
        <g key={l.label}>
          <line x1={xL} y1={l.y} x2={xR} y2={l.y}
            stroke={l.strong ? C.cu : C.carb} strokeWidth={l.strong ? 3 : 2} opacity={0.9} />
          <text x={xL - 20} y={l.y + 7} textAnchor="end" fontSize={22} fill={C.body}>
            {l.label}
          </text>
        </g>
      ))}

      <g opacity={brace}>
        <line x1={xR + 22} y1={yTop} x2={xR + 46} y2={yTop} stroke={C.warm} strokeWidth={2} />
        <line x1={xR + 22} y1={yLow} x2={xR + 46} y2={yLow} stroke={C.warm} strokeWidth={2} />
        <line x1={xR + 40} y1={yTop} x2={xR + 40} y2={yLow} stroke={C.warm} strokeWidth={2} />
        <text x={xR + 58} y={(yTop + yLow) / 2 + 8} fontSize={26} fill={C.warm} fontWeight={700}>
          Δ
        </text>
        <text x={xR + 58} y={(yTop + yLow) / 2 + 38} fontSize={20} fill={C.muted}>
          smaller
        </text>
      </g>
    </g>
  );
};

/* ------------------------- F: the color -------------------------------- */

const WAVE_X0 = 900;
const WAVE_X1 = 1780;
const WAVE_Y = 400;
const nm2x = (nm: number) => WAVE_X0 + ((nm - 380) / (750 - 380)) * (WAVE_X1 - WAVE_X0);

const BeatF: FC<{ frame: number; dur: number }> = ({ frame, dur }) => {
  const op = win(frame, 0, 22, dur - 22, dur);
  const bar = ramp(frame, 6, 30);
  const bands = ramp(frame, 40, 30);
  const swatch = ramp(frame, 40, 24); // swatch enters while the spectrum bar still draws
  return (
    <g opacity={op}>
      <Tracker on={2} opacity={1} />
      <text x={120} y={372} fontSize={44} fill={PAL.cream} fontWeight={600} opacity={ramp(frame, 8, 22)}>
        it absorbs red
      </text>
      <text x={120} y={426} fontSize={30} fill={C.turquoise} opacity={ramp(frame, 32, 22)}>
        and looks turquoise
      </text>
      <text x={120} y={482} fontSize={24} fill={C.muted} opacity={ramp(frame, 60, 22)}>
        the colour you see is the light that is not absorbed
      </text>

      {/* spectrum bar */}
      <g opacity={bar}>
        <defs>
          <linearGradient id="qvis" x1="0" x2="1">
            <stop offset="0%" stopColor="#5b21b6" />
            <stop offset="18%" stopColor="#3730a3" />
            <stop offset="34%" stopColor="#0e7490" />
            <stop offset="46%" stopColor="#15803d" />
            <stop offset="56%" stopColor="#a16207" />
            <stop offset="64%" stopColor="#7c2d12" />
            <stop offset="78%" stopColor="#991b1b" />
            <stop offset="100%" stopColor="#450a0a" />
          </linearGradient>
        </defs>
        <rect x={WAVE_X0} y={WAVE_Y} width={(WAVE_X1 - WAVE_X0) * bar} height={54} fill="url(#qvis)" rx={4} />
        {[400, 450, 500, 550, 600, 650, 700].map((nm) => (
          <g key={nm}>
            <line x1={nm2x(nm)} y1={WAVE_Y + 54} x2={nm2x(nm)} y2={WAVE_Y + 66} stroke={C.muted} strokeWidth={1.4} />
            <text x={nm2x(nm)} y={WAVE_Y + 88} textAnchor="middle" fontSize={20} fill={C.muted}>
              {nm}
            </text>
          </g>
        ))}
        <text x={WAVE_X0 - 16} y={WAVE_Y + 36} textAnchor="end" fontSize={20} fill={C.muted}>
          nm
        </text>
      </g>

      {/* absorption band */}
      <g opacity={bands}>
        <rect x={nm2x(600)} y={WAVE_Y - 6} width={nm2x(650) - nm2x(600)} height={66} fill="#050912" opacity={0.62} />
        <text x={(nm2x(600) + nm2x(650)) / 2} y={WAVE_Y - 22} textAnchor="middle" fontSize={22} fill={C.turquoise}>
          absorbs 600–650 nm
        </text>
      </g>

      {/* swatch */}
      <g opacity={swatch}>
        <rect x={1160} y={600} width={280} height={180} fill={C.turquoise} rx={8} />
        <text x={1300} y={820} textAnchor="middle" fontSize={30} fill={C.body} fontWeight={600}>
          turquoise
        </text>
        <text x={1300} y={862} textAnchor="middle" fontSize={24} fill={C.muted}>
          hydrated
        </text>
      </g>

      <text x={900} y={1000} fontSize={22} fill={C.muted} opacity={0.75 * bands}>
        band positions approximate — thin-film UV–vis (Müller 2017)
      </text>
    </g>
  );
};

/* ------------------------- G: water leaves again ------------------------ */

const BeatG: FC<{ frame: number; dur: number }> = ({ frame, dur }) => {
  const op = win(frame, 0, 22, dur, dur + 1);
  const leave = lin(frame, 20, 90);
  const back = ramp(frame, 96, 34);
  return (
    <g opacity={op}>
      <Tracker on={2} opacity={1} />
      <text x={120} y={372} fontSize={44} fill={PAL.cream} fontWeight={600} opacity={ramp(frame, 6, 22)}>
        heat it under vacuum
      </text>
      <text x={120} y={426} fontSize={30} fill={C.warm} opacity={ramp(frame, 34, 22)}>
        the water leaves again
      </text>
      <text x={120} y={482} fontSize={24} fill={C.muted} opacity={ramp(frame, 70, 22)}>
        the coordination — and the colour — return
      </text>

      <g opacity={1 - leave}>
        <g transform={`translate(${1420 - 260 * leave}, ${520 - 240 * leave})`}>
          <circle cx={0} cy={0} r={13} fill={C.oxy} />
          <circle cx={-16} cy={-11} r={6} fill={C.body} />
          <circle cx={16} cy={-11} r={6} fill={C.body} />
        </g>
      </g>

      <g opacity={back}>
        <rect x={1160} y={600} width={280} height={180} fill={C.deepBlue} rx={8} />
        <text x={1300} y={820} textAnchor="middle" fontSize={30} fill={C.body} fontWeight={600}>
          deep blue
        </text>
        <text x={1300} y={862} textAnchor="middle" fontSize={24} fill={C.muted}>
          dehydrated
        </text>
      </g>

      <g opacity={swatchFade(frame)}>
        <rect x={1160} y={600} width={280} height={180} fill={C.turquoise} rx={8} />
      </g>
    </g>
  );
};

const swatchFade = (f: number) => Math.max(0, 1 - lin(f, 90, 130));

/* ------------------------------- root ----------------------------------- */

/* Beat boundaries from scripts/transcribe.mjs output (vo-quantum-new.csv, 17 segments),
   grouped into 7 semantic blocks, each cut at the midpoint of a silence. Silence runs:
   0-19 / 53-69 / 187-214 / 317-338 / 412-435 / 523-530 / 644-675 / 737-760 /
   851-867 / 951-962 / 1019-1029 / 1087-1102 / 1145-1153 / 1189-1197 / 1275-1291.
   A->B 200 / B->C 327 / C->D 423 / D->E1 659 / E1->E2 850 / E2->F 956 / F->G 1094. */
const A_END = 200;
const BC_END = 423; // perfect lattice + missing node, one beat
const D_END = 645; // inside silence 644-675, leaves room for E1 fade-in
const E1_END = 845; // after water binding, before "changing the geometry"
const E_END = 956;
const F_END = 1082; // leaves room for G fade-in

export const QuantumFull: FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: BACKDROP_CSS }}>
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 0, background: VIGNETTE_CSS }} />
      </AbsoluteFill>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ fontFamily: FONT }}>
        {frame < A_END && <BeatA frame={frame} />}
        {frame >= A_END && frame < BC_END && <BeatBC frame={frame - A_END} dur={BC_END - A_END} />}
        {frame >= BC_END && frame < D_END && <BeatD frame={frame - BC_END} dur={D_END - BC_END} />}
        {frame >= D_END && frame < E1_END && <BeatE1 frame={frame - D_END} dur={E1_END - D_END} />}
        {frame >= E1_END && frame < E_END && <BeatE2 frame={frame - E1_END} dur={E_END - E1_END} />}
        {frame >= E_END && frame < F_END && <BeatF frame={frame - E_END} dur={F_END - E_END} />}
        {frame >= F_END && <BeatG frame={frame - F_END} dur={QUANTUM_FRAMES - F_END} />}
        {/* cut-off guard: nothing renders past the last beat */}
        <text x={1870} y={1050} textAnchor="end" fontSize={18} fill={C.muted} opacity={0.5}>
          schematic
        </text>
      </svg>
    </AbsoluteFill>
  );
};
