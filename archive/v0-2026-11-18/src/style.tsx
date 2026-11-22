import type { FC } from "react";
import { AbsoluteFill } from "remotion";

/* ------------------------------------------------------------------------ *
 * The film's one visual language.
 *
 * Taken from the team's canvas explainer (incoming/team-2026-11-18/), which is
 * what the first sections of the film look like. Everything we draw ourselves
 * has to match it or the cut reads as two different films spliced together.
 *
 * The three things that actually differ between their look and ours were:
 *   - background: theirs is a vertical gradient + a lavender vignette, ours was
 *     a flat #0b1020. Side by side the flat one looks washed out and bluer.
 *   - typeface: theirs is Helvetica Neue first, ours fell through to the system
 *     UI stack (Segoe/SF), which is noticeably narrower.
 *   - section titles: theirs is 46 px, weight 800, lilac, top-left at (120,130).
 *     Ours was a 26 px wide-tracked uppercase blue kicker — same slot, completely
 *     different weight.
 *
 * Import from here; do not re-declare a `const C = {...}` block per file.
 * ------------------------------------------------------------------------ */

export const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

export const PAL = {
  /** warm off-white — the primary ink on screen */
  cream: "#ece7dc",
  /** heading / highlight lilac */
  lilac: "#a5b4fc",
  /** warm accent, used for pores and call-outs */
  peach: "#fdba74",
  /** secondary text */
  mute: "#94a3b8",
  /** brightest text, for numbers */
  white: "#f8fafc",
  /** deep indigo, used inside gradients and dim fills */
  indigo: "#312e81",
} as const;

export const FONT_SIZES = {
  /** section title, top-left at (120, 130) */
  title: 46,
  /** sub-heading */
  sub: 32,
  /** body */
  body: 30,
  /** labels under a diagram */
  label: 24,
  /** footnotes */
  foot: 21,
} as const;

/** Linear sweep + lavender vignette, matching their `bg()` exactly. */
export const BACKDROP_CSS =
  "radial-gradient(circle at 50% 50%, rgba(129,140,248,0.07) 0%, rgba(0,0,0,0.35) 100%), linear-gradient(#0a0d14, #121826)";

/** Just the lavender vignette — for laying OVER a WebGL canvas, which paints
 *  its own background and would otherwise hide the CSS gradient. */
export const VIGNETTE_CSS =
  "radial-gradient(circle at 50% 50%, rgba(129,140,248,0.07) 0%, rgba(0,0,0,0.35) 100%)";

export const Backdrop: FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <AbsoluteFill style={{ background: BACKDROP_CSS, opacity }} />
);

/**
 * The section title. Position and metrics are their `title()`:
 * text(str, 120, 130, 46, LILAC, 800, 'left').
 */
export const SectionTitle: FC<{ x?: number; y?: number; opacity?: number; children: React.ReactNode }> = ({
  x = 120,
  y = 130,
  opacity = 1,
  children,
}) => (
  <text
    x={x}
    y={y}
    fontSize={FONT_SIZES.title}
    fill={PAL.lilac}
    fontWeight={800}
    opacity={opacity}
    style={{ fontFamily: FONT }}
  >
    {children}
  </text>
);
