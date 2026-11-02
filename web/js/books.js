/* Kitaplar (Kitap · Dizi · Film bölümünün ilk parçası) */
'use strict';

const BOOK_ST = [
  { v: 'reading', l: 'Okuyorum' }, { v: 'want', l: 'Okunacak' }, { v: 'done', l: 'Okudum' }, { v: 'paused', l: 'Yarım kaldı' }
];

Screens.books = {
  nav: 'sections',
  render(p) {
    const tab = p.tab || 'reading';
    const list = S.db.books.filter(b => b.status === tab).sort((a, b) => b.updated - a.updated);
    const yr = new Date().getFullYear();
    const readThisYear = S.db.books.filter(b => b.status === 'done' && b.finished && new Date(b.finished).getFullYear() === yr).length;
    return `<div class="topbar" style="padding-top:18px">${App.stack.length > 1 ? `<button class="icbtn box" data-a="back">${ic('back', 20, 1.8)}</button>` : ''}<h1>Kitaplarım</h1>
      <button class="icbtn box" data-a="bNew" aria-label="Kitap ekle">${ic('plus', 20, 2)}</button></div>
    <div class="wrap pad">
      <div class="card row" style="gap:14px"><span style="color:var(--gold)">${ic('book', 26, 1.5)}</span><span class="sp"><b class="serif" style="font-size:22px">${readThisYear}</b> <span class="mu" style="font-size:12.5px">kitap bitirdin (${yr})</span></span></div>
      <div class="chips">${BOOK_ST.map(s => `<button class="chip ${tab === s.v ? 'on' : ''}" data-a="bTab" data-v="${s.v}">${s.l} <span style="opacity:.7">${S.db.books.filter(b => b.status === s.v).length}</span></button>`).join('')}</div>
      ${list.length ? list.map(b => `<button class="book" data-a="bOpen" data-id="${b.id}">
        <div class="bcover" style="${b.cover ? `background-image:url('${S.photoUrl(b.cover)}')` : ''}">${b.cover ? '' : U.esc(b.title.slice(0, 30))}</div>
        <div class="col sp" style="gap:5px;min-width:0"><b class="serif" style="font-size:18px;line-height:1.15">${U.esc(b.title)}</b><span class="mu" style="font-size:12.5px">${U.esc(b.author || '')}</span>
          ${b.pages ? `<div class="bar"><i style="width:${Math.round(100 * (b.page || 0) / b.pages)}%"></i></div><small class="mu" style="font-size:11px">${b.page || 0} / ${b.pages} sayfa · %${Math.round(100 * (b.page || 0) / b.pages)}</small>` : ''}
          ${b.rating ? `<span style="color:var(--gold);display:flex;gap:2px">${Array.from({ length: b.rating }, () => icf('star', 13)).join('')}</span>` : ''}
          ${b.status === 'reading' ? `<span class="btn soft sm" data-a="bPage" data-id="${b.id}" style="align-self:flex-start;margin-top:2px">Sayfayı güncelle</span>` : ''}</div></button>`).join('')
        : `<div class="col" style="align-items:center;padding:40px 20px;gap:12px;text-align:center"><span class="mu">Bu listede kitap yok.</span><button class="btn soft" data-a="bNew">Kitap ekle</button></div>`}
      <div class="card row dim" style="gap:12px">${ic('film', 22)}<span class="sp" style="font-size:12.5px">Dizi ve film takibi yakında bu bölüme eklenecek.</span></div>
    </div>`;
  },
  acts: {
    bTab(t) { App.cur.entry.params.tab = t.dataset.v; App.forceRefresh(); },
    bNew() { BookSheet.open(null, { status: App.cur.params.tab || 'reading' }); },
    bOpen(t) { BookSheet.open(S.db.books.find(b => b.id === t.dataset.id)); },
    async bPage(t) {
      const b = S.db.books.find(x => x.id === t.dataset.id); if (!b) return;
      const v = await App.prompt('Kaçıncı sayfadasın?', String(b.page || 0)); if (v == null || v === '') return;
      const n = Math.max(0, parseInt(v, 10) || 0);
      if (n > (b.page || 0)) { b.log = b.log || {}; const k = U.today(); b.log[k] = (b.log[k] || 0) + (n - (b.page || 0)); }
      b.page = b.pages ? Math.min(n, b.pages) : n; b.updated = Date.now();
      if (b.pages && b.page >= b.pages && b.status !== 'done') { b.status = 'done'; b.finished = Date.now(); U.toast('Tebrikler, kitabı bitirdin!'); }
      S.touch();
    }
  }
};

const BookSheet = {
  open(b, defaults) {
    const isNew = !b;
    const f = Object.assign({ title: '', author: '', status: 'reading', pages: '', page: '', cover: null, rating: 0, comment: '' }, defaults || {}, b || {});
    const draw = () => `<div class="row"><h3 class="sp">${isNew ? 'Kitap ekle' : 'Kitap'}</h3>${!isNew ? `<button class="icbtn" data-a="bkDel" style="color:#F19AA2">${ic('trash', 20)}</button>` : ''}</div>
      <div class="row" style="align-items:flex-start;gap:14px">
        <button class="bcover" data-a="bkCover" style="width:84px;height:122px;border:1px dashed var(--line);${f.cover ? `background-image:url('${S.photoUrl(f.cover)}')` : ''}">${f.cover ? '' : ic('image', 22, 1.4) + '<br>Kapak'}</button>
        <div class="col sp" style="gap:8px"><input class="inp" id="bkT" value="${U.esc(f.title)}" placeholder="Kitap adı"><input class="inp" id="bkA" value="${U.esc(f.author)}" placeholder="Yazar"></div></div>
      <div class="opts">${BOOK_ST.map(s => `<button class="${f.status === s.v ? 'on' : ''}" data-a="bkSt" data-v="${s.v}">${s.l}</button>`).join('')}</div>
      <div class="g2" style="gap:10px"><div class="field"><label>Okunan sayfa</label><input class="inp" type="number" id="bkP" value="${f.page || ''}" min="0"></div>
        <div class="field"><label>Toplam sayfa</label><input class="inp" type="number" id="bkN" value="${f.pages || ''}" min="0"></div></div>
      <div class="field"><label>Puanım</label><div class="stars">${[1, 2, 3, 4, 5].map(n => `<button class="${n <= f.rating ? 'on' : ''}" data-a="bkR" data-v="${n}">${icf('star', 26)}</button>`).join('')}</div></div>
      <div class="field"><label>Yorumum</label><textarea class="inp grow" id="bkC" rows="2" placeholder="Kitap hakkında düşüncelerin" style="min-height:0">${U.esc(f.comment || '')}</textarea></div>
      <button class="btn wide" data-a="bkSave">${isNew ? 'Ekle' : 'Kaydet'}</button>`;
    const grab = () => { const s = rec.sh; f.title = s.querySelector('#bkT').value; f.author = s.querySelector('#bkA').value; f.page = +s.querySelector('#bkP').value || 0; f.pages = +s.querySelector('#bkN').value || 0; f.comment = s.querySelector('#bkC').value; };
    const rec = App.sheet(draw(), {
      acts: {
        bkSt: x => { grab(); f.status = x.dataset.v; if (f.status === 'done' && f.pages) f.page = f.pages; App.setSheet(rec, draw()); },
        bkR: x => { grab(); f.rating = f.rating === +x.dataset.v ? 0 : +x.dataset.v; App.setSheet(rec, draw()); },
        bkCover: async () => { grab(); const ids = await S.addPhotos(false); if (ids[0]) f.cover = ids[0]; App.setSheet(rec, draw()); },
        bkDel: async () => { App.closeSheet(rec); if (await App.confirm('Kitap silinsin mi?', 'Sil', true)) S.remove('books', b.id); },
        bkSave: () => {
          grab(); if (!f.title.trim()) return U.toast('Kitap adını yaz');
          const data = { title: f.title.trim(), author: f.author.trim(), status: f.status, page: f.page, pages: f.pages, cover: f.cover, rating: f.rating, comment: f.comment, updated: Date.now() };
          if (f.status === 'done' && !(b && b.finished)) data.finished = Date.now();
          if (b && f.page > (b.page || 0)) { b.log = b.log || {}; const k = U.today(); b.log[k] = (b.log[k] || 0) + (f.page - (b.page || 0)); }
          if (isNew) S.newBook(data); else { Object.assign(b, data); S.touch(); }
          App.closeSheet(rec);
        }
      }
    });
  }
};
