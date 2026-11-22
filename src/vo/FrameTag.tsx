import type { FC } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

/* ------------------------------------------------------------------------ *
 * FrameTag - unobtrusive frame/second counter, bottom right. VO test bench
 * only, never in the film.
 *
 * mix-blend-mode: difference keeps it readable on light and dark frames.
 * Quote "f437" directly when discussing a still.
 * ------------------------------------------------------------------------ */

export const FrameTag: FC<{ opacity?: number }> = ({ opacity = 0.42 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          right: 16,
          bottom: 12,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 15,
          letterSpacing: "0.04em",
          color: "#ffffff",
          opacity,
          mixBlendMode: "difference",
          whiteSpace: "nowrap",
        }}
      >
        f{f} · {(f / fps).toFixed(2)}s
      </div>
    </AbsoluteFill>
  );
};
