# MOF: from node to application

Remotion source for a five-minute explainer on metal–organic frameworks, using
HKUST-1 as the worked example. Most scenes are drawn in code (SVG, canvas or
react-three-fiber); sections 05 and 08 are flat renders supplied by the group and
mounted as files. The rest of the non-code material is the narration, one
reproduced journal figure (Chui et al. 1999, Fig. 1, scene 02) and a few
pre-rendered mattes for the node-geometry opening (scene 04).

**Running time 329.1 s (9873 frames at 30 fps):** seven sections (312.2 s,
9366 frames) plus 16.9 s (507 frames) of silent closing credits. Sections 05 and
08 are no longer drawn in code: they are the group's own renders, played as flat
files (see [Organic section v2](#organic-section-v2) and [Future section](#future-section)).

The film is `AssemblyNewVO` and `AssemblyNewVOCite` (the same cut with source
references drawn on screen). `AssemblyVO` / `AssemblyVOCite` are the earlier cut,
9410 frames, kept for reference.

---

## Quick start

```bash
npm install
npx remotion studio --no-open   # preview
```

Render a single frame (fastest way to check something):

```bash
npx remotion still AssemblyNewVO out/f1200.png --frame=1200 --gl=angle \
  --browser-executable="<path to Chrome>"
```

Render the film:

```bash
npx remotion render AssemblyNewVO out/film.mp4 --gl=angle \
  --browser-executable="<path to Chrome>"
```

Chrome paths: macOS `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`,
Linux `/usr/bin/google-chrome`. The two flags are only needed for the WebGL
scenes (02's 3D part, 04, 06). Without them the render hangs on "Getting
composition", because Remotion's bundled headless shell has no WebGL here.
Sections 05 and 08 are flat files and play without it, but the compositions they
were made from still need it.

**Requirements:** Node 18+ (developed on Node 24) and a system Chrome/Chromium.

Render notes:

- Both masters are laid out at 1920×1080 and scaled by 0.6667, so they render at
  1280×720. Review passes run at 720p to halve the render time.
- `--scale=0.4444` is for stills only. For video the output height must be an
  integer (1080 × 0.4444 = 479.952 fails in `stitchFramesToVideo()`). Use `0.5`
  for 540p.
- `remotion.config.ts` sets JPEG frames and overwrite on.

---

## Compositions

Open Studio and use the folders on the left.

| Composition | What it is |
|---|---|
| `AssemblyNewVO` | **The film.** Seven sections plus credits, one audio track. |
| `AssemblyNewVOCite` | Same film, with source references switched on. |
| `AssemblyVO`, `AssemblyVOCite` | The earlier cut: old organic section (1830 frames) and old future section (1180). 9410 frames. |
| `Credits` | 09, three silent panels (507 frames). |
| `OrganicNew`, `FutureNew` | 05 and 08 as standalone files; the master mounts the flat renders instead. |
| `Hook`, `GeneralInfo`, `InorganicExp`, `OrganicLinkers`, `ColourFull`, `Applications`, `FutureOfMofs` | The seven sections, silent. 05 and 08 are superseded by their renders. |
| `*VO` (in the **VO** folder) | One section with its own narration, for reviewing a section alone. |
| `WIP`, `Archive` folders | Experiments and superseded shots. Not in the film. |

Section numbers follow the original script, so there is no 03 in this cut.
Section 06 (colour) was formerly "quantum": the `Quantum*` composition ids and
`src/quantum/` are the old standalone figures, and `QuantumFull` / `QuantumVO`
now point at the colour section.

---

## Source layout

```
src/
  index.ts, Root.tsx        registerRoot, every composition
  style.tsx                 palette, fonts, backdrops, SectionTitle
  AssemblyNewVO.tsx         the film
  AssemblyNewVOCite.tsx     the film with citations
  AssemblyVO.tsx, AssemblyVOCite.tsx   earlier cut, 9410 frames (superseded)
  Assembly.tsx              older silent assembly (superseded)
  Credits.tsx               09  closing credits, three panels

  hook/Hook.tsx             01  surface area, the tennis-court number
  hook/GeneralInfo.tsx      02  what a MOF is
  InorganicExp.tsx          04  node geometry, paddlewheel, HSAB, open site
  inorganic/                    NodeGeometry, PaddleV3, HsabFull (used);
                                the rest are earlier versions
  organic-v2/               05  OrganicLinkers (linker chemistry, BTC, hard/soft),
                                LinkerScenes12, PaddleClip3D (3D paddlewheel),
                                paddleModel, OrganicVideo (flat render)
  organic/                  the earlier 05, 1830 frames (superseded)
  colour/                   06  ColourFull (2D opening + 3D scene), ColourScene
  applications/             07  catalysis, CO2 capture, gas storage, water
  future/                   08  FutureVideo (the render the master mounts),
                                FutureOfMofs (drawn in code), FlowFuture
  future-v2/                the supplied future section, pre-flattening
  vo/                       per-section compositions with their own audio
  data/                     paddlewheel and tiling JSON from the CIF
  quantum/, shot05/, team/  earlier explorations, not in the film

public/
  vo.m4a                    narration, 310.6 s, one take
  vo-quantum-new.m4a        the colour section, re-recorded (43.04 s)
  vo-assembly-new.wav       the master track, cut at 260.6 s (7818 frames)
  organic-final.mp4         05 as the group rendered it (2094 frames, muted)
  future-section-with-audio.mp4   08 as the group rendered it (1548 frames,
                                carries its own narration)
  figures/                  chui1999-fig1.png (scene 02)
  node_geo/                 mattes and footage for the node-geometry opening
  doc/                      ASSISTANT-PROMPT.md, ORGANIC-SCRIPT.md

scripts/build-vo.sh         bakes the per-section WAVs (05 and 08 superseded)
archive/                    two earlier snapshots (see below)
```

`Shot01*.tsx`, `MoleculeSpin.tsx`, `PaddlewheelDemo.tsx`, `shot05/` and `team/`
are earlier explorations kept for reference.

### Assets are not in git

Almost everything is tracked, including the pre-rendered clips and the figure.
Two things are not: the per-frame source sequences behind the node-geometry
mattes (`public/node_geo/core/`, `public/node_geo/linker/`, ~1200 frames) and the
per-section WAVs. The master track is the exception and ships as
`public/vo-assembly-new.wav`.

---

## Audio

The master is `public/vo-assembly-new.wav`: one track for the whole film, because
Studio ignores `<Audio startFrom>` and `<Audio endAt>` — several tracks all start
at frame zero and overlap.

The track covers sections 01–07, then stops at **260.6 s (7818 frames)**, the
first frame of 08. Section 08 is a flat render that carries its own narration, and
09 is silent by design — so the picture runs 507 frames past the end of the
track, and the last 63.7 s of the film is not one continuous audio file.

`bash scripts/build-vo.sh` still builds the older per-section WAVs and
`vo-assembly.wav`; it does not produce `vo-assembly-new.wav` and its 05/08 cuts
are out of date, so treat its output as a starting point, not the shipped track.
For frame-exact 04, recut against the cue tables at the top of
`src/vo/InorganicVO.tsx` and `src/InorganicExp.tsx`.

---

## How it was made

Each scene is a React component. Remotion passes it the current frame and encodes
the result with FFmpeg, so the film is a pure function of time. That gives:

- **No drift.** Frame 431 is identical on every render, on any machine.
- **Free retiming.** When a sentence moved 40 frames, the fix was a constant.
- **The source is the asset.** There is no project file or media folder to lose.

The crystal structure is real data. HKUST-1 is the DFT-relaxed QMOF cell
`qmof-8b5bb88`, clipped to the paddlewheel fragment by a short Python script,
exported to JSON and drawn with three.js. The earlier close-up shots used a second structure, COD 2300380. Distances printed on screen are the
experimental values from Chui et al. 1999, not measurements of the model. The
two differ slightly and both are labelled (see Known gaps).

The narration was recorded in one take and transcribed with Whisper, giving
per-sentence start and end frames. Every cut is placed on a sentence boundary or
in the gap between two sentences. Where a gap was too long, the silence was cut
and the picture shortened by the same amount. That describes 01–07; 05 and 08
arrive already cut to their own narration.

---

## Gotchas

- **`<Sequence>` shifts the frame number.** Inside one, `useCurrentFrame()`
  returns a local frame. Passing a local frame to something that expects an
  absolute one is the usual cause of a scene playing at the wrong speed.
- **WebGL needs a real browser** (see Quick start).
- **Studio preview ignores `startFrom`/`endAt`** (see Audio).
- **Keep scenes pure.** No state, randomness or wall-clock time, or a re-render
  will not match.

To get an AI assistant to extend this, see `public/doc/ASSISTANT-PROMPT.md`.

---

## Organic section v2

Section 05 was rebuilt by the group and now ships as a flat render:
`public/organic-final.mp4`, 2094 frames / 69.8 s / 1920×1080, silent (the file
arrived without audio, and the master track covers it). `organic-v2/OrganicVideo.tsx`
mounts it.

The code version it replaced is still in the same folder: `OrganicLinkers.tsx`,
2094 frames, narration timed through `voFrame()` with a 240-frame silent
paddlewheel insert at `PADDLE_AT` = frame 1295 (43.17 s). It is a useful reference
for the timing, but the master no longer mounts it.

Because the picture is a fixed file, the `citations` prop is drawn on top as an
SVG overlay instead of inside the section.

---

## Future section

08 was rebuilt by the group and ships as `public/future-section-with-audio.mp4`
— 1548 frames / 51.6 s / 1920×1080, a flat render that **keeps its own
narration**. `future/FutureVideo.tsx` mounts it unmuted; that is why the master
track stops at this section's first frame (260.6 s).

The code version it replaced is `FutureOfMofs.tsx` (1180 frames, narration in
`public/future-vo.m4a`). It stays in the folder but is not mounted. As with 05,
the `citations` prop is drawn as an SVG overlay on top of the file.

---

## Known gaps

- **Two different Cu–Cu distances.** The 3D model is the 0 K DFT cell (2.457 Å).
  The 2.628 Å on screen is the room-temperature experimental value from Chui 1999.
  Both are labelled, but they are not the same measurement.
- **Citations live in `AssemblyNewVOCite`**
- **05 and 08 are fixed files now.** Changing their content means re-rendering the
  source composition and replacing the mp4; the master cannot retime them.
- **`build-vo.sh` is out of date.** It still cuts the old 05 and 08 narration and
  does not produce `vo-assembly-new.wav` (see Audio).
- `Assembly.tsx` uses older segment lengths and is silent. `AssemblyNewVO` is the
  master.

---

## Archive

Two earlier snapshots, source only and no assets. Neither is mounted by the
build.

```
archive/v0-2026-11-18/   24 files, the first complete cut (not runnable on its own)
archive/v1-2026-11-21/   49 files, the export before credits and citations
```

Each has an `ARCHIVE-NOTES.md` saying what it had and what did not exist yet.

---

## License

Academic review only. See [LICENSE](LICENSE): the code and the renders are shared
so the named group and their instructor can assess the work, and nothing here may
be reused, redistributed or republished for any other purpose. Third-party
material (the QMOF and COD structures, the Chui 1999 figure, the cited papers)
stays under its own terms.
