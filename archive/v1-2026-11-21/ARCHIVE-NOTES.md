# Archived snapshot — 21 November 2026

This is the export package as it stood on 21 November 2026, kept so the
differences can be inspected after the fact.

What changed since:

- `Credits.tsx` (the six closing panels) did not exist
- `AssemblyVOCite.tsx` did not exist; only `AssemblyVO` carried the citations
- No section carried a `citations` prop, so nothing was referenced on screen
- Section titles were rendered in sentence case; they are upper case now
- `GeneralInfo.tsx` did not show Fig. 1 of Chui et al. 1999
- `InorganicExp.tsx` had no structure/distance attribution line
- The film ended at 8772 frames (292.4 s); it now ends at 9750 (325.0 s)
- `public/figures/` and `public/node_geo/` were not shipped with this snapshot

Only `src/` and the four top-level config/doc files are kept here. The audio and
image assets are identical to the current version and are not duplicated.
