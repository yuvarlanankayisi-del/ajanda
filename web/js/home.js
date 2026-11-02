/* Ana sayfa */
'use strict';

const MOODS = [
  { v: 1, l: 'Kötü', c: '#6E5A64' },
  { v: 2, l: 'Yorgun', c: '#9A7A9E' },
  { v: 3, l: 'Normal', c: '#B49AA2' },
  { v: 4, l: 'Huzurlu', c: '#8FB7C9' },
  { v: 5, l: 'Harika', c: '#D9B47A' }
];
const moodOf = v => MOODS.find(m => m.v === v);

const QUOTES = [
  'Küçük adımlar büyük hayallere götürür.',
  'Bugün, dünün hayal ettiği yarın.',
  'Yavaş git ama durma.',
  'Kendine iyi davranmak da bir plan maddesi.',
  'Her sayfa yeni bir başlangıç.',
  'Düzen, zihne açılan bir penceredir.',
  'Bugün yapabildiğin kadarı yeterli.',
  'Yazdığın her şey seni biraz daha tanıtır.',
  'Sabır, en sessiz güçtür.',
  'Bir fincan çay, bir sayfa kitap, bir derin nefes.',
  'Hayaller tarih koyunca hedef olur.',
  'Güzel günler, küçük alışkanlıklardan doğar.',
  'Bugün kendin için bir şey yap.',
  'Dinlenmek de ilerlemenin parçası.',
  'Unutmamak için yaz, büyümek için oku.'
];

const SECTIONS = [
  { k: 'agenda', n: 'Ajanda', i: 'calChk', to: 'agenda', g: 1, d: 'Günlük, haftalık, aylık plan' },
  { k: 'notes', n: 'Notlar', i: 'note', to: 'notes', g: 1, d: 'Klasörler, etiketler, fotoğraflar' },
  { k: 'journal', n: 'Günlüğüm', i: 'journal', to: 'journal', g: 1, d: 'Ruh hâli, şükür, anılar' },
  { k: 'habits', n: 'Alışkanlıklar', i: 'target', to: 'habits', g: 1, d: 'Seri ve başarı takibi' },
  { k: 'books', n: 'Kitap · Dizi · Film', i: 'film', to: 'books', g: 2, d: 'Okuma listesi, ilerleme' },
  { k: 'focus', n: 'Odak Sayacı', i: 'timer', to: 'pomodoro', g: 2, d: 'Pomodoro ile çalışma' },
  { k: 'goals', n: 'Hedefler', i: 'flag', to: 'goals', g: 2, d: 'Yıllık, aylık hedefler, hayal panosu' },
  { k: 'study', n: 'Ders ve Çalışma', i: 'cap', to: 'study', g: 2, d: 'Dersler, sınavlar, ödevler' },
  { k: 'cycle', n: 'Döngüm', i: 'drop', to: 'cycle', act: 'openCycle', g: 2, d: 'Takvimden ayrı takip' },
  { k: 'special', n: 'Özel Günler', i: 'gift', to: 'special', g: 2, d: 'Doğum günleri, geri sayım' },
  { k: 'score', n: 'Aylık Değerlendirme', i: 'chart', to: 'score', g: 2, d: 'Puanlar ve grafikler' },
  { k: 'stats', n: 'İstatistikler', i: 'bars', to: 'stats', g: 2, d: 'Haftalık, aylık, yıllık' },
  { k: 'wish', n: 'İstek Listesi', i: 'star', g: 3 },
  { k: 'travel', n: 'Gezi Günlüğü', i: 'pin', g: 3 },
  { k: 'quotes', n: 'Alıntılar', i: 'quote', g: 3 },
  { k: 'ideas', n: 'Fikir Defteri', i: 'bulb', g: 3 },
  { k: 'money', n: 'Harcamalar', i: 'wallet', g: 3 },
  { k: 'recipes', n: 'Tarifler', i: 'pot', g: 3 },
  { k: 'letters', n: 'Kendime Mektuplar', i: 'mail', g: 3 },
  { k: 'year', n: 'Yıl Özeti', i: 'spark', g: 3 }
];
const secOf = k => SECTIONS.find(s => s.k === k);
function secAttrs(s) {
  if (s.act) return `data-a="${s.act}"`;
  return s.to ? `data-a="go" data-to="${s.to}"` : `data-a="soon" data-name="${U.esc(s.n)}" data-icon="${s.i}"`;
}

Screens.home = {
  render() {
    const st = S.set, tk = U.today(), td = U.parse(tk);
    const tasksToday = S.tasksOn(tk), open = tasksToday.filter(t => !S.isDone(t, tk));
    const taskOpen = open.filter(t => t.kind === 'task');
    let sub = st.sub;
    if (!sub) sub = taskOpen.length === 0 ? 'Bugün her şey yolunda.' : `${U.hello()} · bugün ${taskOpen.length} işin var.`;
    const qi = (Math.floor(Date.now() / 86400000) + (st.quoteIdx || 0)) % QUOTES.length;
    const hasUpd = Upd.remote && Upd.local && Upd.remote.version > Upd.local.version;

    /* hafta şeridi */
    const week = U.weekDays(tk).map((k, i) => `<button data-a="openDay" data-k="${k}" class="${k === tk ? 'sel' : ''}"><small>${U.daysS[i]}</small><b>${U.parse(k).getDate()}</b><i class="${S.dayHasItems(k) ? 'on' : ''}"></i></button>`).join('');

    /* hatırlatıcılar */
    const rList = k => {
      const list = S.tasksOn(k);
      if (!list.length) return `<button class="empty" data-a="openDay" data-k="${k}" style="background:none;border:none;text-align:left">Boş · eklemek için dokun</button>`;
      return list.slice(0, 3).map(t => {
        const d = S.isDone(t, k);
        return `<div class="rmd ${d ? 'done' : ''}"><button class="chk ${d ? 'on' : ''}" data-a="tgl" data-id="${t.id}" data-k="${k}" aria-label="Tamamla" style="margin-top:2px"></button><button class="t" data-a="editTask" data-id="${t.id}" style="background:none;border:none;padding:0;text-align:left;color:inherit"><b>${U.esc(t.title)}</b><small>${t.time || (t.kind === 'event' ? 'Tüm gün' : 'Saatsiz')}</small></button></div>`;
      }).join('') + (list.length > 3 ? `<small class="mu" style="font-size:9.5px">+${list.length - 3} daha</small>` : '');
    };
    const tmk = U.addDays(tk, 1);
    const openT = S.tasksOn(tmk).filter(t => !S.isDone(t, tmk)).length;

    /* plan */
    const timed = tasksToday.filter(t => t.time);
    const planList = (timed.length ? timed : tasksToday).slice(0, 3);
    const nowHM = U.nowHM();
    let nextSet = false;
    const plan = planList.length ? planList.map(t => {
      const d = S.isDone(t, tk);
      let cls = d ? 'd' : '';
      if (!d && !nextSet && (!t.time || t.time >= nowHM)) { cls = 'n'; nextSet = true; }
      return `<div class="${cls}"><small>${t.time || 'Saatsiz'}</small><b>${U.esc(t.title)}</b></div>`;
    }).join('') : '<div class="empty" style="padding-left:0">Bugün için plan yok</div>';

    /* hafta skoru */
    const ws = S.weekScore(tk);
    const segs = ws.days.map(d => {
      const op = d.total ? (d.pct >= .99 ? 1 : d.pct > 0 ? .5 : .15) : .12;
      return `<span style="height:5px;border-radius:3px;background:${d.total && d.pct > 0 ? 'var(--ac)' : 'var(--card2)'};opacity:${d.total && d.pct > 0 ? op : 1}"></span>`;
    }).join('');

    /* kitap */
    const book = S.db.books.filter(b => b.status === 'reading').sort((a, b) => b.updated - a.updated)[0];
    const bookHtml = book ? `<button class="sub" data-a="go" data-to="books" style="border:none;text-align:left;color:inherit;display:flex;flex-direction:column;gap:6px;flex:1;padding:7px">
        <div class="row" style="gap:7px;align-items:flex-start"><div class="bcover" style="width:34px;height:50px;font-size:7px;${book.cover ? `background-image:url('${S.photoUrl(book.cover)}')` : ''}">${book.cover ? '' : U.esc(book.title.slice(0, 18))}</div>
        <div style="display:flex;flex-direction:column;gap:2px;min-width:0"><b style="font-size:11px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">${U.esc(book.title)}</b><small class="mu" style="font-size:9px">${U.esc(book.author || '')}</small></div></div>
        <div class="bar" style="height:4px"><i style="width:${book.pages ? Math.round(100 * book.page / book.pages) : 0}%"></i></div>
        <small class="mu" style="font-size:9px">${book.page || 0} / ${book.pages || '?'} sayfa</small></button>`
      : `<button class="sub" data-a="addBook" style="border:1px dashed var(--line);flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:var(--mu);font-size:10px;background:none">${ic('plus', 18)}Okuduğun kitabı ekle</button>`;

    /* yaklaşanlar */
    const seen = new Set();
    const upT = S.upcoming(45).filter(x => { if (seen.has(x.t.id)) return false; seen.add(x.t.id); return true; }).map(x => ({ k: x.k, title: x.t.title, color: S.cat(x.t.cat).color, a: `data-a="openDay" data-k="${x.k}"` }));
    const upG = (S.db.goals || []).filter(g => !g.done && !g.archived && g.due && g.due > tk && g.due <= U.addDays(tk, 45)).map(g => ({ k: g.due, title: g.title, color: g.color, a: `data-a="go" data-to="goal" data-p='{"id":"${g.id}"}'`, goal: 1 }));
    const up = upT.concat(upG).sort((a, b) => a.k < b.k ? -1 : 1).slice(0, 3);
    const upHtml = up.length ? up.map(x => `<button class="ev" ${x.a}><div class="dd"><small>${U.daysS[U.dow(x.k)]}</small><b>${U.parse(x.k).getDate()}</b></div><i class="dt" style="background:${x.color}"></i><span>${x.goal ? '<span style="color:var(--gold)">Hedef · </span>' : ''}${U.esc(x.title)}</span></button>`).join('')
      : '<div class="empty">Yaklaşan bir şey yok</div>';

    /* kısayollar */
    const scs = (st.shortcuts || []).map(secOf).filter(Boolean).slice(0, 4);
    const scHtml = scs.map(s => `<button class="tile" ${secAttrs(s)}>${ic(s.i, 16)}${U.esc(s.n)}</button>`).join('');

    /* alışkanlıklar */
    const habits = S.db.habits.filter(h => !h.archived).slice(0, 4);
    const hHtml = habits.length ? habits.map(h => {
      const multi = (h.target || 1) > 1;
      const val = multi ? S.habitCount(h, tk) : S.habitWeek(h, tk);
      const max = multi ? h.target : (h.weekly || 7);
      return `<button class="li" data-a="habitInc" data-id="${h.id}">${U.ring(18, 3.5, val / max, h.color)}<span style="font-size:10px;font-weight:600;flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${U.esc(h.name)}</span><span style="font-size:9px" class="mu">${val}/${max}</span></button>`;
    }).join('') : '<button class="empty" data-a="go" data-to="habits" style="background:none;border:none;text-align:left">Alışkanlık ekle</button>';

    const md = moodOf(S.day(tk).mood);

    return `
    <header class="hero">${Theme.hero()}<div class="fade"></div>
      <div class="hi"><h1>${U.esc(st.name || 'Merhaba')},<span style="color:var(--ac);display:inline-flex">${ic('heart', 16, 2.2)}</span></h1><span>${U.esc(sub)}</span></div>
      <div class="tools"><button class="icbtn" data-a="go" data-to="search" aria-label="Ara">${ic('search', 20, 1.8)}</button>
      <button class="icbtn" data-a="notifCenter" aria-label="Bildirimler">${ic('bell', 20, 1.8)}${(S.overdue().length || hasUpd) ? '<i class="dot"></i>' : ''}</button></div>
    </header>
    <div class="wrap">
      <section class="card datebar" aria-label="Tarih">
        <button class="d" data-a="go" data-to="agenda" style="background:none;border:none;border-right:1px solid var(--line2);color:inherit"><b>${td.getDate()}</b><span style="display:flex;flex-direction:column;text-align:left"><span class="serif" style="font-size:15px;font-weight:600;line-height:1.1">${U.months[td.getMonth()]}</span><small class="mu" style="font-size:10px">${U.days[U.dow(tk)]}</small></span></button>
        <div class="week">${week}</div>
      </section>

      <div class="g16">
        <section class="card col" aria-label="Hatırlatıcılarım">
          <div class="ct">${ic('bell', 15, 1.8)}<h2>Hatırlatıcılarım</h2><button class="more" data-a="go" data-to="agenda">Tümü ›</button></div>
          <div class="g2" style="gap:6px;flex:1">
            <div class="sub col" style="gap:7px"><button class="row" data-a="openDay" data-k="${tk}" style="gap:4px;background:none;border:none;padding:0;color:inherit;min-height:24px"><span style="color:var(--gold);display:flex">${ic('sun', 13, 2)}</span><b style="font-size:11px;flex:1;text-align:left">Bugün</b><span class="badge">${open.length}</span></button>${rList(tk)}</div>
            <div class="sub col" style="gap:7px"><button class="row" data-a="openDay" data-k="${tmk}" style="gap:4px;background:none;border:none;padding:0;color:inherit;min-height:24px"><span style="color:var(--lilac);display:flex">${ic('moon', 13, 2)}</span><b style="font-size:11px;flex:1;text-align:left">Yarın</b><span class="badge" style="background:rgba(201,180,224,.22)">${openT}</span></button>${rList(tmk)}</div>
          </div>
        </section>
        <div class="col">
          <button class="quote" data-a="nextQuote"><span class="flw">${ic('flower', 70, 1)}</span><p>“${U.esc(QUOTES[qi])}”</p><span style="color:var(--ac);display:flex">${icf('heart', 11)}</span></button>
          <button class="card row" data-a="moodPick" data-k="${tk}" style="color:inherit;text-align:left;gap:8px">
            <span style="width:30px;height:30px;border-radius:50%;border:1.4px solid ${md ? md.c : 'var(--mu2)'};display:flex;align-items:center;justify-content:center;color:${md ? md.c : 'var(--mu2)'}">${ic('smile', 18, 1.8)}</span>
            <span style="display:flex;flex-direction:column;flex:1"><small class="mu" style="font-size:9.5px">Bugünün ruh hâli</small><b style="font-size:12.5px">${md ? md.l : 'Seç'}</b></span><span class="mu">›</span>
          </button>
        </div>
      </div>

      <nav class="qa" aria-label="Hızlı işlemler">
        <button data-a="newNote">${ic('noteAdd', 18)}Not Ekle</button>
        <button data-a="newTask">${ic('task', 18)}Görev Oluştur</button>
        <button data-a="go" data-to="agenda" data-p='{"view":"month"}'>${ic('calChk', 18)}Takvim</button>
        <button data-a="go" data-to="habits">${ic('target', 18)}Alışkanlıklar</button>
        <button data-a="go" data-to="pomodoro">${ic('cap', 18)}Ders Çalış</button>
        <button data-a="go" data-to="sections">${ic('grid', 18)}Daha Fazla</button>
      </nav>

      <div class="g3">
        <section class="card col" style="gap:6px" aria-label="Bugünün planı">
          <div class="ct">${ic('cal', 13, 2)}<h2 style="font-size:14px">Bugünün Planı</h2></div>
          <small class="mu" style="font-size:9.5px;margin-top:-3px">${taskOpen.length ? taskOpen.length + ' görev kaldı' : 'Hepsi tamam'}</small>
          <div class="tl">${plan}</div>
          <button class="pill" data-a="go" data-to="agenda">Tümünü Gör <span>›</span></button>
        </section>
        <section class="card col" data-a="go" data-to="stats" style="gap:5px;align-items:center" aria-label="Hızlı bakış">
          <div class="ct" style="align-self:stretch">${ic('chart', 13, 2)}<h2 style="font-size:14px">Hızlı Bakış</h2></div>
          ${U.ring(60, 5, ws.pct, 'var(--ac)', '%' + Math.round(ws.pct * 100), 18)}
          <b style="font-size:10.5px">Bu hafta</b>
          <small class="mu" style="font-size:9.5px">${ws.done} / ${ws.total} tamamlandı</small>
          <div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:3px;width:100%">${segs}</div>
        </section>
        <section class="card col" style="gap:7px" aria-label="Okuduğum">
          <div class="ct">${ic('book', 13, 2)}<h2 style="font-size:14px">Okuduğum</h2><button class="more" data-a="go" data-to="books" style="font-size:12px" aria-label="Kitaplar">›</button></div>
          ${bookHtml}
        </section>
      </div>

      <div class="g3">
        <section class="card col" style="gap:5px" aria-label="Yaklaşanlar">
          <div class="ct">${ic('cal', 13, 2)}<h2 style="font-size:14px">Yaklaşanlar</h2></div>${upHtml}
        </section>
        <section class="card col" style="gap:6px" aria-label="Kısayollar">
          <div class="ct">${ic('star', 13, 2)}<h2 style="font-size:14px">Kısayollar</h2><button class="more" data-a="editShortcuts" style="font-size:9px">${ic('edit', 12)}</button></div>
          <div class="g2" style="gap:5px;flex:1">${scHtml}</div>
        </section>
        <section class="card col" style="gap:4px" aria-label="Alışkanlıklar">
          <div class="ct">${ic('bars', 13, 2)}<h2 style="font-size:14px">Alışkanlıklar</h2></div>${hHtml}
        </section>
      </div>
      ${S.overdue().length ? `<button class="card row" data-a="carry" style="color:inherit;text-align:left">${ic('clock', 18)}<span style="flex:1;font-size:12px">Önceki günlerden <b>${S.overdue().length}</b> tamamlanmamış görev var</span><span class="ac" style="font-size:12px;font-weight:700">Bugüne taşı</span></button>` : ''}
      <div style="height:6px"></div>
    </div>`;
  },
  acts: {
    openDay(t) { App.go('agenda', { k: t.dataset.k, view: 'day' }); },
    tgl(t) { const task = S.db.tasks.find(x => x.id === t.dataset.id); if (task) S.toggle(task, t.dataset.k); },
    editTask(t) { const task = S.db.tasks.find(x => x.id === t.dataset.id); if (task) TaskSheet.open(task); },
    newTask() { TaskSheet.open(null, { date: U.today() }); },
    nextQuote() { S.set.quoteIdx = (S.set.quoteIdx || 0) + 1; S.touch(); },
    moodPick(t) { MoodSheet.open(t.dataset.k); },
    habitInc(t) { const h = S.db.habits.find(x => x.id === t.dataset.id); if (h) S.habitInc(h, U.today()); },
    addBook() { BookSheet.open(); },
    carry() { CarrySheet.open(); },
    editShortcuts() { ShortcutSheet.open(); },
    notifCenter() { NotifCenter.open(); }
  }
};

/* ---------- ruh hâli seçici ---------- */
const MoodSheet = {
  open(k) {
    const cur = S.day(k).mood;
    const rec = App.sheet(`<h3>${k === U.today() ? 'Bugün' : U.fmt(k, 'dm')} nasıl hissediyorsun?</h3>
      <div class="row" style="justify-content:space-between">${MOODS.map(m => `<button data-a="mSet" data-v="${m.v}" style="background:none;border:none;color:var(--tx);display:flex;flex-direction:column;align-items:center;gap:8px;font-size:12px;font-weight:600">
      <span style="width:${cur === m.v ? 54 : 46}px;height:${cur === m.v ? 54 : 46}px;border-radius:50%;background:${m.c};box-shadow:${cur === m.v ? '0 0 0 4px rgba(255,255,255,.15)' : 'none'}"></span>${m.l}</button>`).join('')}</div>`, {
      acts: { mSet: t => { S.setDay(k, 'mood', +t.dataset.v); App.closeSheet(rec); } }
    });
  }
};

/* ---------- gecikenleri taşı ---------- */
const CarrySheet = {
  open() {
    const list = S.overdue();
    const rec = App.sheet(`<h3>Tamamlanmamış görevler</h3><p class="mu" style="margin:0;font-size:13px">Bunlar önceki günlerden kaldı. Hepsini bugüne taşıyabilir ya da tek tek tamamlandı işaretleyebilirsin. Eski günlerde "taşındı" olarak görünmeye devam ederler.</p>
      <div class="col">${list.map(t => `<div class="task"><button class="chk lg" data-a="cDone" data-id="${t.id}"></button><div class="tt"><b>${U.esc(t.title)}</b><small>${U.fmt(t.date, 'dm')}</small></div></div>`).join('')}</div>
      <button class="btn wide" data-a="cAll">Hepsini bugüne taşı</button>`, {
      acts: {
        cDone: t => { const x = S.db.tasks.find(y => y.id === t.dataset.id); if (x) { S.toggle(x, x.date); t.classList.add('on'); } },
        cAll: () => { const tk = U.today(); for (const t of S.overdue()) { if (!t.movedFrom) t.movedFrom = t.date; t.date = tk; t.updated = Date.now(); } S.touch(); App.closeSheet(rec); U.toast('Bugüne taşındı'); }
      }
    });
  }
};

/* ---------- kısayol seçimi ---------- */
const ShortcutSheet = {
  open() {
    let sel = (S.set.shortcuts || []).slice();
    const draw = () => `<h3>Kısayollar</h3><p class="mu" style="margin:0;font-size:13px">Ana sayfada görmek istediğin 4 bölümü seç.</p>
      <div class="opts">${SECTIONS.filter(s => s.k !== 'agenda').map(s => `<button class="${sel.includes(s.k) ? 'on' : ''}" data-a="scT" data-k="${s.k}">${U.esc(s.n)}</button>`).join('')}</div>
      <button class="btn wide" data-a="scOk">Kaydet</button>`;
    const rec = App.sheet(draw(), {
      acts: {
        scT: t => { const k = t.dataset.k; if (sel.includes(k)) sel = sel.filter(x => x !== k); else { if (sel.length >= 4) sel.shift(); sel.push(k); } App.setSheet(rec, draw()); },
        scOk: () => { S.set.shortcuts = sel; S.set.updated = Date.now(); S.touch(); App.closeSheet(rec); }
      }
    });
  }
};

/* ---------- bildirim merkezi ---------- */
const NotifCenter = {
  open() {
    const od = S.overdue();
    const tk = U.today();
    const soon = S.upcoming(3, tk).filter(x => x.t.time && (x.k > tk || x.t.time >= U.nowHM())).slice(0, 5);
    const hasUpd = Upd.remote && Upd.local && Upd.remote.version > Upd.local.version;
    const rec = App.sheet(`<h3>Bildirimler</h3>
      ${hasUpd ? `<button class="card row" data-a="ncUpd" style="color:inherit;text-align:left">${ic('update', 20)}<span style="flex:1"><b>Yeni güncelleme hazır</b><br><small class="mu">${U.esc(Upd.remote.notes || 'Yenilikleri yüklemek için dokun')}</small></span></button>` : ''}
      ${od.length ? `<button class="card row" data-a="ncCarry" style="color:inherit;text-align:left">${ic('clock', 20)}<span style="flex:1"><b>${od.length} ertelenmiş / kalmış görev</b><br><small class="mu">Bugüne taşımak için dokun</small></span></button>` : ''}
      ${(() => { const gs = (S.db.goals || []).filter(g => !g.done && !g.archived && S.goalEnd(g) && U.diffDays(tk, S.goalEnd(g)) <= 7 && U.diffDays(tk, S.goalEnd(g)) >= 0 && S.goalPct(g) < 1); return gs.length ? `<div class="lbl">Süresi yaklaşan hedefler</div><div class="col">${gs.map(g => `<button class="card row" data-a="ncGoal" data-id="${g.id}" style="color:inherit;text-align:left"><span class="cdot" style="background:${g.color}"></span><span class="sp">${U.esc(g.title)}<br><small class="mu">%${Math.round(S.goalPct(g) * 100)} · ${U.diffDays(tk, S.goalEnd(g))} gün kaldı</small></span></button>`).join('')}</div>` : ''; })()}
      ${(() => { const pm = Score.ymShift(Score.ym(), -1); return new Date().getDate() <= 10 && !(S.db.months[pm] && S.db.months[pm].self) ? `<button class="card row" data-a="ncScore" data-ym="${pm}" style="color:inherit;text-align:left">${ic('chart', 20)}<span style="flex:1"><b>${Score.ymLabel(pm)} değerlendirmesi</b><br><small class="mu">Geçen ayın puanı ${Score.final(pm).total ?? '—'} · kendi puanını vermek için dokun</small></span></button>` : ''; })()}
      <div class="lbl">Yaklaşan saatli işler</div>
      <div class="col">${soon.length ? soon.map(x => `<div class="row"><span class="cdot" style="background:${S.cat(x.t.cat).color}"></span><span style="flex:1">${U.esc(x.t.title)}</span><small class="mu">${U.rel(x.k)} ${x.t.time}</small></div>`).join('') : '<span class="mu">Yakında saatli bir iş yok.</span>'}</div>
      ${N && !Notify.allowed() ? `<button class="btn soft wide" data-a="ncPerm">Bildirim izni ver</button>` : ''}`, {
      acts: {
        ncUpd: () => { App.closeSheet(rec); App.go('settings', { open: 'update' }); },
        ncCarry: () => { App.closeSheet(rec); CarrySheet.open(); },
        ncScore: b => { App.closeSheet(rec); App.go('score', { ym: b.dataset.ym }); },
        ncGoal: b => { App.closeSheet(rec); App.go('goal', { id: b.dataset.id }); },
        ncPerm: async () => { await Notify.ask(); App.closeSheet(rec); }
      }
    });
  }
};
