/* Veri katmanı: tek JSON veritabanı, telefonda dosya olarak saklanır */
'use strict';

const DEFAULT_CATS = [
  { id: 'kisisel', name: 'Kişisel', color: '#E89AAD' },
  { id: 'ders', name: 'Ders', color: '#8FB7C9' },
  { id: 'is', name: 'İş', color: '#C9B4E0' },
  { id: 'ev', name: 'Ev', color: '#9CC0A6' },
  { id: 'saglik', name: 'Sağlık', color: '#D9B47A' },
  { id: 'ozel', name: 'Özel gün', color: '#F1C27D' }
];

function freshDb() {
  return {
    v: 1, createdAt: Date.now(),
    settings: {
      name: '', sub: '', theme: 'bordo', bg: 'isiklar', hero: 'oda', heroPhoto: null, start: 'home',
      waterTarget: 8, ongoing: true, shortcuts: ['books', 'travel', 'money', 'goals'],
      lock: { on: false, pin: null, bio: false }, onboarded: false, categories: DEFAULT_CATS.slice(),
      quoteIdx: 0, updated: Date.now()
    },
    tasks: [], notes: [], folders: [], days: {}, habits: [], books: [], photos: {}, deleted: {},
    goals: [], vision: [], courses: [], skills: [], shows: [], months: {}
  };
}

const S = {
  db: null,
  sync: null,
  listeners: [],
  dirty: false,

  load() {
    let raw = null;
    try { raw = N ? N.readText('db.json') : localStorage.getItem('ajanda.db'); } catch (e) { }
    if (raw) {
      try { S.db = JSON.parse(raw); } catch (e) { S.db = null; }
    }
    if (!S.db) {
      /* bozuk dosya: en son yerel yedeği dene */
      const b = S.latestBackup();
      S.db = b || freshDb();
    }
    S.migrate();
    let sraw = null;
    try { sraw = N ? N.readText('sync.json') : localStorage.getItem('ajanda.sync'); } catch (e) { }
    try { S.sync = sraw ? JSON.parse(sraw) : {}; } catch (e) { S.sync = {}; }
    S.sync.photos = S.sync.photos || {};
  },

  migrate() {
    const d = S.db, f = freshDb();
    for (const k of Object.keys(f)) if (d[k] === undefined) d[k] = f[k];
    for (const k of Object.keys(f.settings)) if (d.settings[k] === undefined) d.settings[k] = f.settings[k];
    if (!d.settings.categories || !d.settings.categories.length) d.settings.categories = DEFAULT_CATS.slice();
    /* saat girilmiş ama hatırlatması kapalı kalmış görevlere tam zamanında hatırlatma aç (bir kerelik) */
    if (!d.settings.migRemind) {
      const tk = U.today();
      for (const t of d.tasks) if (t.time && t.remind == null && (t.date >= tk || (t.repeat && t.repeat !== 'none'))) { t.remind = 0; t.updated = Date.now(); }
      d.settings.migRemind = 1; S.dirty = true;
    }
  },

  latestBackup() {
    if (!N) return null;
    try {
      const list = JSON.parse(N.listFiles('backups')).filter(n => n.endsWith('.json')).sort();
      for (let i = list.length - 1; i >= 0; i--) {
        const t = N.readText('backups/' + list[i]);
        if (t) return JSON.parse(t);
      }
    } catch (e) { }
    return null;
  },

  saveNow() {
    clearTimeout(S._st);
    if (!S.dirty) return;
    S.dirty = false;
    const txt = JSON.stringify(S.db);
    try {
      if (N) {
        N.writeText('db.json', txt);
        const k = U.today();
        if (S._bk !== k) {
          S._bk = k;
          if (!N.exists('backups/db-' + k + '.json')) {
            N.writeText('backups/db-' + k + '.json', txt);
            const list = JSON.parse(N.listFiles('backups')).filter(n => n.startsWith('db-')).sort();
            while (list.length > 7) N.deleteFile('backups/' + list.shift());
          }
        }
      } else localStorage.setItem('ajanda.db', txt);
    } catch (e) { console.error(e); }
  },

  saveSync() {
    const txt = JSON.stringify(S.sync);
    try { N ? N.writeText('sync.json', txt) : localStorage.setItem('ajanda.sync', txt); } catch (e) { }
  },

  /* her değişiklikten sonra çağrılır */
  touch(opts) {
    S.dirty = true;
    clearTimeout(S._st);
    S._st = setTimeout(S.saveNow, 400);
    S.changed = Date.now();
    if (!(opts && opts.quiet)) S.listeners.forEach(fn => { try { fn(); } catch (e) { console.error(e); } });
    if (typeof Notify !== 'undefined') Notify.later();
    if (typeof Sync !== 'undefined') Sync.later();
  },
  on(fn) { S.listeners.push(fn); },

  get set() { return S.db.settings; },

  cat(id) { return S.db.settings.categories.find(c => c.id === id) || S.db.settings.categories[0]; },

  remove(coll, id) {
    const a = S.db[coll];
    const i = a.findIndex(x => x.id === id);
    if (i >= 0) a.splice(i, 1);
    S.db.deleted[id] = Date.now();
    S.touch();
  },

  /* ===== fotoğraflar ===== */
  savePhoto(b64, w, h) {
    const id = 'p' + U.id();
    if (N) N.writeBase64('u/' + id + '.jpg', b64);
    else { try { localStorage.setItem('ajanda.ph.' + id, b64); } catch (e) { U.toast('Tarayıcı deposu dolu'); } }
    S.db.photos[id] = { w, h, at: Date.now() };
    S.touch({ quiet: true });
    return id;
  },
  photoUrl(id) {
    if (!id) return '';
    if (N) return '/u/' + id + '.jpg';
    const b = localStorage.getItem('ajanda.ph.' + id);
    return b ? 'data:image/jpeg;base64,' + b : '';
  },
  async addPhotos(multiple) {
    const files = await U.pickImages(multiple);
    const ids = [];
    for (const f of files) {
      try { const r = await U.compress(f, 1600, 0.82); ids.push(S.savePhoto(r.b64, r.w, r.h)); } catch (e) { U.toast('Fotoğraf açılamadı'); }
    }
    return ids;
  },

  /* ===== günler ===== */
  day(k, create) {
    let d = S.db.days[k];
    if (!d && create) { d = S.db.days[k] = { updated: Date.now() }; }
    return d || {};
  },
  setDay(k, field, val) {
    const d = S.day(k, true);
    d[field] = val; d.updated = Date.now();
    S.touch();
  },

  /* ===== görevler ===== */
  newTask(p) {
    const t = Object.assign({
      id: 't' + U.id(), title: '', kind: 'task', date: U.today(), time: '', remind: null,
      repeat: 'none', cat: 'kisisel', note: '', done: false, doneDates: {}, skip: {},
      created: Date.now(), updated: Date.now()
    }, p || {});
    S.db.tasks.push(t);
    S.touch();
    return t;
  },
  occurs(t, k) {
    if (!t.date) return false;
    if (t.skip && t.skip[k]) return false;
    if (!t.repeat || t.repeat === 'none') return t.date === k;
    if (k < t.date) return false;
    if (t.until && k > t.until) return false;
    const a = U.parse(t.date), b = U.parse(k);
    switch (t.repeat) {
      case 'daily': return true;
      case 'weekdays': return U.dow(k) < 5;
      case 'weekly': return U.dow(k) === U.dow(t.date);
      case 'monthly': return a.getDate() === b.getDate();
      case 'yearly': return a.getDate() === b.getDate() && a.getMonth() === b.getMonth();
    }
    return false;
  },
  isDone(t, k) {
    if (!t.repeat || t.repeat === 'none') return !!t.done;
    return !!(t.doneDates && t.doneDates[k]);
  },
  toggle(t, k) {
    if (!t.repeat || t.repeat === 'none') { t.done = !t.done; t.doneAt = t.done ? Date.now() : null; }
    else { t.doneDates = t.doneDates || {}; if (t.doneDates[k]) delete t.doneDates[k]; else t.doneDates[k] = Date.now(); }
    t.updated = Date.now();
    U.vibrate(10);
    S.touch();
  },
  tasksOn(k, opts) {
    const list = S.db.tasks.filter(t => S.occurs(t, k) && !t.archived);
    const kindOk = opts && opts.kind ? list.filter(t => t.kind === opts.kind) : list;
    return kindOk.sort((a, b) => {
      const da = S.isDone(a, k), db = S.isDone(b, k);
      if (da !== db) return da ? 1 : -1;
      const ta = a.time || '99', tb = b.time || '99';
      if (ta !== tb) return ta < tb ? -1 : 1;
      return a.created - b.created;
    });
  },
  movedFrom(k) {
    return S.db.tasks.filter(t => t.movedFrom === k && t.date !== k && (!t.repeat || t.repeat === 'none'));
  },
  postpone(t, k, toK) {
    if (!t.repeat || t.repeat === 'none') {
      if (!t.movedFrom) t.movedFrom = t.date;
      t.date = toK; t.updated = Date.now();
    } else {
      t.skip = t.skip || {}; t.skip[k] = true; t.updated = Date.now();
      S.newTask({ title: t.title, kind: t.kind, date: toK, time: t.time, remind: t.remind, cat: t.cat, note: t.note, movedFrom: k });
    }
    S.touch();
  },
  overdue() {
    const tk = U.today();
    return S.db.tasks.filter(t => t.kind === 'task' && (!t.repeat || t.repeat === 'none') && !t.done && t.date && t.date < tk && !t.archived);
  },
  upcoming(days, from) {
    const out = [];
    let k = from || U.addDays(U.today(), 1);
    for (let i = 0; i < days; i++) {
      for (const t of S.tasksOn(k)) if (!S.isDone(t, k)) out.push({ t, k });
      k = U.addDays(k, 1);
    }
    return out;
  },
  dayHasItems(k) { return S.db.tasks.some(t => S.occurs(t, k)); },

  /* ===== alışkanlıklar ===== */
  newHabit(p) {
    const h = Object.assign({ id: 'h' + U.id(), name: '', color: '#E89AAD', target: 1, weekly: 7, unit: '', remind: '', log: {}, created: Date.now(), updated: Date.now() }, p || {});
    S.db.habits.push(h); S.touch(); return h;
  },
  habitCount(h, k) { return (h.log && h.log[k]) || 0; },
  habitDone(h, k) { return S.habitCount(h, k) >= (h.target || 1); },
  habitInc(h, k, delta) {
    h.log = h.log || {};
    let v = (h.log[k] || 0) + (delta == null ? 1 : delta);
    if (delta == null && v > h.target) v = 0; /* doluysa sıfırla */
    if (v <= 0) delete h.log[k]; else h.log[k] = v;
    h.updated = Date.now();
    U.vibrate(10);
    S.touch();
  },
  habitStreak(h) {
    let k = U.today(), n = 0;
    if (!S.habitDone(h, k)) k = U.addDays(k, -1);
    while (S.habitDone(h, k) && n < 3650) { n++; k = U.addDays(k, -1); }
    return n;
  },
  habitWeek(h, k) {
    return U.weekDays(k || U.today()).filter(d => S.habitDone(h, d)).length;
  },
  water() { return S.db.habits.find(h => h.kind === 'water'); },

  /* ===== istatistik ===== */
  dayScore(k) {
    const ts = S.tasksOn(k, { kind: 'task' });
    let total = ts.length, done = ts.filter(t => S.isDone(t, k)).length;
    if (k <= U.today()) for (const h of S.db.habits) { if (h.archived) continue; total++; if (S.habitDone(h, k)) done++; }
    return { total, done, pct: total ? done / total : 0 };
  },
  weekScore(k) {
    const days = U.weekDays(k || U.today()).map(d => Object.assign({ k: d }, S.dayScore(d)));
    const total = days.reduce((a, d) => a + d.total, 0), done = days.reduce((a, d) => a + d.done, 0);
    return { days, total, done, pct: total ? done / total : 0 };
  },

  /* ===== notlar ===== */
  newNote(p) {
    const n = Object.assign({ id: 'n' + U.id(), title: '', blocks: [{ t: 'text', v: '' }], folder: null, tags: [], cover: null, pinned: false, fav: false, archived: false, created: Date.now(), updated: Date.now() }, p || {});
    S.db.notes.unshift(n); S.touch(); return n;
  },
  noteText(n) {
    return (n.blocks || []).filter(b => b.t === 'text' || b.t === 'h' || b.t === 'check').map(b => (b.t === 'check' ? (b.done ? '☑ ' : '☐ ') : '') + (b.v || '')).join('\n').trim();
  },
  /* boş not temizliği */
  pruneNote(n) {
    if (!n) return;
    const empty = !n.title.trim() && !S.noteText(n) && !(n.blocks || []).some(b => b.t === 'photo' || b.t === 'sticker') && !(n.items || []).length && !n.cover;
    if (empty) { const i = S.db.notes.indexOf(n); if (i >= 0) { S.db.notes.splice(i, 1); S.touch({ quiet: true }); } }
  },

  /* ===== kitaplar ===== */
  newBook(p) {
    const b = Object.assign({ id: 'b' + U.id(), title: '', author: '', status: 'reading', pages: 0, page: 0, cover: null, rating: 0, comment: '', fav: false, created: Date.now(), updated: Date.now() }, p || {});
    S.db.books.unshift(b); S.touch(); return b;
  },

  /* ===== hedefler ===== */
  newGoal(p) {
    const g = Object.assign({ id: 'g' + U.id(), title: '', period: 'month', start: U.today(), due: null, color: '#E89AAD', cover: null, why: '', steps: [], progress: 0, done: false, fav: false, archived: false, created: Date.now(), updated: Date.now() }, p || {});
    S.db.goals.unshift(g); S.touch(); return g;
  },
  goalPct(g) {
    if (g.done) return 1;
    if (g.steps && g.steps.length) return g.steps.filter(x => x.done).length / g.steps.length;
    return (g.progress || 0) / 100;
  },
  /* hedefin dönemi şu an mı? */
  goalActive(g, k) {
    k = k || U.today();
    if (g.done || g.archived) return false;
    if (g.due) return k <= g.due;
    const end = S.goalEnd(g);
    return !end || k <= end;
  },
  goalEnd(g) {
    if (g.due) return g.due;
    const d = U.parse(g.start || U.today());
    if (g.period === 'week') return U.addDays(U.weekStart(g.start), 6);
    if (g.period === 'month') return U.key(new Date(d.getFullYear(), d.getMonth() + 1, 0));
    if (g.period === 'year') return d.getFullYear() + '-12-31';
    return null;
  },

  /* ===== senkron birleştirme ===== */
  merge(local, remote) {
    const out = JSON.parse(JSON.stringify(local));
    out.deleted = Object.assign({}, remote.deleted || {}, local.deleted || {});
    for (const coll of ['tasks', 'notes', 'folders', 'habits', 'books', 'goals', 'vision', 'courses', 'skills', 'shows']) {
      const map = new Map();
      for (const x of (remote[coll] || [])) map.set(x.id, x);
      for (const x of (local[coll] || [])) {
        const r = map.get(x.id);
        if (!r || (x.updated || 0) >= (r.updated || 0)) map.set(x.id, x);
      }
      out[coll] = Array.from(map.values()).filter(x => !out.deleted[x.id]);
    }
    out.days = Object.assign({}, remote.days || {});
    for (const [k, v] of Object.entries(local.days || {})) {
      const r = out.days[k];
      if (!r || (v.updated || 0) >= (r.updated || 0)) out.days[k] = v;
    }
    out.photos = Object.assign({}, remote.photos || {}, local.photos || {});
    out.months = Object.assign({}, remote.months || {});
    for (const [k, v] of Object.entries(local.months || {})) { const r = out.months[k]; if (!r || (v.updated || 0) >= (r.updated || 0)) out.months[k] = v; }
    if ((remote.settings && remote.settings.updated || 0) > (local.settings.updated || 0)) {
      const keepLock = local.settings.lock;
      out.settings = Object.assign({}, remote.settings, { lock: keepLock });
    }
    return out;
  }
};
