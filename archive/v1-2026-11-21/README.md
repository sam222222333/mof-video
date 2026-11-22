# MOF: from node to application

Remotion source for a five-minute explainer on metal–organic frameworks, using
HKUST-1 as the worked example. Every scene is drawn in code — SVG, canvas or
react-three-fiber — so there are no stock images and no video assets apart from
the narration track.

Running time: **292.4 s (4:52)** in the full master.

---

## What is in here

```
src/
  index.ts                  registerRoot
  Root.tsx                  every composition
  style.tsx                 palette, fonts, backdrops, SectionTitle

  AssemblyVO.tsx            full film, silent picture + one audio track
  Assembly.tsx              full film, silent (older segment lengths)

  hook/
    Hook.tsx                01  surface area, the tennis-court number
    GeneralInfo.tsx         02  what a MOF is
  InorganicExp.tsx          04  node geometry, paddlewheel, HSAB, open site
    inorganic/
      NodeGeometry.tsx          node geometry table (pre-rendered matte)
      PaddleV3.tsx              the paddlewheel, water attack, collapse
      HsabFull.tsx              hard/soft acid-base card
  organic/
    OrganicLinkers.tsx      05  linker chemistry, BTC, what makes a good linker
  colour/
    ColourFull.tsx          06  colour as a diagnostic (2D opening + 3D scene)
    ColourScene.tsx              the 3D half
  applications/
    Applications.tsx        07  catalysis, CO2 capture, gas storage, water
  future/
    FutureOfMofs.tsx        08  batch vs flow, drug delivery, conductive MOFs

  vo/
    *VO.tsx                 one composition per section, each with its own audio
    FrameTag.tsx            frame/time readout, preview only
```

`CITATIONS-TODO.md` lists what each scene claims, what is cited today, and what
sources and photographs are still missing.

---

## Requirements

- Node 18 or newer (developed on Node 24)
- A Chromium browser for WebGL scenes. Remotion ships `chrome-headless-shell`,
  which cannot create a WebGL context here, so pass a system Chrome instead.

---

## Install

```bash
npm install
```

If you plan to render the WebGL scenes (04, 06, and the 3D part of 02):

```bash
# macOS, with Google Chrome installed
--browser-executable="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --gl=angle
```

---

## Audio

The narration is one recording, `public/vo.m4a` (310.6 s), split across seven
sections. Each section needs its own `.wav` because the Studio preview ignores
`<Audio startFrom>` and `<Audio endAt>`: several tracks all start at frame zero
and overlap.

`public/vo.m4a` is committed. The per-section wavs are not — regenerate them:

```bash
bash scripts/build-vo.sh
```

That writes `vo-hook.wav`, `vo-general.wav`, `vo-inorganic.wav`,
`vo-inorganic-exp.wav`, `vo-organic.wav`, `vo-quantum.wav`, `vo-current.wav`,
`vo-future.wav` and the concatenated master `vo-assembly.wav` (292.400 s).

All timings in the source refer to frames at 30 fps. The section boundaries and
the per-sentence onsets come from `vo-timeline.json`, which is not shipped here;
each scene file carries its own table of cue frames in the comment above it.

---

## Run

```bash
npx remotion studio --no-open
```

Compositions are grouped into folders. `AssemblyVO` is the film. The `*VO`
compositions preview one section at a time with its narration; the bare section
components (`Hook`, `GeneralInfo`, `InorganicExp`, `OrganicLinkers`,
`ColourFull`, `Applications`, `FutureOfMofs`) are silent and are what
`AssemblyVO` actually mounts.

---

## Render

A still, which is the fastest way to check a frame:

```bash
npx remotion still AssemblyVO out/f1200.png --frame=1200 \
  --gl=angle --browser-executable="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

The film:

```bash
npx remotion render AssemblyVO out/film.mp4 \
  --gl=angle --browser-executable="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

Notes that cost time to discover:

- `AssemblyVO` composes at 1920×1080 and scales the whole tree by 0.6667, so it
  renders at 1280×720. Review passes run at 720p to halve the render time.
- Use `--scale=0.4444` for stills only. For video the output height must be an
  integer, and 1080 × 0.4444 = 479.952 fails with
  `The "height" prop passed to stitchFramesToVideo() must be an integer`. Use
  `0.5` for a 540p render.
- `remotion.config.ts` sets the image format to JPEG and overwrite to true.

---

## Style rules

If you add a scene, match these or it will look like a different film:

- Palette, font and backdrop come from `src/style.tsx`. Do not hard-code colours
  from somewhere else.
- Section titles are sentence case: `the paddlewheel`, `colour as a diagnostic`.
  Full questions keep their capital: `What are MOFs used for?`
- WebGL scenes need `VIGNETTE_CSS` layered over the canvas, otherwise they sit
  visibly brighter than the 2D scenes around them.
- Anything that is a schematic says so on screen (`schematic`, `simplified 2D
  diagram`) and drawn figures are never presented as measured data.
- Numbers on screen carry their source: the three Cu distances quote Chui 1999
  inline, the colour claims quote Müller 2017.

---

## Known gaps

- No citations are burned into the video yet; see `CITATIONS-TODO.md`.
- No photographs anywhere. Every figure is a drawing.
- `Assembly.tsx` still uses the older segment lengths and is silent. `AssemblyVO`
  is the current master.
- `Shot01*.tsx`, `MoleculeSpin.tsx`, `PaddlewheelDemo.tsx` and `shot05/` are
  earlier explorations kept for reference; they are not mounted by the film.
