# Prompt for an AI assistant working on this repo

Paste this at the start of a session, then say what you want changed.

> I have a five-minute science explainer built with Remotion (React, one
> component per scene, every visual a pure function of the frame number at
> 30 fps, 1920×1080, encoded to H.264 with FFmpeg). Narration is a single
> continuous recording. Per-section WAV files are produced by
> `scripts/build-vo.sh`. Scene boundaries sit on transcribed sentence
> boundaries or in the gaps between sentences, not on round numbers of seconds.
> Two sections (04 inorganic, 08 future) have hand-cut gaps that the script does
> not reproduce, so audio there is not frame-exact after a rebuild.
>
> Section 05 (organic) has a silent 8 s 3D paddlewheel clip inserted at frame
> 1295. Its animation runs on the voice-over's own timeline through `voFrame()`
> in `OrganicLinkers.tsx`, so changing `PADDLE_AT`, `PADDLE_HOLD` or the clip
> length changes where the narration must pause. Everything shown in 05 must
> come from the narration script in `docs/ORGANIC-SCRIPT.md`: do not add
> linker families, extra MOF examples, pore diameters or surface areas.
>
> Read `README.md` and `src/style.tsx` first. Then read the scene you are
> changing. Before you change anything, tell me:
>
> 1. which frames the change affects, as absolute frames and as seconds,
> 2. whether it moves a scene boundary, and if so what that does to the audio,
> 3. whether the change survives a re-render (no state, no randomness, no
>    dependence on wall-clock time).
>
> Do not adjust a timing constant to fix how something looks. Say what looked
> wrong and we will decide together.
