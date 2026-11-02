/* Açılış animasyonları: kış (kar birikip ekranı kaplar) ve sonbahar (rüzgârla savrulan yapraklar) */
'use strict';

const INTROS = { turn: 'Sırayla · bir kış bir sonbahar', season: 'Mevsime göre', winter: 'Kış · kar', autumn: 'Sonbahar · yapraklar', random: 'Her açılışta rastgele', off: 'Kapalı' };

const Intro = {
  pick() {
    const k = S.set.intro || 'turn';
    if (k === 'off') return null;
    if (k === 'turn') {
      const nx = S.sync.introLast === 'winter' ? 'autumn' : 'winter';
      S.sync.introLast = nx; S.saveSync(); return nx;
    }
    if (k === 'winter' || k === 'autumn') return k;
    if (k === 'random') return Math.random() < 0.5 ? 'winter' : 'autumn';
    const m = new Date().getMonth();
    return (m === 11 || m <= 2) ? 'winter' : 'autumn';
  },

  play(kind) {
    return new Promise(done => {
      kind = kind || Intro.pick();
      if (!kind) return done();
      const wrap = document.createElement('div'); wrap.id = 'intro';
      const cv = document.createElement('canvas'); wrap.appendChild(cv);
      const brand = document.createElement('div'); brand.className = 'ibrand';
      brand.innerHTML = `<img src="img/logo.jpg" alt=""><b>NNahiC</b>`;
      wrap.appendChild(brand);
      document.body.appendChild(wrap);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const W = window.innerWidth, H = window.innerHeight;
      cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
      const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
      const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#140A0E';
      let finished = false;
      const end = () => {
        if (finished) return; finished = true;
        wrap.classList.add('out');
        setTimeout(() => { wrap.remove(); done(); }, 450);
      };
      wrap.addEventListener('click', end);
      (kind === 'winter' ? Intro.winter : Intro.autumn)(ctx, W, H, bg, brand, end, () => finished);
    });
  },

  /* ---------- kış ---------- */
  winter(ctx, W, H, bg, brand, end, isDone) {
    const COL = 3, cols = Math.ceil(W / COL) + 1;
    const pile = new Float32Array(cols);
    const flakes = [];
    const T_FILL = 2300, T_HOLD = 2900, T_END = 3700;
    const t0 = performance.now();
    let last = t0;
    const spawn = (n, t) => {
      for (let i = 0; i < n; i++) {
        const big = Math.random() < 0.25;
        flakes.push({ x: Math.random() * (W + 80) - 40, y: -10 - Math.random() * 40, r: big ? 2.2 + Math.random() * 2.2 : 0.8 + Math.random() * 1.6, vy: (big ? 260 : 170) + Math.random() * 160 + t * 0.12, sw: Math.random() * 6.28, sp: 1 + Math.random() * 2 });
      }
    };
    const frame = now => {
      if (isDone()) return;
      const t = now - t0, dt = Math.min(0.05, (now - last) / 1000); last = now;
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      /* hafif gece ışığı */
      const g = ctx.createRadialGradient(W * 0.5, H * 0.35, 10, W * 0.5, H * 0.35, H * 0.8);
      g.addColorStop(0, 'rgba(255,255,255,0.06)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      if (t < T_FILL) spawn(Math.floor(4 + t / 90), t);
      const wind = Math.sin(t / 700) * 40 + 30;
      ctx.fillStyle = '#fff';
      for (let i = flakes.length - 1; i >= 0; i--) {
        const f = flakes[i];
        f.sw += f.sp * dt;
        f.y += f.vy * dt; f.x += (wind + Math.sin(f.sw) * 25) * dt;
        const c = Math.max(0, Math.min(cols - 1, Math.floor(f.x / COL)));
        if (f.y >= H - pile[c]) {
          /* kar birikir: komşu sütunlara yayılır */
          const add = f.r * f.r * 1.9 + (t / T_FILL) * 9;
          for (let k = -3; k <= 3; k++) { const j = c + k; if (j >= 0 && j < cols) pile[j] += add * (1 - Math.abs(k) / 4); }
          flakes.splice(i, 1); continue;
        }
        ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1;
      /* biriken kar: yumuşak tepeli beyaz katman */
      for (let j = 1; j < cols - 1; j++) pile[j] = (pile[j - 1] + pile[j] * 2 + pile[j + 1]) / 4;
      const grow = t > 900 ? Math.pow((t - 900) / (T_FILL - 900), 2.2) * H * 0.9 * dt * 2.2 : 0;
      if (t < T_HOLD) for (let j = 0; j < cols; j++) pile[j] = Math.min(H + 20, pile[j] + grow * (0.85 + 0.3 * Math.sin(j * 0.13 + t / 300)));
      const sg = ctx.createLinearGradient(0, H * 0.3, 0, H);
      sg.addColorStop(0, '#FFFFFF'); sg.addColorStop(1, '#EEF2F8');
      ctx.fillStyle = sg;
      ctx.beginPath(); ctx.moveTo(0, H);
      for (let j = 0; j < cols; j++) ctx.lineTo(j * COL, H - pile[j]);
      ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
      /* tamamen beyazlama */
      if (t > T_FILL - 300) { ctx.fillStyle = `rgba(255,255,255,${Math.min(1, (t - T_FILL + 300) / 500)})`; ctx.fillRect(0, 0, W, H); }
      if (t > T_FILL && !brand.classList.contains('on')) brand.classList.add('on', 'dark');
      if (t > T_HOLD) { brand.classList.remove('on'); }
      if (t > T_HOLD + 200) {
        /* ortadan açılan daire ile ana sayfa görünür */
        const p = Math.min(1, (t - T_HOLD - 200) / (T_END - T_HOLD - 200));
        ctx.save(); ctx.globalCompositeOperation = 'destination-out';
        const r = Math.pow(p, 1.6) * Math.hypot(W, H) * 0.62;
        const rg = ctx.createRadialGradient(W / 2, H / 2, r * 0.75, W / 2, H / 2, r + 1);
        rg.addColorStop(0, 'rgba(0,0,0,1)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
        ctx.restore();
        if (p >= 1) { end(); return; }
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  },

  /* ---------- sonbahar ---------- */
  autumn(ctx, W, H, bg, brand, end, isDone) {
    const COLORS = ['#B83A26', '#D2561E', '#E58A2B', '#C9792B', '#8E3B2F', '#E7A33E', '#A5482A', '#7A3B22'];
    const t0 = performance.now(); let last = t0;
    const T_COVER0 = 1300, T_COVER1 = 2300, T_GUST = 2750, T_END = 4300;
    const fall = [], cover = [];
    /* ekranı kaplayacak yapraklar: ızgara + rastgele kaydırma */
    const step = 46;
    for (let y = -20; y < H + 40; y += step * 0.7) for (let x = -20; x < W + 40; x += step * 0.75) {
      cover.push({ x: x + (Math.random() - 0.5) * 30, y: y + (Math.random() - 0.5) * 30, s: 38 + Math.random() * 30, rot: Math.random() * 6.28, c: COLORS[Math.random() * COLORS.length | 0], type: Math.random() < 0.55 ? 1 : 0, at: T_COVER0 + Math.random() * (T_COVER1 - T_COVER0), vx: 0, vy: 0, vr: 0 });
    }
    cover.sort((a, b) => a.at - b.at);
    const leaf = (l, alpha) => {
      ctx.save(); ctx.translate(l.x, l.y); ctx.rotate(l.rot); ctx.globalAlpha = alpha == null ? 1 : alpha;
      const s = l.s / 2;
      ctx.fillStyle = l.c; ctx.strokeStyle = 'rgba(60,20,10,.45)'; ctx.lineWidth = 1;
      ctx.beginPath();
      if (l.type === 1) {
        /* akçaağaç benzeri yaprak */
        const pts = [[0, -1], [.22, -.55], [.62, -.72], [.5, -.3], [.95, -.12], [.52, .1], [.62, .5], [.18, .3], [0, .62], [-.18, .3], [-.62, .5], [-.52, .1], [-.95, -.12], [-.5, -.3], [-.62, -.72], [-.22, -.55]];
        pts.forEach((p, i) => { const X = p[0] * s, Y = p[1] * s; if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); });
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, s * .95); ctx.lineTo(0, -s * .8); ctx.moveTo(0, 0); ctx.lineTo(s * .7, -s * .45); ctx.moveTo(0, 0); ctx.lineTo(-s * .7, -s * .45); ctx.stroke();
      } else {
        /* oval yaprak */
        ctx.moveTo(0, -s); ctx.bezierCurveTo(s * .75, -s * .55, s * .7, s * .55, 0, s); ctx.bezierCurveTo(-s * .7, s * .55, -s * .75, -s * .55, 0, -s);
        ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, s * 1.15); ctx.lineTo(0, -s * .85);
        for (let k = -2; k <= 2; k++) { ctx.moveTo(0, k * s * .3); ctx.lineTo(s * .38, k * s * .3 - s * .2); ctx.moveTo(0, k * s * .3); ctx.lineTo(-s * .38, k * s * .3 - s * .2); }
        ctx.stroke();
      }
      ctx.restore();
    };
    const spawn = () => fall.push({ x: Math.random() * W * 1.2 - W * 0.2, y: -30, s: 20 + Math.random() * 26, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 5, c: COLORS[Math.random() * COLORS.length | 0], type: Math.random() < 0.5 ? 1 : 0, vy: 120 + Math.random() * 120, ph: Math.random() * 6.28, amp: 40 + Math.random() * 60 });
    let ci = 0;
    const frame = now => {
      if (isDone()) return;
      const t = now - t0, dt = Math.min(0.05, (now - last) / 1000); last = now;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = bg; ctx.globalAlpha = t < T_GUST ? 1 : Math.max(0, 1 - (t - T_GUST) / 900); ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
      const gust = t < T_GUST ? Math.max(0, Math.sin(t / 520)) * 160 + 40 : 0;
      if (t < T_COVER1 && Math.random() < 0.6 + t / 1500) { spawn(); if (t > 600) spawn(); }
      for (let i = fall.length - 1; i >= 0; i--) {
        const l = fall[i];
        l.ph += dt * 2.2;
        l.y += l.vy * dt; l.x += (gust + Math.sin(l.ph) * l.amp) * dt;
        l.rot += l.vr * dt + Math.cos(l.ph) * dt;
        if (t > T_GUST) { l.x += 900 * dt; l.y -= 200 * dt; }
        if (l.y > H + 40 || l.x > W + 80) { fall.splice(i, 1); continue; }
        leaf(l);
      }
      /* yapraklar ekranı kaplar */
      while (ci < cover.length && cover[ci].at <= t) { const c = cover[ci]; c.y0 = c.y; c.land = t; ci++; }
      for (let i = 0; i < ci; i++) {
        const c = cover[i];
        const k = Math.min(1, (t - c.land) / 260);
        if (t < T_GUST) {
          const yy = c.y0 - (1 - k) * 90, xx = c.x - (1 - k) * 50;
          leaf({ x: xx, y: yy, s: c.s, rot: c.rot + (1 - k) * 2, c: c.c, type: c.type }, k);
        } else {
          /* rüzgâr hepsini sağa savurur */
          /* dalga soldan sağa ilerler; her yaprak önce kıpırdar, sonra hızlanarak uçar */
          const go = T_GUST + (c.x / W) * 420 + (H - c.y) / H * 120;
          if (t >= go) {
            if (!c.vx) { c.vx = 120 + Math.random() * 140; c.vy = -60 - Math.random() * 160; c.vr = (Math.random() - 0.5) * 9; c.ax = 1500 + Math.random() * 1300; }
            c.vx += c.ax * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.vy += 120 * dt; c.rot += c.vr * dt;
          } else if (t > go - 200) c.rot += Math.sin(t / 30 + c.x) * 0.02;
          if (c.x < W + 80) leaf(c);
        }
      }
      if (t > T_COVER1 - 150 && t < T_GUST && !brand.classList.contains('on')) brand.classList.add('on');
      if (t >= T_GUST) brand.classList.remove('on');
      if (t > T_END) { end(); return; }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }
};
