import { mockContact } from './mock-contact.mjs'
import { chromium, expect } from '@playwright/test'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'

await mkdir('test-results', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ reducedMotion: 'reduce' })
await mockContact(page)
await page.context().route('https://miellewellness.noterro.com/**', route => route.fulfill({ contentType: 'text/html', body: '<title>Booking destination check</title>' }))
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
      buttons: [...document.querySelectorAll('.hero-actions a')].map(button => button.getBoundingClientRect().toJSON()),
    }))
    assert.ok(bounds.logoTop >= bounds.headerBottom)
    assert.equal(bounds.buttons.length, 3)
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
    } else if (id === 'direct-billing') {
      await page.waitForURL('**/direct-billing')
      await expect(page.locator('.direct-billing-logo')).toHaveCount(32)
    } else {
      await page.waitForURL(`**#${id}`)
      assert.equal(new URL(page.url()).hash, `#${id}`)
    }
  }
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
  for (const [selector, path] of [
    ['.hero-actions a:nth-child(1)', '/in-clinic'],
    ['.hero-actions a:nth-child(2)', '/mobile-service'],
    ['.hero-actions a:nth-child(3)', '/skin-treatment'],
    ['.booking-panel:nth-child(1) .text-link', '/mobile-service'],
    ['.booking-panel:nth-child(2) .text-link', '/in-clinic'],
  ]) {
    const link = page.locator(selector)
    await expect(link).toHaveAttribute('href', path)
    await link.focus()
    await page.keyboard.press('Enter')
    await page.waitForURL(`**${path}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
  }
  const appointment = page.locator('.header-booking')
  await expect(appointment).toHaveAttribute('href', 'https://miellewellness.noterro.com/')
  await appointment.focus()
  const desktopBookingTab = page.waitForEvent('popup')
  await page.keyboard.press('Enter')
  const desktopBooking = await desktopBookingTab
  await desktopBooking.waitForURL('https://miellewellness.noterro.com/')
  await desktopBooking.close()
  evidence.push('Home hero and photographic booking links open their local service pages by keyboard; desktop Book Appointment opens Noterro directly')
  for (let index = 0; index < 3; index++) {
    const treatment = page.locator('.service-content').nth(index).getByRole('link', { name: 'Book now', exact: true })
    await expect(treatment).toHaveAttribute('href', '/in-clinic')
    await treatment.focus()
    await page.keyboard.press('Enter')
    await page.waitForURL('**/in-clinic')
    await expect(page.getByRole('heading', { name: 'In-Clinic Services', exact: true })).toBeVisible()
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
  }
  evidence.push('All three Home treatment Book now links open /in-clinic by keyboard')
  for (const navigation of ['.desktop-nav']) {
    await page.locator(navigation).getByRole('link', { name: 'PROMOS', exact: true }).click()
    await page.waitForURL('**/promos')
    await expect(page.getByRole('heading', { name: 'PROMOS', exact: true })).toBeVisible()
    await page.locator('.promotion-booking').last().click()
    await page.waitForURL('**/services')
    await expect(page.locator('.treatment-card')).toHaveCount(8)
  }
  evidence.push('Promos opens its own page; the first-visit Book Now link opens Services')
  await page.locator('.desktop-nav').getByRole('link', { name: 'CAREERS', exact: true }).click()
  await page.waitForURL('**/careers')
  await expect(page.getByRole('heading', { name: 'Careers', exact: true })).toBeVisible()
  await page.getByRole('link', { name: 'Apply Now', exact: true }).click()
  await expect(page.locator('#application-first-name')).toBeFocused()
  await expect(page.locator('.application-form')).toBeVisible()
  evidence.push('Careers opens its own page; Apply Now reaches the application form and focuses First name')
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
  assert.equal(await page.locator('.insurance-group').first().locator('img').count(), 32)
  assert.equal(await page.locator('.insurance-track button').count(), 0)
  assert.equal(await page.locator('.insurance-track').evaluate(el => getComputedStyle(el).animationName), 'none')
  assert.equal(await page.locator('.service-detail').count(), 3)
  assert.equal(await page.locator('.booking-note p').innerText(), 'We’re excited to announce that our mobile and in-clinic massage services are now available in one easy booking system! Whether you prefer to visit us or enjoy treatment in the comfort of your home, booking your self-care is now simpler, faster, and more convenient than ever.')
  await page.getByRole('link', { name: 'See All', exact: true }).click()
  await page.waitForURL('**/direct-billing')
  await expect(page.getByRole('heading', { name: 'DIRECT BILLING', exact: true })).toBeVisible()
  assert.equal(await page.locator('.direct-billing-logo img').count(), 32)
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Next review' }).click()
  await expect(page.locator('.review-stage blockquote[aria-hidden="false"]')).toContainText('I had a massage at Mielle Wellness')
  await page.getByRole('button', { name: 'Previous review' }).click()
  await expect(page.locator('.review-stage blockquote[aria-hidden="false"]')).toContainText('The massage was amazing!')
  evidence.push('Restored treatment details and Direct Billing announcement remain; See All opens the page with 32 logos; both review controls work')

  await page.getByRole('button', { name: 'SEND', exact: true }).click()
  assert.equal(await page.locator('#first-name').evaluate(el => el.validity.valueMissing), true)
  await page.locator('#first-name').fill('Test')
  await page.locator('#last-name').fill('Visitor')
  await page.locator('#contact-email').fill('visitor@example.com')
  await page.locator('#message').fill('Treatment enquiry for the restored website.')
  await page.getByRole('button', { name: 'SEND', exact: true }).click()
  await expect(page.locator('.contact-form .form-feedback')).toContainText('Your message has been submitted.')
  await page.locator('#message').fill('Updated enquiry')
  await expect(page.locator('.contact-form .form-feedback')).toHaveCount(0)

  await expect(page.locator('.site-footer form')).toHaveCount(0)
  evidence.push('Contact validates required fields, submits directly to a mocked FormSubmit and clears stale success feedback; the footer subscription form is removed')
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
  for (const selector of ['.header-booking', '.contact-info a', '.site-footer a:is([href^="http"], [href^="mailto:"], [href^="tel:"])']) {
    for (const link of await page.locator(selector).all()) await link.click()
  }
  const footerBooking = page.locator('.footer-navigation').getByRole('link', { name: 'Booking', exact: true })
  await expect(footerBooking).toHaveAttribute('href', 'https://miellewellness.noterro.com/')
  const externalClicks = await page.evaluate(() => window.checkedLinks)
  assert.equal(externalClicks.length, 12)
  assert.ok(externalClicks.includes('https://www.instagram.com/miellewellness/'))
  assert.ok(externalClicks.includes('https://www.tiktok.com/@mielle.wellness'))
  assert.ok(externalClicks.includes('https://miellewellness.noterro.com/'))
  evidence.push('About and Careers resolve to local pages; contact phone, address, map, supplied Instagram/TikTok/Facebook footer links, direct Noterro footer Booking, footer contact and credit links respond; outgoing navigation is intercepted during testing')
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
  const mobileAppointment = page.locator('.mobile-nav').getByRole('link', { name: 'BOOK APPOINTMENT', exact: true })
  await expect(mobileAppointment).toHaveAttribute('href', 'https://miellewellness.noterro.com/')
  await mobileAppointment.focus()
  const mobileBookingTab = page.waitForEvent('popup')
  await page.keyboard.press('Enter')
  const mobileBooking = await mobileBookingTab
  await mobileBooking.waitForURL('https://miellewellness.noterro.com/')
  await mobileBooking.close()
  await expect(page.locator('.mobile-nav')).toHaveCount(0)
  await menu.click()
  await page.locator('.mobile-nav').getByRole('link', { name: 'PROMOS', exact: true }).click()
  await page.waitForURL('**/promos')
  await expect(page.getByRole('heading', { name: 'PROMOS', exact: true })).toBeVisible()
  await page.locator('.header-logo').click()
  await expect(page.locator('.hero-content')).toBeVisible()
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
