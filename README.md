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

Field tambahan dibanding skema olive/betawi (semua opsional kecuali `role`):

| Field | Fungsi |
|---|---|
| `couple[].role` | `'groom'` → CAPTAIN, `'bride'` → CO-PILOT. Tanpa field ini, `couple[0]` dianggap mempelai wanita (konvensi olive). |
| `initials` | Untuk `{inisial} AIRLINES` dan nomor flight. Kosong → huruf pertama tiap nama di `names`. |
| `route {from, to}` | Rute di tiket. Default `Sendiri → Bersama`. |
| `showCouplePhotos` | `false` → kartu kru memakai inisial. |
| `dressCode {note, colors[]}` | Disembunyikan bila tidak ada. |
| `story[].city` | Nama transit di rute cerita. |
| `rsvpEndpoint` | URL Web app Apps Script (`…/exec`). |

Repo ini publik. Jangan simpan daftar tamu, data RSVP, atau data pribadi lain di sini.
