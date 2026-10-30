/* Bölümler, Yakında, Arama, Odak sayacı */
'use strict';

Screens.sections = {
  render() {
    const g = n => SECTIONS.filter(s => s.g === n);
    const card = s => `<button class="sec ${s.to ? '' : 'dim'}" ${secAttrs(s)}>${s.to ? '' : '<span class="soon">YAKINDA</span>'}${ic(s.i, 24, 1.6)}<span class="col" style="gap:2px"><b>${U.esc(s.n)}</b>${s.d ? `<small>${U.esc(s.d)}</small>` : ''}</span></button>`;
    const small = s => `<button class="tile ${s.to ? '' : 'dim'}" ${secAttrs(s)} style="min-height:76px;font-size:11px">${ic(s.i, 20)}${U.esc(s.n)}</button>`;
    return `<div class="topbar" style="padding-top:18px"><h1>Bölümler</h1><button class="icbtn box" data-a="go" data-to="search" aria-label="Ara">${ic('search', 20, 1.8)}</button></div>
    <div class="wrap pad">
      <div class="lbl">Her gün</div><div class="secg">${g(1).map(card).join('')}</div>
      <div class="lbl">Takip ettiklerin</div><div class="secg">${g(2).map(card).join('')}</div>
      <div class="lbl">Defterlerim</div><div class="g2" style="grid-template-columns:repeat(4,minmax(0,1fr))">${g(3).map(small).join('')}</div>
      <p class="mu" style="font-size:12px;text-align:center;margin:6px 0 0">"Yakında" yazan bölümler güncellemelerle açılacak.</p>
    </div>`;
  }
};

Screens.soon = {
  nav: 'sections',
  render(p) {
    return `<div class="topbar" style="padding-top:18px"><button class="icbtn box" data-a="back">${ic('back', 20, 1.8)}</button><h1>${U.esc(p.name || '')}</h1></div>
    <div class="col" style="align-items:center;text-align:center;padding:60px 30px;gap:16px">
      <span style="color:var(--ac)">${ic(p.icon || 'spark', 54, 1.1)}</span>
      <h2 class="serif" style="font-size:26px">Çok yakında</h2>
      <p class="mu" style="margin:0;line-height:1.6">Bu bölüm sonraki güncellemelerle gelecek. Güncelleme çıktığında Ayarlar'daki "Güncelle" düğmesiyle APK kurmadan açılacak.</p>
      <button class="btn soft" data-a="back">Geri dön</button>
    </div>`;
  }
};

/* ---------- arama ---------- */
Screens.search = {
  nav: 'home',
  render(p) {
    const q = (p.q || '').trim().toLocaleLowerCase('tr-TR');
    const has = s => (s || '').toLocaleLowerCase('tr-TR').includes(q);
    let res = '';
    if (q.length >= 2) {
      const tasks = S.db.tasks.filter(t => has(t.title) || has(t.note)).slice(0, 30);
      const notes = S.db.notes.filter(n => has(n.title) || has(S.noteText(n)) || (n.tags || []).some(has)).slice(0, 30);
      const days = Object.entries(S.db.days).filter(([k, d]) => has(d.journal) || has(d.best) || has(d.note) || (d.gratitude || []).some(has) || (d.learned || []).some(has)).sort((a, b) => a[0] < b[0] ? 1 : -1).slice(0, 30);
      const habits = S.db.habits.filter(h => has(h.name));
      const books = S.db.books.filter(b => has(b.title) || has(b.author) || has(b.comment));
      const snip = s => { s = s || ''; const i = s.toLocaleLowerCase('tr-TR').indexOf(q); if (i < 0) return U.esc(s.slice(0, 80)); const a = Math.max(0, i - 30); return (a ? '…' : '') + U.esc(s.slice(a, i)) + '<b style="color:var(--ac)">' + U.esc(s.slice(i, i + q.length)) + '</b>' + U.esc(s.slice(i + q.length, i + q.length + 50)); };
      const grp = (title, icon, items) => items.length ? `<div class="lbl" style="margin-top:6px">${title} · ${items.length}</div><div class="set">${items.join('')}</div>` : '';
      res = grp('Görevler ve hatırlatıcılar', 'task', tasks.map(t => `<button data-a="sTask" data-id="${t.id}">${ic(t.kind === 'event' ? 'bell' : 'task', 20)}<span class="sp">${snip(t.title)}<small>${t.date ? U.fmt(t.date, 'full') : ''}${t.time ? ' · ' + t.time : ''}</small></span></button>`))
        + grp('Notlar', 'note', notes.map(n => `<button data-a="sNote" data-id="${n.id}">${ic('note', 20)}<span class="sp">${U.esc(n.title || 'Başlıksız not')}<small>${snip(has(n.title) ? '' : S.noteText(n)) || (n.tags || []).map(t => '#' + t).join(' ')}</small></span></button>`))
        + grp('Günlük ve günler', 'journal', days.map(([k, d]) => `<button data-a="sDay" data-k="${k}">${ic('journal', 20)}<span class="sp">${U.fmt(k, 'long')}<small>${snip([d.best, d.journal, d.note, (d.gratitude || []).join(' · '), (d.learned || []).join(' · ')].find(has))}</small></span></button>`))
        + grp('Alışkanlıklar', 'target', habits.map(h => `<button data-a="go" data-to="habit" data-p='{"id":"${h.id}"}'>${ic('target', 20)}<span class="sp">${snip(h.name)}</span></button>`))
        + grp('Kitaplar', 'book', books.map(b => `<button data-a="sBook" data-id="${b.id}">${ic('book', 20)}<span class="sp">${snip(b.title)}<small>${U.esc(b.author || '')}</small></span></button>`));
      if (!res) res = `<p class="mu" style="text-align:center;padding:30px 0">"${U.esc(p.q)}" için sonuç bulunamadı.</p>`;
    } else res = `<p class="mu" style="text-align:center;padding:30px 0;line-height:1.6">Görevler, notlar, günlük sayfaları, alışkanlıklar ve kitaplar arasında arar.</p>`;
    return `<div class="topbar" style="padding-top:18px"><button class="icbtn box" data-a="back">${ic('back', 20, 1.8)}</button>
      <div class="row card sp" style="padding:2px 12px">${ic('search', 18)}<input class="bare" id="sq" placeholder="Her yerde ara" value="${U.esc(p.q || '')}" style="padding:10px 0;font-size:15px" autocomplete="off"></div></div>
      <div class="wrap pad">${res}</div>`;
  },
  mount(el, p) {
    const q = el.querySelector('#sq');
    q.addEventListener('input', U.debounce(() => { App.cur.entry.params.q = q.value; App.forceRefreshKeep(); }, 250));
    if (!p.q && !p.focused) { p.focused = 1; setTimeout(() => q.focus(), 250); }
  },
  acts: {
    sTask(t) { const x = S.db.tasks.find(y => y.id === t.dataset.id); if (x) App.go('agenda', { k: x.date, view: 'day' }); },
    sNote(t) { App.go('note', { id: t.dataset.id }); },
    sDay(t) { App.go('journal', { k: t.dataset.k }); },
    sBook(t) { BookSheet.open(S.db.books.find(b => b.id === t.dataset.id)); }
  }
};

/* ---------- odak sayacı (pomodoro) ---------- */
const POMO = { focus: [25, 50], short: [5], long: [15] };
Screens.pomodoro = {
  nav: 'sections',
  state() {
    const s = S.sync;
    return { end: s.pomoEnd || 0, left: s.pomoLeft || 0, mode: s.pomoMode || 'focus', len: s.pomoLen || 25 };
  },
  finishIfDone() {
    const s = S.sync;
    if (s.pomoEnd && Date.now() >= s.pomoEnd) {
      if ((s.pomoMode || 'focus') === 'focus') {
        const k = U.today(), d = S.day(k, true);
        S.setDay(k, 'focus', (d.focus || 0) + (s.pomoLen || 25));
        S.setDay(k, 'sessions', (d.sessions || 0) + 1);
      }
      s.pomoEnd = 0; s.pomoLeft = 0; S.saveSync();
      U.toast((s.pomoMode || 'focus') === 'focus' ? 'Oturum tamamlandı, mola zamanı' : 'Mola bitti');
      U.vibrate(200);
    }
  },
  render() {
    Screens.pomodoro.finishIfDone();
    const st = Screens.pomodoro.state();
    const running = st.end > Date.now();
    const remain = running ? Math.ceil((st.end - Date.now()) / 1000) : (st.left || st.len * 60);
    const total = st.len * 60;
    const d = S.day(U.today());
    const mm = U.pad(Math.floor(remain / 60)), ss = U.pad(remain % 60);
    return `<div class="topbar" style="padding-top:18px">${App.stack.length > 1 ? `<button class="icbtn box" data-a="back">${ic('back', 20, 1.8)}</button>` : ''}<h1>Odak Sayacı</h1></div>
    <div class="wrap pad">
      <div class="seg" style="align-self:center">
        <button class="${st.mode === 'focus' && st.len !== 50 ? 'on' : ''}" data-a="pMode" data-m="focus" data-l="25">Çalış 25</button>
        <button class="${st.mode === 'focus' && st.len === 50 ? 'on' : ''}" data-a="pMode" data-m="focus" data-l="50" style="${st.mode === 'focus' && st.len === 50 ? '' : ''}">50</button>
        <button class="${st.mode === 'short' ? 'on' : ''}" data-a="pMode" data-m="short" data-l="5">Mola 5</button>
        <button class="${st.mode === 'long' ? 'on' : ''}" data-a="pMode" data-m="long" data-l="15">15</button></div>
      <div class="pomo">
        <div style="position:relative">${U.ring(240, 10, 1 - remain / total, st.mode === 'focus' ? 'var(--ac)' : 'var(--sage)', null)}
          <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center"><span class="big" id="pTime">${mm}:${ss}</span><span class="mu">${st.mode === 'focus' ? 'Odaklan' : 'Dinlen'}</span></div></div>
        <div class="row" style="gap:14px">
          <button class="btn ghost" data-a="pReset" style="width:56px;height:56px;border-radius:50%">${ic('stop', 22)}</button>
          <button class="btn" data-a="pToggle" style="width:76px;height:76px;border-radius:50%">${running ? ic('pause', 30, 2.4) : icf('play', 30)}</button>
          <span style="width:56px"></span></div>
        <div class="card row" style="gap:14px;align-self:stretch">${ic('flame', 22)}<span class="sp">Bugün <b>${d.sessions || 0}</b> oturum · <b>${d.focus || 0}</b> dk odak</span></div>
        <p class="mu" style="font-size:12px;text-align:center;margin:0">Süre bitince telefonun bildirim gönderir, uygulamayı kapatabilirsin.</p>
      </div></div>`;
  },
  mount() {
    clearInterval(Screens.pomodoro._iv);
    Screens.pomodoro._iv = setInterval(() => {
      if (!App.cur || App.cur.entry.name !== 'pomodoro') { clearInterval(Screens.pomodoro._iv); return; }
      const st = Screens.pomodoro.state();
      if (!st.end) return;
      if (Date.now() >= st.end) { App.forceRefresh(); return; }
      const r = Math.ceil((st.end - Date.now()) / 1000);
      const el = document.getElementById('pTime'); if (el) el.textContent = U.pad(Math.floor(r / 60)) + ':' + U.pad(r % 60);
      const c = document.querySelector('.pomo .ring circle:last-child');
      if (c) { const R = 115, C = 2 * Math.PI * R; c.setAttribute('stroke-dasharray', ((1 - r / (st.len * 60)) * C).toFixed(1) + ' ' + C.toFixed(1)); }
    }, 1000);
  },
  acts: {
    pMode(t) { const s = S.sync; if (s.pomoEnd > Date.now()) return U.toast('Önce sayacı durdur'); s.pomoMode = t.dataset.m; s.pomoLen = +t.dataset.l; s.pomoLeft = 0; S.saveSync(); App.forceRefresh(); },
    pToggle() {
      const s = S.sync, st = Screens.pomodoro.state();
      if (st.end > Date.now()) { s.pomoLeft = Math.ceil((st.end - Date.now()) / 1000); s.pomoEnd = 0; }
      else { s.pomoEnd = Date.now() + (st.left || st.len * 60) * 1000; s.pomoLeft = 0; s.pomoMode = st.mode; s.pomoLen = st.len; s.pomoMsg = st.mode === 'focus' ? 'Çalışma oturumu bitti, kısa bir mola ver.' : 'Mola bitti, hazırsan devam.'; if (N && !Notify.allowed()) Notify.ask(); }
      S.saveSync(); Notify.push(); App.forceRefresh();
    },
    pReset() { const s = S.sync; s.pomoEnd = 0; s.pomoLeft = 0; S.saveSync(); Notify.push(); App.forceRefresh(); }
  }
};
