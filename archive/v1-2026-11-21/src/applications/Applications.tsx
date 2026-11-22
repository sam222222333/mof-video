import type { FC, ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Sequence } from "remotion";
import { FONT, PAL, BACKDROP_CSS } from "../style";
import { DesertClip } from "../team/DesertClip";

/* ------------------------------------------------------------------------ *
 * APPLICATIONS — "So what are MOFs actually used for?"  (1230 frames = 41 s)
 *
 *   0 - 110   title + four icons
 * 100 - 372   metal nodes as catalysts: hydrogenation, then C-C bond formation
 * 372 - 604   pores capture CO2, which is reduced to methane
 * 600 - 962   gas storage: same tank, with and without MOF (H2, then CH4)
 * 960 - 1230  water from desert air: night uptake, sunlight release
 *
 * Schematic throughout: no pressures or yields are shown on screen.
 * ------------------------------------------------------------------------ */

const NODE = PAL.lilac;
const CREAM = PAL.cream;
const PORE = PAL.peach;
const MUTE = PAL.mute;
const WATER = "#7ee0ff";

const ramp = (f: number, s: number, d = 18): number =>
  interpolate(f, [s, s + d], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
const lin = (f: number, a: number, b: number): number =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const ease = (t: number): number => Easing.inOut(Easing.cubic)(Math.max(0, Math.min(1, t)));
const mix = (a: number, b: number, t: number): number => a + (b - a) * t;
const rnd = (i: number): number => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const win = (f: number, a: number, b: number, fi = 14, fo = 14): number =>
  ramp(f, a, fi) * (1 - lin(f, b - fo, b));

const Atom: FC<{ x: number; y: number; r: number; g: string; o?: number }> = ({ x, y, r, g, o = 1 }) => (
  <circle cx={x} cy={y} r={r} fill={`url(#${g})`} opacity={o} />
);

const CO2: FC<{ x: number; y: number; o?: number; s?: number }> = ({ x, y, o = 1, s = 1 }) => (
  <g opacity={o}>
    <line x1={x - 34 * s} y1={y} x2={x + 34 * s} y2={y} stroke="#cbd5e1" strokeWidth={4 * s} />
    <Atom x={x - 34 * s} y={y} r={14 * s} g="gO" />
    <Atom x={x} y={y} r={16 * s} g="gC" />
    <Atom x={x + 34 * s} y={y} r={14 * s} g="gO" />
  </g>
);

const CH4: FC<{ x: number; y: number; o?: number }> = ({ x, y, o = 1 }) => (
  <g opacity={o}>
    {[[-52, -40], [52, -40], [-52, 40], [52, 40]].map(([dx, dy], i) => (
      <g key={i}>
        <line x1={x} y1={y} x2={x + dx} y2={y + dy} stroke="#cbd5e1" strokeWidth={5} />
        <Atom x={x + dx} y={y + dy} r={15} g="gH" />
      </g>
    ))}
    <Atom x={x} y={y} r={28} g="gC" />
  </g>
);

const Hex: FC<{ x: number; y: number; r: number; o?: number }> = ({ x, y, r, o = 1 }) => (
  <polygon
    points={Array.from({ length: 6 }, (_, k) => {
      const a = (k * Math.PI) / 3;
      return `${x + r * Math.cos(a)},${y + r * Math.sin(a)}`;
    }).join(" ")}
    fill="none"
    stroke={CREAM}
    strokeWidth={4}
    strokeLinejoin="round"
    opacity={o}
  />
);

/** a small lattice of nodes with hexagon linkers on every edge */
const Lattice: FC<{
  x0: number; y0: number; cols: number; rows: number; sp: number;
  nr?: number; hr?: number; sw?: number; o?: number; poreTint?: number;
}> = ({ x0, y0, cols, rows, sp, nr = 26, hr = 17, sw = 5, o = 1, poreTint = 0.12 }) => (
  <g opacity={o}>
    {Array.from({ length: (cols - 1) * (rows - 1) }, (_, i) => {
      const c = i % (cols - 1);
      const r = Math.floor(i / (cols - 1));
      return (
        <rect key={`p${i}`} x={x0 + c * sp + sp * 0.14} y={y0 + r * sp + sp * 0.14}
          width={sp * 0.72} height={sp * 0.72} rx={10} fill={PORE} fillOpacity={poreTint} />
      );
    })}
    {Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols - 1 }, (_, c) => (
        <g key={`h${r}-${c}`}>
          <line x1={x0 + c * sp} y1={y0 + r * sp} x2={x0 + (c + 1) * sp} y2={y0 + r * sp} stroke={CREAM} strokeWidth={sw} />
          <circle cx={x0 + c * sp + sp / 2} cy={y0 + r * sp} r={hr + 3} fill="#10162c" />
          <Hex x={x0 + c * sp + sp / 2} y={y0 + r * sp} r={hr} />
        </g>
      ))
    )}
    {Array.from({ length: rows - 1 }, (_, r) =>
      Array.from({ length: cols }, (_, c) => (
        <g key={`v${r}-${c}`}>
          <line x1={x0 + c * sp} y1={y0 + r * sp} x2={x0 + c * sp} y2={y0 + (r + 1) * sp} stroke={CREAM} strokeWidth={sw} />
          <circle cx={x0 + c * sp} cy={y0 + r * sp + sp / 2} r={hr + 3} fill="#10162c" />
          <Hex x={x0 + c * sp} y={y0 + r * sp + sp / 2} r={hr} />
        </g>
      ))
    )}
    {Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => (
        <Atom key={`n${r}-${c}`} x={x0 + c * sp} y={y0 + r * sp} r={nr} g="gLil" />
      ))
    )}
  </g>
);

const Tank: FC<{ cx: number; cy: number; w: number; h: number }> = ({ cx, cy, w, h }) => (
  <g>
    <rect x={cx - 30} y={cy - h / 2 - 36} width={60} height={40} rx={8} fill="none" stroke={CREAM} strokeWidth={6} />
    <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={120} fill="rgba(255,255,255,0.03)" stroke={CREAM} strokeWidth={6} />
  </g>
);

export const Applications: FC = () => {
  /* The picture is authored at 1230 frames but the narration is only 1139 frames
     (the Current uses section of vo-timeline.json, absolute 6515-7654). The whole
     section is scaled to 1150 rather than retiming each boundary, which preserves
     the internal relative timing everywhere (what lights up first, what leaves
     first) and avoids the jumps that per-boundary edits cause: an element starting
     to fade at an internal frame would already be fully lit by the new boundary. */
  const F = useCurrentFrame() * (1230 / 1150);

  const PILLS = ["catalysis", "CO₂ capture", "gas storage", "water from air"];
  const active = F < 372 ? 0 : F < 604 ? 1 : F < 962 ? 2 : 3;
  const trackerIn = ramp(F, 104, 18);

  /* ---------------- beat 0: title + icons ---------------- */
  const b0 = win(F, 6, 114, 18, 14);
  const cardIn = (i: number) => ramp(F, 34 + i * 14, 18);

  /* ---------------- beat 1/2: catalysis ---------------- */
  const nodeOp = win(F, 108, 376, 18, 14);
  const t1txt = win(F, 112, 200, 16, 12);
  const pulse = 0.5 + 0.5 * Math.sin(F * 0.16);

  // reaction 1: hydrogenation (196-290)
  const r1 = ease(lin(F, 198, 236));
  const r1gone = lin(F, 274, 296);
  const r1op = ramp(F, 196, 8) * (1 - r1gone);
  const r1dx = mix(0, 260, ease(r1gone));
  const oX = mix(1240, 760, r1) + r1dx;
  const oY = mix(250, 388, r1) - 40 * r1gone;
  const cX = oX + 64;
  const cY = oY - 38;
  const hFly = ease(lin(F, 240, 264));
  const h1 = { x: mix(1380, cX, hFly), y: mix(190, cY - 58, hFly) };
  const h2 = { x: mix(1380, oX - 46, hFly), y: mix(290, oY - 40, hFly) };
  const dbl = 1 - lin(F, 256, 268);

  // reaction 2: C-C bond formation (290-372)
  const r2 = ease(lin(F, 296, 330));
  const r2gone = lin(F, 352, 374);
  const r2op = ramp(F, 292, 8) * (1 - r2gone);
  const r2dx = mix(0, 260, ease(r2gone));
  const aX = mix(1060, 720, r2) + r2dx;
  const aY = mix(240, 388, r2) - 40 * r2gone;
  const bX = mix(1280, 802, r2) + r2dx;
  const bY = mix(310, 388, r2) - 40 * r2gone;
  const ccBond = lin(F, 332, 350);

  /* ---------------- beat 3: CO2 ---------------- */
  const b3 = win(F, 374, 606, 16, 14);
  const pores = [[445, 475], [675, 475], [445, 705], [675, 705]];
  const co2Start = [[1120, 300], [1160, 520], [1100, 740], [1170, 930]];
  const co2In = (i: number) => ease(lin(F, 396 + i * 20, 436 + i * 20));
  const co2Out = 1 - lin(F, 512, 548);
  const arrowP = ramp(F, 500, 30);
  const ch4P = ramp(F, 540, 22);

  /* ---------------- beat 4: storage ---------------- */
  const b4 = win(F, 602, 964, 16, 14);
  const phaseH = 1 - lin(F, 772, 792); // H2 first, then CH4
  const phaseM = lin(F, 772, 792);
  const TCX = [520, 1400];
  const TCY = 590;
  const leftDots = Array.from({ length: 8 }, (_, i) => ({
    x: TCX[0] - 190 + rnd(i + 1) * 380,
    y: TCY - 70 + rnd(i + 20) * 140,
    k: i,
  }));
  const rightDots: { x: number; y: number; k: number }[] = [];
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 2; r++)
      for (let j = 0; j < 5; j++) {
        const k = rightDots.length;
        rightDots.push({
          x: TCX[1] - 150 + c * 100 + (rnd(k + 50) - 0.5) * 62,
          y: TCY - 50 + r * 100 + (rnd(k + 90) - 0.5) * 62,
          k,
        });
      }

  /* ---------------- beat 5: water ---------------- */
  const b5 = ramp(F, 962, 18);
  const dawn = lin(F, 1086, 1140);
  const sunUp = ramp(F, 1090, 40);
  const night = 1 - dawn;
  const topC = [mix(10, 46, dawn), mix(16, 64, dawn), mix(40, 120, dawn)].map(Math.round);
  const botC = [mix(20, 150, dawn), mix(30, 100, dawn), mix(60, 90, dawn)].map(Math.round);
  const vapour = Array.from({ length: 16 }, (_, i) => {
    const ph = (((F - 966) * 0.011 + rnd(i + 7)) % 1 + 1) % 1;
    const sx = 260 + rnd(i + 3) * 1400;
    const sy = 330 + rnd(i + 11) * 230;
    return { x: mix(sx, 960, ph * ph), y: mix(sy, 690, ph * ph), o: Math.sin(ph * Math.PI) * night };
  });
  const dropFall = (i: number) => lin(F, 1140 + i * 22, 1176 + i * 22);
  const level = ramp(F, 1150, 80);

  return (
    <AbsoluteFill style={{ background: BACKDROP_CSS, fontFamily: FONT }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ fontFamily: FONT }}>
        <defs>
          <radialGradient id="gLil" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#e0e7ff" /><stop offset="45%" stopColor="#818cf8" /><stop offset="100%" stopColor="#3730a3" />
          </radialGradient>
          <radialGradient id="gCu" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#ffe3c2" /><stop offset="45%" stopColor="#f0a060" /><stop offset="100%" stopColor="#8a4a1f" />
          </radialGradient>
          <radialGradient id="gC" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#cbd5e1" /><stop offset="50%" stopColor="#64748b" /><stop offset="100%" stopColor="#1e293b" />
          </radialGradient>
          <radialGradient id="gO" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#fecaca" /><stop offset="50%" stopColor="#ef4444" /><stop offset="100%" stopColor="#7f1d1d" />
          </radialGradient>
          <radialGradient id="gH" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#ffffff" /><stop offset="60%" stopColor="#e2e8f0" /><stop offset="100%" stopColor="#94a3b8" />
          </radialGradient>
          <radialGradient id="ringGlow">
            <stop offset="0%" stopColor={PORE} stopOpacity={0.55} /><stop offset="100%" stopColor={PORE} stopOpacity={0} />
          </radialGradient>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={`rgb(${topC[0]},${topC[1]},${topC[2]})`} />
            <stop offset="100%" stopColor={`rgb(${botC[0]},${botC[1]},${botC[2]})`} />
          </linearGradient>
        </defs>

        {/* ---------- heading + tracker ---------- */}
        <g opacity={trackerIn}>
          {/* The desert is a full-frame <canvas> and the solar panel reaches the top
            of the screen, washing the title out. A top-down dark gradient keeps the
            title readable without affecting the scene itself. */}
        <defs>
          <linearGradient id="trkScrim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a0d14" stopOpacity={0.88} />
            <stop offset="70%" stopColor="#0a0d14" stopOpacity={0.62} />
            <stop offset="100%" stopColor="#0a0d14" stopOpacity={0} />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={1920} height={240} fill="url(#trkScrim)" />
        <text x={120} y={130} fontSize={46} fontWeight={800} fill={NODE}>What are MOFs used for?</text>
          {PILLS.map((p, i) => {
            const x = 1000 + i * 222;
            const on = i === active;
            return (
              <g key={p}>
                <rect x={x} y={92} width={208} height={52} rx={26}
                  fill={on ? "rgba(129,140,248,0.28)" : "rgba(255,255,255,0.04)"}
                  stroke={on ? NODE : "rgba(255,255,255,0.15)"} strokeWidth={on ? 3 : 1.5} />
                <text x={x + 104} y={127} textAnchor="middle" fontSize={25} fontWeight={on ? 700 : 500} fill={on ? CREAM : MUTE}>{p}</text>
              </g>
            );
          })}
        </g>

        {/* ---------- beat 0 ---------- */}
        <g opacity={b0}>
          <text x={960} y={400} textAnchor="middle" fontSize={84} fontWeight={800} fill={CREAM}>
            So what are MOFs actually used for?
          </text>
          {[0, 1, 2, 3].map((i) => {
            const x = 190 + i * 400;
            const p = cardIn(i);
            const cx = x + 170;
            return (
              <g key={i} opacity={p} transform={`translate(0,${(1 - p) * 16})`}>
                <rect x={x} y={500} width={340} height={300} rx={24} fill="rgba(255,255,255,0.04)" stroke={NODE} strokeWidth={2.5} strokeOpacity={0.6} />
                {i === 0 && (<g><Atom x={cx} y={620} r={40} g="gCu" /><circle cx={cx} cy={620} r={64 + pulse * 6} fill="none" stroke={PORE} strokeWidth={4} opacity={0.8} /></g>)}
                {i === 1 && <CO2 x={cx} y={620} s={1.5} />}
                {i === 2 && (<g><rect x={cx - 80} y={585} width={160} height={80} rx={40} fill="none" stroke={CREAM} strokeWidth={5} /><rect x={cx - 14} y={570} width={28} height={20} rx={4} fill="none" stroke={CREAM} strokeWidth={4} /></g>)}
                {i === 3 && <path d={`M ${cx} 570 C ${cx + 40} 620 ${cx + 56} 650 ${cx} 676 C ${cx - 56} 650 ${cx - 40} 620 ${cx} 570 Z`} fill={WATER} fillOpacity={0.55} stroke={WATER} strokeWidth={4} />}
                <text x={cx} y={750} textAnchor="middle" fontSize={38} fontWeight={700} fill={CREAM}>{PILLS[i]}</text>
              </g>
            );
          })}
        </g>

        {/* ---------- beats 1-2: node as catalyst ---------- */}
        <g opacity={nodeOp}>
          {/* linkers out to the sides */}
          {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], i) => (
            <g key={i}>
              <line x1={760} y1={sy < 0 ? 520 : 640} x2={760 + sx * 120} y2={580 + sy * 110} stroke={CREAM} strokeWidth={6} strokeLinecap="round" />
              <line x1={760 + sx * 120} y1={580 + sy * 110} x2={760 + sx * 210} y2={580 + sy * 150} stroke={CREAM} strokeWidth={6} strokeLinecap="round" />
              <Atom x={760 + sx * 120} y={580 + sy * 110} r={15} g="gO" />
              <Hex x={760 + sx * 252} y={580 + sy * 168} r={30} />
            </g>
          ))}
          <line x1={760} y1={520} x2={760} y2={640} stroke="#cbd5e1" strokeWidth={8} />
          <Atom x={760} y={520} r={46} g="gCu" />
          <Atom x={760} y={640} r={46} g="gCu" />
          {/* open metal site */}
          <circle cx={760} cy={430} r={54} fill="url(#ringGlow)" opacity={0.5 + 0.5 * pulse} />
          <circle cx={760} cy={430} r={26} fill="none" stroke={PORE} strokeWidth={5} strokeDasharray="8 7" />

          <g opacity={t1txt}>
            <text x={1100} y={560} fontSize={64} fontWeight={800} fill={NODE}>metal node</text>
            <text x={1100} y={618} fontSize={38} fill={MUTE}>open metal site = Lewis acid</text>
            <text x={1100} y={668} fontSize={38} fill={CREAM}>→ a catalytic site</text>
          </g>

          {/* reaction 1: C=O + H2 -> C-OH */}
          <g opacity={r1op}>
            <line x1={oX} y1={oY} x2={cX} y2={cY} stroke="#cbd5e1" strokeWidth={5} />
            <line x1={oX + 8} y1={oY + 9} x2={cX + 8} y2={cY + 9} stroke="#cbd5e1" strokeWidth={5} opacity={dbl} />
            <line x1={cX} y1={cY} x2={cX + 60} y2={cY - 34} stroke={CREAM} strokeWidth={4} />
            <line x1={cX} y1={cY} x2={cX + 62} y2={cY + 34} stroke={CREAM} strokeWidth={4} />
            <circle cx={cX + 60} cy={cY - 34} r={9} fill={CREAM} />
            <circle cx={cX + 62} cy={cY + 34} r={9} fill={CREAM} />
            {hFly > 0.97 && (<g><line x1={cX} y1={cY} x2={h1.x} y2={h1.y} stroke="#cbd5e1" strokeWidth={4} /><line x1={oX} y1={oY} x2={h2.x} y2={h2.y} stroke="#cbd5e1" strokeWidth={4} /></g>)}
            <Atom x={oX} y={oY} r={18} g="gO" />
            <Atom x={cX} y={cY} r={22} g="gC" />
            <Atom x={h1.x} y={h1.y} r={13} g="gH" />
            <Atom x={h2.x} y={h2.y} r={13} g="gH" />
          </g>
          <g opacity={win(F, 200, 296, 14, 12)}>
            <text x={1100} y={790} fontSize={52} fontWeight={800} fill={PORE}>hydrogenation</text>
            <text x={1100} y={845} fontSize={38} fill={CREAM}>C=O + H₂ → C–OH</text>
          </g>

          {/* reaction 2: C-C bond formation */}
          <g opacity={r2op}>
            <line x1={aX} y1={aY} x2={aX - 56} y2={aY - 30} stroke={CREAM} strokeWidth={4} />
            <circle cx={aX - 56} cy={aY - 30} r={9} fill={CREAM} />
            <line x1={bX} y1={bY} x2={bX + 56} y2={bY - 30} stroke={CREAM} strokeWidth={4} />
            <circle cx={bX + 56} cy={bY - 30} r={9} fill={CREAM} />
            <line x1={aX} y1={aY} x2={aX + (bX - aX) * ccBond} y2={aY + (bY - aY) * ccBond} stroke={PORE} strokeWidth={9} strokeLinecap="round" opacity={ccBond > 0.02 ? 1 : 0} />
            <Atom x={aX} y={aY} r={22} g="gC" />
            <Atom x={bX} y={bY} r={22} g="gC" />
          </g>
          <g opacity={win(F, 296, 378, 14, 12)}>
            <text x={1100} y={790} fontSize={52} fontWeight={800} fill={PORE}>C–C bond formation</text>
            <text x={1100} y={845} fontSize={38} fill={CREAM}>R–C + C–R′ → R–C–C–R′</text>
          </g>
        </g>

        {/* ---------- beat 3: CO2 capture ---------- */}
        <g opacity={b3}>
          <Lattice x0={330} y0={360} cols={3} rows={3} sp={230} o={ramp(F, 378, 20)} poreTint={0.12 + 0.1 * ramp(F, 420, 40)} />
          <text x={330} y={300} fontSize={56} fontWeight={800} fill={CREAM} opacity={ramp(F, 392, 18)}>pores capture CO₂</text>
          {pores.map(([px, py], i) => {
            const t = co2In(i);
            return (
              <CO2 key={i} x={mix(co2Start[i][0], px, t)} y={mix(co2Start[i][1], py, t)} s={1.2}
                o={ramp(F, 392 + i * 20, 10) * co2Out} />
            );
          })}
          <g opacity={arrowP}>
            <line x1={880} y1={590} x2={880 + 240 * arrowP} y2={590} stroke={PORE} strokeWidth={8} strokeLinecap="round" />
            <path d="M 1100 565 L 1138 590 L 1100 615" fill="none" stroke={PORE} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" opacity={lin(F, 520, 530)} />
            <text x={1000} y={540} textAnchor="middle" fontSize={34} fill={PORE}>reduced</text>
          </g>
          <CH4 x={1400} y={600} o={ch4P} />
          <text x={1400} y={440} textAnchor="middle" fontSize={42} fill={CREAM} opacity={ch4P}>useful products</text>
          <text x={1400} y={760} textAnchor="middle" fontSize={46} fontWeight={800} fill={PORE} opacity={ch4P}>methane, CH₄</text>
        </g>

        {/* ---------- beat 4: gas storage ---------- */}
        <g opacity={b4}>
          <text x={TCX[0]} y={360} textAnchor="middle" fontSize={40} fill={MUTE}>without MOF</text>
          <text x={TCX[1]} y={360} textAnchor="middle" fontSize={40} fill={CREAM} fontWeight={700}>with MOF</text>
          <Tank cx={TCX[0]} cy={TCY} w={540} h={280} />
          <Tank cx={TCX[1]} cy={TCY} w={540} h={280} />
          <Lattice x0={TCX[1] - 200} y0={TCY - 100} cols={5} rows={3} sp={100} nr={10} hr={0.1} sw={3} o={ramp(F, 616, 24) * 0.7} poreTint={0.08} />

          {[0, 1].map((ph) => {
            const col = ph === 0 ? "#cfe8ff" : PORE;
            const op = ph === 0 ? phaseH : phaseM;
            return (
              <g key={ph} opacity={op}>
                {leftDots.map((d) => (
                  <circle key={`l${d.k}`} cx={d.x + Math.sin(F * 0.06 + d.k * 2) * 16} cy={d.y + Math.cos(F * 0.05 + d.k) * 12}
                    r={ph === 0 ? 9 : 13} fill={col} opacity={ramp(F, 628 + d.k * 8, 12)} />
                ))}
                {rightDots.map((d) => (
                  <circle key={`r${d.k}`} cx={d.x + Math.sin(F * 0.07 + d.k) * 4} cy={d.y + Math.cos(F * 0.06 + d.k * 1.3) * 4}
                    r={ph === 0 ? 9 : 13} fill={col} opacity={ramp(F, 636 + d.k * 4, 12)} />
                ))}
              </g>
            );
          })}

          <g opacity={phaseH}>
            <text x={960} y={920} textAnchor="middle" fontSize={72} fontWeight={800} fill={NODE}>hydrogen</text>
            <text x={960} y={978} textAnchor="middle" fontSize={38} fill={CREAM}>more gas stored in the same tank</text>
          </g>
          <g opacity={phaseM}>
            <text x={960} y={920} textAnchor="middle" fontSize={72} fontWeight={800} fill={PORE}>methane</text>
            <text x={960} y={978} textAnchor="middle" fontSize={38} fill={CREAM}>a larger volume stored in the same tank</text>
          </g>
        </g>

        {/* ---------- beat 5: water from air ---------- */}
        {/* ---------- beat 5 is handled by <DesertClip>, see the Sequence below ---------- */}
      </svg>

      {/* ---------- beat 5: water from air, rendered desert replacing the SVG version ---------- */}
      <Sequence from={899} durationInFrames={251} name="water from desert air">
        <AbsoluteFill style={{ opacity: interpolate(F, [962, 972], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          <DesertClip offset={21.6} />
        </AbsoluteFill>
      </Sequence>

      {/* The chemistry statement under the desert beat. It lived in the old beat-5 SVG
          and was lost when that artwork was replaced. */}
      <svg width={1920} height={1080} viewBox="0 0 1920 1080"
        style={{ position: "absolute", inset: 0, opacity: interpolate(F, [1000, 1018], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        <text x={120} y={1030} fontSize={32} fill={PAL.mute}>
          hydrolytically stable Al and Zr MOFs, for arid regions
        </text>
      </svg>
    </AbsoluteFill>
  );
};
