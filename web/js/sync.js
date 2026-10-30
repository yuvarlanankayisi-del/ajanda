/* GitHub'a şifreli yedekleme ve geri yükleme */
'use strict';

const Sync = {
  busy: false,
  pending: false,

  ready() { const s = S.sync; return !!(s && s.token && s.owner && s.repo && s.key && s.enabled !== false); },

  later() {
    if (!Sync.ready()) return;
    Sync.pending = true;
    clearTimeout(Sync._t);
    Sync._t = setTimeout(() => Sync.push(), 90000);
  },
  flush() { if (Sync.ready() && Sync.pending) Sync.push(); },

  /* ---------- şifreleme ---------- */
  async deriveKey(password, saltB64) {
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: U.b64ToBytes(saltB64), iterations: 210000, hash: 'SHA-256' },
      base, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  },
  async keyObj() {
    if (Sync._key && Sync._keyB64 === S.sync.key) return Sync._key;
    Sync._key = await crypto.subtle.importKey('raw', U.b64ToBytes(S.sync.key), 'AES-GCM', false, ['encrypt', 'decrypt']);
    Sync._keyB64 = S.sync.key;
    return Sync._key;
  },
  async enc(bytes, key) {
    key = key || await Sync.keyObj();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes));
    const out = new Uint8Array(3 + 12 + ct.length);
    out.set([65, 74, 49], 0); out.set(iv, 3); out.set(ct, 15);
    return out;
  },
  async dec(bytes, key) {
    key = key || await Sync.keyObj();
    if (bytes[0] !== 65 || bytes[1] !== 74 || bytes[2] !== 49) throw new Error('Tanınmayan yedek dosyası');
    const iv = bytes.slice(3, 15), ct = bytes.slice(15);
    return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct));
  },

  /* ---------- GitHub API ---------- */
  async api(path, opts, cfg) {
    cfg = cfg || S.sync;
    opts = opts || {};
    const url = 'https://api.github.com/repos/' + cfg.owner + '/' + cfg.repo + (path ? '/contents/' + path : '');
    const headers = Object.assign({ Authorization: 'Bearer ' + cfg.token, 'X-GitHub-Api-Version': '2022-11-28', Accept: 'application/vnd.github+json' }, opts.headers || {});
    let r;
    try { r = await fetch(url + (opts.method ? '' : (url.includes('?') ? '&' : '?') + 't=' + Date.now()), { method: opts.method || 'GET', headers, body: opts.body, cache: 'no-store' }); }
    catch (e) { throw new Error('İnternet bağlantısı yok'); }
    return r;
  },
  errText(r) {
    if (r.status === 401) return 'Anahtar (token) geçersiz ya da süresi dolmuş';
    if (r.status === 403) return 'Anahtarın bu depoya yazma izni yok';
    if (r.status === 404) return 'Depo bulunamadı ya da anahtar bu depoyu göremiyor';
    return 'GitHub hatası (' + r.status + ')';
  },
  async getMeta(path, cfg) {
    const r = await Sync.api(path, {}, cfg);
    if (r.status === 404) return null;
    if (!r.ok) throw new Error(Sync.errText(r));
    return r.json();
  },
  async getRaw(path, cfg) {
    const r = await Sync.api(path, { headers: { Accept: 'application/vnd.github.raw' } }, cfg);
    if (r.status === 404) return null;
    if (!r.ok) throw new Error(Sync.errText(r));
    return new Uint8Array(await r.arrayBuffer());
  },
  async put(path, bytes, sha, msg, cfg) {
    const body = { message: msg || 'yedek', content: U.bytesToB64(bytes) };
    if (sha) body.sha = sha;
    const r = await Sync.api(path, { method: 'PUT', body: JSON.stringify(body) }, cfg);
    return r;
  },

  /* ---------- bağlan ---------- */
  async connect(token, owner, repo, password) {
    const cfg = { token: token.trim(), owner: owner.trim(), repo: repo.trim() };
    const rr = await Sync.api('', {}, cfg);
    if (!rr.ok) throw new Error(Sync.errText(rr));
    const info = await rr.json();
    if (!info.private) throw new Error('Bu depo herkese açık (Public). Verilerin için mutlaka gizli (Private) bir depo kullan.');
    let meta = await Sync.getMeta('meta.json', cfg);
    let key, saltB64;
    if (meta) {
      const m = JSON.parse(new TextDecoder().decode(U.b64ToBytes(meta.content.replace(/\n/g, ''))));
      saltB64 = m.salt;
      key = await Sync.deriveKey(password, saltB64);
      try {
        const ok = new TextDecoder().decode(await Sync.dec(U.b64ToBytes(m.check), key));
        if (ok !== 'ajanda-ok') throw new Error();
      } catch (e) { throw new Error('Şifre yanlış. Bu depodaki yedek başka bir şifreyle kilitlenmiş.'); }
    } else {
      saltB64 = U.bytesToB64(crypto.getRandomValues(new Uint8Array(16)));
      key = await Sync.deriveKey(password, saltB64);
      const check = U.bytesToB64(await Sync.enc(new TextEncoder().encode('ajanda-ok'), key));
      const m = JSON.stringify({ v: 1, salt: saltB64, iter: 210000, check, created: new Date().toISOString() }, null, 1);
      const r = await Sync.put('meta.json', new TextEncoder().encode(m), null, 'Ajanda yedek alanı oluşturuldu', cfg);
      if (!r.ok) throw new Error(Sync.errText(r));
    }
    const raw = await crypto.subtle.exportKey('raw', key);
    Object.assign(S.sync, cfg, { key: U.bytesToB64(new Uint8Array(raw)), salt: saltB64, enabled: true, dbSha: null, lastErr: null });
    S.saveSync();
    const db = await Sync.getMeta('db.bin');
    return { hasData: !!db, size: db ? db.size : 0 };
  },
  disconnect() {
    const keepPhotos = {};
    S.sync = { photos: keepPhotos };
    S.saveSync();
  },

  /* ---------- yükle ---------- */
  async push(opts) {
    if (!Sync.ready()) return false;
    if (Sync.busy) { Sync.pending = true; return false; }
    Sync.busy = true; Sync.pending = false;
    S.saveNow();
    try {
      /* fotoğraflar */
      let n = 0;
      for (const id of Object.keys(S.db.photos)) {
        if (S.sync.photos[id]) continue;
        if (n >= 25 && !(opts && opts.all)) { Sync.pending = true; break; }
        const b64 = N ? N.readBase64('u/' + id + '.jpg') : localStorage.getItem('ajanda.ph.' + id);
        if (!b64) { S.sync.photos[id] = 1; continue; }
        const r = await Sync.put('p/' + id + '.bin', await Sync.enc(U.b64ToBytes(b64)), null, 'fotoğraf');
        if (r.ok || r.status === 422) S.sync.photos[id] = 1;
        else throw new Error(Sync.errText(r));
        n++;
      }
      /* veritabanı */
      const bytes = () => Sync.enc(new TextEncoder().encode(JSON.stringify(Object.assign({}, S.db, { savedAt: Date.now() }))));
      if (!S.sync.dbSha) {
        const m = await Sync.getMeta('db.bin');
        if (m) {
          /* uzakta veri var: önce birleştir */
          const remote = JSON.parse(new TextDecoder().decode(await Sync.dec(await Sync.getRaw('db.bin'))));
          S.db = S.merge(S.db, remote); S.touch({ quiet: true }); S.saveNow();
          S.sync.dbSha = m.sha;
        }
      }
      let r = await Sync.put('db.bin', await bytes(), S.sync.dbSha, 'yedek ' + new Date().toLocaleString('tr-TR'));
      if (r.status === 409 || r.status === 422) {
        const m = await Sync.getMeta('db.bin');
        if (m) {
          const remote = JSON.parse(new TextDecoder().decode(await Sync.dec(await Sync.getRaw('db.bin'))));
          S.db = S.merge(S.db, remote); S.touch({ quiet: true }); S.saveNow();
        }
        r = await Sync.put('db.bin', await bytes(), m ? m.sha : null, 'yedek (birleştirildi)');
      }
      if (!r.ok) throw new Error(Sync.errText(r));
      const j = await r.json();
      S.sync.dbSha = j.content && j.content.sha;
      S.sync.last = Date.now(); S.sync.lastErr = null;
      S.saveSync();
      if (opts && opts.loud) U.toast('Yedeklendi');
      return true;
    } catch (e) {
      S.sync.lastErr = e.message; S.saveSync();
      if (opts && opts.loud) U.toast('Yedeklenemedi: ' + e.message);
      return false;
    } finally {
      Sync.busy = false;
      if (Sync.pending) Sync.later();
    }
  },

  /* ---------- geri yükle ---------- */
  async restore(progress) {
    const m = await Sync.getMeta('db.bin');
    if (!m) throw new Error('Depoda henüz yedek yok');
    const remote = JSON.parse(new TextDecoder().decode(await Sync.dec(await Sync.getRaw('db.bin'))));
    delete remote.savedAt;
    const localEmpty = !S.db.tasks.length && !S.db.notes.length && !Object.keys(S.db.days).length && !S.db.habits.filter(h => h.kind !== 'water').length;
    S.db = localEmpty ? remote : S.merge(S.db, remote);
    S.migrate();
    S.sync.dbSha = m.sha;
    S.touch(); S.saveNow(); S.saveSync();
    /* fotoğraflar */
    const ids = Object.keys(S.db.photos);
    let i = 0;
    for (const id of ids) {
      i++;
      const have = N ? N.exists('u/' + id + '.jpg') : !!localStorage.getItem('ajanda.ph.' + id);
      if (have) { S.sync.photos[id] = 1; continue; }
      if (progress) progress(i, ids.length);
      try {
        const raw = await Sync.getRaw('p/' + id + '.bin');
        if (!raw) continue;
        const b64 = U.bytesToB64(await Sync.dec(raw));
        if (N) N.writeBase64('u/' + id + '.jpg', b64); else localStorage.setItem('ajanda.ph.' + id, b64);
        S.sync.photos[id] = 1;
      } catch (e) { console.error(e); }
    }
    S.sync.last = Date.now(); S.saveSync();
    return true;
  }
};
