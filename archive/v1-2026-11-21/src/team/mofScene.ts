/* eslint-disable */
// @ts-nocheck — generated code: 589 lines of the team's canvas drawing, untyped.
/* GENERATED — do not edit by hand.
 *
 * Source: mof-video/incoming/team-2026-11-18/mof_video-v2/anim.html
 * Rebuild: node incoming/team-2026-11-18/tools/port.mjs
 *
 * The team's §2 explainer (50 s, canvas 2D). Everything below is their drawing
 * code verbatim; only the boot line and the wrapper differ. See
 * incoming/team-2026-11-18/METHOD-NOTES.md for how it works and
 * mof_video-v2/README.md for the known issues.
 *
 * draw(t) is a pure function of time, so Remotion can call it per frame.
 */

export const TEAM_SHOT02_SECONDS = 50;

export function createMofScene(canvas) {
  const W = 1920, H = 1080;

  const cv = canvas, ctx = cv.getContext('2d');
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const easeOut = x => 1 - Math.pow(1 - x, 3);
  const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

  // ---------- powder (deterministic) ----------
  let seed = 7;
  const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
  const dots = [];
  for (let i = 0; i < 1100; i++) {
    const x = rnd() + rnd() - 1;
    const h = Math.pow(1 - Math.abs(x), 1.5);
    const y = Math.pow(rnd(), 0.7) * h;
    dots.push({ x, y, r: 1.6 + rnd() * 2.2 });
  }
  dots.sort((a, b) => a.y - b.y);

  function rr(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function text(s, x, y, size, color, weight = 700, align = 'center', alpha = 1) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.font = `${weight} ${size}px ${FONT}`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(s, x, y);
    ctx.restore();
  }

  function bg() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0a0d14'); g.addColorStop(1, '#121826');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const r = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 1100);
    r.addColorStop(0, 'rgba(129,140,248,0.07)'); r.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = r; ctx.fillRect(0, 0, W, H);
  }

  // ---------- Scene A: one gram of powder on a balance ----------
  function drawA(t) {
    const fade = t < 5.2 ? 1 : 1 - clamp((t - 5.2) / 1.2);
    if (fade <= 0) return;
    const z = t < 5.2 ? 1 : Math.exp(clamp((t - 5.2) / 1.4) * 3.6);
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.translate(960, 690); ctx.scale(z, z); ctx.translate(-960, -690);
    // balance body
    rr(640, 740, 640, 130, 22); ctx.fillStyle = '#1b2740'; ctx.fill();
    ctx.strokeStyle = '#2f4066'; ctx.lineWidth = 3; ctx.stroke();
    rr(780, 765, 360, 80, 10); ctx.fillStyle = '#05080f'; ctx.fill();
    const val = easeOut(clamp((t - 0.4) / 2.0));
    ctx.font = `700 58px "DejaVu Sans Mono", monospace`;
    ctx.fillStyle = '#fdba74'; ctx.textAlign = 'center';
    ctx.fillText(val.toFixed(3) + ' g', 960, 822);
    // platform
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath(); ctx.ellipse(960, 722, 300, 40, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(660, 708, 600, 14);
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath(); ctx.ellipse(960, 708, 300, 40, 0, 0, Math.PI * 2); ctx.fill();
    // powder
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath(); ctx.ellipse(960, 708, 175, 16, 0, 0, Math.PI * 2); ctx.fill();
    const n = Math.floor(dots.length * easeOut(clamp(t / 1.5)));
    ctx.fillStyle = '#f8fafc';
    for (let i = 0; i < n; i++) {
      const d = dots[i];
      ctx.beginPath(); ctx.arc(960 + d.x * 150, 704 - d.y * 100, d.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    // captions (not zoomed)
    ctx.save(); ctx.globalAlpha = fade;
    text('One gram of powder', 960, 200, 72, '#f8fafc', 800, 'center', ease(clamp((t - 0.5) / 0.7)));
    text('It looks like nothing.', 960, 268, 42, '#94a3b8', 500, 'center', ease(clamp((t - 2.6) / 0.7)));
    ctx.restore();
  }

  // ---------- Lattice (3D projected) ----------
  function proj(p, cam) {
    const x = p[0] - cam.c[0], y = p[1] - cam.c[1], z = p[2] - cam.c[2];
    const cy = Math.cos(cam.ay), sy = Math.sin(cam.ay);
    const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
    const cx = Math.cos(cam.ax), sx = Math.sin(cam.ax);
    const y2 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
    const k = 34 / (34 + z2);
    return [cam.cx + x1 * cam.S * k, cam.cy + y2 * cam.S * k, z2, k];
  }

  function drawNode(p, a, cam) {
    const r = 0.12 * cam.S * p[3];
    ctx.save(); ctx.globalAlpha = a;
    const g = ctx.createRadialGradient(p[0] - r * .3, p[1] - r * .3, r * .1, p[0], p[1], r);
    g.addColorStop(0, '#e0e7ff'); g.addColorStop(0.45, '#818cf8'); g.addColorStop(1, '#312e81');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawEdge(A, B, ax, a, cam) {
    const d = [0, 0, 0]; d[ax] = 1;
    const pp = [0, 0, 0]; pp[(ax + 1) % 3] = 1;
    const mid = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2, (A[2] + B[2]) / 2];
    const nr = 0.11, hr = 0.17;
    const at = (c, ...v) => proj([c[0] + (v[0] || 0), c[1] + (v[1] || 0), c[2] + (v[2] || 0)], cam);
    const s1 = at([A[0] + d[0] * nr, A[1] + d[1] * nr, A[2] + d[2] * nr]);
    const e1 = at([mid[0] - d[0] * hr, mid[1] - d[1] * hr, mid[2] - d[2] * hr]);
    const s2 = at([mid[0] + d[0] * hr, mid[1] + d[1] * hr, mid[2] + d[2] * hr]);
    const e2 = at([B[0] - d[0] * nr, B[1] - d[1] * nr, B[2] - d[2] * nr]);
    const mp = proj(mid, cam);
    const lw = Math.max(1, 0.03 * cam.S * mp[3]);
    ctx.save(); ctx.globalAlpha = a;
    ctx.strokeStyle = '#ece7dc'; ctx.lineWidth = lw; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(s1[0], s1[1]); ctx.lineTo(e1[0], e1[1]);
    ctx.moveTo(s2[0], s2[1]); ctx.lineTo(e2[0], e2[1]);
    ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const th = i * Math.PI / 3;
      const v = proj([
        mid[0] + d[0] * hr * Math.cos(th) + pp[0] * hr * Math.sin(th),
        mid[1] + d[1] * hr * Math.cos(th) + pp[1] * hr * Math.sin(th),
        mid[2] + d[2] * hr * Math.cos(th) + pp[2] * hr * Math.sin(th)], cam);
      i ? ctx.lineTo(v[0], v[1]) : ctx.moveTo(v[0], v[1]);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(236,231,220,0.10)'; ctx.fill();
    ctx.strokeStyle = '#cfc8b8'; ctx.lineWidth = Math.max(1, lw * 0.8); ctx.stroke();
    ctx.restore();
  }

  function drawPore(p, a, cam) {
    const R = 0.36 * cam.S * p[3];
    ctx.save(); ctx.globalAlpha = a;
    const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], R);
    g.addColorStop(0, 'rgba(253,186,116,0.30)'); g.addColorStop(1, 'rgba(253,186,116,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(p[0], p[1], R, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function label(str, tx, ty, align, anchor, color, a) {
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a;
    const ex = align === 'right' ? tx + 20 : tx - 20;
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ex, ty - 14); ctx.lineTo(anchor[0], anchor[1]); ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(anchor[0], anchor[1], 6, 0, Math.PI * 2); ctx.fill();
    text(str, tx, ty, 44, color, 700, align);
    ctx.restore();
  }

  function drawLattice(t, latIn, opt) {
    const prog = clamp((t - 6.2) / 4.4) * 4;      // builds the single cell
    const q = clamp((t - 12.0) / 5.6);            // grows the crystal
    const m = ease(clamp((t - 11.4) / 1.6));      // camera pull-back
    const full = t >= 11.4 ? 6 : 1;
    const lat = latIn !== undefined ? latIn : 1 - clamp((t - 18.0) / 0.8);
    const alphaN = (i, j, k) => {
      const d = i + j + k;
      if (i <= 1 && j <= 1 && k <= 1) return clamp(prog - d) * lat;
      return clamp(q * 17 - (d - 2)) * lat;
    };
    const cam = {
      ay: 0.55 + 0.30 * t, ax: 0.42 + 0.05 * Math.sin(t * 0.6),
      S: lerp(430, (opt && opt.S) || 80, m), cx: lerp(960, (opt && opt.cx) || 540, m), cy: lerp(540, 560, m),
      c: [lerp(.5, 3, m), lerp(.5, 3, m), lerp(.5, 3, m)]
    };
    const items = [];
    for (let i = 0; i <= full; i++) for (let j = 0; j <= full; j++) for (let k = 0; k <= full; k++) {
      const a = alphaN(i, j, k);
      if (a <= 0.01) continue;
      const p = proj([i, j, k], cam);
      items.push({ z: p[2], f: () => drawNode(p, a, cam) });
      const idx = [i, j, k];
      for (let ax = 0; ax < 3; ax++) {
        if (idx[ax] === 0) continue;
        const prev = idx.slice(); prev[ax] -= 1;
        const pz = proj(prev, cam)[2];
        items.push({ z: (p[2] + pz) / 2, f: () => drawEdge(prev, idx, ax, a, cam) });
      }
    }
    for (let i = 0; i < full; i++) for (let j = 0; j < full; j++) for (let k = 0; k < full; k++) {
      const a = alphaN(i + 1, j + 1, k + 1);
      if (a <= 0.01) continue;
      const p = proj([i + .5, j + .5, k + .5], cam);
      items.push({ z: p[2], f: () => drawPore(p, a, cam) });
    }
    items.sort((a, b) => b.z - a.z);
    for (const it of items) it.f();

    // labels on the single cell
    const lf = 1 - clamp((t - 11.0) / 0.6);
    if (t < 11.6) {
      label('Metal node', 330, 270, 'right', proj([0, 0, 0], cam), '#a5b4fc', clamp((prog - 1.0) / 0.6) * lf);
      label('Organic linker', 330, 830, 'right', proj([.5, 0, 0], cam), '#ece7dc', clamp((prog - 2.2) / 0.6) * lf);
      label('Pore: empty space', 1360, 270, 'left', proj([.5, .5, .5], cam), '#fdba74', clamp((prog - 3.4) / 0.6) * lf);
    }
  }

  // ---------- tennis court icon ----------
  function court(x, y, w, h, s) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2); ctx.scale(s, s); ctx.translate(-w / 2, -h / 2);
    ctx.fillStyle = '#233a5e'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#ece7dc'; ctx.lineWidth = 1.6;
    ctx.strokeRect(1, 1, w - 2, h - 2);
    const iy = h * 0.14;
    ctx.beginPath();
    ctx.moveTo(1, iy); ctx.lineTo(w - 1, iy);
    ctx.moveTo(1, h - iy); ctx.lineTo(w - 1, h - iy);
    ctx.moveTo(w * .27, iy); ctx.lineTo(w * .27, h - iy);
    ctx.moveTo(w * .73, iy); ctx.lineTo(w * .73, h - iy);
    ctx.moveTo(w * .27, h / 2); ctx.lineTo(w * .73, h / 2);
    ctx.stroke();
    ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(w / 2, -3); ctx.lineTo(w / 2, h + 3); ctx.stroke();
    ctx.restore();
  }

  function drawPanel(t, keep) {
    const pa = ease(clamp((t - 12.3) / 0.8));
    if (pa <= 0) return;
    ctx.save(); ctx.globalAlpha = pa;
    const n = 40 * ease(clamp((t - 12.9) / 4.9));
    const cnt = Math.ceil(n - 1e-6);
    text(String(cnt), 1090, 400, 170, '#ffffff', 800, 'left');
    text('tennis courts', 1090, 468, 56, '#a5b4fc', 700, 'left');
    const x0 = 1090, y0 = 520, w = 78, h = 42, g = 10;
    for (let i = 0; i < Math.min(cnt, 40); i++) {
      const frac = clamp(n - i);
      if (frac <= 0) continue;
      const s = 0.5 + 0.5 * easeOut(frac);
      const c = i % 8, r = Math.floor(i / 8);
      ctx.globalAlpha = pa * clamp(frac * 2);
      court(x0 + c * (w + g), y0 + r * (h + g), w, h, s);
    }
    ctx.globalAlpha = pa;
    text('of surface area in just 1 gram', 1090, 840, 36, '#94a3b8', 500, 'left');
    ctx.restore();
  }


  // ---------- Scene D: desert water harvester ----------
  function dune(base, amp, wl, ph, color) {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(-300, 1300);
    for (let x = -300; x <= 2220; x += 20) ctx.lineTo(x, base + amp * Math.sin(x / wl + ph) + amp * 0.4 * Math.sin(x / (wl * 0.43) + ph * 2));
    ctx.lineTo(2220, 1300); ctx.closePath(); ctx.fill();
  }
  function drawD(t) {
    const a = clamp((t - 19.3) / 1.2);
    if (a <= 0) return;
    const u = ease(clamp((t - 19.0) / 3.0));
    const Z = Math.exp(3.7 * (1 - u));
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(960, 705); ctx.scale(Z, Z); ctx.translate(-960, -705);
    const sk = ctx.createLinearGradient(0, 0, 0, 720);
    sk.addColorStop(0, '#0d1024'); sk.addColorStop(0.55, '#2a2150'); sk.addColorStop(0.85, '#9a5468'); sk.addColorStop(1, '#f2a766');
    ctx.fillStyle = sk; ctx.fillRect(-400, -1200, 2720, 1920);
    ctx.fillStyle = '#171227'; ctx.fillRect(-400, 700, 2720, 800);
    for (let i = 0; i < 46; i++) {
      ctx.fillStyle = `rgba(236,231,220,${(0.25 + 0.4 * ((i * 37) % 10) / 10) * clamp(3 - Z)})`;
      ctx.beginPath(); ctx.arc((i * 173) % 1920, 20 + (i * 97) % 400, 1.3 + (i % 3) * 0.5, 0, Math.PI * 2); ctx.fill();
    }
    const sg = ctx.createRadialGradient(1450, 690, 10, 1450, 690, 460);
    sg.addColorStop(0, 'rgba(255,214,170,0.95)'); sg.addColorStop(0.15, 'rgba(255,190,140,0.55)'); sg.addColorStop(1, 'rgba(255,170,120,0)');
    ctx.fillStyle = sg; ctx.fillRect(900, 200, 1100, 700);
    dune(712, 16, 260, 1.0, '#4a2f50');
    dune(765, 24, 330, 2.2, '#2d2142');
    dune(868, 8, 200, 0.5, '#171227');
    // vapour drifting into the vents
    const va = clamp((t - 21.2) / 1.0);
    for (let i = 0; i < 18; i++) {
      const p = (t * 0.25 + i * 0.137) % 1;
      const x0 = 380 + (i * 53) % 300, y0 = 560 + (i * 37) % 240;
      const x1 = 790, y1 = 604 + (i % 8) * 24;
      ctx.fillStyle = `rgba(236,231,220,${Math.sin(Math.PI * p) * 0.6 * va})`;
      ctx.beginPath(); ctx.arc(lerp(x0, x1, p), lerp(y0, y1, p), 3.2, 0, Math.PI * 2); ctx.fill();
    }
    // legs + body
    ctx.fillStyle = '#10141f'; ctx.fillRect(800, 810, 16, 66); ctx.fillRect(1104, 810, 16, 66);
    rr(760, 560, 400, 260, 14); ctx.fillStyle = '#1c2133'; ctx.fill(); ctx.strokeStyle = '#3b4360'; ctx.lineWidth = 3; ctx.stroke();
    // solar panel on top
    ctx.beginPath(); ctx.moveTo(740, 560); ctx.lineTo(1180, 560); ctx.lineTo(1130, 505); ctx.lineTo(790, 505); ctx.closePath();
    ctx.fillStyle = '#243056'; ctx.fill(); ctx.strokeStyle = '#4a5a8c'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath();
    for (let i = 1; i < 6; i++) { const x = 740 + i * 73; ctx.moveTo(x - (x - 960) * 0.0 + (960 - x) * 0.11 * 0 , 560); ctx.lineTo(790 + i * 56.7, 505); }
    ctx.moveTo(765, 532); ctx.lineTo(1155, 532);
    ctx.stroke();
    // vents
    ctx.fillStyle = '#0a0d18';
    for (let i = 0; i < 8; i++) ctx.fillRect(778, 600 + i * 24, 74, 8);
    // sorbent window
    rr(870, 645, 180, 120, 10); ctx.fillStyle = '#080a16'; ctx.fill(); ctx.strokeStyle = '#59628a'; ctx.lineWidth = 3; ctx.stroke();
    const wg = ctx.createRadialGradient(960, 705, 2, 960, 705, 95);
    wg.addColorStop(0, 'rgba(253,186,116,0.45)'); wg.addColorStop(1, 'rgba(253,186,116,0)');
    ctx.fillStyle = wg; ctx.fillRect(870, 645, 180, 120);
    ctx.fillStyle = 'rgba(236,231,220,0.7)';
    for (let i = 0; i < 70; i++) { ctx.beginPath(); ctx.arc(885 + (i * 61) % 150, 660 + (i * 29) % 90, 1.2, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#fff5e6'; ctx.beginPath(); ctx.arc(960, 705, 3, 0, Math.PI * 2); ctx.fill();
    // pipe + jar
    ctx.strokeStyle = '#3b4360'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(1160, 770); ctx.lineTo(1330, 770); ctx.lineTo(1330, 784); ctx.stroke();
    const wl = 6 + 60 * clamp((t - 21.5) / 4.5);
    ctx.fillStyle = 'rgba(147,197,253,0.85)';
    rr(1288, 880 - wl, 84, wl, 6); ctx.fill();
    rr(1285, 792, 90, 88, 10); ctx.strokeStyle = 'rgba(236,231,220,0.75)'; ctx.lineWidth = 3; ctx.stroke();
    if (t > 21.5) {
      const ph = (t * 1.1) % 1, surf = 880 - wl;
      const y = 790 + ph * ph * (surf - 796);
      ctx.fillStyle = '#bfdbfe'; ctx.beginPath(); ctx.arc(1330, y, 5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    // captions
    text('Water from desert air', 960, 150, 76, '#f8fafc', 800, 'center', ease(clamp((t - 23.0) / 0.8)));
    text('MOFs can pull drinking water out of dry air.', 960, 218, 40, '#ece7dc', 500, 'center', ease(clamp((t - 23.6) / 0.8)));
  }


  // ================= EXPLAINER =================
  const COL_ZN = ['#e0e7ff', '#818cf8', '#312e81'];
  const COL_CU = ['#ffedd5', '#f0a070', '#7c3a1d'];
  const COL_MINT = ['#d1fae5', '#6ee7b7', '#065f46'];
  const COL_SLATE = ['#f1f5f9', '#94a3b8', '#334155'];
  const CREAM = '#ece7dc', LILAC = '#a5b4fc', PEACH = '#fdba74', MUTE = '#94a3b8';
  // fo = 0 means "no fade-out, vanish at b". Guarded: the naive form does 0/0
  // when E lands exactly on b, which silently yields globalAlpha = NaN.
  const beat = (E, a, b, fi = 0.4, fo = 0.4) =>
    clamp((E - a) / fi) * (fo > 0 ? 1 - clamp((E - (b - fo)) / fo) : (E >= b ? 0 : 1));

  function sph2(x, y, r, a, col) {
    ctx.save(); ctx.globalAlpha *= a;
    const g = ctx.createRadialGradient(x - r * .3, y - r * .3, r * .1, x, y, r);
    g.addColorStop(0, col[0]); g.addColorStop(0.45, col[1]); g.addColorStop(1, col[2]);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function sph3(w, rU, a, cam, col) {
    const p = proj(w, cam), r = rU * cam.S * p[3];
    if (r < 0.5) return;
    sph2(p[0], p[1], r, a, col);
  }
  function rod(x1, y1, x2, y2, w, a, col) {
    ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = col || CREAM; ctx.lineWidth = w; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
  }
  function hex2(x, y, r, rot, a, lw = 5, fill = 'rgba(236,231,220,0.12)') {
    ctx.save(); ctx.globalAlpha *= a;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const th = rot + i * Math.PI / 3, px = x + r * Math.cos(th), py = y + r * Math.sin(th);
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
    ctx.strokeStyle = CREAM; ctx.lineWidth = lw; ctx.stroke(); ctx.restore();
  }
  function title(E, str, a, b) { text(str, 120, 130, 46, LILAC, 800, 'left', beat(E, a, b)); }

  // ---- Beat A: a node and a linker snap together ----
  function beatA(E) {
    const a = beat(E, 0, 3.4); if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    const y = 560, xl = 640, xr = 1280, R = 96, hx = 960, hr = 74;
    const q = easeOut(clamp((E - 0.7) / 1.0));
    const pulse = 1 + 0.12 * Math.sin(Math.PI * clamp((E - 1.7) / 0.5));
    sph2(xl, y, R * pulse, 1, COL_ZN); sph2(xr, y, R * pulse, 1, COL_ZN);
    const ly = y - (1 - q) * 280, la = clamp((E - 0.5) / 0.4);
    rod(xl + R, ly, hx - hr, ly, 12, la); rod(hx + hr, ly, xr - R, ly, 12, la);
    hex2(hx, ly, hr, 0, la, 7);
    if (E > 1.7 && E < 2.6) {
      const k = (E - 1.7) / 0.9;
      ctx.save(); ctx.globalAlpha *= (1 - k) * 0.8; ctx.strokeStyle = PEACH; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(hx, y, lerp(60, 300, easeOut(k)), 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    text('Metal node', xl, 730, 44, LILAC, 700, 'center', clamp((E - 2.0) / 0.4));
    text('Metal node', xr, 730, 44, LILAC, 700, 'center', clamp((E - 2.0) / 0.4));
    text('Organic linker', hx, 420, 44, CREAM, 700, 'center', clamp((E - 2.0) / 0.4));
    ctx.restore();
  }

  // ---- Beat B: three node geometries side by side ----
  function dirs12() {
    const r = [], s = Math.SQRT1_2;
    for (const a of [-1, 1]) for (const b of [-1, 1]) r.push([a * s, b * s, 0], [a * s, 0, b * s], [0, a * s, b * s]);
    return r;
  }
  const NODES = [
    { name: 'Zn₄O', ex: 'MOF-5', geo: 'octahedral', r0: .26,
      dirs: [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]], core: [[0, 0, 0, .24, COL_ZN]] },
    { name: 'Cu₂ paddlewheel', ex: 'HKUST-1', geo: 'square planar', r0: .28,
      dirs: [[1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1]], core: [[0, .13, 0, .17, COL_CU], [0, -.13, 0, .17, COL_CU]] },
    { name: 'Zr₆O₄(OH)₄', ex: 'UiO-66', geo: 'cuboctahedral', r0: .32,
      dirs: dirs12(), core: [[0, 0, 0, .3, COL_SLATE]] }
  ];
  function perp(d) {
    const a = Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    const c = [d[1] * a[2] - d[2] * a[1], d[2] * a[0] - d[0] * a[2], d[0] * a[1] - d[1] * a[0]];
    const l = Math.hypot(c[0], c[1], c[2]);
    return [c[0] / l, c[1] / l, c[2] / l];
  }
  function arm3(d, r0, f, cam, col) {
    const p = perp(d), hr = 0.13 * f;
    const at = s => { const k = r0 + (s - r0) * f; return [d[0] * k, d[1] * k, d[2] * k]; };
    const off = (c, o) => [c[0] + d[0] * o, c[1] + d[1] * o, c[2] + d[2] * o];
    const mid = at(0.62), mp = proj(mid, cam);
    const s1 = proj(at(r0), cam), e1 = proj(off(mid, -hr), cam), s2 = proj(off(mid, hr), cam), e2 = proj(at(0.93), cam);
    const lw = Math.max(1.5, 0.03 * cam.S * mp[3]);
    ctx.save(); ctx.strokeStyle = CREAM; ctx.lineWidth = lw; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(s1[0], s1[1]); ctx.lineTo(e1[0], e1[1]); ctx.moveTo(s2[0], s2[1]); ctx.lineTo(e2[0], e2[1]); ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const th = i * Math.PI / 3;
      const v = proj([mid[0] + d[0] * hr * Math.cos(th) + p[0] * hr * Math.sin(th),
                      mid[1] + d[1] * hr * Math.cos(th) + p[1] * hr * Math.sin(th),
                      mid[2] + d[2] * hr * Math.cos(th) + p[2] * hr * Math.sin(th)], cam);
      i ? ctx.lineTo(v[0], v[1]) : ctx.moveTo(v[0], v[1]);
    }
    ctx.closePath(); ctx.fillStyle = 'rgba(236,231,220,0.12)'; ctx.fill(); ctx.lineWidth = lw * 0.8; ctx.stroke();
    ctx.restore();
    sph3(at(1.0), 0.075 * f, 1, cam, col);
  }
  function beatB(E) {
    const a = beat(E, 17.4, 26.4); if (a <= 0) return;
    title(E, 'The node sets the geometry', 17.4, 26.4);
    const e = E - 17.4;
    ctx.save(); ctx.globalAlpha = a;
    ctx.strokeStyle = 'rgba(236,231,220,0.12)'; ctx.lineWidth = 2;
    for (const x of [660, 1260]) { ctx.beginPath(); ctx.moveTo(x, 240); ctx.lineTo(x, 1010); ctx.stroke(); }
    NODES.forEach((N, k) => {
      const cx = 360 + 600 * k;
      const cam = { ay: 0.5 + 0.5 * E + k * 0.9, ax: 0.36, S: 200, cx, cy: 470, c: [0, 0, 0] };
      const n = N.dirs.length, stag = Math.min(0.28, 2.0 / n), col = N.core[0][4];
      const items = []; let cnt = 0;
      N.core.forEach(c => { const w = [c[0], c[1], c[2]]; items.push({ z: proj(w, cam)[2], f: () => sph3(w, c[3], 1, cam, c[4]) }); });
      N.dirs.forEach((d, i) => {
        const f = easeOut(clamp((e - 0.5 - k * 0.3 - i * stag) / 0.55));
        if (f <= 0) return;
        if (f > 0.4) cnt++;
        items.push({ z: proj([d[0] * 0.6, d[1] * 0.6, d[2] * 0.6], cam)[2], f: () => arm3(d, N.r0, f, cam, col) });
      });
      items.sort((x, y) => y.z - x.z); items.forEach(it => it.f());
      text(N.name, cx, 770, 52, '#f8fafc', 800, 'center');
      text(N.ex + ' · ' + N.geo, cx, 818, 30, MUTE, 500, 'center');
      text(String(cnt), cx, 930, 120, '#f8fafc', 800, 'center');
      text('connections', cx, 982, 34, LILAC, 700, 'center');
    });
    ctx.restore();
  }

  // ---- Beat C: modularity (swap the metal | stretch the linker) ----
  function ringFracs(s) {
    const k = Math.floor(s) + 1, u = s - Math.floor(s), out = [];
    for (let i = 0; i < k; i++) out.push({ f: lerp((i + 1) / (k + 1), (i + 1) / (k + 2), u), a: 1 });
    if (u > 0) out.push({ f: (k + 1) / (k + 2), a: u });
    return out;
  }
  function drawGrid(cx, cy, dd, nodeFn, fracs) {
    const R = 26, RH = 19, P = (i, j) => [cx + (i - 1) * dd, cy + (j - 1) * dd];
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      const x = cx + (i - 0.5) * dd, y = cy + (j - 0.5) * dd, r = dd * 0.4;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(253,186,116,0.34)'); g.addColorStop(1, 'rgba(253,186,116,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    const link = (a, b, rot) => {
      const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
      rod(a[0] + ux * R, a[1] + uy * R, b[0] - ux * R, b[1] - uy * R, 6, 1);
      fracs.forEach(fr => hex2(a[0] + dx * fr.f, a[1] + dy * fr.f, RH, rot, fr.a, 4, '#2b3148'));
    };
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      if (i < 2) link(P(i, j), P(i + 1, j), 0);
      if (j < 2) link(P(i, j), P(i, j + 1), Math.PI / 2);
    }
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const [x, y] = P(i, j), o = nodeFn(i, j); sph2(x, y, R * o.pop, 1, o.col); }
  }
  function beatC(E) {
    const a = beat(E, 26.4, 36.4); if (a <= 0) return;
    title(E, 'Modularity', 26.4, 36.4);
    const e = E - 26.4;
    ctx.save(); ctx.globalAlpha = a;
    ctx.strokeStyle = 'rgba(236,231,220,0.12)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(960, 230); ctx.lineTo(960, 1010); ctx.stroke();
    // left: swap the metal
    text('Swap the metal', 510, 262, 58, '#f8fafc', 800, 'center', beat(e, 0.2, 10, 0.4, 0));
    text('→ same framework, new properties', 510, 316, 32, LILAC, 600, 'center', beat(e, 0.8, 10, 0.4, 0));
    const s1 = 1.8, s2 = 5.2;
    const metalNode = (i, j) => {
      const dc = Math.hypot(i - 1, j - 1) * 0.18;
      const t1 = s1 + dc, t2 = s2 + dc;
      const col = e < t1 ? COL_ZN : (e < t2 ? COL_CU : COL_MINT);
      const since = e < t1 ? 99 : (e < t2 ? e - t1 : e - t2);
      return { col, pop: 1 + 0.35 * Math.exp(-since * 7) };
    };
    drawGrid(510, 600, 190, metalNode, [{ f: 0.5, a: 1 }]);
    const sym = e < s1 + 0.4 ? ['Zn', COL_ZN[1]] : (e < s2 + 0.4 ? ['Cu', COL_CU[1]] : ['Ni', COL_MINT[1]]);
    text(sym[0], 510, 930, 110, sym[1], 800, 'center', beat(e, 0.8, 10, 0.4, 0));
    // right: stretch the linker
    text('Stretch the linker', 1410, 262, 58, '#f8fafc', 800, 'center', beat(e, 0.2, 10, 0.4, 0));
    text('→ same framework, bigger pores', 1410, 316, 32, PEACH, 600, 'center', beat(e, 0.8, 10, 0.4, 0));
    const sP = ease(clamp((e - 1.8) / 1.6)) + ease(clamp((e - 5.2) / 1.6));
    drawGrid(1410, 590, 120 + 45 * sP, () => ({ col: COL_ZN, pop: 1 }), ringFracs(sP));
    const kr = Math.round(sP) + 1;
    text(kr + (kr > 1 ? ' rings' : ' ring'), 1410, 905, 80, '#f8fafc', 800, 'center', beat(e, 0.8, 10, 0.4, 0));
    text(['small pores', 'medium pores', 'large pores'][kr - 1], 1410, 965, 40, PEACH, 700, 'center', beat(e, 0.8, 10, 0.4, 0));
    ctx.restore();
  }

  // ================= v4: What is a MOF? =================
  function introTitle(T) {
    text('What is a MOF?', 960, 590, 120, '#f8fafc', 800, 'center', beat(T, 0.2, 2.0, 0.6, 0.4));
    title(T, 'What is a MOF?', 1.6, 17.4);
  }
  function introCard(T) {
    const a = beat(T, 1.8, 5.0, 0.3, 0.4); if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    const y = 520;
    const q1 = easeOut(clamp((T - 2.0) / 0.6)), q2 = clamp((T - 2.7) / 0.4), q3 = easeOut(clamp((T - 3.0) / 0.6));
    sph2(560, y, 120 * q1, 1, COL_ZN);
    text('Metal', 560, 740, 68, LILAC, 800, 'center', q1);
    text('+', 960, y + 40, 130, MUTE, 700, 'center', q2);
    rod(1130, y, 1245, y, 12, q3); hex2(1315, y, 70, 0, q3, 7); rod(1385, y, 1500, y, 12, q3);
    text('Linker', 1315, 740, 68, CREAM, 800, 'center', q3);
    ctx.restore();
  }
  function cubeIntro(T) {
    if (T < 5.0 || T > 18.0) return;
    drawLattice(6.2 + (T - 5.0), 1 - clamp((T - 17.0) / 0.8), { cx: 960, S: 100 });
  }
  function drawExplainer(E) {
    introTitle(E); introCard(E); cubeIntro(E); beatB(E); beatC(E);
  }
  function endGram(T) {   // 1 g powder -> crossfade -> growing crystal + tennis courts
    const e = T - 36.6; if (e < 0) return;
    if (e < 5.6) {
      const z = 1 + 0.12 * ease(clamp((e - 4.0) / 1.6));
      ctx.save(); ctx.translate(960, 700); ctx.scale(z, z); ctx.translate(-960, -700);
      drawA(Math.min(e, 5.1));
      ctx.restore();
      const ov = Math.max(1 - clamp(e / 0.5), clamp((e - 4.3) / 1.1));
      if (ov > 0) { ctx.save(); ctx.globalAlpha = ov; bg(); ctx.restore(); }
    }
    if (e >= 5.2) drawLattice(e + 7.4, clamp((e - 5.2) / 0.9));
    drawPanel(e + 6.3);
  }
  function draw(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    bg();
    drawExplainer(t);
    endGram(t);
  }



  return { draw, drawD, W, H };
}
