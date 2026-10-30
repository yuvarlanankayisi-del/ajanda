/* Yardımcılar: tarih, kaçış, ikonlar, küçük araçlar */
'use strict';

const N = window.Native || null;

const U = {
  esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  },
  id() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  },
  pad(n) { return (n < 10 ? '0' : '') + n; },
  /* tarih anahtarları yerel saatle YYYY-MM-DD */
  key(d) { d = d || new Date(); return d.getFullYear() + '-' + U.pad(d.getMonth() + 1) + '-' + U.pad(d.getDate()); },
  parse(k) { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); },
  today() { return U.key(new Date()); },
  addDays(k, n) { const d = U.parse(k); d.setDate(d.getDate() + n); return U.key(d); },
  diffDays(a, b) { return Math.round((U.parse(b) - U.parse(a)) / 86400000); },
  weekStart(k) { const d = U.parse(k); const wd = (d.getDay() + 6) % 7; d.setDate(d.getDate() - wd); return U.key(d); },
  weekDays(k) { const s = U.weekStart(k); return [0, 1, 2, 3, 4, 5, 6].map(i => U.addDays(s, i)); },
  dow(k) { return (U.parse(k).getDay() + 6) % 7; }, /* 0=Pzt */
  months: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
  monthsS: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
  days: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
  daysS: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
  fmt(k, mode) {
    const d = U.parse(k);
    if (mode === 'long') return d.getDate() + ' ' + U.months[d.getMonth()] + ' ' + U.days[U.dow(k)];
    if (mode === 'dm') return d.getDate() + ' ' + U.months[d.getMonth()];
    if (mode === 'dms') return d.getDate() + ' ' + U.monthsS[d.getMonth()];
    if (mode === 'full') return d.getDate() + ' ' + U.months[d.getMonth()] + ' ' + d.getFullYear();
    return k;
  },
  rel(k) {
    const n = U.diffDays(U.today(), k);
    if (n === 0) return 'Bugün';
    if (n === 1) return 'Yarın';
    if (n === -1) return 'Dün';
    if (n > 1 && n < 7) return n + ' gün sonra';
    if (n < -1 && n > -7) return (-n) + ' gün önce';
    return U.fmt(k, 'dms');
  },
  nowHM() { const d = new Date(); return U.pad(d.getHours()) + ':' + U.pad(d.getMinutes()); },
  hello() {
    const h = new Date().getHours();
    if (h < 6) return 'İyi geceler';
    if (h < 12) return 'Günaydın';
    if (h < 18) return 'İyi günler';
    return 'İyi akşamlar';
  },
  debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; },
  vibrate(ms) { try { N && N.vibrate(ms || 12); } catch (e) { } },
  toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('on');
    clearTimeout(U._tt); U._tt = setTimeout(() => t.classList.remove('on'), 2200);
  },
  /* görsel sıkıştırma: dosya -> jpeg base64 */
  async compress(file, max, q) {
    max = max || 1600; q = q || 0.82;
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
      let w = img.naturalWidth, h = img.naturalHeight;
      const s = Math.min(1, max / Math.max(w, h));
      w = Math.round(w * s); h = Math.round(h * s);
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      return { b64: c.toDataURL('image/jpeg', q).split(',')[1], w, h };
    } finally { URL.revokeObjectURL(url); }
  },
  pickImages(multiple) {
    return new Promise(res => {
      const i = document.createElement('input');
      i.type = 'file'; i.accept = 'image/*'; if (multiple) i.multiple = true;
      i.style.cssText = 'position:fixed;left:-100px;top:0;opacity:0';
      document.body.appendChild(i);
      i.onchange = () => { res(Array.from(i.files || [])); i.remove(); };
      i.click();
    });
  },
  b64ToBytes(b64) { const s = atob(b64); const a = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; },
  bytesToB64(bytes) {
    let s = ''; const ch = 0x8000;
    for (let i = 0; i < bytes.length; i += ch) s += String.fromCharCode.apply(null, bytes.subarray(i, i + ch));
    return btoa(s);
  },
  utf8B64(str) { return U.bytesToB64(new TextEncoder().encode(str)); },
  ring(size, stroke, pct, color, label, fs) {
    const r = (size - stroke) / 2, c = 2 * Math.PI * r, v = Math.max(0, Math.min(1, pct)) * c;
    return `<span class="ring" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--card2)" stroke-width="${stroke}"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${v.toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 ${size / 2} ${size / 2})" style="transition:stroke-dasharray .5s"/></svg>${label != null ? `<span style="font-size:${fs || 14}px">${label}</span>` : ''}</span>`;
  }
};

/* ===== İkonlar (çizgi) ===== */
const P = {
  bell: '<path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
  moon: '<path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z"/>',
  note: '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h7M9 16h5"/>',
  noteAdd: '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M10 14h5M12.5 11.5v5"/>',
  task: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
  calChk: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M8 3v4M16 3v4M3.5 10h17M9 15l2 2 4-4"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
  cap: '<path d="M3 9l9-4 9 4-9 4z"/><path d="M7 11v5c0 1.5 2.5 3 5 3s5-1.5 5-3v-5"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
  chart: '<path d="M4 19h16"/><path d="M5 16l4-5 4 3 6-7"/>',
  bars: '<path d="M5 20v-4M10 20v-7M15 20v-5M20 20V9"/>',
  book: '<path d="M3 5.5c3-1 6-1 9 1 3-2 6-2 9-1V19c-3-1-6-1-9 1-3-2-6-2-9-1z"/><path d="M12 6.5V20"/>',
  journal: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>',
  film: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18M8 5l-1.5 4M14 5l-1.5 4M20 5l-1.5 4"/>',
  pin: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.2"/>',
  wallet: '<rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18M16 14.5h2"/>',
  star: '<path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>',
  drop: '<path d="M12 3.5c3 4 6 7.3 6 10.8a6 6 0 0 1-12 0c0-3.5 3-6.8 6-10.8z"/>',
  gift: '<rect x="4" y="10" width="16" height="10" rx="1.5"/><rect x="3" y="7" width="18" height="3" rx="1"/><path d="M12 7v13M12 7c-1.5-3-5-3.5-5-1.5S10 7 12 7c2 0 5 .5 5-1.5S13.5 4 12 7z"/>',
  quote: '<path d="M10 7H5v5h5zM10 12c0 3-1.5 4.5-4 5.5M19 7h-5v5h5zM19 12c0 3-1.5 4.5-4 5.5"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>',
  pot: '<path d="M5 11h14v4.5a4.5 4.5 0 0 1-4.5 4.5h-5A4.5 4.5 0 0 1 5 15.5z"/><path d="M3 11h18M9.5 7.5c0-1 1-1.2 1-2.5M13.5 7.5c0-1 1-1.2 1-2.5"/>',
  mail: '<rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3.5 7.5L12 13l8.5-5.5"/>',
  spark: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M18.5 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>',
  home: '<path d="M4 11l8-6.5 8 6.5V20h-5.5v-5h-5v5H4z"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  left: '<path d="M14 6l-6 6 6 6"/>',
  right: '<path d="M10 6l6 6-6 6"/>',
  more: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  trash: '<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  archive: '<rect x="3" y="4" width="18" height="5" rx="1.5"/><path d="M5 9v10h14V9M10 13h4"/>',
  pinT: '<path d="M9 4h6l-1 6 3 3H7l3-3zM12 13v7"/>',
  image: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.6"/><path d="M21 16l-5-5-8 8"/>',
  smile: '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 14c.9 1.2 2.1 1.8 3.5 1.8s2.6-.6 3.5-1.8M9.5 10h.01M14.5 10h.01"/>',
  stickerI: '<path d="M20 12.5A8 8 0 1 1 11.5 4h1A7.5 7.5 0 0 0 20 11.5z"/><path d="M9 14c.8 1 1.8 1.5 3 1.5M9 10h.01M14 10h.01"/>',
  tagI: '<path d="M3.5 12.5V4h8.5l8.5 8.5-8.5 8.5z"/><circle cx="8" cy="8.5" r="1.4"/>',
  text: '<path d="M5 6h14M12 6v13M9 19h6"/>',
  head: '<path d="M6 5v14M18 5v14M6 12h12"/>',
  list: '<rect x="4" y="5" width="5" height="5" rx="1.2"/><path d="M12 7.5h8M12 16.5h8"/><rect x="4" y="14" width="5" height="5" rx="1.2"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l2.5 2.5"/>',
  repeat: '<path d="M4 12a7 7 0 0 1 12-5l2 2M20 12a7 7 0 0 1-12 5l-2-2"/><path d="M18 4v5h-5M6 20v-5h5"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  cloud: '<path d="M7 18a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.4 1.6A3.8 3.8 0 0 1 17.5 18z"/><path d="M12 11v6M9.5 13.5L12 11l2.5 2.5"/>',
  download: '<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19h14"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-1 2-2 0-1.5-1.3-1.7-1.3-3 0-1 .8-1.8 1.8-1.8H17a4 4 0 0 0 4-4C21 6.4 17 3 12 3z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="10" cy="7" r="1.2"/><circle cx="15" cy="7" r="1.2"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20c1.5-4 4.3-5.5 7.5-5.5s6 1.5 7.5 5.5"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>',
  play: '<path d="M8 5l11 7-11 7z"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  fp: '<path d="M8 11a4 4 0 0 1 8 0v2c0 3-1 5.5-2.5 7.5M12 11v3c0 3.5-1.5 6-3 7M5 9a7.5 7.5 0 0 1 14 0M5.5 15c.3-1.2.5-2.5.5-4M19 13.5c0 1.5-.2 3-.6 4.3"/>',
  flame: '<path d="M12 3c1 3 4 4.5 4 8.5a4 4 0 0 1-8 0c0-1.8.8-3 1.8-4 .2 1.5 1 2.3 2 2.5-.5-2.5-.3-5 .2-7z"/>',
  update: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 5v6h-6"/>',
  flower: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="6" r="3"/><circle cx="12" cy="18" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="12" r="3"/>',
  arrowR: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  timer: '<circle cx="12" cy="13" r="7.5"/><path d="M12 9.5V13l2 2M9.5 3h5"/>'
};
function ic(name, size, sw, extra) {
  return `<svg width="${size || 20}" height="${size || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw || 1.7}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra || ''}>${P[name] || ''}</svg>`;
}
function icf(name, size) {
  return `<svg width="${size || 20}" height="${size || 20}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${P[name] || ''}</svg>`;
}
