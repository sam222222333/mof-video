# Archived snapshot — 18 November 2026

The earliest complete cut of the film, kept for reference. 24 source files,
about 1170 frames of inorganic content and the three standalone quantum figures.
It is not a runnable project on its own — `package.json`, `tsconfig.json` and
every asset are absent — so it is here as a record of the structure, not as
something you can `npm install` and render.

What this version still had:

- `Shot01` and `Shot01ColdOpen`, the cold open that was later dropped
- The three standalone quantum figures (`Figure1Splitting`, `Figure2Spectrum`,
  `Figure3Symmetry`) instead of today's single seven-beat section
- `HKUST1Colour` and `ColourlessLattice3D` under `shot05/`, replaced by the
  rebuilt `colour/ColourFull`
- `PaddleCloseUp` and `OpenSite` as two separate shots; today one `PaddleV3`
  covers both
- `MoleculeSpin` and `PaddlewheelDemo`, early explorations that no longer exist
- `team/Sections.tsx`, `team/TeamClip.tsx`, `team/Shot02Team.tsx`: the canvas
  animations the teammate delivered, later folded into other scenes

What it did not have yet:

- No HSAB-full card, no node-geometry opening, no credits, no citations
- No narration split per section; `Assembly.tsx` was silent throughout
- Section titles were sentence case

Comments in this snapshot were already in English and are unchanged, except for
three references to "Zaid's notes" which now read "the group's notes" — the
filename `ZAID-NOTES.md` is kept because that is what it is called.
