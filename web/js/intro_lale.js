/* Özel açılış: lale. Beyaz lale dönerek açar, yaprakları dökülür, yerine bordo yapraklar açar;
   çevrede laleler açar, ortada kalp ve içinde C çizilir, kalp kırmızıya boyanır;
   sonunda bir bordo lale savrulup ekranı kaplar. */
'use strict';

Intro.lale = function (ctx, W, H, bg, wrap, end, isDone) {
  const cl = x => x < 0 ? 0 : x > 1 ? 1 : x;
  const ease = x => { x = cl(x); return x * x * (3 - 2 * x); };
  const out = x => { x = cl(x); return 1 - Math.pow(1 - x, 3); };
  const inn = x => { x = cl(x); return x * x * x; };
  const back = x => { if (x <= 0) return 0; if (x >= 1) return 1; const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };

  const T = { stem: 0, bloom: 600, bloomEnd: 3000, fall: 3700, red: 4900, redEnd: 6600, field: 6200, fieldEnd: 8000, dim: 8100, heart: 8400, heartEnd: 9900, c: 9950, cEnd: 10950, fill: 11050, fillEnd: 11950, blow: 12800, end: 14600 };

  const WHITE = { hi: '#FFFFFF', mid: '#F5EEE8', lo: '#CFC0B4', line: 'rgba(140,110,100,.4)' };
  const BORD = { hi: '#C9496F', mid: '#8E1B3A', lo: '#4A0A1D', line: 'rgba(30,0,8,.45)' };

  const petalPath = (c, w, h) => {
    c.beginPath(); c.moveTo(0, 0);
    c.bezierCurveTo(w * .95, -h * .08, w * 1.02, -h * .72, w * .16, -h);
    c.quadraticCurveTo(0, -h * 1.05, -w * .16, -h);
    c.bezierCurveTo(-w * 1.02, -h * .72, -w * .95, -h * .08, 0, 0);
    c.closePath();
  };

  /* üç boyutlu gibi görünen lale başı: 6 yaprak bir eksen etrafında döner */
  const tulip = (c, x, y, h, rot, open, pets) => {
    const items = [];
    for (let k = 0; k < 6; k++) {
      const p = pets[k]; if (!p || p.s <= 0) continue;
      const th = rot + k * Math.PI / 3;
      items.push({ k, th, z: Math.cos(th), p });
    }
    items.sort((a, b) => a.z - b.z);
    for (const it of items) {
      const { k, th, z, p } = it, inner = k % 2;
      const hh = h * (inner ? .92 : 1) * p.s, w = h * .4 * (inner ? .9 : 1) * (.72 + .28 * open);
      const sx = Math.sin(th), ws = .26 + .74 * Math.abs(z);
      c.save(); c.translate(x + sx * h * .13 * (.5 + open), y); c.rotate(sx * (.1 + open * .42)); c.scale(ws, 1);
      const g = c.createLinearGradient(0, 0, 0, -hh);
      g.addColorStop(0, p.col.lo); g.addColorStop(.5, p.col.mid); g.addColorStop(1, p.col.hi);
      c.fillStyle = g; petalPath(c, w, hh); c.fill();
      /* arkadaki yapraklar gölgede kalır */
      const d = (1 - z) / 2;
      if (d > .02) { c.fillStyle = `rgba(20,0,8,${.32 * d})`; c.fill(); }
      c.strokeStyle = p.col.line; c.lineWidth = .9; c.stroke();
      if (z > .2) { c.strokeStyle = `rgba(255,255,255,${.22 * z})`; c.lineWidth = 1.4; c.beginPath(); c.moveTo(0, -hh * .08); c.quadraticCurveTo(w * .1, -hh * .5, 0, -hh * .9); c.stroke(); }
      c.restore();
    }
  };

  const stem = (c, x, y, h, k, lean) => {
    if (k <= 0) return;
    const y0 = H + 24, y1 = y0 + (y - y0) * k, wx = x + lean;
    c.save(); c.lineCap = 'round'; c.strokeStyle = '#3E6A33'; c.lineWidth = Math.max(3, h * .085);
    c.beginPath(); c.moveTo(wx, y0); c.quadraticCurveTo(wx - lean * 1.6, (y0 + y1) / 2, x, y1); c.stroke();
    if (k > .5) {
      const s = out((k - .5) / .5), ly = y0 + (y1 - y0) * .3;
      c.fillStyle = '#4C8740';
      c.save(); c.translate(wx - lean * .4, ly); c.rotate(-.35); c.scale(s, s);
      c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(h * .35, -h * .3, h * .3, -h * 1.1, h * .05, -h * 1.5); c.bezierCurveTo(-h * .05, -h * .9, -h * .2, -h * .3, 0, 0); c.fill();
      c.restore();
    }
    c.restore();
  };

  const cx = W / 2, hy = H * .42, MH = Math.min(W * .31, 135);
  const main = Array.from({ length: 6 }, () => ({ s: 1, col: WHITE, gone: false }));
  const fallers = [];
  const order = [0, 3, 1, 4, 2, 5];

  /* çevredeki laleler */
  const field = [];
  const addRow = (yf, n, hMin, hMax, onlySides) => {
    for (let i = 0; i < n; i++) {
      const xf = (i + .5) / n + (Math.random() - .5) * .08;
      if (onlySides && xf > .22 && xf < .78) continue;
      field.push({ x: xf * W, y: H * yf + (Math.random() - .5) * 18, h: hMin + Math.random() * (hMax - hMin), col: Math.random() < .5 ? BORD : WHITE, rot: Math.random() * 6.28, spd: (Math.random() < .5 ? -1 : 1) * (.25 + Math.random() * .35), lean: (Math.random() - .5) * 30 });
    }
  };
  addRow(.6, 5, 34, 42, true); addRow(.72, 5, 40, 50, false); addRow(.86, 6, 48, 60, false);
  field.forEach((f, i) => { f.at = T.field + (T.fieldEnd - T.field) * Math.pow(i / field.length, .8) * (.85 + Math.random() * .15); });
  /* savrulacak lale: ortadaki sıradan bordo bir lale */
  const mid = field.filter(f => f.y < H * .8 && f.y > H * .65);
  const flyer = mid[(mid.length / 2) | 0] || field[0]; flyer.col = BORD;
  field.sort((a, b) => a.y - b.y);

  /* kalp ve C */
  const HC = { x: cx, y: hy - MH * .42 }, HS = Math.min(W * .66, 270) / 34;
  const heartPts = [];
  for (let i = 0; i <= 240; i++) {
    const a = i / 240 * Math.PI * 2;
    heartPts.push([HC.x + 16 * Math.pow(Math.sin(a), 3) * HS, HC.y - (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * HS - 1 * HS]);
  }
  const heartFull = c => { c.beginPath(); heartPts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); };
  const CR = 5.2 * HS, CY = HC.y + 1.2 * HS, A0 = -.9, SPAN = Math.PI * 2 - 1.8;
  const cPt = u => { const a = A0 - u * SPAN; return [HC.x + CR * Math.cos(a), CY + CR * 1.08 * Math.sin(a)]; };
  const drawC = (c, f) => {
    c.save(); c.lineCap = 'round'; c.strokeStyle = '#FFFFFF'; c.shadowColor = 'rgba(255,255,255,.6)'; c.shadowBlur = 8;
    const n = 80, m = Math.floor(n * f);
    for (let i = 0; i < m; i++) {
      const u0 = i / n, u1 = (i + 1) / n, [x0, y0] = cPt(u0), [x1, y1] = cPt(u1);
      c.lineWidth = 3.5 + 7.5 * Math.sin(Math.PI * (u0 + u1) / 2);
      c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
    }
    c.restore();
  };

  const t0 = performance.now(); let last = t0;
  const frame = now => {
    if (isDone()) return;
    const t = now - t0, dt = Math.min(.05, (now - last) / 1000); last = now;
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(cx, hy - MH * .5, 10, cx, hy, H * .7);
    glow.addColorStop(0, 'rgba(255,230,235,.10)'); glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

    const rot = t / 1400;
    /* 1) beyaz lale açar ve döner */
    stem(ctx, cx, hy, MH, out((t - T.stem) / 1100), 14);
    const grow = back((t - T.bloom) / 1000);
    let open = .15 + .85 * ease((t - T.bloom - 400) / (T.bloomEnd - T.bloom - 400));
    /* 2) beyaz yapraklar dökülür */
    order.forEach((k, i) => {
      const at = T.fall + i * 170;
      if (t >= at && !main[k].gone) {
        main[k].gone = true;
        const th = rot + k * Math.PI / 3, sx = Math.sin(th);
        fallers.push({ x: cx + sx * MH * .2, y: hy - MH * .45, a: sx * .5, va: (Math.random() - .5) * 1.6, vx: sx * 30 + (Math.random() - .5) * 30, vy: 20, ph: Math.random() * 6.28, h: MH * (k % 2 ? .92 : 1), born: t });
      }
    });
    /* 3) yerine bordo yapraklar açar */
    if (t >= T.red - 100) {
      open = .2 + .8 * ease((t - T.red) / (T.redEnd - T.red));
      order.forEach((k, i) => { main[k].col = BORD; main[k].s = out((t - T.red - i * 110) / 900); });
    } else order.forEach(k => { if (main[k].gone) main[k].s = 0; });
    if (grow > 0) { ctx.save(); ctx.translate(cx, hy); ctx.scale(grow, grow); tulip(ctx, 0, 0, MH, rot, open, main); ctx.restore(); }
    /* düşen beyaz yapraklar */
    for (const f of fallers) {
      const age = (t - f.born) / 1000;
      f.vy = Math.min(85, f.vy + 60 * dt); f.ph += dt * 2.2;
      f.x += (f.vx + Math.sin(f.ph) * 40) * dt; f.y += f.vy * dt; f.a += f.va * dt;
      const al = 1 - ease((age - 1.6) / 1.2);
      if (al <= 0) continue;
      ctx.save(); ctx.globalAlpha = al; ctx.translate(f.x, f.y); ctx.rotate(f.a); ctx.scale(.35 + .65 * Math.abs(Math.cos(f.ph * .7)), 1);
      const g = ctx.createLinearGradient(0, f.h * .5, 0, -f.h * .5);
      g.addColorStop(0, WHITE.lo); g.addColorStop(.5, WHITE.mid); g.addColorStop(1, WHITE.hi);
      ctx.fillStyle = g; ctx.translate(0, f.h * .5); petalPath(ctx, f.h * .4, f.h); ctx.fill(); ctx.strokeStyle = WHITE.line; ctx.lineWidth = .9; ctx.stroke();
      ctx.restore();
    }
    /* 4) çevrede bordo ve beyaz laleler açar */
    for (const f of field) {
      if (t < f.at) continue;
      const k = (t - f.at) / 900;
      stem(ctx, f.x, f.y, f.h, out(k * 1.6), f.lean);
      if (f === flyer && t >= T.blow) continue;
      const g = back((k - .25) / .6), o = .15 + .85 * ease((k - .4) / .9);
      if (g <= 0) continue;
      ctx.save(); ctx.translate(f.x, f.y); ctx.scale(g, g);
      tulip(ctx, 0, 0, f.h, f.rot + t / 1000 * f.spd, o, Array.from({ length: 6 }, () => ({ s: 1, col: f.col })));
      ctx.restore();
    }
    /* 5) ortada kalp çizilir, içine C yazılır, kalp kırmızıya boyanır */
    if (t >= T.dim) {
      const d = ease((t - T.dim) / 600);
      ctx.fillStyle = `rgba(18,3,9,${.5 * d})`; ctx.fillRect(0, 0, W, H);
    }
    if (t >= T.heart) {
      const hf = ease((t - T.heart) / (T.heartEnd - T.heart));
      const fillK = out((t - T.fill) / (T.fillEnd - T.fill));
      if (fillK > 0) {
        ctx.save(); heartFull(ctx); ctx.clip();
        const top = HC.y + 12 * HS - fillK * 32 * HS;
        const rg = ctx.createLinearGradient(0, HC.y - 14 * HS, 0, HC.y + 14 * HS);
        rg.addColorStop(0, '#F0344F'); rg.addColorStop(1, '#B30F2B');
        ctx.fillStyle = rg; ctx.fillRect(0, top, W, H);
        ctx.restore();
      }
      const n = Math.floor(heartPts.length * hf);
      ctx.save(); ctx.lineCap = ctx.lineJoin = 'round'; ctx.strokeStyle = '#FFE3EA'; ctx.lineWidth = 5; ctx.shadowColor = 'rgba(255,120,150,.8)'; ctx.shadowBlur = 14;
      ctx.beginPath(); for (let i = 0; i < n; i++) { const [x, y] = heartPts[i]; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
      if (hf < 1 && n > 0) { const [x, y] = heartPts[n - 1]; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 4, 0, 6.283); ctx.fill(); }
      ctx.restore();
      if (t >= T.c) {
        const cf = ease((t - T.c) / (T.cEnd - T.c));
        drawC(ctx, cf);
        if (cf < 1) { const [x, y] = cPt(cf); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 4, 0, 6.283); ctx.fill(); }
      }
    }
    /* 6) bordo bir lale savrulur ve ekranı kaplar */
    if (t >= T.blow) {
      const u = cl((t - T.blow) / (T.end - T.blow - 250));
      const pu = ease(u), sc = 1 + 34 * inn(u);
      const sx0 = flyer.x, sy0 = flyer.y - flyer.h * .5;
      const px = sx0 + (cx - sx0) * pu + Math.sin(u * Math.PI) * W * .28, py = sy0 + (H * .52 - sy0) * pu - Math.sin(u * Math.PI) * H * .12;
      ctx.save(); ctx.translate(px, py); ctx.rotate(Math.sin(u * Math.PI * 1.5) * .9); ctx.scale(sc, sc);
      tulip(ctx, 0, flyer.h * .5, flyer.h, flyer.rot + t / 180, 1, Array.from({ length: 6 }, () => ({ s: 1, col: BORD })));
      ctx.restore();
      if (t >= T.end - 300) { ctx.fillStyle = `rgba(142,27,58,${ease((t - T.end + 300) / 250)})`; ctx.fillRect(0, 0, W, H); }
    }
    if (t >= T.end) { end(); return; }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
};
