/* Ayarlar, yedekleme kurulumu, kilit kurulumu, güncelleme */
'use strict';

Screens.settings = {
  render(p) {
    const s = S.set, sy = S.sync;
    const th = THEMES[s.theme] || THEMES.bordo;
    const hasUpd = Upd.remote && Upd.local && Upd.remote.version > Upd.local.version;
    const info = (() => { try { return N ? JSON.parse(N.appInfo()) : {}; } catch (e) { return {}; } })();
    const notifOk = Notify.allowed();
    const batt = (() => { try { return N ? N.batteryOptimized() : false; } catch (e) { return false; } })();
    const row = (a, i, t, sub, right) => `<button data-a="${a}">${ic(i, 20)}<span class="sp">${t}${sub ? `<small>${sub}</small>` : ''}</span>${right || '<span class="mu">›</span>'}</button>`;
    const sw = (a, on) => `<span class="sw ${on ? 'on' : ''}" data-a="${a}"></span>`;
    return `<div class="topbar" style="padding-top:18px"><h1>Ayarlar</h1></div>
    <div class="wrap pad">
      ${hasUpd ? `<button class="card big row" data-a="doUpdate" style="color:inherit;text-align:left;border-color:var(--ac)">${ic('update', 24)}<span class="sp"><b>Yeni güncelleme hazır</b><br><small class="mu">${U.esc(Upd.remote.notes || 'Yenilikleri yüklemek için dokun')}</small></span><span class="btn sm">Güncelle</span></button>` : ''}

      <div class="lbl">Profil</div>
      <div class="set">${row('setName', 'user', 'Adın', U.esc(s.name || '—'))}${row('setSub', 'edit', 'Selamın altındaki yazı', s.sub ? U.esc(s.sub) : 'Otomatik (günün durumuna göre)')}</div>

      <div class="lbl">Görünüm</div>
      <div class="set">${row('pickTheme', 'palette', 'Tema', th.name, `<span class="row" style="gap:3px">${['bg', 'ac2', 'ac', 'gold'].map(k => `<i style="width:14px;height:14px;border-radius:50%;background:${th.v[k]};border:1px solid var(--line2)"></i>`).join('')}</span>`)}
        ${row('pickBg', 'spark', 'Arka plan animasyonu', BGS[s.bg] || '')}
        ${row('pickHero', 'image', 'Ana sayfa üst görseli', HEROES[s.hero] || '')}
        ${row('pickStart', 'home', 'Açılış ekranı', s.start === 'agenda' ? 'Günlük ajanda' : 'Ana sayfa')}</div>

      <div class="lbl">Kategoriler</div>
      <div class="set">${s.categories.map(c => `<button data-a="editCat" data-id="${c.id}"><span class="cdot" style="width:14px;height:14px;background:${c.color}"></span><span class="sp">${U.esc(c.name)}</span><span class="mu">›</span></button>`).join('')}
        <button data-a="newCat">${ic('plus', 20)}<span class="sp">Yeni kategori</span></button></div>

      <div class="lbl">Bildirimler</div>
      <div class="set">
        ${N ? row('notifPerm', 'bell', 'Bildirim izni', notifOk ? 'Açık' : 'Kapalı · açmak için dokun', notifOk ? `<span class="ac">${ic('check', 18, 2.4)}</span>` : undefined) : ''}
        <div class="r">${ic('note', 20)}<span class="sp">Kalıcı günlük özet<small>Bildirim ekranında hep duran satır: kalan işler ve sıradaki saatli iş</small></span>${sw('tglOngoing', s.ongoing)}</div>
        ${N ? row('battery', 'flame', 'Pil kısıtlaması', batt ? 'Açık · hatırlatıcılar gecikebilir, kapatmak için dokun' : 'Kapalı, hatırlatıcılar zamanında gelir', batt ? undefined : `<span class="ac">${ic('check', 18, 2.4)}</span>`) : ''}
        ${N ? row('testNotif', 'spark', 'Deneme bildirimi gönder', '') : ''}</div>

      <div class="lbl">Gizlilik</div>
      <div class="set">
        <div class="r">${ic('lock', 20)}<span class="sp">Uygulama kilidi<small>Açılışta 4 haneli şifre</small></span>${sw('tglLock', s.lock.on)}</div>
        ${s.lock.on && N && N.biometricAvailable() ? `<div class="r">${ic('fp', 20)}<span class="sp">Parmak izi ile aç</span>${sw('tglBio', s.lock.bio)}</div>` : ''}
        ${s.lock.on ? row('changePin', 'edit', 'Şifreyi değiştir', '') : ''}</div>

      <div class="lbl" id="sec-backup">Yedekleme (GitHub)</div>
      <div class="set">
        ${Sync.ready() ? `<div class="r">${ic('cloud', 20)}<span class="sp">Bağlı: ${U.esc(sy.owner)}/${U.esc(sy.repo)}<small>${sy.last ? 'Son yedek: ' + new Date(sy.last).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }) : 'Henüz yedeklenmedi'}${sy.lastErr ? ' · <span style="color:#F19AA2">' + U.esc(sy.lastErr) + '</span>' : ''}</small></span></div>
          ${row('syncNow', 'update', 'Şimdi yedekle', 'Değişiklikler zaten birkaç dakikada bir kendiliğinden yedeklenir')}
          ${row('syncRestore', 'download', 'Yedekten geri yükle', 'Depodaki verileri bu telefonla birleştirir')}
          ${row('syncOff', 'x', 'Bağlantıyı kaldır', 'Depodaki yedek silinmez')}`
        : row('syncSetup', 'cloud', 'GitHub yedeklemesini kur', 'Telefon değişse de her şey geri gelsin, şifreli saklanır')}
        <div class="r">${ic('archive', 20)}<span class="sp">Telefondaki yedekler<small>Son 7 günün kopyası telefonda da tutulur</small></span></div></div>

      <div class="lbl" id="sec-update">Güncelleme</div>
      <div class="set">
        <div class="r">${ic('info', 20)}<span class="sp">Sürüm ${Upd.local ? Upd.local.version : '?'}<small>${info.versionName ? 'APK ' + info.versionName + ' (' + info.versionCode + ')' : 'Tarayıcı'}${Upd.local && Upd.local.date ? ' · ' + U.esc(Upd.local.date) : ''}</small></span></div>
        ${hasUpd ? row('doUpdate', 'update', 'Güncelle', 'Sürüm ' + Upd.remote.version + (Upd.remote.notes ? ' · ' + U.esc(Upd.remote.notes) : '')) : row('checkUpd', 'update', 'Güncellemeleri denetle', 'APK kurmadan yenilikleri getirir')}</div>

      <p class="mu2" style="font-size:11px;text-align:center;margin:10px 0">Tüm kayıtların telefonunda saklanır.${Sync.ready() ? ' Yedekler şifrelenerek GitHub\'a gider.' : ''}</p>
    </div>`;
  },
  mount(el, p) {
    if (p.open) { const t = el.querySelector('#sec-' + p.open); delete p.open; if (t) setTimeout(() => t.scrollIntoView({ behavior: 'smooth' }), 100); }
    if (!Upd.local) Upd.loadLocal().then(() => App.forceRefresh());
  },
  acts: {
    async setName() { const v = await App.prompt('Adın', S.set.name); if (v != null && v) { S.set.name = v; S.set.updated = Date.now(); S.touch(); } },
    async setSub() { const v = await App.prompt('Selamın altındaki yazı (boş bırakırsan otomatik)', S.set.sub, 'ör. Bugün her şey yolunda.'); if (v != null) { S.set.sub = v; S.set.updated = Date.now(); S.touch(); } },
    pickTheme() {
      const draw = () => `<h3>Tema</h3><div class="themes">${Object.entries(THEMES).map(([k, t]) => `<button class="${S.set.theme === k ? 'on' : ''}" data-a="thSet" data-k="${k}" style="background:${t.v.bg};color:${t.v.tx};border-color:${S.set.theme === k ? t.v.ac : t.v.line}">
        <span class="sw4">${['ac2', 'ac', 'gold', 'mu'].map(c => `<i style="background:${t.v[c]}"></i>`).join('')}</span>${t.name}<small style="opacity:.7;font-weight:500">${t.dark ? 'Koyu' : 'Açık'}</small></button>`).join('')}</div>`;
      const rec = App.sheet(draw(), { acts: { thSet: b => { S.set.theme = b.dataset.k; S.set.updated = Date.now(); Theme.apply(); S.touch(); App.setSheet(rec, draw()); } }, live: true });
    },
    pickBg() {
      const rec = App.sheet(`<h3>Arka plan animasyonu</h3><p class="mu" style="margin:0;font-size:13px">Arkada çok yavaş hareket eden, göze batmayan bir katman.</p><div class="menu">${Object.entries(BGS).map(([k, l]) => `<button data-a="bgSet" data-k="${k}">${S.set.bg === k ? `<span class="ac">${ic('check', 20, 2.4)}</span>` : ic('spark', 20)}${l}</button>`).join('')}</div>`,
        { acts: { bgSet: b => { S.set.bg = b.dataset.k; S.set.updated = Date.now(); Theme.bg(); S.touch(); App.closeSheet(rec); } } });
    },
    pickHero() {
      const rec = App.sheet(`<h3>Ana sayfa üst görseli</h3><div class="menu">${Object.entries(HEROES).map(([k, l]) => `<button data-a="hrSet" data-k="${k}">${S.set.hero === k ? `<span class="ac">${ic('check', 20, 2.4)}</span>` : ic('image', 20)}${l}</button>`).join('')}</div>`, {
        acts: {
          hrSet: async b => {
            const k = b.dataset.k;
            if (k === 'foto') { const ids = await S.addPhotos(false); if (!ids[0]) return; S.set.heroPhoto = ids[0]; }
            S.set.hero = k; S.set.updated = Date.now(); S.touch(); App.closeSheet(rec);
          }
        }
      });
    },
    pickStart() {
      const rec = App.sheet(`<h3>Açılış ekranı</h3><div class="menu"><button data-a="stSet" data-k="home">${ic('home', 20)} Ana sayfa</button><button data-a="stSet" data-k="agenda">${ic('calChk', 20)} Günlük ajanda</button></div>`,
        { acts: { stSet: b => { S.set.start = b.dataset.k; S.set.updated = Date.now(); S.touch(); App.closeSheet(rec); } } });
    },
    editCat(t) { CatSheet.create(S.set.categories.find(c => c.id === t.dataset.id)); },
    newCat() { CatSheet.create(); },
    async notifPerm() { if (Notify.allowed()) { N.openAppSettings(); return; } await Notify.ask(); App.forceRefresh(); },
    tglOngoing() { S.set.ongoing = !S.set.ongoing; S.set.updated = Date.now(); S.touch(); Notify.push(); if (S.set.ongoing && N && !Notify.allowed()) Notify.ask(); },
    battery() { N.openBatterySettings(); },
    testNotif() { if (!Notify.allowed()) { Notify.ask(); return; } N.testNotification('Deneme bildirimi', 'Bildirimler çalışıyor. Hatırlatıcıların zamanında gelecek.'); },
    tglLock() { if (S.set.lock.on) { S.set.lock = { on: false, pin: null, bio: false }; S.touch(); U.toast('Kilit kapatıldı'); } else PinSetup.open(); },
    tglBio() { S.set.lock.bio = !S.set.lock.bio; S.touch(); },
    changePin() { PinSetup.open(); },
    syncSetup() { SyncUI.open(); },
    async syncNow() { U.toast('Yedekleniyor…'); await Sync.push({ loud: true, all: true }); App.forceRefresh(); },
    async syncRestore() {
      if (!await App.confirm('Depodaki yedek bu telefondaki verilerle birleştirilsin mi?', 'Geri yükle')) return;
      const rec = App.sheet('<h3>Geri yükleniyor…</h3><p class="mu" id="rsP">Veriler indiriliyor</p>');
      try { await Sync.restore((i, n) => { const e = rec.sh.querySelector('#rsP'); if (e) e.textContent = `Fotoğraflar: ${i} / ${n}`; }); App.closeSheet(rec); Theme.apply(); U.toast('Geri yüklendi'); Notify.push(); }
      catch (e) { App.closeSheet(rec); U.toast(e.message); }
    },
    async syncOff() { if (await App.confirm('GitHub bağlantısı kaldırılsın mı? Depodaki yedek silinmez.', 'Kaldır', true)) { Sync.disconnect(); App.forceRefresh(); } },
    async checkUpd() { await Upd.check(true); App.forceRefresh(); },
    async doUpdate() {
      const rec = App.sheet('<h3>Güncelleniyor…</h3><p class="mu" id="upP">Hazırlanıyor</p>');
      try { await Upd.apply((i, n) => { const e = rec.sh.querySelector('#upP'); if (e) e.textContent = `Dosyalar indiriliyor: ${i} / ${n}`; }); }
      catch (e) { App.closeSheet(rec); U.toast(e.message); }
    }
  }
};

/* ---------- şifre kurulumu ---------- */
const PinSetup = {
  open() {
    let first = null, cur = '';
    const draw = msg => `<h3>${msg}</h3><div class="pdots" style="justify-content:center;align-self:center">${[0, 1, 2, 3].map(i => `<i class="${i < cur.length ? 'on' : ''}"></i>`).join('')}</div>
      <div class="pinpad" style="align-self:center">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(k => `<button data-a="pk" data-k="${k}">${k}</button>`).join('')}<span></span><button data-a="pk" data-k="0">0</button><button class="clear" data-a="pk" data-k="del">Sil</button></div>`;
    const rec = App.sheet(draw('4 haneli şifre belirle'), {
      acts: {
        pk: async b => {
          const k = b.dataset.k;
          if (k === 'del') cur = cur.slice(0, -1); else if (cur.length < 4) cur += k;
          App.setSheet(rec, draw(first ? 'Şifreyi tekrar gir' : '4 haneli şifre belirle'));
          if (cur.length === 4) {
            if (!first) { first = cur; cur = ''; setTimeout(() => App.setSheet(rec, draw('Şifreyi tekrar gir')), 150); }
            else if (first === cur) {
              S.set.lock = { on: true, pin: await Lock.hash(cur), bio: !!(N && N.biometricAvailable()) }; S.touch();
              App.closeSheet(rec); U.toast('Kilit açıldı. Şifreni unutma.');
            } else { first = null; cur = ''; U.vibrate(60); App.setSheet(rec, draw('Eşleşmedi, baştan belirle')); }
          }
        }
      }
    });
  }
};

/* ---------- GitHub yedekleme kurulumu ---------- */
const SyncUI = {
  open(opts) {
    opts = opts || {};
    const sy = S.sync;
    const html = `<h3>${opts.restoreFirst ? 'Yedekten geri yükle' : 'GitHub yedeklemesi'}</h3>
      <p class="mu" style="margin:0;font-size:13px;line-height:1.6">Verilerin <b>gizli (Private)</b> veri deponda, senin belirlediğin şifreyle kilitlenerek saklanır. Şifreyi unutursan yedek açılamaz, bir yere not et.</p>
      <details class="card" style="padding:12px"><summary style="font-weight:700;font-size:13.5px">Anahtar (token) nasıl alınır?</summary>
        <ol class="mu" style="font-size:12.5px;line-height:1.7;padding-left:18px;margin:10px 0 0">
          <li>Aşağıdaki düğmeyle GitHub'da token sayfasını aç.</li>
          <li><b>Token name</b>: ajanda yaz. <b>Expiration</b>: en uzun süreyi seç.</li>
          <li><b>Repository access</b>: "Only select repositories" seç, <b>ajanda-veri</b> deposunu işaretle.</li>
          <li><b>Permissions → Repository permissions → Contents</b>: "Read and write" yap.</li>
          <li>En alttaki <b>Generate token</b> düğmesine bas, çıkan kodu kopyala ve buraya yapıştır.</li></ol>
        <button class="btn soft wide" data-a="syTok" style="margin-top:10px">${ic('arrowR', 18)} Token sayfasını aç</button></details>
      <div class="field"><label>Token</label><input class="inp" id="syT" placeholder="github_pat_…" autocomplete="off" value="${U.esc(sy.token || '')}"></div>
      <div class="g2" style="gap:10px"><div class="field"><label>GitHub kullanıcı adı</label><input class="inp" id="syO" value="${U.esc(sy.owner || 'yuvarlanankayisi-del')}" autocomplete="off"></div>
        <div class="field"><label>Veri deposu</label><input class="inp" id="syR" value="${U.esc(sy.repo || 'ajanda-veri')}" autocomplete="off"></div></div>
      <div class="field"><label>Yedek şifresi</label><input class="inp" id="syP" type="password" placeholder="En az 6 karakter" autocomplete="new-password"></div>
      <div class="field"><label>Şifre tekrar</label><input class="inp" id="syP2" type="password" autocomplete="new-password"></div>
      <p class="mu" id="syMsg" style="margin:0;font-size:12.5px"></p>
      <button class="btn wide" data-a="syGo">${opts.restoreFirst ? 'Bağlan ve geri yükle' : 'Bağlan'}</button>`;
    const rec = App.sheet(html, {
      acts: {
        syTok: () => { const u = 'https://github.com/settings/personal-access-tokens/new'; if (N) N.openUrl(u); else window.open(u); },
        syGo: async b => {
          const v = id => rec.sh.querySelector(id).value;
          const msg = t => { rec.sh.querySelector('#syMsg').textContent = t; };
          if (!v('#syT').trim()) return msg('Token boş olamaz.');
          if (v('#syP').length < 6) return msg('Şifre en az 6 karakter olmalı.');
          if (v('#syP') !== v('#syP2')) return msg('Şifreler eşleşmiyor.');
          b.disabled = true; msg('Bağlanılıyor…');
          try {
            const r = await Sync.connect(v('#syT'), v('#syO'), v('#syR'), v('#syP'));
            if (r.hasData) {
              msg('Yedek bulundu, indiriliyor…');
              await Sync.restore((i, n) => msg(`Fotoğraflar indiriliyor: ${i} / ${n}`));
              App.closeSheet(rec); Theme.apply(); U.toast('Verilerin geri geldi');
              if (!S.set.onboarded || opts.restoreFirst) { S.set.onboarded = true; S.touch(); S.saveNow(); App.start(); }
              Notify.push();
            } else {
              msg('Bağlandı. İlk yedek alınıyor…');
              if (opts.restoreFirst) { App.closeSheet(rec); U.toast('Depoda yedek yok. Yeni başlıyoruz.'); return; }
              await Sync.push({ all: true });
              App.closeSheet(rec); U.toast('Yedekleme kuruldu'); App.forceRefresh();
            }
          } catch (e) { b.disabled = false; msg(e.message); }
        }
      }
    });
  }
};
