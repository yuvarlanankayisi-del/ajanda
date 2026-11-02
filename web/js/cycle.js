/* Döngüm (regl takibi, ortak takvimden ayrı) ve Özel Günler */
'use strict';

const SYMPTOMS = ['Kramp', 'Baş ağrısı', 'Şişkinlik', 'Yorgunluk', 'Sivilce', 'Göğüs hassasiyeti', 'Duygu değişimi', 'İştah', 'Bel ağrısı', 'Uykusuzluk'];
const FLOWS = [{ v: 1, l: 'Hafif' }, { v: 2, l: 'Orta' }, { v: 3, l: 'Yoğun' }];

const Cyc = {
  get() {
    if (!S.db.cycle) S.db.cycle = { periods: [], logs: {}, avgCycle: 28, avgLen: 5, notify: true, lock: false, updated: Date.now() };
    return S.db.cycle;
  },
  save() { Cyc.get().updated = Date.now(); S.touch(); },
  sorted() { return Cyc.get().periods.slice().sort((a, b) => a.start < b.start ? -1 : 1); },
  open() { return Cyc.sorted().find(p => !p.end); },
  stats() {
    const c = Cyc.get(), ps = Cyc.sorted();
    const lens = ps.filter(p => p.end).map(p => U.diffDays(p.start, p.end) + 1).slice(-6);
    const cyc = []; for (let i = 1; i < ps.length; i++) { const d = U.diffDays(ps[i - 1].start, ps[i].start); if (d > 15 && d < 60) cyc.push(d); }
    const avg = a => a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : null;
    return { cycle: avg(cyc.slice(-6)) || c.avgCycle || 28, len: avg(lens) || c.avgLen || 5, n: ps.length };
  },
  next() {
    const ps = Cyc.sorted(); if (!ps.length) return null;
    const st = Cyc.stats(); let k = U.addDays(ps[ps.length - 1].start, st.cycle);
    while (k < U.today() && !Cyc.open()) k = U.addDays(k, st.cycle);
    return k;
  },
  inPeriod(k) { return Cyc.get().periods.some(p => k >= p.start && k <= (p.end || U.today())); },
  predicted(k) {
    const n = Cyc.next(); if (!n || Cyc.open()) return false;
    const st = Cyc.stats();
    for (let i = 0; i < 3; i++) { const s0 = U.addDays(n, i * st.cycle); if (k >= s0 && k <= U.addDays(s0, st.len - 1)) return true; }
    return false;
  },
  dayOfCycle() { const ps = Cyc.sorted(); if (!ps.length) return null; const last = ps.filter(p => p.start <= U.today()).pop(); return last ? U.diffDays(last.start, U.today()) + 1 : null; },
  reminders() {
    const c = Cyc.get(); if (!c.notify) return [];
    const n = Cyc.next(); if (!n) return [];
    const d = U.parse(U.addDays(n, -2)); d.setHours(9, 0, 0, 0);
    return d.getTime() > Date.now() ? [{ id: 599001, at: d.getTime(), title: 'Kişisel hatırlatma', body: 'Yaklaşık 2 gün kaldı' }] : [];
  }
};

/* bölüm şifresi (uygulama kilidinin şifresiyle) */
const PinCheck = {
  ask(title) {
    return new Promise(res => {
      if (!S.set.lock || !S.set.lock.pin) return res(true);
      let cur = '', ok = false;
      const draw = msg => `<h3 style="text-align:center">${msg}</h3><div class="pdots" style="justify-content:center;align-self:center">${[0, 1, 2, 3].map(i => `<i class="${i < cur.length ? 'on' : ''}"></i>`).join('')}</div>
        <div class="pinpad" style="align-self:center">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(k => `<button data-a="pc" data-k="${k}">${k}</button>`).join('')}<button class="clear" data-a="pc" data-k="bio">${S.set.lock.bio ? ic('fp', 26, 1.5) : ''}</button><button data-a="pc" data-k="0">0</button><button class="clear" data-a="pc" data-k="del">Sil</button></div>`;
      const rec = App.sheet(draw(title), {
        onClose: () => { if (!ok) res(false); },
        acts: {
          pc: async b => {
            const k = b.dataset.k;
            if (k === 'bio') { if (N) { window.__onBio = r => { if (r) { ok = true; App.closeSheet(rec); res(true); } }; N.biometric(title); } return; }
            if (k === 'del') cur = cur.slice(0, -1); else if (cur.length < 4) cur += k;
            App.setSheet(rec, draw(title));
            if (cur.length === 4) {
              if (await Lock.hash(cur) === S.set.lock.pin) { ok = true; App.closeSheet(rec); res(true); }
              else { cur = ''; U.vibrate(60); App.setSheet(rec, draw('Şifre yanlış')); }
            }
          }
        }
      });
    });
  }
};

Screens.cycle = {
  nav: 'sections',
  render(p) {
    const c = Cyc.get(), tk = U.today();
    const sel = p.k || tk; p.k = sel;
    const ym = p.ym || sel.slice(0, 7); p.ym = ym;
    const st = Cyc.stats(), nx = Cyc.next(), op = Cyc.open(), doc = Cyc.dayOfCycle();
    const [y, m] = ym.split('-').map(Number);
    const first = new Date(y, m - 1, 1), start = U.addDays(U.key(first), -((first.getDay() + 6) % 7));
    const cells = [];
    for (let i = 0; i < 42; i++) {
      const k = U.addDays(start, i), d = U.parse(k);
      if (i >= 35 && d.getMonth() !== m - 1) break;
      const inP = Cyc.inPeriod(k), pr = Cyc.predicted(k), lg = c.logs[k];
      cells.push(`<button data-a="cySel" data-k="${k}" class="${d.getMonth() !== m - 1 ? 'out' : ''} ${k === tk ? 'today' : ''}" style="${inP ? 'background:#C4566F;color:#fff' : pr ? 'border:1.5px dashed #E89AAD' : ''}${k === sel ? ';box-shadow:0 0 0 2px var(--tx)' : ''}">${d.getDate()}<span class="dots">${lg && (lg.symptoms || []).length ? '<i style="background:var(--gold)"></i>' : ''}</span></button>`);
    }
    const lg = c.logs[sel] || {};
    const ringPct = doc ? Math.min(1, doc / st.cycle) : 0;
    const left = nx ? U.diffDays(tk, nx) : null;
    const hist = Cyc.sorted().slice().reverse().slice(0, 8);
    return `<div class="topbar" style="padding-top:18px">${App.stack.length > 1 ? `<button class="icbtn box" data-a="back">${ic('back', 20, 1.8)}</button>` : ''}<h1>Döngüm</h1>
      <button class="icbtn box" data-a="cySet" aria-label="Ayarlar">${ic('gear', 19)}</button></div>
    <div class="wrap pad">
      <section class="card big col" style="align-items:center;gap:10px;text-align:center">
        ${U.ring(150, 10, op ? 1 : ringPct, op ? '#C4566F' : '#E89AAD', null)}
        <div style="margin-top:-112px;height:80px;display:flex;flex-direction:column;align-items:center;justify-content:center">
          ${op ? `<b class="serif" style="font-size:30px">${U.diffDays(op.start, tk) + 1}. gün</b><small class="mu">regl</small>` : doc ? `<b class="serif" style="font-size:30px">${doc}. gün</b><small class="mu">döngü</small>` : `<b class="serif" style="font-size:20px">Başlayalım</b>`}</div>
        <div style="height:24px"></div>
        <span style="font-size:14px">${op ? 'Bitince "Bitti" de' : nx ? `Sonraki dönem tahmini: <b>${U.fmt(nx, 'dm')}</b> · ${left <= 0 ? 'bugün' : left + ' gün sonra'}` : 'İlk dönemini işaretle, sonrakileri tahmin edeyim.'}</span>
        ${op ? `<button class="btn wide" data-a="cyEnd">Regl bitti</button>` : `<button class="btn wide" data-a="cyStart">Regl başladı</button>`}
        <small class="mu2" style="font-size:11px">Ortalama döngü ${st.cycle} gün · regl ${st.len} gün${st.n < 3 ? ' (veri arttıkça tahmin iyileşir)' : ''}</small>
      </section>

      <section class="card big col" style="gap:10px">
        <div class="row"><button class="icbtn" data-a="cyM" data-n="-1">${ic('left', 20)}</button><h2 class="h2s sp" style="text-align:center">${U.months[m - 1]} ${y}</h2><button class="icbtn" data-a="cyM" data-n="1">${ic('right', 20)}</button></div>
        <div class="month">${U.daysS.map(x => `<div class="h">${x}</div>`).join('')}${cells.join('')}</div>
        <div class="row" style="gap:12px;flex-wrap:wrap;font-size:11px"><span class="row" style="gap:4px"><i class="cdot" style="background:#C4566F"></i>Regl</span><span class="row" style="gap:4px"><i class="cdot" style="border:1.5px dashed #E89AAD;width:9px;height:9px"></i>Tahmin</span><span class="row" style="gap:4px"><i class="cdot" style="background:var(--gold)"></i>Belirti</span></div>
      </section>

      <section class="card big col" style="gap:12px"><h2 class="h2s">${sel === tk ? 'Bugün' : U.fmt(sel, 'long')}</h2>
        ${Cyc.inPeriod(sel) ? `<div class="field"><label>Akış</label><div class="opts">${FLOWS.map(f => `<button class="${lg.flow === f.v ? 'on' : ''}" data-a="cyFlow" data-v="${f.v}">${f.l}</button>`).join('')}</div></div>` : ''}
        <div class="field"><label>Belirtiler</label><div class="opts">${SYMPTOMS.map(x => `<button class="${(lg.symptoms || []).includes(x) ? 'on' : ''}" data-a="cySym" data-v="${x}">${x}</button>`).join('')}</div></div>
        <div class="field"><label>Not</label><textarea class="inp grow" rows="1" data-in="cyNote" data-k="${sel}" placeholder="İsteğe bağlı" style="min-height:0">${U.esc(lg.note || '')}</textarea></div>
        ${!Cyc.inPeriod(sel) && sel <= tk ? `<button class="btn ghost sm" data-a="cyMark" style="align-self:flex-start">Bu günü regl olarak işaretle</button>` : ''}
      </section>

      ${hist.length ? `<section class="card big col" style="gap:4px"><h2 class="h2s" style="padding-bottom:6px">Geçmiş</h2>${hist.map(h => `<div class="row" style="min-height:42px;border-bottom:1px solid var(--line2)"><span class="cdot" style="background:#C4566F"></span><span class="sp">${U.fmt(h.start, 'dm')}${h.end ? ' – ' + U.fmt(h.end, 'dm') : ' · devam ediyor'}</span><small class="mu">${h.end ? (U.diffDays(h.start, h.end) + 1) + ' gün' : ''}</small><button class="icbtn" data-a="cyDel" data-id="${h.id}" style="width:34px;color:var(--mu2)">${ic('x', 15)}</button></div>`).join('')}</section>` : ''}
      <p class="mu2" style="font-size:11px;text-align:center;margin:0">Tahminler geçmiş kayıtlarına göre yapılan yaklaşık hesaplardır. Ortak takvimde ve aramada görünmez.</p>
    </div>`;
  },
  mount(el) { App.growAll(el); },
  acts: {
    cySel(t) { App.cur.entry.params.k = t.dataset.k; App.forceRefresh(); },
    cyM(t) { const p = App.cur.entry.params; const [y, m] = p.ym.split('-').map(Number); const d = new Date(y, m - 1 + (+t.dataset.n), 1); p.ym = d.getFullYear() + '-' + U.pad(d.getMonth() + 1); App.forceRefresh(); },
    cyStart() { const k = App.cur.params.k <= U.today() ? App.cur.params.k : U.today(); Cyc.get().periods.push({ id: U.id(), start: k, end: null }); Cyc.save(); App.forceRefresh(); },
    cyEnd() { const o = Cyc.open(); const k = App.cur.params.k; o.end = k >= o.start && k <= U.today() ? k : U.today(); Cyc.save(); App.forceRefresh(); },
    cyMark() {
      const k = App.cur.params.k, c = Cyc.get();
      const near = c.periods.find(p => p.end && (U.diffDays(p.end, k) === 1));
      const nearS = c.periods.find(p => U.diffDays(k, p.start) === 1);
      if (near) near.end = k; else if (nearS) nearS.start = k; else c.periods.push({ id: U.id(), start: k, end: k });
      Cyc.save(); App.forceRefresh();
    },
    async cyDel(t) { if (await App.confirm('Bu kayıt silinsin mi?', 'Sil', true)) { const c = Cyc.get(); c.periods = c.periods.filter(p => p.id !== t.dataset.id); Cyc.save(); App.forceRefresh(); } },
    cyFlow(t) { const c = Cyc.get(), k = App.cur.params.k; const l = c.logs[k] = c.logs[k] || {}; l.flow = l.flow === +t.dataset.v ? null : +t.dataset.v; Cyc.save(); App.forceRefresh(); },
    cySym(t) { const c = Cyc.get(), k = App.cur.params.k; const l = c.logs[k] = c.logs[k] || {}; l.symptoms = l.symptoms || []; const v = t.dataset.v; l.symptoms = l.symptoms.includes(v) ? l.symptoms.filter(x => x !== v) : l.symptoms.concat(v); Cyc.save(); App.forceRefresh(); },
    cyNote: U.debounce(t => { const c = Cyc.get(), k = t.dataset.k; const l = c.logs[k] = c.logs[k] || {}; l.note = t.value; c.updated = Date.now(); S.touch({ quiet: true }); }, 500),
    cySet() {
      const c = Cyc.get();
      const rec = App.sheet(`<h3>Döngüm ayarları</h3>
        <div class="g2" style="gap:10px"><div class="field"><label>Döngü süresi (gün)</label><input class="inp" type="number" id="cyC" value="${c.avgCycle || 28}" min="18" max="45"></div><div class="field"><label>Regl süresi (gün)</label><input class="inp" type="number" id="cyL" value="${c.avgLen || 5}" min="1" max="12"></div></div>
        <small class="mu">Yeterli kayıt olunca bu değerler yerine senin ortalamaların kullanılır.</small>
        <div class="set"><div class="r"><span class="sp">2 gün önce hatırlat<small>Bildirimde yalnızca "Kişisel hatırlatma" yazar</small></span><span class="sw ${c.notify ? 'on' : ''}" data-a="cyN"></span></div>
          <div class="r"><span class="sp">Açarken şifre sor<small>${S.set.lock && S.set.lock.on ? 'Uygulama kilidinin şifresi kullanılır' : "Önce Ayarlar → Gizlilik'ten kilit şifresi belirle"}</small></span><span class="sw ${c.lock ? 'on' : ''}" data-a="cyLk"></span></div></div>
        <button class="btn wide" data-a="cyS">Kaydet</button>`, {
        acts: {
          cyN: b => { c.notify = !c.notify; b.classList.toggle('on', c.notify); },
          cyLk: b => { if (!(S.set.lock && S.set.lock.on)) return U.toast('Önce uygulama kilidini aç'); c.lock = !c.lock; b.classList.toggle('on', c.lock); },
          cyS: () => { c.avgCycle = Math.max(18, Math.min(45, +rec.sh.querySelector('#cyC').value || 28)); c.avgLen = Math.max(1, Math.min(12, +rec.sh.querySelector('#cyL').value || 5)); Cyc.save(); App.closeSheet(rec); }
        }
      });
    }
  }
};

/* ---------- özel günler (ortak takvime bağlı: yıllık etkinlik olarak saklanır) ---------- */
const SPECIAL_T = [{ v: 'birthday', l: 'Doğum günü', i: 'gift' }, { v: 'anniv', l: 'Yıldönümü', i: 'heart' }, { v: 'countdown', l: 'Geri sayım', i: 'clock' }, { v: 'other', l: 'Önemli gün', i: 'star' }];
const SPECIAL_R = [{ v: null, l: 'Yok' }, { v: 0, l: 'Aynı gün' }, { v: 1440, l: '1 gün önce' }, { v: 4320, l: '3 gün önce' }, { v: 10080, l: '1 hafta önce' }];
const Special = {
  list() { return S.db.tasks.filter(t => t.special); },
  nextDate(t) {
    if (!t.repeat || t.repeat === 'none') return t.date;
    const tk = U.today(), d = U.parse(t.date);
    let y = new Date().getFullYear();
    let k = y + '-' + U.pad(d.getMonth() + 1) + '-' + U.pad(d.getDate());
    if (k < tk) k = (y + 1) + k.slice(4);
    return k;
  }
};
Screens.special = {
  nav: 'sections',
  render() {
    const tk = U.today();
    const all = Special.list().map(t => ({ t, k: Special.nextDate(t) })).sort((a, b) => a.k < b.k ? -1 : 1);
    const up = all.filter(x => x.k >= tk), past = all.filter(x => x.k < tk);
    const card = x => {
      const t = x.t, left = U.diffDays(tk, x.k), ty = SPECIAL_T.find(s => s.v === t.special) || SPECIAL_T[3];
      const yrs = t.repeat === 'yearly' ? U.parse(x.k).getFullYear() - U.parse(t.date).getFullYear() : 0;
      return `<button class="exam" data-a="spEdit" data-id="${t.id}"><div class="ecd" style="background:rgba(241,194,125,.16);color:var(--gold);width:64px;height:64px"><b>${left < 0 ? '✓' : left === 0 ? '★' : left}</b><small>${left === 0 ? 'bugün' : left < 0 ? 'geçti' : 'gün'}</small></div>
        <div class="col sp" style="gap:3px;text-align:left;min-width:0"><b style="font-size:15px">${U.esc(t.title)}</b><small class="mu">${ty.l} · ${U.fmt(x.k, 'long')}</small>${yrs > 0 ? `<small style="color:var(--gold)">${yrs}. ${t.special === 'birthday' ? 'yaş' : 'yıl'}</small>` : ''}</div></button>`;
    };
    return `<div class="topbar" style="padding-top:18px">${App.stack.length > 1 ? `<button class="icbtn box" data-a="back">${ic('back', 20, 1.8)}</button>` : ''}<h1>Özel Günler</h1>
      <button class="icbtn box" data-a="spNew" aria-label="Ekle">${ic('plus', 20, 2)}</button></div>
    <div class="wrap pad">
      ${up.length ? up.map(card).join('') : `<div class="col" style="align-items:center;padding:40px 20px;gap:12px;text-align:center"><span style="color:var(--gold)">${ic('gift', 40, 1.3)}</span><span class="mu">Doğum günleri, yıldönümleri ve geri saydığın günler burada. Hepsi ajandada da görünür ve önceden hatırlatılır.</span><button class="btn soft" data-a="spNew">Özel gün ekle</button></div>`}
      ${past.length ? `<div class="lbl">Geçmiş geri sayımlar</div><div class="col" style="gap:8px;opacity:.6">${past.map(card).join('')}</div>` : ''}
    </div>`;
  },
  acts: {
    spNew() { SpecialSheet.open(); },
    spEdit(t) { SpecialSheet.open(S.db.tasks.find(x => x.id === t.dataset.id)); }
  }
};
const SpecialSheet = {
  open(t) {
    const isNew = !t;
    const f = Object.assign({ title: '', special: 'birthday', date: U.today(), remind: 1440, note: '' }, t || {});
    f.yearly = t ? t.repeat === 'yearly' : true;
    const draw = () => `<div class="row"><h3 class="sp">${isNew ? 'Özel gün ekle' : 'Özel gün'}</h3>${!isNew ? `<button class="icbtn" data-a="sgDel" style="color:#F19AA2">${ic('trash', 20)}</button>` : ''}</div>
      <input class="inp" id="sgT" value="${U.esc(f.title)}" placeholder="ör. Annemin doğum günü, Tatile kaç gün">
      <div class="opts">${SPECIAL_T.map(x => `<button class="${f.special === x.v ? 'on' : ''}" data-a="sgTy" data-v="${x.v}">${x.l}</button>`).join('')}</div>
      <div class="field"><label>Tarih${f.special === 'birthday' ? ' (doğum yılıyla girersen yaşı da gösterir)' : ''}</label><input type="date" class="inp" id="sgD" value="${f.date}"></div>
      <div class="opts"><button class="${f.yearly ? 'on' : ''}" data-a="sgY" data-v="1">Her yıl tekrarla</button><button class="${!f.yearly ? 'on' : ''}" data-a="sgY" data-v="0">Bir kez</button></div>
      <div class="field"><label>Hatırlatma (sabah 09:00)</label><div class="opts">${SPECIAL_R.map(r => `<button class="${f.remind === r.v ? 'on' : ''}" data-a="sgR" data-v="${r.v}">${r.l}</button>`).join('')}</div></div>
      <textarea class="inp grow" id="sgN" rows="1" placeholder="Not (hediye fikri vb.)" style="min-height:0">${U.esc(f.note || '')}</textarea>
      <button class="btn wide" data-a="sgSave">${isNew ? 'Ekle' : 'Kaydet'}</button>`;
    const grab = () => { const s = rec.sh; f.title = s.querySelector('#sgT').value; f.date = s.querySelector('#sgD').value || U.today(); f.note = s.querySelector('#sgN').value; };
    const rec = App.sheet(draw(), {
      mount: sh => { if (isNew) setTimeout(() => sh.querySelector('#sgT').focus(), 300); },
      acts: {
        sgTy: b => { grab(); f.special = b.dataset.v; if (f.special === 'countdown') f.yearly = false; App.setSheet(rec, draw()); },
        sgY: b => { grab(); f.yearly = b.dataset.v === '1'; App.setSheet(rec, draw()); },
        sgR: b => { grab(); f.remind = b.dataset.v === 'null' ? null : +b.dataset.v; App.setSheet(rec, draw()); },
        sgDel: async () => { App.closeSheet(rec); if (await App.confirm('Silinsin mi?', 'Sil', true)) S.remove('tasks', t.id); },
        sgSave: async () => {
          grab(); if (!f.title.trim()) return U.toast('Bir ad yaz');
          const data = { title: f.title.trim(), special: f.special, kind: 'event', date: f.date, time: '', repeat: f.yearly ? 'yearly' : 'none', remind: f.remind, cat: 'ozel', note: f.note.trim(), updated: Date.now() };
          if (isNew) S.newTask(data); else { Object.assign(t, data); S.touch(); }
          App.closeSheet(rec);
          if (f.remind != null && N && !Notify.allowed()) Notify.ask();
        }
      }
    });
  }
};
