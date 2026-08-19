import puppeteer from 'puppeteer-core'
import { mkdirSync, copyFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE_URL = 'http://localhost:5173'
const ASSETS = resolve(__dirname, '../src/assets')
const BACKUP = resolve(ASSETS, 'backup')
const IMAGES = ['ecocycleprocess4.png']

mkdirSync(BACKUP, { recursive: true })

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
      const w = c.width
      const h = c.height
      const data = ctx.getImageData(0, 0, w, h)
      const d = data.data

      const px = (x, y) => {
        const i = (Math.max(0, Math.min(w - 1, x)) + Math.max(0, Math.min(h - 1, y)) * w) * 4
        return [d[i], d[i + 1], d[i + 2]]
      }
      const setPx = (x, y, r, g, b) => {
        const i = (y * w + x) * 4
        d[i] = r
        d[i + 1] = g
        d[i + 2] = b
        d[i + 3] = 255
      }

      // 1. find the badge blob: mid/dark green blob in the top-left corner
      const isGreen = (i) =>
        d[i + 3] > 200 && d[i + 1] > d[i] + 25 && d[i + 1] > d[i + 2] + 25 && d[i + 1] < 160
      const visited = new Uint8Array(w * h)
      let badge = null
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (x > w * 0.35 || y > h * 0.35) continue
          const idx = (y * w + x) * 4
          if (!isGreen(idx) || visited[y * w + x]) continue
          const stack = [[x, y]]
          visited[y * w + x] = 1
          let minX = x, maxX = x, minY = y, maxY = y, count = 0, sumR = 0, sumG = 0, sumB = 0
          while (stack.length) {
            const [cx, cy] = stack.pop()
            count++
            minX = Math.min(minX, cx); maxX = Math.max(maxX, cx)
            minY = Math.min(minY, cy); maxY = Math.max(maxY, cy)
            const ci = (cy * w + cx) * 4
            sumR += d[ci]; sumG += d[ci + 1]; sumB += d[ci + 2]
            for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
              if (nx < 0 || ny < 0 || nx >= w || ny >= h || visited[ny * w + nx]) continue
              const ni = (ny * w + nx) * 4
              if (isGreen(ni)) { visited[ny * w + nx] = 1; stack.push([nx, ny]) }
            }
          }
          if (count > 5000 && Math.abs(maxX - minX - (maxY - minY)) < 80) {
            badge = {
              x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1, count,
              color: [Math.round(sumR / count), Math.round(sumG / count), Math.round(sumB / count)],
            }
            break
          }
        }
        if (badge) break
      }
      if (!badge) return { name: url.split('/').pop(), patched: false }

      // 2. fill rect = badge bbox expanded by 14px, clamped
      const pad = 14
      const x0 = Math.max(0, badge.x - pad), y0 = Math.max(0, badge.y - pad)
      const x1 = Math.min(w - 1, badge.x + badge.w + pad), y1 = Math.min(h - 1, badge.y + badge.h + pad)

      // 3. bilinear background from the 4 rect corners
      const c00 = px(x0, y0), c10 = px(x1, y0), c01 = px(x0, y1), c11 = px(x1, y1)
      const lerp = (a, b, t) => a + (b - a) * t
      const bilinear = (x, y) => {
        const tx = (x - x0) / (x1 - x0), ty = (y - y0) / (y1 - y0)
        const top = [0, 1, 2].map((k) => lerp(c00[k], c10[k], tx))
        const bot = [0, 1, 2].map((k) => lerp(c01[k], c11[k], tx))
        return [0, 1, 2].map((k) => Math.round(lerp(top[k], bot[k], ty)))
      }

      // 4. ellipse for digit (white hole) detection
      const cx = badge.x + badge.w / 2, cy = badge.y + badge.h / 2
      const rx = badge.w / 2, ry = badge.h / 2
      const [br, bg, bb] = badge.color

      // 5. paint badge-colored pixels + white digit pixels inside the ellipse
      let painted = 0
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const i = (y * w + x) * 4
          const r = d[i], g = d[i + 1], b = d[i + 2]
          const inEllipse = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1.2
          const closeBadge = inEllipse && Math.abs(r - br) < 45 && Math.abs(g - bg) < 45 && Math.abs(b - bb) < 45
          const isDigit = inEllipse && r > 245 && g > 245 && b > 245
          if (closeBadge || isDigit) {
            const col = bilinear(x, y)
            setPx(x, y, col[0], col[1], col[2])
            painted++
          }
        }
      }

      ctx.putImageData(data, 0, 0)
      return {
        name: url.split('/').pop(),
        patched: true,
        badge: { x: badge.x, y: badge.y, w: badge.w, h: badge.h, color: badge.color },
        painted,
        dataUrl: c.toDataURL('image/png'),
      }
    }, BASE_URL + '/src/assets/' + name)

    console.log(
      result.name,
      '| patched:', result.patched,
      '| badge:', result.badge ? `${result.badge.x},${result.badge.y} ${result.badge.w}x${result.badge.h} rgb(${result.badge.color})` : 'none',
      '| painted px:', result.painted,
    )
    if (result.patched) {
      copyFileSync(resolve(ASSETS, result.name), resolve(BACKUP, result.name))
      const buf = Buffer.from(result.dataUrl.split(',')[1], 'base64')
      writeFileSync(resolve(ASSETS, result.name), buf)
      console.log('  -> backed up original + wrote patched image')
    }
  }
} finally {
  await browser.close()
}
