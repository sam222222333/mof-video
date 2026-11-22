/* ------------------------------------------------------------------------ *
 * Shared lattice visual language — quantum section (§6)
 *
 * The same 2-D lattice appears twice in the 36 s colour section: as the
 * "colourless crystal" opening (Shot 05 part A) and as the two-panel symmetry
 * comparison (Figure 3). Before this file existed the two used different node
 * glyphs (14 px squares vs r = 9 circles) and different line colours, so the
 * section looked like it came from two different films. Both now import from
 * here; change it in one place and both stay in sync.
 * ------------------------------------------------------------------------ */

/** Radius of one lattice node, in px at 1080p. */
export const NODE_R = 9;

/** Fill of an unlit node. The whole lattice is drawn in this, quietly. */
export const NODE_FILL = "#3a4a6e";

/** The bonds between nodes — same hue family, deliberately dimmer than nodes. */
export const LATTICE_LINE = "#2b3a5c";

export const LATTICE_LINE_W = 2;

/** Seconds-worth of frames per beat at 30 fps, used by both files. */
export const FPS = 30;
