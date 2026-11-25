import { access, cp, readFile, rm, writeFile } from 'node:fs/promises'

const [event = 'ayu-raka'] = process.argv.slice(2)
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(event)) throw new Error('Use a lowercase event slug.')

const output = new URL('./dist/', import.meta.url)
const from = (path) => new URL(path, import.meta.url)
const to = (path) => new URL(path, output)
const exists = (url) => access(url).then(() => true, () => false)
const site = './templates/boarding-pass/'
const eventPath = './events/' + event + '/'

await rm(output, { recursive: true, force: true })
for (const file of ['style.css', 'invitation.js']) {
  await cp(from(site + file), to('templates/boarding-pass/' + file))
}
await cp(from(site + 'assets/'), to('templates/boarding-pass/assets/'), { recursive: true })
await cp(from(eventPath + 'wedding.js'), to('wedding.js'))
await cp(from(eventPath + 'assets/'), to('assets/'), { recursive: true })

/* Share preview. WhatsApp's crawler does not run JavaScript, so title, description and
   og:* are written into the HTML here. og:image must be an absolute URL. */
const { default: wedding } = await import(from(eventPath + 'wedding.js').href)
const ownOg = await exists(from(eventPath + 'og.jpg'))
await cp(ownOg ? from(eventPath + 'og.jpg') : from(site + 'assets/og-background.jpg'), to('og.jpg'))
const attr = (value) => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const first = [...wedding.events].sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))[0]
const title = wedding.names + ' | Undangan Pernikahan'
const description = [wedding.date, first?.venue].filter(Boolean).join(' · ') + '. Kami mengundang Anda untuk hadir dan memberikan doa restu.'
const base = /^https:\/\/[^\s"<>]+$/.test(wedding.siteUrl || '') ? wedding.siteUrl.replace(/\/?$/, '/') : ''
const meta = [
  `<title>${attr(title)}</title>`,
  `<meta property="og:type" content="website">`,
  `<meta property="og:title" content="${attr(title)}">`,
  `<meta property="og:description" content="${attr(description)}">`,
  base && `<meta property="og:url" content="${attr(base)}">`,
  `<meta property="og:image" content="${attr(base + 'og.jpg')}">`,
  `<meta property="og:image:width" content="1200">`,
  `<meta property="og:image:height" content="630">`,
  `<meta name="twitter:card" content="summary_large_image">`,
].filter(Boolean).join('\n  ')
let html = await readFile(from(site + 'index.html'), 'utf8')
const swap = (find, replacement) => {
  if (!html.includes(find)) throw new Error('index.html changed: ' + find)
  html = html.replace(find, replacement)
}
swap('<title>Undangan Pernikahan</title>', meta)
swap('<meta name="description" content="Undangan pernikahan.">', `<meta name="description" content="${attr(description)}">`)
await writeFile(to('index.html'), html)

if (!base) console.warn('Peringatan: siteUrl kosong di ' + eventPath + 'wedding.js — preview WhatsApp tidak akan menampilkan gambar.')
if (!ownOg) console.warn('Peringatan: ' + eventPath + 'og.jpg tidak ada — memakai latar tanpa nama pasangan.')
