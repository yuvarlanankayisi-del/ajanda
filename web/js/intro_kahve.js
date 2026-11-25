/* Kahve açılışı: masadaki kupaya espresso, sonra süt dökülür; süt dökülürken yüzeye "I ♡ C" çizilir;
   kamera kupanın üstüne geçer; kahve çalkalanır, etrafa saçılıp ekranı kaplar. */
'use strict';

Intro.coffee = function (ctx, W, H, bg, brand, end, isDone) {
  const cl = x => x < 0 ? 0 : x > 1 ? 1 : x;
  const ease = x => { x = cl(x); return x * x * (3 - 2 * x); };
  const out = x => { x = cl(x); return 1 - Math.pow(1 - x, 3); };
  const lerp = (a, b, k) => a + (b - a) * k;
  const hex = h => [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16));
  const mixc = (a, b, k) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join(''); };

  const T = { spout: 200, esp: 650, espEnd: 1850, swap: 1950, milk: 2250, milkEnd: 3850, cam: 3950, camEnd: 5150, swirl: 5800, splash: 6400, cover: 7250, hold: 7850, end: 8700 };
  const cx = W / 2, R = Math.min(W * .27, 118), HC = R * 1.12;
  const MILK = '#FAF1E6';
  const bokeh = Array.from({ length: 14 }, () => ({ x: Math.random() * W, y: Math.random() * H * .45, r: 10 + Math.random() * 26, a: .08 + Math.random() * .14, ph: Math.random() * 6 }));
  const grains = Array.from({ length: 26 }, () => ({ y: Math.random(), a: Math.random() * 6, w: .5 + Math.random() }));
  const drops = Array.from({ length: 80 }, () => { const a = Math.random() * 6.283, sp = 500 + Math.random() * 1100; return { a, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r0: 4 + Math.random() * 8, r1: 30 + Math.random() * 110, d: Math.random() * 350, sat: Array.from({ length: 3 }, () => [Math.random() * 6.283, .5 + Math.random() * .6, .2 + Math.random() * .3]) }; });
  const splats = Array.from({ length: 16 }, (_, i) => ({ x: (i % 4 + .5) / 4 * W + (Math.random() - .5) * 60, y: ((i / 4 | 0) + .5) / 4 * H + (Math.random() - .5) * 80, r: 150 + Math.random() * 110, d: 350 + Math.random() * 450 }));

  /* yüzeydeki kahve sanatı: I ♡ C (yüzey merkezli koordinatlarda, rs = yüzey yarıçapı) */
  const heart = (c, s) => {
    c.beginPath(); c.moveTo(0, s * .34);
    c.bezierCurveTo(-s * .1, s * .24, -s * .62, -s * .02, -s * .5, -s * .36);
    c.bezierCurveTo(-s * .4, -s * .66, -s * .06, -s * .6, 0, -s * .32);
    c.bezierCurveTo(s * .06, -s * .6, s * .4, -s * .66, s * .5, -s * .36);
    c.bezierCurveTo(s * .62, -s * .02, s * .1, s * .24, 0, s * .34); c.closePath();
  };
  const latte = (c, rs, k, art, swirl) => {
    /* zemin: espressodan sütlü kahveye */
    const g = c.createRadialGradient(0, 0, rs * .1, 0, 0, rs);
    g.addColorStop(0, mixc('#8A4A22', '#C99566', k)); g.addColorStop(.75, mixc('#4A2614', '#9A6338', k)); g.addColorStop(1, mixc('#2E170C', '#6E3F20', k));
    c.fillStyle = g; c.fillRect(-rs, -rs, rs * 2, rs * 2);
    /* krema benekleri */
    c.fillStyle = `rgba(230,170,110,${.18 * (1 - k * .5)})`;
    for (let i = 0; i < 18; i++) { const a = i * 2.4, r = rs * (.2 + (i * 37 % 70) / 100); c.beginPath(); c.arc(Math.cos(a) * r, Math.sin(a) * r, rs * .025, 0, 6.283); c.fill(); }
    if (art <= 0) return;
    c.save(); c.rotate(swirl * 2.6);
    c.shadowColor = 'rgba(255,245,232,.9)'; c.shadowBlur = rs * .05;
    c.fillStyle = MILK;
    const part = (i, draw) => { const p = ease((art - i / 3) * 3); if (p <= 0) return; c.save(); c.globalAlpha = p; draw(p); c.restore(); };
    const fs = rs * .55;
    part(0, p => { c.font = `700 ${fs}px 'Dancing Script', 'Petit Formal Script', cursive`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.translate(-rs * .56, rs * .02); c.scale(.6 + .4 * p, .6 + .4 * p); c.fillText('I', 0, 0); });
    part(1, p => { c.translate(0, rs * .02); c.scale(.5 + .5 * p, .5 + .5 * p); heart(c, rs * .62); c.fill();
      c.shadowBlur = 0; c.strokeStyle = mixc('#B07A4C', '#C99566', .5); c.lineWidth = rs * .012; c.beginPath(); c.moveTo(0, -rs * .32); c.quadraticCurveTo(rs * .02, 0, 0, rs * .2); c.stroke(); });
    part(2, p => { c.font = `700 ${fs}px 'Dancing Script', 'Petit Formal Script', cursive`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.translate(rs * .56, rs * .02); c.scale(.6 + .4 * p, .6 + .4 * p); c.fillText('C', 0, 0); });
    c.restore();
    /* çalkalanınca süt girdap olur */
    if (swirl > 0) {
      c.save(); c.globalAlpha = ease(swirl * 1.5); c.strokeStyle = 'rgba(250,240,228,.75)'; c.lineCap = 'round';
      for (let j = 0; j < 3; j++) {
        c.lineWidth = rs * (.05 - j * .012); c.beginPath();
        for (let a = 0; a < 14; a += .12) { const r = rs * a / 14 * .95, an = a + swirl * 9 + j * 2.1; c.lineTo(Math.cos(an) * r, Math.sin(an) * r); }
        c.stroke();
      }
      c.restore();
    }
  };

  const t0 = performance.now();
  const frame = now => {
    if (isDone()) return;
    const t = now - t0;
    const cam = ease((t - T.cam) / (T.camEnd - T.cam));
    const e = lerp(.33, 1, cam), z = lerp(1, 1.9, cam);
    let shx = 0, shy = 0;
    const sw = cl((t - T.swirl) / (T.splash - T.swirl));
    if (t > T.swirl && t < T.cover) { const a = Math.min(1, sw * 2) * (1 - cl((t - T.splash) / 500)); shx = Math.sin(t / 32) * 6 * a; shy = Math.cos(t / 41) * 4 * a; }
    const Y = lerp(H * .44, H * .46, cam) + shy, X = cx + shx;
    const body = HC * z * (1 - cam) * .95, Yb = Y + body;

    if (t < T.cover) {
      /* yandan: duvar ve masa */
      if (cam < 1) {
        ctx.globalAlpha = 1;
        const wall = ctx.createLinearGradient(0, 0, 0, H);
        wall.addColorStop(0, '#2A1812'); wall.addColorStop(1, '#4E3024');
        ctx.fillStyle = wall; ctx.fillRect(0, 0, W, H);
        for (const b of bokeh) { ctx.fillStyle = `rgba(255,200,130,${b.a * (.7 + .3 * Math.sin(t / 900 + b.ph))})`; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 6.283); ctx.fill(); }
        const ty = Y + HC * .35;
        const tg = ctx.createLinearGradient(0, ty, 0, H);
        tg.addColorStop(0, '#9A6640'); tg.addColorStop(1, '#5A3520');
        ctx.fillStyle = tg; ctx.fillRect(0, ty, W, H - ty);
        ctx.strokeStyle = 'rgba(60,30,15,.25)'; ctx.lineWidth = 1;
        for (const gr of grains) { const y = ty + gr.y * (H - ty); ctx.beginPath(); for (let x = 0; x <= W; x += 20) ctx.lineTo(x, y + Math.sin(x * .02 + gr.a) * 3 * gr.w); ctx.stroke(); }
      }
      /* üstten: ahşap masa */
      if (cam > 0) {
        ctx.globalAlpha = cam;
        const pw = W / 4.5;
        for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#7A4E31' : '#6C432A'; ctx.fillRect(i * pw - 10, 0, pw, H); }
        ctx.strokeStyle = 'rgba(40,20,10,.25)'; ctx.lineWidth = 1;
        for (const gr of grains) { const x = gr.y * W; ctx.beginPath(); for (let y = 0; y <= H; y += 20) ctx.lineTo(x + Math.sin(y * .015 + gr.a) * 4 * gr.w, y); ctx.stroke(); }
        ctx.globalAlpha = 1;
      }
      /* tabak */
      const SR = R * 1.6 * z;
      ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(X + 6, Yb + 8 * (1 - cam) + 10 * cam, SR, SR * e, 0, 0, 6.283); ctx.fill();
      const sg = ctx.createRadialGradient(X - SR * .3, Yb - SR * e * .3, SR * .2, X, Yb, SR);
      sg.addColorStop(0, '#FFFFFF'); sg.addColorStop(1, '#DCD3C8');
      ctx.fillStyle = sg; ctx.beginPath(); ctx.ellipse(X, Yb, SR, SR * e, 0, 0, 6.283); ctx.fill();
      ctx.strokeStyle = '#8E1B3A'; ctx.lineWidth = 2 * z; ctx.beginPath(); ctx.ellipse(X, Yb, SR * .9, SR * e * .9, 0, 0, 6.283); ctx.stroke();
      /* kulp */
      ctx.save(); ctx.strokeStyle = '#EFE8DE'; ctx.lineWidth = R * .16 * z; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.ellipse(X + R * z * 1.08, Y + body * .38, R * .32 * z, Math.max(R * .12 * z, body * .3 + R * .08 * z * cam), 0, -Math.PI / 2, Math.PI / 2); ctx.stroke(); ctx.restore();
      /* kupa gövdesi */
      if (body > 1) {
        const bg2 = ctx.createLinearGradient(X - R * z, 0, X + R * z, 0);
        bg2.addColorStop(0, '#D9D0C5'); bg2.addColorStop(.35, '#FFFFFF'); bg2.addColorStop(1, '#CFC5B9');
        ctx.fillStyle = bg2; ctx.beginPath(); ctx.moveTo(X - R * z, Y);
        ctx.bezierCurveTo(X - R * z, Y + body * .7, X - R * .8 * z, Yb, X - R * .7 * z, Yb);
        ctx.ellipse(X, Yb, R * .7 * z, R * .7 * z * e, 0, Math.PI, 0, true);
        ctx.bezierCurveTo(X + R * .8 * z, Yb, X + R * z, Y + body * .7, X + R * z, Y);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#8E1B3A'; ctx.lineWidth = 3 * z; ctx.beginPath(); ctx.ellipse(X, Y + body * .16, R * .985 * z, R * z * e, 0, 0, Math.PI); ctx.stroke();
      }
      /* ağız ve iç */
      ctx.fillStyle = '#F7F2EB'; ctx.beginPath(); ctx.ellipse(X, Y, R * z, R * z * e, 0, 0, 6.283); ctx.fill();
      const ri = R * .9 * z;
      ctx.save(); ctx.beginPath(); ctx.ellipse(X, Y, ri, ri * e, 0, 0, 6.283); ctx.clip();
      const ig = ctx.createLinearGradient(0, Y - ri * e, 0, Y + ri * e);
      ig.addColorStop(0, '#CFC4B6'); ig.addColorStop(1, '#F1EAE0');
      ctx.fillStyle = ig; ctx.fillRect(X - ri, Y - ri, ri * 2, ri * 2);
      /* sıvı */
      const L = t < T.espEnd ? .58 * out((t - T.esp) / (T.espEnd - T.esp)) : lerp(.58, .93, ease((t - T.milk) / (T.milkEnd - T.milk)));
      if (L > .01) {
        const sy = Y + (1 - L) * body * .85, rs = ri * lerp(.8, 1, L);
        ctx.save(); ctx.translate(X, sy); ctx.scale(1, e);
        ctx.beginPath(); ctx.arc(0, 0, rs, 0, 6.283); ctx.clip();
        const mk = ease((t - T.milk) / (T.milkEnd - T.milk - 300));
        const art = cl((t - T.milk - 250) / (T.milkEnd - T.milk - 250)) * (1 - ease((sw - .4) / .6));
        if (t > T.swirl) ctx.translate(Math.sin(t / 60) * rs * .04 * sw, Math.cos(t / 75) * rs * .04 * sw);
        latte(ctx, rs, mk, art, sw);
        ctx.restore();
      }
      ctx.restore();
      ctx.strokeStyle = 'rgba(150,130,110,.35)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(X, Y, R * z, R * z * e, 0, 0, 6.283); ctx.stroke();

      /* espresso: makine ağzı ve koyu akış */
      const spIn = ease((t - T.spout) / 400) * (1 - ease((t - T.swap) / 300));
      if (spIn > 0) {
        const top = lerp(-60, Y - R * 1.75, spIn);
        ctx.fillStyle = '#3E3B39'; ctx.fillRect(cx - 52, -10, 104, top - 30); ctx.fillStyle = '#6E6A66'; ctx.fillRect(cx - 34, top - 40, 68, 40);
        ctx.fillStyle = '#9A958F'; ctx.fillRect(cx - 34, top - 40, 68, 8);
        ctx.fillStyle = '#4A4643'; ctx.fillRect(cx - 12, top, 8, 12); ctx.fillRect(cx + 4, top, 8, 12);
        if (t > T.esp && t < T.espEnd + 150) {
          const L2 = .58 * out((t - T.esp) / (T.espEnd - T.esp)), sy = Y + (1 - L2) * body * .85;
          const head = Math.min(1, (t - T.esp) / 250), tail = cl((t - T.espEnd) / 150);
          const y0 = lerp(top + 12, sy, tail), y1 = lerp(top + 12, sy, head);
          ctx.strokeStyle = '#3A1C0E'; ctx.lineCap = 'round';
          [-8, 8].forEach(dx => { ctx.lineWidth = 3.4 + Math.sin(t / 40 + dx) * .6; ctx.beginPath(); ctx.moveTo(cx + dx, y0); ctx.quadraticCurveTo(cx + dx * .4, (y0 + y1) / 2, cx + dx * .15, y1); ctx.stroke(); });
        }
      }
      /* süt: pitcher eğilir, akış yüzeyde I, kalp ve C'yi çizer */
      const pIn = ease((t - T.swap) / 350) * (1 - ease((t - T.milkEnd) / 300));
      if (pIn > 0) {
        const mp = cl((t - T.milk) / (T.milkEnd - T.milk));
        const ri2 = R * .9, rsN = ri2 * lerp(.8, 1, .93);
        const tx = mp < .33 ? -.56 : mp < .66 ? Math.sin((mp - .33) / .33 * Math.PI * 2) * .2 : .56;
        const sx = X + tx * rsN, sy2 = Y + (1 - lerp(.58, .93, ease(mp))) * body * .85;
        const px = lerp(W + 80, sx + 70, pIn), py = lerp(-60, sy2 - R * 1.9, pIn);
        ctx.save(); ctx.translate(px, py); ctx.rotate(-.55 * pIn);
        const pg = ctx.createLinearGradient(-30, 0, 40, 0);
        pg.addColorStop(0, '#9EA4A8'); pg.addColorStop(.4, '#E8ECEE'); pg.addColorStop(1, '#868C90');
        ctx.fillStyle = pg; ctx.beginPath(); ctx.moveTo(-26, -50); ctx.lineTo(28, -50); ctx.lineTo(34, 30); ctx.quadraticCurveTo(4, 40, -30, 30); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-26, -50); ctx.lineTo(-44, -58); ctx.lineTo(-24, -40); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#7E8488'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(40, -12, 16, -1.2, 1.3); ctx.stroke();
        ctx.restore();
        if (t > T.milk && t < T.milkEnd + 100) {
          const spx = px + Math.cos(-.55 * pIn) * -44 - Math.sin(-.55 * pIn) * -58, spy = py + Math.sin(-.55 * pIn) * -44 + Math.cos(-.55 * pIn) * -58;
          const head = Math.min(1, (t - T.milk) / 200), tail = cl((t - T.milkEnd) / 100);
          ctx.strokeStyle = MILK; ctx.lineCap = 'round'; ctx.lineWidth = 5 + Math.sin(t / 50);
          ctx.beginPath(); ctx.moveTo(lerp(spx, sx, tail), lerp(spy, sy2, tail)); ctx.quadraticCurveTo(spx - 8, (spy + sy2) / 2, lerp(spx, sx, head), lerp(spy, sy2, head)); ctx.stroke();
        }
      }
      /* sıçrayan kahve damlaları ekranı kaplar */
      if (t > T.splash) {
        const st = (t - T.splash) / 1000;
        for (const d of drops) {
          const u = st - d.d / 1000; if (u <= 0) continue;
          const x = X + d.vx * u, y = Y + d.vy * u * e + 260 * u * u, r = lerp(d.r0, d.r1, out(u / .7)) * z;
          const g = ctx.createRadialGradient(x - r * .3, y - r * .3, r * .1, x, y, r);
          g.addColorStop(0, '#8A5432'); g.addColorStop(1, '#4A2614');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
          for (const [a, dd, rr] of d.sat) { ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * dd * 1.2, y + Math.sin(a) * r * dd * 1.2, r * rr, 0, 6.283); ctx.fill(); }
        }
        for (const s of splats) {
          const u = (t - T.splash - s.d) / 500; if (u <= 0) continue;
          const r = s.r * out(u);
          const g = ctx.createRadialGradient(s.x, s.y, r * .1, s.x, s.y, r);
          g.addColorStop(0, '#7A4526'); g.addColorStop(1, '#4E2915');
          ctx.fillStyle = g; ctx.beginPath();
          for (let i = 0; i <= 16; i++) { const a = i / 16 * 6.283, rr = r * (1 + Math.sin(a * 5 + s.d) * .08); ctx.lineTo(s.x + Math.cos(a) * rr, s.y + Math.sin(a) * rr); }
          ctx.fill();
        }
      }
    } else {
      const g = ctx.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, Math.hypot(W, H) * .6);
      g.addColorStop(0, '#8A5432'); g.addColorStop(1, '#3E1F10');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      if (t < T.hold && !brand.classList.contains('on')) brand.classList.add('on');
      if (t >= T.hold) brand.classList.remove('on');
      if (t > T.hold + 150) {
        const p = cl((t - T.hold - 150) / (T.end - T.hold - 150));
        ctx.save(); ctx.globalCompositeOperation = 'destination-out';
        const r = Math.pow(p, 1.6) * Math.hypot(W, H) * .62;
        const rg = ctx.createRadialGradient(W / 2, H / 2, r * .75, W / 2, H / 2, r + 1);
        rg.addColorStop(0, 'rgba(0,0,0,1)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H); ctx.restore();
        if (p >= 1) { end(); return; }
      }
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
};
