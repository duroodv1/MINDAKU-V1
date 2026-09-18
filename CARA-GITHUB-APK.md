# 📱 Cara Terbitkan MINDAKU ke GitHub Pages + Bina APK

Panduan langkah demi langkah (10–15 minit). Selepas siap, anda akan ada:

1. **Pautan web (PWA)** — boleh dimainkan terus dalam pelayar & boleh dipasang di telefon.
2. **Fail APK** — aplikasi Android sebenar untuk dimuat turun dan dipasang.

> Prasyarat: akaun GitHub percuma (daftar di https://github.com/signup) dan fail `mindaku-v1.zip`
> (ekstrak dahulu di komputer anda — hasilkan folder `mindaku`).

---

## Bahagian 1 — Cipta repositori dan muat naik fail

1. Log masuk GitHub → klik butang **`+`** di penjuru kanan atas → **New repository**.
2. Nama repositori: **`mindaku`** (atau apa-apa nama — URL akhir mengikut nama ini).
   Pilih **Public** → klik **Create repository**.
3. Di halaman repositori baharu, klik pautan **uploading an existing file**.
4. Buka folder `mindaku` yang telah diekstrak di komputer anda → **pilih SEMUA kandungan di dalamnya**
   (termasuk folder tersembunyi `.github` — pastikan ia turut dipilih) → seret ke kawasan muat naik.
5. Tunggu semua fail selesai dimuat naik → taip mesej komit seperti "MINDAKU V.1" → klik **Commit changes**.

## Bahagian 2 — Aktifkan GitHub Pages (pautan web)

1. Di repositori: tab **Settings** → menu kiri **Pages**.
2. Bahagian **Build and deployment**:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` (atau `master`) — folder `/ (root)` → klik **Save**.
3. Tunggu 1–3 minit. Muat semula halaman Settings→Pages sehingga kotak hijau muncul dengan pautan:
   - `https://<nama-anda>.github.io/mindaku/` ← **ini pautan PWA anda!** 🎉
4. Buka pautan itu di telefon → main! Untuk pasang sebagai aplikasi: menu pelayar → **"Pasang aplikasi" / "Tambah ke skrin utama"**.

## Bahagian 3 — Bina APK (automatik, sekali klik)

1. Pastikan GitHub Pages sudah HIDUP (Bahagian 2 selesai — pautan boleh dibuka).
2. Di repositori: tab **Actions** → pilih aliran kerja **"Bina APK MINDAKU"** di senarai kiri.
3. Klik butang **Run workflow** → butang hijau **Run workflow** sekali lagi.
4. Tunggu ± 5–10 minit (binaan pertama lambat sedikit). Baris binaan akan bertukar hijau ✅.
5. Klik pada binaan tersebut → tatal ke bawah ke bahagian **Artifacts** → muat turun **`mindaku-apk.zip`**.
6. Ekstrak zip → dapat **`app-release-signed.apk`** — ini APK MINDAKU! 📱

## Bahagian 4 — Pasang APK di telefon Android

1. Hantar `app-release-signed.apk` ke telefon (WhatsApp ke diri sendiri, e-mel, kabel USB, dll).
2. Di telefon: buka fail APK → Android akan meminta kebenaran *"pasang dari sumber tidak dikenali"* → benarkan.
3. Pasang → ikon **MINDAKU** muncul di skrin utama.
4. **Penting — untuk skrin penuh tanpa bar URL:** aliran kerja turut memuat naik fail
   `.well-known/assetlinks.json` ke repositori anda. Tunggu ± 2 minit selepas binaan selesai
   (biar Pages kemas kini), baru pasang APK. Jika bar URL masih kelihatan semasa melancarkan,
   nyahpasang aplikasi → tunggu 2 minit → pasang semula.

## Penyelesaian masalah

| Masalah | Penyelesaian |
|---|---|
| Pautan Pages 404 | Settings → Pages → pastikan branch betul (`main`, folder `/root`) dan tunggu 2–3 minit |
| Binaan APK gagal (❌ merah) | Klik binaan → pergi bahagian merah → baca log; pastikan Pages sudah hidup sebelum Run workflow (ikon & manifest perlu dimuat turun oleh pembina) |
| Binaan gagal kerana Pages belum sedia | Tunggu 5 minit → Run workflow semula |
| APK "app not installed" | Nyahpasang versi lama MINDAKU dahulu, kemudian pasang semula |
| Bar URL kelihatan dalam app | Lihat Bahagian 4 langkah 4 (assetlinks + tunggu + pasang semula) |

## Alternatif tanpa Actions — PWABuilder (pilihan mudah)

Jika anda tidak mahu guna aliran kerja Actions:

1. Buka https://www.pwabuilder.com
2. Tampal pautan Pages anda (`https://<nama-anda>.github.io/mindaku/`) → **Start**.
3. Pilih **Android** → **Download** — dapat paket APK siap dibina oleh PWABuilder.

---

## Nota teknikal (untuk rujukan)

- APK dibina sebagai **Trusted Web Activity (TWA)** menggunakan `@bubblewrap/cli` — aplikasi pembalut
  Chrome yang memuatkan PWA anda sepenuh-penuhnya, termasuk **sokongan luar talian**.
- Kunci tandatangan dijana pada binaan pertama dan **disimpan (cache) antara binaan** supaya
  cap jari kekal — kemas kini app akan dipasang atas versi lama tanpa nyahpasang.
- Konfigurasi TWA: `apk/twa-manifest.template.json` (URL ditulis secara automatik oleh aliran kerja).
- Binaan APK ini telah diuji hujung-ke-hujung (bubblewrap 1.25.0, Android SDK 36, minSdk 23).
