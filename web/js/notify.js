/* Hatırlatıcıları ve kalıcı bildirimi telefona iletir */
'use strict';

const REMINDS = [
  { v: null, l: 'Yok' }, { v: 0, l: 'Tam zamanında' }, { v: 5, l: '5 dk önce' }, { v: 15, l: '15 dk önce' },
  { v: 30, l: '30 dk önce' }, { v: 60, l: '1 saat önce' }, { v: 1440, l: '1 gün önce' }, { v: 10080, l: '1 hafta önce' }
];
const REPEATS = [
  { v: 'none', l: 'Tekrar yok' }, { v: 'daily', l: 'Her gün' }, { v: 'weekdays', l: 'Hafta içi' },
  { v: 'weekly', l: 'Her hafta' }, { v: 'monthly', l: 'Her ay' }, { v: 'yearly', l: 'Her yıl' }
];

function hashId(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return (Math.abs(h) % 600000) + 1;
}

const Notify = {
  later() { clearTimeout(Notify._t); Notify._t = setTimeout(Notify.push, 800); },

  build() {
    const items = [];
    const now = Date.now();
    const start = U.today();
    for (let i = 0; i < 62; i++) {
      const k = U.addDays(start, i);
      for (const t of S.db.tasks) {
        if (t.remind == null || t.archived || !S.occurs(t, k) || S.isDone(t, k)) continue;
        const base = U.parse(k);
        const [hh, mm] = (t.time || '09:00').split(':').map(Number);
        base.setHours(hh, mm, 0, 0);
        const at = base.getTime() - t.remind * 60000;
        if (at <= now) continue;
        const when = t.time ? (t.remind === 0 ? 'Şimdi · ' + t.time : U.rel(k) + ' ' + t.time) : U.rel(k);
        items.push({ id: hashId(t.id + k), at, title: t.title || 'Hatırlatma', body: when + (t.note ? ' · ' + t.note.slice(0, 80) : ''), tid: t.id, k });
      }
      for (const h of S.db.habits) {
        if (!h.remind || h.archived || S.habitDone(h, k)) continue;
        const base = U.parse(k); const [hh, mm] = h.remind.split(':').map(Number); base.setHours(hh, mm, 0, 0);
        if (base.getTime() <= now) continue;
        items.push({ id: hashId(h.id + k), at: base.getTime(), title: h.name, body: 'Alışkanlık zamanı · seri ' + S.habitStreak(h) + ' gün' });
      }
    }
    if (S.sync.pomoEnd && S.sync.pomoEnd > now) items.push({ id: 599999, at: S.sync.pomoEnd, title: 'Süre doldu', body: S.sync.pomoMsg || 'Çalışma oturumu bitti, kısa bir mola ver.' });
    items.sort((a, b) => a.at - b.at);

    const days = {};
    for (let i = 0; i < 3; i++) {
      const k = U.addDays(start, i);
      const ts = S.tasksOn(k);
      const open = ts.filter(t => !S.isDone(t, k));
      const tasksOpen = open.filter(t => t.kind === 'task');
      const lines = open.filter(t => t.time).map(t => ({ t: t.time, x: t.title }));
      const allDay = open.filter(t => !t.time && t.kind === 'event').map(t => t.title);
      let title = tasksOpen.length ? `Bugün ${tasksOpen.length} işin var` : 'Bugün tüm işlerin tamam';
      if (allDay.length) title += ' · ' + allDay[0];
      const untimed = tasksOpen.filter(t => !t.time).length;
      days[k] = { title, lines, empty: untimed ? `Saatli iş kalmadı · ${untimed} görev bekliyor` : 'Güzel bir gün geçir.' };
    }
    return { items: items.slice(0, 380), ongoing: { enabled: !!S.set.ongoing, days } };
  },

  push() {
    if (!N) return;
    try { N.schedule(JSON.stringify(Notify.build())); } catch (e) { console.error(e); }
  },

  allowed() { try { return N ? N.notificationsAllowed() : false; } catch (e) { return false; } },
  ask() {
    return new Promise(res => {
      if (!N) return res(false);
      window.__onPermission = ok => { res(ok); Notify.push(); };
      N.requestNotificationPermission();
    });
  }
};
