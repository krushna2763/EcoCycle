import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE_URL = 'http://localhost:5173'
const SHOTS_DIR = resolve(__dirname, '../screenshots')

const VIEWPORTS = [
  { width: 1024, height: 768 },
  { width: 1152, height: 864 },
  { width: 1280, height: 720 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1536, height: 864 },
  { width: 1920, height: 1080 },
]

const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  headless: true,
  args: ['--no-sandbox', '--disable-gpu'],
})

try {
  mkdirSync(SHOTS_DIR, { recursive: true })
  for (const vp of VIEWPORTS) {
    const page = await browser.newPage()
    await page.setViewport({ width: vp.width, height: vp.height })
    const errors = []
    page.on('pageerror', (err) => errors.push(err.message))
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 40000 })

    const data = await page.evaluate(() => {
      const doc = document.documentElement
      const vh = window.innerHeight
      const vw = window.innerWidth
      const sec = (sel) => {
        const el = document.querySelector(sel)
        if (!el) return null
        const r = el.getBoundingClientRect()
        return { top: Math.round(r.top + window.scrollY), bottom: Math.round(r.bottom + window.scrollY), h: Math.round(r.height) }
      }
      // find sections by heading/button/paragraph text
      const find = (text) => {
        const el = [...document.querySelectorAll('h1,h2,h3,button,p')].find((h) => h.textContent.trim().includes(text))
        return el ? el.closest('section') : null
      }
      const hero = find('Turn Your Waste')
      const heroContainer = hero?.querySelector('.mx-auto')
      const cats = find('Plastic')
      const how = find('How EcoCycle Works')
      const seller = find('Are You a Seller?')
      const stats = find('Join thousands')
      const bodyScrollable = doc.scrollHeight > vh
      return {
        vw, vh,
        scrollWidth: doc.scrollWidth,
        clientWidth: doc.clientWidth,
        horizontalOverflow: doc.scrollWidth > doc.clientWidth,
        scrollHeight: doc.scrollHeight,
        bodyScrollable,
        heroBottom: hero ? hero.getBoundingClientRect().bottom : null,
        heroFillsViewport: hero ? hero.getBoundingClientRect().height >= vh * 0.85 : false,
        sections: {
          hero: hero ? { h: Math.round(hero.getBoundingClientRect().height), bottom: Math.round(hero.getBoundingClientRect().bottom), contentW: heroContainer ? Math.round(heroContainer.getBoundingClientRect().width) : null } : null,
          categories: cats ? { top: Math.round(cats.getBoundingClientRect().top + window.scrollY) } : null,
          howItWorks: how ? { top: Math.round(how.getBoundingClientRect().top + window.scrollY) } : null,
          sellerCards: seller ? { top: Math.round(seller.getBoundingClientRect().top + window.scrollY) } : null,
          stats: stats ? { top: Math.round(stats.getBoundingClientRect().top + window.scrollY) } : null,
        },
      }
    })

    console.log(
      `${vp.width}x${vp.height} | overflow: ${data.horizontalOverflow} | scrollH: ${data.scrollHeight} | ` +
      `heroH: ${data.sections.hero?.h} (${Math.round((data.sections.hero?.h ?? 0) / vp.height * 100)}% of vh) contentW: ${data.sections.hero?.contentW} | ` +
      `cats@${data.sections.categories?.top} how@${data.sections.howItWorks?.top} seller@${data.sections.sellerCards?.top} stats@${data.sections.stats?.top}`,
    )
    if (errors.length) console.log('  PAGE ERRORS:', errors)

    if (vp.width === 1366 || vp.width === 1536 || vp.width === 1024) {
      await page.screenshot({ path: resolve(SHOTS_DIR, `home-${vp.width}x${vp.height}.png`), fullPage: true })
    }
    await page.close()
  }  } finally {
  await browser.close()
}
