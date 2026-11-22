import type { FC } from "react";
import { AbsoluteFill, Easing, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FONT, PAL } from "../style";

/* ------------------------------------------------------------------------ *
 * SHOT 04a/b · metallic nodes (0:47.7 -> ~1:10) -- Zaid's own 3D render of
 * "the node sets the geometry" (Video_Project_4.mp4, 9.03 s), slowed to a
 * smooth 20 s and highlighted line by line. NOTHING is frozen: the clip plays
 * straight through and keeps rotating to the end.
 *
 * Files (all in public/node_geo/):
 *   slow.mp4          the 9.03 s clip, re-timed with optical-flow
 *                     interpolation to exactly 600 frames @30fps. Re-timed
 *                     UNEVENLY on purpose: source 0-3 s (the build-up, rods
 *                     and counts growing in) -> 0-4.4 s, so the linkers exist
 *                     by the time the narration says "linkers"; the slow
 *                     rotation after that -> 4.4-20 s. Its own last ~1 s is a
 *                     fade-to-dark (from the source clip) -- `videoFade`
 *                     below makes every overlay fade with it.
 *   linker/NNNN.jpg   per-frame glow matte of JUST the linkers (rods +
 *   core/NNNN.jpg     hexagons) / JUST the metal cores, 480x270, black
 *                     background, pre-tinted per column. They follow the
 *                     rotation because they were computed from the clip
 *                     itself. Drawn with mix-blend-mode: screen, so black =
 *                     no effect, and their opacity is the highlight.
 *   text_all/cu/zn    static glow matte of the formula / geometry / count text
 *
 * Narration (vo.m4a): 0:47.7 / 0:53.0 / 0:57.2 / 1:02.1 / 1:06.6. The real
 * five lines run ~23.4 s; this scene is 20 s, so the line boundaries are
 * scaled by 0.855 -- each highlight lands up to ~0.5 s EARLY against the
 * voice by line 5, and the scene ends ~3 s before the last line does. If you
 * want it exact, make NODE_GEOM_FRAMES 703 and rescale the frame numbers in
 * `timeline` (and re-time slow.mp4).
 *
 *   L1   0 -136  "metallic nodes... joints that connect the organic linkers"
 *                  -> the LINKERS glow
 *   L2 136 -244  "single metal ions or multi-metal clusters"
 *                  -> the metal CORES glow
 *   L3 244 -369  "oxidation number ... number of linkers and the geometry"
 *                  -> Zn2+ / Cu2+ / Zr4+ + oxidation state appear above the
 *                     nodes; the geometry names + connection counts brighten
 *   L4 369 -484  "MOF-199 ... copper(II)"
 *                  -> Zn and Zr dim lightly, Cu header + Cu text brighten
 *   L5 484 -600  "other divalent or trivalent metals can be used"
 *                  -> Cu relaxes, Zn2+ (divalent) brightens. Zr is 4+, so it
 *                     is deliberately NOT highlighted here.
 *
 * Panel centres (x = 360 / 960 / 1560) and the vertical extents of the
 * structures (top ~266, bottom ~668) were measured off the real frames, so
 * the headers (baseline y 205 / 240) clear every rotated pose.
 * ------------------------------------------------------------------------ */

export const NODE_GEOM_FRAMES = 600;

const C = {
  cream: PAL.cream,
  mute: PAL.mute,
  zn: "#a5b4fc",
  cu: "#f6ad7b",
  zr: "#cbd5e1",
} as const;

const ramp = (frame: number, start: number, dur = 16): number =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

const pad = (n: number): string => String(Math.max(0, Math.min(NODE_GEOM_FRAMES - 1, Math.round(n)))).padStart(4, "0");

/* ----------------------------- timeline ----------------------------------- */

export type Timeline = {
  videoFade: number;
  linker: number;
  core: number;
  textAll: number;
  textCu: number;
  textZn: number;
  head: [number, number, number]; // Zn / Cu / Zr header opacity
  dim: number; // Zn + Zr dimmed (L4)
  cuPop: number; // Cu header emphasis (L4)
  znPop: number; // Zn header emphasis (L5)
};

/** every intensity in the scene, as a pure function of the local frame.
 *  (The preview renderer used to QA this imports exactly this function.) */
export const timeline = (f: number): Timeline => {
  const videoFade = interpolate(f, [567, 596], [1, 0.12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const linker = 0.85 * ramp(f, 90, 22) * (1 - ramp(f, 128, 22));
  const core = 0.7 * ramp(f, 148, 22) * (1 - ramp(f, 226, 24));

  const head: [number, number, number] = [ramp(f, 246, 20), ramp(f, 262, 20), ramp(f, 278, 20)];
  const textAll = 0.5 * ramp(f, 292, 20) * (1 - ramp(f, 346, 26));

  const dim = ramp(f, 372, 20) * (1 - ramp(f, 468, 22));
  const cuPop = ramp(f, 380, 20) * (1 - ramp(f, 462, 24));
  const textCu = 0.6 * ramp(f, 384, 20) * (1 - ramp(f, 462, 24));

  const znPop = ramp(f, 490, 20) * (1 - ramp(f, 566, 24));
  const textZn = 0.6 * ramp(f, 490, 22) * (1 - ramp(f, 566, 24));

  return { videoFade, linker, core, textAll, textCu, textZn, head, dim, cuPop, znPop };
};

/* ------------------------------ overlay ----------------------------------- */

type Col = { cx: number; sym: string; charge: string; state: string; color: string };
const COLS: Col[] = [
  { cx: 360, sym: "Zn", charge: "2+", state: "+2", color: C.zn },
  { cx: 960, sym: "Cu", charge: "2+", state: "+2", color: C.cu },
  { cx: 1560, sym: "Zr", charge: "4+", state: "+4", color: C.zr },
];

const Header: FC<{ col: Col; opacity: number; pop: number }> = ({ col, opacity, pop }) => {
  const s = 1 + pop * 0.1;
  const lift = (1 - opacity) * 14; // drifts up into place as it fades in
  return (
    <g opacity={opacity} transform={`translate(${col.cx} ${222 + lift}) scale(${s}) translate(${-col.cx} -222)`}>
      <text x={col.cx} y={205} textAnchor="middle" fontSize={56} fontWeight={800} fill={col.color} style={{ letterSpacing: -0.5 }}>
        {col.sym}
        <tspan dy={-20} fontSize={34} fontWeight={800}>
          {col.charge}
        </tspan>
      </text>
      <text x={col.cx} y={242} textAnchor="middle" fontSize={22} fill={C.mute} style={{ letterSpacing: 0.6 }}>
        oxidation state{" "}
        <tspan fill={col.color} fontWeight={700}>
          {col.state}
        </tspan>
      </text>
    </g>
  );
};

/** dim masks + oxidation-state headers. Transparent everywhere else. */
export const NodeText: FC<{ t: Timeline }> = ({ t }) => (
  <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, fontFamily: FONT }}>
    {/* the dim fades out at the top and bottom so it never shows a hard box
        edge (the left/right edges sit on the clip's own column dividers) */}
    <defs>
      <linearGradient id="nodeDimFade" gradientUnits="userSpaceOnUse" x1="0" y1="170" x2="0" y2="1040">
        <stop offset="0" stopColor="#070a12" stopOpacity="0" />
        <stop offset="0.12" stopColor="#070a12" stopOpacity="1" />
        <stop offset="0.88" stopColor="#070a12" stopOpacity="1" />
        <stop offset="1" stopColor="#070a12" stopOpacity="0" />
      </linearGradient>
    </defs>
    <rect x={0} y={170} width={660} height={870} fill="url(#nodeDimFade)" opacity={t.dim * 0.4 * t.videoFade} />
    <rect x={1260} y={170} width={660} height={870} fill="url(#nodeDimFade)" opacity={t.dim * 0.4 * t.videoFade} />
    <g opacity={t.videoFade}>
      <Header col={COLS[0]} opacity={t.head[0] * (1 - t.dim * 0.55)} pop={t.znPop} />
      <Header col={COLS[1]} opacity={t.head[1]} pop={t.cuPop} />
      <Header col={COLS[2]} opacity={t.head[2] * (1 - t.dim * 0.55)} pop={0} />
    </g>
  </svg>
);

/* ------------------------------ the scene --------------------------------- */

const glowStyle = (opacity: number) =>
  ({
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    mixBlendMode: "screen",
    opacity,
  }) as const;

export const NodeGeometry: FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const t = timeline(frame);
  const fadeOut = interpolate(frame, [durationInFrames - 1, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0d14", opacity: fadeOut }}>
      <OffthreadVideo src={staticFile("node_geo/slow.mp4")} muted style={{ width: "100%", height: "100%" }} />

      {/* The matte used to be 600 JPEGs at 480x270. Stretched to 1080p that is a 4x
          upscale on top of JPEG artefacts, and because each frame carries a different
          artefact pattern the edges shimmered from frame to frame during rotation.
          The matte is now upsampled once with lanczos into a 1920x1080 H.264 file:
          inter-frame prediction keeps edges continuous, and the Studio no longer
          fetches a new image for every frame. */}
      {t.linker > 0.005 && <OffthreadVideo src={staticFile("node_geo/linker_hi.mp4")} muted style={glowStyle(t.linker * t.videoFade)} />}
      {t.core > 0.005 && <OffthreadVideo src={staticFile("node_geo/core_hi.mp4")} muted style={glowStyle(t.core * t.videoFade)} />}
      {t.textAll > 0.005 && <Img src={staticFile("node_geo/text_all.jpg")} style={glowStyle(t.textAll * t.videoFade)} />}
      {t.textCu > 0.005 && <Img src={staticFile("node_geo/text_cu.jpg")} style={glowStyle(t.textCu * t.videoFade)} />}
      {t.textZn > 0.005 && <Img src={staticFile("node_geo/text_zn.jpg")} style={glowStyle(t.textZn * t.videoFade)} />}

      <NodeText t={t} />
    </AbsoluteFill>
  );
};
