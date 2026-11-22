import type { FC } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { FONT, PAL, BACKDROP_CSS } from "../style";

/* ------------------------------------------------------------------------ *
 * APPLICATIONS, scene 1 (v2 — no lattice/grid, a single close-up node
 * inside an irregular pore cavity, paddlewheel-style like the inorganic cut)
 * 330 frames = 11 s.
 * ------------------------------------------------------------------------ */

const NODE = PAL.lilac;
const CREAM = PAL.cream;
const PORE = PAL.peach;
const MUTE = PAL.mute;

const lin = (f: number, a: number, b: number): number =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const ease = (t: number): number => Easing.inOut(Easing.cubic)(Math.max(0, Math.min(1, t)));
const ramp = (f: number, s: number, d = 16): number => ease(lin(f, s, s + d));
const mix = (a: number, b: number, t: number): number => a + (b - a) * t;
const win = (f: number, a: number, b: number, fi = 14, fo = 14): number =>
  ramp(f, a, fi) * (1 - lin(f, b - fo, b));

const Atom: FC<{ x: number; y: number; r: number; g: string; o?: number }> = ({ x, y, r, g, o = 1 }) => (
  <circle cx={x} cy={y} r={r} fill={`url(#${g})`} opacity={o} />
);

const CX = 620, CY = 560; // node centre (top Cu / bottom Cu straddle this)
const S = { x: 620, y: 420 };  // open axial site, above top Cu
const D = { x: 700, y: 310 };  // where the reactant docks

export const CatalysisScene1: FC = () => {
  const F = useCurrentFrame();
  const pulse = 0.5 + 0.5 * Math.sin(F * 0.16);
  const fw = ramp(F, 4, 26);
  const drift = Math.sin(F * 0.02) * 6;
  const siteLbl = win(F, 42, 142, 14, 14);

  /* ---- reaction 1: C=O + H2 -> C-OH ---- */
  const in1 = ease(lin(F, 66, 112));
  const out1 = ease(lin(F, 186, 214));
  const r1op = ramp(F, 64, 8) * (1 - lin(F, 204, 214));
  const ox = mix(1300, D.x, in1) + 420 * out1;
  const oy = mix(200, D.y, in1) - 60 * out1;
  const cx1 = ox + 62, cy1 = oy - 28;
  const bind = ramp(F, 112, 12) * (1 - lin(F, 190, 202));
  const pol = win(F, 124, 168, 12, 10);
  const hIn = ease(lin(F, 140, 168));
  const dbl = 1 - lin(F, 160, 172);
  const h1 = { x: mix(1360, cx1, hIn), y: mix(110, cy1 - 56, hIn) };
  const h2 = { x: mix(1360, ox - 28, hIn), y: mix(130, oy - 52, hIn) };
  const hBond = hIn > 0.97 ? 1 : 0;

  /* ---- reaction 2: C-C bond formation ---- */
  const a2 = ease(lin(F, 218, 246));
  const b2 = ease(lin(F, 240, 272));
  const o2 = ease(lin(F, 298, 326));
  const r2op = ramp(F, 216, 8) * (1 - lin(F, 316, 328));
  const dx2 = 420 * o2, dy2 = -60 * o2;
  const aP = { x: mix(1300, D.x, a2) + dx2, y: mix(180, D.y, a2) + dy2 };
  const bP = { x: mix(1360, D.x + 86, b2) + dx2, y: mix(280, D.y - 34, b2) + dy2 };
  const ccB = ramp(F, 274, 14);
  const bind2 = ramp(F, 246, 10) * (1 - lin(F, 296, 308));

  // four linkers radiating from the node at different angles (not a grid)
  const linkers = [
    { a: 200, len: 230 }, { a: 160, len: 250 },
    { a: 235, len: 210 }, { a: 300, len: 235 },
  ];

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
            <stop offset="0%" stopColor={PORE} stopOpacity={0.6} /><stop offset="100%" stopColor={PORE} stopOpacity={0} />
          </radialGradient>
          <radialGradient id="caveGlow" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor={PORE} stopOpacity={0.14} /><stop offset="100%" stopColor={PORE} stopOpacity={0} />
          </radialGradient>
        </defs>

        <text x={120} y={130} fontSize={46} fontWeight={800} fill={NODE}>What are MOFs used for?</text>
        <rect x={1000} y={92} width={208} height={52} rx={26} fill="rgba(129,140,248,0.28)" stroke={NODE} strokeWidth={3} />
        <text x={1104} y={127} textAnchor="middle" fontSize={25} fontWeight={700} fill={CREAM}>catalysis</text>

        {/* irregular pore cavity — organic blob, not a grid cell */}
        <g opacity={fw}>
          <path
            d={`M ${520 + drift} 160
                C 760 90, 980 170, 1010 400
                C 1040 640, 880 830, 630 850
                C 380 870, 200 700, 190 470
                C 182 290, 320 180, ${520 + drift} 160 Z`}
            fill="url(#caveGlow)"
          />
          <path
            d={`M ${520 + drift} 160
                C 760 90, 980 170, 1010 400
                C 1040 640, 880 830, 630 850
                C 380 870, 200 700, 190 470
                C 182 290, 320 180, ${520 + drift} 160 Z`}
            fill="none" stroke={CREAM} strokeOpacity={0.22} strokeWidth={3} strokeDasharray="2 10"
          />
          <text x={260} y={210} fontSize={26} fill={MUTE}>pore cavity</text>
        </g>

        {/* linkers radiating out to the cavity wall */}
        <g opacity={fw}>
          {linkers.map(({ a, len }, i) => {
            const rad = (a * Math.PI) / 180;
            const ex = CX + len * Math.cos(rad);
            const ey = CY - 70 + len * Math.sin(rad);
            const mx = CX + len * 0.55 * Math.cos(rad);
            const my = CY - 70 + len * 0.55 * Math.sin(rad);
            return (
              <g key={i}>
                <line x1={CX} y1={CY - 70} x2={ex} y2={ey} stroke={CREAM} strokeWidth={5} strokeOpacity={0.75} />
                <circle cx={mx} cy={my} r={9} fill={PORE} fillOpacity={0.8} />
              </g>
            );
          })}
        </g>

        {/* paddlewheel node, close-up */}
        <g opacity={fw}>
          <line x1={CX} y1={CY - 110} x2={CX} y2={CY - 10} stroke="#cbd5e1" strokeWidth={9} />
          <Atom x={CX} y={CY - 110} r={48} g="gCu" />
          <Atom x={CX} y={CY - 10} r={48} g="gCu" />
          <circle cx={S.x} cy={S.y} r={56} fill="url(#ringGlow)" opacity={0.4 + 0.5 * pulse} />
          <circle cx={S.x} cy={S.y} r={23} fill="none" stroke={PORE} strokeWidth={5} strokeDasharray="8 7" opacity={1 - ramp(F, 112, 12) * 0.6} />
        </g>
        <g opacity={siteLbl}>
          <line x1={S.x + 18} y1={S.y - 10} x2={830} y2={330} stroke={MUTE} strokeWidth={2} />
          <text x={840} y={322} fontSize={34} fontWeight={700} fill={PORE}>open metal site</text>
        </g>

        {/* reaction 1 */}
        <g opacity={r1op}>
          <line x1={S.x + 16} y1={S.y - 14} x2={ox - 6} y2={oy + 10} stroke={PORE} strokeWidth={4} strokeDasharray="6 6" opacity={bind} />
          <line x1={ox} y1={oy} x2={cx1} y2={cy1} stroke="#cbd5e1" strokeWidth={5} />
          <line x1={ox + 8} y1={oy + 9} x2={cx1 + 8} y2={cy1 + 9} stroke="#cbd5e1" strokeWidth={5} opacity={dbl} />
          <line x1={cx1} y1={cy1} x2={cx1 + 58} y2={cy1 - 32} stroke={CREAM} strokeWidth={4} />
          <line x1={cx1} y1={cy1} x2={cx1 + 60} y2={cy1 + 34} stroke={CREAM} strokeWidth={4} />
          <circle cx={cx1 + 58} cy={cy1 - 32} r={9} fill={CREAM} />
          <circle cx={cx1 + 60} cy={cy1 + 34} r={9} fill={CREAM} />
          {hBond > 0 && (<g>
            <line x1={cx1} y1={cy1} x2={h1.x} y2={h1.y} stroke="#cbd5e1" strokeWidth={4} />
            <line x1={ox} y1={oy} x2={h2.x} y2={h2.y} stroke="#cbd5e1" strokeWidth={4} />
          </g>)}
          <Atom x={ox} y={oy} r={18} g="gO" />
          <Atom x={cx1} y={cy1} r={22} g="gC" />
          <Atom x={h1.x} y={h1.y} r={13} g="gH" />
          <Atom x={h2.x} y={h2.y} r={13} g="gH" />
          <g opacity={pol}>
            <text x={ox - 54} y={oy + 44} fontSize={30} fontWeight={800} fill="#fca5a5">δ−</text>
            <text x={cx1 - 6} y={cy1 - 36} fontSize={30} fontWeight={800} fill="#93c5fd">δ+</text>
          </g>
        </g>

        {/* reaction 2 */}
        <g opacity={r2op}>
          <line x1={S.x + 16} y1={S.y - 14} x2={aP.x - 6} y2={aP.y + 10} stroke={PORE} strokeWidth={4} strokeDasharray="6 6" opacity={bind2} />
          <line x1={aP.x} y1={aP.y} x2={aP.x - 56} y2={aP.y - 32} stroke={CREAM} strokeWidth={4} />
          <circle cx={aP.x - 56} cy={aP.y - 32} r={9} fill={CREAM} />
          <line x1={bP.x} y1={bP.y} x2={bP.x + 58} y2={bP.y - 30} stroke={CREAM} strokeWidth={4} />
          <circle cx={bP.x + 58} cy={bP.y - 30} r={9} fill={CREAM} />
          <line x1={aP.x} y1={aP.y} x2={aP.x + (bP.x - aP.x) * ccB} y2={aP.y + (bP.y - aP.y) * ccB} stroke={PORE} strokeWidth={9} strokeLinecap="round" opacity={ccB > 0.02 ? 1 : 0} />
          <Atom x={aP.x} y={aP.y} r={22} g="gC" />
          <Atom x={bP.x} y={bP.y} r={22} g="gC" />
        </g>

        {/* right-hand captions */}
        <g opacity={ramp(F, 30, 16) * (1 - lin(F, 210, 224))}>
          <text x={1230} y={600} fontSize={56} fontWeight={800} fill={NODE}>catalytic site</text>
          <text x={1230} y={654} fontSize={36} fill={MUTE}>open metal site = Lewis acid</text>
          <text x={1230} y={704} fontSize={36} fill={CREAM}>binds and activates the reactant</text>
        </g>
        <g opacity={win(F, 70, 216, 14, 12)}>
          <text x={1230} y={820} fontSize={52} fontWeight={800} fill={PORE}>hydrogenation</text>
          <text x={1230} y={874} fontSize={38} fill={CREAM}>C=O + H₂ → C–OH</text>
        </g>
        <g opacity={ramp(F, 220, 14)}>
          <text x={1230} y={600} fontSize={46} fontWeight={800} fill={NODE}>same site, new reaction</text>
          <text x={1230} y={820} fontSize={52} fontWeight={800} fill={PORE}>C–C bond formation</text>
          <text x={1230} y={874} fontSize={38} fill={CREAM}>R–C + C–R′ → R–C–C–R′</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
