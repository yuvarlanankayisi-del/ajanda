/* APK kurmadan güncelleme: GitHub'daki web dosyalarını indirir */
'use strict';

const Upd = {
  RAW: 'https://raw.githubusercontent.com/yuvarlanankayisi-del/ajanda/main/web/',
  local: null,
  remote: null,

  async loadLocal() {
    try { Upd.local = await (await fetch('version.json?t=' + Date.now())).json(); } catch (e) { Upd.local = { version: 0 }; }
    return Upd.local;
  },
  async check(loud) {
    await Upd.loadLocal();
    try {
      const r = await fetch(Upd.RAW + 'version.json?t=' + Date.now(), { cache: 'no-store' });
      if (!r.ok) throw new Error();
      Upd.remote = await r.json();
      S.sync.updChecked = Date.now(); S.saveSync();
      const has = Upd.remote.version > Upd.local.version;
      if (loud) U.toast(has ? 'Yeni güncelleme var' : 'Uygulama güncel');
      if (typeof App !== 'undefined') App.updateBadge(has);
      return has;
    } catch (e) {
      if (loud) U.toast('Güncelleme denetlenemedi (internet?)');
      return false;
    }
  },
  async apply(progress) {
    if (!N) { location.reload(); return; }
    if (!Upd.remote) await Upd.check();
    if (!Upd.remote) throw new Error('Sunucuya ulaşılamadı');
    const files = Upd.remote.files || [];
    if (!N.webBegin()) throw new Error('Hazırlık yapılamadı');
    let i = 0;
    for (const f of files.concat(['version.json'])) {
      i++;
      if (progress) progress(i, files.length + 1);
      const r = await fetch(Upd.RAW + f + '?v=' + Upd.remote.version, { cache: 'no-store' });
      if (!r.ok) throw new Error('İndirilemedi: ' + f);
      const b = new Uint8Array(await r.arrayBuffer());
      if (!N.webWrite(f, U.bytesToB64(b))) throw new Error('Yazılamadı: ' + f);
    }
    S.saveNow();
    if (!N.webCommit()) throw new Error('Güncelleme uygulanamadı');
  }
};
