import type { FC } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { FONT, PAL, BACKDROP_CSS } from "../style";

/* ------------------------------------------------------------------------ *
 * §5 ORGANIC — the linker is the tuneable half  (02:40 – 03:05, 25 s)
 *
 * Every statement on screen comes from the group's organic chemistry notes,
 * transcribed in ZAID-NOTES.md. Nothing is added beyond that slide:
 *   - carboxylates and N-heterocycles are anionic donors, made by deprotonation
 *   - a good linker needs a rigid core, a defined geometry, and the right length
 *   - 1,4 = linear 180°, 1,3,5 = trigonal 120°
 *   - longer linker -> bigger pore; short = terephthalate/UiO-66, long =
 *     biphenyl-4,4'-dicarboxylate/UiO-67
 *
 * Deliberately 2D: this is structure notation, not a scene.
 * ------------------------------------------------------------------------ */

const C = {
  bg: "#0a0d14",
  accent: PAL.lilac,
  cyan: PAL.peach,
  text: PAL.cream,
  body: "#cfc9be",
  muted: PAL.mute,
  warm: PAL.peach,
  green: "#3fbf7f",
} as const;

const ramp = (frame: number, start: number, dur = 18): number =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

/** hexagon vertices, vertex 0 at the top */
const ring = (cx: number, cy: number, r: number, rot = -Math.PI / 2): [number, number][] =>
  Array.from({ length: 6 }, (_, k) => {
    const a = rot + (k * Math.PI) / 3;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as [number, number];
  });

const pathOf = (pts: [number, number][]) =>
  `M ${pts.map((p) => p.join(" ")).join(" L ")} Z`;

/** benzene ring + carboxylate groups on the given vertex indices */
const Linker: FC<{
  cx: number;
  cy: number;
  r: number;
  at: number[];
  progress: number;
  color?: string;
  rot?: number;
}> = ({ cx, cy, r, at, progress, color = C.body, rot }) => {
  const pts = ring(cx, cy, r, rot);
  return (
    <g opacity={progress}>
      <path d={pathOf(pts)} fill="none" stroke={color} strokeWidth={3} strokeLinejoin="round" />
      {at.map((k) => {
        const p = pts[k] ?? pts[0];
        const dx = p[0] - cx;
        const dy = p[1] - cy;
        const l = Math.hypot(dx, dy) || 1;
        const ux = dx / l;
        const uy = dy / l;
        const ex = p[0] + ux * 46 * progress;
        const ey = p[1] + uy * 46 * progress;
        return (
          <g key={k}>
            <line x1={p[0]} y1={p[1]} x2={ex} y2={ey} stroke={color} strokeWidth={3} />
            <text
              x={ex + ux * 18}
              y={ey + uy * 16 + 8}
              textAnchor={ux > 0.25 ? "start" : ux < -0.25 ? "end" : "middle"}
              fontSize={26}
              fill={C.accent}
            >
              {"CO\u2082\u207B"}
            </text>
          </g>
        );
      })}
    </g>
  );
};


/* ------------------------------------------------------------------------ *
 * Act D, rebuilt after watching the team's work.
 *
 * It used to be two finished pictures side by side — terephthalate on the left,
 * biphenyl on the right — and the viewer had to spot the difference. Their
 * "stretch the linker" beat does it as one continuous move instead: the ring
 * count grows, and the two nodes are pushed apart by the growth, so the pore
 * between them opens up in the same gesture. That is the actual claim from
 * the same notes ("longer linker, bigger pore"), shown rather than compared.
 *
 * Stopped at two rings on purpose: terephthalate -> biphenyl is what the notes
 * cover. A third ring would be terphenyl, which is outside them.
 * ------------------------------------------------------------------------ */

const LengtheningLinker: FC<{ frame: number }> = ({ frame }) => {
  const build = ramp(frame, 618, 18);
  const grow = interpolate(frame, [648, 722], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  const cx = 960;
  const cy = 420;
  const ringR = 56;
  const sep = 48 * grow;
  const span = 330 + 200 * grow;
  const x1 = cx - span / 2;
  const x2 = cx + span / 2;

  const ringA = ring(cx - sep, cy, ringR, 0);
  const ringB = ring(cx + sep, cy, ringR, 0);
  const poreR = 46 + 44 * grow;

  const pale = 1 - Math.min(1, grow * 2);

  return (
    <g opacity={build}>
      {/* the two nodes the linker bridges — they are what the pore sits between */}
      {[x1, x2].map((x, i) => (
        <circle key={`node${i}`} cx={x} cy={cy} r={26} fill={PAL.indigo} stroke={PAL.lilac} strokeWidth={2.5} />
      ))}

      {/* carboxylate stems out to the nodes */}
      {[
        { from: [cx - sep - ringR, cy], to: x1 + 26 },
        { from: [cx + sep + ringR, cy], to: x2 - 26 },
      ].map((st, i) => (
        <line
          key={`stem${i}`}
          x1={st.from[0]}
          y1={st.from[1]}
          x2={st.to}
          y2={cy}
          stroke={PAL.cream}
          strokeWidth={3}
          strokeLinecap="round"
        />
      ))}

      {/* first ring, always there */}
      <path d={pathOf(ringA)} fill="none" stroke={PAL.cream} strokeWidth={3} strokeLinejoin="round" />

      {/* second ring grows in, and a bond appears between the two */}
      {grow > 0.02 ? (
        <>
          <path
            d={pathOf(ringB)}
            fill="none"
            stroke={PAL.cream}
            strokeWidth={3}
            strokeLinejoin="round"
            opacity={Math.min(1, grow * 1.6)}
          />
          <line
            x1={cx - sep + ringR}
            y1={cy}
            x2={cx + sep - ringR}
            y2={cy}
            stroke={PAL.cream}
            strokeWidth={3}
            opacity={Math.min(1, grow * 1.6)}
          />
        </>
      ) : null}

      {/* the pore the linker has to span */}
      <circle cx={cx} cy={cy + 250} r={poreR} fill="none" stroke={PAL.mute} strokeWidth={2} strokeDasharray="5 6" />

      {/* labels cross-fade with the structure */}
      <g opacity={pale}>
        <text x={cx} y={cy + 360} textAnchor="middle" fontSize={30} fill={PAL.cream}>
          terephthalate
        </text>
        <text x={cx} y={cy + 400} textAnchor="middle" fontSize={24} fill={PAL.mute}>
          {"UiO-66 · smaller pore"}
        </text>
      </g>
      <g opacity={grow}>
        <text x={cx} y={cy + 360} textAnchor="middle" fontSize={30} fill={PAL.cream}>
          {"biphenyl-4,4′-dicarboxylate"}
        </text>
        <text x={cx} y={cy + 400} textAnchor="middle" fontSize={24} fill={PAL.mute}>
          {"UiO-67 · bigger pore"}
        </text>
      </g>
    </g>
  );
};

/* ---------------------------------- figure -------------------------------- */

export const OrganicLinkers: FC = () => {
  const frame = useCurrentFrame();

  const fadeOut = interpolate(frame, [730, 750], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const actA = interpolate(frame, [0, 20, 165, 190], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const actB = interpolate(frame, [180, 205, 405, 430], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const actC = interpolate(frame, [420, 445, 590, 615], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const actD = ramp(frame, 605, 24);

  return (
    <AbsoluteFill style={{ background: BACKDROP_CSS, opacity: fadeOut }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ fontFamily: FONT }}>
        {/* ------------------------------ A: two families ------------------------------ */}
        <g opacity={actA}>
          <text x={120} y={130} fontSize={46} fill={PAL.lilac} fontWeight={800}>
            THE LINKER IS THE ORGANIC HALF
          </text>

          <g opacity={ramp(frame, 20, 18)}>
            <text x={120} y={330} fontSize={34} fill={C.warm} fontWeight={600}>
              {"carboxylate"}
            </text>
            <text x={120} y={390} fontSize={38} fill={C.text}>
              {"RCO\u2082H  \u2192  RCO\u2082\u207B  +  H\u207A"}
            </text>
            <text x={120} y={432} fontSize={24} fill={C.muted}>
              {"from a carboxylic acid"}
            </text>
          </g>

          <g opacity={ramp(frame, 58, 18)}>
            <text x={120} y={540} fontSize={34} fill={C.cyan} fontWeight={600}>
              {"N-heterocycle (imidazole)"}
            </text>
            <text x={120} y={600} fontSize={38} fill={C.text}>
              {"N\u2013H  \u2192  N\u207B  +  H\u207A"}
            </text>
            <text x={120} y={642} fontSize={24} fill={C.muted}>
              {"the imidazolate linker family"}
            </text>
          </g>

          <g opacity={ramp(frame, 100, 20)}>
            <text x={120} y={760} fontSize={32} fill={C.body}>
              {"a base removes the acidic H \u2014 the linker becomes an anionic donor"}
            </text>
            <text x={120} y={812} fontSize={32} fill={C.body}>
              {"and binds metal cations through its lone pairs"}
            </text>
          </g>

          {/* the two donor atoms, drawn */}
          <g opacity={ramp(frame, 40, 20)} transform="translate(1250, 400)">
            <circle cx={40} cy={60} r={9} fill={C.accent} />
            <text x={62} y={68} fontSize={26} fill={C.body}>
              O{"\u207B"}
            </text>
            <text x={0} y={-20} fontSize={22} fill={C.muted}>
              carboxylate: O donor
            </text>
          </g>
          <g opacity={ramp(frame, 78, 20)} transform="translate(1250, 600)">
            <circle cx={40} cy={60} r={9} fill={C.cyan} />
            <text x={62} y={68} fontSize={26} fill={C.body}>
              N{"\u207B"}
            </text>
            <text x={0} y={-20} fontSize={22} fill={C.muted}>
              imidazolate: N donor
            </text>
          </g>
        </g>

        {/* ---------------------------- B: three requirements ---------------------------- */}
        <g opacity={actB}>
          <text x={120} y={130} fontSize={46} fill={PAL.lilac} fontWeight={800}>
            WHAT MAKES A GOOD LINKER
          </text>

          {[
            ["rigid core", "aromatic ring \u2014 the nodes stay a fixed distance apart"],
            ["defined geometry", "where the binding groups sit sets the angle"],
            ["right length", "longer linker, bigger pore \u2014 too long and it interpenetrates"],
          ].map(([head, sub], i) => {
            const p = ramp(frame, 215 + i * 62, 20);
            return (
              <g key={head} opacity={p} transform={`translate(0, ${interpolate(p, [0, 1], [16, 0])})`}>
                <text x={120} y={360 + i * 190} fontSize={44} fill={C.text} fontWeight={600}>
                  {head}
                </text>
                <text x={120} y={408 + i * 190} fontSize={28} fill={C.muted}>
                  {sub}
                </text>
              </g>
            );
          })}

          <g opacity={ramp(frame, 330, 20)} transform="translate(1330, 540)">
            {ring(0, 0, 90).map((p, i, arr) => {
              const q = arr[(i + 1) % 6];
              return <line key={i} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={C.body} strokeWidth={3} />;
            })}
            <text x={0} y={150} textAnchor="middle" fontSize={22} fill={C.muted}>
              rigid, aromatic
            </text>
          </g>
        </g>

        {/* ------------------------------ C: defined geometry ------------------------------ */}
        <g opacity={actC}>
          <text x={120} y={130} fontSize={46} fill={PAL.lilac} fontWeight={800}>
            DEFINED GEOMETRY
          </text>

          <g opacity={ramp(frame, 440, 20)}>
            <Linker cx={470} cy={560} r={92} at={[0, 3]} progress={ramp(frame, 450, 18)} />
            <text x={470} y={760} textAnchor="middle" fontSize={30} fill={C.text}>
              terephthalate
            </text>
            <text x={470} y={800} textAnchor="middle" fontSize={24} fill={C.muted}>
              {"1,4 \u2014 linear, 180\u00B0"}
            </text>
          </g>

          <g opacity={ramp(frame, 490, 20)}>
            <Linker cx={1230} cy={560} r={92} at={[0, 2, 4]} progress={ramp(frame, 500, 18)} />
            <text x={1230} y={760} textAnchor="middle" fontSize={30} fill={C.text} opacity={ramp(frame, 525, 16)}>
              BTC
            </text>
            <text x={1230} y={800} textAnchor="middle" fontSize={24} fill={C.muted}>
              {"1,3,5 \u2014 trigonal, 120\u00B0"}
            </text>
          </g>

          <text x={860} y={560} textAnchor="middle" fontSize={40} fill={C.muted} opacity={ramp(frame, 545, 18)}>
            {"vs"}
          </text>
        </g>

        {/* --------------------------------- D: right length --------------------------------- */}
        <g opacity={actD}>
          <text x={120} y={130} fontSize={46} fill={PAL.lilac} fontWeight={800}>
            RIGHT LENGTH
          </text>
          <LengtheningLinker frame={frame} />
        </g>

        <text x={110} y={990} fontSize={22} fill={C.muted} opacity={ramp(frame, 200, 20)}>
          {"linker chemistry after the group's organic notes"}
        </text>
      </svg>
    </AbsoluteFill>
  );
};
