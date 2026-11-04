/* Açılış animasyonları: kış (kar birikip ekranı kaplar) ve sonbahar (rüzgârla savrulan yapraklar) */
'use strict';

const INTROS = { turn: 'Sırayla · bir kış bir sonbahar', season: 'Mevsime göre', winter: 'Kış · kar', autumn: 'Sonbahar · yapraklar', random: 'Her açılışta rastgele', off: 'Kapalı' };

const Intro = {
  /* tek seferlik özel açılışlar: süresi bitince görünmez, ayarlarda yer almaz */
  SPECIAL: [
    { kind: 'lale', from: new Date(2026, 10, 4, 23, 0, 0).getTime(), until: new Date(2026, 10, 5, 23, 58, 59).getTime() },
    { kind: 'mum', from: 0, until: new Date(2026, 10, 4, 23, 59, 59).getTime() }
  ],
  pick() {
    const now = Date.now(), sp = Intro.SPECIAL.find(x => now >= x.from && now <= x.until);
    if (sp) return sp.kind;
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
      const seenKey = 'seen_' + kind;
      const end = () => {
        if (finished) return; finished = true;
        if (Intro.SPECIAL.some(x => x.kind === kind)) { S.sync[seenKey] = 1; S.saveSync(); }
        wrap.classList.add('out');
        setTimeout(() => { wrap.remove(); done(); }, 450);
      };
      /* özel açılış ilk seferde atlanamaz */
      if (!Intro.SPECIAL.some(x => x.kind === kind) || S.sync[seenKey]) wrap.addEventListener('click', end);
      if (Intro[kind] && Intro.SPECIAL.some(x => x.kind === kind)) { brand.remove(); Intro[kind](ctx, W, H, bg, wrap, end, () => finished); }
      else (kind === 'winter' ? Intro.winter : Intro.autumn)(ctx, W, H, bg, brand, end, () => finished);
    });
  },

  /* ---------- kış ---------- */
  winter(ctx, W, H, bg, brand, end, isDone) {
    const COL = 3, cols = Math.ceil(W / COL) + 1;
    const pile = new Float32Array(cols);
    const flakes = [];
    /* T_FILL: ekran beyaza döner · T_HOLD: logo kalır · T_END: ana sayfa açılır */
    const T_FILL = 3400, T_HOLD = 4000, T_END = 4800;
    const ease = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
    const lump = Array.from({ length: 6 }, () => ({ f: 0.006 + Math.random() * 0.02, p: Math.random() * 6.28, a: 4 + Math.random() * 10 }));
    /* altı kollu kar tanesi çizimi (bir kez çizilir, sonra kopyalanır) */
    const SP = 64, sprite = document.createElement('canvas'); sprite.width = sprite.height = SP;
    { const c = sprite.getContext('2d'); c.translate(SP / 2, SP / 2); c.strokeStyle = '#fff'; c.lineCap = 'round'; c.shadowColor = 'rgba(255,255,255,.8)'; c.shadowBlur = 3;
      for (let k = 0; k < 6; k++) { c.save(); c.rotate(k * Math.PI / 3);
        c.lineWidth = 3.4; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -26); c.stroke();
        c.lineWidth = 2.6; c.beginPath(); c.moveTo(0, -11); c.lineTo(-7, -18); c.moveTo(0, -11); c.lineTo(7, -18); c.moveTo(0, -18); c.lineTo(-5, -23); c.moveTo(0, -18); c.lineTo(5, -23); c.stroke();
        c.restore(); }
      c.fillStyle = '#fff'; c.beginPath(); c.arc(0, 0, 3.2, 0, 6.283); c.fill(); }
    const t0 = performance.now();
    let last = t0;
    const spawn = (n, t) => {
      for (let i = 0; i < n; i++) {
        const big = Math.random() < 0.2 + t / 12000, drift = Math.random() < 0.45;
        flakes.push({ x: Math.random() * (W + 120) - 80, y: -10 - Math.random() * 40, r: big ? 2.2 + Math.random() * 2.4 : 0.8 + Math.random() * 1.6, vy: (big ? 150 : 110) + Math.random() * 110, sw: Math.random() * 6.28, sp: drift ? 1.6 + Math.random() * 1.4 : 1 + Math.random() * 2, amp: drift ? 45 + Math.random() * 45 : 14 + Math.random() * 12, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 3, a: 0.65 + Math.random() * 0.35 });
      }
    };
    const frame = now => {
      if (isDone()) return;
      const t = now - t0, dt = Math.min(0.05, (now - last) / 1000); last = now;
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      const g = ctx.createRadialGradient(W * 0.5, H * 0.35, 10, W * 0.5, H * 0.35, H * 0.8);
      g.addColorStop(0, 'rgba(255,255,255,0.06)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      /* kar giderek yoğunlaşır */
      if (t < T_FILL) { const n = 2 + t / 260; spawn(Math.floor(n) + (Math.random() < n % 1 ? 1 : 0), t); }
      const wind = Math.sin(t / 900) * 30 + 25;
      ctx.fillStyle = '#fff';
      for (let i = flakes.length - 1; i >= 0; i--) {
        const f = flakes[i];
        f.sw += f.sp * dt;
        f.y += f.vy * dt; f.x += (wind + Math.sin(f.sw) * f.amp) * dt; f.rot += f.vr * dt;
        const c = Math.max(0, Math.min(cols - 1, Math.floor(f.x / COL)));
        if (f.y >= H - pile[c] + 2) {
          /* düşen tane yüzeyde küçük bir tümsek bırakır */
          const add = f.r * f.r * 0.55;
          for (let k = -2; k <= 2; k++) { const j = c + k; if (j >= 0 && j < cols) pile[j] += add * (1 - Math.abs(k) / 3); }
          flakes.splice(i, 1); continue;
        }
        ctx.globalAlpha = f.a;
        { const d = f.r * 2.6; ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.rot); ctx.drawImage(sprite, -d, -d, d * 2, d * 2); ctx.restore(); }
      }
      ctx.globalAlpha = 1;
      /* biriken kar: yavaşça, dalgalı bir yüzeyle yükselir */
      const lvl = H * 0.42 * ease((t - 400) / (T_FILL - 400));
      for (let j = 0; j < cols; j++) {
        let tgt = lvl;
        for (const L of lump) tgt += Math.sin(j * COL * L.f + L.p) * L.a * Math.min(1, lvl / 40);
        if (pile[j] < tgt) pile[j] += (tgt - pile[j]) * Math.min(1, dt * 1.6);
      }
      for (let j = 1; j < cols - 1; j++) pile[j] = (pile[j - 1] + pile[j] * 2 + pile[j + 1]) / 4;
      let top = H; for (let j = 0; j < cols; j++) top = Math.min(top, H - pile[j]);
      const path = () => { ctx.beginPath(); ctx.moveTo(0, H); for (let j = 0; j < cols; j++) ctx.lineTo(j * COL, H - pile[j]); ctx.lineTo(W, H); ctx.closePath(); };
      const sg = ctx.createLinearGradient(0, top, 0, H);
      sg.addColorStop(0, '#FFFFFF'); sg.addColorStop(0.25, '#F3F6FB'); sg.addColorStop(1, '#DCE4F0');
      ctx.fillStyle = sg; path(); ctx.fill();
      /* yüzeyin altında hafif mavi gölge, üstünde parlak kenar */
      ctx.save(); ctx.lineJoin = 'round';
      ctx.beginPath(); for (let j = 0; j < cols; j++) ctx.lineTo(j * COL, H - pile[j] + 5);
      ctx.strokeStyle = 'rgba(170,185,212,.35)'; ctx.lineWidth = 5; ctx.stroke();
      ctx.beginPath(); for (let j = 0; j < cols; j++) ctx.lineTo(j * COL, H - pile[j] + 1);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.stroke();
      /* yüzeyde ışıltılar */
      if (lvl > 20) for (let i = 0; i < 6; i++) {
        const j = (Math.random() * cols) | 0, y = H - pile[j] + 3 + Math.random() * 30;
        ctx.globalAlpha = Math.random() * 0.8; ctx.fillStyle = '#fff'; ctx.fillRect(j * COL, y, 1.6, 1.6);
      }
      ctx.restore(); ctx.globalAlpha = 1;
      /* tipi: hava beyaz pusla dolar, ekran yavaşça bembeyaz olur */
      const fog = ease((t - 2300) / (T_FILL - 1700));
      if (fog > 0) {
        const fg = ctx.createLinearGradient(0, 0, 0, H);
        fg.addColorStop(0, `rgba(255,255,255,${fog * 0.85 + (fog > 0.9 ? (fog - 0.9) * 1.5 : 0)})`);
        fg.addColorStop(1, `rgba(255,255,255,${Math.min(1, fog * 1.15)})`);
        ctx.fillStyle = fg; ctx.fillRect(0, 0, W, H);
      }
      if (t >= T_FILL) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); }
      if (t > T_FILL - 150 && !brand.classList.contains('on') && t < T_HOLD) brand.classList.add('on', 'dark');
      if (t > T_HOLD) { brand.classList.remove('on'); }
      if (t > T_HOLD + 200) {
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
