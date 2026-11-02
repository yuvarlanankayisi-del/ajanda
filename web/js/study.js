/* Ders ve Çalışma: dersler, konular, ödevler, sınavlar, çalışma programı, beceriler */
'use strict';

const COURSE_COLORS = ['#8FB7C9', '#E89AAD', '#D9B47A', '#C9B4E0', '#9CC0A6', '#E07A86', '#7FA6D8', '#F1C27D'];

const Study = {
  course(id) { return (S.db.courses || []).find(c => c.id === id); },
  topicPct(c) { const t = c.topics || []; return t.length ? t.filter(x => x.done).length / t.length : 0; },
  hw(cid) { return S.db.tasks.filter(t => t.course && (!cid || t.course === cid) && !t.exam && (!t.repeat || t.repeat === 'none')); },
  exams(cid) { return S.db.tasks.filter(t => t.exam && (!cid || t.course === cid)); },
  plan(cid) { return S.db.tasks.filter(t => t.course && (!cid || t.course === cid) && !t.exam && t.repeat && t.repeat !== 'none'); },
  focusMin(cid, days) {
    let sum = 0, k = U.today();
    for (let i = 0; i < (days || 3650); i++) {
      const d = S.db.days[k];
      if (d && d.focusBy) sum += cid ? (d.focusBy[cid] || 0) : Object.values(d.focusBy).reduce((a, b) => a + b, 0);
      else if (d && !cid) sum += d.focus || 0;
      k = U.addDays(k, -1);
      if (!days && k < '2024-01-01') break;
    }
    return sum;
  },
  weekFocus() { return U.weekDays(U.today()).reduce((a, k) => a + ((S.db.days[k] || {}).focus || 0), 0); },
  nextExam(cid) {
    const tk = U.today();
    return Study.exams(cid).filter(t => t.date >= tk && !S.isDone(t, t.date)).sort((a, b) => a.date < b.date ? -1 : 1)[0];
  },
  newCourse(p) {
    const c = Object.assign({ id: 'c' + U.id(), name: '', color: COURSE_COLORS[(S.db.courses || []).length % COURSE_COLORS.length], teacher: '', topics: [], note: '', created: Date.now(), updated: Date.now() }, p || {});
    S.db.courses.push(c); S.touch(); return c;
  }
};

function hwRow(t) {
  const d = S.isDone(t, t.date), c = Study.course(t.course);
  const left = t.date ? U.diffDays(U.today(), t.date) : null;
  return `<div class="task ${d ? 'done' : ''}"><button class="chk lg ${d ? 'on' : ''}" data-a="sTgl" data-id="${t.id}"></button>
    <button class="tt" data-a="sEdit" data-id="${t.id}"><b>${U.esc(t.title)}</b><small><span class="cdot" style="background:${c ? c.color : 'var(--mu2)'}"></span>${c ? U.esc(c.name) + ' · ' : ''}${t.date ? U.fmt(t.date, 'dms') : ''}${!d && left != null ? (left < 0 ? ' · <span style="color:#F19AA2">gecikti</span>' : left === 0 ? ' · bugün' : ' · ' + left + ' gün') : ''}</small></button></div>`;
}
function examRow(t) {
  const c = Study.course(t.course), left = U.diffDays(U.today(), t.date), pct = c ? Study.topicPct(c) : 0;
  return `<button class="exam" data-a="sEdit" data-id="${t.id}"><div class="ecd" style="background:color-mix(in srgb,${c ? c.color : 'var(--ac)'} 18%,transparent);color:${c ? c.color : 'var(--ac)'}"><b>${left < 0 ? '✓' : left}</b><small>${left < 0 ? 'geçti' : left === 0 ? 'bugün' : 'gün'}</small></div>
    <div class="col sp" style="gap:4px;min-width:0;text-align:left"><b style="font-size:14.5px">${U.esc(t.title)}</b><small class="mu">${c ? U.esc(c.name) + ' · ' : ''}${U.fmt(t.date, 'long')}${t.time ? ' · ' + t.time : ''}</small>
    ${c && (c.topics || []).length ? `<div class="row" style="gap:8px"><div class="bar sp"><i style="width:${Math.round(pct * 100)}%;background:${c.color}"></i></div><small style="font-size:11px">%${Math.round(pct * 100)} hazır</small></div>` : ''}</div></button>`;
}

Screens.study = {
  nav: 'sections',
  render(p) {
    const tab = p.tab || 'courses';
    const cs = S.db.courses || [];
    const ne = Study.nextExam();
    const tk = U.today();
    const chip = (v, l) => `<button class="chip ${tab === v ? 'on' : ''}" data-a="sTab" data-v="${v}">${l}</button>`;
    let body = '';
    if (tab === 'courses') {
      body = cs.length ? `<div class="secg">${cs.map(c => {
        const pct = Study.topicPct(c), hwOpen = Study.hw(c.id).filter(t => !t.done).length, ex = Study.nextExam(c.id);
        return `<button class="sec" data-a="sOpen" data-id="${c.id}" style="border-top:3px solid ${c.color};min-height:132px">
          <div class="row" style="justify-content:space-between;align-items:flex-start"><b style="font-size:16px">${U.esc(c.name)}</b>${U.ring(36, 4, pct, c.color, Math.round(pct * 100), 10)}</div>
          <span class="col" style="gap:2px"><small>${(c.topics || []).length} konu · ${hwOpen} açık ödev</small>${ex ? `<small style="color:${c.color}">Sınav: ${U.rel(ex.date)}</small>` : ''}</span></button>`;
      }).join('')}</div>` : `<div class="col" style="align-items:center;padding:36px 20px;gap:12px;text-align:center"><span style="color:var(--ac)">${ic('cap', 40, 1.3)}</span><span class="mu">Derslerini ekle; konuları, ödevleri ve sınavları her dersin kendi sayfasında takip et.</span><button class="btn soft" data-a="sNewCourse">Ders ekle</button></div>`;
    } else if (tab === 'hw') {
      const all = Study.hw().sort((a, b) => (a.done - b.done) || (a.date < b.date ? -1 : 1));
      body = `<section class="card big col" style="gap:2px">${all.length ? all.map(hwRow).join('') : '<span class="mu">Henüz ödev yok.</span>'}</section><button class="btn soft" data-a="sAddHw">${ic('plus', 18)} Ödev ekle</button>`;
    } else if (tab === 'exams') {
      const up = Study.exams().filter(t => t.date >= tk).sort((a, b) => a.date < b.date ? -1 : 1);
      const past = Study.exams().filter(t => t.date < tk).sort((a, b) => a.date < b.date ? 1 : -1);
      body = `${up.length ? `<div class="col" style="gap:8px">${up.map(examRow).join('')}</div>` : '<span class="mu">Yaklaşan sınav yok.</span>'}
        <button class="btn soft" data-a="sAddExam">${ic('plus', 18)} Sınav ekle</button>
        ${past.length ? `<div class="lbl">Geçmiş sınavlar</div><div class="col" style="gap:8px;opacity:.6">${past.map(examRow).join('')}</div>` : ''}`;
    } else if (tab === 'plan') {
      const wd = U.weekDays(tk);
      body = `<p class="mu" style="margin:0;font-size:12.5px;line-height:1.5">Haftalık çalışma programın. Buraya eklediğin saatler her hafta tekrar eder, ajandada ve hatırlatıcılarda görünür.</p>
        ${wd.map((k, i) => { const list = S.tasksOn(k).filter(t => t.course && !t.exam); return `<section class="card col" style="gap:6px;${k === tk ? 'border-color:var(--ac)' : ''}"><div class="row"><b style="flex:1">${U.days[i]}</b>${k === tk ? '<small class="ac">Bugün</small>' : ''}</div>
          ${list.length ? list.map(t => { const c = Study.course(t.course); return `<button class="blk" data-a="sEdit" data-id="${t.id}" style="background:color-mix(in srgb,${c ? c.color : 'var(--ac)'} 15%,transparent)"><b>${t.time || 'Saatsiz'} · ${U.esc(c ? c.name : '')}</b><small>${U.esc(t.title)}</small></button>`; }).join('') : '<small class="mu2">Boş</small>'}</section>`; }).join('')}
        <button class="btn soft" data-a="sAddPlan">${ic('plus', 18)} Çalışma saati ekle</button>`;
    } else if (tab === 'skills') {
      const sk = S.db.skills || [];
      body = `${sk.length ? sk.map(x => `<button class="habit" data-a="skOpen" data-id="${x.id}" style="color:inherit;text-align:left">${U.ring(44, 4, (x.progress || 0) / 100, x.color || 'var(--ac)', (x.progress || 0), 11)}<span class="col sp" style="gap:3px"><b style="font-size:15px">${U.esc(x.name)}</b>${x.note ? `<small class="mu" style="font-size:12px">${U.esc(x.note.slice(0, 70))}</small>` : ''}</span></button>`).join('') : '<span class="mu">Öğrenmek istediğin yeni beceriler: dil, enstrüman, kod, çizim…</span>'}
        <button class="btn soft" data-a="skNew">${ic('plus', 18)} Beceri ekle</button>`;
    }
    return `<div class="topbar" style="padding-top:18px">${App.stack.length > 1 ? `<button class="icbtn box" data-a="back">${ic('back', 20, 1.8)}</button>` : ''}<h1>Ders ve Çalışma</h1>
      <button class="icbtn box" data-a="sNewCourse" aria-label="Ders ekle">${ic('plus', 20, 2)}</button></div>
    <div class="wrap pad">
      <div class="g2" style="gap:10px">
        <button class="card big col" data-a="go" data-to="pomodoro" style="gap:4px;color:inherit;text-align:left;padding:14px"><span class="ac">${ic('timer', 22)}</span><b class="serif" style="font-size:24px">${Study.weekFocus()} dk</b><small class="mu">bu hafta odak · sayacı aç</small></button>
        <button class="card big col" data-a="sTab" data-v="exams" style="gap:4px;color:inherit;text-align:left;padding:14px"><span class="ac">${ic('cal', 22)}</span>${ne ? `<b class="serif" style="font-size:24px">${U.diffDays(tk, ne.date) === 0 ? 'Bugün' : U.diffDays(tk, ne.date) + ' gün'}</b><small class="mu" style="overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${U.esc(ne.title)}</small>` : '<b class="serif" style="font-size:20px">Sınav yok</b><small class="mu">eklemek için dokun</small>'}</button>
      </div>
      <div class="chips">${chip('courses', 'Dersler')}${chip('hw', 'Ödevler')}${chip('exams', 'Sınavlar')}${chip('plan', 'Program')}${chip('skills', 'Beceriler')}</div>
      ${body}
    </div>`;
  },
  acts: {
    sTab(t) { App.cur.entry.params.tab = t.dataset.v; App.forceRefresh(); },
    sOpen(t) { App.go('course', { id: t.dataset.id }); },
    sNewCourse() { CourseSheet.open(); },
    sTgl(t) { const x = S.db.tasks.find(y => y.id === t.dataset.id); if (x) { S.toggle(x, x.date); App.forceRefresh(); } },
    sEdit(t) { const x = S.db.tasks.find(y => y.id === t.dataset.id); if (x) TaskSheet.open(x); },
    sAddHw() { StudyAdd.pick('hw'); },
    sAddExam() { StudyAdd.pick('exam'); },
    sAddPlan() { StudyAdd.pick('plan'); },
    skNew() { SkillSheet.open(); },
    skOpen(t) { SkillSheet.open((S.db.skills || []).find(x => x.id === t.dataset.id)); }
  }
};

/* hangi derse eklenecek? */
const StudyAdd = {
  pick(kind, cid) {
    const cs = S.db.courses || [];
    if (!cs.length) { U.toast('Önce bir ders ekle'); CourseSheet.open(); return; }
    const go = id => {
      const c = Study.course(id);
      if (kind === 'hw') TaskSheet.open(null, { course: id, cat: 'ders', date: U.addDays(U.today(), 7), title: '', remind: 1440, kind: 'task' });
      else if (kind === 'exam') TaskSheet.open(null, { course: id, exam: true, kind: 'event', cat: 'ders', date: U.addDays(U.today(), 14), title: (c ? c.name + ' sınavı' : 'Sınav'), remind: 1440 });
      else TaskSheet.open(null, { course: id, cat: 'ders', repeat: 'weekly', date: U.today(), title: (c ? c.name + ' çalışma' : 'Çalışma'), time: '17:00', remind: 0 });
    };
    if (cid || cs.length === 1) return go(cid || cs[0].id);
    const rec = App.sheet(`<h3>Hangi ders?</h3><div class="menu">${cs.map(c => `<button data-a="saPick" data-id="${c.id}"><span class="cdot" style="width:12px;height:12px;background:${c.color}"></span>${U.esc(c.name)}</button>`).join('')}</div>`,
      { acts: { saPick: b => { App.closeSheet(rec); go(b.dataset.id); } } });
  }
};

Screens.course = {
  nav: 'sections',
  render(p) {
    const c = Study.course(p.id);
    if (!c) return '<div class="wrap pad"><p class="mu" style="padding-top:40px">Ders bulunamadı.</p></div>';
    const pct = Study.topicPct(c), topics = c.topics || [];
    const hw = Study.hw(c.id).sort((a, b) => (a.done - b.done) || (a.date < b.date ? -1 : 1));
    const ex = Study.exams(c.id).filter(t => t.date >= U.today()).sort((a, b) => a.date < b.date ? -1 : 1);
    const plan = Study.plan(c.id);
    return `<div class="topbar" style="padding-top:18px"><button class="icbtn box" data-a="back">${ic('back', 20, 1.8)}</button><h1>${U.esc(c.name)}</h1>
      <button class="icbtn box" data-a="cEdit" aria-label="Düzenle">${ic('edit', 19)}</button></div>
    <div class="wrap pad">
      <section class="card big row" style="gap:16px;border-top:3px solid ${c.color}">${U.ring(70, 6, pct, c.color, '%' + Math.round(pct * 100), 16)}
        <div class="col" style="gap:3px"><b style="font-size:15px">Konuların %${Math.round(pct * 100)}'i tamam</b><small class="mu">${topics.filter(x => x.done).length} / ${topics.length} konu · ${Study.focusMin(c.id, 30)} dk odak (30 gün)</small>${c.teacher ? `<small class="mu">${U.esc(c.teacher)}</small>` : ''}</div></section>

      <section class="card big col" style="gap:2px"><div class="row" style="padding-bottom:6px"><h2 class="h2s sp">Konular</h2></div>
        ${topics.map((x, i) => `<div class="task ${x.done ? 'done' : ''}"><button class="chk lg ${x.done ? 'on' : ''}" data-a="tpT" data-i="${i}"></button><div class="tt" style="pointer-events:none"><b>${U.esc(x.v)}</b></div><button class="icbtn" data-a="tpDel" data-i="${i}" style="width:36px;color:var(--mu2)">${ic('x', 16)}</button></div>`).join('')}
        <div class="row" style="margin-top:4px;gap:10px"><span style="color:var(--mu2);display:flex">${ic('plus', 20)}</span><input class="bare" id="tpIn" placeholder="Konu ekle, Enter'a bas…" enterkeyhint="done" style="font-size:14.5px;padding:10px 0"></div></section>

      <section class="card big col" style="gap:8px"><div class="row"><h2 class="h2s sp">Sınavlar</h2><button class="btn soft sm" data-a="cAddExam">${ic('plus', 16, 2)}</button></div>
        ${ex.length ? ex.map(examRow).join('') : '<small class="mu">Yaklaşan sınav yok.</small>'}</section>

      <section class="card big col" style="gap:2px"><div class="row" style="padding-bottom:6px"><h2 class="h2s sp">Ödevler</h2><button class="btn soft sm" data-a="cAddHw">${ic('plus', 16, 2)}</button></div>
        ${hw.length ? hw.map(hwRow).join('') : '<small class="mu">Ödev yok.</small>'}</section>

      <section class="card big col" style="gap:8px"><div class="row"><h2 class="h2s sp">Çalışma programı</h2><button class="btn soft sm" data-a="cAddPlan">${ic('plus', 16, 2)}</button></div>
        ${plan.length ? plan.map(t => `<button class="blk" data-a="sEdit" data-id="${t.id}" style="background:color-mix(in srgb,${c.color} 15%,transparent)"><b>${(REPEATS.find(r => r.v === t.repeat) || {}).l} ${t.repeat === 'weekly' ? U.days[U.dow(t.date)] : ''} · ${t.time || 'saatsiz'}</b><small>${U.esc(t.title)}</small></button>`).join('') : '<small class="mu">Bu ders için düzenli çalışma saati yok.</small>'}</section>

      <section class="card big col" style="gap:8px"><h2 class="h2s">Notlar</h2>
        <textarea class="bare grow" rows="2" data-in="cNote" placeholder="Formüller, hatırlatmalar, öğretmenin söyledikleri…" style="font-size:14.5px;line-height:1.6">${U.esc(c.note || '')}</textarea></section>
      <button class="btn soft" data-a="cFocus">${ic('timer', 18)} Bu ders için odak sayacını başlat</button>
    </div>`;
  },
  mount(el, p) {
    App.growAll(el);
    const inp = el.querySelector('#tpIn'); if (!inp) return;
    inp.addEventListener('keydown', e => {
      if (e.key !== 'Enter' || !inp.value.trim()) return;
      const c = Study.course(p.id); c.topics = c.topics || []; c.topics.push({ id: U.id(), v: inp.value.trim(), done: false }); c.updated = Date.now(); S.touch({ quiet: true });
      inp.value = ''; inp.blur(); App.forceRefresh(); setTimeout(() => { const i2 = document.getElementById('tpIn'); if (i2) i2.focus(); }, 60);
    });
  },
  acts: {
    tpT(t) { const c = Study.course(App.cur.params.id); const x = c.topics[+t.dataset.i]; x.done = !x.done; c.updated = Date.now(); U.vibrate(10); S.touch(); App.forceRefresh(); },
    tpDel(t) { const c = Study.course(App.cur.params.id); c.topics.splice(+t.dataset.i, 1); c.updated = Date.now(); S.touch(); App.forceRefresh(); },
    cEdit() { CourseSheet.open(Study.course(App.cur.params.id)); },
    cAddHw() { StudyAdd.pick('hw', App.cur.params.id); },
    cAddExam() { StudyAdd.pick('exam', App.cur.params.id); },
    cAddPlan() { StudyAdd.pick('plan', App.cur.params.id); },
    cNote: U.debounce(t => { const c = Study.course(App.cur.params.id); if (c) { c.note = t.value; c.updated = Date.now(); S.touch({ quiet: true }); } }, 500),
    cFocus() { S.sync.pomoCourse = App.cur.params.id; S.saveSync(); App.go('pomodoro'); },
    sTgl(t) { const x = S.db.tasks.find(y => y.id === t.dataset.id); if (x) { S.toggle(x, x.date); App.forceRefresh(); } },
    sEdit(t) { const x = S.db.tasks.find(y => y.id === t.dataset.id); if (x) TaskSheet.open(x); }
  }
};

const CourseSheet = {
  open(c) {
    const isNew = !c;
    const f = Object.assign({ name: '', color: COURSE_COLORS[(S.db.courses || []).length % COURSE_COLORS.length], teacher: '' }, c || {});
    const draw = () => `<div class="row"><h3 class="sp">${isNew ? 'Yeni ders' : 'Dersi düzenle'}</h3>${!isNew ? `<button class="icbtn" data-a="csDel" style="color:#F19AA2">${ic('trash', 20)}</button>` : ''}</div>
      <input class="inp" id="csN" value="${U.esc(f.name)}" placeholder="Ders adı (ör. Matematik)">
      <input class="inp" id="csT" value="${U.esc(f.teacher || '')}" placeholder="Öğretmen / not (isteğe bağlı)">
      <div class="swatches">${COURSE_COLORS.map(x => `<button class="${x === f.color ? 'on' : ''}" data-a="csC" data-v="${x}" style="background:${x}"></button>`).join('')}</div>
      <button class="btn wide" data-a="csSave">${isNew ? 'Ekle' : 'Kaydet'}</button>`;
    const grab = () => { f.name = rec.sh.querySelector('#csN').value; f.teacher = rec.sh.querySelector('#csT').value; };
    const rec = App.sheet(draw(), {
      mount: sh => { if (isNew) setTimeout(() => sh.querySelector('#csN').focus(), 300); },
      acts: {
        csC: b => { grab(); f.color = b.dataset.v; App.setSheet(rec, draw()); },
        csSave: () => {
          grab(); if (!f.name.trim()) return U.toast('Ders adını yaz');
          if (isNew) { const nc = Study.newCourse({ name: f.name.trim(), color: f.color, teacher: f.teacher.trim() }); App.closeSheet(rec); App.go('course', { id: nc.id }); }
          else { Object.assign(c, { name: f.name.trim(), color: f.color, teacher: f.teacher.trim(), updated: Date.now() }); S.touch(); App.closeSheet(rec); }
        },
        csDel: async () => {
          App.closeSheet(rec);
          if (await App.confirm('Ders silinsin mi? Ödev ve sınavlar ajandada kalır.', 'Sil', true)) {
            for (const t of S.db.tasks) if (t.course === c.id) { delete t.course; t.updated = Date.now(); }
            S.remove('courses', c.id); App.back();
          }
        }
      }
    });
  }
};

const SkillSheet = {
  open(x) {
    const isNew = !x;
    const f = Object.assign({ name: '', progress: 0, note: '', color: COURSE_COLORS[(S.db.skills || []).length % COURSE_COLORS.length] }, x || {});
    const rec = App.sheet(`<div class="row"><h3 class="sp">${isNew ? 'Yeni beceri' : U.esc(f.name)}</h3>${!isNew ? `<button class="icbtn" data-a="skDel" style="color:#F19AA2">${ic('trash', 20)}</button>` : ''}</div>
      <input class="inp" id="skN" value="${U.esc(f.name)}" placeholder="ör. Gitar, İspanyolca, Python">
      <div class="field"><label>İlerleme: <span id="skPv">%${f.progress}</span></label><input type="range" id="skP" min="0" max="100" step="5" value="${f.progress}" style="width:100%;accent-color:var(--ac)"></div>
      <textarea class="inp grow" id="skNt" rows="2" placeholder="Kaynaklar, notlar, sıradaki adım" style="min-height:0">${U.esc(f.note || '')}</textarea>
      <button class="btn wide" data-a="skSave">${isNew ? 'Ekle' : 'Kaydet'}</button>`, {
      mount: sh => { const r = sh.querySelector('#skP'); r.oninput = () => sh.querySelector('#skPv').textContent = '%' + r.value; },
      acts: {
        skSave: () => {
          const sh = rec.sh, name = sh.querySelector('#skN').value.trim(); if (!name) return U.toast('Bir ad yaz');
          const data = { name, progress: +sh.querySelector('#skP').value, note: sh.querySelector('#skNt').value, updated: Date.now() };
          if (isNew) S.db.skills.push(Object.assign({ id: 's' + U.id(), color: f.color, created: Date.now() }, data)); else Object.assign(x, data);
          S.touch(); App.closeSheet(rec);
        },
        skDel: async () => { App.closeSheet(rec); if (await App.confirm('Beceri silinsin mi?', 'Sil', true)) S.remove('skills', x.id); }
      }
    });
  }
};
