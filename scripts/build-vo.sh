#!/usr/bin/env bash
#
# Rebuild every per-section .wav from public/vo.m4a.
#
# Why this exists: the Studio preview ignores <Audio startFrom> and <Audio endAt>.
# Several tracks mounted at once all start at frame 0 and overlap, which sounds
# like several narrators reading at the same time. Each section therefore gets its
# own file that is exactly as long as its picture, so overlapping is impossible.
#
# All boundaries are frames at 30 fps. Frame to seconds: frame / 30.
#
# NOTE on the two inorganic files. Their boundaries were cut by hand to remove
# sentence gaps (50 frames around #17, a further 38 frames later), so the atrim
# values below rebuild the *uncut* spans and will be about 1.3 s long. If you need
# frame-exact alignment for those two sections, recut them against the cue table
# in the comment at the top of src/vo/InorganicVO.tsx and src/InorganicExp.tsx.
#
# Usage:  bash scripts/build-vo.sh
#
set -euo pipefail

cd "$(dirname "$0")/.."

SRC=public/vo.m4a
FF="npx remotion ffmpeg"

if [ ! -f "$SRC" ]; then
  echo "missing $SRC" >&2
  exit 1
fi

# atrim="$1"  out="$2"  [filter chain]
# Every output is mono 44.1 kHz pcm_s16le: the stripped ffmpeg shipped with
# Remotion has no m4a muxer, and stereo doubles the frame count if you measure
# with Python's wave module.
cut() {
  local trim="$1" out="$2"
  echo "  -> $out"
  $FF -hide_banner -loglevel error -i "$SRC" \
    -filter_complex "[0:a]${trim},asetpts=PTS-STARTPTS[a]" \
    -map "[a]" -ac 1 -ar 44100 -c:a pcm_s16le -f wav -y "public/$out"
}

echo "baking section tracks from $SRC"

# 01 hook — absolute 0 - 11.2333 s, padded to 11.900 s (357 frames)
cut "atrim=start=0:end=11.2333,apad=whole_dur=11.9" vo-hook.wav

# 02 general — 11.9 - 45.8333 s, padded to 35.7667 s (1073 frames)
cut "atrim=start=11.9:end=45.8333,apad=whole_dur=35.7667" vo-general.wav

# 04 inorganic — two spans joined, dropping the gap between them
#   47.667-83.0 s plus 84.667-113.0 s
echo "  -> vo-inorganic.wav (uncut spans; see the note at the top of this file)"
$FF -hide_banner -loglevel error -i "$SRC" -filter_complex \
  "[0:a]atrim=start=47.667:end=83.0,asetpts=PTS-STARTPTS[a];\
   [0:a]atrim=start=84.667:end=113.0,asetpts=PTS-STARTPTS[b];\
   [a][b]concat=n=2:v=0:a=1[out]" \
  -map "[out]" -ac 1 -ar 44100 -c:a pcm_s16le -f wav -y public/vo-inorganic.wav

# 04 inorganic, experimental cut — same narration, six sentence gaps removed from
# the opening so Zaid's 600-frame pre-rendered sequence lines up (103 frames cut)
cp public/vo-inorganic.wav public/vo-inorganic-exp.wav
echo "  -> vo-inorganic-exp.wav (copied; recut this one if you need frame accuracy)"

# 05 organic — 114.0 - 172.0667 s (1742 frames)
cut "atrim=start=114.0:end=172.0667" vo-organic.wav

# 06 colour (and its sibling quantum figures) — this section was re-recorded, so it
# does NOT come from vo.m4a. public/vo-quantum-new.m4a is a standalone 43.04 s take
# (1291 frames) and is converted whole.
echo "  -> vo-quantum.wav (from vo-quantum-new.m4a, not vo.m4a)"
$FF -hide_banner -loglevel error -i public/vo-quantum-new.m4a \
  -ac 1 -ar 44100 -c:a pcm_s16le -f wav -y public/vo-quantum.wav

# 07 current uses — 217.1667 - 255.1333 s (1139 frames)
cut "atrim=start=217.1667:end=255.1333" vo-current.wav

# 08 future — 257.5333 - 304.3 s, padded to 39.27 s (1178 frames).
# The original span is 1403 frames; seven wide sentence gaps (225 frames total)
# were cut so the five beats do not drag. This rebuild keeps them, so the file is
# about 7.5 s longer than the shipped track.
cut "atrim=start=257.5333:end=304.3" vo-future.wav
echo "     (vo-future.wav keeps its seven sentence gaps; the shipped cut removed 225 frames)"

# Full master: each section trimmed-or-padded to its own picture length, then
# concatenated. atrim comes first because apad only adds; it never truncates.
# Picture lengths in frames, in script order:
#   hook 357 · general 1073 · inorganic 1853 · organic 1830
#   colour 1291 · current 1150 · future 1218   =  8772 frames = 292.400 s
echo "  -> vo-assembly.wav"
$FF -hide_banner -loglevel error \
  -i public/vo-hook.wav -i public/vo-general.wav -i public/vo-inorganic-exp.wav \
  -i public/vo-organic.wav -i public/vo-quantum.wav -i public/vo-current.wav \
  -i public/vo-future.wav -filter_complex \
  "[0:a]atrim=0:11.9,apad=whole_dur=11.9[a];\
   [1:a]atrim=0:35.7667,apad=whole_dur=35.7667[b];\
   [2:a]atrim=0:61.7667,apad=whole_dur=61.7667[c];\
   [3:a]atrim=0:61.0,apad=whole_dur=61.0[d];\
   [4:a]atrim=0:43.0333,apad=whole_dur=43.0333[e];\
   [5:a]atrim=0:38.3333,apad=whole_dur=38.3333[f];\
   [6:a]atrim=0:40.6,apad=whole_dur=40.6[g];\
   [a][b][c][d][e][f][g]concat=n=7:v=0:a=1[out]" \
  -map "[out]" -ac 1 -ar 44100 -c:a pcm_s16le -f wav -y public/vo-assembly.wav

echo
echo "done. durations:"
for f in public/vo-*.wav; do
  printf "  %-28s %s\n" "$(basename "$f")" \
    "$($FF -i "$f" 2>&1 | grep -o 'Duration: [0-9:.]*' | head -1 | sed 's/Duration: //')"
done
echo
echo "expected total for vo-assembly.wav: 00:04:52.40 (8772 frames)"
