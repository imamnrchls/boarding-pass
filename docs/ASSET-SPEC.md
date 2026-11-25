# Spec Aset Grafis — Tema Boarding Pass

Turunan dari `SPEC-tema-boarding-pass.md` (§4, §5) dan `docs/AUDIT.md`.
Tujuan dokumen: daftar aset yang **di-generate dengan ChatGPT**, berikut prompt, ukuran, dan kriteria terima. Aset yang lebih baik dibuat sebagai kode (SVG/CSS) **sengaja tidak** diserahkan ke ChatGPT — alasannya di §2.

---

## 1. Ringkasan keputusan

| Kategori | Jumlah | Dibuat oleh |
|---|---|---|
| Wajib, via ChatGPT | 2 (A-01, A-09) | Anda |
| Opsional, via ChatGPT | 3 (A-02, A-04, A-11) | Anda, bila dibutuhkan setelah prototipe |
| Dibuat sebagai kode SVG/CSS | 7 (C-01 … C-07) | Claude Code, saat implementasi |
| Screenshot halaman jadi | 1 (S-01) | Claude Code (Playwright) |

**Prinsip:** gambar hasil AI hanya untuk elemen *bergambar* (langit, tekstur, foto). Semua yang berisi **teks, garis presisi, atau bentuk geometris** dibuat sebagai kode.

## 2. Mengapa sebagian besar aset TIDAK lewat ChatGPT

1. **Teks di gambar AI tidak andal** dan tidak bisa diganti per pasangan. Label tiket (`RA AIRLINES`, `PASSENGER`, `CONFIRMED`, nama tamu) harus teks HTML agar: dinamis per undangan, terbaca screen reader, tajam di semua layar, dan lolos kontras AA.
2. **ChatGPT menghasilkan raster (PNG/JPEG/WebP), bukan vektor.** Siluet pesawat, garis perforasi, bingkai bergerigi, dan ikon akan buram atau berat bila raster; sebagai SVG inline ukurannya < 2 KB dan bisa diwarnai lewat token CSS.
3. **Performa (SPEC §4):** halaman awal ≤ 1 MB dengan 4G lemah. Setiap raster tambahan memakan anggaran itu; SVG/CSS praktis gratis.
4. **Larangan merek maskapai (SPEC §5.6):** generator gambar cenderung meniru livery/logo maskapai nyata. Makin sedikit gambar pesawat raster, makin kecil risikonya.

---

## 3. Aturan gaya global (berlaku untuk semua prompt ChatGPT)

Tempel blok ini di awal setiap sesi ChatGPT:

```
Style guide for every image in this session:
- Flat, semi-flat vector-style illustration with soft grain. Calm, cheerful, airy. Not photorealistic (unless I say "photo").
- Palette only: pale sky #EAF1FB, ticket paper #FAFAF7, blue #2F6FD6, sunset orange #F28C38, ink #222222, muted gray #5A5A5A, stamp red #C0392B. Use orange only as small accents.
- ABSOLUTELY NO text, letters, numbers, logos, watermarks, signatures, or airline liveries/branding anywhere in the image.
- No real airlines, no real airport landmarks, no national flags.
- Keep the composition simple with large calm areas; UI and text will be placed on top later.
```

| Aturan | Nilai |
|---|---|
| Palet | Token SPEC §5.2. Oranye `#F28C38` hanya aksen kecil. |
| Teks dalam gambar | **Dilarang.** Gambar dengan huruf/angka apa pun → tolak & generate ulang. |
| Merek | Tidak ada livery, logo, atau ekor pesawat bermotif maskapai nyata. |
| Format serah | PNG resolusi asli dari ChatGPT. Konversi ke WebP dilakukan di repo (§6). |
| Penamaan | Persis seperti kolom "Nama file" di bawah. |

**Catatan ukuran output [perlu Anda cek]:** ChatGPT biasanya menghasilkan rasio tetap (persegi, landscape, atau portrait), bukan piksel bebas. Minta rasio yang paling dekat; cropping ke ukuran final dilakukan di repo. Transparansi latar **tidak selalu** dihormati — lihat kriteria terima per aset.

---

## 4. Aset via ChatGPT

### A-01 · Latar langit cover (WAJIB)

| Atribut | Nilai |
|---|---|
| Dipakai di | Section 1 Cover & Section 2 Opener, di belakang tiket terlipat |
| Nama file | `sky-cover.png` |
| Rasio minta | Portrait (≈ 2:3 atau 9:16) |
| Ukuran final | 1080 × 1920 px, crop tengah. Di desktop diperluas dengan gradien `--bg`. |
| Anggaran | ≤ 120 KB setelah WebP (aset LCP — paling kritis) |
| Transparan | Tidak |

**Komposisi wajib:**
- Gradien langit pucat: atas biru muda `#EAF1FB` → bawah sedikit hangat (sunset tipis oranye-pink di 15% bawah).
- 3–5 awan putih lembut, **terkonsentrasi di tepi** (atas kiri, kanan tengah, bawah). Area tengah 60% lebar × 50% tinggi **harus kosong & tenang** — di sini tiket diletakkan.
- Satu garis jejak pesawat (contrail) tipis melengkung dari kiri bawah ke kanan atas, sangat samar. **Tanpa pesawat** (pesawat dibuat SVG, C-01).
- Tidak ada matahari besar, gedung, bandara, atau landmark.

**Prompt:**
```
Vertical 9:16 illustration of a pale, calm morning sky for a wedding invitation background.
Soft gradient from very light blue (#EAF1FB) at the top to a faint warm peach-pink sunset glow at the bottom 15%.
A few soft, rounded white clouds placed only near the edges: top-left, middle-right, and along the bottom.
Keep the central area (60% width, 50% height) completely empty and smooth — a paper ticket will be placed there.
One very faint, thin curved airplane contrail from bottom-left to top-right. No airplane visible.
Flat vector style with subtle paper grain. No text, no logos, no buildings, no sun disc.
```

**Kriteria terima:**
- [ ] Area tengah benar-benar polos (tidak ada awan menutupi).
- [ ] Tidak ada huruf/angka/logo, tidak ada pesawat.
- [ ] Warna atas mendekati `#EAF1FB` (selisih tipis boleh; dikoreksi di repo).
- [ ] Teks `#222` di atas area tengah tetap kontras ≥ 4.5:1 (otomatis terpenuhi bila area tengah pucat).

---

### A-09 · Latar gambar preview WhatsApp / Open Graph (WAJIB)

| Atribut | Nilai |
|---|---|
| Dipakai di | `og:image` — preview link di WhatsApp (SPEC §4, §8) |
| Nama file | `og-background.png` |
| Rasio minta | Landscape (≈ 16:9 / 3:2) |
| Ukuran final | **1200 × 630 px** (sama dengan `og.jpg` Merah Delima & Lembar Kabar) |
| Anggaran | ≤ 150 KB JPEG final (setelah teks ditambahkan) |
| Transparan | Tidak |

**Penting:** gambar ini **tanpa teks**. Nama pasangan & tanggal ditambahkan belakangan per undangan (lewat skrip build atau manual di editor). WhatsApp memotong preview menjadi kira-kira persegi di beberapa tampilan, jadi **elemen penting di tengah**.

**Komposisi wajib:**
- Kiri ~40%: siluet tiket/boarding pass kertas **kosong** (tanpa tulisan), sedikit miring ±4°, dengan garis perforasi dan stub sobek di sisi kanannya.
- Kanan ~60%: langit pucat dengan awan di tepi; **area kosong besar** di tengah-kanan untuk teks nama pasangan.
- Satu pesawat kecil generik (putih polos, tanpa livery) di kanan atas, kecil (≤ 8% lebar).

**Prompt:**
```
Horizontal 1200x630 social preview illustration for a travel-themed wedding invitation.
On the left 40%: a blank cream paper boarding pass (#FAFAF7) tilted about 4 degrees, with a dashed perforation line and a torn stub on its right edge. The ticket is completely blank — no text, no barcode, no numbers.
On the right 60%: a pale blue sky (#EAF1FB) with soft clouds near the edges, leaving a large empty calm area in the center-right for a title to be added later.
A small plain white generic airplane, no livery and no logo, in the top-right corner, small.
Small accents in sunset orange (#F28C38) and blue (#2F6FD6). Flat vector style, subtle grain.
No text, no letters, no numbers, no logos anywhere.
```

**Kriteria terima:**
- [ ] Tiket benar-benar kosong (tanpa barcode palsu, tanpa huruf).
- [ ] Pesawat polos tanpa logo/warna maskapai.
- [ ] Area teks kanan-tengah cukup luas untuk 2 baris judul.

---

### A-02 · Lapisan awan transparan (OPSIONAL)

Hanya bila animasi parallax awan di Opener dirasa perlu setelah prototipe. **Default v1: tidak dipakai** — awan sudah ada di A-01.

| Atribut | Nilai |
|---|---|
| Nama file | `cloud-1.png`, `cloud-2.png` |
| Ukuran final | ±600 × 300 px masing-masing |
| Anggaran | ≤ 25 KB per file (WebP alpha) |
| Transparan | **Ya, wajib** |

**Prompt:**
```
A single soft, rounded white cartoon cloud with a very light blue shadow underneath, flat vector style, isolated on a fully transparent background. No text.
```
**Kriteria terima:** latar benar-benar transparan (bukan putih/kotak-kotak tercetak). Bila ChatGPT tidak memberi alpha → tolak; awan akan dibuat SVG.

---

### A-04 · Tekstur kertas tiket (OPSIONAL)

Hanya bila tiket polos `#FAFAF7` terasa terlalu "digital".

| Atribut | Nilai |
|---|---|
| Nama file | `paper-texture.png` |
| Ukuran final | 512 × 512 px, **tileable** (seamless) |
| Anggaran | ≤ 30 KB |
| Dipakai | `background-image` berulang dengan opacity rendah |

**Prompt:**
```
Seamless tileable texture of smooth off-white cardstock paper (#FAFAF7), extremely subtle fiber grain, flat even lighting, no folds, no stains, no shadows, no text. Square.
```
**Kriteria terima:** saat diulang 3×3 tidak terlihat sambungan; kontras tekstur sangat rendah (tidak mengganggu teks mono kecil).

---

### A-11 · Foto demo pasangan fiktif (OPSIONAL — rekomendasi: JANGAN dulu)

**Rekomendasi:** untuk demo etalase, **pakai ulang foto Ayu & Raka** dari `olive-motion/events/ayu-raka/assets/` (`couple.webp`, `garden.webp`, `ayu.webp`, `raka.webp`). Alasan: sudah fiktif & sudah disetujui untuk etalase, skema data sama, nol effort. Foto bertema travel hanya menambah "rasa", bukan fungsi.

Risiko bila tetap generate: ChatGPT sulit menjaga **wajah yang sama** di beberapa foto; hasil foto-realistis orang juga harus dipastikan **bukan menyerupai orang nyata**.

Bila tetap dibuat:

| File | Rasio | Ukuran final | Anggaran |
|---|---|---|---|
| `couple-airport.png` | landscape | 1536 × 1024 | ≤ 200 KB |
| `portrait-groom.png`, `portrait-bride.png` | portrait 3:4 | 600 × 800 → ditampilkan bulat | ≤ 40 KB |
| `gallery-1..4.png` | campur | sisi panjang 1440 | ≤ 200 KB/foto (SPEC §4) |

Arah visual: pasangan muda Indonesia, busana kasual rapi, latar terminal/jendela pesawat/koper/peta yang **generik** (tanpa signage, tanpa logo maskapai, tanpa nama bandara terbaca). Sertakan "photo" di prompt + aturan global "no text, no logos".

---

## 5. Aset yang dibuat sebagai kode (tidak perlu ChatGPT)

Dicatat agar jelas siapa yang membuat apa. Dikerjakan Claude Code saat implementasi tema.

| ID | Aset | Teknik | Alasan |
|---|---|---|---|
| C-01 | Siluet pesawat kecil (cover, rute cerita, penutup lepas landas) | SVG inline, `fill: currentColor` | Dipakai 3 tempat, perlu diwarnai & dianimasi `transform`; < 1 KB |
| C-02 | Garis perforasi + lekuk setengah lingkaran tiket | CSS (`--perforation`, `radial-gradient` mask) | Harus presisi & responsif terhadap lebar nama tamu |
| C-03 | Stempel **CONFIRMED** | SVG lingkaran ganda + teks HTML, warna `--stamp` | Teks wajib tajam; momen utama tema |
| C-04 | Bingkai stempel paspor (galeri, border bergerigi) | CSS `mask` / SVG | Membungkus foto dinamis berukuran apa pun |
| C-05 | Rute titik-titik cerita | SVG `stroke-dasharray` | Panjang mengikuti jumlah item `story` |
| C-06 | Monogram crew (bila tanpa foto) | HTML inisial dalam lingkaran | Data-driven dari `couple[].name` |
| C-07 | Favicon, ikon PWA 192/512, apple-touch-icon | SVG → PNG via skrip | Mengikuti set ikon tema lain |

Papan keberangkatan split-flap dan tag bagasi juga murni CSS (SPEC §5.4).

## 6. Aset screenshot

| ID | Aset | Cara |
|---|---|---|
| S-01 | Sampul katalog etalase `lembar-kabar/assets/boarding-pass.jpg` | Screenshot cover demo yang sudah jadi via Playwright (≈ 900 × 714, ≤ 80 KB; ukuran lain di etalase: 760–900 px lebar). **Bukan** generate AI, supaya katalog menampilkan produk yang sebenarnya dijual. |

---

## 7. Serah terima & pemrosesan di repo

1. Simpan PNG asli hasil ChatGPT ke folder `source-art/` di root repo (tidak ikut build).
2. Claude Code akan: crop ke ukuran final → koreksi warna bila perlu → konversi WebP (OG tetap JPEG karena kompatibilitas preview) → letakkan di `templates/boarding-pass/assets/`.
3. Cek akhir per aset: ukuran file sesuai anggaran, tidak ada teks/logo, kontras teks di atasnya ≥ 4.5:1.

**Anggaran total gambar di atas lipatan (above the fold):** A-01 (≤ 120 KB) + SVG inline. Target halaman awal ≤ 1 MB (SPEC §4) aman dengan rencana ini.

## 8. Urutan kerja yang disarankan

1. Generate **A-01** dulu → saya pasang di prototipe cover → cek di 360×800.
2. **A-09** setelah layout cover final (agar gaya konsisten).
3. A-02 / A-04 / A-11 **hanya** bila prototipe menunjukkan kebutuhan nyata.
