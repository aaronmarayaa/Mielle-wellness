import { chromium, expect } from '@playwright/test'
import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ reducedMotion: 'no-preference' })
const evidence = []
try {
  for (const [width, height] of [[320, 568], [375, 812], [768, 900], [1440, 900]]) {
    await page.setViewportSize({ width, height })
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
    await expect(page.locator('.hero-content')).toHaveCSS('opacity', '1')
    const heroHeight = await page.locator('.hero').evaluate(el => el.offsetHeight)
    const scrollAmount = Math.round(heroHeight * .5)
    await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), scrollAmount)
    const geometry = await page.evaluate(() => {
      const hero = document.querySelector('.hero').getBoundingClientRect()
      const card = document.querySelector('.home-offer-card').getBoundingClientRect()
      return { heroTop: hero.top, cardTop: card.top, foreground: document.elementFromPoint(innerWidth / 2, card.top + 40)?.closest('.home-offer-card') !== null }
    })
    assert.equal(geometry.heroTop, 0)
    assert.equal(geometry.cardTop, heroHeight - scrollAmount)
    assert.ok(geometry.foreground)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
    await page.screenshot({ path: `test-results/offer-stack-${width}.png` })
    await page.locator('.header-logo').click()
    await page.waitForFunction(() => scrollY === 0)
    await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), scrollAmount)
    await page.locator('.hero-actions button').first().focus()
    await page.waitForFunction(() => scrollY === 0)
    const unoccluded = await page.locator('.hero-actions button').first().evaluate(el => {
      const rect = el.getBoundingClientRect()
      return el.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2))
    })
    assert.ok(unoccluded)
    await page.locator('.home-offer-card button').click()
    await expect(page.getByRole('dialog').getByRole('heading', { name: 'Book your first appointment' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()
    await page.locator('.home-offer-card').evaluate(el => {
      const headerHeight = document.querySelector('.site-header').offsetHeight
      scrollTo({ top: scrollY + el.getBoundingClientRect().top - headerHeight + 2, behavior: 'instant' })
    })
    await expect(page.locator('.site-header')).toHaveClass(/is-solid/)
    await expect(page.locator('.site-header')).toHaveCSS('background-color', 'rgb(252, 250, 245)')
    await page.screenshot({ path: `test-results/offer-card-${width}.png` })
    evidence.push(`${width}px: offer moves over a stationary hero, paints above it, fits the page, books correctly, returns home through the logo, keeps keyboard targets visible, and updates navbar contrast`)
  }
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('.hero')).toHaveCSS('position', 'relative')
  await expect(page.locator('video')).toHaveCount(0)
  evidence.push('Reduced motion uses a static hero and an ordinary sequential offer section')
  await writeFile('test-results/stack-check.json', JSON.stringify({ evidence }, null, 2))
  console.log(evidence.join('\n'))
} finally {
  await browser.close()
}
