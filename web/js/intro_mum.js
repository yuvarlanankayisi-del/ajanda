/* Özel açılış: kasımpatı. Önce bir tomurcuk açılır, sonra ekran çiçeklerle dolar,
   mesaj görünür, ortadan bir kalp çıkıp büyüyerek ekranı kaplar. */
'use strict';

Intro.mum = function (ctx, W, H, bg, wrap, end, isDone) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const ease = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
  const out = x => x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3);
  const back = x => { if (x <= 0) return 0; if (x >= 1) return 1; const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const hex = h => [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16));
  const mix = (a, b, k) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join(''); };
  const shade = (c, k) => mix(c, k < 0 ? '#000000' : '#ffffff', Math.abs(k));

  /* zaman çizelgesi (ms) */
  const T = { stem: 0, bud: 500, bloom: 1500, bloomEnd: 3300, cover: 3400, coverEnd: 5400, text: 5700, line: 750, textOut: 9300, heart: 9600, beat: 10150, grow: 10850, end: 12100 };

  const PAL = [
    ['#F7A8C4', '#B92D5E'], ['#FFE27E', '#DE8E14'], ['#FFF4EA', '#E3BE98'], ['#E2557A', '#7C1534'],
    ['#E6BDF3', '#9147B3'], ['#FFB683', '#D2542A'], ['#FBC8D6', '#D9567F'], ['#F9EFA0', '#C9A42B']
  ];
  const MAIN = ['#F6A3C0', '#A8204E'];
  const LAYERS = [{ n: 34, len: 1, w: .11 }, { n: 30, len: .86, w: .12 }, { n: 26, len: .72, w: .14 }, { n: 22, len: .58, w: .16 }, { n: 18, len: .44, w: .19 }, { n: 13, len: .3, w: .23 }, { n: 8, len: .17, w: .3 }];

  const makeFlower = (x, y, R, pal, at, dur) => ({
    x, y, R, at, dur, rot: Math.random() * 6.28, pal,
    jit: LAYERS.map(L => Array.from({ length: L.n }, () => [(Math.random() - .5) * .18, .88 + Math.random() * .22]))
  });

  const petal = (c, L, w) => {
    c.beginPath(); c.moveTo(0, 0);
    c.bezierCurveTo(w, -L * .28, w * 1.15, -L * .8, 0, -L);
    c.bezierCurveTo(-w * 1.15, -L * .8, -w, -L * .28, 0, 0);
  };

  /* bir kasımpatı çizer; p: açılma oranı 0..1 */
  const drawMum = (c, f, p) => {
    const [o, i] = f.pal;
    c.save(); c.translate(f.x, f.y);
    const pop = p < 1 ? back(Math.min(1, p * 1.25)) : 1;
    c.scale(pop, pop);
    /* hafif gölge */
    const sh = c.createRadialGradient(0, 4, f.R * .2, 0, 4, f.R * 1.15);
    sh.addColorStop(0, 'rgba(0,0,0,.28)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = sh; c.beginPath(); c.arc(0, 4, f.R * 1.15 * Math.min(1, p * 1.4), 0, 6.283); c.fill();
    LAYERS.forEach((L, li) => {
      const q = out((p - li * .075) / .55);
      if (q <= 0) return;
      const col = mix(o, i, li / (LAYERS.length - 1));
      const g = c.createRadialGradient(0, 0, 0, 0, 0, f.R * L.len);
      g.addColorStop(0, shade(col, -.35)); g.addColorStop(.55, col); g.addColorStop(1, shade(col, .28));
      c.fillStyle = g; c.strokeStyle = shade(col, -.3); c.lineWidth = .6; c.globalAlpha = Math.min(1, q * 2);
      for (let k = 0; k < L.n; k++) {
        const [ja, jl] = f.jit[li][k];
        const len = f.R * L.len * jl * (.18 + .82 * q);
        c.save(); c.rotate(f.rot + li * .37 + k * 6.283 / L.n + ja);
        petal(c, len, len * L.w); c.fill(); c.globalAlpha *= .5; c.stroke(); c.globalAlpha = Math.min(1, q * 2);
        c.restore();
      }
    });
    c.globalAlpha = 1;
    const cg = c.createRadialGradient(0, 0, 0, 0, 0, f.R * .06);
    cg.addColorStop(0, shade(i, -.1)); cg.addColorStop(1, shade(i, -.45));
    c.fillStyle = cg; c.beginPath(); c.arc(0, 0, f.R * .06 * Math.min(1, p * 2), 0, 6.283); c.fill();
    c.restore();
  };

  /* pişmiş katman: açılması biten çiçekler buraya bir kez çizilir */
  const bake = document.createElement('canvas'); bake.width = W * dpr; bake.height = H * dpr;
  const bctx = bake.getContext('2d'); bctx.scale(dpr, dpr);

  const cx = W / 2, cy = H * .44, MR = Math.min(W * .34, 150);
  const main = makeFlower(cx, cy, MR, MAIN, T.bloom, T.bloomEnd - T.bloom);

  /* ekranı kaplayacak çiçekler: sık bir ızgara, karışık sırayla */
  const cover = []; const step = 72;
  for (let y = -10; y < H + step; y += step * .86) for (let x = -10 + ((y / step | 0) % 2) * step / 2; x < W + step; x += step)
    cover.push([x + (Math.random() - .5) * 26, y + (Math.random() - .5) * 26]);
  for (let k = cover.length - 1; k > 0; k--) { const j = Math.random() * (k + 1) | 0; [cover[k], cover[j]] = [cover[j], cover[k]]; }
  const N = cover.length;
  const flowers = cover.map(([x, y], k) => makeFlower(x, y, 50 + Math.random() * 30, PAL[Math.random() * PAL.length | 0], T.cover + (T.coverEnd - T.cover) * Math.pow(k / N, .62), 560 + Math.random() * 200));

  /* sap ve yapraklar */
  const stemTop = cy + MR * .15;
  const drawStem = (c, k) => {
    if (k <= 0) return;
    const y0 = H + 20, y1 = y0 + (stemTop - y0) * k;
    c.save(); c.lineCap = 'round';
    c.strokeStyle = '#3F6B33'; c.lineWidth = 7;
    c.beginPath(); c.moveTo(cx + 18, y0); c.quadraticCurveTo(cx - 22, (y0 + y1) / 2 + 40, cx, y1); c.stroke();
    const leaf = (px, py, dir, s) => {
      c.save(); c.translate(px, py); c.rotate(dir * .9); c.scale(s, s);
      c.fillStyle = '#4F8A3F'; c.beginPath(); c.moveTo(0, 0);
      c.bezierCurveTo(18 * dir, -10, 46 * dir, -6, 60 * dir, -26);
      c.bezierCurveTo(44 * dir, 4, 18 * dir, 12, 0, 0); c.fill();
      c.strokeStyle = '#2F5626'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(30 * dir, -4, 58 * dir, -24); c.stroke();
      c.restore();
    };
    const ly1 = y0 + (stemTop - y0) * .35, ly2 = y0 + (stemTop - y0) * .62;
    if (k > .4) leaf(cx - 6, ly1, -1, out((k - .4) / .4));
    if (k > .65) leaf(cx - 4, ly2, 1, out((k - .65) / .35) * .85);
    c.restore();
  };
  const drawBud = (c, s, open) => {
    if (s <= 0) return;
    c.save(); c.translate(cx, cy + MR * .12); c.scale(s * 1.7, s * 1.7);
    /* tomurcuk: yeşil çanak yapraklar, ucunda pembe */
    c.fillStyle = '#C23E6C'; c.beginPath(); c.ellipse(0, -24, 13 + open * 6, 20, 0, 0, 6.283); c.fill();
    c.fillStyle = '#4F8A3F';
    for (let k = -2; k <= 2; k++) {
      c.save(); c.rotate(k * (.32 + open * .35));
      c.beginPath(); c.moveTo(0, 6); c.bezierCurveTo(14, -6, 10, -30, 0, -40); c.bezierCurveTo(-10, -30, -14, -6, 0, 6); c.fill();
      c.restore();
    }
    c.restore();
  };

  /* mesaj kartı */
  const txt = document.createElement('div'); txt.className = 'mumtxt';
  txt.innerHTML = '<span>Kim demiş</span><span>sen evdeyken</span><span>sana çiçek veremem diye?</span>';
  wrap.appendChild(txt);
  const lines = [...txt.children];

  const heartPath = (c, s) => {
    c.beginPath(); c.moveTo(0, s * .32);
    c.bezierCurveTo(-s * .12, s * .22, -s * .62, -s * .02, -s * .5, -s * .36);
    c.bezierCurveTo(-s * .4, -s * .66, -s * .06, -s * .62, 0, -s * .34);
    c.bezierCurveTo(s * .06, -s * .62, s * .4, -s * .66, s * .5, -s * .36);
    c.bezierCurveTo(s * .62, -s * .02, s * .12, s * .22, 0, s * .32); c.closePath();
  };

  let mainBaked = false, fi = 0;
  const t0 = performance.now();
  const frame = now => {
    if (isDone()) return;
    const t = now - t0;
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(cx, cy, 10, cx, cy, H * .7);
    glow.addColorStop(0, 'rgba(255,170,200,.10)'); glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
    ctx.drawImage(bake, 0, 0, W, H);

    /* 1) sap büyür, tomurcuk şişer, kasımpatı açar */
    if (!mainBaked) {
      drawStem(ctx, out((t - T.stem) / 1000));
      const bs = back((t - T.bud) / 700), bo = ease((t - T.bloom + 300) / 500);
      if (t < T.bloom + 500) { ctx.globalAlpha = 1 - ease((t - T.bloom) / 500); drawBud(ctx, bs, bo); ctx.globalAlpha = 1; }
      if (t >= T.bloom) drawMum(ctx, main, ease((t - T.bloom) / (T.bloomEnd - T.bloom)));
      if (t >= T.bloomEnd) { drawStem(bctx, 1); drawMum(bctx, main, 1); mainBaked = true; }
    }
    /* 2) her yerde hızlı hızlı çiçekler açar */
    for (let k = fi; k < flowers.length; k++) {
      const f = flowers[k];
      if (t < f.at) continue;
      const p = (t - f.at) / f.dur;
      if (p >= 1) { if (k === fi) { drawMum(bctx, f, 1); fi++; } else drawMum(ctx, f, 1); }
      else drawMum(ctx, f, p);
    }
    /* 3) mesaj */
    if (t > T.text - 300) {
      const d = ease((t - T.text + 300) / 500) * (1 - ease((t - T.textOut) / 400));
      ctx.fillStyle = `rgba(25,6,14,${.42 * d})`; ctx.fillRect(0, 0, W, H);
    }
    if (t >= T.text && !txt.classList.contains('on') && t < T.textOut) txt.classList.add('on');
    lines.forEach((l, k) => { if (t >= T.text + k * T.line && !l.classList.contains('on')) l.classList.add('on'); });
    if (t >= T.textOut && txt.classList.contains('on')) txt.classList.remove('on');
    /* 4) kalp çıkar, atar, büyüyüp ekranı kaplar */
    if (t >= T.heart) {
      const base = 112;
      let s = base * back((t - T.heart) / 520);
      if (t > T.beat && t < T.grow) { const b = (t - T.beat) / 350; s *= 1 + .13 * Math.max(0, Math.sin(b * Math.PI)) * (b < 2 ? 1 : 0); }
      if (t >= T.grow) { const u = (t - T.grow) / (T.end - T.grow - 200); s = base * Math.exp(Math.log(34) * Math.pow(Math.min(1, u), 1.6)); }
      ctx.save(); ctx.translate(cx, H / 2 + s * .06);
      ctx.shadowColor = 'rgba(255,40,70,.75)'; ctx.shadowBlur = s < 400 ? 34 : 0;
      const hg = ctx.createRadialGradient(-s * .15, -s * .25, s * .05, 0, 0, s * .7);
      hg.addColorStop(0, '#FF6A7E'); hg.addColorStop(.6, '#E01E3C'); hg.addColorStop(1, '#B3122C');
      ctx.fillStyle = hg; heartPath(ctx, s); ctx.fill();
      ctx.restore();
      if (t >= T.end - 200) { ctx.fillStyle = '#C8102E'; ctx.fillRect(0, 0, W, H); }
    }
    if (t >= T.end) { end(); return; }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
};
