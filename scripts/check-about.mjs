import { mockContact } from './mock-contact.mjs'
import { chromium, expect } from '@playwright/test'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'

await mkdir('test-results', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ reducedMotion: 'reduce' })
await mockContact(page)
const evidence = [], errors = []
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
const names = ['Michelle Paningbatan', 'Ramin Hans', 'Tiegsti Berhe', 'Kalena Lewandowski', 'Raine Canlas']
const title = 'Professional wellness, massage and skin treatments designed to relax, restore and renew'

try {
  for (const width of [320, 375, 600, 768, 960, 1024, 1440, 1900]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('http://localhost:5173/about', { waitUntil: 'networkidle' })
    await page.evaluate(async () => {
      [...document.images].forEach(image => { image.loading = 'eager' })
      await Promise.all([...document.images].map(image => image.decode()))
      await document.fonts.ready
    })
    await expect(page).toHaveTitle('About | Mielle Wellness')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
    assert.deepEqual(await page.locator('.team-member h3').allTextContents(), names)
    assert.equal(await page.locator('.team-member p').filter({ hasText: 'Registered Massage Therapist' }).count(), 4)
    await expect(page.locator('.team-member').nth(1)).toContainText('Certified & Licensed Aesthetician')
    await expect(page.locator('.site-header')).toHaveClass(/is-solid/)
    const active = page.locator('.desktop-nav a[aria-current="page"]')
    assert.equal(await active.getAttribute('href'), '/about')
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    const bounds = await page.locator('.team-member').evaluateAll(elements => elements.map(el => el.getBoundingClientRect().toJSON()))
    if (width >= 960) {
      assert.ok(Math.abs(bounds[0].top - bounds[2].top) < 2)
      assert.ok(bounds[3].top > bounds[2].top)
      assert.ok(Math.abs(bounds[3].top - bounds[4].top) < 2)
      assert.ok(Math.abs((bounds[3].left + bounds[4].right) / 2 - width / 2) < 2)
    } else if (width >= 620) {
      assert.ok(Math.abs(bounds[0].top - bounds[1].top) < 2)
      assert.ok(bounds[2].top > bounds[1].top)
    } else assert.ok(bounds.every((rect, index) => index === 0 || rect.top > bounds[index - 1].top))
    const intro = await page.locator('.about-page-intro').boundingBox()
    assert.ok(intro.y === 0)
    const heading = await page.locator('#about-page-title').boundingBox()
    assert.ok(heading.y >= (await page.locator('.site-header').boundingBox()).height)
    assert.deepEqual(await page.locator('.about-difference h2').allTextContents(), ['1. An Exceptional Team of Experts', '2. The Latest Treatments and Technology', '3. Proven Results'])
    const contrast = await page.locator('.about-page-intro,.about-team,.about-difference,.about-contact').evaluateAll(sections => {
      const luminance = color => color.match(/\d+/g).slice(0, 3).map(Number).map(v => v / 255)
        .map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)
        .reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0)
      return sections.flatMap(section => [...section.querySelectorAll('p,h1,h2,h3,label,button')].map(text => {
        const style = getComputedStyle(text)
        let backgroundElement = text
        while (getComputedStyle(backgroundElement).backgroundColor === 'rgba(0, 0, 0, 0)' && backgroundElement.parentElement) backgroundElement = backgroundElement.parentElement
        const background = luminance(getComputedStyle(backgroundElement).backgroundColor)
        const foreground = luminance(style.color)
        return (Math.max(background, foreground) + .05) / (Math.min(background, foreground) + .05)
      }))
    })
    assert.ok(contrast.every(value => value >= 4.5), JSON.stringify({ width, contrast }))
    if ([375, 1440, 1900].includes(width)) await page.screenshot({ path: `test-results/about-${width}.png`, fullPage: true })
    evidence.push(`${width}px: direct About route, exact heading and five supplied profiles, loaded images, responsive team rows, solid header, no overflow, ${Math.min(...contrast).toFixed(2)}:1 minimum text contrast`)
  }

  await page.reload({ waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
  await page.goto('http://localhost:5173/about/', { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
  await page.locator('.desktop-nav').getByRole('link', { name: 'ABOUT', exact: true }).click()
  await page.waitForURL('**/about')
  await page.goBack({ waitUntil: 'networkidle' })
  await expect(page.locator('.hero')).toBeVisible()
  await page.goForward({ waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
  for (const [label, hash] of [['HOME', 'home'], ['SERVICES', 'services'], ['DIRECT BILLING', 'direct-billing']]) {
    await page.goto('http://localhost:5173/about', { waitUntil: 'networkidle' })
    await page.locator('.desktop-nav').getByRole('link', { name: label, exact: true }).click()
    await page.waitForURL(hash === 'services' ? '**/services' : `**/#${hash}`)
    await expect(page.locator(hash === 'services' ? '.treatment-gallery' : `#${hash}`)).toBeVisible()
  }
  await page.goto('http://localhost:5173/about', { waitUntil: 'networkidle' })
  await page.locator('.desktop-nav').getByRole('link', { name: 'CONTACT', exact: true }).click()
  await page.waitForURL('**/about#contact')
  await expect(page.getByRole('heading', { name: 'Contact Us', exact: true })).toBeVisible()
  const bookingControl = page.locator('.footer-navigation').getByRole('link', { name: 'Booking', exact: true })
  await expect(bookingControl).toHaveAttribute('href', 'https://miellewellness.noterro.com/')
  await expect(bookingControl).toHaveAttribute('target', '_blank')
  await page.locator('.desktop-nav').getByRole('button', { name: 'PROMOS', exact: true }).click()
  await expect(page.getByRole('dialog').getByRole('heading')).toContainText('10% Off Your First')
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'SEND', exact: true }).click()
  assert.equal(await page.locator('#first-name').evaluate(el => el.validity.valueMissing), true)
  await page.locator('#first-name').fill('Test')
  await page.locator('#contact-email').fill('visitor@example.com')
  await page.locator('#message').fill('About page enquiry')
  await page.getByRole('button', { name: 'SEND', exact: true }).click()
  await expect(page.locator('.contact-form .form-feedback')).toContainText('Your message has been submitted.')
  await expect(page.locator('.site-footer form')).toHaveCount(0)
  for (const [label, hash] of [['Home', 'home'], ['Services', 'services'], ['Reviews', 'reviews']]) {
    assert.equal(await page.locator('.footer-navigation').getByRole('link', { name: label, exact: true }).getAttribute('href'), hash === 'services' ? '/services' : `/#${hash}`)
  }
  evidence.push('Refresh, trailing slash, desktop About link, browser back/forward, cross-page section links, local Contact, booking/Escape/focus, Promos, contact validation/direct FormSubmit submission, and footer links pass; footer subscription form is removed')

  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Menu', exact: true }).click()
  await page.locator('.mobile-nav').getByRole('link', { name: 'ABOUT', exact: true }).click()
  await page.waitForURL('**/about')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
  const menu = page.getByRole('button', { name: 'Menu', exact: true })
  await menu.click()
  assert.equal(await page.locator('main').evaluate(el => el.inert), true)
  await page.keyboard.press('Escape')
  await expect(menu).toBeFocused()
  await menu.click()
  await page.locator('.mobile-nav').getByRole('link', { name: 'SERVICES', exact: true }).click()
  await page.waitForURL('**/services')
  await expect(page.locator('.mobile-nav')).toHaveCount(0)
  await page.goto('http://localhost:5173/about', { waitUntil: 'networkidle' })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.locator('#contact').scrollIntoViewIfNeeded()
  await expect(page.getByRole('button', { name: 'SEND', exact: true })).toBeVisible()
  await page.locator('.skip-link').focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#main')).toBeFocused()
  evidence.push('Mobile About and Services navigation, menu inert state, Escape/focus, normal/reduced motion content, and keyboard skip link pass')
  assert.deepEqual(errors, [])
  await writeFile('test-results/about-check.json', JSON.stringify({ evidence, errors }, null, 2))
  console.log(evidence.join('\n'))
} finally {
  await browser.close()
}
