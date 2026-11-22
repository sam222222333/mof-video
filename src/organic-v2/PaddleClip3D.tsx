import type { FC } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { BACKDROP_CSS, FONT, PAL } from "../style";
import { ARM_OF, ATOMS, AXIS, ARM_C, BG, BONDS, CORE, CORE_C, CORE_O, CU, CU_COL, N_ARMS, P, Q_AXIS, RADII, WATER } from "./paddleModel";

/* ------------------------------------------------------------------------ *
 * A silent 5 s look at the real 3-D Cu2 paddlewheel (same model as the
 * Inorganic and Colour sections), dropped in right after "...creating the
 * paddles of the paddle wheel". No text, no narration.
 *
 * Starts looking straight down the Cu–Cu axis, so it lines up with the 2-D
 * paddlewheel it dissolves out of, then turns side-on to show the depth.
 * Dry framework (no axial water) — this section is about the linkers.
 *
 * Title + labels use only words already on the organic-notes slide /
 * on screen in this section: "paddlewheel", "two metals, four paddles",
 * "paddle", "benzene ring", "carboxylate", plus the element symbols.
 * Labels are pinned to their atoms (projected through the same camera),
 * so they follow the model as it turns.
 * ------------------------------------------------------------------------ */

export const PADDLE_CLIP_FRAMES = 240; // 8 s

const W = 1920;
const H = 1080;

/* side-on: Cu–Cu axis vertical, the four arms on the diagonals */
const Q_UP = new THREE.Quaternion().setFromUnitVectors(AXIS, new THREE.Vector3(0, 1, 0));
const ARM0 = ARM_C[0].clone().applyQuaternion(Q_UP);
const YAW = Math.atan2(ARM0.z, ARM0.x) - Math.PI / 4;
/** side-on view, turned `a` radians about the (vertical) Cu–Cu axis */
const sideQ = (a: number) =>
  new THREE.Quaternion()
    .setFromEuler(new THREE.Euler(0.22, 0, 0))
    .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, YAW + a, 0)))
    .multiply(Q_UP);
const Q_SIDE = sideQ(0);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
/* the full turn about the Cu–Cu axis (after turning side-on and the labels) */
const SPIN: [number, number] = [146, 236];

type Ball = { key: string; e: string; p: THREE.Vector3; color: string; em: number };
type Stick = { key: string; a: THREE.Vector3; b: THREE.Vector3; color: string };

/* the model never changes, so build it once */
const BALLS: Ball[] = [];
const STICKS: Stick[] = [];
ATOMS.forEach((a, i) => {
  if (WATER.has(i)) return;
  let color: string;
  let em = 0;
  if (a.e === "Cu") {
    color = CU_COL;
    em = 0.45;
  } else if (CORE_O.has(i)) color = CORE.O;
  else if (CORE_C.has(i)) color = CORE.C;
  else color = (BG as Record<string, string>)[a.e] ?? BG.C;
  BALLS.push({ key: `a${i}`, e: a.e, p: P(i), color, em });
});
BONDS.forEach(([i, j], k) => {
  if (WATER.has(i) || WATER.has(j)) return;
  const coreish = (x: number) => CORE_O.has(x) || CORE_C.has(x) || CU.includes(x);
  STICKS.push({ key: `b${k}`, a: P(i), b: P(j), color: coreish(i) && coreish(j) ? CORE.bond : BG.bond });
});

/* ------------------------------ labels ------------------------------ */
const CAM = new THREE.PerspectiveCamera(40, W / H, 0.5, 300);
CAM.position.set(0, 0, 25);
CAM.updateMatrixWorld();
CAM.updateProjectionMatrix();
const toScreen = (v: THREE.Vector3) => {
  const p = v.clone().project(CAM);
  return { x: ((p.x + 1) / 2) * W, y: ((1 - p.y) / 2) * H };
};

/* the arms that sit left / right in BOTH the opening (axial) and the final
   (side-on) view, so their leader lines never cross while the model turns */
const armX = (k: number) => ARM_C[k].clone().applyQuaternion(Q_AXIS).x + ARM_C[k].clone().applyQuaternion(Q_SIDE).x;
const ARMS = Array.from({ length: N_ARMS }, (_, k) => k).sort((a, b) => armX(a) - armX(b));
const LEFT_ARM = ARMS[0];
const RIGHT_ARM = ARMS[ARMS.length - 1];
/* "benzene ring": the middle of the left arm's carbons (minus the carboxylate C on Cu) */
const RING = (() => {
  const ids = [...ARM_OF.entries()].filter(([i, k]) => k === LEFT_ARM && ATOMS[i].e === "C" && !CORE_C.has(i)).map(([i]) => i);
  return ids.reduce((acc, i) => acc.add(P(i)), new THREE.Vector3()).multiplyScalar(1 / ids.length);
})();
/* "paddle": the right arm as a whole */
const PADDLE = ARM_C[RIGHT_ARM];
/* "O (carboxylate)": an O on the top Cu, the one furthest right in the side view */
const O_PICK = [...CORE_O]
  .filter((i) => P(i).distanceTo(P(CU[1])) < 2.3)
  .sort((a, b) => P(b).applyQuaternion(Q_SIDE).x - P(a).applyQuaternion(Q_SIDE).x)[0];

/* text sits at a FIXED spot beside the model (left or right column); only the
   leader line moves, following its atom as the model turns — so the text
   never lands on top of the structure */
type XY = { x: number; y: number };
const Label: FC<{ at: XY[]; tx: number; ty: number; side: "left" | "right"; text: string; sub?: string; op: number; col?: string }> = ({
  at,
  tx,
  ty,
  side,
  text,
  sub,
  op,
  col = PAL.cream,
}) => {
  if (op <= 0.01) return null;
  const lx = side === "right" ? tx - 14 : tx + 14; // where the leader lines meet the text
  return (
    <g opacity={op}>
      {at.map((a, k) => (
        <g key={k}>
          <circle cx={a.x} cy={a.y} r={6} fill={PAL.peach} />
          <line x1={a.x} y1={a.y} x2={lx} y2={ty - 9} stroke={PAL.peach} strokeWidth={2} opacity={0.85} />
        </g>
      ))}
      <text x={tx} y={ty} textAnchor={side === "right" ? "start" : "end"} fontFamily={FONT} fontSize={30} fontWeight={700} fill={col}>
        {text}
      </text>
      {sub && (
        <text x={tx} y={ty + 32} textAnchor={side === "right" ? "start" : "end"} fontFamily={FONT} fontSize={22} fill={PAL.mute}>
          {sub}
        </text>
      )}
    </g>
  );
};

export const PaddleClip3D: FC = () => {
  const f = useCurrentFrame();
  const fade = interpolate(f, [0, 18, PADDLE_CLIP_FRAMES - 18, PADDLE_CLIP_FRAMES], [0, 1, 1, 0], clamp);
  const turn = interpolate(f, [24, 112], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  /* then one slow full turn about the Cu–Cu axis, once the arm labels are gone */
  const spin = interpolate(f, [SPIN[0], SPIN[1]], [0, Math.PI * 2], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const q = Q_AXIS.clone().slerp(sideQ(spin), turn);
  const scale = interpolate(f, [0, PADDLE_CLIP_FRAMES], [0.82, 0.92], clamp);

  /* labels: in one after another. The arm + O labels go before the spin (their
     leader lines would swing across each other); Cu sits on the spin axis, so
     it and the title stay to the end */
  const on = (start: number) => interpolate(f, [start, start + 16], [0, 1], clamp) * fade;
  const offBeforeSpin = 1 - interpolate(f, [SPIN[0] - 22, SPIN[0] - 4], [0, 1], clamp);
  /* title + Cu clear just before the dissolve-out, so they never overlap the
     next screen's title in the same spot */
  const offAtEnd = 1 - interpolate(f, [PADDLE_CLIP_FRAMES - 40, PADDLE_CLIP_FRAMES - 24], [0, 1], clamp);
  const S = (v: THREE.Vector3) => toScreen(v.clone().applyQuaternion(q).multiplyScalar(scale));
  /* the two text columns, clear of the model either side */
  const LX = 560;
  const RX = 1360;

  return (
    <AbsoluteFill style={{ background: BACKDROP_CSS, opacity: fade }}>
      <ThreeCanvas width={W} height={H} camera={{ position: [0, 0, 25], fov: 40, near: 0.5, far: 300 }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[6, 9, 8]} intensity={1.9} />
        <pointLight position={[-7, -4, 6]} intensity={0.6} color="#a5b4fc" />
        <group quaternion={q} scale={scale}>
          {BALLS.map((b) => (
            <mesh key={b.key} position={b.p}>
              <sphereGeometry args={[RADII[b.e] ?? 0.4, 32, 32]} />
              <meshStandardMaterial color={b.color} emissive={b.color} emissiveIntensity={b.em} roughness={0.4} />
            </mesh>
          ))}
          {STICKS.map((s) => {
            const d = s.b.clone().sub(s.a);
            return (
              <mesh
                key={s.key}
                position={s.a.clone().add(s.b).multiplyScalar(0.5)}
                quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize())}
              >
                <cylinderGeometry args={[0.14, 0.14, d.length(), 12]} />
                <meshStandardMaterial color={s.color} roughness={0.5} />
              </mesh>
            );
          })}
        </group>
      </ThreeCanvas>

      <svg width={W} height={H} style={{ position: "absolute", inset: 0, fontFamily: FONT }}>
        <text x={120} y={130} fontSize={46} fill={PAL.lilac} fontWeight={800} opacity={on(6) * offAtEnd}>
          THE PADDLEWHEEL IN 3D
        </text>
        <text x={120} y={185} fontSize={30} fill={PAL.mute} opacity={on(20) * offAtEnd}>
          two metals, four paddles
        </text>

        <Label at={[S(PADDLE)]} tx={RX} ty={330} side="right" text={"“paddle”"} op={on(28) * offBeforeSpin} col={PAL.peach} />
        <Label at={[S(RING)]} tx={LX} ty={330} side="left" text="benzene ring" op={on(42) * offBeforeSpin} />
        <Label at={[S(P(O_PICK))]} tx={RX} ty={790} side="right" text="O" sub="carboxylate" op={on(70) * offBeforeSpin} />
        {/* one "Cu" label, a line to each copper, once they separate side-on */}
        <Label at={[S(P(CU[1])), S(P(CU[0]))]} tx={LX} ty={790} side="left" text="Cu" sub="the two metals" op={on(92) * offAtEnd} col={CU_COL} />
      </svg>
    </AbsoluteFill>
  );
};
