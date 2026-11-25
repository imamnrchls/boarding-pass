# Verifikasi — Checklist SPEC §8

Tanggal: 2026-11-25 · Build: `node build.mjs ayu-raka` · Alat: Playwright (Chromium) pada 360×800, 390×844, 1440×900.

Legenda: ✅ diuji otomatis dan lulus · ⚠️ sebagian / simulasi · ⏳ belum bisa diuji di lingkungan ini · ➖ tidak berlaku.

## Fungsional

| Butir | Status | Bukti / catatan |
|---|---|---|
| Ganti `tema` → tampilan berganti, konten identik | ➖ | Keputusan audit: satu repo per tema (pola olive/betawi), bukan skeleton bersama. Skema `wedding.js` kompatibel; field tambahan Boarding Pass diabaikan tema lain. |
| `?to=` dengan spasi, apostrof, emoji, `<script>` aman | ✅ | Dirender via `textContent`; tidak ada dialog; tidak ada overflow pada nama 80 karakter. |
| Musik baru berbunyi setelah tap; play/pause | ⚠️ | `play()` dipanggil di handler tap; tombol tampil setelah gate. Pemutaran audio nyata tidak diuji (tidak ada file musik demo, sesuai §5.5). |
| `musik` kosong → tombol tersembunyi, tanpa error | ✅ | |
| RSVP & ucapan tersimpan di spreadsheet; gagal kirim → pesan & isian tetap | ⚠️ | Jalur gagal (HTTP 500, koneksi putus, `ok:false`) diuji dengan respons tiruan: pesan "Gagal mengirim, coba lagi", isian utuh, tombol aktif lagi. **Penulisan ke Google Sheets asli belum diuji** — butuh deploy `apps-script.gs` di akun Google pemilik. |
| Countdown benar (WIB dari data), tidak negatif setelah acara | ✅ | Diuji dengan jam palsu: saat acara → "Acara sedang berlangsung"; setelahnya → "Acara telah berlangsung". |
| Add to Calendar tanggal/jam/lokasi benar | ✅ | 09.00 WIB → `DTSTART:20270717T020000Z` di `.ics` dan Google Calendar; lokasi ter-escape. |
| Maps membuka lokasi benar | ✅ | URL berisi `mapQuery` (atau `mapPin` bila valid). |
| RSVP: validasi inline, tanpa double-submit, ucapan muncul | ✅ | 1 POST meski tombol ditekan dua kali; ucapan ber-HTML tampil sebagai teks. |
| Tombol salin rekening + feedback | ✅ | Clipboard berisi `000011112222`; label berubah "Tersalin ✓". |
| Section opsional kosong → tersembunyi | ✅ | Cerita+galeri (beserta tab ROUTE), rekening+alamat, dress code. |
| `showCouplePhotos=false` → layout rapi | ✅ | Monogram inisial. |
| Setiap label tiket punya keterangan biasa | ✅ | 40 label diperiksa, 0 tanpa keterangan. |
| Stempel CONFIRMED hanya setelah submit sukses | ✅ | Tersembunyi sebelum submit dan pada semua jalur gagal; setelah sukses terlihat penuh di viewport. |
| Oranye `--accent` tidak dipakai untuk teks | ✅ | Tidak ada `color: var(--accent)` di CSS. |
| Tidak ada nama/logo maskapai nyata | ✅ | Maskapai = `{inisial} AIRLINES`; aset ChatGPT diperiksa visual (pesawat polos). |

## Non-fungsional

| Butir | Status | Bukti / catatan |
|---|---|---|
| LCP ≤ 2,5 s pada 4G | ⚠️ | **Indikatif, bukan Lighthouse** (Lighthouse tidak diizinkan di sesi ini). Profil slow-4G (150 ms RTT, 1,6 Mbps) + CPU 4×: LCP 988–1076 ms (3 run, server lokal). Ukur ulang dengan Lighthouse/PageSpeed setelah deploy. |
| Halaman awal ≤ 1 MB | ✅ | 137 KB ditransfer sebelum gate (termasuk font Google, langit 18 KB). |
| `prefers-reduced-motion` → tanpa animasi opener | ✅ | Cover langsung hilang; semua animasi/transition dimatikan. |
| Kontras teks isi ≥ 4.5:1 | ✅ | Dihitung per pasangan warna. `#2F6FD6` di `--bg` hanya 4.23:1 → teks biru memakai `--primary-text #2A66C8` (4.82:1). |
| Tampilan benar di 360×800, 390×844, 1440 | ✅ | Tanpa scroll horizontal; screenshot diperiksa. |
| Preview WhatsApp judul & gambar | ⏳ | Meta `og:*` kini ditulis saat build (crawler tidak menjalankan JS). Butuh `siteUrl` + domain online untuk menguji di WhatsApp sungguhan. |

## Integrasi Lembar Kabar (branch `claude/graphic-asset-specs-enmkcg` di `lembar-kabar`)

- Entri katalog `boarding-pass` (kategori baru **Playful**), sampul `assets/boarding-pass.jpg` dari screenshot demo asli.
- `scripts/sync-previews.mjs` + workflow: `contoh/boarding-pass` disinkronkan dari repo ini. Salinan demo dibuat dengan menjalankan skrip sinkronisasi itu sendiri, bukan disalin manual.
- Demo `/contoh/boarding-pass/?a=Sinta&b=Bagas` → nama, inisial maskapai (SB), dan nomor flight (SB 1707) ikut berubah. `npm run build` lulus; tidak ada error console.

## Risiko terbuka

1. **Sinkronisasi per jam bergantung pada branch default repo ini.** Skrip meng-clone branch default; saat ini itu `claude/graphic-asset-specs-enmkcg`. Jika branch itu dihapus atau strukturnya berubah sebelum `main` dibuat, sync semua tema gagal (perilaku skrip yang sudah ada: satu produk gagal → seluruh sync berhenti). Buat `main` dan jadikan default sebelum merge integrasi di `lembar-kabar`.
2. Apps Script belum diuji dengan Sheet sungguhan (lihat RSVP di atas).
3. LCP belum diukur dengan Lighthouse di hosting sebenarnya.
