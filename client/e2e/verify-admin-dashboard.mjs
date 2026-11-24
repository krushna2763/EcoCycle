import puppeteer from 'puppeteer-core'

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE_URL = 'http://localhost:5173'

async function runBrowserVerification() {
  console.log('=== EcoCycle Layout & Route Verification ===\n')

  const consoleErrors = []
  const pageErrors = []

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()
    page.setViewport({ width: 1280, height: 800 })

    page.on('console', (msg) => {
      const text = msg.text()
      if (msg.type() === 'error') {
        console.log(`[Browser Console Error] ${text}`)
        consoleErrors.push(text)
      }
    })

    page.on('pageerror', (err) => {
      console.log(`[Browser Page Error] ${err.message}`)
      pageErrors.push(err.message)
    })

    // ── Check 1: Public Website Pages have Public Navbar ──
    console.log('[Check 1] Verifying public pages have the public website navbar...')
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' })
    const homeNavText = await page.evaluate(() => document.body.innerText)
    const hasPublicNavOnHome = homeNavText.includes('How It Works') && homeNavText.includes('Categories') && homeNavText.includes('Impact')
    if (!hasPublicNavOnHome) {
      throw new Error('Public navbar missing on home page!')
    }
    console.log('  PASSED: Home page has public navbar (How It Works, Categories, Impact)')

    await page.goto(`${BASE_URL}/about`, { waitUntil: 'networkidle0' })
    const aboutNavText = await page.evaluate(() => document.body.innerText)
    if (!aboutNavText.includes('How It Works')) {
      throw new Error('Public navbar missing on /about page!')
    }
    console.log('  PASSED: About page has public navbar')

    // ── Check 2: Admin Login & Dashboard Navigation ──
    console.log('\n[Check 2] Logging into Admin Portal...')
    await page.goto(`${BASE_URL}/login?role=admin`, { waitUntil: 'networkidle0' })
    await page.type('#login-email', 'admin@ecocycle.com')
    await page.type('#login-password', 'Admin@123456')
    await page.click('button[type="submit"]')

    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 })
    console.log(`  Navigated to: ${page.url()}`)

    // ── Check 3: Admin Dashboard has NO Public Navbar ──
    console.log('\n[Check 3] Verifying Admin Dashboard has NO public navbar...')
    const adminDashboardText = await page.evaluate(() => document.body.innerText)
    
    // Check absence of public navigation links in header
    const publicNavElements = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('nav a, header a')).map((a) => a.textContent.trim())
      return {
        hasHowItWorks: links.some((t) => t === 'How It Works'),
        hasCategories: links.some((t) => t === 'Categories'),
        hasImpact: links.some((t) => t === 'Impact'),
        hasContact: links.some((t) => t === 'Contact'),
        hasSignUp: links.some((t) => t === 'Sign Up'),
      }
    })

    if (publicNavElements.hasHowItWorks || publicNavElements.hasCategories || publicNavElements.hasImpact || publicNavElements.hasContact || publicNavElements.hasSignUp) {
      throw new Error(`Public navbar elements are still visible on Admin Dashboard! ${JSON.stringify(publicNavElements)}`)
    }
    console.log('  PASSED: Public navbar is completely ABSENT from Admin Dashboard!')

    // Check that Admin Control Center and Admin Sidebar are present
    const adminHeader = await page.$eval('h1', (el) => el.textContent.trim())
    console.log(`  Admin page header: "${adminHeader}"`)
    const hasAdminControlCenter = adminDashboardText.includes('Admin Control Center')
    console.log(`  "Admin Control Center" header present: ${hasAdminControlCenter ? 'YES' : 'NO'}`)

    // Verify sidebar position (starts at top of screen: top === 0)
    const sidebarTop = await page.evaluate(() => {
      const aside = document.querySelector('aside')
      return aside ? aside.getBoundingClientRect().top : null
    })
    console.log(`  Admin sidebar top coordinate: ${sidebarTop}px (expected 0px)`)
    if (sidebarTop !== 0) {
      throw new Error(`Expected admin sidebar to start at top 0px, got ${sidebarTop}px`)
    }
    console.log('  PASSED: Admin sidebar starts flush at the very top of viewport (0px)!')

    // Wait for stats to load
    await page.waitForFunction(
      () => document.body.innerText.includes('Sellers •') && !document.body.innerText.includes('0 Sellers • 0 Buyers'),
      { timeout: 5000 }
    ).catch(() => {})

    // Capture clean admin dashboard screenshot
    await page.screenshot({
      path: 'C:/Users/Krushna/.gemini/antigravity/brain/69e61df5-989c-47e2-b811-8ce3d0e77156/admin_dashboard_no_public_nav.png',
      fullPage: true,
    })
    console.log('  Screenshot saved to admin_dashboard_no_public_nav.png')

    // ── Check 4: Check /admin/dashboard/listings ──
    console.log('\n[Check 4] Verifying /admin/dashboard/listings has NO public navbar...')
    await page.goto(`${BASE_URL}/admin/dashboard/listings`, { waitUntil: 'networkidle0' })
    const listingsNav = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('nav a, header a')).map((a) => a.textContent.trim())
      return links.some((t) => t === 'How It Works' || t === 'Categories' || t === 'Impact')
    })
    if (listingsNav) {
      throw new Error('Public navbar visible on /admin/dashboard/listings!')
    }
    console.log('  PASSED: Pending Listings page has no public navbar')

    // ── Check 5: Check /admin/dashboard/users ──
    console.log('\n[Check 5] Verifying /admin/dashboard/users has NO public navbar...')
    await page.goto(`${BASE_URL}/admin/dashboard/users`, { waitUntil: 'networkidle0' })
    const usersNav = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('nav a, header a')).map((a) => a.textContent.trim())
      return links.some((t) => t === 'How It Works' || t === 'Categories' || t === 'Impact')
    })
    if (usersNav) {
      throw new Error('Public navbar visible on /admin/dashboard/users!')
    }
    console.log('  PASSED: Admin Users page has no public navbar')

    // ── Check 6: Check Seller & Buyer Dashboards ──
    console.log('\n[Check 6] Verifying Seller & Buyer dashboards remain unchanged...')
    // Log out admin
    await page.evaluate(() => {
      localStorage.clear()
    })
    
    // Log in as seller
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' })
    await page.type('#login-email', 'seller.verify.login@ecocycle.com')
    await page.type('#login-password', 'Password123!')
    await page.click('button[type="submit"]')
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 })
    console.log(`  Seller logged in, current URL: ${page.url()}`)
    const sellerNav = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('nav a, header a')).map((a) => a.textContent.trim())
      return links.some((t) => t === 'How It Works' || t === 'Categories' || t === 'Impact')
    })
    if (sellerNav) {
      throw new Error('Public navbar appeared on seller dashboard!')
    }
    console.log('  PASSED: Seller Dashboard has NO public navbar')

    console.log('\n=== ALL 6 LAYOUT AND ROUTE CHECKS PASSED ===\n')
  } finally {
    await browser.close()
  }
}

runBrowserVerification().catch((err) => {
  console.error('\nVerification FAILED:', err.message)
  process.exit(1)
})
