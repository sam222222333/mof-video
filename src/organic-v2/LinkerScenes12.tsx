import type { FC } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { BACKDROP_CSS, FONT, PAL } from "../style";

/* ------------------------------------------------------------------------ *
 * ORGANIC LINKERS — scenes 1 + 2 (2-D, chemistry-checked)
 *
 *   local frame 0 = narration 0:00.3   (30 fps), 594 frames (19.8 s)
 *
 *   SCENE 1  0 - 324  "A base is used to deprotonate the acidic proton or
 *                      protons on the linker molecule, creating an anionic
 *                      donor."
 *     R-COOH + B:  ->  R-COO(-) + BH(+)      (carboxylate, both C-O equal)
 *     pyrazole N-H + B:  ->  pyrazolate + BH(+)  (charge on either N)
 *
 *   SCENE 2  324 - 594 "These donors bind to the metal cations with their
 *                      lone pair. A good linker has a rigid core, so the
 *                      nodes remain a fixed distance apart, and the pores
 *                      don't collapse."
 *     donor lone pair -> M(n+)  =  dative (coordinate) bond
 *     rigid (benzene core) vs flexible (alkyl chain) linker, same net
 *
 * Chemistry notes baked into the drawings:
 *   - curly arrows are full-headed = movement of an electron PAIR
 *   - carboxylate: both O drawn and labelled, two resonance forms, one charge
 *   - pyrazole: ring atoms N1(H)-N2 adjacent (1,2-diazole). Resonance forms
 *     move the C=C / C=N double bonds, charge sits on N1 or N2.
 *   - the metal binds the in-plane sp2 lone pair, not the pi system
 *   - bonds are alternating single/double, no stray valences
 * ------------------------------------------------------------------------ */

export const LINKER12_FRAMES = 734;
const DARK = "#0e1322";
const INK = PAL.cream;
const ARROW = PAL.peach;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ramp = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
const lin = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const ease = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });

export type Pt = { x: number; y: number };
export const pt = (x: number, y: number): Pt => ({ x, y });

export const LinkerTitle: FC = () => (
  <text x={120} y={130} fontFamily={FONT} fontSize={46} fontWeight={800} fill={PAL.lilac}>
    ORGANIC LINKERS
  </text>
);

/* ---- drawing primitives ------------------------------------------------ */
const trim = (a: Pt, b: Pt, ta: number, tb: number) => {
  const d = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const ux = (b.x - a.x) / d;
  const uy = (b.y - a.y) / d;
  return { a: pt(a.x + ux * ta, a.y + uy * ta), b: pt(b.x - ux * tb, b.y - uy * tb), ux, uy };
};

export const Bond: FC<{ a: Pt; b: Pt; ta?: number; tb?: number; dbl?: boolean; side?: number; o?: number; w?: number; dash?: string; col?: string }> = ({
  a,
  b,
  ta = 0,
  tb = 0,
  dbl = false,
  side = 1,
  o = 1,
  w = 4,
  dash,
  col = INK,
}) => {
  const t = trim(a, b, ta, tb);
  if (!dbl)
    return <line x1={t.a.x} y1={t.a.y} x2={t.b.x} y2={t.b.y} stroke={col} strokeWidth={w} strokeLinecap="round" opacity={o} strokeDasharray={dash} />;
  const nx = -t.uy * 5 * side;
  const ny = t.ux * 5 * side;
  return (
    <g opacity={o}>
      <line x1={t.a.x - nx} y1={t.a.y - ny} x2={t.b.x - nx} y2={t.b.y - ny} stroke={col} strokeWidth={w} strokeLinecap="round" />
      <line x1={t.a.x + nx} y1={t.a.y + ny} x2={t.b.x + nx} y2={t.b.y + ny} stroke={col} strokeWidth={w} strokeLinecap="round" />
    </g>
  );
};

/** Inner line of a ring double bond, pulled towards the ring centre. */
const RingDouble: FC<{ a: Pt; b: Pt; c: Pt; ta?: number; tb?: number; o?: number }> = ({ a, b, c, ta = 0, tb = 0, o = 1 }) => {
  const t = trim(a, b, ta + 6, tb + 6);
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const d = Math.hypot(c.x - mx, c.y - my) || 1;
  const ox = ((c.x - mx) / d) * 11;
  const oy = ((c.y - my) / d) * 11;
  return <line x1={t.a.x + ox} y1={t.a.y + oy} x2={t.b.x + ox} y2={t.b.y + oy} stroke={INK} strokeWidth={4} strokeLinecap="round" opacity={o} />;
};

export const Atom: FC<{ p: Pt; t: string; o?: number; size?: number; col?: string }> = ({ p, t, o = 1, size = 36, col = INK }) => (
  <text
    x={p.x}
    y={p.y + size * 0.35}
    textAnchor="middle"
    fontFamily={FONT}
    fontSize={size}
    fontWeight={500}
    fill={col}
    stroke={DARK}
    strokeWidth={8}
    paintOrder="stroke"
    opacity={o}
  >
    {t}
  </text>
);

const Charge: FC<{ p: Pt; sign: "-" | "+"; o?: number; col?: string }> = ({ p, sign, o = 1, col = ARROW }) => (
  <g opacity={o}>
    <circle cx={p.x} cy={p.y} r={12} fill={DARK} stroke={col} strokeWidth={2.5} />
    <line x1={p.x - 6} y1={p.y} x2={p.x + 6} y2={p.y} stroke={col} strokeWidth={2.5} />
    {sign === "+" && <line x1={p.x} y1={p.y - 6} x2={p.x} y2={p.y + 6} stroke={col} strokeWidth={2.5} />}
  </g>
);

const LonePair: FC<{ p: Pt; dir: number; o?: number; col?: string }> = ({ p, dir, o = 1, col = INK }) => {
  // two dots perpendicular to direction `dir` (radians), centred on p
  const nx = -Math.sin(dir) * 6;
  const ny = Math.cos(dir) * 6;
  return (
    <g opacity={o} fill={col}>
      <circle cx={p.x + nx} cy={p.y + ny} r={3.6} />
      <circle cx={p.x - nx} cy={p.y - ny} r={3.6} />
    </g>
  );
};

/** Full-headed curly arrow (electron PAIR), drawn on progress p in 0..1. */
const Curly: FC<{ a: Pt; c: Pt; b: Pt; p: number; o?: number }> = ({ a, c, b, p, o = 1 }) => {
  if (p <= 0.001) return null;
  const d = `M ${a.x} ${a.y} Q ${c.x} ${c.y} ${b.x} ${b.y}`;
  const ang = Math.atan2(b.y - c.y, b.x - c.x);
  const hx = b.x;
  const hy = b.y;
  const head = [
    [hx, hy],
    [hx - 16 * Math.cos(ang - 0.42), hy - 16 * Math.sin(ang - 0.42)],
    [hx - 16 * Math.cos(ang + 0.42), hy - 16 * Math.sin(ang + 0.42)],
  ]
    .map((q) => q.join(","))
    .join(" ");
  return (
    <g opacity={o}>
      <path d={d} fill="none" stroke={ARROW} strokeWidth={4.5} strokeLinecap="round" pathLength={1} strokeDasharray={`${p} 1`} />
      {p > 0.97 && <polygon points={head} fill={ARROW} />}
    </g>
  );
};

export const Metal: FC<{ p: Pt; o?: number; r?: number; label?: string; sup?: string }> = ({ p, o = 1, r = 38, label = "M", sup = "n+" }) => (
  <g opacity={o}>
    <circle cx={p.x} cy={p.y} r={r} fill="#312e81" stroke={PAL.lilac} strokeWidth={3} />
    <text x={p.x - 4} y={p.y + 10} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={700} fill={PAL.white}>
      {label}
      <tspan dy={-14} fontSize={18}>
        {sup}
      </tspan>
    </text>
  </g>
);

/* ---- carboxyl group ---------------------------------------------------- */
type CForm = "acid" | "f1" | "f2";
const carbPts = (cx: number, cy: number) => ({
  C: pt(cx, cy),
  R: pt(cx - 76, cy + 44),
  Oc: pt(cx, cy - 88),
  Od: pt(cx + 76, cy + 44),
});

export const Carb: FC<{ cx: number; cy: number; form: CForm; o?: number; hOff?: number; showH?: boolean; mix?: number }> = ({
  cx,
  cy,
  form,
  o = 1,
  hOff = 0,
  showH = true,
  mix = 1,
}) => {
  const { C, R, Oc, Od } = carbPts(cx, cy);
  const H = pt(Od.x + 78 + hOff, Od.y);
  const topDouble = form !== "f2";
  const dnDouble = form === "f2";
  return (
    <g opacity={o}>
      <Atom p={R} t="R" size={34} col={INK} />
      <Bond a={R} b={C} ta={18} tb={0} />
      <Bond a={C} b={Oc} tb={22} dbl={topDouble} side={1} />
      <Bond a={C} b={Od} tb={22} dbl={dnDouble} side={-1} />
      <Atom p={Oc} t="O" />
      <Atom p={Od} t="O" />
      {form === "acid" && showH && (
        <>
          <Bond a={Od} b={H} ta={22} tb={20} o={mix} />
          <Atom p={H} t="H" col={PAL.peach} size={34} />
        </>
      )}
      {form === "f1" && <Charge p={pt(Od.x + 30, Od.y - 22)} sign="-" o={mix} />}
      {form === "f2" && <Charge p={pt(Oc.x + 30, Oc.y - 22)} sign="-" o={mix} />}
    </g>
  );
};

/* ---- pyrazole / pyrazolate ---------------------------------------------- */
type PForm = "pzH" | "a" | "b";
const RR = 74;
const ring = (cx: number, cy: number) =>
  [-90, -18, 54, 126, 198].map((d) => pt(cx + RR * Math.cos((d * Math.PI) / 180), cy + RR * Math.sin((d * Math.PI) / 180)));
// P0 = N2 (top), P1 = N1 (upper right), P2 = C5, P3 = C4, P4 = C3

export const Pyz: FC<{ cx: number; cy: number; form: PForm; o?: number; hOff?: number; showH?: boolean; mix?: number }> = ({
  cx,
  cy,
  form,
  o = 1,
  hOff = 0,
  showH = true,
  mix = 1,
}) => {
  const P = ring(cx, cy);
  const c = pt(cx, cy);
  const isN = (i: number) => i === 0 || i === 1;
  const edge = (i: number, j: number) => ({ a: P[i], b: P[j], ta: isN(i) ? 22 : 0, tb: isN(j) ? 22 : 0 });
  // double bonds per form
  const dbl: [number, number][] = form === "b" ? [[1, 2], [3, 4]] : [[0, 4], [3, 2]];
  const all: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]];
  const isDbl = (i: number, j: number) => dbl.some(([a, b]) => (a === i && b === j) || (a === j && b === i));
  const out = pt(Math.cos((-18 * Math.PI) / 180), Math.sin((-18 * Math.PI) / 180));
  const H = pt(P[1].x + out.x * (78 + hOff), P[1].y + out.y * (78 + hOff));
  return (
    <g opacity={o}>
      {all.map(([i, j]) => {
        const e = edge(i, j);
        return (
          <g key={`${i}${j}`}>
            <Bond a={e.a} b={e.b} ta={e.ta} tb={e.tb} />
            {isDbl(i, j) && <RingDouble a={e.a} b={e.b} c={c} ta={e.ta} tb={e.tb} />}
          </g>
        );
      })}
      <Atom p={P[0]} t="N" />
      <Atom p={P[1]} t="N" />
      {form === "pzH" && showH && (
        <>
          <Bond a={P[1]} b={H} ta={22} tb={20} o={mix} />
          <Atom p={H} t="H" col={PAL.peach} size={34} />
        </>
      )}
      {form === "a" && <Charge p={pt(P[1].x + out.x * 36, P[1].y + out.y * 36)} sign="-" o={mix} />}
      {form === "b" && <Charge p={pt(P[0].x - 30, P[0].y - 24)} sign="-" o={mix} />}
    </g>
  );
};

/* ---- shared layout bits -------------------------------------------------- */
type SubItem = { a: number; b: number; text: string };
const Sub: FC<{ f: number; items: SubItem[] }> = ({ f, items }) => (
  <g>
    {items.map((it, i) => (
      <text key={i} x={120} y={190} fontFamily={FONT} fontSize={30} fontWeight={700} fill={PAL.cream} opacity={ramp(f, it.a, it.a + 14) * (1 - ramp(f, it.b - 14, it.b))}>
        {it.text}
      </text>
    ))}
  </g>
);
const Chip: FC<{ x: number; y: number; w: number; text: string; o: number; size?: number }> = ({ x, y, w, text, o, size = 32 }) => (
  <g opacity={o} transform={`translate(0,${(1 - o) * 12})`}>
    <rect x={x - w / 2} y={y - 48} width={w} height={74} rx={18} fill="rgba(165,180,252,0.10)" stroke="rgba(165,180,252,0.4)" strokeWidth={1.5} />
    <text x={x} y={y + 2} textAnchor="middle" fontFamily={FONT} fontSize={size} fontWeight={700} fill={PAL.white}>
      {text}
    </text>
  </g>
);
const Lbl: FC<{ x: number; y: number; text: string; o: number; size?: number; col?: string; weight?: number }> = ({ x, y, text, o, size = 26, col = PAL.mute, weight = 500 }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontSize={size} fontWeight={weight} fill={col} opacity={o}>
    {text}
  </text>
);

/* =============================== SCENE 1 ================================== */
const AX = 430; // acid C position
const AY = 470;
const PX = 1400; // pyrazole centre
const PY = 470;

const Deprotonation: FC<{ f: number }> = ({ f }) => {
  const oIn = ramp(f, 14, 46);
  const oBase = ramp(f, 78, 100);
  const pArrow1 = lin(f, 108, 136);
  const pArrow2 = lin(f, 132, 154);
  const move = ease(f, 158, 190); // H travels to the base
  const done = f >= 192;
  const oArrows = 1 - ramp(f, 190, 206);
  const oRow2 = ramp(f, 204, 232);
  const oRes = ramp(f, 222, 246);

  // carboxylic acid panel
  const cp = carbPts(AX, AY);
  const hAcid = pt(cp.Od.x + 78, cp.Od.y);
  const baseA = pt(hAcid.x + 150, hAcid.y);
  const hTargetA = pt(baseA.x - 40, baseA.y);
  const hPosA = pt(hAcid.x + (hTargetA.x - hAcid.x) * move, hAcid.y);

  // pyrazole panel
  const Pp = ring(PX, PY);
  const outv = pt(Math.cos((-18 * Math.PI) / 180), Math.sin((-18 * Math.PI) / 180));
  const hPz = pt(Pp[1].x + outv.x * 78, Pp[1].y + outv.y * 78);
  const baseP = pt(hPz.x + 150, hPz.y - 4);
  const hTargetP = pt(baseP.x - 40, baseP.y);
  const hPosP = pt(hPz.x + (hTargetP.x - hPz.x) * move, hPz.y + (hTargetP.y - hPz.y) * move);

  const bondFade = 1 - ramp(f, 158, 174);
  const chargeIn = ramp(f, 184, 204);

  return (
    <g>
      <Sub
        f={f}
        items={[
          { a: 0, b: 86, text: "Acidic linkers" },
          { a: 86, b: 999, text: "Deprotonation makes the anionic donor" },
        ]}
      />
      {/* divider */}
      <line x1={960} y1={250} x2={960} y2={880} stroke="rgba(165,180,252,0.25)" strokeWidth={2} />

      {/* ---------- left: carboxylic acid -> carboxylate ---------- */}
      <Lbl x={570} y={262} text="carboxylic acid" o={oIn} size={30} col={PAL.peach} weight={700} />
      <g opacity={oIn}>
        {/* acid form: O-H bond fades, then it is a carboxylate (f1) */}
        {!done ? (
          <Carb cx={AX} cy={AY} form="acid" showH={false} mix={bondFade} />
        ) : (
          <Carb cx={AX} cy={AY} form="f1" mix={chargeIn} />
        )}
        {!done && <Bond a={cp.Od} b={hAcid} ta={22} tb={20} o={bondFade} />}
        {!done && <Atom p={hPosA} t="H" col={PAL.peach} size={34} />}
      </g>
      {/* base */}
      <g opacity={oBase}>
        {!done ? (
          <>
            <Atom p={baseA} t="B" size={38} col={PAL.lilac} />
            <LonePair p={pt(baseA.x - 28, baseA.y - 2)} dir={0} />
          </>
        ) : (
          <>
            <Atom p={baseA} t="BH" size={38} col={PAL.lilac} />
            <Charge p={pt(baseA.x + 40, baseA.y - 24)} sign="+" col={PAL.lilac} o={chargeIn} />
          </>
        )}
        <Lbl x={baseA.x} y={baseA.y + 58} text={done ? "conjugate acid" : "base"} o={1} size={22} />
      </g>
      {/* curly arrows */}
      <g opacity={oArrows}>
        <Curly a={pt(baseA.x - 28, baseA.y - 16)} c={pt((baseA.x + hAcid.x) / 2 + 6, baseA.y - 92)} b={pt(hAcid.x + 6, hAcid.y - 22)} p={pArrow1} />
        <Curly a={pt((cp.Od.x + hAcid.x) / 2, cp.Od.y - 6)} c={pt(cp.Od.x + 26, cp.Od.y - 52)} b={pt(cp.Od.x + 10, cp.Od.y - 24)} p={pArrow2} />
      </g>
      <Lbl x={hAcid.x} y={cp.Od.y + 70} text="acidic H" o={ramp(f, 50, 68) * (1 - ramp(f, 108, 124))} size={24} col={PAL.peach} weight={700} />

      {/* ---------- right: pyrazole -> pyrazolate ---------- */}
      <Lbl x={1440} y={262} text="pyrazole (N–H)" o={oIn} size={30} col={PAL.peach} weight={700} />
      <g opacity={oIn}>
        {!done ? (
          <Pyz cx={PX} cy={PY} form="pzH" showH={false} />
        ) : (
          <Pyz cx={PX} cy={PY} form="a" mix={chargeIn} />
        )}
        {!done && <Bond a={Pp[1]} b={hPz} ta={22} tb={20} o={bondFade} />}
        {!done && <Atom p={hPosP} t="H" col={PAL.peach} size={34} />}
      </g>
      <g opacity={oBase}>
        {!done ? (
          <>
            <Atom p={baseP} t="B" size={38} col={PAL.lilac} />
            <LonePair p={pt(baseP.x - 28, baseP.y - 2)} dir={0} />
          </>
        ) : (
          <>
            <Atom p={baseP} t="BH" size={38} col={PAL.lilac} />
            <Charge p={pt(baseP.x + 40, baseP.y - 24)} sign="+" col={PAL.lilac} o={chargeIn} />
          </>
        )}
        <Lbl x={baseP.x} y={baseP.y + 58} text={done ? "conjugate acid" : "base"} o={1} size={22} />
      </g>
      <g opacity={oArrows}>
        <Curly a={pt(baseP.x - 28, baseP.y - 18)} c={pt((baseP.x + hPz.x) / 2 + 6, baseP.y - 96)} b={pt(hPz.x + 4, hPz.y - 24)} p={pArrow1} />
        <Curly a={pt((Pp[1].x + hPz.x) / 2, (Pp[1].y + hPz.y) / 2 - 6)} c={pt(Pp[1].x + 22, Pp[1].y - 58)} b={pt(Pp[1].x + 6, Pp[1].y - 26)} p={pArrow2} />
      </g>
      <Lbl x={hPz.x + 8} y={hPz.y - 52} text="acidic H" o={ramp(f, 50, 68) * (1 - ramp(f, 108, 124))} size={24} col={PAL.peach} weight={700} />

      {/* ---------- row 2: resonance of the anions ---------- */}
      <g opacity={oRow2}>
        <Carb cx={330} cy={780} form="f1" />
        <text x={520} y={800} textAnchor="middle" fontFamily={FONT} fontSize={44} fill={PAL.mute}>
          ↔
        </text>
        <Carb cx={640} cy={780} form="f2" />
        <Lbl x={500} y={896} text="carboxylate: both C–O bonds equivalent, charge shared by both O" o={oRes} size={23} />

        <Pyz cx={1230} cy={780} form="a" />
        <text x={1400} y={800} textAnchor="middle" fontFamily={FONT} fontSize={44} fill={PAL.mute}>
          ↔
        </text>
        <Pyz cx={1570} cy={780} form="b" />
        <Lbl x={1400} y={896} text="pyrazolate: charge on either N (delocalised in the ring)" o={oRes} size={23} />
      </g>

      <Chip x={960} y={985} w={820} text="removing H⁺ gives an anionic donor" o={ramp(f, 238, 260)} />
    </g>
  );
};

/* =============================== SCENE 2 ================================== */
/* rigid vs flexible node-linker-node square */
const Panel: FC<{ cx: number; cy: number; a: number; theta: number; flexible: boolean; o: number; collapsed: number }> = ({
  cx,
  cy,
  a,
  theta,
  flexible,
  o,
  collapsed,
}) => {
  const v1 = pt(a, 0);
  const v2 = pt(a * Math.cos(theta), -a * Math.sin(theta));
  const raw = [pt(0, 0), v1, pt(v1.x + v2.x, v1.y + v2.y), v2];
  const mx = raw.reduce((s, p) => s + p.x, 0) / 4;
  const my = raw.reduce((s, p) => s + p.y, 0) / 4;
  const N = raw.map((p) => pt(cx + p.x - mx, cy + p.y - my));
  const edges: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 0]];

  const linker = (p: Pt, q: Pt, k: number) => {
    const len = Math.hypot(q.x - p.x, q.y - p.y);
    const ux = (q.x - p.x) / len;
    const uy = (q.y - p.y) / len;
    const nx = -uy;
    const ny = ux;
    if (!flexible) {
      // benzene core in the middle: hexagon pointing along the axis
      const m = pt((p.x + q.x) / 2, (p.y + q.y) / 2);
      const r = 30;
      const hex = Array.from({ length: 6 }).map((_, i) => {
        const ang = (i * Math.PI) / 3;
        const lx = Math.cos(ang) * r;
        const ly = Math.sin(ang) * r;
        return pt(m.x + lx * ux - ly * uy, m.y + lx * uy + ly * ux);
      });
      return (
        <g key={k}>
          <line x1={p.x} y1={p.y} x2={hex[3].x} y2={hex[3].y} stroke={INK} strokeWidth={4} />
          <line x1={hex[0].x} y1={hex[0].y} x2={q.x} y2={q.y} stroke={INK} strokeWidth={4} />
          <polygon points={hex.map((h) => `${h.x},${h.y}`).join(" ")} fill="rgba(129,140,248,0.18)" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
          {[0, 2, 4].map((i) => {
            const h1 = hex[i];
            const h2 = hex[(i + 1) % 6];
            const mid = pt((h1.x + h2.x) / 2, (h1.y + h2.y) / 2);
            const dx = (m.x - mid.x) * 0.3;
            const dy = (m.y - mid.y) * 0.3;
            return <line key={i} x1={h1.x + dx} y1={h1.y + dy} x2={h2.x + dx} y2={h2.y + dy} stroke={INK} strokeWidth={2.5} />;
          })}
        </g>
      );
    }
    // flexible alkyl chain: zig-zag
    const seg = 9;
    const pts: Pt[] = [];
    for (let i = 0; i <= seg; i++) {
      const t = i / seg;
      const off = i === 0 || i === seg ? 0 : (i % 2 ? 1 : -1) * 16;
      pts.push(pt(p.x + (q.x - p.x) * t + nx * off, p.y + (q.y - p.y) * t + ny * off));
    }
    return <polyline key={k} points={pts.map((s) => `${s.x},${s.y}`).join(" ")} fill="none" stroke={INK} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" />;
  };

  const poreArea = a * a * Math.sin(theta);
  const poreO = clamp(poreArea / (a * a));
  return (
    <g opacity={o}>
      <polygon points={N.map((p) => `${p.x},${p.y}`).join(" ")} fill={`rgba(253,186,116,${0.16 * poreO})`} />
      {edges.map(([i, j], k) => linker(N[i], N[j], k))}
      {N.map((p, i) => (
        <rect key={i} x={p.x - 20} y={p.y - 20} width={40} height={40} rx={7} fill="#312e81" stroke={PAL.lilac} strokeWidth={3} />
      ))}
      <text x={(N[0].x + N[2].x) / 2} y={(N[0].y + N[2].y) / 2 + 8} textAnchor="middle" fontFamily={FONT} fontSize={26} fontWeight={700} fill={PAL.peach} opacity={clamp(poreO * 1.4 - 0.2)}>
        pore
      </text>
      {flexible && collapsed > 0 && (
        <g opacity={collapsed}>
          <line x1={cx - 30} y1={cy - 200} x2={cx + 30} y2={cy - 140} stroke="#f87171" strokeWidth={7} strokeLinecap="round" />
          <line x1={cx + 30} y1={cy - 200} x2={cx - 30} y2={cy - 140} stroke="#f87171" strokeWidth={7} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};

const Binding: FC<{ f: number }> = ({ f }) => {
  // f is local to scene 2 (0 = global 324)
  const oBind = ramp(f, 6, 30) * (1 - ramp(f, 266, 288));
  const pA1 = lin(f, 40, 84); // first donor of each linker
  const pA2 = lin(f, 128, 172); // second donor of each linker
  const bond1 = ramp(f, 84, 104);
  const bond2 = ramp(f, 172, 192);
  const oLbl = ramp(f, 100, 120);
  const oLbl2 = ramp(f, 196, 220);
  const oPanels = ramp(f, 284, 310);
  const theta = 90 - 58 * ease(f, 310, 360);
  const th = (theta * Math.PI) / 180;
  const collapsed = ramp(f, 350, 368);

  // carboxylate (left): each O binds its OWN metal
  const Cx = 300;
  const Cy = 470;
  const cp = carbPts(Cx, Cy);
  const M1c = pt(cp.Oc.x + 270, cp.Oc.y - 24);
  const M2c = pt(cp.Od.x + 270, cp.Od.y + 40);
  // pyrazolate (right): each N binds its OWN metal (lone pairs point outwards, 72 deg apart)
  const Px = 1250;
  const Py = 700;
  const Pp = ring(Px, Py);
  const outN = pt(Math.cos((-18 * Math.PI) / 180), Math.sin((-18 * Math.PI) / 180));
  const M1p = pt(Pp[0].x - 20, Pp[0].y - 200);
  const M2p = pt(Pp[1].x + outN.x * 215, Pp[1].y + outN.y * 215);
  const qa = (a: Pt, m: Pt) => pt((a.x + m.x) / 2, Math.min(a.y, m.y) - 50);

  return (
    <g>
      <Sub
        f={f}
        items={[
          { a: 0, b: 284, text: "Each donor atom binds its own metal through a lone pair" },
        ]}
      />
      <g opacity={oBind}>
        <line x1={960} y1={250} x2={960} y2={880} stroke="rgba(165,180,252,0.25)" strokeWidth={2} />
        {/* carboxylate: O(top) -> M1, O(bottom) -> M2 */}
        <Lbl x={520} y={262} text="carboxylate" o={1} size={30} col={PAL.peach} weight={700} />
        <Carb cx={Cx} cy={Cy} form="f1" mix={1 - bond2} />
        <LonePair p={pt(cp.Oc.x + 30, cp.Oc.y)} dir={0} o={1 - bond1} />
        <LonePair p={pt(cp.Od.x + 30, cp.Od.y + 2)} dir={0} o={1 - bond2} />
        <Metal p={M1c} />
        <Metal p={M2c} />
        <Curly a={pt(cp.Oc.x + 38, cp.Oc.y - 6)} c={pt((cp.Oc.x + M1c.x) / 2, cp.Oc.y - 62)} b={pt(M1c.x - 44, M1c.y - 14)} p={pA1} o={1 - bond1} />
        <Curly a={pt(cp.Od.x + 38, cp.Od.y + 6)} c={pt((cp.Od.x + M2c.x) / 2, cp.Od.y + 62)} b={pt(M2c.x - 44, M2c.y + 14)} p={pA2} o={1 - bond2} />
        <Bond a={cp.Oc} b={pt(M1c.x - 38, M1c.y)} ta={22} tb={0} w={4} col={PAL.lilac} dash="9 7" o={bond1} />
        <Bond a={cp.Od} b={pt(M2c.x - 38, M2c.y)} ta={22} tb={0} w={4} col={PAL.lilac} dash="9 7" o={bond2} />

        {/* pyrazolate: N(top) -> M1, N(right) -> M2 */}
        <Lbl x={1400} y={262} text="pyrazolate" o={1} size={30} col={PAL.peach} weight={700} />
        <Pyz cx={Px} cy={Py} form="a" mix={1 - bond2} />
        <LonePair p={pt(Pp[0].x, Pp[0].y - 34)} dir={Math.PI / 2} o={1 - bond1} />
        <LonePair p={pt(Pp[1].x + outN.x * 34, Pp[1].y + outN.y * 34)} dir={(-18 * Math.PI) / 180} o={1 - bond2} />
        <Metal p={M1p} />
        <Metal p={M2p} />
        <Curly a={pt(Pp[0].x + 14, Pp[0].y - 38)} c={pt(Pp[0].x + 46, (Pp[0].y + M1p.y) / 2)} b={pt(M1p.x + 14, M1p.y + 46)} p={pA1} o={1 - bond1} />
        <Curly a={pt(Pp[1].x + 30, Pp[1].y - 26)} c={pt((Pp[1].x + M2p.x) / 2 + 10, (Pp[1].y + M2p.y) / 2 - 56)} b={pt(M2p.x - 30, M2p.y + 30)} p={pA2} o={1 - bond2} />
        <Bond a={Pp[0]} b={pt(M1p.x + 4, M1p.y + 38)} ta={22} tb={0} w={4} col={PAL.lilac} dash="9 7" o={bond1} />
        <Bond a={Pp[1]} b={pt(M2p.x - 28, M2p.y + 26)} ta={22} tb={0} w={4} col={PAL.lilac} dash="9 7" o={bond2} />

        <Lbl x={520} y={826} text="each O lone pair → empty orbital on its own Mⁿ⁺" o={oLbl} size={24} />
        <Lbl x={1400} y={826} text="each in-plane N lone pair → its own Mⁿ⁺" o={oLbl} size={24} />
        <Lbl x={960} y={874} text="the linker bridges two metals, linking the nodes into a framework" o={oLbl2} size={26} col={PAL.peach} weight={700} />
      </g>
      <Chip x={960} y={985} w={900} text="dative bond: both electrons come from the donor" o={ramp(f, 108, 128) * (1 - ramp(f, 266, 286))} />

      {/* rigid vs flexible */}
      <g opacity={oPanels}>
        <line x1={960} y1={250} x2={960} y2={880} stroke="rgba(165,180,252,0.25)" strokeWidth={2} />
        <Lbl x={510} y={262} text="rigid core" o={1} size={30} col={PAL.peach} weight={700} />
        <Lbl x={1410} y={262} text="flexible chain" o={1} size={30} col={PAL.peach} weight={700} />
        <Panel cx={510} cy={560} a={250} theta={Math.PI / 2} flexible={false} o={1} collapsed={0} />
        <Panel cx={1410} cy={560} a={250} theta={th} flexible={true} o={1} collapsed={collapsed} />
        <Lbl x={510} y={800} text="benzene ring: nodes stay a fixed distance" o={ramp(f, 290, 308)} size={24} />
        <Lbl x={1410} y={800} text="alkyl chain can fold: the framework can collapse" o={ramp(f, 328, 348)} size={24} />
        <Lbl x={510} y={836} text="pore stays open" o={ramp(f, 302, 320)} size={26} col="#86efac" weight={700} />
        <Lbl x={1410} y={836} text="pore lost" o={collapsed} size={26} col="#f87171" weight={700} />
        <Lbl x={960} y={1034} text="simplified: M = metal node, ring = benzene core, zig-zag = alkyl chain" o={ramp(f, 304, 328) * 0.95} size={21} />
      </g>
    </g>
  );
};

/* ============================== COMPOSITE ================================= */
export const LinkerScenes12: FC<{ frame: number }> = ({ frame }) => {
  const oA = 1 - ramp(frame, 316, 334);
  const oB = ramp(frame, 320, 338);
  return (
    <g>
      {frame < 340 && (
        <g opacity={oA}>
          <Deprotonation f={frame} />
        </g>
      )}
      {frame >= 316 && (
        <g opacity={oB}>
          <Binding f={frame - 324} />
        </g>
      )}
    </g>
  );
};

export const LinkerScenes12Preview: FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: BACKDROP_CSS, fontFamily: FONT }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <LinkerTitle />
        <LinkerScenes12 frame={frame} />
      </svg>
    </AbsoluteFill>
  );
};
