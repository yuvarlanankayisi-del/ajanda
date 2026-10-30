/* Temalar, arka plan animasyonları, başlık sahneleri */
'use strict';

const THEMES = {
  bordo: { name: 'Bordo Gece', dark: true, v: { bg: '#140A0E', bg2: '#1D0E14', ac: '#E89AAD', ac2: '#7A2843', acTx: '#FBF1F4', tx: '#F4E9EC', tx2: '#FBF1F4', mu: '#C9AFB6', mu2: '#9C7D86', line: 'rgba(232,154,173,.16)', grad1: '#C4566F', grad2: '#8E2E48', blob1: '#4E1A2A', blob2: '#45192A', gold: '#D9B47A' } },
  sarap: { name: 'Şarap', dark: true, v: { bg: '#12070A', bg2: '#1B0B10', ac: '#E07A86', ac2: '#8A1E33', acTx: '#FFF0F2', tx: '#F6E6E8', tx2: '#FFF3F4', mu: '#C8A5AB', mu2: '#97707A', line: 'rgba(224,122,134,.18)', grad1: '#B8324C', grad2: '#7A1427', blob1: '#5A1424', blob2: '#4A1020', gold: '#E0B070' } },
  murekkep: { name: 'Mürekkep & Altın', dark: true, v: { bg: '#0E0D10', bg2: '#17151A', ac: '#E2C285', ac2: '#5A4A2E', acTx: '#FFF6E6', tx: '#EEE9E2', tx2: '#FFF9F0', mu: '#B7AFA4', mu2: '#857D72', line: 'rgba(226,194,133,.16)', grad1: '#C9A35C', grad2: '#8A6B33', blob1: '#2E2618', blob2: '#2A2030', gold: '#E2C285' } },
  gece: { name: 'Gece Mavisi', dark: true, v: { bg: '#0B0F18', bg2: '#121827', ac: '#9DB8E8', ac2: '#2E4675', acTx: '#F1F5FF', tx: '#E8EDF7', tx2: '#F5F8FF', mu: '#A8B3C9', mu2: '#77839C', line: 'rgba(157,184,232,.16)', grad1: '#5878B8', grad2: '#2E4675', blob1: '#1C2A4A', blob2: '#22234A', gold: '#E2C285' } },
  orman: { name: 'Orman', dark: true, v: { bg: '#0C120F', bg2: '#131C17', ac: '#9FCBA9', ac2: '#2F5A40', acTx: '#F0FAF2', tx: '#E7F0EA', tx2: '#F5FBF6', mu: '#A9BDB0', mu2: '#77907F', line: 'rgba(159,203,169,.16)', grad1: '#5E9A71', grad2: '#2F5A40', blob1: '#1C3426', blob2: '#22302A', gold: '#D9C27A' } },
  lavanta: { name: 'Lavanta Gece', dark: true, v: { bg: '#110D17', bg2: '#191322', ac: '#C9B0EE', ac2: '#4E3577', acTx: '#F7F1FF', tx: '#EEE8F6', tx2: '#FAF6FF', mu: '#B7ABC8', mu2: '#857A98', line: 'rgba(201,176,238,.16)', grad1: '#8C6CC4', grad2: '#4E3577', blob1: '#2E2045', blob2: '#3A1F3E', gold: '#E2C285' } },
  gul: { name: 'Gül Kurusu', dark: false, v: { bg: '#F6ECE8', bg2: '#FFF8F6', ac: '#9C3D54', ac2: '#9C3D54', acTx: '#FFF6F7', tx: '#3A2328', tx2: '#2E1A1F', mu: '#6E5258', mu2: '#A08A90', line: 'rgba(156,61,84,.14)', grad1: '#B8506A', grad2: '#8A2E46', blob1: '#EBC9CF', blob2: '#E4D3C4', gold: '#A87B2F' } },
  kum: { name: 'Kum Beji', dark: false, v: { bg: '#F4EEE4', bg2: '#FBF8F2', ac: '#8A5A2B', ac2: '#7A4E26', acTx: '#FFF8EF', tx: '#3A2E22', tx2: '#2C2218', mu: '#6E5E4C', mu2: '#A39280', line: 'rgba(138,90,43,.15)', grad1: '#A8743E', grad2: '#7A4E26', blob1: '#E6D5BC', blob2: '#EAD9CF', gold: '#9A6A22' } }
};

const BGS = { isiklar: 'Süzülen ışıklar', yildiz: 'Yıldızlar', toz: 'Uçuşan toz', dalga: 'Yavaş dalga', kapali: 'Kapalı' };
const HEROES = { oda: 'Gece odası', pencere: 'Yıldızlı pencere', cicek: 'Çiçekler', yok: 'Görselsiz', foto: 'Kendi fotoğrafım' };

const Theme = {
  apply() {
    const s = S.set;
    const th = THEMES[s.theme] || THEMES.bordo;
    const r = document.documentElement.style;
    const v = th.v;
    r.setProperty('--bg', v.bg); r.setProperty('--bg2', v.bg2); r.setProperty('--ac', v.ac); r.setProperty('--ac2', v.ac2);
    r.setProperty('--acTx', v.acTx); r.setProperty('--tx', v.tx); r.setProperty('--tx2', v.tx2); r.setProperty('--mu', v.mu);
    r.setProperty('--mu2', v.mu2); r.setProperty('--line', v.line); r.setProperty('--grad1', v.grad1); r.setProperty('--grad2', v.grad2);
    r.setProperty('--blob1', v.blob1); r.setProperty('--blob2', v.blob2); r.setProperty('--gold', v.gold);
    r.setProperty('--card', th.dark ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,.62)');
    r.setProperty('--card2', th.dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)');
    r.setProperty('--line2', th.dark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.07)');
    r.setProperty('--shadow', th.dark ? 'rgba(0,0,0,.35)' : 'rgba(80,40,50,.18)');
    document.body.classList.toggle('light', !th.dark);
    try { N && N.setBars(v.bg, !th.dark); } catch (e) { }
    Theme.bg();
  },
  bg() {
    const el = document.getElementById('bgfx');
    const kind = S.set.bg;
    if (el.dataset.kind === kind) return;
    el.dataset.kind = kind;
    let h = '';
    if (kind === 'isiklar') h = '<div class="blob a"></div><div class="blob b"></div><div class="blob c"></div>';
    else if (kind === 'yildiz') {
      for (let i = 0; i < 38; i++) {
        const x = (i * 37 + 11) % 100, y = (i * 53 + 7) % 100, d = (i * 1.7) % 7, s = i % 3 === 0 ? 2.5 : 1.6;
        h += `<i class="st" style="left:${x}%;top:${y}%;width:${s}px;height:${s}px;animation-delay:${d.toFixed(1)}s"></i>`;
      }
      h += '<div class="blob a" style="opacity:.3"></div>';
    } else if (kind === 'toz') {
      for (let i = 0; i < 16; i++) {
        const x = (i * 41 + 5) % 100, dur = 26 + (i * 7) % 24, d = -(i * 3.3) % dur;
        h += `<i class="dust" style="left:${x}%;animation-duration:${dur}s;animation-delay:${d.toFixed(1)}s"></i>`;
      }
      h += '<div class="blob b" style="opacity:.3"></div>';
    } else if (kind === 'dalga') h = '<div class="wave"></div><div class="wave w2"></div>';
    el.innerHTML = h;
  },
  /* başlık sahnesi (390x124 görünüm) */
  hero() {
    const s = S.set;
    if (s.hero === 'foto' && s.heroPhoto) return `<img class="scene" src="${S.photoUrl(s.heroPhoto)}" alt="">`;
    if (s.hero === 'yok') return '';
    const dark = (THEMES[s.theme] || THEMES.bordo).dark;
    const room = dark ? 'var(--bg2)' : 'var(--blob2)';
    const wall = dark ? '#2C131C' : 'var(--blob1)';
    const sky1 = s.theme === 'gece' ? '#141C35' : '#2A1430', sky2 = s.theme === 'gece' ? '#2B3A62' : '#5A2638';
    const frame = dark ? 'color-mix(in srgb,var(--ac2) 45%,#000)' : 'color-mix(in srgb,var(--ac2) 60%,#fff)';
    const flowers = `<path d="M110 85c0-13 3-19 8-19s8 6 8 19z" fill="${frame}"/>
      <path d="M118 66c-1-9-7-14-11-19M118 66c0-10 3-16 7-21M118 66c3-8 8-11 13-14" fill="none" stroke="${frame}" stroke-width="1.5"/>
      <circle cx="106" cy="46" r="5.5" fill="var(--ac2)"/><circle cx="125" cy="43" r="6" fill="var(--grad1)"/><circle cx="132" cy="53" r="4.5" fill="var(--ac2)"/><circle cx="114" cy="37" r="4" fill="var(--ac)" opacity=".8"/>`;
    const candle = `<circle cx="152" cy="66" r="24" fill="url(#glw)"/><rect x="148" y="70" width="8" height="15" rx="1" fill="#E8D6C4"/><ellipse class="flame" cx="152" cy="65" rx="2.4" ry="5" fill="#F6C27E"/>`;
    const books = `<rect x="168" y="54" width="7" height="31" fill="var(--ac2)"/><rect x="176" y="58" width="6" height="27" fill="${frame}"/><rect x="183" y="50" width="8" height="35" fill="var(--grad1)" opacity=".8"/><rect x="192" y="60" width="6" height="25" fill="var(--ac2)" opacity=".7"/>`;
    const win = `<rect x="222" y="0" width="92" height="78" fill="url(#sky)"/>
      <circle class="twk" cx="236" cy="14" r="1" fill="#F4E9EC"/><circle class="twk" cx="300" cy="10" r=".9" fill="#F4E9EC" style="animation-delay:2s"/><circle class="twk" cx="252" cy="34" r=".8" fill="#F4E9EC" style="animation-delay:4s"/><circle class="twk" cx="306" cy="40" r="1" fill="#F4E9EC" style="animation-delay:1s"/>
      <path d="M270 18a9 9 0 1 0 8.5 12.5a7 7 0 1 1-8.5-12.5z" fill="#F1D9A8"/>
      <path d="M222 78v-10h6v-6h7v9h4v-14h7v16h6v-8h8v8h5v-13h7v13h6v-5h7v5h8v5z" fill="${frame}" opacity=".8"/>
      <rect x="218" y="0" width="4" height="84" fill="${frame}"/><rect x="314" y="0" width="4" height="84" fill="${frame}"/><rect x="266" y="0" width="3" height="78" fill="${frame}"/><rect x="222" y="38" width="92" height="3" fill="${frame}"/>
      <rect x="208" y="78" width="182" height="7" fill="${frame}"/><path d="M318 0h72v124c-30-20-58-50-72-100z" fill="${room}" opacity=".9"/>`;
    const cat = `<g fill="#1A0B12" opacity=".95"><ellipse cx="300" cy="71" rx="14" ry="8"/><circle cx="289" cy="61" r="6.5"/><path d="M284 57l1.5-7 4 4.5zM292 55l3.5-4.5 1 7z"/></g><path d="M312 72c6 0 9-4 7.5-9" fill="none" stroke="#1A0B12" stroke-width="2.5" stroke-linecap="round"/>`;
    let body = '';
    if (s.hero === 'oda') body = `<g transform="translate(70 0)">${win}${cat}</g><g transform="translate(85 0)">${books}${candle}${flowers}</g>`;
    else if (s.hero === 'pencere') body = `<g transform="translate(70 0)">${win}</g>`;
    else if (s.hero === 'cicek') body = `<g transform="translate(150 0)">${flowers}</g><g transform="translate(220 10) scale(.9)">${flowers}</g>` + candle.replace(/152/g, '330').replace(/148/g, '326');
    return `<svg class="scene" viewBox="0 0 390 124" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky1}"/><stop offset="1" stop-color="${sky2}"/></linearGradient>
      <radialGradient id="glw" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#F2B57A" stop-opacity=".45"/><stop offset="1" stop-color="#F2B57A" stop-opacity="0"/></radialGradient>
      <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${wall}"/><stop offset="1" stop-color="var(--bg)"/></linearGradient>
      <linearGradient id="lft" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="var(--bg)" stop-opacity=".75"/><stop offset=".5" stop-color="var(--bg)" stop-opacity="0"/></linearGradient></defs>
      <rect width="390" height="124" fill="url(#wall)"/>${body}<rect width="390" height="124" fill="url(#lft)"/></svg>`;
  }
};
