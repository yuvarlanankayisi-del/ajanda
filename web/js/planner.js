/* Günlük plan defteri: tarih listesi + kâğıt görünümlü gün sayfası */
'use strict';

const Planner = {
  paper() {
    const v = Theme.cur().v;
    const paper = Col.mix(v.ac2, '#F7EDE6', 0.9), ink = Col.mix(v.ac2, '#1A0A10', 0.3);
    return { paper, paper2: Col.mix(ink, paper, 0.93), ink, ink2: Col.mix(ink, paper, 0.38), rule: Col.rgba(ink, 0.3), acc: v.ac2, glow1: v.ac, glow2: v.gold };
  },
  fonts: { formal: { n: 'Okunaklı el yazısı', f: "'Petit Formal Script'", s: '31px' }, dance: { n: 'Rahat el yazısı', f: "'Dancing Script'", s: '40px' }, fancy: { n: 'Süslü el yazısı', f: "'Pinyon Script'", s: '40px' }, serif: { n: 'Sade italik', f: "'Cormorant Garamond'", s: '38px' } },
  vars() { const p = Planner.paper(); const fo = Planner.fonts[S.set.pfont] || Planner.fonts.formal; return `--pfont:${fo.f};--pfs:${fo.s};--pp:${p.paper};--pp2:${p.paper2};--ink:${p.ink};--ink2:${p.ink2};--rule:${p.rule};--pacc:${p.acc};--g1:${p.glow1};--g2:${p.glow2}`; },
  summary(k) {
    const ts = S.tasksOn(k), d = S.db.days[k] || {};
    return { n: ts.length, done: ts.filter(t => S.isDone(t, k)).length, mood: moodOf(d.mood), wrote: !!(d.note || d.best || (d.learned || []).some(Boolean) || Object.values(d.sched || {}).some(Boolean)), spend: (d.expenses || []).reduce((a, e) => a + (+e.a || 0), 0) };
  }
};

const CAT_DEFS = `<defs><linearGradient id="cb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9DCC9"/><stop offset=".65" stop-color="#DCC8AE"/><stop offset="1" stop-color="#C7AD8E"/></linearGradient>
  <linearGradient id="cp" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C9AE90"/><stop offset="1" stop-color="#4A3226"/></linearGradient>
  <linearGradient id="cl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E2D2BD"/><stop offset=".55" stop-color="#C9AE90"/><stop offset="1" stop-color="#3E2A20"/></linearGradient>
  <linearGradient id="cl2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CDB497"/><stop offset=".5" stop-color="#A88A6C"/><stop offset="1" stop-color="#33231B"/></linearGradient>
  <radialGradient id="cm" cx=".7" cy=".6" r=".6"><stop offset="0" stop-color="#3E2A20"/><stop offset="1" stop-color="#7A5A45" stop-opacity="0"/></radialGradient></defs>`;
/* yürüyen siyam kedisi (yandan) */
const CAT_WALK = `<svg class="pcat" viewBox="0 0 92 52" aria-hidden="true">${CAT_DEFS}
  <path class="tail" d="M19 24 C9 23 5 15 8 5" fill="none" stroke="url(#cp)" stroke-width="3.6" stroke-linecap="round"/>
  <path class="leg l1" d="M27 29 C26 34 26 39 24.5 46" stroke="url(#cl2)" stroke-width="3.6" stroke-linecap="round" fill="none"/>
  <path class="leg l2" d="M60 29 C60 35 60 40 61 46" stroke="url(#cl2)" stroke-width="3.4" stroke-linecap="round" fill="none"/>
  <path d="M18 21 C22 13 50 11 62 15 C69 17 71 24 67 29 C61 33 32 34 23 31 C17 29 15 24 18 21 Z" fill="url(#cb)"/>
  <path class="leg l2" d="M31 29 C31 35 31 40 30 46" stroke="url(#cl)" stroke-width="3.8" stroke-linecap="round" fill="none"/>
  <path class="leg l1" d="M64 28 C65 34 66 39 66.5 46" stroke="url(#cl)" stroke-width="3.6" stroke-linecap="round" fill="none"/>
  <g class="head"><path d="M64 15 C66 9 70 6 75 6 C81 6 85 10 85 15 C85 20 81 23 76 23 C70 23 66 20 64 15 Z" fill="#E6D6C1"/>
    <path d="M68 8 L69.5 0.5 L74 6.2 Z M77.5 6 L82.5 1 L83 8.5 Z" fill="#4A3226"/>
    <path d="M73 9 C79 8 85 11 85.5 15.5 C85.5 19.5 82 22.5 77 22.8 C74 18 72 13 73 9 Z" fill="url(#cm)"/>
    <path d="M78.3 12.8 q1.8 -1.3 3.3 0.1 q-1.6 1 -3.3 -0.1z" fill="#7FB4E3"/><circle cx="80" cy="12.9" r=".55" fill="#10202E"/>
    <path d="M85.3 17.2 l-1 .8" stroke="#2A1A14" stroke-width=".8" stroke-linecap="round"/>
    <path d="M84 18.5 l7 -1 M84 19.3 l7 .8" stroke="#F4EDE4" stroke-width=".35" opacity=".8"/></g></svg>`;
/* uzanıp uyuyan siyam kedisi */
const CAT_SLEEP = `<svg class="pcat sleep" viewBox="0 0 92 52" aria-hidden="true">${CAT_DEFS}
  <g class="breathe"><path d="M14 44 C10 36 22 28 42 28 C62 28 74 34 74 42 C74 47 60 49 42 49 C26 49 16 48 14 44 Z" fill="url(#cb)"/>
  <path d="M16 45 C12 50 30 51 46 50 C58 49.5 66 49 70 47" fill="none" stroke="url(#cp)" stroke-width="3.6" stroke-linecap="round"/>
  <ellipse cx="66" cy="46.5" rx="7" ry="2.6" fill="#4A3226"/></g>
  <g class="shead"><path d="M62 38 C63 31 68 28 74 28 C80 28 84 32 84 37 C84 42 80 45 74 45 C68 45 63 43 62 38 Z" fill="#E6D6C1"/>
    <path d="M66 31 L66.5 23.5 L71 29 Z M76.5 28.5 L82 24.5 L81.5 32 Z" fill="#4A3226"/>
    <path d="M71 31 C78 30 84 33 84 37.5 C84 41.5 80 44.5 75 44.8 C72 40 70 35 71 31 Z" fill="url(#cm)"/>
    <path d="M75.5 36.6 q1.8 1.2 3.4 0" fill="none" stroke="#1E120E" stroke-width=".9" stroke-linecap="round"/></g>
  <text class="zz z1" x="80" y="20" font-family="Cormorant Garamond,serif" font-size="9" font-style="italic" fill="var(--ink2)">z</text>
  <text class="zz z2" x="85" y="13" font-family="Cormorant Garamond,serif" font-size="7" font-style="italic" fill="var(--ink2)">z</text></svg>`;

const ORN = `<svg class="orn" viewBox="0 0 120 12" aria-hidden="true"><path d="M2 6 H48 M72 6 H118" stroke="currentColor" stroke-width=".8"/><path d="M60 1 L62 6 L60 11 L58 6 Z M52 6 L54 4.5 L56 6 L54 7.5 Z M64 6 L66 4.5 L68 6 L66 7.5 Z" fill="currentColor"/></svg>`;
const FACES = [5, 4, 3, 2, 1].map(v => ({ v, d: v === 5 ? 'M8.5 13.5c1 1.6 2.2 2.3 3.5 2.3s2.5-.7 3.5-2.3' : v === 4 ? 'M9 14c.9.9 1.9 1.3 3 1.3s2.1-.4 3-1.3' : v === 3 ? 'M9 14.5h6' : v === 2 ? 'M9 15.5c.9-.9 1.9-1.3 3-1.3s2.1.4 3 1.3' : 'M8.5 16c1-1.5 2.2-2.2 3.5-2.2s2.5.7 3.5 2.2M8.5 9.5l2 1M15.5 9.5l-2 1' }));

/* ---------- tarih listesi ---------- */
Screens.planner = {
  nav: 'agenda',
  render(p) {
    const tk = U.today();
    const ym = p.ym || tk.slice(0, 7); p.ym = ym;
    const [y, m] = ym.split('-').map(Number);
    const dim = new Date(y, m, 0).getDate();
    const days = [];
    for (let i = dim; i >= 1; i--) { const k = ym + '-' + U.pad(i); if (k <= U.addDays(tk, 7)) days.push(k); }
    const pv = Planner.vars();
    return `<div class="topbar" style="padding-top:18px">${App.stack.length > 1 ? `<button class="icbtn box" data-a="back">${ic('back', 20, 1.8)}</button>` : ''}<h1>Günlük Plan Defterim</h1></div>
    <div class="wrap pad">
      <button class="pindex today" data-a="plOpen" data-k="${tk}" style="${pv}">
        <span class="pscript">Bugünün sayfası</span><span class="pdate">${U.fmt(tk, 'long')}</span>${ic('arrowR', 20, 1.6)}</button>
      <div class="dayhead"><button class="icbtn" data-a="plM" data-n="-1">${ic('left', 22, 1.8)}</button><div><h1 style="font-size:28px">${U.months[m - 1]}</h1><small>${y}</small></div>
        <button class="icbtn" data-a="plM" data-n="1" ${ym >= tk.slice(0, 7) ? 'disabled style="opacity:.3"' : ''}>${ic('right', 22, 1.8)}</button></div>
      <div class="col" style="gap:8px">${days.map(k => {
        const s = Planner.summary(k), d = U.parse(k), fut = k > tk;
        return `<button class="pindex ${k === tk ? 'cur' : ''}" data-a="plOpen" data-k="${k}" style="${pv};${fut ? 'opacity:.7' : ''}">
          <span class="pinum">${d.getDate()}</span>
          <span class="col sp" style="gap:2px;text-align:left"><b style="font-size:14px">${U.days[U.dow(k)]}${k === tk ? ' · Bugün' : ''}</b>
            <small>${s.n ? `${s.done}/${s.n} iş` : 'Plan yok'}${s.wrote ? ' · notlu' : ''}${s.spend ? ' · ' + s.spend.toLocaleString('tr-TR') + ' ₺' : ''}</small></span>
          ${s.mood ? `<span class="cdot" style="width:12px;height:12px;background:${s.mood.c}"></span>` : ''}
          ${s.n ? U.ring(26, 3, s.done / s.n, 'var(--pacc)', null) : ''}</button>`;
      }).join('')}</div>
    </div>`;
  },
  acts: {
    plOpen(t) { App.go('page', { k: t.dataset.k }); },
    plM(t) { const p = App.cur.entry.params; const [y, m] = p.ym.split('-').map(Number); const d = new Date(y, m - 1 + (+t.dataset.n), 1); const n = d.getFullYear() + '-' + U.pad(d.getMonth() + 1); if (n > U.today().slice(0, 7)) return; p.ym = n; App.forceRefresh(); }
  }
};

/* ---------- kâğıt gün sayfası ---------- */
const HOURS = ['08', '10', '12', '14', '16', '18', '20', '22'];
Screens.page = {
  nav: 'agenda', noNav: false,
  render(p) {
    const k = p.k || U.today(); p.k = k;
    const d = S.day(k), tk = U.today(), dt = U.parse(k);
    const tasks = S.tasksOn(k);
    const water = S.water(), wc = water ? S.habitCount(water, k) : 0, wt = water ? water.target : 8;
    const exps = d.expenses || [], total = exps.reduce((a, e) => a + (+e.a || 0), 0);
    const learned = d.learned || ['', '', ''];
    const sched = d.sched || {};
    const qi = (Math.floor(U.parse(k).getTime() / 86400000)) % QUOTES.length;
    const empty = Math.max(1, 5 - tasks.length);
    const slotOf = t => { const h = +t.time.slice(0, 2); let best = HOURS[0]; for (const x of HOURS) if (+x <= h) best = x; return best; };
    const strip = []; for (let i = -120; i <= 21; i++) strip.push(U.addDays(tk, i));
    return `<div class="topbar" style="padding-top:14px;padding-bottom:2px"><button class="icbtn box" data-a="back">${ic('back', 20, 1.8)}</button>
      <b class="serif sp" style="font-size:20px;text-align:center" id="stripM">${U.months[dt.getMonth()]} ${dt.getFullYear()}</b>
      <button class="icbtn box" data-a="pgToday" aria-label="Bugün">${ic('sun', 19, 1.8)}</button></div>
    <div class="dstrip" id="dstrip">${strip.map(x => { const xd = U.parse(x), s = Planner.summary(x); return `<button class="${x === k ? 'sel' : ''} ${x === tk ? 'today' : ''}" data-a="pgGo" data-k="${x}" data-m="${U.months[xd.getMonth()]} ${xd.getFullYear()}"><small>${U.daysS[U.dow(x)]}</small><b>${xd.getDate()}</b><i style="background:${s.mood ? s.mood.c : s.n || s.wrote ? 'var(--ac)' : 'transparent'}"></i></button>`; }).join('')}</div>
    <div class="paperwrap ${p.dir ? 'turn' + p.dir : ''}" style="${Planner.vars()}">
     <div class="paper" style="${Screens.page._sc ? `transform:scale(${Screens.page._sc});transform-origin:top center` : ''}">
      <div class="kedi" aria-hidden="true"><img class="kb" src="img/kedi_body.png" alt=""><img class="kl" src="img/kedi_leg.png" alt=""><img class="kt" src="img/kedi_tail.png" alt=""></div>
      <svg class="pmoon" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3a9 9 0 1 0 6 13A7 7 0 1 1 15 3z" fill="currentColor"/></svg>
      <span class="pstar" style="left:9%;top:22px">✦</span><span class="pstar" style="left:22%;top:46px;font-size:8px">✦</span>
      <header class="phead"><button class="pscript big" data-a="pgFont" style="background:none;border:none;color:inherit;padding:0">Günlük Plan</button><div class="psub">HAYAL ET · PLANLA · BAŞAR</div></header>
      <div class="prow2"><div class="pfield"><span>TARİH</span><b>${U.pad(dt.getDate())} ${U.months[dt.getMonth()]} ${dt.getFullYear()}</b></div><div class="pfield" style="justify-content:center"><b style="font-style:italic;font-weight:500">${U.days[U.dow(k)]}${k === tk ? ' · bugün' : ''}</b></div></div>

      <div class="pgrid">
        <section class="pbox ptodo"><h3>${ORN}<span>YAPILACAKLAR</span></h3>
          ${tasks.map(t => { const dn = S.isDone(t, k); return `<div class="pline ${dn ? 'done' : ''}"><button class="pcirc ${dn ? 'on' : ''}" data-a="pgTgl" data-id="${t.id}" aria-label="Tamamla"></button><button class="ptxt" data-a="pgEdit" data-id="${t.id}">${t.time ? `<i>${t.time}</i> ` : ''}${U.esc(t.title)}</button></div>`; }).join('')}
          ${Array.from({ length: empty }, (_, i) => `<div class="pline"><span class="pcirc"></span><input class="pin" data-new="1" data-k="${k}" placeholder="${i === 0 && !tasks.length ? 'Yazmak için dokun…' : ''}" enterkeyhint="done"></div>`).join('')}
          ${empty === 0 ? `<div class="pline"><span class="pcirc"></span><input class="pin" data-new="1" data-k="${k}" placeholder="+ ekle" enterkeyhint="done"></div>` : ''}
        </section>
        <div class="pcol">
          <section class="pbox"><h3><span>RUH HÂLİ</span></h3><div class="pfaces">${FACES.map(f => `<button data-a="pgMood" data-v="${f.v}" class="${d.mood === f.v ? 'on' : ''}" aria-label="${(moodOf(f.v) || {}).l}"><svg viewBox="0 0 24 24" width="26" height="26"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="9.3" cy="10" r=".9" fill="currentColor"/><circle cx="14.7" cy="10" r=".9" fill="currentColor"/><path d="${f.d}" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg></button>`).join('')}</div></section>
          <section class="pbox"><h3><span>SU</span></h3><div class="pcups">${Array.from({ length: wt }, (_, i) => `<button data-a="pgWater" data-n="${i + 1}" class="${i < wc ? 'on' : ''}" aria-label="${i + 1}. bardak"><svg viewBox="0 0 20 24" width="18" height="22"><path d="M3 3h14l-2 18H5z" fill="${i < wc ? 'currentColor' : 'none'}" fill-opacity=".35" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>${i < wc ? '' : '<path d="M8.5 11c1-1.5 2-1.5 3 0" fill="none" stroke="currentColor" stroke-width=".9"/>'}</svg></button>`).join('')}</div></section>
          <section class="pbox"><h3>${ORN}<span>HARCAMA</span></h3>
            ${exps.map((e, i) => `<div class="pexp"><span class="sp">${U.esc(e.d || '—')}</span><b>${(+e.a || 0).toLocaleString('tr-TR')} ₺</b><button data-a="pgExpDel" data-i="${i}" aria-label="Sil">×</button></div>`).join('')}
            <div class="pexp add"><input class="pin" id="exD" placeholder="ne için?"><input class="pin" id="exA" data-k="${k}" placeholder="₺" inputmode="decimal" style="width:52px;text-align:right" enterkeyhint="done"></div>
            ${exps.length ? `<div class="pexp tot"><span class="sp">Toplam</span><b>${total.toLocaleString('tr-TR')} ₺</b></div>` : ''}
          </section>
        </div>
        <section class="pbox pnotes"><span class="pseal" aria-hidden="true"><svg viewBox="0 0 40 52"><path d="M14 30 L8 50 L16 45 L20 51 L22 32 Z M26 30 L32 50 L24 45 L20 51 L18 32 Z" fill="var(--pacc)" opacity=".85"/><circle cx="20" cy="20" r="15" fill="var(--pacc)"/><circle cx="20" cy="20" r="11" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1"/><path d="M20 12c1.5 3 4 4 4 7a4 4 0 0 1-8 0c0-3 2.5-4 4-7zM14 25h12" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.2" stroke-linecap="round"/></svg></span>
          <h3>${ORN}<span>NOTLAR</span></h3><textarea class="pnote grow" rows="4" data-in="pgField" data-f="note" data-k="${k}" placeholder="Aklındakiler…">${U.esc(d.note || '')}</textarea></section>
        <section class="pbox psched"><h3><span>PROGRAM</span></h3>
          ${HOURS.map(h => { const ts = tasks.filter(t => t.time && slotOf(t) === h); return `<div class="pslot"><span>${h}:00</span><div class="sp">${ts.map(t => `<button class="ptag ${S.isDone(t, k) ? 'done' : ''}" data-a="pgEdit" data-id="${t.id}">${t.time} ${U.esc(t.title)}</button>`).join('')}<input class="pin" data-in="pgSched" data-h="${h}" data-k="${k}" value="${U.esc(sched[h] || '')}"></div></div>`; }).join('')}
        </section>
        <section class="pbox plearn"><h3><span>ÖĞRENDİĞİM 3 ŞEY</span></h3>
          ${[0, 1, 2].map(i => `<div class="pnum"><span>${i + 1}.</span><input class="pin" data-in="pgLearn" data-i="${i}" data-k="${k}" value="${U.esc(learned[i] || '')}"></div>`).join('')}</section>
        <div class="pquote">${U.esc(QUOTES[qi])}<button class="psave" data-a="pgSave">${ic('check', 14, 2.4)} Kaydet</button></div>
      </div>
     </div>
    </div>`;
  },
  mount(el, p) {
    App.growAll(el);
    delete p.dir;
    const ds = el.querySelector('#dstrip'), sel = ds && ds.querySelector('.sel');
    if (sel) { ds.style.scrollBehavior = 'auto'; ds.scrollLeft = sel.offsetLeft - ds.clientWidth / 2 + sel.offsetWidth / 2; requestAnimationFrame(() => { ds.style.scrollBehavior = ''; }); }
    if (ds) ds.addEventListener('scroll', U.debounce(() => {
      const mid = ds.scrollLeft + ds.clientWidth / 2; let best = null;
      ds.querySelectorAll('button').forEach(b => { if (!best || Math.abs(b.offsetLeft + b.offsetWidth / 2 - mid) < Math.abs(best.offsetLeft + best.offsetWidth / 2 - mid)) best = b; });
      const m = el.querySelector('#stripM'); if (best && m) m.textContent = best.dataset.m;
    }, 80));
    Screens.page.fit(el);
    const k = p.k;
    el.querySelectorAll('input[data-new]').forEach(inp => inp.addEventListener('keydown', e => {
      if (e.key !== 'Enter' || !inp.value.trim()) return;
      const v = inp.value.trim(); inp.value = ''; S.newTask({ title: v, date: inp.dataset.k || k }); inp.blur(); App.forceRefresh();
      setTimeout(() => { const n = document.querySelector('input[data-new]'); if (n) n.focus(); }, 60);
    }));
    el.querySelectorAll('input[data-new]').forEach(inp => inp.addEventListener('blur', () => {
      const v = inp.value.trim(); if (!v) return;
      inp.value = ''; S.newTask({ title: v, date: inp.dataset.k || k });
      setTimeout(() => { if (App.cur.entry.name === 'page' && !(document.activeElement && document.activeElement.tagName === 'INPUT')) App.forceRefresh(); }, 120);
    }));
    const exA = el.querySelector('#exA'), exD = el.querySelector('#exD');
    const addExp = () => {
      const a = parseFloat((exA.value || '').replace(',', '.'));
      if (!a) return;
      const desc = exD.value.trim(); exA.value = ''; exD.value = '';
      const dd = S.day(k, true); S.setDay(k, 'expenses', (dd.expenses || []).concat({ d: desc, a, cat: '' }));
      exA.blur(); App.forceRefresh(); setTimeout(() => { const x = document.getElementById('exD'); if (x) x.focus(); }, 60);
    };
    if (exA) { exA.addEventListener('keydown', e => { if (e.key === 'Enter') addExp(); }); exD.addEventListener('keydown', e => { if (e.key === 'Enter') exA.focus(); }); exA.addEventListener('blur', () => { if (exA.value) addExp(); }); }
    const paper = el.querySelector('.paper');
    let sx = null, sy = 0;
    paper.addEventListener('touchstart', e => { if (e.target.closest('input,textarea')) { sx = null; return; } sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    paper.addEventListener('touchend', e => {
      if (sx == null) return;
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 70 && Math.abs(dy) < 50) Screens.page.acts.pgShift({ dataset: { n: dx < 0 ? 1 : -1 } });
    }, { passive: true });
  },
  /* sayfadan çıkarken ya da Kaydet'e basınca yarım kalan yazıları kaydet */
  flush() {
    const el = document.getElementById('screen');
    el.querySelectorAll('input[data-new]').forEach(i => { if (i.value.trim()) { S.newTask({ title: i.value.trim(), date: i.dataset.k }); i.value = ''; } });
    el.querySelectorAll('[data-in^="pg"]').forEach(i => {
      const k = i.dataset.k; if (!k) return;
      const d = S.day(k, true);
      if (i.dataset.in === 'pgField') d[i.dataset.f] = i.value;
      else if (i.dataset.in === 'pgSched') { d.sched = Object.assign({}, d.sched || {}); d.sched[i.dataset.h] = i.value; }
      else if (i.dataset.in === 'pgLearn') { d.learned = (d.learned || ['', '', '']).slice(); d.learned[+i.dataset.i] = i.value; }
      d.updated = Date.now();
    });
    const exA = el.querySelector('#exA'), exD = el.querySelector('#exD');
    const amt = exA ? parseFloat((exA.value || '').replace(',', '.')) : 0;
    if (amt) { const d = S.day(exA.dataset.k, true); d.expenses = (d.expenses || []).concat({ d: exD.value.trim(), a: amt, cat: '' }); d.updated = Date.now(); exA.value = ''; }
    S.touch({ quiet: true }); S.saveNow();
  },
  leave() { Screens.page.flush(); },
  /* kâğıdı ekrana sığdır */
  fit(el) {
    const wrap = el.querySelector('.paperwrap'), paper = el.querySelector('.paper'); if (!wrap || !paper) return;
    const avail = window.innerHeight - wrap.getBoundingClientRect().top - 84;
    const h = paper.offsetHeight;
    const sc = h > avail ? Math.max(0.8, avail / h) : 1;
    Screens.page._sc = sc < 1 ? sc : null;
    paper.style.transform = sc < 1 ? `scale(${sc})` : ''; paper.style.transformOrigin = 'top center';
    wrap.style.height = sc < 1 ? (h * sc + 14) + 'px' : '';
  },
  acts: {
    pgSave() {
      const hadNew = Array.from(document.querySelectorAll('#screen input[data-new]')).some(i => i.value.trim());
      Screens.page.flush(); U.vibrate(15); U.toast('Kaydedildi ✓');
      if (hadNew) App.forceRefresh();
    },
    pgFont() {
      const rec = App.sheet(`<h3>Defter yazı tipi</h3><div class="menu">${Object.entries(Planner.fonts).map(([k, f]) => `<button data-a="pfSet" data-k="${k}" style="font-family:${f.f},serif;font-size:24px;font-weight:500">${(S.set.pfont || 'formal') === k ? `<span class="ac">${ic('check', 18, 2.4)}</span>` : '<span style="width:18px"></span>'}Günlük Plan <small style="font-family:var(--sans);font-size:11px;color:var(--mu);margin-left:auto">${f.n}</small></button>`).join('')}</div>`,
        { acts: { pfSet: b => { S.set.pfont = b.dataset.k; S.set.updated = Date.now(); S.touch({ quiet: true }); App.closeSheet(rec); App.forceRefresh(); } } });
    },
    pgGo(t) { Screens.page.flush(); const p = App.cur.entry.params; const nk = t.dataset.k; if (nk === p.k) return; p.dir = nk > p.k ? 'L' : 'R'; p.k = nk; App.forceRefresh(); },
    pgToday() { Screens.page.flush(); const p = App.cur.entry.params; const tk = U.today(); if (p.k === tk) return; p.dir = tk > p.k ? 'L' : 'R'; p.k = tk; App.forceRefresh(); },
    pgShift(t) { Screens.page.flush(); const p = App.cur.entry.params; const n = +t.dataset.n; p.k = U.addDays(p.k, n); p.dir = n > 0 ? 'L' : 'R'; App.forceRefresh(); document.getElementById('screen').scrollTop = 0; },
    pgTgl(t) { const x = S.db.tasks.find(y => y.id === t.dataset.id); if (x) { S.toggle(x, App.cur.params.k); App.forceRefresh(); } },
    pgEdit(t) { const x = S.db.tasks.find(y => y.id === t.dataset.id); if (x) TaskSheet.open(x); },
    pgMood(t) { const k = App.cur.params.k, v = +t.dataset.v; S.setDay(k, 'mood', S.day(k).mood === v ? null : v); App.forceRefresh(); },
    pgWater(t) { const k = App.cur.params.k, n = +t.dataset.n, w = S.water(); if (!w) return; const cur = S.habitCount(w, k); const nv = cur === n ? n - 1 : n; w.log = w.log || {}; if (nv <= 0) delete w.log[k]; else w.log[k] = nv; w.updated = Date.now(); U.vibrate(8); S.touch(); App.forceRefresh(); },
    pgExpDel(t) { const k = App.cur.params.k; const a = (S.day(k).expenses || []).slice(); a.splice(+t.dataset.i, 1); S.setDay(k, 'expenses', a); App.forceRefresh(); },
    pgField: U.debounce(t => S.setDay(t.dataset.k, t.dataset.f, t.value), 400),
    pgSched: U.debounce(t => { const k = t.dataset.k; const s = Object.assign({}, S.day(k).sched || {}); s[t.dataset.h] = t.value; S.setDay(k, 'sched', s); }, 500),
    pgLearn: U.debounce(t => { const k = t.dataset.k; const a = (S.day(k).learned || ['', '', '']).slice(); a[+t.dataset.i] = t.value; S.setDay(k, 'learned', a); }, 500)
  }
};
