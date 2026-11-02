/* Notlar: liste + düzenleyici (bloklar, fotoğraf, sticker, kapak) */
'use strict';

const COVER_COLORS = ['#7A2843', '#4C1B2C', '#8E3C54', '#5A4A2E', '#2E4675', '#2F5A40', '#4E3577', '#6A3344', '#C4566F', '#D9B47A', '#8FB7C9', '#C9B4E0'];

const STICKERS = {
  kalp: '<svg viewBox="0 0 100 100"><path d="M50 86S12 62 12 36a20 20 0 0 1 38-9 20 20 0 0 1 38 9c0 26-38 50-38 50z" fill="#E8667F" stroke="#fff" stroke-width="5"/><ellipse cx="34" cy="34" rx="7" ry="5" fill="#fff" opacity=".5"/></svg>',
  yildiz: '<svg viewBox="0 0 100 100"><path d="M50 8l12 26 28 3-21 19 6 28-25-15-25 15 6-28-21-19 28-3z" fill="#F2C766" stroke="#fff" stroke-width="5" stroke-linejoin="round"/><circle cx="42" cy="50" r="3" fill="#6B4A1E"/><circle cx="58" cy="50" r="3" fill="#6B4A1E"/><path d="M44 60q6 5 12 0" stroke="#6B4A1E" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
  ay: '<svg viewBox="0 0 100 100"><path d="M62 12a38 38 0 1 0 28 54A30 30 0 0 1 62 12z" fill="#F1D9A8" stroke="#fff" stroke-width="5"/><circle cx="20" cy="22" r="3" fill="#F1D9A8"/><circle cx="84" cy="26" r="2.5" fill="#F1D9A8"/><path d="M38 58q5 4 10 0" stroke="#7A5A2E" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M33 48h6M47 48h6" stroke="#7A5A2E" stroke-width="3" stroke-linecap="round"/></svg>',
  cicek: '<svg viewBox="0 0 100 100"><g stroke="#fff" stroke-width="4">' + [0, 72, 144, 216, 288].map(a => `<ellipse cx="50" cy="28" rx="14" ry="20" fill="#E89AAD" transform="rotate(${a} 50 50)"/>`).join('') + '</g><circle cx="50" cy="50" r="13" fill="#F2C766" stroke="#fff" stroke-width="4"/></svg>',
  kahve: '<svg viewBox="0 0 100 100"><path d="M20 40h50v24a18 18 0 0 1-18 18H38a18 18 0 0 1-18-18z" fill="#C9A385" stroke="#fff" stroke-width="5"/><path d="M70 46h6a10 10 0 0 1 0 20h-7" fill="none" stroke="#fff" stroke-width="9"/><path d="M70 46h6a10 10 0 0 1 0 20h-7" fill="none" stroke="#C9A385" stroke-width="4"/><path d="M36 14c-4 6 4 10 0 18M50 12c-4 6 4 10 0 18" stroke="#B49AA2" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="38" cy="58" r="2.5" fill="#5A3A22"/><circle cx="52" cy="58" r="2.5" fill="#5A3A22"/><path d="M41 66q4 3 8 0" stroke="#5A3A22" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>',
  kitap: '<svg viewBox="0 0 100 100"><path d="M10 26c14-6 28-6 40 4 12-10 26-10 40-4v52c-14-6-28-6-40 4-12-10-26-10-40-4z" fill="#7A2843" stroke="#fff" stroke-width="5" stroke-linejoin="round"/><path d="M50 30v52" stroke="#fff" stroke-width="4"/><path d="M20 40c8-2 16-2 22 2M20 50c8-2 16-2 22 2M58 42c6-4 14-4 22-2M58 52c6-4 14-4 22-2" stroke="#F4D8DF" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
  bulut: '<svg viewBox="0 0 100 100"><path d="M26 74a16 16 0 0 1-2-32 22 22 0 0 1 42-6 18 18 0 0 1 10 38z" fill="#E8EEF6" stroke="#fff" stroke-width="5"/><circle cx="40" cy="56" r="3" fill="#5A6A80"/><circle cx="58" cy="56" r="3" fill="#5A6A80"/><ellipse cx="34" cy="63" rx="4" ry="2.5" fill="#F2A7B5"/><ellipse cx="64" cy="63" rx="4" ry="2.5" fill="#F2A7B5"/><path d="M45 62q4 3 8 0" stroke="#5A6A80" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>',
  kedi: '<svg viewBox="0 0 100 100"><path d="M20 30l8-20 16 14h12l16-14 8 20v30a30 26 0 0 1-60 0z" fill="#3A2A30" stroke="#fff" stroke-width="5" stroke-linejoin="round"/><ellipse cx="38" cy="50" rx="5" ry="6" fill="#F2C766"/><ellipse cx="62" cy="50" rx="5" ry="6" fill="#F2C766"/><path d="M47 60l3 3 3-3" stroke="#F2A7B5" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M14 58h14M14 66h14M72 58h14M72 66h14" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/></svg>',
  fiyonk: '<svg viewBox="0 0 100 100"><path d="M50 50L16 30v40zM50 50l34-20v40z" fill="#C4566F" stroke="#fff" stroke-width="5" stroke-linejoin="round"/><path d="M44 54l-10 30 8-4 6 6 2-30M56 54l10 30-8-4-6 6-2-30" fill="#A8405A" stroke="#fff" stroke-width="4" stroke-linejoin="round"/><circle cx="50" cy="50" r="9" fill="#E8667F" stroke="#fff" stroke-width="4"/></svg>',
  pasta: '<svg viewBox="0 0 100 100"><rect x="18" y="46" width="64" height="36" rx="6" fill="#F4D8DF" stroke="#fff" stroke-width="5"/><path d="M18 58c8 6 16 6 21 0 5 6 16 6 21 0 5 6 14 6 22 0" fill="none" stroke="#E8667F" stroke-width="5"/><rect x="47" y="26" width="6" height="20" rx="2" fill="#8FB7C9"/><path d="M50 12c-5 6-4 10 0 12 4-2 5-6 0-12z" fill="#F2C766"/></svg>',
  yaprak: '<svg viewBox="0 0 100 100"><path d="M18 82C14 40 44 14 86 14c0 42-26 72-68 68z" fill="#9CC0A6" stroke="#fff" stroke-width="5" stroke-linejoin="round"/><path d="M22 78C40 60 56 44 76 26" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/></svg>',
  nota: '<svg viewBox="0 0 100 100"><path d="M38 70V22l40-8v48" fill="none" stroke="#fff" stroke-width="12" stroke-linejoin="round"/><path d="M38 70V22l40-8v48" fill="none" stroke="#C9B4E0" stroke-width="6" stroke-linejoin="round"/><ellipse cx="28" cy="72" rx="12" ry="9" fill="#C9B4E0" stroke="#fff" stroke-width="4"/><ellipse cx="68" cy="64" rx="12" ry="9" fill="#C9B4E0" stroke="#fff" stroke-width="4"/></svg>',
  harika: '<svg viewBox="0 0 120 60"><rect x="4" y="6" width="112" height="48" rx="24" fill="#7A2843" stroke="#fff" stroke-width="5" transform="rotate(-4 60 30)"/><text x="60" y="40" text-anchor="middle" font-family="Cormorant Garamond,serif" font-style="italic" font-weight="700" font-size="28" fill="#FBF1F4" transform="rotate(-4 60 30)">Harika!</text></svg>',
  tesekkur: '<svg viewBox="0 0 140 60"><rect x="4" y="6" width="132" height="48" rx="12" fill="#F2C766" stroke="#fff" stroke-width="5" transform="rotate(3 70 30)"/><text x="70" y="39" text-anchor="middle" font-family="Manrope,sans-serif" font-weight="800" font-size="19" fill="#5A3A12" transform="rotate(3 70 30)">TEŞEKKÜRLER</text></svg>',
  tamam: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="38" fill="#9CC0A6" stroke="#fff" stroke-width="6"/><path d="M32 52l12 12 24-26" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  ask: '<svg viewBox="0 0 130 60"><rect x="4" y="6" width="122" height="48" rx="24" fill="#F4D8DF" stroke="#fff" stroke-width="5" transform="rotate(-3 65 30)"/><text x="65" y="40" text-anchor="middle" font-family="Cormorant Garamond,serif" font-style="italic" font-weight="700" font-size="26" fill="#7A2843" transform="rotate(-3 65 30)">Seni seviyorum</text></svg>'
};
function stickerHtml(b) {
  if (b.p) return `<img src="${S.photoUrl(b.p)}" style="border-radius:50%;border:5px solid #fff;object-fit:cover;transform:rotate(-4deg);box-shadow:0 4px 14px rgba(0,0,0,.3)" alt="">`;
  return STICKERS[b.s] || '';
}
function coverStyle(c) {
  if (!c) return '';
  if (c.type === 'photo') return `background-image:url('${S.photoUrl(c.v)}')`;
  return `background:linear-gradient(150deg,${c.v},color-mix(in srgb,${c.v} 55%,#000))`;
}

Screens.notes = {
  nav: 'sections',
  render(p) {
    const f = p.f || 'all';
    const q = (p.q || '').toLocaleLowerCase('tr-TR');
    let list = S.db.notes.slice();
    if (f === 'archive') list = list.filter(n => n.archived);
    else {
      list = list.filter(n => !n.archived);
      if (f === 'fav') list = list.filter(n => n.fav);
      else if (f === 'pin') list = list.filter(n => n.pinned);
      else if (f.startsWith('f:')) list = list.filter(n => n.folder === f.slice(2));
      else if (f.startsWith('t:')) list = list.filter(n => (n.tags || []).includes(f.slice(2)));
    }
    if (q) list = list.filter(n => (n.title + ' ' + S.noteText(n) + ' ' + (n.tags || []).join(' ')).toLocaleLowerCase('tr-TR').includes(q));
    list.sort((a, b) => (b.pinned - a.pinned) || (b.updated - a.updated));
    const tags = [...new Set(S.db.notes.flatMap(n => n.tags || []))].sort();
    const chip = (v, l, extra) => `<button class="chip ${f === v ? 'on' : ''}" data-a="nf" data-v="${U.esc(v)}">${extra || ''}${U.esc(l)}</button>`;
    const curFolder = f.startsWith('f:') ? S.db.folders.find(x => x.id === f.slice(2)) : null;
    return `<div class="topbar" style="padding-top:18px">${App.stack.length > 1 ? `<button class="icbtn box" data-a="back">${ic('back', 20, 1.8)}</button>` : ''}<h1>Notlar</h1>
        <button class="icbtn box" data-a="newNote" data-folder="${curFolder ? curFolder.id : ''}" aria-label="Yeni not">${ic('plus', 20, 2)}</button></div>
      <div class="wrap pad" style="gap:10px">
        <div class="row card" style="padding:4px 12px">${ic('search', 18)}<input class="bare" id="nq" placeholder="Notlarda ara" value="${U.esc(p.q || '')}" style="padding:9px 0;font-size:14.5px"></div>
        <div class="chips">${chip('all', 'Tümü')}${S.db.notes.some(n => n.pinned) ? chip('pin', 'Sabitlenen') : ''}${chip('fav', 'Favoriler')}
          ${S.db.folders.map(x => chip('f:' + x.id, x.name, `<i style="background:${x.color}"></i>`)).join('')}
          <button class="chip" data-a="newFolder">${ic('plus', 14)} Klasör</button>${chip('archive', 'Arşiv')}</div>
        ${tags.length ? `<div class="chips">${tags.map(t => chip('t:' + t, '#' + t)).join('')}</div>` : ''}
        ${curFolder ? `<div class="row"><span class="mu sp" style="font-size:12.5px">${ic('folder', 14)} ${U.esc(curFolder.name)} · ${list.length} not</span><button class="btn ghost sm" data-a="editFolder" data-id="${curFolder.id}">Klasörü düzenle</button></div>` : ''}
        ${list.length ? `<div class="notes">${list.map(n => {
          const txt = S.noteText(n);
          const ph = (n.items || []).filter(b => b.t === 'photo').length + (n.blocks || []).filter(b => b.t === 'photo').length;
          return `<button class="ncard" data-a="openNote" data-id="${n.id}">${n.cover ? `<div class="cv" style="${coverStyle(n.cover)}"></div>` : ''}
            <div class="bd">${n.title ? `<b>${U.esc(n.title)}</b>` : ''}${txt ? `<p>${U.esc(txt.slice(0, 260))}</p>` : ''}
            ${(n.tags || []).length ? `<div class="tg">${n.tags.slice(0, 3).map(t => `<span>#${U.esc(t)}</span>`).join('')}</div>` : ''}
            <div class="row" style="gap:6px"><small class="mu2" style="font-size:10px;flex:1">${U.fmt(U.key(new Date(n.updated)), 'dms')}</small><span class="ic">${n.pinned ? ic('pinT', 12) : ''}${n.fav ? icf('heart', 12) : ''}${ph ? ic('image', 12) : ''}</span></div></div></button>`;
        }).join('')}</div>` : `<div class="col" style="align-items:center;padding:50px 20px;gap:12px;text-align:center"><span style="color:var(--ac)">${ic('note', 40, 1.2)}</span><span class="mu">${q ? 'Aramana uyan not yok.' : f === 'archive' ? 'Arşiv boş.' : 'Henüz not yok. İlk notunu yazmaya ne dersin?'}</span>${!q && f !== 'archive' ? `<button class="btn soft" data-a="newNote">Not yaz</button>` : ''}</div>`}
      </div>`;
  },
  mount(el, p) {
    const q = el.querySelector('#nq');
    q.addEventListener('input', U.debounce(() => { App.cur.entry.params.q = q.value; const pos = q.selectionStart; App.forceRefreshKeep(); }, 250));
  },
  acts: {
    nf(t) { App.cur.entry.params.f = t.dataset.v; App.forceRefresh(); },
    openNote(t) { App.go('note', { id: t.dataset.id }); },
    async newFolder() {
      const name = await App.prompt('Yeni klasör', '', 'Klasör adı');
      if (name) { const fd = { id: 'f' + U.id(), name, color: CAT_COLORS[S.db.folders.length % CAT_COLORS.length], updated: Date.now() }; S.db.folders.push(fd); S.touch(); App.cur.entry.params.f = 'f:' + fd.id; }
    },
    async editFolder(t) {
      const fd = S.db.folders.find(x => x.id === t.dataset.id); if (!fd) return;
      const rec = App.sheet(`<h3>Klasör</h3><div class="menu"><button data-a="fRen">${ic('edit', 20)} Yeniden adlandır</button><button data-a="fDel">${ic('trash', 20)} Klasörü sil</button></div>`, {
        acts: {
          fRen: async () => { App.closeSheet(rec); const n = await App.prompt('Klasör adı', fd.name); if (n) { fd.name = n; fd.updated = Date.now(); S.touch(); } },
          fDel: async () => { App.closeSheet(rec); if (await App.confirm('Klasör silinsin mi? İçindeki notlar silinmez, "Tümü"de kalır.', 'Sil', true)) { for (const n of S.db.notes) if (n.folder === fd.id) { n.folder = null; n.updated = Date.now(); } S.remove('folders', fd.id); App.cur.entry.params.f = 'all'; App.forceRefresh(); } }
        }
      });
    }
  }
};
/* arama kutusundayken yeniden çizip odağı koru */
App.forceRefreshKeep = function () {
  const ae = document.activeElement, id = ae && ae.id, pos = ae && ae.selectionStart;
  if (ae) ae.blur();
  App.forceRefresh();
  if (id) { const n = document.getElementById(id); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) { } } }
};

/* ---------- not düzenleyici ---------- */
Screens.note = {
  noNav: true, noAutoRefresh: true,
  get(p) { return S.db.notes.find(n => n.id === p.id); },
  render(p) {
    const n = Screens.note.get(p);
    if (!n) return '<div class="wrap pad"><p class="mu">Not bulunamadı.</p></div>';
    const fd = S.db.folders.find(x => x.id === n.folder);
    Screens.note.migrate(n);
    const blocks = (n.blocks || []).map((b, i) => {
      if (b.t === 'check') return `<div class="bl check ${b.done ? 'on' : ''}"><button class="chk lg ${b.done ? 'on' : ''}" data-a="bChk" data-i="${i}" style="width:20px;height:20px"></button><textarea class="bare grow" rows="1" data-in="bIn" data-i="${i}" placeholder="Liste maddesi">${U.esc(b.v)}</textarea><button class="x" data-a="bDel" data-i="${i}">${ic('x', 14)}</button></div>`;
      return `<div class="bl ${b.t === 'h' ? 'h' : ''}"><textarea class="bare grow" rows="1" data-in="bIn" data-i="${i}" placeholder="${b.t === 'h' ? 'Başlık' : i === 0 ? 'Yazmaya başla…' : 'Metin'}">${U.esc(b.v)}</textarea>${(n.blocks.length > 1) ? `<button class="x" data-a="bDel" data-i="${i}">${ic('x', 14)}</button>` : ''}</div>`;
    }).join('');
    return `<div style="position:relative">
      ${n.cover ? `<div class="cover" style="${coverStyle(n.cover)}"><div class="cvbtns"><button class="btn sm" data-a="cover" style="background:rgba(0,0,0,.45);color:#fff">Kapağı değiştir</button></div></div>` : ''}
      <div class="row" style="position:${n.cover ? 'absolute' : 'relative'};top:0;left:0;right:0;padding:14px 10px 4px">
        <button class="icbtn box" data-a="back" aria-label="Geri" ${n.cover ? 'style="background:rgba(0,0,0,.4);color:#fff"' : ''}>${ic('back', 20, 1.8)}</button><span class="sp"></span>
        <button class="icbtn box" data-a="nPin" aria-label="Sabitle" style="${n.pinned ? 'color:var(--ac)' : ''}${n.cover ? ';background:rgba(0,0,0,.4)' : ''}">${ic('pinT', 19)}</button>
        <button class="icbtn box" data-a="nFav" aria-label="Favori" style="${n.fav ? 'color:var(--ac)' : ''}${n.cover ? ';background:rgba(0,0,0,.4)' : ''}">${n.fav ? icf('heart', 19) : ic('heart', 19)}</button>
        <button class="icbtn box" data-a="nMenu" aria-label="Diğer" ${n.cover ? 'style="background:rgba(0,0,0,.4);color:#fff"' : ''}>${ic('more', 20, 2)}</button>
      </div>
      <div class="wrap pad" style="padding-top:${n.cover ? 14 : 6}px;gap:10px;padding-bottom:90px">
        <input class="edtitle" id="nTitle" data-in="nTitle" value="${U.esc(n.title)}" placeholder="Başlık" autocomplete="off">
        <div class="row" style="flex-wrap:wrap;gap:6px">
          <small class="mu2" style="font-size:11px">${U.fmt(U.key(new Date(n.updated)), 'full')}</small>
          <button class="chip" data-a="nFolder" style="padding:4px 10px;font-size:11px">${ic('folder', 13)} ${fd ? U.esc(fd.name) : 'Klasörsüz'}</button>
          ${(n.tags || []).map(t => `<button class="chip" data-a="tagDel" data-t="${U.esc(t)}" style="padding:4px 10px;font-size:11px;color:var(--ac)">#${U.esc(t)} ×</button>`).join('')}
          <button class="chip" data-a="tagAdd" style="padding:4px 10px;font-size:11px">${ic('tagI', 13)} Etiket</button>
        </div>
        <div class="ncanvas" id="ncv" style="min-height:${Screens.note.canvasH(n)}px"><div class="blocks">${blocks}</div>
        <button data-a="tapEnd" style="height:120px;width:100%;background:none;border:none" aria-label="Sona yaz"></button>
        ${(n.items || []).map(it => Screens.note.itemHtml(it)).join('')}</div>
        ${(n.items || []).length ? '<small class="mu2" style="text-align:center;font-size:11px">Basılı tut: taşı · Dokun: boyut, döndür, kaldır · İki kez dokun: yazı ekle</small>' : ''}
      </div>
      <div class="edbar">
        <button data-a="addB" data-t="text">${ic('text', 20)}Metin</button><button data-a="addB" data-t="h">${ic('head', 20)}Başlık</button>
        <button data-a="addB" data-t="check">${ic('list', 20)}Liste</button><button data-a="addPhoto">${ic('image', 20)}Fotoğraf</button>
        <button data-a="addSticker">${ic('stickerI', 20)}Sticker</button><button data-a="cover">${ic('palette', 20)}Kapak</button>
      </div></div>`;
  },
  mount(el, p) {
    App.growAll(el);
    const n = Screens.note.get(p); if (!n) return;
    el.querySelectorAll('[data-in="bIn"]').forEach(ta => {
      ta.addEventListener('focus', () => { Screens.note.focusI = +ta.dataset.i; });
      ta.addEventListener('keydown', e => {
        const i = +ta.dataset.i, b = n.blocks[i];
        if (e.key === 'Enter' && b.t === 'check') {
          e.preventDefault();
          if (!ta.value.trim()) { b.t = 'text'; Screens.note.redraw(i); return; }
          n.blocks.splice(i + 1, 0, { t: 'check', v: '', done: false }); Screens.note.redraw(i + 1);
        } else if (e.key === 'Enter' && b.t === 'h') {
          e.preventDefault(); n.blocks.splice(i + 1, 0, { t: 'text', v: '' }); Screens.note.redraw(i + 1);
        } else if (e.key === 'Backspace' && !ta.value && n.blocks.length > 1 && ta.selectionStart === 0) {
          e.preventDefault(); n.blocks.splice(i, 1); Screens.note.redraw(Math.max(0, i - 1), true);
        }
      });
    });
    Screens.note.bindCanvas(el, n);
    if (p.fresh) { delete p.fresh; setTimeout(() => { const t = el.querySelector('#nTitle'); if (t) t.focus(); }, 250); }
  },
  leave(p) { Screens.note.sel = null; const n = Screens.note.get(p); if (n) S.pruneNote(n); S.touch(); },
  migrate(n) {
    if (!n.items) n.items = [];
    if (!(n.blocks || []).some(b => b.t === 'photo' || b.t === 'sticker')) return;
    let y = 60;
    n.blocks = n.blocks.filter(b => {
      if (b.t !== 'photo' && b.t !== 'sticker') return true;
      n.items.push(Object.assign({ fid: 'f' + U.id(), x: n.items.length % 2 ? 0.5 : 0.06, y, w: b.t === 'photo' ? 0.42 : 0.26, r: (n.items.length % 3) * 3 - 3 }, b));
      y += 70; return false;
    });
    if (!n.blocks.length) n.blocks.push({ t: 'text', v: '' });
    n.updated = Date.now(); S.touch({ quiet: true });
  },
  itemH(it) {
    const W = Math.min(window.innerWidth, 600) - 28;
    let ratio = 1;
    if (it.t === 'photo') { const m = S.db.photos[it.id]; if (m && m.w) ratio = m.h / m.w; }
    else if (it.s && /viewBox="0 0 (\d+) (\d+)"/.test(STICKERS[it.s] || '')) { const m = STICKERS[it.s].match(/viewBox="0 0 (\d+) (\d+)"/); ratio = +m[2] / +m[1]; }
    return it.w * W * ratio + 10;
  },
  canvasH(n) { return Math.max(0, ...(n.items || []).map(it => it.y + Screens.note.itemH(it) + 20)); },
  itemHtml(it) {
    const inner = (it.t === 'photo' ? `<img src="${S.photoUrl(it.id)}" alt="">` : stickerHtml(it)) + (it.caption ? `<div class="cap">${U.esc(it.caption)}</div>` : '');
    return `<div class="fl ${it.t} ${Screens.note.sel === it.fid ? 'sel' : ''}" data-fid="${it.fid}" style="left:${(it.x * 100).toFixed(2)}%;top:${Math.round(it.y)}px;width:${(it.w * 100).toFixed(2)}%;transform:rotate(${it.r || 0}deg)">${inner}<button class="fx" data-a="flDel" data-fid="${it.fid}" aria-label="Kaldır">${ic('x', 15, 2.4)}</button><span class="fh" aria-hidden="true"></span><span class="fr" aria-hidden="true">${ic('repeat', 14, 2.2)}</span></div>`;
  },
  setSel(fid) {
    Screens.note.sel = fid;
    document.querySelectorAll('#ncv .fl').forEach(e => e.classList.toggle('sel', e.dataset.fid === fid));
  },
  addItem(it) {
    const n = Screens.note.get(App.cur.params);
    const cv = document.getElementById('ncv');
    const top = cv ? cv.getBoundingClientRect().top : 0;
    it.fid = 'f' + U.id(); it.y = Math.max(10, Math.round(window.innerHeight * 0.32 - top)); it.x = it.x != null ? it.x : 0.3; it.r = 0;
    n.items = n.items || []; n.items.push(it);
    Screens.note.sel = it.fid;
    Screens.note.redraw();
  },
  bindCanvas(el, n) {
    const cv = el.querySelector('#ncv'); if (!cv) return;
    const scr = document.getElementById('screen');
    cv.addEventListener('pointerdown', e => {
      const fl = e.target.closest('.fl');
      if (!fl) { if (Screens.note.sel) Screens.note.setSel(null); return; }
      if (e.target.closest('.fx')) return;
      const it = n.items.find(x => x.fid === fl.dataset.fid); if (!it) return;
      e.preventDefault();
      try { fl.setPointerCapture(e.pointerId); } catch (er) { }
      const W = cv.clientWidth;
      const st = { x0: e.clientX, y0: e.clientY, ix: it.x, iy: it.y, iw: it.w, ir: it.r || 0, scr: scr.scrollTop, mode: e.target.closest('.fh') ? 'resize' : e.target.closest('.fr') ? 'rotate' : 'wait' };
      if (st.mode === 'rotate') { const r0 = fl.getBoundingClientRect(); st.cx = r0.left + r0.width / 2; st.cy = r0.top + r0.height / 2; st.a0 = Math.atan2(e.clientY - st.cy, e.clientX - st.cx); }
      const timer = st.mode === 'wait' ? setTimeout(() => { st.mode = 'drag'; fl.classList.add('drag'); Screens.note.setSel(it.fid); U.vibrate(25); }, 330) : null;
      const move = ev => {
        const dx = ev.clientX - st.x0, dy = ev.clientY - st.y0;
        if (st.mode === 'wait' && Math.abs(dx) + Math.abs(dy) > 10) { clearTimeout(timer); st.mode = 'scroll'; }
        if (st.mode === 'scroll') { scr.scrollTop = st.scr - dy; return; }
        if (st.mode === 'drag') {
          it.x = Math.max(-0.15, Math.min(1 - it.w * 0.4, st.ix + dx / W)); it.y = Math.max(0, st.iy + dy);
          fl.style.left = (it.x * 100) + '%'; fl.style.top = it.y + 'px';
          const r = fl.getBoundingClientRect();
          if (r.bottom > window.innerHeight - 70) scr.scrollTop += 6; else if (r.top < 60) scr.scrollTop -= 6;
        } else if (st.mode === 'rotate') {
          let r = st.ir + (Math.atan2(ev.clientY - st.cy, ev.clientX - st.cx) - st.a0) * 180 / Math.PI;
          r = ((r + 540) % 360) - 180;
          if (Math.abs(r) < 4) r = 0;
          it.r = Math.round(r); fl.style.transform = `rotate(${it.r}deg)`;
        } else if (st.mode === 'resize') {
          it.w = Math.max(0.12, Math.min(1, st.iw + dx / W)); fl.style.width = (it.w * 100) + '%';
        }
      };
      const up = () => {
        clearTimeout(timer);
        fl.removeEventListener('pointermove', move); fl.removeEventListener('pointerup', up); fl.removeEventListener('pointercancel', up);
        fl.classList.remove('drag');
        if (st.mode === 'wait') {
          const now = Date.now();
          if (Screens.note._lastTap && Screens.note._lastTap.fid === it.fid && now - Screens.note._lastTap.t < 350) {
            Screens.note._lastTap = null; Screens.note.setSel(it.fid); setTimeout(() => CaptionBox.open(n, it), 80);
          } else { Screens.note._lastTap = { fid: it.fid, t: now }; Screens.note.setSel(Screens.note.sel === it.fid ? null : it.fid); }
        }
        else if (st.mode === 'drag' || st.mode === 'resize' || st.mode === 'rotate') {
          n.updated = Date.now(); S.touch({ quiet: true });
          cv.style.minHeight = Screens.note.canvasH(n) + 'px';
        }
      };
      fl.addEventListener('pointermove', move); fl.addEventListener('pointerup', up); fl.addEventListener('pointercancel', up);
    });
  },
  redraw(focusI, atEnd) {
    const n = Screens.note.get(App.cur.params); n.updated = Date.now(); S.touch({ quiet: true });
    const el = document.getElementById('screen'), st = el.scrollTop;
    App.forceRefresh(); el.scrollTop = st;
    if (focusI != null) {
      const ta = el.querySelector(`[data-in="bIn"][data-i="${focusI}"]`);
      if (ta) { ta.focus(); if (atEnd) { const l = ta.value.length; ta.setSelectionRange(l, l); } }
    }
  },
  insertAt() { const n = Screens.note.get(App.cur.params); const i = Screens.note.focusI; return (i != null && i < n.blocks.length) ? i + 1 : n.blocks.length; },
  acts: {
    nTitle(t) { const n = Screens.note.get(App.cur.params); n.title = t.value; n.updated = Date.now(); S.touch({ quiet: true }); },
    bIn(t) { const n = Screens.note.get(App.cur.params); const b = n.blocks[+t.dataset.i]; if (b) { b.v = t.value; n.updated = Date.now(); S.touch({ quiet: true }); } },
    bChk(t) { const n = Screens.note.get(App.cur.params); const b = n.blocks[+t.dataset.i]; b.done = !b.done; U.vibrate(8); Screens.note.redraw(); },
    bDel(t) { const n = Screens.note.get(App.cur.params); n.blocks.splice(+t.dataset.i, 1); if (!n.blocks.length) n.blocks.push({ t: 'text', v: '' }); Screens.note.redraw(); },
    addB(t) { const n = Screens.note.get(App.cur.params); const i = Screens.note.insertAt(); n.blocks.splice(i, 0, { t: t.dataset.t, v: '', done: false }); Screens.note.redraw(i); },
    tapEnd() {
      const n = Screens.note.get(App.cur.params); const last = n.blocks[n.blocks.length - 1];
      if (last && (last.t === 'text') && !last.v) { Screens.note.redraw(n.blocks.length - 1); return; }
      n.blocks.push({ t: 'text', v: '' }); Screens.note.redraw(n.blocks.length - 1);
    },
    async addPhoto() {
      const ids = await S.addPhotos(true);
      ids.forEach((id, k) => Screens.note.addItem({ t: 'photo', id, w: 0.42, x: 0.08 + (k % 2) * 0.44 }));
    },
    addSticker() { StickerSheet.open(b => Screens.note.addItem(Object.assign(b, { w: b.p ? 0.3 : 0.26 }))); },
    flDel(t) { const n = Screens.note.get(App.cur.params); n.items = (n.items || []).filter(x => x.fid !== t.dataset.fid); Screens.note.sel = null; Screens.note.redraw(); },
    cover() { CoverSheet.open(Screens.note.get(App.cur.params)); },
    nPin() { const n = Screens.note.get(App.cur.params); n.pinned = !n.pinned; n.updated = Date.now(); S.touch({ quiet: true }); App.forceRefresh(); U.toast(n.pinned ? 'Sabitlendi' : 'Sabitleme kaldırıldı'); },
    nFav() { const n = Screens.note.get(App.cur.params); n.fav = !n.fav; n.updated = Date.now(); S.touch({ quiet: true }); App.forceRefresh(); },
    nFolder() {
      const n = Screens.note.get(App.cur.params);
      const rec = App.sheet(`<h3>Klasör seç</h3><div class="menu"><button data-a="fSel" data-v="">${ic('note', 20)} Klasörsüz</button>${S.db.folders.map(f => `<button data-a="fSel" data-v="${f.id}"><span class="cdot" style="background:${f.color};width:12px;height:12px"></span>${U.esc(f.name)}</button>`).join('')}<button data-a="fNew">${ic('plus', 20)} Yeni klasör</button></div>`, {
        acts: {
          fSel: b => { n.folder = b.dataset.v || null; n.updated = Date.now(); S.touch({ quiet: true }); App.closeSheet(rec); App.forceRefresh(); },
          fNew: async () => { App.closeSheet(rec); const name = await App.prompt('Yeni klasör', '', 'Klasör adı'); if (name) { const fd = { id: 'f' + U.id(), name, color: CAT_COLORS[S.db.folders.length % CAT_COLORS.length], updated: Date.now() }; S.db.folders.push(fd); n.folder = fd.id; n.updated = Date.now(); S.touch({ quiet: true }); App.forceRefresh(); } }
        }
      });
    },
    async tagAdd() {
      const n = Screens.note.get(App.cur.params);
      const v = await App.prompt('Etiket ekle', '', 'ör. okul, fikir, tatil');
      if (v) { const tags = v.split(/[,#]/).map(x => x.trim().toLocaleLowerCase('tr-TR')).filter(Boolean); n.tags = [...new Set((n.tags || []).concat(tags))]; n.updated = Date.now(); S.touch({ quiet: true }); App.forceRefresh(); }
    },
    tagDel(t) { const n = Screens.note.get(App.cur.params); n.tags = (n.tags || []).filter(x => x !== t.dataset.t); n.updated = Date.now(); S.touch({ quiet: true }); App.forceRefresh(); },
    nMenu() {
      const n = Screens.note.get(App.cur.params);
      const rec = App.sheet(`<h3>Not</h3><div class="menu">
        <button data-a="mArch">${ic('archive', 20)} ${n.archived ? 'Arşivden çıkar' : 'Arşivle'}</button>
        <button data-a="mDup">${ic('note', 20)} Kopyasını oluştur</button>
        <button data-a="mDel" style="color:#F19AA2">${ic('trash', 20)} Sil</button></div>`, {
        acts: {
          mArch: () => { n.archived = !n.archived; n.updated = Date.now(); S.touch(); App.closeSheet(rec); U.toast(n.archived ? 'Arşivlendi' : 'Arşivden çıkarıldı'); if (n.archived) App.back(); else App.forceRefresh(); },
          mDup: () => { const c = JSON.parse(JSON.stringify(n)); c.id = 'n' + U.id(); c.title = (c.title || 'Not') + ' (kopya)'; c.created = c.updated = Date.now(); S.db.notes.unshift(c); S.touch(); App.closeSheet(rec); App.go('note', { id: c.id }, { replace: true }); },
          mDel: async () => { App.closeSheet(rec); if (await App.confirm('Not silinsin mi?', 'Sil', true)) { S.remove('notes', n.id); App.back(); } }
        }
      });
    }
  }
};

/* ---------- sticker seçici ---------- */
const StickerSheet = {
  open(cb) {
    const rec = App.sheet(`<h3>Sticker</h3><div class="stickers">${Object.keys(STICKERS).map(k => `<button data-a="stPick" data-k="${k}">${STICKERS[k]}</button>`).join('')}</div>
      <button class="btn soft wide" data-a="stPhoto">${ic('image', 18)} Kendi fotoğrafından sticker yap</button>`, {
      acts: {
        stPick: b => { App.closeSheet(rec); cb({ t: 'sticker', s: b.dataset.k }); },
        stPhoto: async () => {
          const files = await U.pickImages(false); if (!files.length) return;
          const r = await U.compress(files[0], 500, 0.85); const id = S.savePhoto(r.b64, r.w, r.h);
          App.closeSheet(rec); cb({ t: 'sticker', p: id });
        }
      }
    });
  }
};

/* ---------- kapak seçici ---------- */
const CoverSheet = {
  open(n) {
    const rec = App.sheet(`<h3>Kapak</h3><div class="swatches">${COVER_COLORS.map(c => `<button data-a="cvCol" data-v="${c}" class="${n.cover && n.cover.v === c ? 'on' : ''}" style="background:linear-gradient(150deg,${c},color-mix(in srgb,${c} 55%,#000))"></button>`).join('')}</div>
      <button class="btn soft wide" data-a="cvPhoto">${ic('image', 18)} Fotoğraf seç</button>${n.cover ? `<button class="btn ghost wide" data-a="cvNone">Kapağı kaldır</button>` : ''}`, {
      acts: {
        cvCol: b => { n.cover = { type: 'color', v: b.dataset.v }; n.updated = Date.now(); S.touch({ quiet: true }); App.closeSheet(rec); App.forceRefresh(); },
        cvPhoto: async () => { const ids = await S.addPhotos(false); if (ids[0]) { n.cover = { type: 'photo', v: ids[0] }; n.updated = Date.now(); S.touch({ quiet: true }); } App.closeSheet(rec); App.forceRefresh(); },
        cvNone: () => { n.cover = null; n.updated = Date.now(); S.touch({ quiet: true }); App.closeSheet(rec); App.forceRefresh(); }
      }
    });
  }
};

/* ---------- fotoğraf / sticker yazısı (çift dokunma) ---------- */
const CaptionBox = {
  open(n, it) {
    const bg = document.createElement('div'); bg.className = 'capbg';
    const box = document.createElement('div'); box.className = 'capbox';
    box.innerHTML = `<div class="in"><b class="serif" style="font-size:20px">${it.t === 'photo' ? 'Fotoğrafa yazı' : 'Sticker\'a yazı'}</b>
      <textarea class="inp" rows="2" maxlength="120" placeholder="Bir isim, tarih ya da küçük bir not…" style="min-height:0;font-family:var(--serif);font-style:italic;font-size:18px">${U.esc(it.caption || '')}</textarea>
      <div class="row">${it.caption ? '<button class="btn ghost sm" data-c="del">Yazıyı sil</button>' : ''}<span class="sp"></span><button class="btn ghost sm" data-c="no">Vazgeç</button><button class="btn sm" data-c="ok">Kaydet</button></div></div>`;
    document.body.appendChild(bg); document.body.appendChild(box);
    const ta = box.querySelector('textarea');
    requestAnimationFrame(() => { bg.classList.add('on'); box.classList.add('on'); setTimeout(() => ta.focus(), 260); });
    const close = save => {
      if (save != null) { it.caption = save; n.updated = Date.now(); S.touch({ quiet: true }); }
      bg.classList.remove('on'); box.classList.remove('on');
      setTimeout(() => { bg.remove(); box.remove(); if (save != null) Screens.note.redraw(); }, 250);
      CaptionBox.cur = null;
    };
    CaptionBox.cur = () => close(null);
    const opened = Date.now();
    bg.onclick = () => { if (Date.now() - opened > 450) close(null); };
    box.querySelectorAll('[data-c]').forEach(b => b.onclick = () => close(b.dataset.c === 'ok' ? ta.value.trim() : b.dataset.c === 'del' ? '' : null));
  }
};
