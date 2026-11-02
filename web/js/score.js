/* Aylık puan, değerlendirme ve istatistikler */
'use strict';

const AREAS = [
  { k: 'tasks', n: 'Görevler', i: 'task', c: '#E89AAD' },
  { k: 'habits', n: 'Alışkanlıklar', i: 'target', c: '#9CC0A6' },
  { k: 'study', n: 'Ders ve öğrenme', i: 'cap', c: '#8FB7C9' },
  { k: 'books', n: 'Kitap okuma', i: 'book', c: '#D9B47A' },
  { k: 'goals', n: 'Hedefler', i: 'flag', c: '#C9B4E0' },
  { k: 'mood', n: 'Ruh hâli', i: 'smile', c: '#F1C27D' }
];

const Score = {
  ym(k) { return (k || U.today()).slice(0, 7); },
  ymLabel(ym) { const [y, m] = ym.split('-').map(Number); return U.months[m - 1] + ' ' + y; },
  ymShift(ym, n) { const [y, m] = ym.split('-').map(Number); const d = new Date(y, m - 1 + n, 1); return d.getFullYear() + '-' + U.pad(d.getMonth() + 1); },
  /* aralıktaki günler (bugünü geçmez) */
  days(a, b) { const out = []; const tk = U.today(); let k = a; while (k <= b && k <= tk) { out.push(k); k = U.addDays(k, 1); } return out; },
  monthRange(ym) { const [y, m] = ym.split('-').map(Number); return [ym + '-01', U.key(new Date(y, m, 0))]; },

  /* aralık için ham istatistik */
  stats(a, b) {
    const days = Score.days(a, b);
    const allDays = []; { let k = a; while (k <= b) { allDays.push(k); k = U.addDays(k, 1); } }
    let tTot = 0, tDone = 0, hTot = 0, hDone = 0, focus = 0, pages = 0, moodSum = 0, moodN = 0, journal = 0, sTot = 0, sDone = 0;
    const moods = [0, 0, 0, 0, 0], perDay = [];
    for (const k of days) {
      const ts = S.tasksOn(k, { kind: 'task' });
      const dn = ts.filter(t => S.isDone(t, k)).length;
      tTot += ts.length; tDone += dn;
      const st = ts.filter(t => t.course); sTot += st.length; sDone += st.filter(t => S.isDone(t, k)).length;
      let hd = 0, ht = 0;
      for (const h of S.db.habits) { if (h.archived || (h.created && U.key(new Date(h.created)) > k)) continue; ht++; if (S.habitDone(h, k)) hd++; }
      hTot += ht; hDone += hd;
      const d = S.db.days[k] || {};
      focus += d.focus || 0;
      if (d.mood) { moodSum += d.mood; moodN++; moods[d.mood - 1]++; }
      if (d.journal || d.best || (d.gratitude || []).some(Boolean)) journal++;
      perDay.push({ k, tasks: dn, total: ts.length, habit: ht ? hd / ht : null, focus: d.focus || 0, mood: d.mood || null });
    }
    const tk0 = U.today();
    for (const k of allDays) if (k > tk0) perDay.push({ k, tasks: 0, total: 0, habit: null, focus: 0, mood: null, future: true });
    for (const bk of S.db.books) for (const [k, v] of Object.entries(bk.log || {})) if (k >= a && k <= b) pages += v;
    const ts0 = new Date(a).getTime(), ts1 = U.parse(b).getTime() + 86400000;
    const inR = x => x && x >= ts0 && x < ts1;
    return {
      days: days.length, tTot, tDone, hTot, hDone, focus, pages, moodSum, moodN, moods, journal, sTot, sDone, perDay,
      notes: S.db.notes.filter(n => inR(n.created)).length,
      goalsDone: (S.db.goals || []).filter(g => g.done && inR(g.doneAt)).length,
      booksDone: S.db.books.filter(bk => bk.status === 'done' && inR(bk.finished)).length,
      showsDone: (S.db.shows || []).filter(x => x.status === 'done' && inR(x.finished)).length
    };
  },

  /* otomatik alan puanları (0-100 ya da null) */
  auto(ym) {
    const [a, b] = Score.monthRange(ym);
    const st = Score.stats(a, b);
    const r = {};
    r.tasks = st.tTot ? Math.round(100 * st.tDone / st.tTot) : null;
    r.habits = st.hTot ? Math.round(100 * st.hDone / st.hTot) : null;
    const fT = S.set.focusTarget || 600;
    const parts = [];
    if (st.sTot) parts.push(st.sDone / st.sTot);
    if (st.focus || (S.db.courses || []).length) parts.push(Math.min(1, st.focus / fT));
    r.study = parts.length ? Math.round(100 * parts.reduce((x, y) => x + y, 0) / parts.length) : null;
    const pT = S.set.pageTarget || 300;
    r.books = (st.pages || S.db.books.some(x => x.status === 'reading')) ? Math.round(100 * Math.min(1, st.pages / pT)) : null;
    const gs = (S.db.goals || []).filter(g => {
      const s0 = g.start || U.key(new Date(g.created)), e0 = S.goalEnd(g) || '9999';
      return s0 <= b && e0 >= a && !(g.archived && !g.done);
    });
    r.goals = gs.length ? Math.round(100 * gs.reduce((x, g) => x + S.goalPct(g), 0) / gs.length) : null;
    r.mood = st.moodN ? Math.round(100 * (st.moodSum / st.moodN - 1) / 4) : null;
    return { r, st };
  },
  final(ym) {
    const { r } = Score.auto(ym);
    const m = S.db.months[ym] || {};
    const self = m.self || {};
    const per = {};
    let sum = 0, n = 0;
    for (const a of AREAS) {
      const au = r[a.k], se = self[a.k];
      const v = se != null && au != null ? Math.round((au + se) / 2) : se != null ? se : au;
      per[a.k] = { auto: au, self: se, v };
      if (v != null) { sum += v; n++; }
    }
    return { per, total: n ? Math.round(sum / n) : null };
  },

  /* basit sütun grafik (svg) */
  bars(vals, labels, opts) {
    opts = opts || {};
    const W = 340, H = opts.h || 120, n = vals.length, gap = n > 20 ? 2 : 6, bw = (W - gap * (n - 1)) / n;
    const max = opts.max || Math.max(1, ...vals.map(v => v || 0));
    let svg = `<svg viewBox="0 0 ${W} ${H + 18}" width="100%" aria-hidden="true">`;
    vals.forEach((v, i) => {
      const h = v ? Math.max(3, (v / max) * H) : 3, x = i * (bw + gap);
      const col = opts.colors ? opts.colors[i] : (opts.hl === i ? 'var(--ac)' : 'color-mix(in srgb,var(--ac) 55%,transparent)');
      svg += `<rect x="${x.toFixed(1)}" y="${(H - h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="${Math.min(4, bw / 2).toFixed(1)}" fill="${v ? col : 'var(--card2)'}"/>`;
      if (labels && labels[i] && (n <= 12 || i % 5 === 0)) svg += `<text x="${(x + bw / 2).toFixed(1)}" y="${H + 14}" text-anchor="middle" font-size="9.5" fill="var(--mu)" font-family="Manrope">${labels[i]}</text>`;
      if (opts.values && v) svg += `<text x="${(x + bw / 2).toFixed(1)}" y="${(H - h - 4).toFixed(1)}" text-anchor="middle" font-size="10" font-weight="700" fill="var(--tx)" font-family="Manrope">${v}</text>`;
    });
    return svg + '</svg>';
  },
  line(vals, labels) {
    const W = 340, H = 110, n = vals.length, step = n > 1 ? W / (n - 1) : W;
    const pts = vals.map((v, i) => v == null ? null : [i * step, H - (v / 100) * (H - 10) - 5]);
    const valid = pts.filter(Boolean);
    let path = '';
    valid.forEach((p, i) => { path += (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); });
    let svg = `<svg viewBox="-10 0 ${W + 20} ${H + 22}" width="100%" aria-hidden="true">`;
    [25, 50, 75].forEach(g => svg += `<line x1="0" x2="${W}" y1="${H - (g / 100) * (H - 10) - 5}" y2="${H - (g / 100) * (H - 10) - 5}" stroke="var(--line2)" stroke-dasharray="3 4"/>`);
    if (valid.length > 1) svg += `<path d="${path}" fill="none" stroke="var(--ac)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;
    pts.forEach((p, i) => { if (p) svg += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4" fill="var(--bg)" stroke="var(--ac)" stroke-width="2.5"/><text x="${p[0].toFixed(1)}" y="${(p[1] - 9).toFixed(1)}" text-anchor="middle" font-size="10" font-weight="700" fill="var(--tx)" font-family="Manrope">${vals[i]}</text>`; });
    labels.forEach((l, i) => svg += `<text x="${(i * step).toFixed(1)}" y="${H + 18}" text-anchor="middle" font-size="10" fill="var(--mu)" font-family="Manrope">${l}</text>`);
    return svg + '</svg>';
  }
};

/* ---------- aylık değerlendirme ---------- */
Screens.score = {
  nav: 'sections',
  render(p) {
    const ym = p.ym || Score.ym(); p.ym = ym;
    const cur = Score.ym();
    const f = Score.final(ym);
    const m = S.db.months[ym] || {};
    const hist = []; for (let i = 5; i >= 0; i--) { const y = Score.ymShift(ym, -i); hist.push({ y, v: y <= cur ? Score.final(y).total : null }); }
    const tc = f.total == null ? 'var(--mu)' : f.total >= 75 ? 'var(--sage)' : f.total >= 50 ? 'var(--gold)' : 'var(--ac)';
    return `<div class="topbar" style="padding-top:18px">${App.stack.length > 1 ? `<button class="icbtn box" data-a="back">${ic('back', 20, 1.8)}</button>` : ''}<h1>Aylık Değerlendirme</h1>
      <button class="icbtn box" data-a="go" data-to="stats" aria-label="İstatistikler">${ic('bars', 20)}</button></div>
    <div class="wrap pad">
      <div class="dayhead"><button class="icbtn" data-a="scM" data-n="-1">${ic('left', 22, 1.8)}</button>
        <div><h1 style="font-size:30px">${Score.ymLabel(ym)}</h1><small>${ym === cur ? 'BU AY · DEVAM EDİYOR' : 'AYLIK PUAN'}</small></div>
        <button class="icbtn" data-a="scM" data-n="1" ${ym >= cur ? 'disabled style="opacity:.3"' : ''}>${ic('right', 22, 1.8)}</button></div>

      <section class="card big col" style="gap:14px">
        <div class="row"><div class="col sp" style="gap:2px"><span class="mu" style="font-size:12px">Aylık puan</span><b class="serif" style="font-size:22px">${Score.ymLabel(ym)}</b></div>
          <b class="serif" style="font-size:46px;color:${tc};line-height:1">${f.total == null ? '—' : f.total}<span style="font-size:18px;color:var(--mu)">/100</span></b></div>
        <div style="height:1px;background:var(--line2)"></div>
        ${AREAS.map(a => { const x = f.per[a.k]; return `<div class="col" style="gap:6px">
          <div class="row"><span style="color:${a.c};display:flex">${ic(a.i, 16)}</span><span class="sp" style="font-size:14px">${a.n}</span><b style="font-size:14px">${x.v == null ? '—' : x.v + '/100'}</b></div>
          <div class="bar" style="height:7px;position:relative"><i style="width:${x.v || 0}%;background:${a.c}"></i>${x.self != null ? `<span style="position:absolute;top:-3px;left:calc(${x.self}% - 2px);width:3px;height:13px;border-radius:2px;background:var(--tx)"></span>` : ''}</div>
          <small class="mu2" style="font-size:10.5px">${x.auto == null ? 'Bu ay veri yok' : 'Otomatik ' + x.auto}${x.self != null ? ' · Senin puanın ' + x.self : ''}</small></div>`; }).join('')}
        <button class="btn soft" data-a="scSelf">${ic('edit', 18)} ${m.self ? 'Puanlarımı düzenle' : 'Kendi puanımı ver'}</button>
        <small class="mu" style="font-size:11px;line-height:1.5">Puanlar görev, alışkanlık, odak süresi, okunan sayfa, hedef ilerlemesi ve ruh hâlinden otomatik hesaplanır. Kendi puanını verirsen ikisinin ortalaması alınır.</small>
      </section>

      <section class="card big col" style="gap:8px"><h2 class="h2s">Son 6 ay</h2>${Score.line(hist.map(h => h.v), hist.map(h => U.monthsS[+h.y.slice(5) - 1]))}</section>

      <section class="card big col" style="gap:10px"><h2 class="h2s">Ay sonu notlarım</h2>
        <span class="lbl">Bu ay iyi giden şeyler</span><textarea class="bare grow" rows="2" data-in="scTxt" data-f="good" placeholder="…" style="font-size:14.5px;line-height:1.6">${U.esc(m.good || '')}</textarea>
        <span class="lbl">Geliştirmek istediklerim</span><textarea class="bare grow" rows="2" data-in="scTxt" data-f="improve" placeholder="…" style="font-size:14.5px;line-height:1.6">${U.esc(m.improve || '')}</textarea>
        <span class="lbl">Gelecek ay için</span><textarea class="bare grow" rows="2" data-in="scTxt" data-f="next" placeholder="…" style="font-size:14.5px;line-height:1.6">${U.esc(m.next || '')}</textarea></section>
    </div>`;
  },
  mount(el) { App.growAll(el); },
  acts: {
    scM(t) { const p = App.cur.entry.params; const n = Score.ymShift(p.ym, +t.dataset.n); if (n > Score.ym()) return; p.ym = n; App.forceRefresh(); },
    scTxt: U.debounce(t => { const ym = App.cur.params.ym; const m = S.db.months[ym] = S.db.months[ym] || {}; m[t.dataset.f] = t.value; m.updated = Date.now(); S.touch({ quiet: true }); }, 500),
    scSelf() {
      const ym = App.cur.params.ym; const m = S.db.months[ym] || {}; const self = Object.assign({}, m.self || {}); const au = Score.auto(ym).r;
      const rec = App.sheet(`<h3>${Score.ymLabel(ym)} · kendi puanın</h3><p class="mu" style="margin:0;font-size:13px">Her alana 0-100 arası puan ver. Boş bırakmak için en sola çek.</p>
        ${AREAS.map(a => `<div class="field"><label style="display:flex;justify-content:space-between"><span>${a.n}</span><span id="sv_${a.k}">${self[a.k] == null ? '—' : self[a.k]}</span></label>
          <input type="range" min="-5" max="100" step="5" value="${self[a.k] == null ? -5 : self[a.k]}" data-k="${a.k}" style="width:100%;accent-color:${a.c}"><small class="mu2">Otomatik: ${au[a.k] == null ? 'veri yok' : au[a.k]}</small></div>`).join('')}
        <button class="btn wide" data-a="ssSave">Kaydet</button>`, {
        mount: sh => sh.querySelectorAll('input[type=range]').forEach(r => r.oninput = () => { sh.querySelector('#sv_' + r.dataset.k).textContent = +r.value < 0 ? '—' : r.value; }),
        acts: {
          ssSave: () => {
            const out = {}; rec.sh.querySelectorAll('input[type=range]').forEach(r => { if (+r.value >= 0) out[r.dataset.k] = +r.value; });
            const mm = S.db.months[ym] = S.db.months[ym] || {}; mm.self = out; mm.updated = Date.now(); S.touch(); App.closeSheet(rec);
          }
        }
      });
    }
  }
};

/* ---------- istatistikler ---------- */
Screens.stats = {
  nav: 'sections',
  render(p) {
    const tab = p.tab || 'week';
    const tk = U.today();
    let a, b, title, chart = '';
    if (tab === 'week') {
      const wd = U.weekDays(tk); a = wd[0]; b = wd[6]; title = 'Bu hafta';
    } else if (tab === 'month') {
      [a, b] = Score.monthRange(Score.ym()); title = Score.ymLabel(Score.ym());
    } else { a = tk.slice(0, 4) + '-01-01'; b = tk.slice(0, 4) + '-12-31'; title = tk.slice(0, 4); }
    const st = Score.stats(a, b);
    if (tab === 'year') {
      const ms = []; for (let i = 1; i <= 12; i++) { const ym = tk.slice(0, 4) + '-' + U.pad(i); ms.push(ym <= Score.ym() ? Score.final(ym).total : null); }
      chart = `<section class="card big col" style="gap:8px"><h2 class="h2s">Aylık puanlar</h2>${Score.bars(ms.map(v => v || 0), U.monthsS.map(m => m[0]), { max: 100, values: true, hl: new Date().getMonth() })}</section>`;
    }
    const pd = st.perDay;
    const labels = tab === 'week' ? U.daysS : pd.map((d, i) => String(i + 1));
    const daily = tab === 'year' ? '' : `<section class="card big col" style="gap:8px"><h2 class="h2s">Tamamlanan görevler</h2>${Score.bars(pd.map(d => d.tasks), labels, { hl: pd.findIndex(d => d.k === tk), values: tab === 'week' })}</section>`;
    const pct = (x, y) => y ? Math.round(100 * x / y) + '%' : '—';
    const tile = (icn, v, l, c) => `<div class="card col" style="gap:4px;padding:14px"><span style="color:${c || 'var(--ac)'}">${ic(icn, 20)}</span><b class="serif" style="font-size:26px;line-height:1">${v}</b><small class="mu" style="font-size:11.5px">${l}</small></div>`;
    const totalMood = st.moods.reduce((x, y) => x + y, 0);
    return `<div class="topbar" style="padding-top:18px">${App.stack.length > 1 ? `<button class="icbtn box" data-a="back">${ic('back', 20, 1.8)}</button>` : ''}<h1>İstatistikler</h1></div>
    <div class="wrap pad">
      <div class="seg" style="align-self:center"><button class="${tab === 'week' ? 'on' : ''}" data-a="stT" data-v="week">Hafta</button><button class="${tab === 'month' ? 'on' : ''}" data-a="stT" data-v="month">Ay</button><button class="${tab === 'year' ? 'on' : ''}" data-a="stT" data-v="year">Yıl</button></div>
      <h2 class="serif" style="font-size:22px;text-align:center">${title}</h2>
      <div class="g2" style="gap:10px">
        ${tile('task', st.tDone + '<span style="font-size:15px;color:var(--mu)"> / ' + st.tTot + '</span>', 'görev tamamlandı · ' + pct(st.tDone, st.tTot))}
        ${tile('target', pct(st.hDone, st.hTot), 'alışkanlık başarısı', 'var(--sage)')}
        ${tile('timer', st.focus >= 60 ? Math.floor(st.focus / 60) + 's ' + (st.focus % 60) + 'dk' : st.focus + ' dk', 'odak / ders çalışma', 'var(--blue)')}
        ${tile('book', st.pages, 'sayfa okundu', 'var(--gold)')}
        ${tile('journal', st.journal, 'gün günlük yazıldı', 'var(--lilac)')}
        ${tile('flag', st.goalsDone, 'hedef tamamlandı')}
        ${tile('note', st.notes, 'yeni not')}
        ${tile('film', st.booksDone + st.showsDone, 'kitap / dizi / film bitti', 'var(--gold)')}
      </div>
      ${daily}${chart}
      <section class="card big col" style="gap:10px"><h2 class="h2s">Ruh hâli</h2>
        ${totalMood ? MOODS.slice().reverse().map(m => { const n = st.moods[m.v - 1]; return `<div class="row" style="gap:10px"><span style="width:62px;font-size:12.5px">${m.l}</span><div class="bar sp" style="height:9px"><i style="width:${Math.round(100 * n / totalMood)}%;background:${m.c}"></i></div><small class="mu" style="width:24px;text-align:right">${n}</small></div>`; }).join('') : '<small class="mu">Bu dönemde ruh hâli kaydı yok.</small>'}
      </section>
      <button class="btn soft" data-a="go" data-to="score">${ic('chart', 18)} Aylık değerlendirmeye git</button>
    </div>`;
  },
  acts: { stT(t) { App.cur.entry.params.tab = t.dataset.v; App.forceRefresh(); } }
};
