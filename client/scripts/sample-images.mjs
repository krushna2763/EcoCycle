import { createServer } from 'vite'
import puppeteer from 'puppeteer-core'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE_URL = 'http://localhost:5173'
const IMAGES = [
  '/src/assets/hero-recycling.jpg',
  '/src/assets/seller.jpg',
  '/src/assets/buyer.jpg',
]

const server = await createServer({
  root: resolve(__dirname, '..'),
  logLevel: 'silent',
  server: { port: 5173, strictPort: true },
})
await server.listen()

const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  headless: true,
  args: ['--no-sandbox', '--disable-gpu'],
})

try {
  const page = await browser.newPage()
  await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 40000 })
  for (const src of IMAGES) {
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
      const px = (x, y) => {
        const i = (y * w + x) * 4
        return [data[i], data[i + 1], data[i + 2], data[i + 3]]
      }
      return {
        w,
        h,
        corners: {
          topLeft: px(0, 0),
          topRight: px(w - 1, 0),
          bottomLeft: px(0, h - 1),
          bottomRight: px(w - 1, h - 1),
        },
        edges: {
          topMid: px(Math.floor(w / 2), 0),
          bottomMid: px(Math.floor(w / 2), h - 1),
          leftMid: px(0, Math.floor(h / 2)),
          rightMid: px(w - 1, Math.floor(h / 2)),
        },
        center: px(Math.floor(w / 2), Math.floor(h / 2)),
      }
    }, BASE_URL + src)
    console.log(src, JSON.stringify(result))
  }
} finally {
  await browser.close()
  await server.close()
}
