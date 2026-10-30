/* Alışkanlıklar */
'use strict';

Screens.habits = {
  nav: 'sections',
  render() {
    const tk = U.today();
    const list = S.db.habits.filter(h => !h.archived);
    const arch = S.db.habits.filter(h => h.archived);
    const wd = U.weekDays(tk);
    const doneToday = list.filter(h => S.habitDone(h, tk)).length;
    return `<div class="topbar" style="padding-top:18px">${App.stack.length > 1 ? `<button class="icbtn box" data-a="back">${ic('back', 20, 1.8)}</button>` : ''}<h1>Alışkanlıklar</h1>
      <button class="icbtn box" data-a="hNew" aria-label="Yeni alışkanlık">${ic('plus', 20, 2)}</button></div>
    <div class="wrap pad">
      <section class="card big row" style="gap:16px">${U.ring(64, 6, list.length ? doneToday / list.length : 0, 'var(--ac)', doneToday + '/' + list.length, 16)}
        <div class="col" style="gap:2px"><b style="font-size:15px">Bugün</b><span class="mu" style="font-size:12.5px">${doneToday === list.length && list.length ? 'Hepsini tamamladın, harika.' : 'Daireye dokunarak işaretle.'}</span></div></section>
      ${list.map(h => {
        const c = S.habitCount(h, tk), t = h.target || 1, st = S.habitStreak(h);
        return `<div class="habit">
          <button class="hb" data-a="hOpen" data-id="${h.id}"><b>${U.esc(h.name)}</b>
            <span class="mu" style="font-size:11.5px">${t > 1 ? `${c} / ${t} ${U.esc(h.unit || '')} · ` : ''}${st ? `<span style="color:var(--gold)">${ic('flame', 12, 2)} ${st} gün seri</span>` : 'Seri başlamadı'} · haftada ${h.weekly || 7}</span>
            <span class="dots7">${wd.map(d => `<i style="${S.habitDone(h, d) ? 'background:' + h.color : S.habitCount(h, d) ? `background:color-mix(in srgb,${h.color} 40%,transparent)` : ''}${d === tk ? ';outline:1px solid var(--mu2)' : ''}"></i>`).join('')}</span></button>
          <button class="hbtn" data-a="hInc" data-id="${h.id}" aria-label="İşaretle">${U.ring(48, 4, c / t, h.color, S.habitDone(h, tk) ? `<span style="color:${h.color}">${ic('check', 20, 2.6)}</span>` : (t > 1 ? '+' : ''), 18)}</button>
        </div>`;
      }).join('')}
      ${!list.length ? `<div class="col" style="align-items:center;padding:40px 20px;gap:12px;text-align:center"><span class="mu">Henüz alışkanlık yok.</span><button class="btn soft" data-a="hNew">Alışkanlık ekle</button></div>` : ''}
      ${arch.length ? `<div class="lbl">Arşiv</div>${arch.map(h => `<button class="habit" data-a="hOpen" data-id="${h.id}" style="color:inherit;opacity:.6"><b class="sp" style="text-align:left">${U.esc(h.name)}</b><span class="mu">›</span></button>`).join('')}` : ''}
    </div>`;
  },
  acts: {
    hInc(t) { const h = S.db.habits.find(x => x.id === t.dataset.id); if (h) S.habitInc(h, U.today()); },
    hOpen(t) { App.go('habit', { id: t.dataset.id }); },
    hNew() { HabitSheet.open(); }
  }
};

Screens.habit = {
  nav: 'sections',
  render(p) {
    const h = S.db.habits.find(x => x.id === p.id);
    if (!h) return '<div class="wrap pad"><p class="mu">Bulunamadı.</p></div>';
    const tk = U.today();
    /* son 105 gün ısı haritası */
    const days = []; for (let i = 104; i >= 0; i--) days.push(U.addDays(tk, -i));
    const done30 = days.slice(-30).filter(d => S.habitDone(h, d)).length;
    let best = 0, run = 0;
    for (const d of days) { if (S.habitDone(h, d)) { run++; best = Math.max(best, run); } else run = 0; }
    return `<div class="topbar" style="padding-top:18px"><button class="icbtn box" data-a="back">${ic('back', 20, 1.8)}</button><h1>${U.esc(h.name)}</h1>
      <button class="icbtn box" data-a="hEdit" aria-label="Düzenle">${ic('edit', 19)}</button></div>
    <div class="wrap pad">
      <div class="g3">
        <div class="card col" style="align-items:center;gap:4px;padding:14px"><b class="serif" style="font-size:28px;color:var(--gold)">${S.habitStreak(h)}</b><small class="mu">güncel seri</small></div>
        <div class="card col" style="align-items:center;gap:4px;padding:14px"><b class="serif" style="font-size:28px">${best}</b><small class="mu">en uzun seri</small></div>
        <div class="card col" style="align-items:center;gap:4px;padding:14px"><b class="serif" style="font-size:28px">%${Math.round(done30 / 30 * 100)}</b><small class="mu">son 30 gün</small></div>
      </div>
      <section class="card big col" style="gap:10px"><span class="lbl">Son 15 hafta</span>
        <div class="heat">${days.map(d => { const c = S.habitCount(h, d), v = Math.min(1, c / (h.target || 1)); return `<i style="${v ? `background:color-mix(in srgb,${h.color} ${Math.round(25 + v * 75)}%,transparent)` : ''}${d === tk ? ';outline:1px solid var(--tx)' : ''}"></i>`; }).join('')}</div></section>
      <section class="card big col" style="gap:8px"><span class="lbl">Bu hafta</span>
        ${U.weekDays(tk).map((d, i) => `<div class="row" style="min-height:40px"><span style="width:84px">${U.days[i]}</span><span class="sp mu" style="font-size:12px">${S.habitCount(h, d)} / ${h.target || 1}</span>
          <button class="btn ghost sm" data-a="hMinus" data-k="${d}" ${d > tk ? 'disabled' : ''}>−</button><button class="btn soft sm" data-a="hPlus" data-k="${d}" ${d > tk ? 'disabled' : ''}>+</button></div>`).join('')}
      </section>
      ${h.remind ? `<div class="card row">${ic('bell', 18)}<span class="sp">Her gün ${h.remind} hatırlatma</span></div>` : ''}
    </div>`;
  },
  acts: {
    hEdit() { HabitSheet.open(S.db.habits.find(x => x.id === App.cur.params.id)); },
    hPlus(t) { const h = S.db.habits.find(x => x.id === App.cur.params.id); S.habitInc(h, t.dataset.k, 1); },
    hMinus(t) { const h = S.db.habits.find(x => x.id === App.cur.params.id); S.habitInc(h, t.dataset.k, -1); }
  }
};

const HABIT_COLORS = ['#E89AAD', '#8FB7C9', '#D9B47A', '#C9B4E0', '#9CC0A6', '#E07A86', '#F1C27D', '#7FA6D8'];
const HabitSheet = {
  open(h) {
    const isNew = !h;
    const f = Object.assign({ name: '', color: HABIT_COLORS[S.db.habits.length % HABIT_COLORS.length], target: 1, weekly: 7, unit: '', remind: '' }, h || {});
    const draw = () => `<div class="row"><h3 class="sp">${isNew ? 'Yeni alışkanlık' : 'Alışkanlığı düzenle'}</h3></div>
      <input class="inp" id="hName" value="${U.esc(f.name)}" placeholder="ör. Kitap okumak, Meditasyon">
      <div class="field"><label>Renk</label><div class="swatches">${HABIT_COLORS.map(c => `<button class="${c === f.color ? 'on' : ''}" data-a="hCol" data-v="${c}" style="background:${c}"></button>`).join('')}</div></div>
      <div class="g2" style="gap:10px"><div class="field"><label>Günde kaç kez</label><input class="inp" type="number" id="hTarget" min="1" max="50" value="${f.target}"></div>
        <div class="field"><label>Birim</label><input class="inp" id="hUnit" value="${U.esc(f.unit || '')}" placeholder="ör. bardak, sayfa"></div></div>
      <div class="field"><label>Haftalık hedef</label><div class="opts">${[1, 2, 3, 4, 5, 6, 7].map(n => `<button class="${f.weekly === n ? 'on' : ''}" data-a="hWk" data-v="${n}">${n === 7 ? 'Her gün' : n + ' gün'}</button>`).join('')}</div></div>
      <div class="field"><label>Hatırlatma saati</label><input class="inp" type="time" id="hRem" value="${f.remind || ''}"></div>
      <div class="row">${!isNew ? `<button class="btn ghost sp" data-a="hArch">${h.archived ? 'Arşivden çıkar' : 'Arşivle'}</button>${h.kind !== 'water' ? `<button class="btn danger" data-a="hDel">${ic('trash', 18)}</button>` : ''}` : ''}<button class="btn sp" data-a="hSave">${isNew ? 'Ekle' : 'Kaydet'}</button></div>`;
    const grab = () => { const s = rec.sh; f.name = s.querySelector('#hName').value; f.target = Math.max(1, +s.querySelector('#hTarget').value || 1); f.unit = s.querySelector('#hUnit').value; f.remind = s.querySelector('#hRem').value; };
    const rec = App.sheet(draw(), {
      mount: sh => { if (isNew) setTimeout(() => sh.querySelector('#hName').focus(), 300); },
      acts: {
        hCol: b => { grab(); f.color = b.dataset.v; App.setSheet(rec, draw()); },
        hWk: b => { grab(); f.weekly = +b.dataset.v; App.setSheet(rec, draw()); },
        hArch: () => { h.archived = !h.archived; h.updated = Date.now(); S.touch(); App.closeSheet(rec); },
        hDel: async () => { App.closeSheet(rec); if (await App.confirm('Alışkanlık ve tüm geçmişi silinsin mi?', 'Sil', true)) { S.remove('habits', h.id); if (App.cur.entry.name === 'habit') App.back(); } },
        hSave: async () => {
          grab(); if (!f.name.trim()) return U.toast('Bir ad yaz');
          const data = { name: f.name.trim(), color: f.color, target: f.target, weekly: f.weekly, unit: f.unit.trim(), remind: f.remind, updated: Date.now() };
          if (isNew) S.newHabit(data); else { Object.assign(h, data); if (h.kind === 'water') S.set.waterTarget = h.target; S.touch(); }
          App.closeSheet(rec);
          if (f.remind && N && !Notify.allowed()) Notify.ask();
        }
      }
    });
  }
};
