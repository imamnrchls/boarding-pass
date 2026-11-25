/**
 * Backend Check-in (RSVP) & Flight Log — tema Boarding Pass (Google Sheets).
 * Turunan dari merah-delima/apps-script.gs. Perbedaan: kehadiran y/m/n (m = ragu),
 * kolom jumlah tamu, daftar ucapan dibatasi 50 terbaru, rekap hitungan, honeypot.
 *
 * Cara pasang (sekali per undangan):
 * 1. Buat Google Sheet baru, mis. "RSVP Ayu & Raka".
 * 2. Extensions > Apps Script. Hapus isi Code.gs, tempel seluruh file ini, lalu Save.
 * 3. Deploy > New deployment > type "Web app". Execute as: Me. Who has access: Anyone.
 *    Deploy, izinkan akses, salin "Web app URL" (berakhiran /exec).
 * 4. Isi `rsvpEndpoint` di events/<slug>/wedding.js dengan URL itu, lalu build ulang.
 *
 * Rekap untuk katering: File > Download > CSV pada tab "RSVP" (kolom name, att, guests).
 * Menghapus ucapan: hapus barisnya langsung di Sheet.
 * Setelah mengubah file ini: Deploy > Manage deployments > Edit > Version: New version (URL tetap).
 *
 * Catatan: URL /exec bersifat publik (harus, agar browser tamu bisa mengirim). Jangan simpan data
 * sensitif lain di Sheet ini. GET hanya mengembalikan nama, status, ucapan, dan waktu — bukan jumlah tamu.
 */
const SHEET_NAME = 'RSVP';
const HEADER = ['ts', 'name', 'att', 'guests', 'msg'];
const LIST_LIMIT = 50;

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADER);
    sh.setFrozenRows(1);
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// { counts: {y, m, n}, wishes: [50 ucapan terbaru] }
function doGet() {
  const sh = sheet_();
  const last = sh.getLastRow();
  if (last < 2) return json_({ counts: { y: 0, m: 0, n: 0 }, wishes: [] });
  const rows = sh.getRange(2, 1, last - 1, HEADER.length).getValues();
  const counts = { y: 0, m: 0, n: 0 };
  const wishes = [];
  for (let i = rows.length - 1; i >= 0; i--) {
    const r = rows[i];
    if (!r[1]) continue;
    const att = ['y', 'm', 'n'].indexOf(String(r[2])) >= 0 ? String(r[2]) : 'y';
    counts[att]++;
    if (r[4] && wishes.length < LIST_LIMIT) wishes.push({ ts: Number(r[0]) || 0, name: String(r[1]), att: att, msg: String(r[4]) });
  }
  wishes.sort(function (a, b) { return b.ts - a.ts; });
  return json_({ counts: counts, wishes: wishes });
}

function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'invalid json' }); }
  if (d.website) return json_({ ok: true }); // honeypot
  // Teks diawali = + - @ diberi tanda kutip agar tidak dibaca sebagai rumus oleh Sheets.
  const clean = function (s, n) { return String(s || '').trim().slice(0, n).replace(/^[=+\-@]/, "'$&"); };
  const name = clean(d.name, 60);
  const msg = clean(d.msg, 500);
  const att = ['y', 'm', 'n'].indexOf(d.att) >= 0 ? d.att : '';
  const guests = att === 'n' ? 0 : Math.min(5, Math.max(1, Math.floor(Number(d.guests)) || 1));
  if (!name || !att) return json_({ ok: false, error: 'missing fields' });

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return json_({ ok: false, error: 'busy' });
  try {
    const sh = sheet_();
    // Tolak kiriman ganda yang persis sama dalam 2 menit terakhir (mis. tamu menekan ulang setelah timeout).
    const last = sh.getLastRow();
    if (last >= 2) {
      const from = Math.max(2, last - 19);
      const recent = sh.getRange(from, 1, last - from + 1, HEADER.length).getValues();
      const now = Date.now();
      if (recent.some(function (r) { return String(r[1]) === name && String(r[2]) === att && String(r[4]) === msg && now - Number(r[0]) < 120000; })) {
        return json_({ ok: true, duplicate: true });
      }
    }
    sh.appendRow([Date.now(), name, att, guests, msg]);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}
