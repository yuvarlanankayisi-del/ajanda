/* Kitaplar (Kitap · Dizi · Film bölümünün ilk parçası) */
'use strict';

const BOOK_ST = [
  { v: 'reading', l: 'Okuyorum' }, { v: 'want', l: 'Okunacak' }, { v: 'done', l: 'Okudum' }, { v: 'paused', l: 'Yarım kaldı' }
];

const SHOW_ST = [
  { v: 'watching', l: 'İzliyorum' }, { v: 'want', l: 'İzlenecek' }, { v: 'done', l: 'İzledim' }, { v: 'paused', l: 'Yarım kaldı' }
];

Screens.books = {
  nav: 'sections',
  render(p) {
    const kind = p.kind || 'book';
    const seg = `<div class="seg" style="align-self:center"><button class="${kind === 'book' ? 'on' : ''}" data-a="bKind" data-v="book">Kitap</button><button class="${kind === 'series' ? 'on' : ''}" data-a="bKind" data-v="series">Dizi</button><button class="${kind === 'movie' ? 'on' : ''}" data-a="bKind" data-v="movie">Film</button></div>`;
    if (kind !== 'book') return Screens.books.shows(p, kind, seg);
    const tab = p.tab || 'reading';
    const list = S.db.books.filter(b => b.status === tab).sort((a, b) => b.updated - a.updated);
    const yr = new Date().getFullYear();
    const readThisYear = S.db.books.filter(b => b.status === 'done' && b.finished && new Date(b.finished).getFullYear() === yr).length;
    return `<div class="topbar" style="padding-top:18px">${App.stack.length > 1 ? `<button class="icbtn box" data-a="back">${ic('back', 20, 1.8)}</button>` : ''}<h1>Kitap · Dizi · Film</h1>
      <button class="icbtn box" data-a="bNew" aria-label="Kitap ekle">${ic('plus', 20, 2)}</button></div>
    <div class="wrap pad">${seg}
      <div class="card row" style="gap:14px"><span style="color:var(--gold)">${ic('book', 26, 1.5)}</span><span class="sp"><b class="serif" style="font-size:22px">${readThisYear}</b> <span class="mu" style="font-size:12.5px">kitap bitirdin (${yr})</span></span></div>
      <div class="chips">${BOOK_ST.map(s => `<button class="chip ${tab === s.v ? 'on' : ''}" data-a="bTab" data-v="${s.v}">${s.l} <span style="opacity:.7">${S.db.books.filter(b => b.status === s.v).length}</span></button>`).join('')}</div>
      ${list.length ? list.map(b => `<button class="book" data-a="bOpen" data-id="${b.id}">
        <div class="bcover" style="${b.cover ? `background-image:url('${S.photoUrl(b.cover)}')` : ''}">${b.cover ? '' : U.esc(b.title.slice(0, 30))}</div>
        <div class="col sp" style="gap:5px;min-width:0"><b class="serif" style="font-size:18px;line-height:1.15">${U.esc(b.title)}</b><span class="mu" style="font-size:12.5px">${U.esc(b.author || '')}</span>
          ${b.pages ? `<div class="bar"><i style="width:${Math.round(100 * (b.page || 0) / b.pages)}%"></i></div><small class="mu" style="font-size:11px">${b.page || 0} / ${b.pages} sayfa · %${Math.round(100 * (b.page || 0) / b.pages)}</small>` : ''}
          ${b.rating ? `<span style="color:var(--gold);display:flex;gap:2px">${Array.from({ length: b.rating }, () => icf('star', 13)).join('')}</span>` : ''}
          ${b.status === 'reading' ? `<span class="btn soft sm" data-a="bPage" data-id="${b.id}" style="align-self:flex-start;margin-top:2px">Sayfayı güncelle</span>` : ''}</div></button>`).join('')
        : `<div class="col" style="align-items:center;padding:40px 20px;gap:12px;text-align:center"><span class="mu">Bu listede kitap yok.</span><button class="btn soft" data-a="bNew">Kitap ekle</button></div>`}
    </div>`;
  },
  shows(p, kind, seg) {
    const isS = kind === 'series';
    const sts = isS ? SHOW_ST : [{ v: 'want', l: 'İzlenecek' }, { v: 'done', l: 'İzledim' }];
    const tab = sts.some(x => x.v === p.stab) ? p.stab : sts[0].v;
    const all = (S.db.shows || []).filter(x => x.type === kind);
    const list = all.filter(x => x.status === tab).sort((a, b) => (b.fav - a.fav) || (b.updated - a.updated));
    const yr = new Date().getFullYear();
    const yCount = all.filter(x => x.status === 'done' && x.finished && new Date(x.finished).getFullYear() === yr).length;
    const eps = isS ? all.reduce((a, x) => a + Object.entries(x.log || {}).filter(([k]) => k.startsWith(String(yr))).reduce((c, [, v]) => c + v, 0), 0) : 0;
    return `<div class="topbar" style="padding-top:18px">${App.stack.length > 1 ? `<button class="icbtn box" data-a="back">${ic('back', 20, 1.8)}</button>` : ''}<h1>Kitap · Dizi · Film</h1>
      <button class="icbtn box" data-a="shNew" aria-label="Ekle">${ic('plus', 20, 2)}</button></div>
    <div class="wrap pad">${seg}
      <div class="card row" style="gap:14px"><span style="color:var(--gold)">${ic('film', 26, 1.5)}</span><span class="sp"><b class="serif" style="font-size:22px">${yCount}</b> <span class="mu" style="font-size:12.5px">${isS ? 'dizi bitirdin' : 'film izledin'} (${yr})${isS ? ' · ' + eps + ' bölüm' : ''}</span></span></div>
      <div class="chips">${sts.map(x => `<button class="chip ${tab === x.v ? 'on' : ''}" data-a="shTab" data-v="${x.v}">${x.l} <span style="opacity:.7">${all.filter(y => y.status === x.v).length}</span></button>`).join('')}</div>
      ${list.length ? list.map(x => `<button class="book" data-a="shOpen" data-id="${x.id}">
        <div class="bcover" style="${x.cover ? `background-image:url('${S.photoUrl(x.cover)}')` : ''}">${x.cover ? '' : U.esc(x.title.slice(0, 30))}</div>
        <div class="col sp" style="gap:5px;min-width:0"><b class="serif" style="font-size:18px;line-height:1.15">${U.esc(x.title)}</b>
          <span class="mu" style="font-size:12.5px">${[x.platform, x.year].filter(Boolean).map(U.esc).join(' · ')}</span>
          ${isS ? `<span style="font-size:13px"><b>${x.season || 1}. sezon · ${x.episode || 0}. bölüm</b>${x.seasons ? ` <span class="mu">/ ${x.seasons} sezon</span>` : ''}</span>` : ''}
          ${x.rating ? `<span style="color:var(--gold);display:flex;gap:2px">${Array.from({ length: x.rating }, () => icf('star', 13)).join('')}</span>` : ''}
          ${isS && x.status === 'watching' ? `<span class="row" style="gap:6px;margin-top:2px"><span class="btn soft sm" data-a="shEp" data-id="${x.id}">+1 bölüm</span><span class="btn ghost sm" data-a="shSeason" data-id="${x.id}">Sezon bitti</span></span>` : ''}
        </div></button>`).join('')
        : `<div class="col" style="align-items:center;padding:40px 20px;gap:12px;text-align:center"><span class="mu">Bu listede ${isS ? 'dizi' : 'film'} yok.</span><button class="btn soft" data-a="shNew">${isS ? 'Dizi' : 'Film'} ekle</button></div>`}
    </div>`;
  },
  acts: {
    bKind(t) { App.cur.entry.params.kind = t.dataset.v; App.forceRefresh(); },
    shTab(t) { App.cur.entry.params.stab = t.dataset.v; App.forceRefresh(); },
    shNew() { const k = App.cur.params.kind; ShowSheet.open(null, { type: k, status: App.cur.params.stab || (k === 'series' ? 'watching' : 'want') }); },
    shOpen(t) { ShowSheet.open((S.db.shows || []).find(x => x.id === t.dataset.id)); },
    shEp(t) { const x = S.db.shows.find(y => y.id === t.dataset.id); x.episode = (x.episode || 0) + 1; x.log = x.log || {}; const k = U.today(); x.log[k] = (x.log[k] || 0) + 1; x.updated = Date.now(); U.vibrate(10); S.touch(); U.toast(`${x.season || 1}. sezon ${x.episode}. bölüm`); },
    async shSeason(t) {
      const x = S.db.shows.find(y => y.id === t.dataset.id);
      if (x.seasons && (x.season || 1) >= x.seasons) { if (await App.confirm('Son sezondu. Diziyi bitirdin mi?', 'Bitirdim')) { x.status = 'done'; x.finished = Date.now(); x.updated = Date.now(); S.touch(); } return; }
      x.season = (x.season || 1) + 1; x.episode = 0; x.updated = Date.now(); S.touch(); U.toast(x.season + '. sezona geçtin');
    },
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

const ShowSheet = {
  open(x, defaults) {
    const isNew = !x;
    const f = Object.assign({ type: 'series', title: '', status: 'watching', platform: '', year: '', season: 1, episode: 0, seasons: '', cover: null, rating: 0, comment: '', fav: false }, defaults || {}, x || {});
    const isS = f.type === 'series';
    const sts = isS ? SHOW_ST : [{ v: 'want', l: 'İzlenecek' }, { v: 'done', l: 'İzledim' }];
    const draw = () => `<div class="row"><h3 class="sp">${isNew ? (isS ? 'Dizi ekle' : 'Film ekle') : (isS ? 'Dizi' : 'Film')}</h3>${!isNew ? `<button class="icbtn" data-a="sxFav" style="color:${f.fav ? 'var(--ac)' : 'var(--mu)'}">${f.fav ? icf('heart', 20) : ic('heart', 20)}</button><button class="icbtn" data-a="sxDel" style="color:#F19AA2">${ic('trash', 20)}</button>` : ''}</div>
      <div class="row" style="align-items:flex-start;gap:14px">
        <button class="bcover" data-a="sxCover" style="width:84px;height:122px;border:1px dashed var(--line);${f.cover ? `background-image:url('${S.photoUrl(f.cover)}')` : ''}">${f.cover ? '' : ic('image', 22, 1.4) + '<br>Afiş'}</button>
        <div class="col sp" style="gap:8px"><input class="inp" id="sxT" value="${U.esc(f.title)}" placeholder="${isS ? 'Dizi adı' : 'Film adı'}"><div class="g2" style="gap:8px"><input class="inp" id="sxP" value="${U.esc(f.platform || '')}" placeholder="Platform"><input class="inp" id="sxY" value="${U.esc(f.year || '')}" placeholder="Yıl" inputmode="numeric"></div></div></div>
      <div class="opts">${sts.map(s => `<button class="${f.status === s.v ? 'on' : ''}" data-a="sxSt" data-v="${s.v}">${s.l}</button>`).join('')}</div>
      ${isS ? `<div class="g3" style="gap:8px"><div class="field"><label>Sezon</label><input class="inp" type="number" id="sxS" min="1" value="${f.season || 1}"></div><div class="field"><label>Bölüm</label><input class="inp" type="number" id="sxE" min="0" value="${f.episode || 0}"></div><div class="field"><label>Toplam sezon</label><input class="inp" type="number" id="sxSS" min="0" value="${f.seasons || ''}"></div></div>` : ''}
      <div class="field"><label>Puanım</label><div class="stars">${[1, 2, 3, 4, 5].map(n => `<button class="${n <= f.rating ? 'on' : ''}" data-a="sxR" data-v="${n}">${icf('star', 26)}</button>`).join('')}</div></div>
      <div class="field"><label>Yorumum</label><textarea class="inp grow" id="sxC" rows="2" placeholder="Düşüncelerin" style="min-height:0">${U.esc(f.comment || '')}</textarea></div>
      <button class="btn wide" data-a="sxSave">${isNew ? 'Ekle' : 'Kaydet'}</button>`;
    const grab = () => {
      const s = rec.sh; f.title = s.querySelector('#sxT').value; f.platform = s.querySelector('#sxP').value; f.year = s.querySelector('#sxY').value; f.comment = s.querySelector('#sxC').value;
      if (isS) { f.season = Math.max(1, +s.querySelector('#sxS').value || 1); f.episode = Math.max(0, +s.querySelector('#sxE').value || 0); f.seasons = +s.querySelector('#sxSS').value || ''; }
    };
    const rec = App.sheet(draw(), {
      mount: sh => { if (isNew) setTimeout(() => sh.querySelector('#sxT').focus(), 300); },
      acts: {
        sxSt: b => { grab(); f.status = b.dataset.v; App.setSheet(rec, draw()); },
        sxR: b => { grab(); f.rating = f.rating === +b.dataset.v ? 0 : +b.dataset.v; App.setSheet(rec, draw()); },
        sxFav: () => { grab(); f.fav = !f.fav; App.setSheet(rec, draw()); },
        sxCover: async () => { grab(); const ids = await S.addPhotos(false); if (ids[0]) f.cover = ids[0]; App.setSheet(rec, draw()); },
        sxDel: async () => { App.closeSheet(rec); if (await App.confirm('Silinsin mi?', 'Sil', true)) S.remove('shows', x.id); },
        sxSave: () => {
          grab(); if (!f.title.trim()) return U.toast('Adını yaz');
          const data = { type: f.type, title: f.title.trim(), platform: f.platform.trim(), year: f.year.trim(), status: f.status, cover: f.cover, rating: f.rating, comment: f.comment, fav: f.fav, updated: Date.now() };
          if (isS) Object.assign(data, { season: f.season, episode: f.episode, seasons: f.seasons });
          if (f.status === 'done' && !(x && x.finished)) data.finished = Date.now();
          if (isNew) { S.db.shows = S.db.shows || []; S.db.shows.unshift(Object.assign({ id: 'm' + U.id(), log: {}, created: Date.now() }, data)); }
          else Object.assign(x, data);
          S.touch(); App.closeSheet(rec);
        }
      }
    });
  }
};
