# Audit Codebase — Tahap 1 (SPEC Boarding Pass §7.1)

Tanggal: 2026-11-25 · Repo yang diperiksa (read-only kecuali `boarding-pass`):
`lembar-kabar` (`d768faa`), `merah-delima` (`861a483`), `olive-motion` (`d1390bc`), demo `contoh/serambi-betawi` & `contoh/peach` di `lembar-kabar`.
`betawi-motion`, `peach` (privat), dan `champagne-pass` **tidak** diperiksa langsung.

Legenda: **[FAKTA]** terlihat di kode · **[INFERENSI]** disimpulkan, belum diuji · **[GAP]** beda dengan spec.

---

## 1. Ringkasan stack

| Hal | Temuan |
|---|---|
| Bahasa | HTML + CSS + vanilla JS (ES module). Tanpa framework. [FAKTA] |
| Build | `build.mjs` (Node ≥20) hanya menyalin file template + event ke `dist/`. Tanpa bundler. [FAKTA] |
| Hosting | Vercel (`vercel.json`) / GitHub Pages. Statis. [FAKTA] |
| Etalase | `lembar-kabar`: server Node tanpa dependency, katalog di `catalog.js`, checkout via WhatsApp, admin manual. [FAKTA] |
| Preview tema | `lembar-kabar/scripts/sync-previews.mjs` + GitHub Actions per jam menyalin template dari repo tema ke `contoh/<slug>/`. [FAKTA] |

## 2. Mekanisme tema — ada dua pola

| Pola | Repo | Struktur |
|---|---|---|
| **A. Single file** (lama) | `merah-delima` | Satu `index.html` (~74 KB) berisi markup + CSS + JS + objek `CONFIG`. |
| **B. Template + event** (baru) | `olive-motion`, `betawi-motion`, (peach: `dist/` standalone) | `templates/<tema>/{index.html, style.css, invitation.js, assets/}` + `events/<slug>/{wedding.js, assets/}`. `build.mjs <slug>` menggabungkan. |

**Kesimpulan:**
- **[GAP] Skeleton bersama lintas tema (SPEC §1–2) belum ada.** Pola B memisahkan *data* dari *tema*, tetapi **logika (`invitation.js`) di-copy per repo tema**, bukan dipakai bersama.
- **[FAKTA] Skema data `wedding.js` sudah seragam** antara olive dan serambi-betawi (field identik). Ini kontrak data de facto.
- **Rekomendasi:** Boarding Pass dibangun mengikuti **Pola B** sebagai repo tema mandiri, memakai skema `wedding.js` yang sama persis. Membangun skeleton lintas-repo (shared package / monorepo) **tidak** saya rekomendasikan sekarang: tidak ada mekanisme distribusi kode bersama, dan biayanya (migrasi 4 tema) jauh melebihi manfaat untuk 1 tema baru. Ini bertentangan dengan SPEC §1 ("pakai ulang skeleton") — perlu keputusan Anda.

## 3. Model data — pemetaan SPEC §2.1 → `wedding.js` yang ada

| SPEC | `wedding.js` | Status |
|---|---|---|
| `mempelai.pria/wanita` | `couple[0..1]` `{name, portrait, family, instagram?}` | Ada. **Urutan = wanita dulu** di contoh (`Ayu`, lalu `Raka`). [GAP] SPEC butuh pemetaan Captain=pria / Co-Pilot=wanita → perlu field eksplisit (mis. `role`) atau konvensi urutan. |
| `nama_panggilan` | — (diturunkan dari `names: 'Ayu & Raka'`) | Ada secara implisit. |
| `inisial` | — | **[GAP]** Belum ada. Bisa diturunkan dari `names` (huruf pertama tiap nama). |
| `kutipan` | `quote {text, source}` | Ada. |
| `acara[]` | `events[] {title, startsAt, endsAt, date, time, venue, address, mapQuery, mapPin?}` | Ada, ISO + offset. |
| `dress_code` | — | **[GAP]** Belum ada di skema mana pun. |
| `cerita[]` | `story[] {date, title, text}` | Ada (tanpa `kota`). [GAP kecil] Rute "FROM → TO" per transit butuh `city` opsional. |
| `galeri[]` | `photos[] {file, alt}` | Ada (lebih baik dari SPEC: ada `alt`). |
| `amplop[]` | `giftAccounts[] {bank, number, holder}` | Ada. |
| `alamat_kado` | `giftAddress {recipient, address}` | Ada. |
| `musik` | `music: 'file.mp3'` (string) | Ada. |
| `tampilkan_foto_mempelai` | — (portrait kosong → placeholder) | [GAP kecil] |
| `?to=` | Dibaca, dirender via `textContent`. | Aman dari XSS. [FAKTA] |

## 4. RSVP & ucapan (spreadsheet)

**[FAKTA]** Integrasi spreadsheet hanya ada di `merah-delima`: `apps-script.gs` (Google Apps Script Web App) + `CONFIG.rsvpEndpoint`.
**[FAKTA]** `olive-motion` **tidak** punya integrasi spreadsheet: mode demo → `localStorage`; mode non-demo → form disembunyikan ("Formulir ucapan belum tersedia") atau `mailto:`.

Gap Apps Script terhadap SPEC §3:

| SPEC | Apps Script sekarang | Status |
|---|---|---|
| Kehadiran hadir / tidak / **ragu** | `att` hanya `y`/`n` | **[GAP]** |
| Jumlah tamu 1–5 | tidak ada kolom | **[GAP]** |
| Daftar ucapan dibatasi ~50 | `doGet` mengembalikan **semua** baris | **[GAP]** (beban naik seiring jumlah ucapan) |
| Pesan "Gagal mengirim" saat gagal tulis | Client POST dengan `mode: "no-cors"` → respons *opaque*, **client tidak bisa tahu** server menolak/kuota habis; hanya error jaringan yang terdeteksi. | **[GAP penting]** |
| Anti-spam | Dedup identik ≤2 menit + `LockService` + sanitasi formula (`=+-@`) | Parsial. Tidak ada rate-limit per sumber. |
| Ekspor CSV untuk katering | Tidak ada; Sheet bisa di-download CSV manual | Cukup via fitur Google Sheets. [INFERENSI] |

**Temuan keamanan (dilaporkan, tidak diperbaiki — sesuai SPEC §3):**
- `merah-delima/index.html:689` memuat URL Web App produksi secara hardcode di repo **publik**. URL Apps Script memang harus publik agar client bisa memanggilnya, jadi ini *bukan* kebocoran kredensial, tetapi siapa pun bisa POST langsung ke endpoint itu (spam) dan membaca seluruh ucapan via GET. Mitigasi realistis: batasi `doGet`, tambah honeypot field, batasi panjang & frekuensi.
- Tidak ditemukan API key / ID Sheet lain di client. [FAKTA, untuk file yang diperiksa]

**Implikasi:** Boarding Pass perlu Apps Script versi baru (tambah kolom `jumlah`, nilai `att` = `y/n/m`, `doGet` limit 50) dan **tidak bisa memenuhi deteksi gagal-tulis sepenuhnya selama memakai `no-cors`**. Alternatif: POST `text/plain` *tanpa* `no-cors` (Apps Script mengirim header CORS untuk respons `ContentService` setelah redirect) — **[INFERENSI, belum diuji]**; harus diverifikasi di tahap implementasi sebelum dijanjikan.

## 5. Fitur skeleton SPEC §3 vs. olive-motion (acuan Pola B)

| Fitur | Ada? |
|---|---|
| Cover + nama tamu `?to` | Ya |
| Gate memulai musik, tombol musik mengambang, sembunyi bila `music` kosong | Ya |
| Countdown ke acara terawal | Ya (perilaku setelah lewat: belum diverifikasi) |
| Maps (`mapPin` / `mapQuery`) | Ya |
| Add to Calendar | **Google Calendar saja**; `.ics` tidak ada di olive (peach punya file `pernikahan.ics` statis) |
| Galeri + lightbox | Ya |
| Tombol salin rekening + feedback | Ya |
| `prefers-reduced-motion` | Ya |
| Open Graph | **Tidak ada di olive** (`<title>Undangan Pernikahan</title>` saja); ada di merah-delima (1200×630) |
| Tombol pintas "Lokasi", tab mini | Tidak |

## 6. Alur sisi pengantin (SPEC §6)

| Langkah | Status |
|---|---|
| Pesan | Ada (etalase + WhatsApp, manual) |
| Isi formulir data | Tidak ada; admin edit `wedding.js` manual |
| Preview langsung | Hanya preview demo di etalase (`?a=&b=` ganti nama) |
| Link per tamu massal + teks WA | Ada di `merah-delima` (`kirim.html`, `tools/buat_link_tamu.py`). Tidak ada di olive. |
| Pantau RSVP | Lewat Google Sheet (delima) |
| Ekspor CSV | Manual dari Sheet |

Sesuai SPEC §6: hanya dilaporkan, tidak dibangun.

## 7. Integrasi ke etalase (yang diperlukan agar Boarding Pass tampil di Lembar Kabar)

1. Entri baru di `lembar-kabar/catalog.js`.
2. Gambar sampul katalog `lembar-kabar/assets/boarding-pass.jpg` (lihat `ASSET-SPEC.md` A-10).
3. Entri `{ slug: "boarding-pass", repo: "boarding-pass", template: "boarding-pass" }` di `sync-previews.mjs`. **Kontrak sync:** `templates/<tema>/index.html` wajib memuat `id="sampul"` dan `data-names`; `invitation.js` wajib diawali `import wedding from '../../wedding.js'` dan punya penanda `const $ =`. [FAKTA, dari `syncTemplate`]

## 8. Keputusan yang dibutuhkan sebelum tahap 2

1. **Skeleton:** setuju Boarding Pass mengikuti Pola B (repo mandiri, skema `wedding.js` sama) alih-alih membangun skeleton bersama? *(Rekomendasi saya: ya.)*
2. **Captain/Co-Pilot:** tambah field `couple[].role: 'groom' | 'bride'`, atau tetapkan konvensi urutan? *(Rekomendasi: field eksplisit — konvensi urutan sudah terbalik di data contoh.)*
3. **Apps Script:** boleh membuat versi baru (kolom jumlah tamu, `ragu`, limit 50) khusus Boarding Pass, tanpa mengubah milik Merah Delima?
4. **Dress code:** butuh field baru di skema; tetap masuk v1 atau tunda?
