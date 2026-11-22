import type { FC } from "react";
import { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { createMofScene } from "./mofScene";

/* ------------------------------------------------------------------------ *
 * One window onto the team's 50 s canvas.
 *
 * Their `draw(t)` is a pure function of time, so any slice of it can be played
 * on its own simply by adding an offset — no re-timing needed. `from` is the
 * start of the window in seconds on THEIR clock.
 *
 * Slice boundaries are chosen to land on their own beats, which each fade in and
 * out on their own schedule, so a cut at one of those points is clean:
 *
 *   0.0 – 17.4   title, metal + linker card, unit cell grows into a crystal
 *  17.4 – 26.4   the three node geometries
 *  26.4 – 36.4   modularity: swap the metal / stretch the linker
 *  36.6 – 48.6   1 g of powder -> crystal -> 40 tennis courts
 *
 * useLayoutEffect, not useEffect: Remotion screenshots the DOM right after the
 * commit, and useEffect can run after that paint, leaving the canvas a frame
 * stale.
 * ------------------------------------------------------------------------ */

type Scene = { draw: (t: number) => void };

export const TeamClip: FC<{ from: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Scene | null>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || sceneRef.current) return;
    sceneRef.current = createMofScene(canvas) as Scene;
  }, []);

  useLayoutEffect(() => {
    sceneRef.current?.draw(from + frame / fps);
  }, [frame, fps, from]);

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
