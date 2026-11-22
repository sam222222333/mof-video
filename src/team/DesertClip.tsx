import type { FC } from "react";
import { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { createMofScene } from "./mofScene";

/* ------------------------------------------------------------------------ *
 * DESERT — the scene that never rendered.
 *
 * `drawD()` is 69 lines of finished illustration in the team's canvas file:
 * dusk sky, three layers of dunes, vapour drifting into the vents, solar panel,
 * sorption bed, water rising in a jar. It had exactly one caller — inside a
 * `draw(t)` that two later declarations overrode — so it never appeared in any
 * version of their 50 s piece.
 *
 * It does not belong in "what is a MOF"; it is an *application* (Al/Zr MOFs
 * pulling drinking water out of dry air), which is the Current uses section the
 * film is still missing. This composition exists so it can be looked at and
 * re-timed on its own.
 *
 * Their internal cues are all on the 50 s master clock and start at 19.0 s
 * (`drawD(19.0 + s)` in their CLIPS table), so the offset lives here — the
 * drawing code itself is untouched.
 * ------------------------------------------------------------------------ */

export const DESERT_SECONDS = 9;
export const DESERT_FRAMES = DESERT_SECONDS * 30; // 270

const OFFSET = 19.0;

type Scene = { drawD: (t: number) => void };

/**
 * `offset` is the entry point on the team's 50 s master clock.
 *
 * Default 19.0 = the original push-in (`Z = exp(3.7*(1-u))`: about 40x away at
 * t=19.0, back to 1 at t=22.0). Applications passes 21.6 to skip the push-in,
 * whose panel-filled top half collides with the section title.
 */
export const DesertClip: FC<{ offset?: number }> = ({ offset = OFFSET }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Scene | null>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || sceneRef.current) return;
    sceneRef.current = createMofScene(canvas) as unknown as Scene;
  }, []);

  useLayoutEffect(() => {
    sceneRef.current?.drawD(offset + frame / fps);
  }, [frame, fps, offset]);

  return (
    <AbsoluteFill>
      <canvas
        ref={canvasRef}
        width={1920}
        height={1080}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </AbsoluteFill>
  );
};
