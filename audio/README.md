# Audio MINDAKU V.1

Semua bunyi MINDAKU **dijana secara sintesis semasa berjalan** menggunakan Web Audio API
(lihat `js/audio.js`) — tiada fail audio luar diperlukan. Ini memastikan:

- 100% berfungsi **luar talian** (offline-first)
- saiz aplikasi yang kecil dan pemuatan pantas
- bunyi sentiasa **lembut dan tidak mengejutkan**
- kegagalan audio tidak pernah menghentikan permainan (graceful fallback)

Bunyi yang disediakan: kesan UI lembut (betul, cuba lagi, ketuk, bintang, syiling),
bunyi tema untuk permainan auditori (lembu, burung, hujan, ambulan, loceng, dll.),
nada tinggi/rendah, dan muzik latar pentatonik yang boleh dihidupkan di Tetapan
(sedia kala MATI untuk mod tenang).

Suara arahan (TTS) menggunakan SpeechSynthesis peranti jika tersedia
(keutamaan `ms-MY`), dan dimatikan sepenuhnya jika tetapan VOICE ditutup.
