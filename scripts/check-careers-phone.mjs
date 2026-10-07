import { mockContact } from './mock-contact.mjs'
import { chromium, expect } from '@playwright/test'
import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'

const browser = await chromium.launch({ channel: 'chrome' })
const evidence = [], errors = []
const page = await browser.newPage({ viewport: { width: 1806, height: 1100 }, reducedMotion: 'reduce' })
await mockContact(page)
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })

async function readyFlags() {
  await expect.poll(() => page.locator('.career-country-panel ul').evaluate(list => {
    const bounds = list.getBoundingClientRect()
    return [...list.querySelectorAll('li')].filter(item => {
      const box = item.getBoundingClientRect()
      return box.bottom > bounds.top && box.top < bounds.bottom
    }).every(item => { const img = item.querySelector('img'); return img.complete && img.naturalWidth > 0 })
  })).toBe(true)
}

try {
  await page.goto('http://localhost:5173/careers', { waitUntil: 'networkidle' })
  await page.locator('.careers-application').scrollIntoViewIfNeeded()
  await page.evaluate(() => document.fonts.ready)
  await expect(page.locator('.career-opportunities h2')).toHaveCSS('font-family', 'AvenirHeavy, Avenir, Arial, sans-serif')
  assert.ok(await page.evaluate(() => document.fonts.check('34px AvenirHeavy')))
  await page.locator('.careers-application').screenshot({ path: 'test-results/careers-reference-layout-1806.png' })
  await expect(page.getByRole('button', { name: 'Submit', exact: true })).toHaveCSS('text-transform', 'none')
  await page.getByRole('button', { name: 'Phone country: Canada (+1)' }).click()
  await readyFlags()
  await page.locator('.career-country-panel').screenshot({ path: 'test-results/careers-country-dropdown-1806.png' })
  await expect(page.getByRole('option', { name: 'Canada +1', exact: true })).toBeInViewport()
  await page.keyboard.press('ArrowDown')
  await expect(page.getByRole('combobox')).toHaveAttribute('aria-activedescendant', 'career-country-CV')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: 'Phone country: Cape Verde (+238)' })).toBeFocused()
  await page.locator('#application-phone').fill('+44 20 7946 0018')
  await expect(page.getByRole('button', { name: 'Phone country: United Kingdom (+44)' })).toBeVisible()
  await page.getByRole('button', { name: 'Phone country: United Kingdom (+44)' }).click()
  await page.getByRole('combobox').fill('Canada')
  await page.keyboard.press('Enter')
  await expect(page.locator('#application-phone')).toHaveValue('2079460018')
  await page.getByRole('button', { name: 'Phone country: Canada (+1)' }).click()
  await page.getByRole('combobox').fill('+855')
  await expect(page.getByRole('option', { name: 'Cambodia +855' })).toBeVisible()
  await page.keyboard.press('Tab')
  await expect(page.locator('#application-phone')).toBeFocused()
  await expect(page.locator('.career-country-panel')).toHaveCount(0)
  await page.locator('.career-country-trigger').click()
  await page.keyboard.press('Shift+Tab')
  await expect(page.locator('.career-country-trigger')).toBeFocused()
  await expect(page.locator('.career-country-panel')).toHaveCount(0)
  await page.locator('.career-country-trigger').click()
  await page.locator('#application-first-name').click()
  await expect(page.locator('.career-country-panel')).toHaveCount(0)
  evidence.push('Reference layout uses original Avenir Heavy heading, square fields and sentence-case Submit. Dropdown shows loaded SVG flags and selected Canada; keyboard arrows/Enter, international +44 detection, prefix replacement, dial-code search, Tab/Shift+Tab and outside dismissal pass.')

  for (const size of [{ width: 320, height: 568 }, { width: 375, height: 667 }, { width: 768, height: 600 }]) {
    await page.setViewportSize(size)
    await page.goto('http://localhost:5173/careers', { waitUntil: 'networkidle' })
    await page.getByRole('link', { name: 'Apply Now', exact: true }).click()
    await page.locator('#application-phone').scrollIntoViewIfNeeded()
    await page.locator('.career-country-trigger').click()
    const box = await page.locator('.career-country-panel').boundingBox()
    assert.ok(box.x >= 0 && box.x + box.width <= size.width && box.y >= 76 && box.y + box.height <= size.height)
    await page.getByRole('combobox').fill('Cameroon')
    await page.getByRole('option', { name: 'Cameroon +237', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Phone country: Cameroon (+237)' })).toBeVisible()
    await page.locator('#application-phone').fill('6 71 23 45 67')
    assert.ok(await page.locator('#application-phone').evaluate(el => el.checkValidity()))
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    if (size.width === 375) {
      const hideFixedHeader = await page.addStyleTag({ content: '.site-header, .skip-link { visibility: hidden !important; }' })
      await page.locator('.careers-application').screenshot({ path: 'test-results/careers-reference-layout-375.png' })
      await hideFixedHeader.evaluate(el => el.remove())
      await page.locator('.career-country-trigger').click()
      await readyFlags()
      await page.locator('.career-country-panel').screenshot({ path: 'test-results/careers-country-dropdown-375.png' })
    }
    evidence.push(`${size.width}x${size.height}: dropdown fits viewport, selection/national number validation work, no overflow.`)
  }

  const touch = await browser.newPage({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' })
  await touch.goto('http://localhost:5173/careers', { waitUntil: 'networkidle' })
  await touch.locator('#application-phone').scrollIntoViewIfNeeded()
  await touch.locator('.career-country-trigger').tap()
  await touch.getByRole('combobox').fill('Philippines')
  await touch.getByRole('option', { name: 'Philippines +63' }).tap()
  await expect(touch.getByRole('button', { name: 'Phone country: Philippines (+63)' })).toBeVisible()
  await touch.close()
  evidence.push('Touch input can open, search and select Philippines +63.')

  for (const route of ['/', '/careers']) {
    await page.goto(`http://localhost:5173${route}`, { waitUntil: 'networkidle' })
    if (route === '/careers') {
      await expect(page.locator('#contact')).toHaveCount(0)
      await page.locator('.footer-navigation').getByRole('link', { name: 'Contact', exact: true }).click()
      await page.waitForURL('**/#contact')
    }
    await page.locator('#first-name').fill('Email recipient test')
    await page.locator('#contact-email').fill('applicant@example.com')
    await page.locator('#message').fill('Testing the contact form recipient.')
    await page.getByRole('button', { name: 'SEND', exact: true }).click()
    await expect(page.locator('.contact-form .form-feedback')).toContainText('Your message has been submitted.')
    evidence.push(`${route}: contact form posts directly to FormSubmit and displays acceptance feedback. Requests are mocked; no email is sent.`)
  }
  assert.deepEqual(errors, [])
  await writeFile('test-results/careers-country-check.json', JSON.stringify({ evidence, errors }, null, 2))
  console.log(evidence.join('\n'))
} finally {
  await browser.close()
}
