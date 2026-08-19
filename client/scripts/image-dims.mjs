import puppeteer from 'puppeteer-core'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE_URL = 'http://localhost:5173'
const PAGES = ['/', '/about', '/how-it-works']

const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  headless: true,
  args: ['--no-sandbox', '--disable-gpu'],
})

try {
  for (const path of PAGES) {
    const page = await browser.newPage()
    await page.setViewport({ width: 1440, height: 900 })
    await page.goto(BASE_URL + path, { waitUntil: 'networkidle0', timeout: 40000 })
    const imgs = await page.$$eval('img', (els) =>
      els.map((img) => {
        const r = img.getBoundingClientRect()
        return {
          src: img.getAttribute('src').split('/').pop(),
          natural: `${img.naturalWidth}x${img.naturalHeight}`,
          rendered: `${Math.round(r.width)}x${Math.round(r.height)}`,
          cropped: img.naturalWidth > 0 && (Math.abs(r.width / r.height - img.naturalWidth / img.naturalHeight) > 0.05),
        }
      }),
    )
    console.log(path, JSON.stringify(imgs, null, 1))
    await page.close()
  }
} finally {
  await browser.close()
}
