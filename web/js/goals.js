/* Hedefler ve kişisel gelişim + hayal panosu */
'use strict';

const PERIODS = [{ v: 'week', l: 'Haftalık' }, { v: 'month', l: 'Aylık' }, { v: 'year', l: 'Yıllık' }, { v: 'free', l: 'Süresiz' }];
const GOAL_COLORS = ['#E89AAD', '#D9B47A', '#8FB7C9', '#C9B4E0', '#9CC0A6', '#E07A86', '#F1C27D', '#7FA6D8'];
const perOf = v => PERIODS.find(p => p.v === v) || PERIODS[1];

function goalCard(g) {
  const pct = S.goalPct(g), end = S.goalEnd(g), tk = U.today();
  const left = end ? U.diffDays(tk, end) : null;
  const stepsN = (g.steps || []).length, stepsD = (g.steps || []).filter(x => x.done).length;
  return `<button class="gcard" data-a="gOpen" data-id="${g.id}">
    ${g.cover ? `<div class="gcv" style="height:92px;background-image:url('${S.photoUrl(g.cover)}')"></div>` : `<div style="height:5px;background:linear-gradient(90deg,${g.color},transparent)"></div>`}
    <div class="col" style="gap:6px;padding:12px 14px 14px">
      <div class="row" style="gap:6px"><span class="gtag" style="color:${g.color};background:color-mix(in srgb,${g.color} 16%,transparent)">${perOf(g.period).l}</span>
        ${g.done ? `<span class="gtag" style="color:var(--sage);background:rgba(156,192,166,.16)">Tamamlandı</span>` : left != null ? `<span class="mu" style="font-size:11px">${left < 0 ? 'Süresi geçti' : left === 0 ? 'Bugün bitiyor' : left + ' gün kaldı'}</span>` : ''}
        <span class="sp"></span>${g.fav ? `<span style="color:var(--ac)">${icf('heart', 13)}</span>` : ''}</div>
      <b class="serif" style="font-size:19px;line-height:1.15;text-align:left">${U.esc(g.title)}</b>
      <div class="row" style="gap:10px"><div class="bar sp"><i style="width:${Math.round(pct * 100)}%;background:${g.color}"></i></div><b style="font-size:12px">%${Math.round(pct * 100)}</b></div>
      ${stepsN ? `<small class="mu" style="font-size:11px;text-align:left">${stepsD} / ${stepsN} adım</small>` : ''}
    </div></button>`;
}

Screens.goals = {
  nav: 'sections',
  render(p) {
    const tab = p.tab || 'active';
    const tk = U.today();
    let list = S.db.goals.filter(g => !g.archived);
    if (tab === 'active') list = list.filter(g => !g.done);
    else if (tab === 'done') list = S.db.goals.filter(g => g.done);
    else list = list.filter(g => !g.done && g.period === tab);
    list.sort((a, b) => (b.fav - a.fav) || ((S.goalEnd(a) || '9999') < (S.goalEnd(b) || '9999') ? -1 : 1));
    const act = S.db.goals.filter(g => !g.done && !g.archived);
    const avg = act.length ? act.reduce((a, g) => a + S.goalPct(g), 0) / act.length : 0;
    const doneY = S.db.goals.filter(g => g.done && g.doneAt && new Date(g.doneAt).getFullYear() === new Date().getFullYear()).length;
    const vis = S.db.vision.slice(0, 6);
    const chip = (v, l, n) => `<button class="chip ${tab === v ? 'on' : ''}" data-a="gTab" data-v="${v}">${l}${n != null ? ` <span style="opacity:.7">${n}</span>` : ''}</button>`;
    return `<div class="topbar" style="padding-top:18px">${App.stack.length > 1 ? `<button class="icbtn box" data-a="back">${ic('back', 20, 1.8)}</button>` : ''}<h1>Hedefler</h1>
      <button class="icbtn box" data-a="gNew" aria-label="Yeni hedef">${ic('plus', 20, 2)}</button></div>
    <div class="wrap pad">
      <section class="card big row" style="gap:16px">${U.ring(64, 6, avg, 'var(--ac)', '%' + Math.round(avg * 100), 15)}
        <div class="col" style="gap:3px"><b style="font-size:15px">${act.length} aktif hedef</b><span class="mu" style="font-size:12.5px">Bu yıl ${doneY} hedef tamamladın</span></div></section>

      <section class="card big col" style="gap:10px">
        <div class="row"><h2 class="h2s sp">Hayal panosu</h2><button class="btn soft sm" data-a="go" data-to="vision">${vis.length ? 'Tümü' : 'Oluştur'}</button></div>
        ${vis.length ? `<div class="vgrid">${vis.map((v, i) => `<button data-a="go" data-to="vision" style="background-image:url('${S.photoUrl(v.photo)}');${i === 0 ? 'grid-row:span 2' : ''}"></button>`).join('')}</div>`
        : `<button data-a="go" data-to="vision" class="mu" style="background:none;border:1.5px dashed var(--line);border-radius:14px;padding:22px;font-size:13px;color:var(--mu)">Hayallerini fotoğraflarla bir panoda topla</button>`}
      </section>

      <div class="chips">${chip('active', 'Aktif', act.length)}${chip('week', 'Haftalık')}${chip('month', 'Aylık')}${chip('year', 'Yıllık')}${chip('free', 'Süresiz')}${chip('done', 'Tamamlananlar', S.db.goals.filter(g => g.done).length)}</div>
      ${list.length ? `<div class="col" style="gap:10px">${list.map(goalCard).join('')}</div>`
        : `<div class="col" style="align-items:center;padding:36px 20px;gap:12px;text-align:center"><span style="color:var(--ac)">${ic('flag', 38, 1.3)}</span><span class="mu">${tab === 'done' ? 'Henüz tamamlanan hedef yok.' : 'Burada hedef yok. Küçük bir adımla başlayalım mı?'}</span>${tab !== 'done' ? '<button class="btn soft" data-a="gNew">Hedef ekle</button>' : ''}</div>`}
      ${S.db.goals.some(g => g.archived && !g.done) ? `<button class="btn ghost sm" data-a="gArchList" style="align-self:center">Arşivdeki hedefler</button>` : ''}
    </div>`;
  },
  acts: {
    gTab(t) { App.cur.entry.params.tab = t.dataset.v; App.forceRefresh(); },
    gNew() { GoalSheet.open(null, { period: ['week', 'month', 'year', 'free'].includes(App.cur.params.tab) ? App.cur.params.tab : 'month' }); },
    gOpen(t) { App.go('goal', { id: t.dataset.id }); },
    gArchList() {
      const list = S.db.goals.filter(g => g.archived && !g.done);
      const rec = App.sheet(`<h3>Arşiv</h3><div class="menu">${list.map(g => `<button data-a="gaOpen" data-id="${g.id}">${ic('flag', 20)}${U.esc(g.title)}</button>`).join('')}</div>`,
        { acts: { gaOpen: b => { App.closeSheet(rec); App.go('goal', { id: b.dataset.id }); } } });
    }
  }
};

Screens.goal = {
  nav: 'sections',
  get(p) { return S.db.goals.find(g => g.id === p.id); },
  render(p) {
    const g = Screens.goal.get(p);
    if (!g) return '<div class="wrap pad"><p class="mu" style="padding-top:40px">Hedef bulunamadı.</p></div>';
    const pct = S.goalPct(g), end = S.goalEnd(g), tk = U.today();
    const left = end ? U.diffDays(tk, end) : null;
    const steps = g.steps || [];
    return `<div style="position:relative">
      <div class="cover" style="height:170px;${g.cover ? `background-image:url('${S.photoUrl(g.cover)}')` : `background:linear-gradient(150deg,${g.color},color-mix(in srgb,${g.color} 30%,var(--bg)))`}"></div>
      <div class="row" style="position:absolute;top:0;left:0;right:0;padding:14px 10px">
        <button class="icbtn box" data-a="back" style="background:rgba(0,0,0,.4);color:#fff">${ic('back', 20, 1.8)}</button><span class="sp"></span>
        <button class="icbtn box" data-a="gFav" style="background:rgba(0,0,0,.4);color:${g.fav ? 'var(--ac)' : '#fff'}">${g.fav ? icf('heart', 19) : ic('heart', 19)}</button>
        <button class="icbtn box" data-a="gEdit" style="background:rgba(0,0,0,.4);color:#fff">${ic('edit', 19)}</button>
      </div>
      <div class="wrap pad" style="margin-top:-46px">
        <section class="card big col" style="gap:12px;background:var(--bg2)">
          <div class="row" style="gap:14px">${U.ring(70, 6, pct, g.color, '%' + Math.round(pct * 100), 16)}
            <div class="col sp" style="gap:4px"><span class="gtag" style="align-self:flex-start;color:${g.color};background:color-mix(in srgb,${g.color} 16%,transparent)">${perOf(g.period).l}</span>
              <h1 class="serif" style="font-size:24px;line-height:1.15">${U.esc(g.title)}</h1>
              <small class="mu">${g.done ? 'Tamamlandı · ' + new Date(g.doneAt).toLocaleDateString('tr-TR') : end ? U.fmt(end, 'full') + (left != null ? ' · ' + (left < 0 ? 'süresi geçti' : left + ' gün kaldı') : '') : 'Süresiz'}</small></div></div>
          ${g.why ? `<p class="serif" style="margin:0;font-style:italic;font-size:17px;line-height:1.4;color:var(--tx2)">“${U.esc(g.why)}”</p>` : ''}
        </section>

        <section class="card big col" style="gap:2px">
          <div class="row" style="padding-bottom:6px"><h2 class="h2s sp">Adımlar</h2><span class="mu" style="font-size:12px">${steps.filter(x => x.done).length} / ${steps.length}</span></div>
          ${steps.map((st, i) => `<div class="task ${st.done ? 'done' : ''}"><button class="chk lg ${st.done ? 'on' : ''}" data-a="gStep" data-i="${i}"></button><div class="tt" style="pointer-events:none"><b>${U.esc(st.v)}</b></div><button class="icbtn" data-a="gStepDel" data-i="${i}" style="width:36px;color:var(--mu2)">${ic('x', 16)}</button></div>`).join('')}
          <div class="row" style="margin-top:4px;gap:10px"><span style="color:var(--mu2);display:flex">${ic('plus', 20)}</span><input class="bare" id="gStepIn" placeholder="Küçük bir adım ekle, Enter'a bas…" enterkeyhint="done" style="font-size:14.5px;padding:10px 0"></div>
          ${!steps.length ? `<div class="col" style="gap:8px;margin-top:10px"><span class="lbl">Ya da ilerlemeyi elle ayarla</span><input type="range" min="0" max="100" step="5" value="${g.progress || 0}" data-ch="gProg" style="width:100%;accent-color:${g.color}"></div>` : ''}
        </section>

        <div class="row" style="gap:8px">
          ${g.done ? `<button class="btn ghost sp" data-a="gUndone">Tamamlanmadı yap</button>` : `<button class="btn sp" data-a="gDone">${ic('check', 18, 2.4)} Hedefe ulaştım</button>`}
        </div>
        <div class="row" style="gap:8px">
          <button class="btn ghost sp" data-a="gTask">${ic('calChk', 18)} Ajandaya görev ekle</button>
          <button class="btn ghost" data-a="gArch">${ic('archive', 18)}</button>
          <button class="btn danger" data-a="gDel">${ic('trash', 18)}</button>
        </div>
      </div></div>`;
  },
  mount(el, p) {
    const inp = el.querySelector('#gStepIn'); if (!inp) return;
    inp.addEventListener('keydown', e => {
      if (e.key !== 'Enter' || !inp.value.trim()) return;
      const g = Screens.goal.get(p); g.steps = g.steps || []; g.steps.push({ id: U.id(), v: inp.value.trim(), done: false }); g.updated = Date.now(); S.touch({ quiet: true });
      inp.value = ''; inp.blur(); App.forceRefresh();
      setTimeout(() => { const i2 = document.getElementById('gStepIn'); if (i2) i2.focus(); }, 60);
    });
  },
  acts: {
    gStep(t) { const g = Screens.goal.get(App.cur.params); const st = g.steps[+t.dataset.i]; st.done = !st.done; g.updated = Date.now(); U.vibrate(10); S.touch(); if (S.goalPct(g) >= 1 && !g.done) U.toast('Tüm adımlar tamam! "Hedefe ulaştım"a basabilirsin.'); App.forceRefresh(); },
    gStepDel(t) { const g = Screens.goal.get(App.cur.params); g.steps.splice(+t.dataset.i, 1); g.updated = Date.now(); S.touch(); App.forceRefresh(); },
    gProg(t) { const g = Screens.goal.get(App.cur.params); g.progress = +t.value; g.updated = Date.now(); S.touch(); App.forceRefresh(); },
    gDone() { const g = Screens.goal.get(App.cur.params); g.done = true; g.doneAt = Date.now(); g.updated = Date.now(); U.vibrate(40); S.touch(); U.toast('Tebrikler! Hedef tamamlananlara eklendi.'); App.forceRefresh(); },
    gUndone() { const g = Screens.goal.get(App.cur.params); g.done = false; g.doneAt = null; g.updated = Date.now(); S.touch(); App.forceRefresh(); },
    gFav() { const g = Screens.goal.get(App.cur.params); g.fav = !g.fav; g.updated = Date.now(); S.touch(); App.forceRefresh(); },
    gEdit() { GoalSheet.open(Screens.goal.get(App.cur.params)); },
    gArch() { const g = Screens.goal.get(App.cur.params); g.archived = !g.archived; g.updated = Date.now(); S.touch(); U.toast(g.archived ? 'Arşivlendi' : 'Arşivden çıkarıldı'); if (g.archived) App.back(); },
    async gDel() { const g = Screens.goal.get(App.cur.params); if (await App.confirm('Hedef silinsin mi?', 'Sil', true)) { S.remove('goals', g.id); App.back(); } },
    gTask() { const g = Screens.goal.get(App.cur.params); TaskSheet.open(null, { title: g.title, date: U.today(), goal: g.id }); }
  }
};

const GoalSheet = {
  open(g, defaults) {
    const isNew = !g;
    const f = Object.assign({ title: '', period: 'month', due: '', color: GOAL_COLORS[S.db.goals.length % GOAL_COLORS.length], why: '', cover: null }, defaults || {}, g || {});
    const draw = () => `<h3>${isNew ? 'Yeni hedef' : 'Hedefi düzenle'}</h3>
      <textarea class="inp grow" id="gT" rows="1" placeholder="Neyi başarmak istiyorsun?" style="font-size:16px;min-height:0">${U.esc(f.title)}</textarea>
      <div class="field"><label>Dönem</label><div class="opts">${PERIODS.map(x => `<button class="${f.period === x.v ? 'on' : ''}" data-a="gsP" data-v="${x.v}">${x.l}</button>`).join('')}</div></div>
      <div class="field"><label>Son tarih (isteğe bağlı)</label><input type="date" class="inp" id="gD" value="${f.due || ''}"></div>
      <div class="field"><label>Neden önemli?</label><textarea class="inp grow" id="gW" rows="2" placeholder="Kendine kısa bir not" style="min-height:0">${U.esc(f.why || '')}</textarea></div>
      <div class="field"><label>Renk</label><div class="swatches">${GOAL_COLORS.map(c => `<button class="${c === f.color ? 'on' : ''}" data-a="gsC" data-v="${c}" style="background:${c}"></button>`).join('')}</div></div>
      <div class="row" style="gap:10px"><button class="btn ghost sp" data-a="gsCover">${ic('image', 18)} ${f.cover ? 'Fotoğrafı değiştir' : 'Fotoğraf ekle'}</button>${f.cover ? `<span style="width:52px;height:42px;border-radius:10px;background:url('${S.photoUrl(f.cover)}') center/cover"></span>` : ''}</div>
      <button class="btn wide" data-a="gsSave">${isNew ? 'Ekle' : 'Kaydet'}</button>`;
    const grab = () => { const s = rec.sh; f.title = s.querySelector('#gT').value; f.due = s.querySelector('#gD').value; f.why = s.querySelector('#gW').value; };
    const rec = App.sheet(draw(), {
      mount: sh => { if (isNew) setTimeout(() => sh.querySelector('#gT').focus(), 300); },
      acts: {
        gsP: b => { grab(); f.period = b.dataset.v; App.setSheet(rec, draw()); },
        gsC: b => { grab(); f.color = b.dataset.v; App.setSheet(rec, draw()); },
        gsCover: async () => { grab(); const ids = await S.addPhotos(false); if (ids[0]) f.cover = ids[0]; App.setSheet(rec, draw()); },
        gsSave: () => {
          grab(); if (!f.title.trim()) return U.toast('Hedefini yaz');
          const data = { title: f.title.trim(), period: f.period, due: f.due || null, why: f.why.trim(), color: f.color, cover: f.cover, updated: Date.now() };
          if (isNew) { const ng = S.newGoal(Object.assign(data, { start: U.today() })); App.closeSheet(rec); App.go('goal', { id: ng.id }); }
          else { Object.assign(g, data); S.touch(); App.closeSheet(rec); }
        }
      }
    });
  }
};

/* ---------- hayal panosu ---------- */
Screens.vision = {
  nav: 'sections',
  render() {
    const v = S.db.vision;
    return `<div class="topbar" style="padding-top:18px"><button class="icbtn box" data-a="back">${ic('back', 20, 1.8)}</button><h1>Hayal panosu</h1>
      <button class="icbtn box" data-a="vAdd" aria-label="Fotoğraf ekle">${ic('plus', 20, 2)}</button></div>
    <div class="wrap pad">
      ${v.length ? `<div class="vboard">${v.map(x => `<button class="vitem" data-a="vOpen" data-id="${x.id}"><img src="${S.photoUrl(x.photo)}" alt="">${x.caption ? `<span>${U.esc(x.caption)}</span>` : ''}</button>`).join('')}</div>`
        : `<div class="col" style="align-items:center;padding:50px 20px;gap:14px;text-align:center"><span style="color:var(--ac)">${ic('spark', 44, 1.2)}</span><p class="mu" style="margin:0;line-height:1.6">Gitmek istediğin yerler, olmak istediğin hâl, sahip olmak istediğin şeyler… Fotoğraflarını ekle, altına kısa bir söz yaz.</p><button class="btn soft" data-a="vAdd">Fotoğraf ekle</button></div>`}
    </div>`;
  },
  acts: {
    async vAdd() {
      const ids = await S.addPhotos(true);
      for (const id of ids) S.db.vision.unshift({ id: 'v' + U.id(), photo: id, caption: '', updated: Date.now() });
      if (ids.length) { S.touch(); if (ids.length === 1) Screens.vision.acts.vOpen({ dataset: { id: S.db.vision[0].id } }); }
    },
    vOpen(t) {
      const x = S.db.vision.find(y => y.id === t.dataset.id); if (!x) return;
      const rec = App.sheet(`<img src="${S.photoUrl(x.photo)}" style="width:100%;border-radius:16px;display:block">
        <input class="inp" id="vC" value="${U.esc(x.caption || '')}" placeholder="Bu fotoğraf neyi temsil ediyor?">
        <div class="row"><button class="btn danger" data-a="vDel">${ic('trash', 18)}</button><button class="btn sp" data-a="vSave">Kaydet</button></div>`, {
        acts: {
          vSave: () => { x.caption = rec.sh.querySelector('#vC').value.trim(); x.updated = Date.now(); S.touch(); App.closeSheet(rec); },
          vDel: async () => { App.closeSheet(rec); if (await App.confirm('Panodan kaldırılsın mı?', 'Kaldır', true)) S.remove('vision', x.id); }
        }
      });
    }
  }
};
