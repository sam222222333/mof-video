import * as THREE from "three";
import pw from "../data/paddlewheel-solvated.json";

/* ------------------------------------------------------------------------ *
 * The same Cu2 paddlewheel model PaddleV3 uses (paddlewheel-solvated.json),
 * pulled out so the colour section can reuse it without touching PaddleV3.
 * Same atom groupings, same colours, same radii.
 * ------------------------------------------------------------------------ */

export type Atom = { e: string; x: number; y: number; z: number };
export const ATOMS = pw.atoms as Atom[];
export const BONDS = pw.bonds as [number, number][];
export const WATER = new Set(pw.waterAtoms as number[]);
export const P = (i: number) => new THREE.Vector3(ATOMS[i].x, ATOMS[i].y, ATOMS[i].z);
export const CU = ATOMS.map((a, i) => (a.e === "Cu" ? i : -1)).filter((i) => i >= 0);
export const AXIS = P(CU[1]).sub(P(CU[0])).normalize();

export const CORE_O = new Set(
  ATOMS.map((_, i) => i).filter(
    (i) => ATOMS[i].e === "O" && !WATER.has(i) && CU.some((c) => P(c).distanceTo(P(i)) < 2.3),
  ),
);
export const CORE_C = new Set(
  BONDS.flatMap(([i, j]) =>
    CORE_O.has(i) && ATOMS[j].e === "C" ? [j] : CORE_O.has(j) && ATOMS[i].e === "C" ? [i] : [],
  ),
);

/* the four linker arms = connected components once Cu and water are removed */
export const ARM_OF = new Map<number, number>();
(() => {
  const adj = new Map<number, number[]>();
  ATOMS.forEach((_, i) => {
    if (!WATER.has(i) && !CU.includes(i)) adj.set(i, []);
  });
  BONDS.forEach(([a, b]) => {
    if (adj.has(a) && adj.has(b)) {
      adj.get(a)!.push(b);
      adj.get(b)!.push(a);
    }
  });
  let k = 0;
  for (const s of adj.keys()) {
    if (ARM_OF.has(s)) continue;
    const st = [s];
    while (st.length) {
      const x = st.pop()!;
      if (ARM_OF.has(x)) continue;
      ARM_OF.set(x, k);
      st.push(...adj.get(x)!);
    }
    k++;
  }
})();
export const N_ARMS = Math.max(...ARM_OF.values()) + 1;
export const ARM_C = Array.from({ length: N_ARMS }, (_, k) => {
  const ids = [...ARM_OF.entries()].filter(([, a]) => a === k).map(([i]) => i);
  return ids.reduce((acc, i) => acc.add(P(i)), new THREE.Vector3()).multiplyScalar(1 / ids.length);
});

/* the axial water on each Cu */
export const waterOn = (cu: number) => {
  const o = (pw.axialO as number[]).find((x) => P(x).distanceTo(P(cu)) < 2.6)!;
  return { cu, o, atoms: new Set([...WATER].filter((i) => P(i).distanceTo(P(o)) < 1.2)) };
};

export const RADII: Record<string, number> = { Cu: 0.74, O: 0.58, C: 0.54, H: 0.34 };

/* PaddleV3's palette for the model */
export const CU_COL = "#7dd3fc";
export const BG = { C: "#64708a", O: "#a8646e", H: "#9aa3b5", bond: "#4e586c" };
export const CORE = { C: "#d5dde8", O: "#ef6b6b", bond: "#9aa6b8" };

/* PaddleV3's "down the Cu–Cu axis" view */
export const Q_AXIS = new THREE.Quaternion()
  .setFromEuler(new THREE.Euler(0.18, -0.22, 0))
  .multiply(new THREE.Quaternion().setFromUnitVectors(AXIS, new THREE.Vector3(0, 0, 1)));
