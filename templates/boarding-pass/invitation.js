import wedding from '../../wedding.js'

const $ = (id) => document.getElementById(id)
const asset = (file) => new URL('../../assets/' + encodeURIComponent(file), import.meta.url).href
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches

function el(tag, props = {}, ...children) {
  const node = document.createElement(tag)
  for (const [key, value] of Object.entries(props)) {
    if (key === 'class') node.className = value
    else if (key === 'text') node.textContent = value
    else if (key.startsWith('data-') || key.startsWith('aria-') || key === 'style') node.setAttribute(key, value)
    else node[key] = value
  }
  node.append(...children.filter(Boolean))
  return node
}
const icon = (id, cls = 'ico') => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('class', cls)
  svg.setAttribute('aria-hidden', 'true')
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use')
  use.setAttribute('href', '#i-' + id)
  svg.append(use)
  return svg
}
// Ticket label + plain-language caption (SPEC §5.3: every ticket label has a caption).
const labelled = (label, caption, value, cls = 'field') => el('div', { class: cls },
  el('p', { class: 'label', text: label }),
  el('p', { class: 'caption', text: caption }),
  el('p', { class: 'value', text: value }),
)
const setText = (selector, text) => document.querySelectorAll(selector).forEach((node) => { node.textContent = text })

/* ---------- derived data ---------- */
const events = [...wedding.events].sort((a, b) => (Date.parse(a.startsAt) || 0) - (Date.parse(b.startsAt) || 0))
const first = events[0]
const initials = (wedding.initials || wedding.names.split(/\s*&\s*/).map((part) => Array.from(part.trim())[0] || '').join(''))
  .toUpperCase().slice(0, 3)
// Day and month as written in the event's own offset (avoids the viewer's time zone).
const isoDay = /^\d{4}-(\d{2})-(\d{2})/.exec(first?.startsAt || '')
const flightNo = initials + (isoDay ? ' ' + isoDay[2] + isoDay[1] : '')
const route = { from: wedding.route?.from || 'Sendiri', to: wedding.route?.to || 'Bersama' }

/* ---------- cover & text ---------- */
document.title = wedding.names + ' | Undangan Pernikahan'
document.querySelector('meta[name="description"]').content = 'Undangan pernikahan ' + wedding.names + ' · ' + wedding.date + '.'
setText('[data-names]', wedding.names)
setText('[data-initials]', initials)
setText('[data-date]', wedding.shortDate || wedding.date)

const guest = (new URLSearchParams(location.search).get('to') || '').replace(/\s+/g, ' ').trim().slice(0, 80)
if (guest) $('guest').textContent = guest

if (wedding.quote) {
  $('quote-text').textContent = wedding.quote.text
  $('quote-source').textContent = wedding.quote.source || ''
} else {
  $('quote-text').textContent = wedding.blessing || ''
}
$('invite-line').textContent = wedding.inviteLine || wedding.welcome
$('closing-text').textContent = wedding.closing || ''

/* ---------- crew ---------- */
const roleOf = (partner, index) => partner.role === 'groom' || partner.role === 'bride' ? partner.role : (index === 0 ? 'bride' : 'groom')
const crew = wedding.couple.map((partner, index) => ({ ...partner, role: roleOf(partner, index) }))
  .sort((a, b) => (a.role === 'groom' ? 0 : 1) - (b.role === 'groom' ? 0 : 1))
const showPhotos = wedding.showCouplePhotos !== false
for (const partner of crew) {
  const groom = partner.role === 'groom'
  const monogram = Array.from(partner.name.trim())[0]?.toUpperCase() || ''
  const badge = el('figure', { class: 'crew-photo' })
  if (showPhotos && partner.portrait) badge.append(el('img', { src: asset(partner.portrait), alt: partner.name, loading: 'lazy', width: 300, height: 428 }))
  else badge.append(el('span', { class: 'monogram', text: monogram, 'aria-hidden': 'true' }))
  const card = el('article', { class: 'crew-card ' + partner.role },
    el('p', { class: 'airline', text: initials + ' AIRLINES · CREW ID' }),
    badge,
    el('p', { class: 'label', text: groom ? 'CAPTAIN' : 'CO-PILOT' }),
    el('p', { class: 'caption', text: groom ? 'Mempelai Pria' : 'Mempelai Wanita' }),
    el('h3', { text: partner.name }),
    partner.family && el('p', { class: 'family', text: partner.family }),
  )
  const handle = partner.instagram?.replace(/^@/, '').trim()
  if (handle && /^[\w.]{1,30}$/.test(handle)) {
    const link = el('a', { class: 'social', href: 'https://www.instagram.com/' + handle + '/', target: '_blank', rel: 'noopener', 'aria-label': 'Instagram ' + partner.name })
    link.append(icon('camera'), '@' + handle)
    card.append(link)
  }
  $('couple').append(card)
}

/* ---------- itinerary ---------- */
const grid = $('flight-grid')
grid.append(
  labelled('FLIGHT', 'Nomor', flightNo),
  labelled('DATE', 'Tanggal', wedding.shortDate || wedding.date),
  labelled('FROM → TO', 'Rute', route.from + ' → ' + route.to, 'field wide'),
  labelled('BOARDING', 'Jam Mulai', first?.time?.split(/[–-]/)[0]?.trim() || '-'),
  labelled('GATE', 'Lokasi Acara', first?.venue || '-'),
  labelled('SEAT', 'Tempat Duduk', 'VIP'),
)

if (wedding.attendanceNote) {
  $('attendance-note').textContent = wedding.attendanceNote
  $('attendance-note').hidden = false
}
const mapLink = (event) => {
  const pin = event.mapPin && /^-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?$/.test(event.mapPin)
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(pin ? event.mapPin : event.mapQuery || event.venue + ', ' + event.address)
}
const stamp = (time) => new Date(time).toISOString().replace(/[-:]|\.\d{3}/g, '')
const icsText = (value) => String(value).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1')
function icsFile(event, start, end) {
  const body = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Lembar Kabar//Boarding Pass//ID', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
    'UID:' + wedding.id + '-' + start + '@lembarkabar.web.id',
    'DTSTAMP:' + stamp(Date.now()), 'DTSTART:' + stamp(start), 'DTEND:' + stamp(end),
    'SUMMARY:' + icsText(event.title + ' · ' + wedding.names),
    'LOCATION:' + icsText(event.venue + ', ' + event.address),
    'URL:' + location.origin + location.pathname,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
  return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(body)
}
events.forEach((event, index) => {
  const segment = el('article', { class: 'segment' },
    el('p', { class: 'segment-no', text: 'SEGMENT ' + (index + 1) + ' / ' + events.length }),
    el('h3', { text: event.title }),
    el('div', { class: 'segment-grid' },
      labelled('DATE', 'Tanggal', event.date),
      labelled('BOARDING', 'Jam', event.time),
      labelled('GATE', 'Lokasi Acara', event.venue, 'field wide'),
    ),
    el('address', { text: event.address }),
  )
  const actions = el('div', { class: 'actions' })
  const map = el('a', { class: 'btn btn-primary small', href: mapLink(event), target: '_blank', rel: 'noopener', 'aria-label': 'Buka lokasi ' + event.title + ' di Google Maps' })
  map.append(icon('pin'), 'Arahkan ke Gate (Maps)')
  actions.append(map)
  const start = Date.parse(event.startsAt)
  const end = Date.parse(event.endsAt)
  if (Number.isFinite(start) && end > start) {
    const gcal = el('a', {
      class: 'btn btn-ghost small', target: '_blank', rel: 'noopener', 'aria-label': 'Simpan ' + event.title + ' ke Google Calendar',
      href: 'https://calendar.google.com/calendar/render?' + new URLSearchParams({
        action: 'TEMPLATE', text: event.title + ' · ' + wedding.names, dates: stamp(start) + '/' + stamp(end), location: event.venue + ', ' + event.address,
      }),
    })
    gcal.append(icon('cal'), 'Google Calendar')
    const ics = el('a', { class: 'btn btn-ghost small', href: icsFile(event, start, end), download: wedding.id + '-' + (index + 1) + '.ics', 'aria-label': 'Unduh ' + event.title + ' sebagai file kalender' })
    ics.append(icon('cal'), 'Kalender (.ics)')
    actions.append(gcal, ics)
  }
  segment.append(actions)
  $('events').append(segment)
})

const dress = wedding.dressCode
if (dress && (dress.note || dress.colors?.length)) {
  $('dress').hidden = false
  $('dress-note').textContent = dress.note || ''
  for (const color of dress.colors || []) {
    if (!/^#[0-9a-f]{3,8}$/i.test(color)) continue
    $('dress-colors').append(el('li', { style: 'background:' + color, 'aria-label': 'Warna ' + color }))
  }
}

/* ---------- countdown ---------- */
const starts = events.map(({ startsAt }) => Date.parse(startsAt)).filter(Number.isFinite)
const ends = events.map(({ endsAt }) => Date.parse(endsAt)).filter(Number.isFinite)
const target = Math.min(...starts)
const finish = Math.max(...ends, target)
const pad = (n) => String(n).padStart(2, '0')
function countdownDone(now) {
  $('countdown').hidden = true
  const done = $('countdown-done')
  done.hidden = false
  done.textContent = now < finish ? 'Acara sedang berlangsung' : 'Acara telah berlangsung'
}
if (Number.isFinite(target)) {
  const box = $('countdown')
  let timer
  const tick = () => {
    const now = Date.now()
    const left = Math.floor((target - now) / 1000)
    if (left <= 0) {
      clearInterval(timer)
      return countdownDone(now)
    }
    box.hidden = false
    const parts = { days: Math.floor(left / 86400), hours: Math.floor(left / 3600) % 24, minutes: Math.floor(left / 60) % 60, seconds: left % 60 }
    for (const [unit, value] of Object.entries(parts)) box.querySelector(`[data-unit="${unit}"]`).textContent = pad(value)
  }
  tick()
  if (target > Date.now()) timer = setInterval(tick, 1000)
}

/* ---------- route & gallery ---------- */
const story = wedding.story || []
story.forEach((chapter, index) => {
  $('chapters').append(el('li', { class: 'stop' },
    el('p', { class: 'label', text: 'TRANSIT ' + (index + 1) + (chapter.city ? ' · ' + chapter.city.toUpperCase() : '') }),
    chapter.date && el('p', { class: 'caption', text: chapter.date }),
    el('h3', { text: chapter.title }),
    el('p', { text: chapter.text }),
  ))
})
const photos = wedding.photos || []
$('story-block').hidden = !story.length
$('gallery-block').hidden = !photos.length
$('route').hidden = !story.length && !photos.length
$('tab-route').hidden = $('route').hidden

const viewer = $('viewer')
let current = 0
let opener
function show(index) {
  current = (index + photos.length) % photos.length
  $('viewer-img').src = asset(photos[current].file)
  $('viewer-img').alt = photos[current].alt
  $('viewer-pos').textContent = current + 1 + ' / ' + photos.length
}
photos.forEach((photo, index) => {
  const link = el('a', { class: 'photo', href: asset(photo.file), 'aria-label': 'Lihat foto: ' + photo.alt, style: '--tilt:' + ([-3, 2, -1.5, 3, -2.5, 1][index % 6]) + 'deg' },
    el('img', { src: asset(photo.file), alt: photo.alt, loading: 'lazy', decoding: 'async' }))
  link.addEventListener('click', (event) => {
    if (typeof viewer.showModal !== 'function' || event.metaKey || event.ctrlKey) return
    event.preventDefault()
    opener = link
    show(index)
    viewer.showModal()
  })
  $('photos').append(link)
})
$('viewer-close').addEventListener('click', () => viewer.close())
$('viewer-prev').addEventListener('click', () => show(current - 1))
$('viewer-next').addEventListener('click', () => show(current + 1))
viewer.addEventListener('click', (event) => { if (event.target === viewer) viewer.close() })
viewer.addEventListener('close', () => opener?.focus({ preventScroll: true }))
viewer.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') show(current - 1)
  if (event.key === 'ArrowRight') show(current + 1)
})

/* ---------- gift baggage ---------- */
const accounts = wedding.giftAccounts || []
if (accounts.length || wedding.giftAddress) {
  $('gift').hidden = false
  $('gift-text').textContent = wedding.gift || ''
  accounts.forEach((account) => {
    const copy = el('button', { class: 'btn btn-ghost small copy', type: 'button', text: 'Salin', 'aria-label': 'Salin nomor ' + account.bank })
    copy.addEventListener('click', async () => {
      const digits = account.number.replace(/\s+/g, '')
      try {
        await navigator.clipboard.writeText(digits)
        copy.textContent = 'Tersalin ✓'
      } catch {
        copy.textContent = digits
      }
      setTimeout(() => { copy.textContent = 'Salin' }, 2200)
    })
    $('gift-list').append(el('div', { class: 'tag' },
      el('p', { class: 'label', text: 'BAGGAGE TAG' }),
      el('p', { class: 'caption', text: account.bank }),
      el('p', { class: 'value number', text: account.number }),
      el('p', { class: 'holder', text: 'a.n. ' + account.holder }),
      copy,
    ))
  })
  if (wedding.giftAddress) {
    $('gift-list').append(el('div', { class: 'tag' },
      el('p', { class: 'label', text: 'DELIVERY' }),
      el('p', { class: 'caption', text: 'Alamat kirim kado' }),
      el('p', { class: 'value', text: wedding.giftAddress.recipient }),
      el('p', { class: 'holder', text: wedding.giftAddress.address }),
    ))
  }
}

/* ---------- check-in (RSVP) & flight log ---------- */
const form = $('reply')
const status = $('reply-status')
const send = $('reply-send')
const endpoint = /^https:\/\/script\.google\.com\/(?:a\/macros\/[\w.-]+|macros)\/s\/[\w-]+\/exec$/.test(wedding.rsvpEndpoint || '') ? wedding.rsvpEndpoint : ''
const local = !endpoint && wedding.demo
const storeKey = 'invitation:rsvp:' + wedding.id
const doneKey = 'invitation:rsvp-done:' + wedding.id
const store = {
  read() { try { return JSON.parse(localStorage.getItem(storeKey)) || [] } catch { return [] } },
  write(list) { localStorage.setItem(storeKey, JSON.stringify(list.slice(0, 50))) },
}
if (wedding.replyBy) {
  $('reply-by').textContent = 'Mohon konfirmasi sebelum ' + wedding.replyBy + '.'
  $('reply-by').hidden = false
}
if (guest) form.elements.name.value = guest.slice(0, 60)

const ago = (time) => {
  const minutes = Math.max(0, Math.round((Date.now() - time) / 60000))
  if (minutes < 1) return 'baru saja'
  if (minutes < 60) return minutes + ' menit lalu'
  if (minutes < 1440) return Math.round(minutes / 60) + ' jam lalu'
  return Math.round(minutes / 1440) + ' hari lalu'
}
const logTime = (time) => {
  const date = new Date(time)
  return pad(date.getDate()) + '/' + pad(date.getMonth() + 1) + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes())
}
const attLabel = { y: 'Hadir', m: 'Ragu', n: 'Tidak hadir' }
function renderLog({ wishes, counts }) {
  $('log-block').hidden = false
  if (counts) {
    $('tally').hidden = false
    for (const key of ['y', 'm', 'n']) $('count-' + key).textContent = counts[key] || 0
  }
  const list = $('wishes')
  list.replaceChildren()
  const shown = wishes.filter((w) => w.msg).slice(0, 50)
  if (!shown.length) list.append(el('li', { class: 'empty', text: 'Belum ada ucapan. Jadilah yang pertama.' }))
  for (const wish of shown) {
    list.append(el('li', {},
      el('p', { class: 'log-head' },
        el('time', { dateTime: new Date(wish.ts).toISOString(), title: ago(wish.ts), text: logTime(wish.ts) }),
        el('strong', { text: wish.name }),
        el('span', { class: 'badge ' + wish.att, text: attLabel[wish.att] || '' }),
      ),
      el('p', { text: wish.msg }),
    ))
  }
}
const countOf = (list) => list.reduce((acc, w) => ({ ...acc, [w.att]: (acc[w.att] || 0) + 1 }), {})

async function request(options = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)
  try {
    // text/plain keeps this a simple request (no CORS preflight), which Apps Script web apps accept.
    const response = await fetch(endpoint + (options.method ? '' : '?t=' + Date.now()), { ...options, cache: 'no-store', redirect: 'follow', signal: controller.signal })
    if (!response.ok) throw new Error('HTTP ' + response.status)
    return await response.json()
  } finally {
    clearTimeout(timeout)
  }
}
async function loadLog() {
  if (local) return renderLog({ wishes: store.read(), counts: countOf(store.read()) })
  try {
    const data = await request()
    if (Array.isArray(data.wishes)) renderLog(data)
  } catch {
    // Reading wishes is non-essential; keep the section hidden.
  }
}
function showStamp(animate) {
  $('stamp').hidden = false
  $('stamp').classList.toggle('pop', animate && !reducedMotion)
}
try { if (localStorage.getItem(doneKey)) showStamp(false) } catch {}

const syncGuests = () => {
  const att = form.elements.att.value
  $('guests-field').hidden = att === 'n'
}
form.addEventListener('change', syncGuests)

function validate() {
  const name = form.elements.name.value.trim()
  const att = form.elements.att.value
  $('e-name').hidden = Boolean(name)
  $('e-att').hidden = Boolean(att)
  form.elements.name.setAttribute('aria-invalid', String(!name))
  if (!name) form.elements.name.focus()
  else if (!att) form.querySelector('input[name="att"]').focus()
  return name && att ? { name, att } : null
}

if (!endpoint && !wedding.demo) {
  form.closest('.ticket').hidden = true
  $('reply-closed').hidden = false
} else {
  $('demo-note').hidden = !local
  loadLog()
  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    if (send.disabled) return
    const valid = validate()
    if (!valid) return
    if (form.elements.website.value) return // honeypot: silently ignore bots
    const guests = valid.att === 'n' ? 0 : Math.min(5, Math.max(1, Number(form.elements.guests.value) || 1))
    const entry = { ts: Date.now(), name: valid.name, att: valid.att, guests, msg: form.elements.msg.value.trim().slice(0, 500) }
    send.disabled = true
    status.className = 'status'
    status.textContent = 'Mengirim…'
    try {
      if (local) {
        store.write([entry, ...store.read()])
      } else {
        const result = await request({ method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(entry) })
        if (!result?.ok) throw new Error(result?.error || 'rejected')
      }
      try { localStorage.setItem(doneKey, '1') } catch {}
      status.className = 'status ok'
      status.textContent = 'Terima kasih, konfirmasi Anda sudah kami terima.'
      form.elements.msg.value = ''
      showStamp(true)
      loadLog()
    } catch {
      status.className = 'status error'
      status.textContent = 'Gagal mengirim, coba lagi.'
    } finally {
      send.disabled = false
    }
  })
}

/* ---------- music ---------- */
let player
const music = $('music')
if (wedding.music) {
  player = new Audio(asset(wedding.music))
  player.loop = true
  player.preload = 'none'
  player.volume = 0.6
  const sync = () => {
    music.setAttribute('aria-pressed', String(!player.paused))
    music.setAttribute('aria-label', player.paused ? 'Putar musik' : 'Jeda musik')
  }
  player.addEventListener('play', sync)
  player.addEventListener('pause', sync)
  music.addEventListener('click', () => (player.paused ? player.play().catch(() => {}) : player.pause()))
}

/* ---------- gate / opener ---------- */
const cover = $('sampul')
const main = $('isi')
function begin() {
  document.body.classList.remove('locked')
  document.body.classList.add('opened')
  main.inert = false
  if (player) music.hidden = false
}
function finishOpening() {
  cover.hidden = true
  $('crew').focus({ preventScroll: true })
}
const shortcut = location.hash && document.getElementById(location.hash.slice(1))
if (shortcut && shortcut !== cover) {
  // Returning guests (e.g. ?to=…#itinerary on the day) go straight to the section.
  cover.hidden = true
  begin()
  requestAnimationFrame(() => shortcut.scrollIntoView())
} else {
  main.inert = true
  scrollTo(0, 0)
  $('open-invitation').addEventListener('click', () => {
    player?.play().catch(() => {}) // the tap is the user gesture that unlocks audio
    begin()
    if (reducedMotion) return finishOpening()
    cover.classList.add('opening')
    const skip = $('skip-opener')
    skip.hidden = false
    let done = false
    const end = () => { if (!done) { done = true; finishOpening() } }
    skip.addEventListener('click', end, { once: true })
    cover.addEventListener('animationend', (event) => { if (event.target === cover) end() })
    setTimeout(end, 2000) // safety net if animationend never fires
  }, { once: true })
}
