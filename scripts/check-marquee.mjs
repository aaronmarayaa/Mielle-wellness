import { chromium, expect } from '@playwright/test'
import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ reducedMotion: 'no-preference' })
const evidence = [], errors = []
page.on('pageerror', error => errors.push(error.message))
try {
  for (const width of [320, 375, 600, 768, 1024, 1440, 1900]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
    await page.locator('.insurance-carousel').scrollIntoViewIfNeeded()
    await page.locator('.insurance-carousel img').evaluateAll(async images => {
      images.forEach(image => { image.loading = 'eager' })
      await Promise.all(images.map(image => image.decode()))
    })
    const track = page.locator('.insurance-track')
    const groups = page.locator('.insurance-group')
    assert.equal(await groups.count(), 2)
    assert.equal(await groups.first().locator('img').count(), 31)
    assert.equal(await groups.nth(1).getAttribute('aria-hidden'), 'true')
    assert.deepEqual(await groups.first().locator('img').evaluateAll(images => images.map(image => image.src)), await groups.nth(1).locator('img').evaluateAll(images => images.map(image => image.src)))
    const geometry = await groups.evaluateAll(elements => elements.map(el => el.getBoundingClientRect().width))
    assert.ok(Math.abs(geometry[0] - geometry[1]) < .01)
    const strip = await page.locator('.insurance-carousel').boundingBox()
    assert.ok(Math.abs(strip.x) < .01 && Math.abs(strip.width - width) < .01, `Strip is inset at ${width}px`)
    const duration = await track.evaluate(el => parseFloat(getComputedStyle(el).animationDuration))
    const speed = geometry[0] / duration
    assert.ok(speed > 80 && speed < 90, `Expected doubled speed, got ${speed}px/s`)
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    await expect(track).toHaveCSS('animation-timing-function', 'linear')
    await expect(track).toHaveCSS('animation-iteration-count', 'infinite')
    const position = () => track.evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).m41)
    const before = await position()
    await page.waitForTimeout(200)
    assert.ok(await position() < before - 4)
    await page.locator('.insurance-carousel').hover()
    await expect(track).toHaveCSS('animation-play-state', 'running')
    const hovered = await position()
    await page.waitForTimeout(200)
    assert.ok(await position() < hovered - 4)
    assert.equal(await page.locator('.insurance-carousel button').count(), 0)
    const seam = await track.evaluate(async el => {
      const animation = el.getAnimations()[0]
      const duration = animation.effect.getTiming().duration
      animation.currentTime = duration - 100
      await new Promise(requestAnimationFrame)
      const end = el.children[1].children[0].getBoundingClientRect().x
      animation.currentTime = duration + 100
      await new Promise(requestAnimationFrame)
      const start = el.children[0].children[0].getBoundingClientRect().x
      return Math.abs(end - start)
    })
    assert.ok(seam < 20, `Loop jumps ${seam}px at ${width}px`)
    await page.screenshot({ path: `test-results/insurance-slide-${width}.png` })
    evidence.push(`${width}px: edge-to-edge strip, doubled speed (${speed.toFixed(1)}px/s), 31 brands, matched hidden duplicate, no hover pause or arrow controls, seamless loop, and no page overflow`)
  }
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('.insurance-track')).toHaveCSS('animation-name', 'none')
  await expect(page.locator('.insurance-group').nth(1)).toBeHidden()
  assert.equal(await page.locator('.insurance-group').first().locator('img').count(), 31)
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
  evidence.push('Reduced motion exposes the 31 original marks in a static grid and hides the loop duplicate')
  assert.deepEqual(errors, [])
  await writeFile('test-results/marquee-check.json', JSON.stringify({ evidence, errors }, null, 2))
  console.log(evidence.join('\n'))
} finally {
  await browser.close()
}
