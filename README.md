# Boarding Pass

Tema undangan pernikahan digital Lembar Kabar bertema tiket pesawat. Polanya sama dengan `olive-motion` dan `betawi-motion`: tema di `templates/`, data per pasangan di `events/`, tanpa framework atau dependency.

## Jalankan lokal

Node.js 20+.

```sh
node build.mjs
python3 -m http.server 8000 --directory dist
```

Buka http://localhost:8000/?to=Ibu%20Dewi. Nama tamu dari `?to` hanya untuk sapaan, bukan autentikasi. Tambahkan `#itinerary` untuk langsung ke jadwal & lokasi tanpa cover.

## Struktur

- `templates/boarding-pass/` — markup, gaya, skrip, dan aset tema.
- `events/<slug>/` — `wedding.js` (data satu pernikahan) + `assets/` (foto, musik).
- `build.mjs <slug>` — menggabungkan tema + satu event ke `dist/`.
- `apps-script.gs` — backend RSVP & ucapan di Google Sheets.
- `docs/` — audit codebase dan spec aset grafis.

## Undangan baru

1. Salin `events/ayu-raka/` ke slug baru, ubah `wedding.js`, ganti isi `assets/`. Data contoh fiktif.
2. Set `demo: false`. Pasang `apps-script.gs` (langkah di kepala file) dan isi `rsvpEndpoint`. Tanpa endpoint dan bukan demo, form konfirmasi disembunyikan.
3. `node build.mjs <slug>`, deploy isi `dist/`. Vercel: ubah `buildCommand` di `vercel.json`.

### Preview WhatsApp

Crawler WhatsApp tidak menjalankan JavaScript, jadi `build.mjs` menulis judul, deskripsi, dan meta `og:*` langsung ke HTML.

- Isi `siteUrl` dengan alamat undangan yang sudah online (`https://…/`). Tanpa itu `og:image` tidak bisa absolut dan WhatsApp tidak menampilkan gambar; build memberi peringatan.
- Buat `events/<slug>/og.jpg` (1200×630) dari `templates/boarding-pass/assets/og-background.jpg` dengan nama pasangan & tanggal di area kanan. Tanpa file ini dipakai latar polos tanpa nama.

Field tambahan dibanding skema olive/betawi (semua opsional kecuali `role`):

| Field | Fungsi |
|---|---|
| `couple[].role` | `'groom'` → CAPTAIN, `'bride'` → CO-PILOT. Tanpa field ini, `couple[0]` dianggap mempelai wanita (konvensi olive). |
| `initials` | Untuk `{inisial} AIRLINES` dan nomor flight. Kosong → huruf pertama tiap nama di `names`. |
| `route {from, to}` | Rute di tiket. Default `Sendiri → Bersama`. |
| `showCouplePhotos` | `false` → kartu kru memakai inisial. |
| `dressCode {note, colors[]}` | Disembunyikan bila tidak ada. Warna boleh `'#hex'` atau `{ color: '#hex', name: 'Krem' }`; nama tampil di bawah palet dan dibacakan screen reader. |
| `story[].city` | Nama transit di rute cerita. |
| `rsvpEndpoint` | URL Web app Apps Script (`…/exec`). |
| `siteUrl` | Alamat undangan online, untuk preview WhatsApp. |

Repo ini publik. Jangan simpan daftar tamu, data RSVP, atau data pribadi lain di sini.
