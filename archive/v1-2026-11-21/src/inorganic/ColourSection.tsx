import type { FC } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { BACKDROP_CSS, FONT, PAL } from "../style";

/* ------------------------------------------------------------------------ *
 * COLOUR AS A DIAGNOSTIC — beats 1 + 2 (2-D). Beats 3-7 (paddlewheel,
 * water, heat) are the 3-D scene, which sits on top of the SAME permanent
 * title (<ColourTitle />).
 *
 *   local frame 0 = narration 0:00.2   (30 fps)
 *   0    - 198   1  "The colour of an MOF can be useful in determining
 *                    whether the framework has been assembled successfully."
 *   198  - 435   2  "A perfect MOF-199 crystal is almost colourless. It
 *                    acquires a typically green hue from the defects."
 *
 * Source for beat 2: Müller et al., ACS Appl. Mater. Interfaces 2017, 9,
 * 37463-37467 (doi 10.1021/acsami.7b12045): low-defect HKUST-1 is virtually
 * colourless; d-d excitations at defects give the typical green colour.
 *
 * The crystal is a real rotating octahedron (HKUST-1's habit), flat-shaded.
 * Everything takes a LOCAL frame as a prop.
 * ------------------------------------------------------------------------ */

export const COLOUR_OPEN_FRAMES = 435;
export const COLOUR_PALE = "#dbe7f5";
export const COLOUR_GREEN = "#34c779";
export const COLOUR_TURQ = "#5eead4";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ramp = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
const smooth = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });

const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const A = rgb(a);
  const B = rgb(b);
  return A.map((v, i) => Math.round(v + (B[i] - v) * t));
};
const lerpHex = (a: string, b: string, t: number) => `rgb(${mix(a, b, t).join(",")})`;

/** Permanent title for the whole colour section. */
export const ColourTitle: FC = () => (
  <text x={120} y={130} fontFamily={FONT} fontSize={46} fontWeight={800} fill={PAL.lilac}>
    the colour of MOF-199
  </text>
);

/** Flat-shaded rotating octahedron. `tint` is a CSS-able [r,g,b]. */
export const Crystal: FC<{ cx: number; cy: number; r: number; yaw: number; tint: number[]; o?: number }> = ({
  cx,
  cy,
  r,
  yaw,
  tint,
  o = 1,
}) => {
  const T = 0.5; // tilt
  const rot = (x: number, y: number, z: number) => {
    const x1 = x * Math.cos(yaw) + z * Math.sin(yaw);
    const z1 = -x * Math.sin(yaw) + z * Math.cos(yaw);
    const y2 = y * Math.cos(T) - z1 * Math.sin(T);
    const z2 = y * Math.sin(T) + z1 * Math.cos(T);
    return { x: x1, y: y2, z: z2 };
  };
  const L = (() => {
    const v = [-0.4, -0.6, 0.7];
    const n = Math.hypot(...v);
    return v.map((c) => c / n);
  })();
  const faces: { pts: string; z: number; shade: number; front: boolean }[] = [];
  for (const sx of [-1, 1])
    for (const sy of [-1, 1])
      for (const sz of [-1, 1]) {
        const vs = [rot(sx, 0, 0), rot(0, sy, 0), rot(0, 0, sz)];
        const n = rot(sx / Math.sqrt(3), sy / Math.sqrt(3), sz / Math.sqrt(3));
        const front = n.z > 0;
        const diff = Math.max(0, n.x * L[0] + n.y * L[1] + n.z * L[2]);
        faces.push({
          pts: vs.map((v) => `${cx + v.x * r},${cy + v.y * r}`).join(" "),
          z: (vs[0].z + vs[1].z + vs[2].z) / 3,
          shade: 0.58 + 0.42 * diff,
          front,
        });
      }
  faces.sort((a, b) => a.z - b.z);
  return (
    <g opacity={o}>
      {faces.map((fc, i) => {
        const c = tint.map((v) => Math.min(255, Math.round(v * fc.shade)));
        return (
          <polygon
            key={i}
            points={fc.pts}
            fill={`rgb(${c.join(",")})`}
            fillOpacity={fc.front ? 0.97 : 0.22}
            stroke="rgba(255,255,255,0.55)"
            strokeWidth={fc.front ? 2 : 1}
            strokeLinejoin="round"
          />
        );
      })}
    </g>
  );
};

const Chip: FC<{ x: number; y: number; w: number; text: string; o: number; size?: number }> = ({ x, y, w, text, o, size = 32 }) => (
  <g opacity={o} transform={`translate(0,${(1 - o) * 12})`}>
    <rect x={x - w / 2} y={y - 48} width={w} height={74} rx={18} fill="rgba(165,180,252,0.10)" stroke="rgba(165,180,252,0.4)" strokeWidth={1.5} />
    <text x={x} y={y + 2} textAnchor="middle" fontFamily={FONT} fontSize={size} fontWeight={700} fill={PAL.white}>
      {text}
    </text>
  </g>
);

/** Beats 1 + 2, local frame 0..435. */
export const ColourOpening: FC<{ frame: number }> = ({ frame: f }) => {
  const yaw = 0.5 + f * 0.012;
  const oSub1 = ramp(f, 4, 22) * (1 - ramp(f, 184, 204));
  const oSub2 = ramp(f, 206, 226);

  // beat 1: single crystal + swatch strip
  const o1 = ramp(f, 8, 40);
  const split = smooth(f, 198, 246);
  const paleRGB = mix("#000000", COLOUR_PALE, 1);
  const green = clamp((f - 268) / 62); // defects appear: pale -> green
  const eased = green * green * (3 - 2 * green);
  const rightTint = mix(COLOUR_PALE, COLOUR_GREEN, eased);

  const x1 = 700 + (600 - 700) * split;
  const x2 = 700 + (1320 - 700) * split;
  const y = 590;

  const oStrip = ramp(f, 34, 62) * (1 - ramp(f, 186, 210));
  const oCap1 = ramp(f, 66, 84) * (1 - ramp(f, 182, 198));

  return (
    <g>
      <text x={120} y={170} fontFamily={FONT} fontSize={30} fontWeight={700} fill={PAL.cream} opacity={oSub1}>
        reading the colour
      </text>
      <text x={120} y={170} fontFamily={FONT} fontSize={30} fontWeight={700} fill={PAL.cream} opacity={oSub2}>
        perfect vs defective crystals
      </text>

      {/* left crystal (stays pale) */}
      <Crystal cx={x1} cy={y} r={190} yaw={yaw} tint={paleRGB} o={o1} />
      {/* right crystal (copy that turns green) */}
      <Crystal cx={x2} cy={y} r={190} yaw={yaw + 0.6} tint={rightTint} o={split * o1} />

      {/* beat 1: colour strip -> what it tells you */}
      <g opacity={oStrip}>
        <defs>
          <linearGradient id="swGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={COLOUR_PALE} />
            <stop offset="0.5" stopColor={COLOUR_GREEN} />
            <stop offset="1" stopColor={COLOUR_TURQ} />
          </linearGradient>
        </defs>
        <text x={1040} y={500} fontFamily={FONT} fontSize={28} fontWeight={700} fill={PAL.cream}>
          colour
        </text>
        <rect x={1040} y={520} width={620} height={44} rx={22} fill="url(#swGrad)" stroke="rgba(255,255,255,0.45)" strokeWidth={1.5} />
        <polygon points="1058,596 1090,596 1074,570" fill={PAL.white} />
        <text x={1040} y={660} fontFamily={FONT} fontSize={28} fontWeight={700} fill={PAL.cream}>
          tells you if the framework assembled
        </text>
        <text x={1040} y={700} fontFamily={FONT} fontSize={22} fill={PAL.mute}>
          a quick check, before any instrument
        </text>
      </g>
      <Chip x={960} y={940} w={560} text="Colour = a quick check" o={oCap1} />

      {/* beat 2 labels */}
      <g opacity={ramp(f, 232, 250)}>
        <text x={600} y={850} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={800} fill={PAL.white}>
          perfect
        </text>
      </g>
      <g opacity={ramp(f, 262, 280)}>
        <text x={1320} y={850} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={800} fill={PAL.white}>
          defective
        </text>
        <text x={1320} y={888} textAnchor="middle" fontFamily={FONT} fontSize={22} fill={PAL.mute}>
          missing linkers
        </text>
      </g>
      <Chip x={600} y={955} w={520} text="almost colourless" o={ramp(f, 244, 262)} />
      <Chip x={1320} y={955} w={520} text="typically green" o={ramp(f, 310, 328)} />

      {/* citation */}
      <text x={960} y={1034} textAnchor="middle" fontFamily={FONT} fontSize={21} fill={PAL.mute} opacity={ramp(f, 232, 256) * 0.95}>
        Müller et al., ACS Appl. Mater. Interfaces 2017, 9, 37463
      </text>
    </g>
  );
};

/** Standalone preview of beats 1-2. */
export const ColourOpeningPreview: FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: BACKDROP_CSS, fontFamily: FONT }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <ColourTitle />
        <ColourOpening frame={frame} />
      </svg>
    </AbsoluteFill>
  );
};
