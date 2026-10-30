/* Günlüğüm */
'use strict';

Screens.journal = {
  nav: 'sections',
  render(p) {
    const k = p.k || U.today(); p.k = k;
    const d = S.day(k), tk = U.today();
    const gr = d.gratitude || ['', '', ''];
    const md = moodOf(d.mood);
    /* ay ruh hâli haritası */
    const dt = U.parse(k);
    const first = new Date(dt.getFullYear(), dt.getMonth(), 1);
    const startPad = (first.getDay() + 6) % 7;
    const dim = new Date(dt.getFullYear(), dt.getMonth() + 1, 0).getDate();
    let cells = '';
    for (let i = 0; i < startPad; i++) cells += '<i style="background:transparent"></i>';
    for (let i = 1; i <= dim; i++) {
      const x = U.key(new Date(dt.getFullYear(), dt.getMonth(), i));
      const m = moodOf(S.day(x).mood);
      cells += `<button data-a="jDay" data-k="${x}" style="aspect-ratio:1;border-radius:6px;border:${x === k ? '2px solid var(--tx)' : 'none'};background:${m ? m.c : 'var(--card2)'};padding:0;font-size:9px;color:${m ? '#1a1014' : 'var(--mu2)'};font-weight:700">${i}</button>`;
    }
    /* son yazılanlar */
    const recent = Object.entries(S.db.days).filter(([x, v]) => x !== k && (v.journal || v.best || (v.gratitude || []).some(Boolean))).sort((a, b) => a[0] < b[0] ? 1 : -1).slice(0, 8);

    return `<div class="topbar" style="padding-top:18px">${App.stack.length > 1 ? `<button class="icbtn box" data-a="back">${ic('back', 20, 1.8)}</button>` : ''}<h1>Günlüğüm</h1></div>
    <div class="wrap pad">
      <div class="dayhead"><button class="icbtn" data-a="jShift" data-n="-1">${ic('left', 22, 1.8)}</button>
        <div><h1 style="font-size:30px">${U.fmt(k, 'dm')}</h1><small>${U.days[U.dow(k)].toLocaleUpperCase('tr-TR')}${k !== tk ? ' · ' + U.rel(k).toLocaleUpperCase('tr-TR') : ''}</small></div>
        <button class="icbtn" data-a="jShift" data-n="1" ${k >= tk ? 'disabled style="opacity:.3"' : ''}>${ic('right', 22, 1.8)}</button></div>

      <section class="card big col" style="gap:12px"><span class="lbl">Bugün nasıl hissettin?</span>
        <div class="row" style="justify-content:space-between">${MOODS.map(m => `<button data-a="jMood" data-v="${m.v}" style="background:none;border:none;color:var(--tx);display:flex;flex-direction:column;align-items:center;gap:6px;font-size:11px;font-weight:600;opacity:${d.mood && d.mood !== m.v ? .45 : 1}">
          <span style="width:${d.mood === m.v ? 42 : 34}px;height:${d.mood === m.v ? 42 : 34}px;border-radius:50%;background:${m.c};transition:all .2s"></span>${m.l}</button>`).join('')}</div></section>

      <section class="moment"><span class="lbl" style="color:var(--acTx);opacity:.85">Günün en güzel olayı</span>
        <textarea class="bare grow" rows="1" data-in="jField" data-f="best" placeholder="Bugün seni ne gülümsetti?">${U.esc(d.best || '')}</textarea></section>

      <section class="card big col" style="gap:10px"><h2 class="h2s">Şükür ettiğim 3 şey</h2>
        ${[0, 1, 2].map(i => `<div class="numl"><span>${i + 1}</span><textarea class="bare grow" rows="1" data-in="jGr" data-i="${i}" placeholder="…" style="font-size:14.5px;line-height:1.5">${U.esc(gr[i] || '')}</textarea></div>`).join('')}</section>

      <section class="card big col" style="gap:10px"><h2 class="h2s">Sevgili günlük,</h2>
        <textarea class="bare grow" rows="5" data-in="jField" data-f="journal" placeholder="Bugün neler oldu, neler düşündün?" style="font-size:15.5px;line-height:1.7;font-family:var(--serif);font-size:18px">${U.esc(d.journal || '')}</textarea>
        <div class="photos">${(d.photos || []).map(id => `<button class="ph" data-a="jPhoto" data-id="${id}" style="background-image:url('${S.photoUrl(id)}')"></button>`).join('')}
          <button class="add" data-a="jAddPhoto">${ic('image', 22, 1.5)}Fotoğraf</button></div></section>

      <section class="card big col" style="gap:10px"><div class="row"><h2 class="h2s sp">${U.months[dt.getMonth()]} ruh hâli</h2>${md ? `<span class="mu" style="font-size:12px">Bugün: ${md.l}</span>` : ''}</div>
        <div class="jcal">${U.daysS.map(x => `<small class="mu" style="font-size:9.5px;text-align:center">${x[0]}</small>`).join('')}${cells}</div>
        <div class="row" style="flex-wrap:wrap;gap:10px">${MOODS.map(m => `<span class="row" style="gap:4px;font-size:10.5px" ><i class="cdot" style="background:${m.c}"></i>${m.l}</span>`).join('')}</div></section>

      ${recent.length ? `<div class="lbl" style="margin-top:6px">Önceki sayfalar</div>${recent.map(([x, v]) => {
        const m = moodOf(v.mood);
        return `<button class="card big col" data-a="jDay" data-k="${x}" style="gap:6px;text-align:left;color:inherit">
          <div class="row"><b class="serif" style="font-size:19px;flex:1">${U.fmt(x, 'long')}</b>${m ? `<span class="cdot" style="width:12px;height:12px;background:${m.c}"></span>` : ''}</div>
          ${v.best ? `<i class="serif" style="font-size:15px;color:var(--ac)">“${U.esc(v.best.slice(0, 100))}”</i>` : ''}
          ${v.journal ? `<span class="mu" style="font-size:13px;line-height:1.5;overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical">${U.esc(v.journal)}</span>` : ''}</button>`;
      }).join('')}` : ''}
    </div>`;
  },
  mount(el) { App.growAll(el); },
  acts: {
    jShift(t) { const p = App.cur.entry.params; const nk = U.addDays(p.k, +t.dataset.n); if (nk > U.today()) return; p.k = nk; App.forceRefresh(); },
    jDay(t) { App.cur.entry.params.k = t.dataset.k; App.forceRefresh(); document.getElementById('screen').scrollTop = 0; },
    jMood(t) { const k = App.cur.params.k, v = +t.dataset.v; S.setDay(k, 'mood', S.day(k).mood === v ? null : v); App.forceRefresh(); },
    jField: U.debounce(t => { S.setDay(App.cur.params.k, t.dataset.f, t.value); }, 500),
    jGr: U.debounce(t => { const k = App.cur.params.k; const a = (S.day(k).gratitude || ['', '', '']).slice(); a[+t.dataset.i] = t.value; S.setDay(k, 'gratitude', a); }, 500),
    async jAddPhoto() { const k = App.cur.params.k; const ids = await S.addPhotos(true); if (ids.length) { S.setDay(k, 'photos', (S.day(k).photos || []).concat(ids)); App.forceRefresh(); } },
    jPhoto(t) { const k = App.cur.params.k; PhotoView.open(t.dataset.id, () => { S.setDay(k, 'photos', (S.day(k).photos || []).filter(x => x !== t.dataset.id)); App.forceRefresh(); }); }
  }
};
