import puppeteer from 'puppeteer-core'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE_URL = 'http://localhost:5173'
const IMAGES = [
  'ecocycleprocess1.png',
  'ecocycleprocess2.png',
  'ecocycleprocess3.png',
  'ecocycleprocess4.png',
  'ecocycleprocess5.png',
]

const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  headless: true,
  args: ['--no-sandbox', '--disable-gpu'],
})

try {
  const page = await browser.newPage()
  await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 40000 })

  for (const name of IMAGES) {
    const result = await page.evaluate(async (url) => {
      const img = new Image()
      await new Promise((res, rej) => {
        img.onload = res
        img.onerror = () => rej(new Error('load failed'))
        img.src = url
      })
      const c = document.createElement('canvas')
      c.width = img.naturalWidth
      c.height = img.naturalHeight
      const ctx = c.getContext('2d')
      ctx.drawImage(img, 0, 0)
      const { width: w, height: h } = c
      const data = ctx.getImageData(0, 0, w, h).data

      // isDarkGreen: any saturated green (badge color family, light or dark)
      const isDarkGreen = (i) => {
        const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3]
        return a > 200 && g > r + 25 && g > b + 25
      }

      // flood fill to find connected blobs of dark green
      const visited = new Uint8Array(w * h)
      const blobs = []
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4
          if (!isDarkGreen(idx) || visited[y * w + x]) continue
          // BFS
          const stack = [[x, y]]
          visited[y * w + x] = 1
          let minX = x, maxX = x, minY = y, maxY = y, count = 0
          while (stack.length) {
            const [cx, cy] = stack.pop()
            count++
            minX = Math.min(minX, cx); maxX = Math.max(maxX, cx)
            minY = Math.min(minY, cy); maxY = Math.max(maxY, cy)
            for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
              if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
              if (visited[ny * w + nx]) continue
              const ni = (ny * w + nx) * 4
              if (isDarkGreen(ni)) { visited[ny * w + nx] = 1; stack.push([nx, ny]) }
            }
          }
          // round-ish blobs (badge circles) anywhere in the image
          if (count > 2500 && Math.abs(maxX - minX - (maxY - minY)) < 60) blobs.push({ x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1, count })
        }
      }
      // sample a background color ring around each blob
      const sample = (x, y) => {
        const i = (Math.max(0, Math.min(w - 1, x)) + Math.max(0, Math.min(h - 1, y)) * w) * 4
        return [data[i], data[i + 1], data[i + 2]]
      }
      const withBg = blobs.map((b) => {
        const ring = [
          sample(b.x - 8, b.y + b.h / 2), sample(b.x + b.w + 8, b.y + b.h / 2),
          sample(b.x + b.w / 2, b.y - 8), sample(b.x + b.w / 2, b.y + b.h + 8),
          sample(b.x + b.w + 12, b.y + b.h + 12),
        ]
        const avg = ring.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]], [0, 0, 0]).map((v) => Math.round(v / ring.length))
        return { ...b, bg: avg }
      })
      return { name: url.split('/').pop(), w, h, blobs: withBg }
    }, BASE_URL + '/src/assets/' + name)
    console.log(JSON.stringify(result))
  }
} finally {
  await browser.close()
}
