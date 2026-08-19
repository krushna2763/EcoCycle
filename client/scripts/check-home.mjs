import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE_URL = 'http://localhost:5173'
const SHOTS_DIR = resolve(__dirname, '../screenshots')

const report = { errors: [], warnings: [], failedRequests: [], images: [], overflow: null, checks: {} }

const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  headless: true,
  args: ['--no-sandbox', '--disable-gpu'],
})

try {
  // ---------- DESKTOP ----------
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })

  page.on('console', (msg) => {
    if (msg.type() === 'error') report.errors.push(msg.text())
    if (msg.type() === 'warning') report.warnings.push(msg.text())
  })
  page.on('pageerror', (err) => report.errors.push('PAGEERROR: ' + err.message))
  page.on('requestfailed', (req) =>
    report.failedRequests.push(`${req.url()} -> ${req.failure()?.errorText ?? 'unknown'}`),
  )

  await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 40000 })

  report.images = await page.$$eval('img', (imgs) =>
    imgs.map((img) => ({
      src: img.getAttribute('src'),
      loaded: img.complete && img.naturalWidth > 0,
      naturalW: img.naturalWidth,
      naturalH: img.naturalHeight,
      renderedW: Math.round(img.getBoundingClientRect().width),
      renderedH: Math.round(img.getBoundingClientRect().height),
    })),
  )

  report.overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    scrollHeight: document.documentElement.scrollHeight,
  }))

  report.checks = await page.evaluate(() => {
    const rect = (sel) => {
      const el = document.querySelector(sel)
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { y: Math.round(r.top + window.scrollY), w: Math.round(r.width), h: Math.round(r.height) }
    }
    const visible = (sel) => {
      const el = document.querySelector(sel)
      if (!el) return false
      const s = getComputedStyle(el)
      const r = el.getBoundingClientRect()
      return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0
    }
    const text = (sel) => document.querySelector(sel)?.textContent?.trim() ?? null

    const navLinks = [...document.querySelectorAll('header nav a')]
      .filter((a) => getComputedStyle(a).display !== 'none')
      .map((a) => a.textContent.trim())

    const categoryButtons = [...document.querySelectorAll('button')].filter((b) =>
      ['Plastic', 'Paper', 'Metal', 'Glass', 'E-Waste', 'Organic', 'Textile', 'View All'].includes(b.textContent.trim()),
    )

    const steps = [...document.querySelectorAll('h3')].map((h) => h.textContent.trim())

    const stats = [...document.querySelectorAll('p')]
      .map((p) => p.textContent.trim())
      .filter((t) => ['10K+', '500+', '1K+', '250+ Tons'].includes(t))

    return {
      title: document.title,
      h1: text('h1'),
      navLinks,
      categoryButtons: categoryButtons.map((b) => b.textContent.trim()),
      heroImageVisible: visible('section img[alt*="recycling"]'),
      steps,
      stats,
      sellerCardVisible: visible('h3'),
      bodyBg: getComputedStyle(document.body).backgroundColor,
      brandColor: getComputedStyle(document.querySelector('.text-brand-600') ?? document.body).color,
      footerBg: getComputedStyle(document.querySelector('footer')).backgroundColor,
    }
  })

  mkdirSync(SHOTS_DIR, { recursive: true })
  await page.screenshot({ path: resolve(SHOTS_DIR, 'home-desktop.png'), fullPage: true })

  // ---------- MOBILE ----------
  const mobile = await browser.newPage()
  await mobile.setViewport({ width: 390, height: 844 })
  mobile.on('pageerror', (err) => report.errors.push('MOBILE PAGEERROR: ' + err.message))
  mobile.on('console', (msg) => {
    if (msg.type() === 'error') report.errors.push('MOBILE: ' + msg.text())
  })
  await mobile.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 40000 })

  report.mobileOverflow = await mobile.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  await mobile.screenshot({ path: resolve(SHOTS_DIR, 'home-mobile.png'), fullPage: true })

  // ---------- ABOUT PAGE ----------
  const about = await browser.newPage()
  await about.setViewport({ width: 1440, height: 900 })
  const aboutErrors = []
  const aboutFailed = []
  about.on('pageerror', (err) => aboutErrors.push(err.message))
  about.on('console', (msg) => {
    if (msg.type() === 'error') aboutErrors.push(msg.text())
  })
  about.on('requestfailed', (req) =>
    aboutFailed.push(`${req.url()} -> ${req.failure()?.errorText ?? 'unknown'}`),
  )
  await about.goto(BASE_URL + '/about', { waitUntil: 'networkidle0', timeout: 40000 })

  report.about = {
    errors: aboutErrors,
    failedRequests: aboutFailed,
    images: await about.$$eval('img', (imgs) =>
      imgs.map((img) => ({
        src: img.getAttribute('src'),
        loaded: img.complete && img.naturalWidth > 0,
        naturalW: img.naturalWidth,
        naturalH: img.naturalHeight,
      })),
    ),
    overflow: await about.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    })),
    headings: await about.evaluate(() =>
      [...document.querySelectorAll('h1,h2')].map((h) => h.textContent.trim()),
    ),
    footerBg: await about.evaluate(
      () => getComputedStyle(document.querySelector('footer')).backgroundColor,
    ),
  }
  await about.screenshot({ path: resolve(SHOTS_DIR, 'about-desktop.png'), fullPage: true })

  // ---------- HOW IT WORKS PAGE ----------
  const how = await browser.newPage()
  await how.setViewport({ width: 1440, height: 900 })
  const howErrors = []
  const howFailed = []
  how.on('pageerror', (err) => howErrors.push(err.message))
  how.on('console', (msg) => {
    if (msg.type() === 'error') howErrors.push(msg.text())
  })
  how.on('requestfailed', (req) =>
    howFailed.push(`${req.url()} -> ${req.failure()?.errorText ?? 'unknown'}`),
  )
  await how.goto(BASE_URL + '/how-it-works', { waitUntil: 'networkidle0', timeout: 40000 })

  report.howItWorks = {
    errors: howErrors,
    failedRequests: howFailed,
    images: await how.$$eval('img', (imgs) =>
      imgs.map((img) => ({
        src: img.getAttribute('src'),
        loaded: img.complete && img.naturalWidth > 0,
      })),
    ),
    overflow: await how.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    })),
    headings: await how.evaluate(() =>
      [...document.querySelectorAll('h1,h2,h3')].map((h) => h.textContent.trim()),
    ),
  }
  await how.screenshot({ path: resolve(SHOTS_DIR, 'how-it-works-desktop.png'), fullPage: true })

  // ---------- CATEGORIES PAGE ----------
  const cats = await browser.newPage()
  await cats.setViewport({ width: 1440, height: 900 })
  const catsErrors = []
  const catsFailed = []
  cats.on('pageerror', (err) => catsErrors.push(err.message))
  cats.on('console', (msg) => {
    if (msg.type() === 'error') catsErrors.push(msg.text())
  })
  cats.on('requestfailed', (req) =>
    catsFailed.push(`${req.url()} -> ${req.failure()?.errorText ?? 'unknown'}`),
  )
  await cats.goto(BASE_URL + '/categories', { waitUntil: 'networkidle0', timeout: 40000 })

  report.categories = {
    errors: catsErrors,
    failedRequests: catsFailed,
    images: await cats.$$eval('img', (imgs) =>
      imgs.map((img) => ({
        src: img.getAttribute('src'),
        loaded: img.complete && img.naturalWidth > 0,
      })),
    ),
    overflow: await cats.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    })),
    headings: await cats.evaluate(() =>
      [...document.querySelectorAll('h1,h2')].map((h) => h.textContent.trim()),
    ),
    plasticCards: await cats.evaluate(() => {
      const cards = [...document.querySelectorAll('h3')].map((h) => h.textContent.trim())
      const expected = ['PET', 'HDPE', 'PVC', 'LDPE', 'PP', 'PS', 'Other Plastics', 'Mixed Plastic']
      return { found: cards.filter((c) => expected.includes(c)), count: cards.filter((c) => expected.includes(c)).length }
    }),
    footerBg: await cats.evaluate(
      () => getComputedStyle(document.querySelector('footer')).backgroundColor,
    ),
  }
  await cats.screenshot({ path: resolve(SHOTS_DIR, 'categories-desktop.png'), fullPage: true })

  console.log(JSON.stringify(report, null, 2))
} finally {
  await browser.close()
}
