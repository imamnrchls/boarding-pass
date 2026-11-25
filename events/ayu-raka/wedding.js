// Data contoh fiktif untuk demo. Skema sama dengan olive-motion / betawi-motion,
// ditambah field opsional yang ditandai "Boarding Pass".
export default {
  id: 'ayu-raka',
  names: 'Ayu & Raka',
  // Boarding Pass (opsional): dua huruf untuk "{inisial} AIRLINES" dan nomor flight. Kosong → diambil dari `names`.
  initials: '',
  date: 'Sabtu, 17 Juli 2027',
  shortDate: '17. 07. 2027',
  blessing: 'Semoga rumah tangga yang kami mulai tumbuh dalam kasih sayang dan kebaikan.',
  welcome: 'Hari ini kami ingin berbagi kabar bahagia. Dalam doa dan rasa syukur, kami mengundang Anda untuk hadir saat kami memulai hidup bersama.',
  quote: {
    text: '“Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.”',
    source: 'QS. Ar-Rum: 21',
  },
  inviteLine: 'Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i serta kerabat sekalian untuk menghadiri acara pernikahan kami:',
  // Boarding Pass: `role` menentukan label Captain (groom) / Co-Pilot (bride). Urutan tampil: groom lalu bride.
  couple: [
    { role: 'bride', name: 'Ayu Larasati', portrait: 'ayu.webp', family: 'Putri dari Bapak Arif dan Ibu Ratna' },
    { role: 'groom', name: 'Raka Pratama', portrait: 'raka.webp', family: 'Putra dari Bapak Bima dan Ibu Rini' },
  ],
  // Boarding Pass (opsional): false → kartu kru memakai inisial, bukan foto.
  showCouplePhotos: true,
  // Boarding Pass (opsional): rute di tiket. Kosong → "Sendiri → Bersama".
  route: { from: 'Sendiri', to: 'Bersama' },
  attendanceNote: 'Untuk contoh undangan ini, tamu diundang menghadiri akad dan resepsi.',
  events: [
    { title: 'Akad Nikah', startsAt: '2027-07-17T09:00:00+07:00', endsAt: '2027-07-17T10:00:00+07:00', date: 'Sabtu, 17 Juli 2027', time: '09.00–10.00 WIB', venue: 'Pendopo Taman Sari', address: 'Patehan, Kraton, Kota Yogyakarta', mapQuery: 'Pendopo Taman Sari, Patehan, Kraton, Kota Yogyakarta' },
    { title: 'Resepsi', startsAt: '2027-07-17T11:00:00+07:00', endsAt: '2027-07-17T14:00:00+07:00', date: 'Sabtu, 17 Juli 2027', time: '11.00–14.00 WIB', venue: 'Pendopo Taman Sari', address: 'Patehan, Kraton, Kota Yogyakarta', mapQuery: 'Pendopo Taman Sari, Patehan, Kraton, Kota Yogyakarta' },
  ],
  // Boarding Pass (opsional): hapus atau kosongkan untuk menyembunyikan.
  dressCode: { note: 'Smart casual, nuansa biru & krem', colors: ['#2F6FD6', '#F3E6CF', '#FAFAF7'] },
  gift: 'Doa dan kehadiran Anda adalah hadiah bagi kami.',
  // The sample numbers are placeholders.
  giftAccounts: [
    { bank: 'Bank Contoh', number: '0000 1111 2222', holder: 'Ayu Larasati' },
    { bank: 'E-Wallet Contoh', number: '0800 0000 0000', holder: 'Raka Pratama' },
  ],
  giftAddress: { recipient: 'Ayu Larasati', address: 'Patehan, Kraton, Kota Yogyakarta' },
  replyBy: '10 Juli 2027',
  // Boarding Pass: `city` (opsional) tampil sebagai nama transit di rute cerita.
  story: [
    { date: 'Mei 2023', city: 'Yogyakarta', title: 'Awal pertemuan', text: 'Kami bertemu di sebuah toko buku. Obrolan singkat tentang satu novel berlanjut hingga kedai kopi tutup.' },
    { date: 'Agustus 2026', city: 'Yogyakarta', title: 'Memilih bersama', text: 'Setelah banyak perjalanan kecil dan percakapan panjang, kami memutuskan untuk memulai babak baru bersama.' },
  ],
  photos: [
    { file: 'couple.webp', alt: 'Ayu dan Raka bergandengan tangan di taman' },
    { file: 'garden.webp', alt: 'Suasana taman tempat pasangan berfoto' },
    { file: 'ayu.webp', alt: 'Potret Ayu' },
    { file: 'raka.webp', alt: 'Potret Raka' },
  ],
  closing: 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.',
  // Musik diunggah per undangan (SPEC §5.5). Kosong → tombol musik disembunyikan.
  music: '',
  // Boarding Pass: Web app URL dari apps-script.gs (berakhiran /exec). Kosong + demo → tersimpan di perangkat.
  rsvpEndpoint: '',
  demo: true,
}
