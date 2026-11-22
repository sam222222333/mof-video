import type { FC } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { FONT, PAL, SectionTitle, VIGNETTE_CSS } from "../style";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import pw from "../data/paddlewheel-solvated.json";

/* ------------------------------------------------------------------------ *
 * SHOT 04 · 4d — why the axial water leaves: d9 -> Jahn-Teller -> open site
 *
 * Narration: "Copper here is d9 — one hole in the d shell. And d9 complexes are
 * Jahn-Teller distorted... the axial bond is 2.16 angstrom, the equatorial ones
 * 1.95. That gap is why the water is weakly bound, and why heating leaves
 * behind a coordinatively unsaturated site — an open metal site."
 *
 * The visual is deliberately a single metal centre: one Cu, its four
 * equatorial O, and the axial water that disappears.
 * ------------------------------------------------------------------------ */

const C = {
  bg: "#0a0d14",
  text: PAL.cream,
  body: "#cfc9be",
  muted: PAL.mute,
  cu: PAL.lilac,
  cyan: PAL.peach,
  o: "#e85d5d",
  c: "#9aa4b2",
  h: "#e8e8e8",
  water: "#7ee0ff",
};

const W = 1920;
const H = 1080;
const FOV = 38;
const CAM_D = 21; // Angstrom
const ROLL = 0.03; // camera roll on the model group

const RADII: Record<string, number> = { Cu: 0.78, O: 0.52, C: 0.5, H: 0.32 };
const COLORS: Record<string, string> = { Cu: C.cu, O: C.o, C: C.c, H: C.h };

type Vec3 = [number, number, number];

const ATOMS = pw.atoms as { e: string; x: number; y: number; z: number }[];
const BONDS = pw.bonds as [number, number][];
const WATER = pw.waterAtoms as number[];
const AXIAL_O = pw.axialO as number[];
const CU = ATOMS.map((a, i) => (a.e === "Cu" ? i : -1)).filter((i) => i >= 0)[0];

const pos = (i: number): Vec3 => [ATOMS[i].x, ATOMS[i].y, ATOMS[i].z];

/** a ring sprite: always faces the camera, so it cannot drift off the site */
const ringTexture = (() => {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d") as CanvasRenderingContext2D;
  ctx.strokeStyle = PAL.peach;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 14, 0, Math.PI * 2);
  ctx.stroke();
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
})();

/** soft white flash for the moment the water leaves */
const flashTexture = (() => {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d") as CanvasRenderingContext2D;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(230,250,255,0.95)");
  g.addColorStop(0.45, "rgba(126,224,255,0.35)");
  g.addColorStop(1, "rgba(126,224,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
})();

const ramp = (frame: number, start: number, dur = 16): number =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

/** the four oxygens coordinating Cu, which the narration calls out explicitly */
const EQUATORIAL_O = new Set(
  ATOMS.map((a, i) => ({ a, i }))
    .filter(({ a, i }) => a.e === "O" && !WATER.includes(i) &&
      Math.hypot(a.x - ATOMS[CU].x, a.y - ATOMS[CU].y, a.z - ATOMS[CU].z) < 2.3)
    .map(({ i }) => i),
);

const CHAIN = [
  "d\u2079 Cu\u00B2\u207A",
  "Jahn\u2013Teller elongation",
  "weak axial bond",
  "water leaves",
  "open metal site (CUS)",
];

export const OpenSite: FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();

  // camera settles onto one copper centre
  const settle = interpolate(frame, [0, 45], [0.72, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  // the axial water glows, then goes
  const waterGlow = interpolate(frame, [50, 115], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const waterGone = interpolate(frame, [145, 210], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad), // slow start, then it pops away
  });

  // flash + pulse at the moment the water leaves
  const flash = interpolate(frame, [175, 235], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const pulse = interpolate(frame, [205, 270], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const siteRing = ramp(frame, 195, 18);

  const fadeOut = interpolate(frame, [durationInFrames - 18, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // everything that is not the metal centre fades back
  const restFade = interpolate(frame, [0, 40], [1, 0.16], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Deliberately static: rotating a stack of dozens of semi-transparent spheres
  // makes their depth order flip every frame, which reads as strobing.
  const spin = 0.8;
  const dist = CAM_D / settle;
  const tiltX = 0.26;

  const waterOpacity = (1 - waterGone) * Math.min(1, 0.35 + waterGlow * 0.9);
  // The camera is static, so a translucent stack sorts consistently now — this
  // only flickered while the structure was rotating.
  const atomOpacity = (e: string, i: number) =>
    e === "Cu" ? 1 : EQUATORIAL_O.has(i) ? 0.9 : restFade;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, opacity: fadeOut * ramp(frame, 0, 14) }}>
      <ThreeCanvas
        width={W}
        height={H}
        camera={{ position: [0, 0, dist], fov: FOV, near: 0.5, far: 300 }}
      >
        <color attach="background" args={[C.bg]} />
        <ambientLight intensity={0.95} />
        <directionalLight position={[6, 9, 8]} intensity={1.9} />
        <pointLight position={[-7, -4, 6]} intensity={0.8} color={C.cu} />
        <group rotation={[tiltX, spin, ROLL]}>
          <group position={[-ATOMS[CU].x, -ATOMS[CU].y, -ATOMS[CU].z]}>
            {ATOMS.map((a, i) => {
              const isWater = WATER.includes(i);
              const op = atomOpacity(a.e, i);
              if (isWater && op < 0.02) return null;
              return (
                <mesh
                  key={`a${i}`}
                  position={[a.x, a.y, a.z]}
                  scale={isWater ? (1 + 0.15 * waterGlow) * (1 - 0.7 * waterGone) : 1}
                >
                  <sphereGeometry args={[RADII[a.e] ?? 0.4, 22, 22]} />
                  <meshStandardMaterial
                    color={isWater ? C.water : COLORS[a.e] ?? "#999"}
                    emissive={isWater ? C.water : a.e === "Cu" ? C.cu : "#000000"}
                    emissiveIntensity={isWater ? 0.22 + waterGlow * 0.75 : a.e === "Cu" ? 0.5 : 0}
                    roughness={0.35}
                    metalness={0.1}
                    transparent
                    opacity={isWater ? waterOpacity : op}
                  />
                </mesh>
              );
            })}
            {BONDS.map(([i, j], k) => {
              const isWater = WATER.includes(i) || WATER.includes(j);
              const op = isWater ? waterOpacity * 0.9 : restFade * 0.9;
              if (op < 0.02) return null;
              const s = new THREE.Vector3(...pos(i));
              const e = new THREE.Vector3(...pos(j));
              const mid = s.clone().add(e).multiplyScalar(0.5);
              const d = e.clone().sub(s);
              const q = new THREE.Quaternion().setFromUnitVectors(
                new THREE.Vector3(0, 1, 0),
                d.clone().normalize(),
              );
              return (
                <mesh key={`b${k}`} position={mid} quaternion={q}>
                  <cylinderGeometry args={[0.13, 0.13, d.length(), 12]} />
                  <meshStandardMaterial
                    color={isWater ? C.water : "#7c8798"}
                    roughness={0.5}
                    transparent
                    opacity={op}
                  />
                </mesh>
              );
            })}
        {/* empty coordination site, drawn in 3D so it can never drift */}
        <sprite position={pos(AXIAL_O[0])} scale={[0.45 + 2.6 * pulse, 0.45 + 2.6 * pulse, 1]}>
          <spriteMaterial map={ringTexture} transparent opacity={0.8 * (1 - pulse) * (siteRing > 0 ? 1 : 0)} depthWrite={false} />
        </sprite>
        <sprite position={pos(AXIAL_O[0])} scale={[0.8, 0.8, 1]}>
          <spriteMaterial map={ringTexture} transparent opacity={0.85 * siteRing} depthWrite={false} />
        </sprite>
        <sprite position={pos(AXIAL_O[0])} scale={[1.1 + 5.5 * flash, 1.1 + 5.5 * flash, 1]}>
          <spriteMaterial map={flashTexture} transparent opacity={0.9 * (1 - flash)} depthWrite={false} />
        </sprite>
          </group>
        </group>
      </ThreeCanvas>

      {/* the WebGL canvas paints its own flat background, so the film's vignette
          has to sit on top of it rather than behind */}
      <AbsoluteFill style={{ background: VIGNETTE_CSS, pointerEvents: "none" }} />

      <svg width={W} height={H} style={{ position: "absolute", inset: 0, fontFamily: FONT }}>
        <SectionTitle opacity={ramp(frame, 20, 18)}>the axial water comes and goes</SectionTitle>

        {/* the theory chain, built line by line as spoken */}
        <g opacity={ramp(frame, 200, 16)}>
          {CHAIN.map((line, i) => {
            // all five lines land together — one argument, one beat
            const p = ramp(frame, 200, 16);
            const dx = interpolate(p, [0, 1], [-16, 0]);
            return (
              <g key={line} opacity={p} transform={`translate(${dx}, 0)`}>
                {i > 0 ? (
                  <text x={110} y={254 + i * 62} fontSize={30} fill={C.cyan}>
                    {"\u2192"}
                  </text>
                ) : null}
                <text
                  x={i > 0 ? 166 : 110}
                  y={254 + i * 62}
                  fontSize={i === 0 ? 34 : 30}
                  fill={i === CHAIN.length - 1 ? C.text : C.body}
                  fontWeight={i === 0 || i === CHAIN.length - 1 ? 600 : 400}
                >
                  {line}
                </text>
              </g>
            );
          })}
        </g>

        <text x={110} y={980} fontSize={22} fill={C.muted} opacity={ramp(frame, 70, 20)}>
          {"Cu\u2013OH\u2082 2.165 \u00C5  \u00B7  Cu\u2013O(eq) 1.952 \u00C5  \u00B7  Chui 1999 (Science)"}
        </text>
      </svg>
    </AbsoluteFill>
  );
};
