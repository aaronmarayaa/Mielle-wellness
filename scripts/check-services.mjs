import { mockContact } from './mock-contact.mjs'
import { chromium, expect } from '@playwright/test'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'

await mkdir('test-results', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ reducedMotion: 'reduce' })
await mockContact(page)
const errors = [], evidence = []
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
const titles = ['Relaxation Massage', 'Deep Tissue Therapeutic Massage', 'Cupping Therapy', 'Hot Stone Massage Therapy', 'Youth Massage (16 years old under)', 'Pre-Natal Massage (15weeks above)', 'Thai Massage Therapy (on Bed)', 'Lymphatic Drainage Massage']
const destinations = [
  'https://miellewellness.noterro.com/book-online/service/313471/Relaxation-Massage',
  'https://miellewellness.noterro.com/book-online/service/313490/Deep-Therapeutic-Massage',
  'https://miellewellness.noterro.com/book-online/service/313529/Cupping-Therapy',
  'https://miellewellness.noterro.com/book-online/service/313570/Hot-Stone-Massage',
  'https://miellewellness.noterro.com/book-online/service/313531/Youth-Massage-(3-12years-old)',
  'https://miellewellness.noterro.com/book-online/service/313681/Pre-Natal-Massage-(15weeks-above)',
  'https://miellewellness.noterro.com/book-online/service/313532/Thai-Massage-on-Bed',
  'https://miellewellness.noterro.com/',
]
await page.addInitScript(() => {
  window.bookingDestinations = []
  document.addEventListener('click', event => {
    const link = event.target.closest('a.treatment-booking')
    if (link) { event.preventDefault(); window.bookingDestinations.push(link.href) }
  }, true)
})
const visit = async (path = '/services') => page.goto(`http://localhost:5173${path}`, { waitUntil: 'networkidle' })

try {
  for (const width of [320, 375, 600, 768, 960, 1024, 1440, 1900]) {
    await page.setViewportSize({ width, height: 1000 })
    await visit()
    await page.evaluate(async () => {
      [...document.images].forEach(image => { image.loading = 'eager' })
      await Promise.all([...document.images].map(image => image.decode()))
      await document.fonts.ready
    })
    await expect(page).toHaveTitle('Services | Mielle Wellness')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Book One of OurSignature Treatments')
    assert.deepEqual(await page.locator('.treatment-card h2').allTextContents(), titles)
    await expect(page.locator('.desktop-nav a[aria-current="page"]')).toHaveAttribute('href', '/services')
    await expect(page.locator('.site-header')).toHaveClass(/is-solid/)
    await expect(page.locator('#contact')).toHaveCSS('background-color', 'rgb(0, 0, 0)')
    await expect(page.locator('footer')).toHaveCSS('background-color', 'rgb(0, 0, 0)')
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    const rects = await page.locator('.treatment-card').evaluateAll(elements => elements.map(el => el.getBoundingClientRect().toJSON()))
    const columns = width >= 960 ? 3 : width >= 620 ? 2 : 1
    assert.ok(Math.abs(rects[0].top - rects[columns - 1].top) < 2)
    assert.ok(rects[columns].top > rects[0].bottom)
    assert.ok(Math.abs(rects[6].left - rects[0].left) < 2)
    const heading = await page.locator('h1').boundingBox()
    assert.ok(heading.y > (await page.locator('header').boundingBox()).height)
    if ([375, 1900].includes(width)) await page.screenshot({ path: `test-results/services-${width}.png`, fullPage: true, animations: 'disabled', timeout: 60000 })
    evidence.push(`${width}px: eight treatment photos load; ${columns}-column gallery, exact treatment labels, header clearance, dark contact/footer and no overflow`)
  }

  for (const [index, title] of titles.entries()) {
    const card = page.locator('.treatment-booking').nth(index)
    await expect(card).toHaveAttribute('href', destinations[index])
    await expect(card).toHaveAttribute('aria-label', `Book ${title}`)
    await card.focus()
    await page.keyboard.press('Enter')
    assert.equal(await page.evaluate(() => window.bookingDestinations.at(-1)), destinations[index])
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(card).toBeFocused()
  }
  const book = page.getByRole('button', { name: 'BOOK NOW', exact: true })
  await book.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog').getByRole('heading')).toHaveText('Book an appointment')
  await page.keyboard.press('Escape')
  await expect(book).toBeFocused()
  await page.locator('.desktop-nav').getByRole('link', { name: 'CONTACT', exact: true }).click()
  await page.getByRole('button', { name: 'SEND', exact: true }).click()
  assert.equal(await page.locator('#first-name').evaluate(el => el.validity.valueMissing), true)
  await page.locator('#first-name').fill('Test')
  await page.locator('#contact-email').fill('visitor@example.com')
  await page.locator('#message').fill('Services enquiry')
  await page.getByRole('button', { name: 'SEND', exact: true }).click()
  await expect(page.locator('.contact-form .form-feedback')).toContainText('Your message has been submitted.')
  await expect(page.locator('.site-footer form')).toHaveCount(0)
  evidence.push('All eight treatment links activate the exact requested Noterro URLs by keyboard; outgoing navigation is intercepted. General Book Now retains booking/Escape/focus; contact validation/direct FormSubmit submission works; footer subscription form is removed')

  for (const [path, prices] of [['/in-clinic', [70, 70, 80, 135, 70, 90, 90, 80]], ['/mobile-service', [100, 100, 110, 165, 100, 120, 120, 110]]]) {
    for (const width of [375, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 })
      await visit(path)
      assert.deepEqual(await page.locator('.treatment-booking').evaluateAll(links => links.map(link => link.href)), destinations)
      assert.deepEqual(await page.locator('.treatment-price').allTextContents(), prices.map(price => `Starting at $${price}`))
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      for (const [index, card] of (await page.locator('.treatment-booking').all()).entries()) {
        await card.focus()
        await page.keyboard.press('Enter')
        assert.equal(await page.evaluate(() => window.bookingDestinations.at(-1)), destinations[index])
      }
      evidence.push(`${path} at ${width}px: all eight exact booking destinations activate by keyboard; starting prices and overflow checks pass`)
    }
  }
  await page.setViewportSize({ width: 1900, height: 1000 })

  await visit('/services/')
  await page.reload()
  await expect(page).toHaveTitle('Services | Mielle Wellness')
  for (const path of ['/', '/about']) {
    await visit(path)
    await page.locator('.desktop-nav').getByRole('link', { name: 'SERVICES', exact: true }).click()
    await page.waitForURL('**/services')
    await page.goBack()
    assert.equal(new URL(page.url()).pathname, path)
    await page.goForward()
    await expect(page).toHaveTitle('Services | Mielle Wellness')
  }
  await page.locator('.desktop-nav').getByRole('link', { name: 'DIRECT BILLING', exact: true }).click()
  await page.waitForURL('**/direct-billing')
  await page.locator('.footer-navigation').getByRole('link', { name: 'Services', exact: true }).click()
  await page.waitForURL('**/services')
  await page.setViewportSize({ width: 375, height: 812 })
  await visit('/')
  await page.getByRole('button', { name: 'Menu', exact: true }).click()
  await page.locator('.mobile-nav').getByRole('link', { name: 'SERVICES', exact: true }).click()
  await page.waitForURL('**/services')
  await expect(page.locator('.mobile-nav')).toHaveCount(0)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.locator('.treatment-booking').last().click()
  assert.equal(await page.evaluate(() => window.bookingDestinations.at(-1)), destinations.at(-1))
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.locator('.skip-link').focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#main')).toBeFocused()
  evidence.push('Direct route, trailing slash, reload, desktop/mobile/footer Services links, history, cross-page Direct Billing, normal/reduced motion and skip link pass')
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('http://localhost:5173/services', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('.services-page-intro h1')).toHaveCSS('animation-name', 'services-enter')
  await expect(page.locator('.services-page-intro h1')).toHaveCSS('animation-duration', '0.52s')
  await page.evaluate(async () => { await Promise.all(document.getAnimations().map(animation => animation.finished)) })
  const first = page.locator('.treatment-booking').first()
  const image = first.locator('img')
  const frame = first.locator('.treatment-image')
  const originalSize = await frame.evaluate(el => ({ width: el.offsetWidth, height: el.offsetHeight }))
  await first.hover()
  await expect.poll(() => image.evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).a)).toBeGreaterThan(1.04)
  await expect(first.locator('h2')).toHaveCSS('text-decoration-line', 'none')
  await expect(frame).toHaveCSS('overflow', 'hidden')
  assert.deepEqual(await frame.evaluate(el => ({ width: el.offsetWidth, height: el.offsetHeight })), originalSize)
  await page.screenshot({ path: 'test-results/services-hover.png' })
  await page.mouse.move(0, 0)
  await expect.poll(() => image.evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).a)).toBeLessThan(1.001)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await first.hover()
  await expect(image).toHaveCSS('transform', 'none')
  await expect(page.locator('.services-page-intro h1')).toHaveCSS('animation-name', 'none')
  evidence.push('Entrance lasts 520ms; hover slowly zooms photos within fixed rounded frames, labels stay plain, mouse-out restores scale, and reduced motion disables both effects')
  assert.deepEqual(errors, [])
  await writeFile('test-results/services-check.json', JSON.stringify({ evidence, errors }, null, 2))
  console.log(evidence.join('\n'))
} finally {
  await browser.close()
}
