/* Ajanda: gün / hafta / ay + görev düzenleyici */
'use strict';

function taskMeta(t, k) {
  const c = S.cat(t.cat);
  const parts = [`<span class="cdot" style="background:${c.color}"></span>${t.time || (t.kind === 'event' ? 'Tüm gün' : U.esc(c.name))}`];
  if (t.time) parts.push(U.esc(c.name));
  if (t.remind != null) parts.push(`<span style="display:inline-flex;color:var(--ac)">${ic('bell', 12, 2)}</span>`);
  if (t.repeat && t.repeat !== 'none') parts.push(`<span style="display:inline-flex">${ic('repeat', 12, 2)}</span>`);
  return parts.join(' · ');
}

function taskRow(t, k, opts) {
  const d = S.isDone(t, k);
  const moved = t.movedFrom && t.date === k && (!t.repeat || t.repeat === 'none')
    ? `<span class="tag">${U.diffDays(t.movedFrom, k) === 1 ? 'Dünden taşındı' : U.fmt(t.movedFrom, 'dms') + ' tarihinden taşındı'}</span>` : '';
  const canPost = !d && k < U.today() && !(opts && opts.compact);
  return `<div class="task ${d ? 'done' : ''}">
    <button class="chk lg ${d ? 'on' : ''}" data-a="tgl" data-id="${t.id}" data-k="${k}" aria-label="Tamamla"></button>
    <button class="tt" data-a="editTask" data-id="${t.id}"><b>${U.esc(t.title)}</b><small>${taskMeta(t, k)}</small>${moved}</button>
    ${canPost ? `<button class="btn ghost sm" data-a="postpone" data-id="${t.id}" data-k="${k}">Ertele</button>` : ''}
  </div>`;
}

Screens.agenda = {
  nav: 'agenda',
  render(p) {
    const k = p.k || App.agendaDate || U.today();
    App.agendaDate = k;
    const view = p.view || 'day';
    const top = `<div class="topbar" style="padding-top:18px">
      ${App.stack.length > 1 ? `<button class="icbtn box" data-a="back" aria-label="Geri">${ic('back', 20, 1.8)}</button>` : `<button class="icbtn box" data-a="toToday" aria-label="Bugün">${ic('home', 19, 1.8)}</button>`}
      <div class="sp" style="display:flex;justify-content:center"><div class="seg">
        <button class="${view === 'day' ? 'on' : ''}" data-a="view" data-v="day">Gün</button>
        <button class="${view === 'week' ? 'on' : ''}" data-a="view" data-v="week">Hafta</button>
        <button class="${view === 'month' ? 'on' : ''}" data-a="view" data-v="month">Ay</button></div></div>
      <button class="icbtn box" data-a="pickDate" aria-label="Tarih seç">${ic('cal', 19, 1.8)}</button>
    </div>`;
    if (view === 'week') return top + Screens.agenda.week(k);
    if (view === 'month') return top + Screens.agenda.month(k);
    return top + Screens.agenda.day(k);
  },

  day(k) {
    const tk = U.today();
    const d = S.day(k);
    const list = S.tasksOn(k);
    const ghosts = S.movedFrom(k);
    const doneN = list.filter(t => S.isDone(t, k)).length;
    const water = S.water();
    const wc = water ? S.habitCount(water, k) : (d.water || 0);
    const wt = water ? water.target : (S.set.waterTarget || 8);
    const md = moodOf(d.mood);
    const timed = list.filter(t => t.time);
    const learned = d.learned || ['', '', ''];

    const wk = U.weekDays(k).map((x, i) => `<button data-a="setK" data-k="${x}" class="${x === k ? 'sel' : ''} ${x === tk ? 'today' : ''}"><small>${U.daysS[i]}</small><b>${U.parse(x).getDate()}</b><i class="${S.dayHasItems(x) ? 'on' : ''}"></i></button>`).join('');

    return `<div class="wrap pad">
      <div class="dayhead">
        <button class="icbtn" data-a="shift" data-n="-1" aria-label="Önceki gün">${ic('left', 22, 1.8)}</button>
        <div><h1>${U.fmt(k, 'dm')}</h1><small>${U.days[U.dow(k)].toLocaleUpperCase('tr-TR')} · ${U.parse(k).getFullYear()}${k !== tk ? ' · ' + U.rel(k).toLocaleUpperCase('tr-TR') : ''}</small></div>
        <button class="icbtn" data-a="shift" data-n="1" aria-label="Sonraki gün">${ic('right', 22, 1.8)}</button>
      </div>
      <div class="card week wk2">${wk}</div>
      ${k !== tk ? `<button class="btn soft sm" data-a="toToday" style="align-self:center">Bugüne dön</button>` : ''}

      <div class="g2" style="gap:10px">
        <section class="card big col" style="padding:14px;gap:10px"><span class="lbl">Ruh hâli</span>
          <div class="moods">${MOODS.map(m => `<button data-a="mood" data-v="${m.v}" class="${d.mood === m.v ? 'on' : ''}" style="background:${m.c}" aria-label="${m.l}"></button>`).join('')}</div>
          <b style="font-size:13px">${md ? md.l : '<span class="mu" style="font-weight:500">Seçilmedi</span>'}</b></section>
        <section class="card big col" style="padding:14px;gap:10px"><span class="lbl">Su</span>
          <div class="cups">${Array.from({ length: wt }, (_, i) => `<button data-a="water" data-n="${i + 1}" class="${i < wc ? 'on' : ''}" aria-label="${i + 1}. bardak"></button>`).join('')}</div>
          <b style="font-size:13px">${wc} / ${wt} bardak</b></section>
      </div>

      <section class="card big col" style="gap:2px">
        <div class="row" style="padding-bottom:6px"><h2 class="h2s sp">Yapılacaklar <span class="mu" style="font-family:var(--sans);font-size:12px">${doneN} / ${list.length}</span></h2>
          <button class="btn soft sm" data-a="addTask">${ic('plus', 16, 2)}Ekle</button></div>
        ${list.map(t => taskRow(t, k)).join('')}
        ${ghosts.map(t => `<div class="task ghost"><span class="chk lg" style="border-style:dashed"></span><div class="tt"><b>${U.esc(t.title)}</b><small>→ ${U.fmt(t.date, 'dm')} gününe taşındı</small></div></div>`).join('')}
        <div class="row" style="margin-top:6px;gap:10px"><span style="color:var(--mu2);display:flex">${ic('plus', 20)}</span><input class="bare" id="qadd" placeholder="Hızlıca görev yaz, Enter'a bas…" enterkeyhint="done" style="font-size:14.5px;padding:10px 0"></div>
      </section>

      <section class="card big col" style="gap:12px">
        <h2 class="h2s">Program</h2>
        ${timed.length ? `<div class="col" style="gap:10px">${timed.map(t => {
          const c = S.cat(t.cat).color, dn = S.isDone(t, k);
          return `<div class="slot"><span>${t.time}</span><button class="blk" data-a="editTask" data-id="${t.id}" style="background:color-mix(in srgb,${c} 16%,transparent);${dn ? 'opacity:.55' : ''}"><b style="color:color-mix(in srgb,${c} 55%,var(--tx))">${U.esc(t.title)}</b><small>${t.time}${t.remind != null ? ' · hatırlatıcı açık' : ''}${dn ? ' · tamamlandı' : ''}</small></button></div>`;
        }).join('')}</div>` : `<span class="mu" style="font-size:13px">Saatli bir iş yok. Görev eklerken saat seçersen burada sıralanır.</span>`}
      </section>

      <section class="card big col" style="gap:12px">
        <h2 class="h2s">Günün notu</h2>
        <textarea class="bare grow" data-in="dayField" data-f="note" data-k="${k}" rows="2" placeholder="Bugün aklında ne var?" style="font-size:14.5px;line-height:1.6">${U.esc(d.note || '')}</textarea>
        <div class="photos">${(d.photos || []).map(id => `<button class="ph" data-a="viewPhoto" data-id="${id}" data-k="${k}" style="background-image:url('${S.photoUrl(id)}')"></button>`).join('')}
          <button class="add" data-a="addDayPhoto" data-k="${k}">${ic('image', 22, 1.5)}Fotoğraf</button></div>
      </section>

      <section class="card big col" style="gap:10px">
        <h2 class="h2s">Bugün öğrendiğim 3 şey</h2>
        ${[0, 1, 2].map(i => `<div class="numl"><span>${i + 1}</span><textarea class="bare grow" rows="1" data-in="learned" data-i="${i}" data-k="${k}" placeholder="Yazmak için dokun…" style="font-size:14.5px;line-height:1.5">${U.esc(learned[i] || '')}</textarea></div>`).join('')}
      </section>

      <section class="moment">
        <span class="lbl" style="color:var(--acTx);opacity:.85">Günün en güzel anı</span>
        <textarea class="bare grow" rows="1" data-in="dayField" data-f="best" data-k="${k}" placeholder="Bugünün en güzel anı neydi?">${U.esc(d.best || '')}</textarea>
      </section>
      <div style="height:4px"></div>
    </div>`;
  },

  week(k) {
    const days = U.weekDays(k), tk = U.today();
    const a = U.parse(days[0]), b = U.parse(days[6]);
    return `<div class="wrap pad">
      <div class="dayhead"><button class="icbtn" data-a="shift" data-n="-7">${ic('left', 22, 1.8)}</button>
        <div><h1 style="font-size:28px">${a.getDate()} ${U.monthsS[a.getMonth()]} – ${b.getDate()} ${U.monthsS[b.getMonth()]}</h1><small>${S.weekScore(k).done} / ${S.weekScore(k).total} TAMAMLANDI</small></div>
        <button class="icbtn" data-a="shift" data-n="7">${ic('right', 22, 1.8)}</button></div>
      ${days.map((d, i) => {
        const list = S.tasksOn(d), md = moodOf(S.day(d).mood);
        return `<section class="card big col" style="gap:4px;padding:14px;${d === tk ? 'border-color:var(--ac)' : ''}">
          <button class="row" data-a="openDay" data-k="${d}" style="background:none;border:none;color:inherit;padding:0 0 4px;text-align:left">
            <b class="serif" style="font-size:20px">${U.parse(d).getDate()}</b><span class="mu" style="font-size:12.5px;flex:1">${U.days[i]}${d === tk ? ' · Bugün' : ''}</span>
            ${md ? `<span class="cdot" style="width:10px;height:10px;background:${md.c}"></span>` : ''}<span class="mu">›</span></button>
          ${list.length ? list.map(t => taskRow(t, d, { compact: true })).join('') : '<span class="mu" style="font-size:12.5px">Boş gün</span>'}
        </section>`;
      }).join('')}
    </div>`;
  },

  month(k) {
    const d = U.parse(k), tk = U.today();
    const first = new Date(d.getFullYear(), d.getMonth(), 1);
    const start = U.addDays(U.key(first), -((first.getDay() + 6) % 7));
    const cells = [];
    for (let i = 0; i < 42; i++) {
      const x = U.addDays(start, i), xd = U.parse(x);
      if (i >= 35 && xd.getMonth() !== d.getMonth()) break;
      const n = S.tasksOn(x).length;
      const md = moodOf(S.day(x).mood);
      cells.push(`<button data-a="selK" data-k="${x}" class="${xd.getMonth() !== d.getMonth() ? 'out' : ''} ${x === tk ? 'today' : ''} ${x === k ? 'sel' : ''}">${xd.getDate()}<span class="dots">${Array.from({ length: Math.min(n, 3) }, () => '<i></i>').join('')}${md ? `<i style="background:${md.c}"></i>` : ''}</span></button>`);
    }
    const list = S.tasksOn(k);
    return `<div class="wrap pad">
      <div class="dayhead"><button class="icbtn" data-a="shiftM" data-n="-1">${ic('left', 22, 1.8)}</button>
        <div><h1 style="font-size:30px">${U.months[d.getMonth()]}</h1><small>${d.getFullYear()}</small></div>
        <button class="icbtn" data-a="shiftM" data-n="1">${ic('right', 22, 1.8)}</button></div>
      <section class="card big"><div class="month">${U.daysS.map(x => `<div class="h">${x}</div>`).join('')}${cells.join('')}</div></section>
      <section class="card big col" style="gap:2px">
        <div class="row" style="padding-bottom:6px"><h2 class="h2s sp">${U.fmt(k, 'dm')}</h2><button class="btn soft sm" data-a="openDay" data-k="${k}">Günü aç</button><button class="btn soft sm" data-a="addTask">${ic('plus', 16, 2)}</button></div>
        ${list.length ? list.map(t => taskRow(t, k, { compact: true })).join('') : '<span class="mu" style="font-size:13px">Bu gün için kayıt yok.</span>'}
      </section>
    </div>`;
  },

  mount(el, p) {
    const q = el.querySelector('#qadd');
    if (q) q.addEventListener('keydown', e => {
      if (e.key === 'Enter' && q.value.trim()) {
        S.newTask({ title: q.value.trim(), date: App.agendaDate });
        q.value = ''; q.blur(); App.forceRefresh();
        setTimeout(() => { const q2 = document.getElementById('qadd'); if (q2) q2.focus(); }, 60);
      }
    });
    App.growAll(el);
  },

  acts: {
    view(t) { const e = App.cur.entry; e.params.view = t.dataset.v; e.params.k = App.agendaDate; App.forceRefresh(); },
    setK(t) { App.cur.entry.params.k = t.dataset.k; App.forceRefresh(); },
    selK(t) { App.cur.entry.params.k = t.dataset.k; App.forceRefresh(); },
    shift(t) { App.cur.entry.params.k = U.addDays(App.agendaDate, +t.dataset.n); App.forceRefresh(); },
    shiftM(t) { const d = U.parse(App.agendaDate); d.setDate(1); d.setMonth(d.getMonth() + (+t.dataset.n)); App.cur.entry.params.k = U.key(d); App.forceRefresh(); },
    toToday() { App.cur.entry.params.k = U.today(); App.forceRefresh(); },
    openDay(t) { const e = App.cur.entry; e.params.k = t.dataset.k; e.params.view = 'day'; App.forceRefresh(); document.getElementById('screen').scrollTop = 0; },
    pickDate() {
      const i = document.createElement('input'); i.type = 'date'; i.value = App.agendaDate;
      i.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
      document.body.appendChild(i);
      i.onchange = () => { if (i.value) { App.cur.entry.params.k = i.value; App.cur.entry.params.view = 'day'; App.forceRefresh(); } i.remove(); };
      i.onblur = () => setTimeout(() => i.remove(), 500);
      if (i.showPicker) { try { i.showPicker(); } catch (e) { i.focus(); i.click(); } } else { i.focus(); i.click(); }
    },
    tgl(t) { const x = S.db.tasks.find(y => y.id === t.dataset.id); if (x) { S.toggle(x, t.dataset.k); App.forceRefresh(); } },
    editTask(t) { const x = S.db.tasks.find(y => y.id === t.dataset.id); if (x) TaskSheet.open(x); },
    addTask() { TaskSheet.open(null, { date: App.agendaDate }); },
    postpone(t) { const x = S.db.tasks.find(y => y.id === t.dataset.id); if (x) PostponeSheet.open(x, t.dataset.k); },
    mood(t) { const k = App.agendaDate, v = +t.dataset.v; S.setDay(k, 'mood', S.day(k).mood === v ? null : v); App.forceRefresh(); },
    water(t) {
      const k = App.agendaDate, n = +t.dataset.n, w = S.water();
      if (w) { const cur = S.habitCount(w, k); const nv = cur === n ? n - 1 : n; w.log = w.log || {}; if (nv <= 0) delete w.log[k]; else w.log[k] = nv; w.updated = Date.now(); U.vibrate(8); S.touch(); }
      else S.setDay(k, 'water', n);
      App.forceRefresh();
    },
    dayField: U.debounce(t => { S.setDay(t.dataset.k, t.dataset.f, t.value); }, 500),
    learned: U.debounce(t => { const d = S.day(t.dataset.k, true); const a = (d.learned || ['', '', '']).slice(); a[+t.dataset.i] = t.value; S.setDay(t.dataset.k, 'learned', a); }, 500),
    async addDayPhoto(t) {
      const k = t.dataset.k;
      const ids = await S.addPhotos(true);
      if (ids.length) { const d = S.day(k, true); S.setDay(k, 'photos', (d.photos || []).concat(ids)); App.forceRefresh(); }
    },
    viewPhoto(t) { PhotoView.open(t.dataset.id, () => { const k = t.dataset.k; const d = S.day(k); S.setDay(k, 'photos', (d.photos || []).filter(x => x !== t.dataset.id)); App.forceRefresh(); }); }
  }
};

/* ---------- fotoğraf görüntüleyici ---------- */
const PhotoView = {
  open(id, onDelete) {
    const rec = App.sheet(`<img src="${S.photoUrl(id)}" style="width:100%;border-radius:16px;display:block">
      <div class="row">${onDelete ? `<button class="btn danger sp" data-a="pvDel">${ic('trash', 18)} Kaldır</button>` : ''}<button class="btn ghost sp" data-a="closeSheet">Kapat</button></div>`, {
      acts: { pvDel: async () => { App.closeSheet(rec); if (await App.confirm('Fotoğraf kaldırılsın mı?', 'Kaldır', true)) onDelete(); } }
    });
  }
};

/* ---------- erteleme ---------- */
const PostponeSheet = {
  open(t, k) {
    const tk = U.today();
    const base = k < tk ? tk : k;
    const nextMon = U.addDays(U.weekStart(base), 7);
    const rec = App.sheet(`<h3>Ertele: ${U.esc(t.title)}</h3><div class="menu">
      ${k < tk ? `<button data-a="pp" data-to="${tk}">${ic('sun', 20)} Bugüne</button>` : ''}
      <button data-a="pp" data-to="${U.addDays(base, 1)}">${ic('moon', 20)} ${k < tk ? 'Yarına' : 'Ertesi güne'} <span class="sp"></span><small class="mu">${U.fmt(U.addDays(base, 1), 'dms')}</small></button>
      <button data-a="pp" data-to="${U.addDays(base, 2)}">${ic('cal', 20)} 2 gün sonraya <span class="sp"></span><small class="mu">${U.fmt(U.addDays(base, 2), 'dms')}</small></button>
      <button data-a="pp" data-to="${nextMon}">${ic('cal', 20)} Gelecek haftaya <span class="sp"></span><small class="mu">${U.fmt(nextMon, 'dms')}</small></button>
      </div><div class="field"><label>Ya da tarih seç</label><input type="date" class="inp" id="ppDate" min="${tk}"></div>
      <button class="btn wide" data-a="ppPick">Bu tarihe ertele</button>`, {
      acts: {
        pp: b => { S.postpone(t, k, b.dataset.to); App.closeSheet(rec); U.toast(U.fmt(b.dataset.to, 'dm') + ' gününe ertelendi'); },
        ppPick: () => { const v = rec.sh.querySelector('#ppDate').value; if (!v) return U.toast('Tarih seç'); S.postpone(t, k, v); App.closeSheet(rec); U.toast(U.fmt(v, 'dm') + ' gününe ertelendi'); }
      }
    });
  }
};

/* ---------- görev / etkinlik düzenleyici ---------- */
const TaskSheet = {
  open(task, defaults) {
    const isNew = !task;
    const f = Object.assign({ title: '', kind: 'task', date: U.today(), time: '', remind: null, repeat: 'none', cat: 'kisisel', note: '' }, defaults || {}, task || {});
    const draw = () => `
      <div class="row"><h3 class="sp">${isNew ? (f.kind === 'event' ? 'Yeni hatırlatıcı' : 'Yeni görev') : 'Düzenle'}</h3>
        ${!isNew ? `<button class="icbtn" data-a="tsDel" aria-label="Sil" style="color:#F19AA2">${ic('trash', 20)}</button>` : ''}</div>
      <textarea class="inp grow" id="tsTitle" rows="1" placeholder="${f.kind === 'event' ? 'Ne zaman, ne olacak? (ör. Doğum günü)' : 'Ne yapılacak?'}" style="font-size:16px;min-height:0">${U.esc(f.title)}</textarea>
      <div class="opts"><button class="${f.kind === 'task' ? 'on' : ''}" data-a="tsKind" data-v="task">Görev</button><button class="${f.kind === 'event' ? 'on' : ''}" data-a="tsKind" data-v="event">Etkinlik / Hatırlatıcı</button></div>
      <div class="g2" style="gap:10px">
        <div class="field"><label>Tarih</label><input type="date" class="inp" id="tsDate" value="${f.date || ''}"></div>
        <div class="field"><label>Saat</label><div class="row" style="gap:4px"><input type="time" class="inp" id="tsTime" data-ch="tsTimeCh" value="${f.time || ''}" style="flex:1">${f.time ? `<button class="icbtn" data-a="tsNoTime" aria-label="Saati kaldır" style="width:36px">${ic('x', 16)}</button>` : ''}</div></div>
      </div>
      <div class="field"><label>Hatırlatma</label><div class="opts">${REMINDS.map(r => `<button class="${f.remind === r.v ? 'on' : ''}" data-a="tsRem" data-v="${r.v}">${r.l}</button>`).join('')}</div>
        ${!f.time && f.remind != null ? '<small class="mu">Saat seçilmediği için hatırlatma sabah 09:00\'a göre yapılır.</small>' : ''}</div>
      <div class="field"><label>Tekrar</label><div class="opts">${REPEATS.map(r => `<button class="${f.repeat === r.v ? 'on' : ''}" data-a="tsRep" data-v="${r.v}">${r.l}</button>`).join('')}</div></div>
      <div class="field"><label>Kategori</label><div class="opts">${S.set.categories.map(c => `<button class="${f.cat === c.id ? 'on' : ''}" data-a="tsCat" data-v="${c.id}"><span class="cdot" style="background:${c.color};margin-right:6px"></span>${U.esc(c.name)}</button>`).join('')}<button data-a="tsNewCat">${ic('plus', 14)} Yeni</button></div></div>
      <div class="field"><label>Not</label><textarea class="inp grow" id="tsNote" rows="2" placeholder="İsteğe bağlı" style="min-height:0">${U.esc(f.note || '')}</textarea></div>
      <div class="row">${!isNew && !S.isDone(task, App.agendaDate || task.date) ? '<button class="btn ghost sp" data-a="tsPost">' + ic('clock', 18) + ' Ertele</button>' : ''}<button class="btn sp" data-a="tsSave">${isNew ? 'Ekle' : 'Kaydet'}</button></div>`;
    const grab = () => {
      const sh = rec.sh;
      f.title = sh.querySelector('#tsTitle').value; f.date = sh.querySelector('#tsDate').value || U.today();
      f.time = sh.querySelector('#tsTime').value; f.note = sh.querySelector('#tsNote').value;
    };
    const redraw = () => { grab(); App.setSheet(rec, draw()); };
    const rec = App.sheet(draw(), {
      mount: sh => { if (isNew) setTimeout(() => sh.querySelector('#tsTitle').focus(), 300); },
      acts: {
        tsKind: b => { f.kind = b.dataset.v; if (f.kind === 'event' && f.remind == null) f.remind = 0; redraw(); },
        tsRem: b => { f.remind = b.dataset.v === 'null' ? null : +b.dataset.v; f._remTouched = true; redraw(); },
        tsRep: b => { f.repeat = b.dataset.v; redraw(); },
        tsCat: b => { f.cat = b.dataset.v; redraw(); },
        tsTimeCh: () => { if (rec.sh.querySelector('#tsTime').value && f.remind == null && !f._remTouched) { f.remind = 0; redraw(); } },
        tsNoTime: () => { rec.sh.querySelector('#tsTime').value = ''; redraw(); },
        tsNewCat: async () => { grab(); const c = await CatSheet.create(); if (c) f.cat = c.id; App.setSheet(rec, draw()); },
        tsPost: () => { App.closeSheet(rec); const k = S.occurs(task, App.agendaDate) ? App.agendaDate : task.date; PostponeSheet.open(task, k); },
        tsDel: async () => {
          if (await App.confirm(task.repeat && task.repeat !== 'none' ? 'Tekrarlanan kayıt tamamen silinsin mi?' : 'Silinsin mi?', 'Sil', true)) { S.remove('tasks', task.id); App.closeSheet(rec); }
        },
        tsSave: async () => {
          grab();
          if (!f.title.trim()) { U.toast('Bir başlık yaz'); return; }
          const data = { title: f.title.trim(), kind: f.kind, date: f.date, time: f.time, remind: f.remind, repeat: f.repeat, cat: f.cat, note: f.note.trim(), updated: Date.now() };
          if (isNew) S.newTask(data); else { Object.assign(task, data); S.touch(); }
          App.closeSheet(rec);
          if (f.remind != null && N && !Notify.allowed()) { if (await App.confirm('Hatırlatma için bildirim izni gerekiyor. İzin verelim mi?', 'İzin ver')) Notify.ask(); }
        }
      }
    });
  }
};

/* ---------- kategori oluşturma ---------- */
const CAT_COLORS = ['#E89AAD', '#8FB7C9', '#C9B4E0', '#9CC0A6', '#D9B47A', '#F1C27D', '#E07A86', '#7FA6D8', '#B0A0E0', '#A8C890', '#E0A080', '#C8C8C8'];
const CatSheet = {
  create(existing) {
    return new Promise(res => {
      let color = existing ? existing.color : CAT_COLORS[S.set.categories.length % CAT_COLORS.length];
      let done = false;
      const draw = () => `<h3>${existing ? 'Kategoriyi düzenle' : 'Yeni kategori'}</h3><input class="inp" id="cName" value="${U.esc(existing ? existing.name : '')}" placeholder="Kategori adı">
        <div class="swatches">${CAT_COLORS.map(c => `<button class="${c === color ? 'on' : ''}" data-a="cCol" data-v="${c}" style="background:${c}" aria-label="Renk"></button>`).join('')}</div>
        <div class="row">${existing ? '<button class="btn danger sp" data-a="cDel">Sil</button>' : ''}<button class="btn sp" data-a="cOk">Kaydet</button></div>`;
      const rec = App.sheet(draw(), {
        onClose: () => { if (!done) res(null); },
        acts: {
          cCol: b => { const n = rec.sh.querySelector('#cName').value; color = b.dataset.v; App.setSheet(rec, draw()); rec.sh.querySelector('#cName').value = n; },
          cOk: () => {
            const name = rec.sh.querySelector('#cName').value.trim(); if (!name) return U.toast('Ad yaz');
            let c = existing;
            if (c) { c.name = name; c.color = color; } else { c = { id: 'c' + U.id(), name, color }; S.set.categories.push(c); }
            S.set.updated = Date.now(); S.touch(); done = true; App.closeSheet(rec); res(c);
          },
          cDel: async () => {
            if (S.set.categories.length <= 1) return U.toast('En az bir kategori kalmalı');
            done = true; App.closeSheet(rec);
            if (await App.confirm('"' + existing.name + '" silinsin mi? İçindeki kayıtlar ilk kategoriye geçer.', 'Sil', true)) {
              S.set.categories = S.set.categories.filter(x => x !== existing);
              for (const t of S.db.tasks) if (t.cat === existing.id) t.cat = S.set.categories[0].id;
              S.set.updated = Date.now(); S.touch();
            }
            res(null);
          }
        }
      });
    });
  }
};

/* ---------- bildirimden açılan görev detayı ---------- */
const TaskDetail = {
  open(tid, k) {
    const t = S.db.tasks.find(x => x.id === tid);
    if (!t) { U.toast('Bu kayıt artık yok'); return; }
    k = k || t.date;
    const c = S.cat(t.cat), d = S.isDone(t, k);
    const rep = REPEATS.find(r => r.v === (t.repeat || 'none'));
    const rem = REMINDS.find(r => r.v === t.remind);
    const rec = App.sheet(`
      <div class="row" style="gap:10px"><span class="cdot" style="width:12px;height:12px;background:${c.color}"></span><span class="lbl sp">${U.esc(c.name)}${t.kind === 'event' ? ' · Etkinlik' : ''}</span>
        <button class="icbtn" data-a="tdEdit" aria-label="Düzenle">${ic('edit', 19)}</button></div>
      <h3 style="font-size:30px;line-height:1.15">${U.esc(t.title)}</h3>
      <div class="card big col" style="gap:10px">
        <div class="row">${ic('cal', 18)}<span>${U.fmt(k, 'long')} · ${U.rel(k)}</span></div>
        ${t.time ? `<div class="row">${ic('clock', 18)}<span>${t.time}</span></div>` : ''}
        ${t.repeat && t.repeat !== 'none' ? `<div class="row">${ic('repeat', 18)}<span>${rep ? rep.l : ''}</span></div>` : ''}
        ${t.remind != null ? `<div class="row">${ic('bell', 18)}<span>${rem ? rem.l : ''}</span></div>` : ''}
        ${t.note ? `<p style="margin:4px 0 0;line-height:1.6;white-space:pre-line">${U.esc(t.note)}</p>` : ''}
      </div>
      ${d ? '<p class="mu" style="margin:0;text-align:center">Bu iş zaten tamamlandı.</p>' : ''}
      <div class="row"><button class="btn ghost sp" data-a="tdPost">${ic('clock', 18)} Ertele</button><button class="btn sp" data-a="tdOk">${ic('check', 18, 2.4)} Tamam</button></div>`, {
      acts: {
        tdOk: () => { if (!S.isDone(t, k)) S.toggle(t, k); App.closeSheet(rec); App.go('home', {}, { reset: true }); U.toast('Tamamlandı'); },
        tdPost: () => { App.closeSheet(rec); PostponeSheet.open(t, k); },
        tdEdit: () => { App.closeSheet(rec); TaskSheet.open(t); }
      }
    });
  }
};
