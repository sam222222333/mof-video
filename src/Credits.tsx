import type { FC } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BACKDROP_CSS, FONT, PAL } from "./style";

/* ------------------------------------------------------------------------ *
 * CREDITS — three panels, each held for PER frames.
 *
 * Deliberately its own composition rather than the tail of FutureOfMofs: the
 * credits are not part of the argument, they are a separate card sequence, and
 * keeping them out means the Future section can stay cut to its narration.
 *
 *   1  references           every source the film actually leans on
 *   2  made with            tools on the left, AI disclosure on the right
 *   3  production           team, structure provenance, the repo link
 * ------------------------------------------------------------------------ */

/* 169 frames per panel: three panels is 507 frames. */
const PER = 169;
const FADE = 14;

type Panel = {
  head: string;
  body: string[];
  size: number;
  gap: number;
  /** Optional name/role rows. When present, `body` is ignored and the names are
   *  right-aligned against the roles so the two columns line up. */
  rows?: { name: string; role: string }[];
  /** Two columns sharing one page, so the closing block fits in fewer screens. */
  cols?: { head: string; lines: string[]; size: number; gap: number; x: number }[];
  /** Optional vertical offset of the first body line; defaults to 352 (cols) / 372. */
  y0?: number;
  /** Pinned to the bottom of the page: a label, the link itself, then a note. */
  foot?: { label: string; link: string; note: string };
};

const PANELS: Panel[] = [
  {
    head: "REFERENCES",
    body: [
      "H. Furukawa et al., Science, 2010, 329, 424.",
      "S. R. Batten et al., Pure Appl. Chem., 2013, 85, 1715.",
      "M. Eddaoudi et al., Science, 2002, 295, 469.",
      "S. S.-Y. Chui et al., Science, 1999, 283, 1148.",
      "R. G. Pearson, J. Am. Chem. Soc., 1963, 85, 3533.",
      "V. Colombo et al., Chem. Sci., 2011, 2, 1311.",
      "K. Müller et al., ACS Appl. Mater. Interfaces, 2017, 9, 37463.",
      "D. Britt et al., Proc. Natl. Acad. Sci. U.S.A., 2008, 105, 11623.",
      "G. Tian et al., Nanoscale, 2025, 17, 12340.",
      "D. Sheberla et al., J. Am. Chem. Soc., 2014, 136, 8859.",
      "A. S. Rosen et al., Matter, 2021, 4, 1578 (QMOF database).",
    ],
    size: 20,
    gap: 34,
  },
  {
    head: "MADE WITH",
    body: [],
    size: 24,
    gap: 50,
    y0: 430,
    cols: [
      {
        head: "TOOLS",
        lines: [
          "Remotion 4 — React-based video, every frame is code",
          "Three.js and @react-three/fiber for the 3-D scenes",
          "Headless Chromium for rendering, FFmpeg for encoding",
          "Crystal structures: QMOF qmof-8b5bb88 and COD 2300380",
          "Narration recorded separately and transcribed with Whisper",
        ],
        size: 19,
        gap: 40,
        x: 120,
      },
      {
        head: "AI DISCLOSURE",
        lines: [
          "No AI-generated images or videos",
          "were used in this production.",
          "",
          "AI tools assisted with code generation,",
          "programming and debugging.",
          "",
          "All visual content was rendered",
          "programmatically using Remotion.",
        ],
        size: 19,
        gap: 34,
        x: 1030,
      },
    ],
  },
  {
    head: "PRODUCTION",
    body: [],
    size: 24,
    gap: 50,
    cols: [
      {
        head: "MADE BY",
        lines: [
          "Joyal James",
          "   researcher, inorganic · future of MOFs",
          "Syed Ali Hamza Pasha",
          "   researcher, inorganic · applications",
          "Jacob John Starkey",
          "   voice-over · script · scribe · director",
          "Zaid Zahir",
          "   co-editor · visualisation · researcher, organic",
          "Chenhe Liu",
          "   co-editor · 3d/render · visualisation · researcher, quantum",
        ],
        size: 19,
        gap: 34,
        x: 120,
      },
      {
        head: "STRUCTURE & VISUALISATION",
        lines: [
          "The HKUST-1 paddlewheel was sourced from the",
          "QMOF example dataset (MIT Learning Matter –",
          "AtomisticSkills), specifically the DOTSOV01",
          "structure. A section of the original crystal",
          "was extracted for visualisation.",
          "",
          "The water molecules leaving the structure are",
          "an illustrative animation: their positions and",
          "trajectories are conceptual, not measured or",
          "simulated.",
        ],
        size: 18,
        gap: 32,
        x: 1020,
      },
    ],
    foot: {
      label: "The source code and production methodology are available at",
      link: "https://github.com/sam222222333/mof-video",
      note: "contact us with any questions about the science, the visualisations or the process",
    },
  },
];

export const CREDITS_FRAMES = PANELS.length * PER;

const ramp = (f: number, start: number, dur: number) =>
  Math.max(0, Math.min(1, (f - start) / dur));

export const Credits: FC = () => {
  const f = useCurrentFrame();
  const idx = Math.min(PANELS.length - 1, Math.floor(f / PER));
  const local = f - idx * PER;
  const o = ramp(local, 4, FADE) * (1 - ramp(local, PER - FADE, FADE));
  const p = PANELS[idx];
  // Two-column pages put their own headings inside each column, so the shared
  // title has to sit above them and the body starts lower.
  const y0 = p.y0 ?? (p.cols ? 352 : 372);

  return (
    <AbsoluteFill style={{ background: BACKDROP_CSS, fontFamily: FONT }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <g opacity={o}>
          <text
            x={960}
            y={p.cols ? 224 : 292}
            textAnchor="middle"
            fontSize={p.cols ? 23 : 26}
            fill={PAL.lilac}
            style={{ fontFamily: FONT, letterSpacing: 4 }}
          >
            {p.head}
          </text>
          {p.cols
            ? p.cols.map((c, ci) => (
                <g key={ci}>
                  <text
                    x={c.x}
                    y={y0 - 30}
                    fontSize={20}
                    fill={PAL.lilac}
                    style={{ fontFamily: FONT, letterSpacing: 3 }}
                  >
                    {c.head}
                  </text>
                  {c.lines.map((line, li) => (
                    <text
                      key={li}
                      x={c.x}
                      y={y0 + li * c.gap}
                      fontSize={line.startsWith("   ") ? 15 : c.size}
                      fill={line.startsWith("   ") ? PAL.mute : PAL.cream}
                      opacity={line.startsWith("   ") ? 0.9 : 1}
                      style={{ fontFamily: FONT }}
                    >
                      {line.trim()}
                    </text>
                  ))}
                </g>
              ))
            : p.rows
            ? p.rows.map((r, i) => (
                <g key={i}>
                  <text
                    x={900}
                    y={y0 + i * p.gap}
                    textAnchor="end"
                    fontSize={p.size}
                    fill={PAL.cream}
                    style={{ fontFamily: FONT }}
                  >
                    {r.name}
                  </text>
                  <text
                    x={940}
                    y={y0 + i * p.gap}
                    textAnchor="start"
                    fontSize={21}
                    fill={PAL.mute}
                    style={{ fontFamily: FONT }}
                  >
                    {r.role}
                  </text>
                </g>
              ))
            : p.body.map((line, i) => (
                <text
                  key={i}
                  x={960}
                  y={y0 + i * p.gap}
                  textAnchor="middle"
                  fontSize={p.size}
                  fill={PAL.mute}
                  style={{ fontFamily: FONT }}
                >
                  {line}
                </text>
              ))}
          {p.foot && (
            <g>
              <text x={960} y={944} textAnchor="middle" fontSize={18} fill={PAL.mute} opacity={0.8}
                    style={{ fontFamily: FONT }}>
                {p.foot.label}
              </text>
              <text x={960} y={984} textAnchor="middle" fontSize={25} fill={PAL.lilac}
                    style={{ fontFamily: FONT, letterSpacing: 1 }}>
                {p.foot.link}
              </text>
              <text x={960} y={1020} textAnchor="middle" fontSize={16} fill={PAL.mute} opacity={0.6}
                    style={{ fontFamily: FONT }}>
                {p.foot.note}
              </text>
            </g>
          )}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
