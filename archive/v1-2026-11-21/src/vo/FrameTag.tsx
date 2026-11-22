import type { FC } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

/* ------------------------------------------------------------------------ *
 * FrameTag — a barely visible frame/time readout in the bottom right corner.
 * Only the *VO compositions carry it; it never appears in the finished film.
 *
 * mix-blend-mode: difference keeps it legible on both dark and light backgrounds
 * while staying visually quiet. Useful for referring to a moment as "f437" when
 * discussing screenshots.
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
