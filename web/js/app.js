/* Uygulama kabuğu: yönlendirme, alt menü, alt sayfalar, kilit, açılış */
'use strict';

const Screens = {};

const App = {
  stack: [],
  sheets: [],

  init() {
    S.load();
    Theme.apply();
    App.buildNav();
    document.addEventListener('click', App.onClick);
    document.addEventListener('input', App.onInput);
    document.addEventListener('change', App.onChange);
    S.on(() => { if (!App.sheets.length || App.sheets[App.sheets.length - 1].live) App.refreshSoon(); });

    window.__back = App.backKey;
    window.__pause = () => { S.saveNow(); Sync.flush(); App.pausedAt = Date.now(); };
    window.__resume = App.resume;

    if (!S.set.onboarded) { App.onboarding(); return; }
    App.start();
  },

  start() {
    const st = S.set.start === 'agenda' ? 'agenda' : 'home';
    App.go(st, {}, { reset: true });
    if (S.set.lock && S.set.lock.on) Lock.show();
    App.lastDay = U.today();
    setTimeout(() => {
      Notify.push();
      const last = S.sync.updChecked || 0;
      if (Date.now() - last > 6 * 3600000) Upd.check();
      if (Sync.ready() && Date.now() - (S.sync.last || 0) > 30 * 60000) Sync.push();
    }, 1500);
  },

  resume() {
    if (S.set.lock && S.set.lock.on && App.pausedAt && Date.now() - App.pausedAt > 60000) Lock.show();
    if (App.lastDay !== U.today()) { App.lastDay = U.today(); App.refresh(); }
    Notify.push();
  },

  /* ---------- alt menü ---------- */
  buildNav() {
    const nav = document.getElementById('nav');
    nav.innerHTML = `
      <button data-nav="home">${icf('home', 21)}Ana Sayfa</button>
      <button data-nav="sections">${ic('grid', 21)}Bölümler</button>
      <div><button class="plus" data-a="quickAdd" aria-label="Hızlı ekle">${ic('plus', 22, 2.2)}</button></div>
      <button data-nav="agenda">${ic('calChk', 21)}Ajanda</button>
      <button data-nav="settings">${ic('gear', 21)}Ayarlar<i class="upddot hidden" style="position:absolute;margin-left:22px;margin-top:-30px;width:7px;height:7px;border-radius:50%;background:var(--ac)"></i></button>`;
  },
  updateBadge(on) { const d = document.querySelector('.upddot'); if (d) d.classList.toggle('hidden', !on); },
  setNav(name) {
    document.querySelectorAll('#nav [data-nav]').forEach(b => {
      const on = b.dataset.nav === name;
      b.classList.toggle('on', on);
      if (b.dataset.nav === 'home') b.innerHTML = (on ? icf('home', 21) : ic('home', 21)) + 'Ana Sayfa';
    });
  },

  /* ---------- yönlendirme ---------- */
  go(name, params, opts) {
    opts = opts || {};
    while (App.sheets.length) App.closeSheet();
    if (opts.reset) App.stack = [];
    if (App.cur && App.cur.screen.leave) App.cur.screen.leave(App.cur.params);
    const entry = { name, params: params || {}, scroll: 0 };
    if (opts.replace) App.stack.pop();
    App.stack.push(entry);
    App.show(entry, true);
  },
  back() {
    if (App.stack.length <= 1) return false;
    const leaving = App.stack[App.stack.length - 1];
    const sc = Screens[leaving.name];
    if (sc && sc.leave) sc.leave(leaving.params);
    App.stack.pop();
    App.show(App.stack[App.stack.length - 1], false);
    return true;
  },
  show(entry, anim) {
    const sc = Screens[entry.name];
    App.cur = { screen: sc, params: entry.params, entry };
    const el = document.getElementById('screen');
    const nav = document.getElementById('nav');
    const noNav = !!sc.noNav;
    nav.classList.toggle('hidden', noNav);
    el.classList.toggle('nonav', noNav);
    App.setNav(sc.nav || entry.name);
    el.innerHTML = `<div class="${anim ? 'page-in' : ''}">${sc.render(entry.params)}</div>`;
    el.scrollTop = anim ? 0 : (entry.scroll || 0);
    if (sc.mount) sc.mount(el, entry.params);
  },
  refreshSoon() { clearTimeout(App._rt); App._rt = setTimeout(App.refresh, 30); },
  refresh() {
    if (!App.cur) return;
    const sc = App.cur.screen;
    const force = App._force;
    App._force = false;
    if (sc.noAutoRefresh && !force) return;
    const el = document.getElementById('screen');
    const st = el.scrollTop;
    const ae = document.activeElement;
    if (!force && ae && (ae.tagName === 'TEXTAREA' || ae.tagName === 'INPUT') && el.contains(ae)) return; /* yazarken bozma */
    el.innerHTML = `<div>${sc.render(App.cur.params)}</div>`;
    el.scrollTop = st;
    if (sc.mount) sc.mount(el, App.cur.params);
  },
  forceRefresh() { App._force = true; App.refresh(); },
  backKey() {
    if (Lock.on) return true;
    if (App.sheets.length) { App.closeSheet(); return true; }
    return App.back();
  },

  /* ---------- olay dağıtımı ---------- */
  findAct(name) {
    for (let i = App.sheets.length - 1; i >= 0; i--) if (App.sheets[i].acts && App.sheets[i].acts[name]) return App.sheets[i].acts[name];
    if (App.cur && App.cur.screen.acts && App.cur.screen.acts[name]) return App.cur.screen.acts[name];
    return Acts[name];
  },
  onClick(e) {
    const nb = e.target.closest('[data-nav]');
    if (nb) { const n = nb.dataset.nav; if (!App.cur || App.cur.entry.name !== n || App.stack.length > 1) App.go(n, {}, { reset: true }); else document.getElementById('screen').scrollTo({ top: 0, behavior: 'smooth' }); return; }
    const t = e.target.closest('[data-a]');
    if (!t) return;
    const fn = App.findAct(t.dataset.a);
    if (fn) { e.preventDefault(); fn(t, e); }
  },
  onInput(e) {
    const t = e.target.closest('[data-in]');
    if (!t) return;
    if (t.tagName === 'TEXTAREA') App.autoGrow(t);
    const fn = App.findAct(t.dataset.in);
    if (fn) fn(t, e);
  },
  onChange(e) {
    const t = e.target.closest('[data-ch]');
    if (!t) return;
    const fn = App.findAct(t.dataset.ch);
    if (fn) fn(t, e);
  },
  autoGrow(t) { t.style.height = 'auto'; t.style.height = (t.scrollHeight + 2) + 'px'; },
  growAll(root) { (root || document).querySelectorAll('textarea.grow').forEach(App.autoGrow); },

  /* ---------- alt sayfa ---------- */
  sheet(html, opts) {
    opts = opts || {};
    const host = document.getElementById('sheets');
    const bg = document.createElement('div'); bg.className = 'sheet-bg';
    const sh = document.createElement('div'); sh.className = 'sheet';
    sh.innerHTML = '<div class="grab"></div>' + html;
    host.appendChild(bg); host.appendChild(sh);
    const rec = { bg, sh, acts: opts.acts || {}, onClose: opts.onClose, live: opts.live };
    App.sheets.push(rec);
    bg.addEventListener('click', () => App.closeSheet());
    requestAnimationFrame(() => { bg.classList.add('open'); sh.classList.add('open'); });
    App.growAll(sh);
    if (opts.mount) opts.mount(sh);
    return rec;
  },
  closeSheet(rec) {
    rec = rec || App.sheets[App.sheets.length - 1];
    if (!rec) return;
    App.sheets.splice(App.sheets.indexOf(rec), 1);
    rec.bg.classList.remove('open'); rec.sh.classList.remove('open');
    setTimeout(() => { rec.bg.remove(); rec.sh.remove(); }, 300);
    if (rec.onClose) rec.onClose();
    App.refreshSoon();
  },
  setSheet(rec, html) {
    rec.sh.innerHTML = '<div class="grab"></div>' + html;
    App.growAll(rec.sh);
  },
  confirm(msg, yes, danger) {
    return new Promise(res => {
      const rec = App.sheet(`<h3>${U.esc(msg)}</h3><div class="row"><button class="btn ghost sp" data-a="cNo">Vazgeç</button><button class="btn ${danger ? 'danger' : ''} sp" data-a="cYes">${U.esc(yes || 'Evet')}</button></div>`,
        { acts: { cNo: () => { App.closeSheet(rec); res(false); }, cYes: () => { App.closeSheet(rec); res(true); } }, onClose: () => res(false) });
    });
  },
  prompt(title, val, ph) {
    return new Promise(res => {
      let done = false;
      const rec = App.sheet(`<h3>${U.esc(title)}</h3><input class="inp" id="pIn" value="${U.esc(val || '')}" placeholder="${U.esc(ph || '')}"><div class="row"><button class="btn ghost sp" data-a="pNo">Vazgeç</button><button class="btn sp" data-a="pOk">Kaydet</button></div>`,
        {
          acts: { pNo: () => App.closeSheet(rec), pOk: () => { done = true; const v = rec.sh.querySelector('#pIn').value.trim(); App.closeSheet(rec); res(v); } },
          onClose: () => { if (!done) res(null); }, mount: sh => setTimeout(() => sh.querySelector('#pIn').focus(), 250)
        });
    });
  },

  /* ---------- açılış (ilk kurulum) ---------- */
  onboarding() {
    document.getElementById('nav').classList.add('hidden');
    const el = document.getElementById('screen');
    el.classList.add('nonav');
    el.innerHTML = `<div class="page-in" style="min-height:100%;display:flex;flex-direction:column;justify-content:center;padding:30px 22px;gap:22px">
      <div style="color:var(--ac)">${ic('spark', 40, 1.4)}</div>
      <h1 class="serif" style="font-size:38px;line-height:1.05">Hoş geldin.</h1>
      <p class="mu" style="margin:0;font-size:15px;line-height:1.6">Burası senin dijital ajandan: planların, notların, günlüğün ve alışkanlıkların tek yerde.</p>
      <div class="field"><label>Sana nasıl seslenelim?</label><input class="inp" id="obName" placeholder="Adın" autocomplete="off"></div>
      <button class="btn wide" data-a="obStart">Başla</button>
      <button class="btn ghost wide" data-a="obRestore">${ic('cloud', 18)} Yedekten geri yükle</button>
    </div>`;
  },
  finishOnboarding(name) {
    if (name != null) S.set.name = name;
    S.set.onboarded = true; S.set.updated = Date.now();
    if (!S.water()) S.newHabit({ name: 'Su içmek', kind: 'water', target: S.set.waterTarget || 8, unit: 'bardak', color: '#8FB7C9', weekly: 7 });
    if (S.db.habits.length < 2) {
      S.newHabit({ name: 'Kitap okumak', color: '#D9B47A', target: 1, weekly: 5 });
      S.newHabit({ name: 'Spor', color: '#E89AAD', target: 1, weekly: 3 });
    }
    S.touch(); S.saveNow();
    App.start();
    setTimeout(() => { if (N && !Notify.allowed()) Notify.ask(); }, 900);
  }
};

/* ---------- genel eylemler ---------- */
const Acts = {
  back() { App.back(); },
  go(t) { App.go(t.dataset.to, t.dataset.p ? JSON.parse(t.dataset.p) : {}); },
  closeSheet() { App.closeSheet(); },
  obStart() {
    const n = document.getElementById('obName').value.trim();
    if (!n) { document.getElementById('obName').focus(); U.toast('Adını yazar mısın?'); return; }
    App.finishOnboarding(n);
  },
  obRestore() { SyncUI.open({ restoreFirst: true }); },
  quickAdd() {
    const it = (a, i, l) => `<button data-a="${a}">${ic(i, 24, 1.6)}${l}</button>`;
    const rec = App.sheet(`<h3>Ne eklemek istersin?</h3><div class="addgrid">
      ${it('qaTask', 'task', 'Görev')}${it('qaEvent', 'bell', 'Hatırlatıcı / Etkinlik')}${it('qaNote', 'noteAdd', 'Not')}
      ${it('qaJournal', 'journal', 'Günlük')}${it('qaHabit', 'target', 'Alışkanlık')}${it('qaBook', 'book', 'Kitap')}</div>`, {
      acts: {
        qaTask: () => { App.closeSheet(rec); TaskSheet.open(null, { date: App.agendaDate || U.today() }); },
        qaEvent: () => { App.closeSheet(rec); TaskSheet.open(null, { kind: 'event', date: App.agendaDate || U.today(), remind: 0 }); },
        qaNote: () => { App.closeSheet(rec); Acts.newNote(); },
        qaJournal: () => { App.closeSheet(rec); App.go('journal', { k: U.today() }); },
        qaHabit: () => { App.closeSheet(rec); HabitSheet.open(); },
        qaBook: () => { App.closeSheet(rec); BookSheet.open(); }
      }
    });
  },
  newNote(t) {
    const n = S.newNote({ folder: t && t.dataset.folder || null });
    App.go('note', { id: n.id, fresh: 1 });
  },
  soon(t) { App.go('soon', { name: t.dataset.name, icon: t.dataset.icon }); }
};

/* ---------- kilit ---------- */
const Lock = {
  on: false, entry: '',
  async hash(pin) {
    const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('ajanda:' + pin));
    return U.bytesToB64(new Uint8Array(b));
  },
  show() {
    if (Lock.on) return;
    Lock.on = true; Lock.entry = '';
    const d = document.createElement('div'); d.id = 'lock';
    document.body.appendChild(d);
    Lock.draw();
    if (S.set.lock.bio && N && N.biometricAvailable()) setTimeout(Lock.bio, 350);
  },
  draw(shake) {
    const d = document.getElementById('lock'); if (!d) return;
    const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    d.innerHTML = `<div style="color:var(--ac)">${ic('lock', 30, 1.5)}</div><h1>${U.esc(S.set.name || 'Merhaba')}</h1>
      <div class="pdots ${shake ? 'shake' : ''}">${[0, 1, 2, 3].map(i => `<i class="${i < Lock.entry.length ? 'on' : ''}"></i>`).join('')}</div>
      <div class="pinpad">${keys.map(k => `<button data-k="${k}">${k}</button>`).join('')}
      <button class="clear" data-k="bio">${S.set.lock.bio ? ic('fp', 28, 1.5) : ''}</button><button data-k="0">0</button><button class="clear" data-k="del">Sil</button></div>`;
    d.querySelectorAll('[data-k]').forEach(b => b.onclick = () => Lock.key(b.dataset.k));
  },
  async key(k) {
    if (k === 'bio') { Lock.bio(); return; }
    if (k === 'del') Lock.entry = Lock.entry.slice(0, -1);
    else if (Lock.entry.length < 4) Lock.entry += k;
    Lock.draw();
    if (Lock.entry.length === 4) {
      if (await Lock.hash(Lock.entry) === S.set.lock.pin) Lock.hide();
      else { Lock.entry = ''; U.vibrate(60); Lock.draw(true); }
    }
  },
  bio() {
    if (!N) return;
    window.__onBio = ok => { if (ok) Lock.hide(); };
    N.biometric('Kilidi aç');
  },
  hide() {
    Lock.on = false;
    const d = document.getElementById('lock'); if (d) d.remove();
  }
};

window.addEventListener('load', () => {
  try { App.init(); } catch (e) {
    document.getElementById('screen').innerHTML = '<div style="padding:30px">Bir hata oluştu: ' + U.esc(e.message) + '</div>';
    console.error(e);
  }
});
