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
 * `offset` is where playback enters the 50 s master clock.
 *
 * The default 19.0 is the original design: the shot starts far away and pushes in,
 * with `Z = exp(3.7*(1-u))` about 40x at t=19.0 and back to 1 only at t=22.0. That
 * push looks good on its own, but it fills the upper half of the frame with the
 * solar panel and buries a section title laid over it. Applications therefore passes
 * 21.6 to jump to the end of the push and keep only the fully opened frame.
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
