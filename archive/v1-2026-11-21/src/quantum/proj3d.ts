/* ------------------------------------------------------------------------ *
 * Tiny 3D → 2D projector for the quantum section.
 *
 * Adapted from the team's canvas explainer (`incoming/team-2026-11-18/`), where
 * the same maths is used to draw the MOF lattice: rotate about Y (yaw), then X
 * (pitch), then a pinhole divide. The one thing worth internalising from their
 * version is that the projection factor `k` must come back to the caller —
 * every radius and line width has to be multiplied by it, or things at the back
 * stop shrinking and the depth cue collapses.
 *
 * Difference from theirs: the focal length is a parameter. They hardcode 34,
 * which on a 4-unit box is almost orthographic (k from 0.92 to 1.10). At 14 the
 * same box gets k from 0.82 to 1.35 — enough perspective to read as a solid
 * without turning into a fisheye.
 *
 * The return is plain numbers, so this works for SVG as well as canvas.
 * ------------------------------------------------------------------------ */

export type Vec3 = readonly [number, number, number];

export type Cam = {
  /** yaw, radians */
  ay: number;
  /** pitch, radians */
  ax: number;
  /** world units → px, before perspective */
  S: number;
  /** screen position of the camera's optical axis */
  cx: number;
  cy: number;
  /** world point the camera looks at */
  center: Vec3;
  /** pinhole focal length in world units */
  focal: number;
};

export type Projected = { x: number; y: number; z: number; k: number };

export const project = (p: Vec3, cam: Cam): Projected => {
  const dx = p[0] - cam.center[0];
  const dy = p[1] - cam.center[1];
  const dz = p[2] - cam.center[2];

  const cy = Math.cos(cam.ay);
  const sy = Math.sin(cam.ay);
  const x1 = dx * cy + dz * sy;
  const z1 = -dx * sy + dz * cy;

  const cx = Math.cos(cam.ax);
  const sx = Math.sin(cam.ax);
  const y2 = dy * cx - z1 * sx;
  const z2 = dy * sx + z1 * cx;

  const k = cam.focal / (cam.focal + z2);
  return { x: cam.cx + x1 * cam.S * k, y: cam.cy + y2 * cam.S * k, z: z2, k };
};

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/**
 * Deterministic LCG. Same seed → same particle every frame, which is what makes
 * frame-by-frame rendering possible at all (a `Math.random()` particle jitters).
 */
export const makeRng = (seed: number): (() => number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};
