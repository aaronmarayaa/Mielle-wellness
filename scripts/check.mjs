import { chromium, expect } from '@playwright/test'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'

await mkdir('test-results', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ reducedMotion: 'reduce' })
const evidence = [], errors = []
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
try {
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
  await page.evaluate(async () => {
    [...document.images].forEach(image => { image.loading = 'eager' })
    await Promise.all([...document.images].map(image => image.decode()))
    await document.fonts.ready
  })
  for (const width of [320, 375, 600, 768, 1024, 1240, 1440, 1900]) {
    await page.setViewportSize({ width, height: 1000 })
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    evidence.push(`${width}px: restored page has no horizontal overflow`)
  }
  for (const [width, height] of [[320, 568], [375, 667], [600, 700], [768, 650], [1024, 600], [1240, 580], [1366, 600], [1440, 650], [1900, 940]]) {
    await page.setViewportSize({ width, height })
    await page.evaluate(() => scrollTo(0, 0))
    const bounds = await page.evaluate(() => ({
      headerBottom: document.querySelector('.site-header').getBoundingClientRect().bottom,
      logoTop: document.querySelector('.hero-brand').getBoundingClientRect().top,
      buttons: [...document.querySelectorAll('.hero-actions button')].map(button => button.getBoundingClientRect().toJSON()),
    }))
    assert.ok(bounds.logoTop >= bounds.headerBottom)
    assert.ok(bounds.buttons.every(rect => rect.height >= 44 && rect.bottom <= height - 8))
    evidence.push(`${width}x${height}: logo clears header; three home actions fit without scrolling`)
  }
  await page.setViewportSize({ width: 1900, height: 1000 })
  await page.evaluate(() => scrollTo(0, 80))
  await expect(page.locator('.site-header')).not.toHaveClass(/is-solid/)
  await page.evaluate(() => scrollTo(0, 0))
  await page.screenshot({ path: 'test-results/desktop-full.png', fullPage: true })
  for (const id of ['booking-options', 'services', 'direct-billing', 'about', 'contact']) {
    await page.locator(`#${id}`).evaluate(el => el.scrollIntoView({ block: 'start', behavior: 'instant' }))
    await page.screenshot({ path: `test-results/desktop-${id}.png` })
  }
  for (const [label, id] of [['HOME', 'home'], ['ABOUT', 'about'], ['SERVICES', 'services'], ['DIRECT BILLING', 'direct-billing'], ['CONTACT', 'contact']]) {
    await page.locator('.desktop-nav').getByRole('link', { name: label, exact: true }).click()
    if (id === 'about') {
      await page.waitForURL('**/about')
      await expect(page.getByRole('heading', { level: 1 })).toContainText('Professional wellness, massage and skin treatments')
    } else if (id === 'services') {
      await page.waitForURL('**/services')
      await expect(page.locator('.treatment-card')).toHaveCount(8)
    } else {
      await page.waitForURL(`**/#${id}`)
      assert.equal(new URL(page.url()).hash, `#${id}`)
    }
  }
  const triggers = page.locator('button').filter({ hasText: /^\s*(BOOK APPOINTMENT|Book In-Clinic|Book Mobile|Skin Treatment|Book your appointment now|Book now|Booking)\s*$/ })
  let bookingChecks = 0
  for (const trigger of await triggers.all()) {
    if (!await trigger.isVisible()) continue
    await trigger.click()
    await expect(page.getByRole('dialog')).toBeVisible()
    assert.equal(await page.getByRole('dialog').getByRole('link', { name: 'Book In-Clinic', exact: true }).getAttribute('href'), 'https://miellewellness.noterro.com/')
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()
    bookingChecks++
  }
  evidence.push(`${bookingChecks} booking actions open working booking choices; Escape closes`)
  for (const navigation of ['.desktop-nav']) {
    await page.locator(navigation).getByRole('button', { name: 'PROMOS', exact: true }).click()
    await expect(page.getByRole('dialog').getByRole('heading', { name: '10% Off Your First Appointment' })).toBeVisible()
    await page.getByRole('dialog').getByRole('button', { name: 'Book your appointment now' }).click()
    await expect(page.getByRole('dialog').getByRole('heading', { name: 'Book your first appointment' })).toBeVisible()
    await page.getByRole('button', { name: 'Close dialog' }).click()
  }
  evidence.push('Promos shows the supplied offer; its booking action and close control work')
  assert.equal(await page.locator('.insurance-group').first().locator('img').count(), 31)
  assert.equal(await page.locator('.insurance-track button').count(), 0)
  assert.equal(await page.locator('.insurance-track').evaluate(el => getComputedStyle(el).animationName), 'none')
  assert.equal(await page.locator('.service-detail').count(), 3)
  assert.equal(await page.locator('.booking-note p').innerText(), 'We’re excited to announce that our mobile and in-clinic massage services are now available in one easy booking system! Whether you prefer to visit us or enjoy treatment in the comfort of your home, booking your self-care is now simpler, faster, and more convenient than ever.')
  await page.getByRole('button', { name: 'See All', exact: true }).click()
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Direct Billing' })).toBeVisible()
  assert.equal(await page.locator('.all-insurers img').count(), 31)
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Next review' }).click()
  await expect(page.locator('.review-stage blockquote[aria-hidden="false"]')).toContainText('I had a massage at Mielle Wellness')
  await page.getByRole('button', { name: 'Previous review' }).click()
  await expect(page.locator('.review-stage blockquote[aria-hidden="false"]')).toContainText('The massage was amazing!')
  evidence.push('Restored treatment details and Direct Billing announcement remain; See All opens 31 logos; both review controls work')

  await page.getByRole('button', { name: 'SEND', exact: true }).click()
  assert.equal(await page.locator('#first-name').evaluate(el => el.validity.valueMissing), true)
  await page.locator('#first-name').fill('Test')
  await page.locator('#last-name').fill('Visitor')
  await page.locator('#contact-email').fill('visitor@example.com')
  await page.locator('#message').fill('Treatment enquiry for the restored website.')
  await page.getByRole('button', { name: 'SEND', exact: true }).click()
  const message = await page.getByRole('link', { name: 'Open email to send', exact: true }).getAttribute('href')
  assert.ok(decodeURIComponent(message).includes('Website enquiry from Test Visitor'))
  await page.evaluate(() => { Object.defineProperty(navigator.clipboard, 'writeText', { configurable: true, value: async text => { window.copiedMessage = text } }) })
  await page.getByRole('button', { name: 'Copy message', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Message copied', exact: true })).toBeVisible()
  assert.ok(await page.evaluate(() => window.copiedMessage.includes('Test Visitor')))
  await page.evaluate(() => { Object.defineProperty(navigator.clipboard, 'writeText', { configurable: true, value: async () => { throw new Error('Clipboard blocked') } }) })
  await page.getByRole('button', { name: 'Message copied', exact: true }).click()
  await expect(page.locator('.contact-form .form-error')).toBeVisible()
  await page.locator('#message').fill('Updated enquiry')
  await expect(page.locator('.contact-form .form-feedback')).toHaveCount(0)

  await page.locator('#newsletter-email').fill('visitor@example.com')
  await page.getByRole('button', { name: 'Subscribe', exact: true }).click()
  await expect(page.locator('.newsletter .form-error')).toBeVisible()
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Subscribe', exact: true }).click()
  await expect(page.getByRole('link', { name: 'Open email to complete your subscription' })).toBeVisible()
  await page.getByRole('checkbox').uncheck()
  await expect(page.locator('.newsletter .form-feedback')).toHaveCount(0)
  evidence.push('Contact validates required fields, prepares an email draft, copies with success/error feedback, and clears stale drafts; newsletter requires consent and prepares an email request')
  await page.evaluate(() => {
    window.checkedLinks = []
    document.addEventListener('click', event => {
      const link = event.target.closest('a')
      if (link && /^(https?:|mailto:|tel:)/.test(link.getAttribute('href'))) {
        event.preventDefault()
        window.checkedLinks.push(link.getAttribute('href'))
      }
    }, true)
  })
  assert.equal(await page.locator('.about-content a').getAttribute('href'), '/about')
  for (const selector of ['.desktop-nav > a[href^="https"]', '.contact-info a', '.site-footer a:is([href^="http"], [href^="mailto:"], [href^="tel:"])']) {
    for (const link of await page.locator(selector).all()) await link.click()
  }
  await page.locator('.header-booking').click()
  for (const link of await page.getByRole('dialog').getByRole('link').all()) await link.click()
  await page.keyboard.press('Escape')
  const externalClicks = await page.evaluate(() => window.checkedLinks)
  assert.equal(externalClicks.length, 13)
  evidence.push('About resolves to the new local page; Careers, contact phone, address, map, Facebook, footer contact/credit, three booking destinations, and booking phone links respond; outgoing navigation intercepted during testing')
  await page.setViewportSize({ width: 375, height: 812 })
  const menu = page.getByRole('button', { name: 'Menu', exact: true })
  await menu.click()
  assert.equal(await page.locator('main').evaluate(el => el.inert), true)
  await page.screenshot({ path: 'test-results/mobile-menu.png' })
  await page.keyboard.press('Escape')
  await expect(menu).toBeFocused()
  await menu.click()
  await page.mouse.click(10, 790)
  await expect(page.locator('.mobile-nav')).toHaveCount(0)
  await menu.click()
  await page.locator('.mobile-nav').getByRole('link', { name: 'SERVICES', exact: true }).click()
  await expect(page.locator('.mobile-nav')).toHaveCount(0)
  await menu.click()
  await page.setViewportSize({ width: 1280, height: 900 })
  await expect(page.locator('.mobile-nav')).toHaveCount(0)
  await expect(page.locator('.desktop-nav')).toBeVisible()
  await page.setViewportSize({ width: 375, height: 812 })
  await menu.click()
  await page.locator('.mobile-nav').getByRole('button', { name: 'BOOK APPOINTMENT', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await menu.click()
  await page.locator('.mobile-nav').getByRole('button', { name: 'PROMOS', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await page.locator('.header-logo').click()
  await page.screenshot({ path: 'test-results/mobile-full.png', fullPage: true })
  await page.keyboard.press('Tab')
  await page.locator('.skip-link').focus()
  assert.notEqual(await page.locator('.skip-link').evaluate(el => getComputedStyle(el).outlineStyle), 'none')
  await page.keyboard.press('Enter')
  assert.equal(new URL(page.url()).hash, '#main')
  evidence.push('Phone menu, backdrop, Escape/focus restoration, Services, booking, Promos, desktop resize, and keyboard skip link pass')
  assert.deepEqual(errors, [])
  await writeFile('test-results/browser-check.json', JSON.stringify({ evidence, externalClicks, errors }, null, 2))
  console.log(evidence.join('\n'))
} finally {
  await browser.close()
}
