# Ajanda

Kişisel not ve yaşam planlayıcı uygulaması (Android).

- `app/` — Android kabuğu (bildirimler, kalıcı bildirim, kilit, güncelleme, dosya saklama)
- `web/` — uygulamanın ekranları. Buradaki değişiklikler APK kurmadan, uygulamadaki **Güncelle** düğmesiyle telefona gelir.
- `tools/surum.py` — web sürümünü artırır: `python3 tools/surum.py "yenilik notu"`

APK her derlemede `ci-sonuc` dalına konur:
https://github.com/yuvarlanankayisi-del/ajanda/raw/ci-sonuc/ajanda.apk

Kişisel veriler bu depoda **tutulmaz**. Telefonda saklanır ve istenirse ayrı, gizli bir depoya şifrelenerek yedeklenir.
