import { chromium, expect } from '@playwright/test'
import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage()
const evidence = [], errors = []
page.on('pageerror', error => errors.push(error.message))
try {
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const route of ['/about', '/services', '/in-clinic', '/mobile-service', '/skin-treatment', '/direct-billing', '/promos', '/careers']) {
      await page.goto(`http://localhost:5173${route}`, { waitUntil: 'networkidle' })
      await expect(page.locator('#contact,.contact-form')).toHaveCount(0)
      await expect(page.locator('.application-form')).toHaveCount(route === '/careers' ? 1 : 0)
      await expect(page.locator('.footer-navigation').getByRole('link', { name: 'Contact', exact: true })).toHaveAttribute('href', '/#contact')
      if (width < 1280) await page.getByRole('button', { name: 'Menu', exact: true }).click()
      const nav = page.locator(width < 1280 ? '.mobile-nav' : '.desktop-nav')
      const contact = nav.getByRole('link', { name: 'CONTACT', exact: true })
      await expect(contact).toHaveAttribute('href', '/#contact')
      await contact.focus()
      await page.keyboard.press('Enter')
      await page.waitForURL('**/#contact')
      await expect(page.locator('.mobile-nav')).toHaveCount(0)
      await expect(page.locator('#contact')).toHaveCount(1)
      await expect(page.locator('.contact-form')).toHaveCount(1)
      await expect.poll(() => page.locator('.contact-heading h1').evaluate(el => {
        const rect = el.getBoundingClientRect()
        return rect.top >= document.querySelector('.site-header').getBoundingClientRect().bottom && rect.bottom <= innerHeight && el.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2))
      })).toBe(true)
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      if (route === '/careers') await page.screenshot({ path: `test-results/home-contact-arrival-${width}.png` })
      evidence.push(`${width}px ${route}: no contact block; keyboard header Contact reaches the visible Home heading and single form; menu closes, footer links to Home contact, no overflow`)
    }
    await page.goto('http://localhost:5173/about', { waitUntil: 'networkidle' })
    await page.locator('.footer-navigation').getByRole('link', { name: 'Contact', exact: true }).click()
    await page.waitForURL('**/#contact')
    await expect(page.locator('.contact-heading h1')).toBeInViewport()
    await page.reload({ waitUntil: 'networkidle' })
    await expect(page.locator('.contact-heading h1')).toBeInViewport()
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('http://localhost:5173/promos', { waitUntil: 'networkidle' })
    if (width < 1280) await page.getByRole('button', { name: 'Menu', exact: true }).click()
    await page.locator(width < 1280 ? '.mobile-nav' : '.desktop-nav').getByRole('link', { name: 'CONTACT', exact: true }).click()
    await page.waitForURL('**/#contact')
    await expect(page.locator('.contact-heading h1')).toBeInViewport()
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    evidence.push(`${width}px: footer Contact, fragment refresh and reduced-motion header Contact also reach Home`)
  }
  assert.deepEqual(errors, [])
  await writeFile('test-results/home-contact-check.json', JSON.stringify({ evidence, errors }, null, 2))
  console.log(evidence.join('\n'))
} finally { await browser.close() }
