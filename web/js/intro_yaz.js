/* İlkbahar ve yaz açılışları.
   Yaz: plaj; mayolu bir kadın yürüyerek gelir, denize bakan şezlonga uzanır, yanındaki şemsiye açılır.
   İlkbahar: çiçek açan ağaç, çayır, kelebekler; biri dalın ucundaki çiçeğe konar, sonra uçup kanatlarıyla ekranı kaplar. */
'use strict';

(() => {
  const cl = x => x < 0 ? 0 : x > 1 ? 1 : x;
  const ease = x => { x = cl(x); return x * x * (3 - 2 * x); };
  const out = x => { x = cl(x); return 1 - Math.pow(1 - x, 3); };
  const inn = x => { x = cl(x); return x * x * x; };
  const back = x => { if (x <= 0) return 0; if (x >= 1) return 1; const c = 1.8; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const lerp = (a, b, k) => a + (b - a) * k;

  /* ---------- yaz ---------- */
  Intro.summer = function (ctx, W, H, bg, brand, end, isDone) {
    /* zaman çizelgesi (ms) */
    const T = { walk: 300, stop: 2600, turn: 2650, back: 3050, sit: 3700, arms: 4400, umb: 4300, umbEnd: 5100, brand: 5600, end: 6700 };
    const HZ = H * .42, SHORE = H * .6, FEET = SHORE + H * .085;
    const k = Math.min(H * .11 / 150, W / 560);
    const LX = W * .56, SEAT = FEET - 14 * k;
    const UXp = LX + 34 * k;
    const gulls = Array.from({ length: 3 }, (_, i) => ({ x: -40 - i * 80, y: H * (.1 + i * .05), s: .8 + Math.random() * .5, v: 50 + Math.random() * 30, ph: Math.random() * 6 }));
    const sparkles = Array.from({ length: 40 }, () => ({ x: Math.random() * W, y: lerp(HZ + 6, SHORE - 10, Math.pow(Math.random(), 1.3)), ph: Math.random() * 6.28, sp: 2 + Math.random() * 4 }));
    const shells = Array.from({ length: 16 }, () => ({ x: Math.random() * W, y: lerp(SHORE + 20, H - 8, Math.random()), r: 1 + Math.random() * 1.6 }));
    const SKIN = '#EBB792', SKIN2 = '#CF9873', SUIT = '#9B1D45', SUIT2 = '#6E1230', HAIR = '#4A2A1C';

    /* ---- şezlong: arkadan görünüş, sırtlık bize dönük, oturağı denize uzanıyor ---- */
    const loungerBack = c => {
      c.save(); c.lineCap = 'round';
      c.fillStyle = 'rgba(120,80,30,.2)'; c.beginPath(); c.ellipse(LX, FEET + 2 * k, 30 * k, 5 * k, 0, 0, 6.283); c.fill();
      c.strokeStyle = '#A9744A'; c.lineWidth = 2.4 * k;
      [[-15, -10, -17, 1], [15, -10, 17, 1], [-11, -22, -12, -16], [11, -22, 12, -16]].forEach(([a, b2, cc, d]) => { c.beginPath(); c.moveTo(LX + a * k, FEET + b2 * k); c.lineTo(LX + cc * k, FEET + d * k); c.stroke(); });
      const bw = 20 * k, tw = 17 * k, by = FEET - 10 * k, ty = FEET - 44 * k;
      c.fillStyle = '#F6F0E4'; c.beginPath(); c.moveTo(LX - bw, by); c.lineTo(LX - tw, ty); c.quadraticCurveTo(LX, ty - 3 * k, LX + tw, ty); c.lineTo(LX + bw, by); c.closePath(); c.fill();
      c.save(); c.clip(); c.fillStyle = '#B23A5E';
      for (let i = -2; i <= 2; i++) c.fillRect(LX + i * 8 * k - 2 * k, ty - 4 * k, 4 * k, by - ty + 6 * k);
      c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(LX - bw, by - 6 * k, bw * 2, 6 * k);
      c.restore();
      c.strokeStyle = '#A9744A'; c.lineWidth = 1.6 * k; c.beginPath(); c.moveTo(LX - bw, by); c.lineTo(LX - tw, ty); c.quadraticCurveTo(LX, ty - 3 * k, LX + tw, ty); c.lineTo(LX + bw, by); c.closePath(); c.stroke();
      c.restore();
    };
    /* ---- şemsiye: o=0 kapalı, o=1 açık ---- */
    const umbrella = (c, o) => {
      c.save(); c.translate(UXp, FEET - 2 * k); c.rotate(-.12); c.scale(k * .78, k * .78);
      c.strokeStyle = '#EDE8E0'; c.lineWidth = 3.4; c.lineCap = 'round';
      c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -168); c.stroke();
      const R = lerp(6, 74, o), rim = lerp(-96, -150, o), apex = lerp(-170, -150 - 74 * .55, o), n = 8;
      const pts = Array.from({ length: n + 1 }, (_, i) => { const x = -R + 2 * R * i / n; return [x, rim + 9 * o * (1 - (x / R) * (x / R))]; });
      for (let i = 0; i < n; i++) {
        const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
        c.fillStyle = i % 2 ? '#FFF6E8' : '#E8505B';
        c.beginPath(); c.moveTo(0, apex); c.lineTo(x0, y0); c.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + 8 * o, x1, y1); c.closePath(); c.fill();
      }
      const sh = c.createLinearGradient(-R, 0, R, 0);
      sh.addColorStop(0, 'rgba(0,0,0,.2)'); sh.addColorStop(.45, 'rgba(255,255,255,.05)'); sh.addColorStop(1, 'rgba(0,0,0,.25)');
      c.fillStyle = sh; c.beginPath(); c.moveTo(0, apex); pts.forEach(([x, y]) => c.lineTo(x, y)); c.closePath(); c.fill();
      c.fillStyle = '#EDE8E0'; c.beginPath(); c.arc(0, apex - 3, 3.5, 0, 6.283); c.fill();
      c.restore();
    };
    /* ---- kadın karakter (yandan görünüş, mayolu, hasır şapkalı) ---- */
    const P_STAND = { t: .04, h: 0, tn: 0, sn: 0, tf: 0, sf: 0, an: .08, fn: .14, af: -.06, ff: 0 };
    const walkPose = ph => {
      const s = Math.sin(ph);
      const tn = .42 * s, tf = -.42 * s;
      return { t: .07, h: 0, tn, sn: tn - .6 * Math.max(0, -Math.sin(ph + .7)), tf, sf: tf - .6 * Math.max(0, Math.sin(ph + .7)), an: -.38 * s, fn: -.38 * s + .28, af: .38 * s, ff: .38 * s + .28 };
    };
    const mixP = (a, b, u) => { const r = {}; for (const key in a) r[key] = lerp(a[key], b[key], u); return r; };
    const woman = (c, x, y, P, face) => {
      c.save(); c.translate(x, y); c.scale(face * k, k); c.lineCap = 'round'; c.lineJoin = 'round';
      const tp = (len, a) => [Math.sin(a) * len, -Math.cos(a) * len];
      const [sx, sy] = tp(45, P.t);
      const limb = (ox, oy, a1, l1, a2, l2, w1, w2, col) => {
        const kx = ox + Math.sin(a1) * l1, ky = oy + Math.cos(a1) * l1, fx = kx + Math.sin(a2) * l2, fy = ky + Math.cos(a2) * l2;
        c.strokeStyle = col; c.lineWidth = w1; c.beginPath(); c.moveTo(ox, oy); c.lineTo(kx, ky); c.stroke();
        c.lineWidth = w2; c.beginPath(); c.moveTo(kx, ky); c.lineTo(fx, fy); c.stroke();
        return [fx, fy];
      };
      /* uzak taraf: kol ve bacak biraz gölgede */
      limb(sx, sy, P.af, 27, P.ff, 25, 6.5, 5.5, SKIN2);
      const [ffx, ffy] = limb(0, 0, P.tf, 41, P.sf, 40, 11, 8, SKIN2);
      c.fillStyle = SKIN2; c.beginPath(); c.ellipse(ffx + 3, ffy, 5, 2.6, 0, 0, 6.283); c.fill();
      /* gövde çerçevesi */
      c.save(); c.rotate(P.t);
      /* saç: arkaya dökülen uzun saç */
      c.fillStyle = HAIR; c.beginPath(); c.moveTo(-2, -72); c.bezierCurveTo(-16, -70, -17, -50, -14, -36); c.bezierCurveTo(-12, -30, -6, -32, -5, -38); c.bezierCurveTo(-6, -50, 0, -58, 4, -64); c.closePath(); c.fill();
      /* boyun */
      c.strokeStyle = SKIN; c.lineWidth = 6; c.beginPath(); c.moveTo(0, -44); c.lineTo(1, -54); c.stroke();
      /* mayo */
      c.fillStyle = SUIT; c.beginPath();
      c.moveTo(-10, 5); c.quadraticCurveTo(-13, -20, -9, -45); c.lineTo(2, -46); c.lineTo(5, -42);
      c.quadraticCurveTo(14, -36, 10, -27); c.quadraticCurveTo(6, -18, 9, -4); c.quadraticCurveTo(6, 7, -10, 5); c.closePath(); c.fill();
      c.fillStyle = SUIT2; c.beginPath(); c.moveTo(-10, 5); c.quadraticCurveTo(-13, -20, -9, -45); c.lineTo(-5, -45); c.quadraticCurveTo(-9, -20, -6, 5); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-9, -16); c.quadraticCurveTo(0, -12, 8, -15); c.stroke();
      /* baş, şapka, gözlük */
      c.save(); c.translate(1, -62); c.rotate(P.h);
      c.fillStyle = SKIN; c.beginPath(); c.arc(0, 0, 9.5, 0, 6.283); c.fill();
      c.beginPath(); c.moveTo(8, -2); c.lineTo(12, 2); c.lineTo(8.5, 3.5); c.fill();
      c.fillStyle = '#1E1418'; c.fillRect(3, -3, 7, 3.2);
      c.fillStyle = '#C24A62'; c.beginPath(); c.arc(8.5, 6, 1.5, 0, 6.283); c.fill();
      c.fillStyle = HAIR; c.beginPath(); c.arc(-3, -2, 8.5, Math.PI * .55, Math.PI * 1.6); c.fill();
      c.fillStyle = '#E8C784'; c.beginPath(); c.ellipse(-1, -7, 21, 3.6, -.08, 0, 6.283); c.fill();
      c.beginPath(); c.ellipse(-2, -11, 10.5, 7, -.08, Math.PI, 0); c.fill();
      c.strokeStyle = SUIT; c.lineWidth = 2.2; c.beginPath(); c.moveTo(-12.5, -9); c.lineTo(8.5, -10); c.stroke();
      c.restore();
      c.restore();
      /* yakın taraf */
      const [nfx, nfy] = limb(0, 0, P.tn, 41, P.sn, 40, 12, 8.5, SKIN);
      c.fillStyle = SKIN; c.beginPath(); c.ellipse(nfx + 3, nfy, 5.4, 2.8, 0, 0, 6.283); c.fill();
      limb(sx, sy, P.an, 27, P.fn, 25, 7, 6, SKIN);
      c.restore();
    };

    /* ---- kadın, arkadan görünüş: sink 0 ayakta, 1 oturmuş; arms 0 aşağıda, 1 başının arkasında ---- */
    const womanBack = (c, x, y, sink, arms, sq) => {
      c.save(); c.translate(x, y); c.scale(k * sq, k); c.lineCap = 'round'; c.lineJoin = 'round';
      const ty = 1 - .18 * sink;
      if (sink < .95) {
        c.strokeStyle = SKIN; c.lineWidth = 9;
        const l = 80 * (1 - sink);
        c.beginPath(); c.moveTo(-5, 0); c.lineTo(-6, l); c.moveTo(5, 0); c.lineTo(6, l); c.stroke();
      }
      c.scale(1, ty);
      const sh = [[-13, -42], [13, -42]];
      const armPts = side => {
        const [sx, sy] = sh[side < 0 ? 0 : 1];
        const down = [[sx + side * 3, -19], [sx + side * 3, 3]], up = [[sx + side * 12, -63], [side * 5, -67]];
        return [[lerp(down[0][0], up[0][0], arms), lerp(down[0][1], up[0][1], arms)], [lerp(down[1][0], up[1][0], arms), lerp(down[1][1], up[1][1], arms)]];
      };
      const drawArm = side => {
        const [sx, sy] = sh[side < 0 ? 0 : 1], [e, h] = armPts(side);
        c.strokeStyle = SKIN; c.lineWidth = 6.5; c.beginPath(); c.moveTo(sx, sy); c.lineTo(e[0], e[1]); c.stroke();
        c.lineWidth = 5.5; c.beginPath(); c.moveTo(e[0], e[1]); c.lineTo(h[0], h[1]); c.stroke();
      };
      /* sırt: ten, mayonun alt kısmı ve çapraz askılar */
      c.fillStyle = SKIN; c.beginPath(); c.moveTo(-11, 2); c.lineTo(-14, -42); c.quadraticCurveTo(0, -47, 14, -42); c.lineTo(11, 2); c.closePath(); c.fill();
      c.fillStyle = SUIT; c.beginPath(); c.moveTo(-12, 5); c.lineTo(-10, -20); c.quadraticCurveTo(0, -17, 10, -20); c.lineTo(12, 5); c.quadraticCurveTo(0, 9, -12, 5); c.closePath(); c.fill();
      c.strokeStyle = SUIT; c.lineWidth = 2.6; c.beginPath(); c.moveTo(-9, -20); c.lineTo(9, -43); c.moveTo(9, -20); c.lineTo(-9, -43); c.stroke();
      if (arms < .5) { drawArm(-1); drawArm(1); }
      /* uzun saç */
      c.fillStyle = HAIR; c.beginPath(); c.moveTo(-9, -62); c.bezierCurveTo(-12, -46, -11, -34, -7, -27); c.quadraticCurveTo(0, -24, 7, -27); c.bezierCurveTo(11, -34, 12, -46, 9, -62); c.closePath(); c.fill();
      c.strokeStyle = SKIN; c.lineWidth = 6; c.beginPath(); c.moveTo(0, -44); c.lineTo(0, -52); c.stroke();
      if (arms >= .5) { drawArm(-1); drawArm(1); }
      /* baş ve şapka */
      c.fillStyle = HAIR; c.beginPath(); c.arc(0, -60, 9.5, 0, 6.283); c.fill();
      c.fillStyle = '#E8C784'; c.beginPath(); c.ellipse(0, -66, 21, 5, 0, 0, 6.283); c.fill();
      c.beginPath(); c.ellipse(0, -69, 10.5, 8, 0, Math.PI, 0); c.fill();
      c.strokeStyle = SUIT; c.lineWidth = 2.4; c.beginPath(); c.moveTo(-10.5, -69); c.quadraticCurveTo(0, -67, 10.5, -69); c.stroke();
      c.restore();
    };

    const t0 = performance.now(); let last = t0;
    const frame = now => {
      if (isDone()) return;
      const t = now - t0, dt = Math.min(.05, (now - last) / 1000); last = now;
      {
        /* gökyüzü, güneş, martılar */
        const sky = ctx.createLinearGradient(0, 0, 0, HZ);
        sky.addColorStop(0, '#4FAEE3'); sky.addColorStop(.7, '#BDE6F6'); sky.addColorStop(1, '#FFE2B6');
        ctx.fillStyle = sky; ctx.fillRect(0, 0, W, HZ + 2);
        const sx = W * .78, sy = HZ - H * .2;
        const sg = ctx.createRadialGradient(sx, sy, 8, sx, sy, 120);
        sg.addColorStop(0, 'rgba(255,240,180,.95)'); sg.addColorStop(.3, 'rgba(255,220,130,.45)'); sg.addColorStop(1, 'rgba(255,220,130,0)');
        ctx.fillStyle = sg; ctx.fillRect(0, 0, W, HZ);
        ctx.fillStyle = '#FFF4C8'; ctx.beginPath(); ctx.arc(sx, sy, 28, 0, 6.283); ctx.fill();
        ctx.strokeStyle = 'rgba(40,60,80,.7)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
        for (const g of gulls) {
          g.x += g.v * dt; g.ph += dt * 6;
          const f = Math.sin(g.ph) * 5 * g.s, y = g.y + Math.sin(g.ph * .3) * 6;
          ctx.beginPath(); ctx.moveTo(g.x - 12 * g.s, y - f); ctx.quadraticCurveTo(g.x - 5 * g.s, y - 6 * g.s - f * .5, g.x, y);
          ctx.quadraticCurveTo(g.x + 5 * g.s, y - 6 * g.s - f * .5, g.x + 12 * g.s, y - f); ctx.stroke();
        }
        /* deniz */
        const sea = ctx.createLinearGradient(0, HZ, 0, SHORE);
        sea.addColorStop(0, '#2C9FC4'); sea.addColorStop(1, '#3CC3CF');
        ctx.fillStyle = sea; ctx.fillRect(0, HZ, W, SHORE - HZ + 2);
        ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 1.4;
        for (let i = 0; i < 6; i++) {
          const y = HZ + 7 + i * (SHORE - HZ - 10) / 6;
          ctx.beginPath(); for (let x = 0; x <= W; x += 10) ctx.lineTo(x, y + Math.sin(x * .05 + t / 500 + i) * (1 + i * .5)); ctx.stroke();
        }
        for (const s of sparkles) { const a = Math.max(0, Math.sin(t / 1000 * s.sp + s.ph)); if (a < .4) continue; ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fillRect(s.x - 2, s.y, 4, 1); ctx.fillRect(s.x, s.y - 2, 1, 4); }
        /* kum */
        const sand = ctx.createLinearGradient(0, SHORE, 0, H);
        sand.addColorStop(0, '#F6E2B5'); sand.addColorStop(1, '#E3C48C');
        const sh0 = SHORE + Math.sin(t / 700) * 4;
        ctx.fillStyle = sand; ctx.beginPath(); ctx.moveTo(0, H);
        for (let x = 0; x <= W + 10; x += 10) ctx.lineTo(x, sh0 + Math.sin(x * .03) * 4);
        ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 3;
        ctx.beginPath(); for (let x = 0; x <= W + 10; x += 10) ctx.lineTo(x, sh0 + Math.sin(x * .03) * 4); ctx.stroke();
        ctx.fillStyle = 'rgba(180,140,90,.5)'; for (const s of shells) { ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill(); }
        /* şemsiye, kadın, şezlong */
        const uo = back((t - T.umb) / (T.umbEnd - T.umb));
        if (uo > .3) { ctx.fillStyle = `rgba(120,80,30,${.14 * Math.min(1, uo)})`; ctx.beginPath(); ctx.ellipse(LX + 6 * k, FEET + 3 * k, 46 * k * Math.min(1.1, uo), 6 * k, 0, 0, 6.283); ctx.fill(); }
        umbrella(ctx, Math.max(0, uo));
        const SX = LX - 40 * k;
        let seated = false;
        if (t > T.walk && t < T.turn) {
          const u = (t - T.walk) / (T.stop - T.walk), ph = (t - T.walk) / 150, st = ease((u - .88) / .12);
          const x = lerp(-30 * k, SX, Math.min(1, u < .85 ? u / .85 * .93 : .93 + .07 * out((u - .85) / .15)));
          woman(ctx, x, FEET - 80 * k - Math.abs(Math.cos(ph)) * 2.2 * k * (1 - st), mixP(walkPose(ph), P_STAND, st), 1);
        } else if (t >= T.turn && t < T.back) {
          /* döner: yandan görünüş incelir, arkadan görünüş genişler */
          const u = (t - T.turn) / (T.back - T.turn);
          if (u < .5) woman(ctx, SX, FEET - 80 * k, P_STAND, Math.max(.06, 1 - u * 2));
          else womanBack(ctx, SX, FEET - 80 * k, 0, 0, Math.max(.06, (u - .5) * 2));
        } else if (t >= T.back) {
          /* şezlonga geçip oturur, sonra kollarını başının arkasına alır */
          const u = ease((t - T.back) / (T.sit - T.back));
          const x = lerp(SX, LX, ease(u * 1.4)), y = lerp(FEET - 80 * k, SEAT, u);
          womanBack(ctx, x, y, u, ease((t - T.arms) / 700), 1);
          seated = true;
        }
        loungerBack(ctx);
        /* sonunda logo görünür */
        if (t > T.brand) {
          const d = ease((t - T.brand) / 500);
          ctx.fillStyle = `rgba(20,30,45,${.28 * d})`; ctx.fillRect(0, 0, W, H);
          if (!brand.classList.contains('on')) brand.classList.add('on');
        }
      }
      if (t >= T.end) { end(); return; }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };

  /* ---------- ilkbahar ---------- */
  Intro.spring = function (ctx, W, H, bg, brand, end, isDone) {
    const T = { flies: 900, land: 2700, fly: 3500, cover: 4500, hold: 5100, end: 5900 };
    const GR = H * .72;
    const BF = {
      hero: { a: '#FFD0E2', b: '#D9467C', e: '#4E0B22' },
      list: [{ a: '#FFD98A', b: '#F08A1C', e: '#2B1A10' }, { a: '#C8EAFF', b: '#3A8EE0', e: '#162848' }, { a: '#FFF4AA', b: '#EDBE2A', e: '#3A2A10' }]
    };
    const PET = ['#FF8FB1', '#FFFFFF', '#FFD34E', '#B98CF2', '#FF6F61', '#8FD3FF', '#FFB3D1'];
    /* çiçek açan ağaç */
    const TX = W * .26, TY = H * .33;
    const blossoms = Array.from({ length: 34 }, (_, i) => { const a = Math.random() * 6.28, r = Math.sqrt(Math.random()) * 78; return { x: TX + Math.cos(a) * r * 1.15, y: TY + Math.sin(a) * r * .8, r: 9 + Math.random() * 10, c: ['#FFC6DA', '#FFE3EC', '#FFFFFF', '#F7A6C4'][i % 4], at: 200 + Math.random() * 1500 }; });
    const flowers = Array.from({ length: 24 }, () => ({ x: Math.random() * W, y: lerp(GR + 18, H - 10, Math.random()), r: 5 + Math.random() * 5, c: PET[Math.random() * PET.length | 0], at: 400 + Math.random() * 1900, ph: Math.random() * 6 }));
    flowers.sort((a, b) => a.y - b.y);
    const tufts = Array.from({ length: 40 }, () => ({ x: Math.random() * W, y: lerp(GR + 6, H, Math.random()) }));
    /* sağdan uzanan dal ve ucundaki çiçek */
    const BX = W * .66, BY = H * .37;
    const LAND = { x: BX - 2, y: BY - 22 };
    const flower = (c, x, y, r, col, s, rot) => {
      if (s <= 0) return;
      c.save(); c.translate(x, y); c.rotate(rot || 0); c.scale(s, s);
      c.fillStyle = col;
      for (let k = 0; k < 5; k++) { c.save(); c.rotate(k * 1.2566); c.beginPath(); c.ellipse(0, -r * .62, r * .45, r * .62, 0, 0, 6.283); c.fill(); c.restore(); }
      c.fillStyle = '#FFC93C'; c.beginPath(); c.arc(0, 0, r * .3, 0, 6.283); c.fill();
      c.restore();
    };
    const butterfly = (c, x, y, s, open, ang, col) => {
      c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s);
      for (const side of [-1, 1]) {
        c.save(); c.scale(side * (.1 + .9 * open), 1);
        const g = c.createRadialGradient(6, -4, 2, 10, -4, 36);
        g.addColorStop(0, col.a); g.addColorStop(.7, col.b); g.addColorStop(1, col.e);
        c.fillStyle = g; c.strokeStyle = col.e; c.lineWidth = 1.6;
        c.beginPath(); c.moveTo(0, -2); c.bezierCurveTo(6, -24, 32, -32, 36, -17); c.bezierCurveTo(39, -4, 23, 4, 0, 2); c.fill(); c.stroke();
        c.beginPath(); c.moveTo(0, 2); c.bezierCurveTo(17, 3, 28, 14, 21, 25); c.bezierCurveTo(14, 33, 4, 23, 0, 6); c.fill(); c.stroke();
        c.fillStyle = 'rgba(255,255,255,.85)';
        [[30, -20], [33, -13], [26, -25], [18, 23]].forEach(([px, py]) => { c.beginPath(); c.arc(px, py, 1.5, 0, 6.283); c.fill(); });
        c.restore();
      }
      c.fillStyle = '#2B1A1F'; c.beginPath(); c.ellipse(0, 4, 2.4, 12, 0, 0, 6.283); c.fill();
      c.beginPath(); c.arc(0, -9, 2.8, 0, 6.283); c.fill();
      c.strokeStyle = '#2B1A1F'; c.lineWidth = .9;
      c.beginPath(); c.moveTo(-1, -11); c.quadraticCurveTo(-4, -19, -8, -22); c.moveTo(1, -11); c.quadraticCurveTo(4, -19, 8, -22); c.stroke();
      c.restore();
    };
    const smalls = BF.list.map((col, i) => ({ col, cx: W * (.3 + i * .22), cy: H * (.5 + (i % 2) * .1), ax: 60 + i * 20, ay: 40 + i * 12, f1: .0011 + i * .0003, f2: .0017 + i * .0002, ph: Math.random() * 6, s: .55 + Math.random() * .2 }));
    const coverFill = () => {
      const g = ctx.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, Math.hypot(W, H) * .6);
      g.addColorStop(0, BF.hero.a); g.addColorStop(.55, BF.hero.b); g.addColorStop(1, '#8E1B3A');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    };

    const t0 = performance.now();
    const frame = now => {
      if (isDone()) return;
      const t = now - t0;
      if (t < T.cover) {
        const sky = ctx.createLinearGradient(0, 0, 0, GR);
        sky.addColorStop(0, '#A9DCFA'); sky.addColorStop(1, '#F1FAFF');
        ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
        const sun = ctx.createRadialGradient(W * .85, H * .08, 10, W * .85, H * .08, 170);
        sun.addColorStop(0, 'rgba(255,250,220,.95)'); sun.addColorStop(1, 'rgba(255,250,220,0)');
        ctx.fillStyle = sun; ctx.fillRect(0, 0, W, H * .5);
        /* bulutlar */
        ctx.fillStyle = 'rgba(255,255,255,.9)';
        [[.3, .12, 1], [.75, .22, .8]].forEach(([fx, fy, s], i) => {
          const x = ((fx * W + t * .012 * (i + 1)) % (W + 120)) - 40, y = fy * H;
          [[0, 0, 22], [24, -8, 26], [50, 0, 20], [26, 6, 22]].forEach(([dx, dy, r]) => { ctx.beginPath(); ctx.arc(x + dx * s, y + dy * s, r * s, 0, 6.283); ctx.fill(); });
        });
        /* tepeler ve çayır */
        const hill = (y0, amp, f, ph, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W + 10; x += 10) ctx.lineTo(x, y0 + Math.sin(x * f + ph) * amp); ctx.lineTo(W, H); ctx.closePath(); ctx.fill(); };
        hill(H * .6, 20, .008, 1, '#B5E29C'); hill(H * .66, 16, .012, 3, '#8ED273');
        const mg = ctx.createLinearGradient(0, GR, 0, H); mg.addColorStop(0, '#79C861'); mg.addColorStop(1, '#4E9E44');
        hill(GR, 8, .02, 0, mg);
        ctx.strokeStyle = '#3F8A39'; ctx.lineWidth = 1.4;
        for (const g of tufts) { ctx.beginPath(); ctx.moveTo(g.x - 3, g.y); ctx.lineTo(g.x - 5, g.y - 8); ctx.moveTo(g.x, g.y); ctx.lineTo(g.x, g.y - 10); ctx.moveTo(g.x + 3, g.y); ctx.lineTo(g.x + 6, g.y - 7); ctx.stroke(); }
        /* ağaç */
        ctx.strokeStyle = '#6B4A35'; ctx.lineCap = 'round';
        ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(TX - 4, GR + 10); ctx.quadraticCurveTo(TX + 8, H * .5, TX, TY + 20); ctx.stroke();
        ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(TX + 2, H * .47); ctx.quadraticCurveTo(TX + 40, H * .4, TX + 62, TY + 6); ctx.moveTo(TX, H * .45); ctx.quadraticCurveTo(TX - 30, H * .4, TX - 58, TY + 10); ctx.stroke();
        for (const b of blossoms) { const s = back((t - b.at) / 500); if (s <= 0) continue; ctx.fillStyle = b.c; ctx.globalAlpha = .92; ctx.beginPath(); ctx.arc(b.x, b.y, b.r * s, 0, 6.283); ctx.fill(); }
        ctx.globalAlpha = 1;
        for (const b of blossoms) { const s = back((t - b.at - 150) / 500); if (s > .5) flower(ctx, b.x, b.y, b.r * .55, '#FFF', s * .8, b.at); }
        /* çayır çiçekleri */
        for (const f of flowers) {
          const s = back((t - f.at) / 500); if (s <= 0) continue;
          const sw = Math.sin(t / 600 + f.ph) * .12;
          ctx.strokeStyle = '#3F8A39'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(f.x, f.y + 12); ctx.lineTo(f.x + sw * 20, f.y); ctx.stroke();
          flower(ctx, f.x + sw * 20, f.y, f.r, f.c, s, sw);
        }
        /* sağdan uzanan dal */
        const bk = out((t - 300) / 1000);
        ctx.strokeStyle = '#6B4A35'; ctx.lineWidth = 7;
        ctx.beginPath(); ctx.moveTo(W + 10, BY + 30); ctx.quadraticCurveTo(lerp(W + 10, BX + 50, bk), BY + 20, lerp(W + 10, BX, bk), BY); ctx.stroke();
        ctx.fillStyle = '#5DB54D';
        if (bk > .6) [[BX + 40, BY + 16, .5], [BX + 80, BY + 26, -.4]].forEach(([x, y, r]) => { ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.beginPath(); ctx.ellipse(0, -9, 6, 12, 0, 0, 6.283); ctx.fill(); ctx.restore(); });
        flower(ctx, BX, BY - 8, 22, '#FF8FB1', back((t - 1200) / 600), .2);
        /* küçük kelebekler */
        for (const b of smalls) {
          if (t < T.flies - 300) continue;
          const x = b.cx + Math.sin(t * b.f1 + b.ph) * b.ax, y = b.cy + Math.sin(t * b.f2 + b.ph * 2) * b.ay;
          butterfly(ctx, x, y, b.s * ease((t - T.flies + 300) / 400), Math.abs(Math.sin(t / 70 + b.ph)), Math.cos(t * b.f1 + b.ph) * .35, b.col);
        }
        /* asıl kelebek: gelir, çiçeğe konar, sonra uçarak ekranı kaplar */
        if (t > T.flies) {
          let x, y, s = .9, open, ang;
          if (t < T.land) {
            const u = ease((t - T.flies) / (T.land - T.flies));
            const p0 = [-40, H * .62], p1 = [W * .2, H * .12], p2 = [W * .9, H * .14], p3 = [LAND.x, LAND.y];
            const m = 1 - u; x = m * m * m * p0[0] + 3 * m * m * u * p1[0] + 3 * m * u * u * p2[0] + u * u * u * p3[0]; y = m * m * m * p0[1] + 3 * m * m * u * p1[1] + 3 * m * u * u * p2[1] + u * u * u * p3[1];
            y += Math.sin(t / 160) * 6 * (1 - u); open = Math.abs(Math.sin(t / 65)); ang = Math.sin(t / 300) * .25;
          } else if (t < T.fly) {
            x = LAND.x; y = LAND.y; open = .55 + .45 * Math.sin((t - T.land) / 230); ang = -.12;
          } else {
            const u = (t - T.fly) / (T.cover - T.fly);
            /* kanadın ortası ekranın ortasına gelecek şekilde yaklaşır */
            s = .9 + 34 * inn(u); open = .82 + .18 * Math.sin((t - T.fly) / 170); ang = -.12 * (1 - u);
            const wx = 20 * s * open * ease(u), wy = -14 * s * ease(u);
            x = lerp(LAND.x, W / 2, ease(u)) - wx; y = lerp(LAND.y, H * .5, ease(u)) - Math.sin(u * Math.PI) * 40 - wy;
          }
          butterfly(ctx, x, y, s, open, ang, BF.hero);
        }
      } else {
        coverFill();
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
})();
