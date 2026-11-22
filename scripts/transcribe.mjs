/**
 * whisper-1 transcription (proxy-friendly): sentence/word timestamps for A/V alignment.
 *   OPENAI_API_KEY=... OPENAI_BASE_URL=https://proxy/v1 \
 *     node scripts/transcribe.mjs <audio> <out.json>
 * OPENAI_BASE_URL defaults to https://api.openai.com/v1; output is raw verbose_json,
 * never shown on screen (machine transcription mangles chemical terms) - boundary
 * detection only. Falls back to segment-only if timestamp_granularities is rejected.
 */

import { readFile, writeFile } from "node:fs/promises";
import { basename } from "node:path";

const FPS = 30;

const [, , audioPath, outPath] = process.argv;
if (!audioPath || !outPath) {
  console.error("usage: node scripts/transcribe.mjs <audio> <out.json>");
  process.exit(1);
}
const key = process.env.OPENAI_API_KEY;
if (!key) {
  console.error("missing OPENAI_API_KEY");
  process.exit(1);
}
const base = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
const model = process.env.OPENAI_TRANSCRIBE_MODEL || "whisper-1";

const buf = await readFile(audioPath);

async function call(granularities) {
  const fd = new FormData();
  fd.append("file", new Blob([buf], { type: "audio/mp4" }), basename(audioPath));
  fd.append("model", model);
  fd.append("response_format", "verbose_json");
  for (const g of granularities) fd.append("timestamp_granularities[]", g);

  const res = await fetch(`${base}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: fd,
  });
  if (!res.ok) {
    const body = await res.text();
    const err = new Error(`HTTP ${res.status}: ${body.slice(0, 400)}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

console.log(`endpoint ${base}/audio/transcriptions  model ${model}`);

let j;
try {
  j = await call(["word", "segment"]);
} catch (e) {
  console.warn(`\nword+segment failed (${e.message.slice(0, 160)})`);
  console.warn("falling back to segment-only timestamps\n");
  j = await call(["segment"]);
}

await writeFile(outPath, JSON.stringify(j, null, 2), "utf8");

const f = (sec) => String(Math.round(sec * FPS)).padStart(5, "0");
const dur = j.duration ?? (j.segments?.at(-1)?.end ?? 0);
console.log(`\nduration ${dur}s = ${Math.round(dur * FPS)} frames`);
console.log(`wrote ${outPath}\n`);
console.log("frame range (@30fps)   seconds range       text");
console.log("─".repeat(94));
for (const s of j.segments ?? []) {
  console.log(
    `${f(s.start)}-${f(s.end)}   ${s.start.toFixed(2).padStart(6)}-${s.end.toFixed(2).padEnd(7)}  ${s.text.trim()}`,
  );
}
console.log("─".repeat(94));
console.log(`${(j.segments ?? []).length} segments / ${(j.words ?? []).length} words\n`);
