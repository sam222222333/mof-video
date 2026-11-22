# MOF: from node to application

Remotion source for a five-minute explainer on metal–organic frameworks, using
HKUST-1 as the worked example. Every scene is drawn in code (SVG, canvas or
react-three-fiber). The only non-code material is the narration, one reproduced
journal figure (Chui et al. 1999, Fig. 1, scene 02) and a few pre-rendered
mattes for the node-geometry opening (scene 04).

**Running time 333.8 s (10014 frames at 30 fps):** seven sections (301.2 s,
9036 frames) plus 32.6 s (978 frames) of silent closing credits. That assumes the
new organic section (05, 2094 frames); until it is wired in, the code still
builds the old one and the film is 325.0 s (9750 frames). See
[Organic section v2](#organic-section-v2).

The film is `AssemblyVO`. `AssemblyVOCite` is the same film with source
references drawn on screen. The master has no on-screen citations yet; see
`CITATIONS-TODO.md`.

---

## Quick start

```bash
npm install
bash scripts/build-vo.sh        # bake the narration WAVs (see Audio)
npx remotion studio --no-open   # preview
```

Render a single frame (fastest way to check something):

```bash
npx remotion still AssemblyVO out/f1200.png --frame=1200 --gl=angle \
  --browser-executable="<path to Chrome>"
```

Render the film:

```bash
npx remotion render AssemblyVO out/film.mp4 --gl=angle \
  --browser-executable="<path to Chrome>"
```

Chrome paths: macOS `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`,
Linux `/usr/bin/google-chrome`. The two flags are only needed for the WebGL
scenes (02's 3D part, 04, the paddlewheel clip in 05, 06). Without them the render hangs on "Getting
composition", because Remotion's bundled headless shell has no WebGL here.

**Requirements:** Node 18+ (developed on Node 24) and a system Chrome/Chromium.

Render notes:

- `AssemblyVO` is laid out at 1920×1080 and scaled by 0.6667, so it renders at
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
| `AssemblyVO` | **The film.** Silent picture plus one audio track. |
| `AssemblyVOCite` | Same film, with source references switched on. |
| `Credits` | 09, six silent panels. |
| `Hook`, `GeneralInfo`, `InorganicExp`, `OrganicLinkers`, `ColourFull`, `Applications`, `FutureOfMofs` | The seven sections, silent. These are what `AssemblyVO` mounts. |
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
  AssemblyVO.tsx            the film
  AssemblyVOCite.tsx        the film with citations
  Assembly.tsx              older silent assembly (superseded)
  Credits.tsx               09  closing credits

  hook/Hook.tsx             01  surface area, the tennis-court number
  hook/GeneralInfo.tsx      02  what a MOF is
  InorganicExp.tsx          04  node geometry, paddlewheel, HSAB, open site
  inorganic/                    NodeGeometry, PaddleV3, HsabFull (used);
                                the rest are earlier versions
  organic/                  05  OrganicLinkers (linker chemistry, BTC, hard/soft),
                                LinkerScenes12, PaddleClip3D (3D paddlewheel), paddleModel
  colour/                   06  ColourFull (2D opening + 3D scene), ColourScene
  applications/             07  catalysis, CO2 capture, gas storage, water
  future/                   08  batch vs flow, drug delivery, conductive MOFs
  vo/                       per-section compositions with their own audio
  data/                     paddlewheel and tiling JSON from the CIF
  quantum/, shot05/, team/  earlier explorations, not in the film

public/
  vo.m4a                    narration, 310.6 s, one take
  vo-quantum-new.m4a        the colour section, re-recorded (43.04 s)
  figures/                  chui1999-fig1.png (scene 02)
  node_geo/                 mattes and footage for the node-geometry opening

scripts/build-vo.sh         bakes the per-section and master WAVs
archive/                    two earlier snapshots (see below)
```

`Shot01*.tsx`, `MoleculeSpin.tsx`, `PaddlewheelDemo.tsx`, `shot05/` and `team/`
are earlier explorations kept for reference.

### Assets are not in git

`.gitignore` excludes `public/figures/`, `public/node_geo/` and `public/*.wav`.
The export zip includes the first two, but a fresh clone will not, and scenes
02 and 04 break without them. Back them up separately. `vo.m4a` and
`vo-quantum-new.m4a` are tracked.

---

## Audio

The narration is one recording (`public/vo.m4a`), plus the re-recorded colour
section (`public/vo-quantum-new.m4a`). Each section needs its own WAV because
Studio ignores `<Audio startFrom>` and `<Audio endAt>`: several tracks all start
at frame zero and overlap.

```bash
bash scripts/build-vo.sh
```

This writes `vo-hook`, `vo-general`, `vo-inorganic`, `vo-inorganic-exp`,
`vo-organic`, `vo-quantum`, `vo-current`, `vo-future` and the concatenated master
`vo-assembly.wav`.

**The rebuild does not exactly reproduce the shipped audio.** Some sentence gaps
were cut by hand and are not reproduced by the script:

| Section | Effect of rebuilding |
|---|---|
| 04 inorganic and the inorganic-exp copy | About 1.3 s longer than the picture |
| 05 organic | The script still cuts the old take (114.0–172.0667 s). The new narration and its 8 s silent insert are not in the script yet (see below) |
| 08 future | About 7.5 s longer than the shipped track (225 frames of gaps kept) |

`vo-assembly.wav` pads or trims every section to its picture length, so the
master stays at 8772 frames, but narration inside those two sections will sit
later than the picture. For frame-exact alignment, recut against the cue tables
in the comments at the top of `src/vo/InorganicVO.tsx`, `src/InorganicExp.tsx`
and `src/future/FutureOfMofs.tsx`. The per-sentence cue file `vo-timeline.json`
is not in this export.

The credits are silent by design, so `vo-assembly.wav` ends 32.6 s before the
picture. That is not a bug.

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
and the picture shortened by the same amount.

---

## Gotchas

- **`<Sequence>` shifts the frame number.** Inside one, `useCurrentFrame()`
  returns a local frame. Passing a local frame to something that expects an
  absolute one is the usual cause of a scene playing at the wrong speed.
- **WebGL needs a real browser** (see Quick start).
- **Studio preview ignores `startFrom`/`endAt`** (see Audio).
- **Keep scenes pure.** No state, randomness or wall-clock time, or a re-render
  will not match.

To get an AI assistant to extend this, see `docs/ASSISTANT-PROMPT.md`.

---

## Organic section v2

Section 05 was rebuilt with a new script (`docs/ORGANIC-SCRIPT.md`). It is **not
yet wired into the master**. What changed:

- **Length:** 2094 frames (69.8 s), up from 1830. 1854 frames are narrated and 240
  (8.0 s) are a silent 3D paddlewheel clip (`PaddleClip3D.tsx`) that holds after
  "the paddles of the paddlewheel".
- **Content:** deprotonation and anionic donors, rigid core, BTC (MOF-199) with
  three binding groups 120° apart, then hard (carboxylate) versus soft
  (pyrazolate) donors, then linker length and pore size (UiO-66 → UiO-67).
- **WebGL:** the paddlewheel clip uses three.js, so 05 now needs the Chrome flags.
  The standalone package pinned `three ^0.170`; this repo uses `^0.187`.
- **Audio:** the composition runs on the voice-over's own timeline through
  `voFrame()`, which pauses the narration for `PADDLE_INSERT` (240) frames at
  `PADDLE_AT` (frame 1295, 43.17 s). The voice-over edit must have exactly 8 s of
  silence at that point.

To wire it in:

1. Replace `src/organic/` with the new folder and copy `src/data/paddlewheel-solvated.json`
   if it differs.
2. In `AssemblyVO.tsx` and `AssemblyVOCite.tsx`, set `ORGANIC` to `ORGANIC_FRAMES`
   (2094) instead of `1830`, and update the frame totals in the comments.
3. Rebuild the narration for 05 from the new recording with the 8 s of silence
   inserted, and update `build-vo.sh` (organic trim, master concat length).
4. Add the `citations` prop back to `OrganicLinkers`. The new component does not
   take it, so `AssemblyVOCite` will not type-check and nothing is cited in 05.
5. Update the Root.tsx organic duration (`Organic`, `OrganicVO`) to 2094.

---

## Known gaps

- **Two different Cu–Cu distances.** The 3D model is the 0 K DFT cell (2.457 Å).
  The 2.628 Å on screen is the room-temperature experimental value from Chui 1999.
  Both are labelled, but they are not the same measurement.
- **No citations in the master.** `AssemblyVOCite` has them; the master does not.
  Several are still missing or unchecked, and the credits list references that
  are not placed on screen. Details in `CITATIONS-TODO.md`.
- **Audio rebuild** drifts in 04 and 08, and has no new 05 narration yet (see Audio).
- **Stale comments.** `AssemblyVO.tsx` and `AssemblyVOCite.tsx` say 8772 frames
  and a 720-frame credits block. The credits block is 978 frames and the film is
  9750 today (10014 with the new organic section).
- `Assembly.tsx` uses older segment lengths and is silent. `AssemblyVO` is the
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
