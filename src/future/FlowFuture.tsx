import type { FC } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { BACKDROP_CSS, FONT, PAL } from "../style";

/* ------------------------------------------------------------------------ *
 * FUTURE · shot 1 — batch  ->  continuous flow
 *
 *   0:00.5  "In the future, it is hoped that MOFs will move away from
 *            batch-style production."
 *   0:05.5  "A change to continuous flow production will improve their
 *            economic viability, allowing them to be more widely utilised."
 *   0:12.2  hands off to the drug-delivery shot
 *
 * 360 frames @ 30 fps (12 s). Flat schematic, no circles: vessels, pipes,
 * square precursor dots and diamond crystals only.
 *
 *   0 - 175   batch (all 4 steps on screen by ~115, held ~2 s): stirred vessel fills, stirs, crystals settle; the four
 *             stop-start steps tick in on the right
 *   172 - 203 cross-fade
 *   175 - 360 continuous (local frame starts at 25): two feeds -> heated tube -> steady crystal stream
 *             into a collector; closing line "lower cost per gram -> wider use"
 *
 * Every beat takes the frame as a prop (harness-safe, same as HsabFull).
 * ------------------------------------------------------------------------ */

export const FLOW_FUTURE_FRAMES = 360;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const ramp = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
export const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const INK = PAL.cream;
export const LIQ = "#818cf8";
export const CRY = [PAL.peach, PAL.lilac, "#f6ad7b", "#c7d2fe"];

export const Diamond: FC<{ x: number; y: number; s: number; fill: string; o?: number }> = ({
  x,
  y,
  s,
  fill,
  o = 1,
}) => (
  <polygon
    points={`${x},${y - s} ${x + s},${y} ${x},${y + s} ${x - s},${y}`}
    fill={fill}
    opacity={o}
    stroke="rgba(255,255,255,0.35)"
    strokeWidth={1}
  />
);

/* ------------------------------ BATCH ---------------------------------- */
const Batch: FC<{ frame: number }> = ({ frame }) => {
  const f = frame;
  const level = ramp(f, 22, 75); // 0..1 liquid fill
  const stream = f > 14 && f < 62;
  const blade = Math.cos(f * 0.35);
  const cx = 600;
  const top = 340;
  const bot = 780;
  const left = 450;
  const right = 750;
  const liqTop = bot - 30 - level * (bot - top - 90);
  const settle = clamp((f - 78) / 62);
  const nCry = Math.floor(settle * 46);

  const steps = [
    { t: 28, a: "1", b: "Fill", c: "load reagents" },
    { t: 52, a: "2", b: "React", c: "hours to days, then stop" },
    { t: 76, a: "3", b: "Empty and clean", c: "vessel sits idle" },
    { t: 100, a: "4", b: "Start again", c: "one batch at a time" },
  ];

  return (
    <g>
      {/* motor + shaft */}
      <rect x={cx - 40} y={236} width={80} height={56} rx={8} fill="#1f2937" stroke={INK} strokeWidth={2} opacity={0.9} />
      <line x1={cx} y1={292} x2={cx} y2={700} stroke={INK} strokeWidth={6} opacity={0.85} />
      {/* feed pipe + pour */}
      <path d={`M 250 300 L ${left + 60} 300 L ${left + 60} ${top - 8}`} fill="none" stroke={INK} strokeWidth={14} opacity={0.6} strokeLinejoin="round" />
      {stream && (
        <line x1={left + 60} y1={top} x2={left + 60} y2={liqTop} stroke={LIQ} strokeWidth={8} opacity={0.85} />
      )}
      {/* vessel body */}
      <defs>
        <clipPath id="vbody">
          <path d={`M ${left} ${top} L ${left} ${bot - 50} Q ${left} ${bot} ${left + 60} ${bot} L ${right - 60} ${bot} Q ${right} ${bot} ${right} ${bot - 50} L ${right} ${top} Z`} />
        </clipPath>
      </defs>
      <rect x={left} y={liqTop} width={right - left} height={bot - liqTop} fill={LIQ} opacity={0.35} clipPath="url(#vbody)" />
      {/* impeller (blade width oscillates to read as rotation) */}
      <rect x={cx - 70 * Math.abs(blade)} y={684} width={140 * Math.abs(blade)} height={14} rx={3} fill={INK} opacity={0.9} />
      <rect x={cx - 52 * Math.abs(Math.sin(f * 0.35))} y={560} width={104 * Math.abs(Math.sin(f * 0.35))} height={12} rx={3} fill={INK} opacity={0.75} />
      {/* settling crystals */}
      <g clipPath="url(#vbody)">
        {Array.from({ length: nCry }).map((_, i) => {
          const px = left + 40 + hash(i + 1) * (right - left - 80);
          const row = Math.floor(i / 6);
          const py = bot - 22 - row * 15 - hash(i + 9) * 8;
          return <Diamond key={i} x={px} y={py} s={9} fill={CRY[i % 4]} />;
        })}
      </g>
      <path
        d={`M ${left} ${top} L ${left} ${bot - 50} Q ${left} ${bot} ${left + 60} ${bot} L ${right - 60} ${bot} Q ${right} ${bot} ${right} ${bot - 50} L ${right} ${top}`}
        fill="none"
        stroke={INK}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <line x1={left - 14} y1={top} x2={right + 14} y2={top} stroke={INK} strokeWidth={5} />
      <text x={cx} y={850} textAnchor="middle" fontFamily={FONT} fontSize={24} fill={PAL.mute}>
        batch reactor
      </text>

      {/* the four stop-start steps */}
      {steps.map((s, i) => {
        const o = ramp(f, s.t, s.t + 14);
        const y = 400 + i * 92;
        return (
          <g key={i} opacity={o} transform={`translate(${(1 - o) * 24},0)`}>
            <rect x={960} y={y - 34} width={760} height={74} rx={14} fill="rgba(165,180,252,0.08)" stroke="rgba(165,180,252,0.35)" strokeWidth={1.5} />
            <text x={992} y={y + 12} fontFamily={FONT} fontSize={34} fontWeight={800} fill={PAL.lilac}>
              {s.a}
            </text>
            <text x={1040} y={y + 8} fontFamily={FONT} fontSize={30} fontWeight={700} fill={PAL.white}>
              {s.b}
            </text>
            <text x={1040 + 8 * s.b.length * 2.05 + 24} y={y + 8} fontFamily={FONT} fontSize={24} fill={PAL.mute}>
              {s.c}
            </text>
          </g>
        );
      })}
    </g>
  );
};

/* ----------------------------- CONTINUOUS ------------------------------ */
const Flow: FC<{ frame: number }> = ({ frame }) => {
  const f = frame; // local: 0 at global 150
  const tubeY = 540;
  const x0 = 560;
  const x1 = 1340;
  const heatA = 760;
  const heatB = 1160;
  const run = f > 55; // particles start moving
  const t = Math.max(0, f - 55);

  const tank = (y: number, label: string, o: number) => (
    <g opacity={o}>
      <rect x={140} y={y} width={170} height={150} rx={14} fill="rgba(129,140,248,0.22)" stroke={INK} strokeWidth={4} />
      <text x={225} y={y + 90} textAnchor="middle" fontFamily={FONT} fontSize={26} fontWeight={700} fill={PAL.white}>
        {label}
      </text>
    </g>
  );

  const oTankA = ramp(f, 8, 24);
  const oPipe = ramp(f, 20, 40);
  const oTube = ramp(f, 30, 52);
  const oHeat = ramp(f, 70, 90);
  const oColl = ramp(f, 95, 115);
  const oCap = ramp(f, 140, 165);

  // flowing particles
  const N = 20;
  const span = x1 - x0;
  const parts = !run
    ? []
    : Array.from({ length: N }).map((_, i) => {
        const p = (t * 4.2 + i * (span / N)) % span;
        const x = x0 + p;
        const y = tubeY + (hash(i + 4) - 0.5) * 34;
        const grown = clamp((x - heatA) / (heatB - heatA));
        return { x, y, grown, i };
      });

  // collector pile — steady growth after crystals reach the outlet
  const nPile = run ? Math.floor(clamp((f - 120) / 200) * 40) : 0;

  return (
    <g>
      {tank(300, "Metal salt", oTankA)}
      {tank(670, "Linker", oTankA)}

      {/* feed pipes (animated dashes = liquid moving) */}
      <g opacity={oPipe} fill="none" strokeLinejoin="round">
        <path d={`M 310 375 L ${x0} 375 L ${x0} ${tubeY}`} stroke={INK} strokeWidth={16} opacity={0.35} />
        <path d={`M 310 745 L ${x0} 745 L ${x0} ${tubeY}`} stroke={INK} strokeWidth={16} opacity={0.35} />
        <path d={`M 310 375 L ${x0} 375 L ${x0} ${tubeY}`} stroke={LIQ} strokeWidth={6} strokeDasharray="12 16" strokeDashoffset={-t * 3.2} />
        <path d={`M 310 745 L ${x0} 745 L ${x0} ${tubeY}`} stroke={PAL.peach} strokeWidth={6} strokeDasharray="12 16" strokeDashoffset={-t * 3.2} />
      </g>

      {/* tube reactor */}
      <g opacity={oTube}>
        <rect x={x0 - 20} y={tubeY - 44} width={x1 - x0 + 60} height={88} rx={44} fill="rgba(165,180,252,0.07)" stroke={INK} strokeWidth={5} />
      </g>

      {/* heated zone */}
      <g opacity={oHeat}>
        <rect x={heatA} y={tubeY - 78} width={heatB - heatA} height={156} rx={12} fill="rgba(253,186,116,0.14)" stroke={PAL.peach} strokeWidth={3} strokeDasharray="10 8" />
        <text x={(heatA + heatB) / 2} y={tubeY - 100} textAnchor="middle" fontFamily={FONT} fontSize={24} fill={PAL.peach}>
          heated zone: crystals nucleate and grow
        </text>
      </g>

      {/* particles: small squares -> diamonds */}
      {parts.map((p) =>
        p.grown < 0.02 ? (
          <rect key={p.i} x={p.x - 5} y={p.y - 5} width={10} height={10} fill={p.i % 2 ? LIQ : PAL.peach} opacity={0.9} />
        ) : (
          <Diamond key={p.i} x={p.x} y={p.y} s={5 + p.grown * 8} fill={CRY[p.i % 4]} />
        )
      )}

      {/* outlet + collector */}
      <g opacity={oColl}>
        <path d={`M ${x1 + 40} ${tubeY} L 1460 ${tubeY}`} stroke={INK} strokeWidth={16} opacity={0.35} />
        <rect x={1460} y={470} width={240} height={250} rx={14} fill="rgba(129,140,248,0.10)" stroke={INK} strokeWidth={4} />
        <text x={1580} y={760} textAnchor="middle" fontFamily={FONT} fontSize={24} fill={PAL.mute}>
          product out, non-stop
        </text>
        <g>
          {Array.from({ length: nPile }).map((_, i) => {
            const col = i % 8;
            const row = Math.floor(i / 8);
            return (
              <Diamond
                key={i}
                x={1485 + col * 26 + (row % 2) * 8}
                y={700 - row * 20}
                s={10}
                fill={CRY[i % 4]}
              />
            );
          })}
        </g>
        {/* falling crystals from outlet */}
        {run &&
          [0, 1, 2].map((k) => {
            const yy = tubeY + ((t * 3 + k * 40) % 120);
            return <Diamond key={k} x={1500 + k * 6} y={yy} s={7} fill={CRY[k]} o={0.9} />;
          })}
      </g>

      {/* closing line */}
      <g opacity={oCap} transform={`translate(0,${(1 - oCap) * 16})`}>
        <rect x={420} y={860} width={1080} height={96} rx={20} fill="rgba(165,180,252,0.10)" stroke="rgba(165,180,252,0.4)" strokeWidth={1.5} />
        <text x={960} y={920} textAnchor="middle" fontFamily={FONT} fontSize={38} fontWeight={800} fill={PAL.white}>
          lower cost per gram <tspan fill={PAL.lilac}>→</tspan> wider use
        </text>
      </g>
    </g>
  );
};

/** Permanent section title: use <FutureTitle /> (inside an <svg>) in EVERY
 *  Future-of-MOFs scene so it never changes between shots. Same slot and
 *  style as the other sections' titles (46 px, 800, lilac, top-left). */
export const FutureTitle: FC = () => (
  <text
    x={120}
    y={110}
    fontFamily={FONT}
    fontSize={46}
    fontWeight={800}
    fill={PAL.lilac}
    style={{ textTransform: "uppercase" }}
  >
    Future of MOFs
  </text>
);

/** Scene content only (no backdrop / title): `frame` is local to the scene. */
export const FlowScene: FC<{ frame: number }> = ({ frame }) => {
  const oBatch = 1 - ramp(frame, 172, 198);
  const oFlow = ramp(frame, 178, 203);
  const t1 = ramp(frame, 4, 24) * oBatch;
  const t2 = ramp(frame, 182, 205);
  return (
    <g>
      <text x={120} y={170} fontFamily={FONT} fontSize={30} fontWeight={700} fill={PAL.cream} opacity={t1}>
        batch production
      </text>
      <text x={120} y={170} fontFamily={FONT} fontSize={30} fontWeight={700} fill={PAL.cream} opacity={t2}>
        continuous flow
      </text>
      <g opacity={oBatch} transform={`translate(${-(1 - oBatch) * 60},0)`}>
        <Batch frame={frame} />
      </g>
      {frame >= 175 && (
        <g opacity={oFlow}>
          <Flow frame={frame - 175 + 25} />
        </g>
      )}
    </g>
  );
};

/** Standalone preview of shot 1 only. */
export const FlowFuture: FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: BACKDROP_CSS, fontFamily: FONT }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <FutureTitle />
        <FlowScene frame={frame} />
      </svg>
    </AbsoluteFill>
  );
};
