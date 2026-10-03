import { chromium, expect } from '@playwright/test'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'

await mkdir('test-results', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ reducedMotion: 'no-preference' })
const evidence = [], errors = []
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
const paragraph = 'Immerse yourself in the art of renewal with Mielle Wellness. Experience radiant skin, restorative massage, and professional wellness treatments brought together in perfect harmony.'
const photos = page.locator('.renewal-photo')
const positions = () => photos.evaluateAll(elements => elements.map(el => {
  const style = getComputedStyle(el)
  return { progress: Number(style.getPropertyValue('--image-progress')), y: new DOMMatrixReadOnly(style.transform).m42, rise: parseFloat(style.getPropertyValue('--image-rise')) }
}))
const scrollProgress = async progress => {
  await page.locator('.renewal-gallery').evaluate(async (el, progress) => {
    const top = scrollY + el.getBoundingClientRect().top - innerHeight * (.65 - .7 * progress)
    scrollTo({ top, behavior: 'instant' })
    await new Promise(requestAnimationFrame)
    await new Promise(requestAnimationFrame)
  }, progress)
}

try {
  for (const width of [320, 375, 600, 768, 1024, 1240, 1440, 1900]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    const section = page.locator('.renewal-section')
    assert.equal(await section.locator('h2').innerText(), paragraph)
    assert.equal((await section.innerText()).replace(/\s+/g, ' ').trim(), `Mielle Wellness ${paragraph} See Services`)
    await section.locator('img').evaluateAll(async images => {
      images.forEach(image => { image.loading = 'eager' })
      await Promise.all(images.map(image => image.decode()))
    })
    assert.equal(await photos.count(), 3)

    for (const [progress, expectedPositions] of [
      [0, [0, 0, 0]],
      [.2, [0, .25, .5]],
      [.4, [.25, .5, 1]],
      [.6, [.5, .75, 1]],
      [.8, [.75, 1, 1]],
      [1, [1, 1, 1]],
    ]) {
      await scrollProgress(progress)
      const state = await positions()
      state.forEach((photo, index) => {
        const expected = expectedPositions[index]
        assert.ok(Math.abs(photo.progress - expected) < .02, JSON.stringify({ width, progress, state }))
        assert.ok(Math.abs(photo.y - photo.rise * (1 - expected)) < 2)
      })
    }
    const bounds = await photos.evaluateAll(elements => elements.map(el => el.getBoundingClientRect().toJSON()))
    assert.ok(bounds.every(rect => rect.x >= 0 && rect.right <= width), 'Photos leave page bounds')
    if (width >= 620) assert.ok(bounds[0].top > bounds[1].top && bounds[1].top > bounds[2].top)
    else assert.ok(bounds[2].top >= bounds[1].bottom)
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))

    await scrollProgress(.4)
    const stopped = await positions()
    await page.waitForTimeout(250)
    assert.deepEqual(await positions(), stopped)
    await scrollProgress(.2)
    assert.ok((await positions())[0].y > stopped[0].y)
    await expect(page.locator('.site-header')).toHaveClass(/is-solid/)
    const contrast = await section.evaluate(el => {
      const luminance = color => color.match(/\d+/g).slice(0, 3).map(Number).map(v => v / 255)
        .map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)
        .reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0)
      const background = luminance(getComputedStyle(el).backgroundColor)
      return [...el.querySelectorAll('p,h2,a')].map(text => {
        const foreground = luminance(getComputedStyle(text).color)
        return (Math.max(background, foreground) + .05) / (Math.min(background, foreground) + .05)
      })
    })
    assert.ok(contrast.every(ratio => ratio >= 4.5))
    if ([375, 768, 1440].includes(width)) await section.screenshot({ path: `test-results/renewal-${width}.png` })
    evidence.push(`${width}px: right-to-left overlapping rise matches 50/25/0, 100/50/25, 100/75/50, 100/100/75, and 100/100/100; reverse motion, no timer/overflow/collision, exact supplied text, loaded images, and ${Math.min(...contrast).toFixed(2)}:1 text contrast`)
  }

  const services = page.getByRole('link', { name: 'See Services', exact: true })
  await services.focus()
  assert.notEqual(await services.evaluate(el => getComputedStyle(el).outlineStyle), 'none')
  await page.keyboard.press('Enter')
  await expect(page.locator('.desktop-nav a[href="#services"]')).toHaveAttribute('aria-current', 'location')
  assert.equal(new URL(page.url()).hash, '#services')
  evidence.push('See Services has visible keyboard focus and Enter navigates to the existing treatment menu')

  await scrollProgress(.4)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(photos.first()).toHaveCSS('transform', 'none')
  assert.ok((await positions()).every(photo => photo.y === 0))
  await scrollProgress(0)
  assert.ok((await positions()).every(photo => photo.y === 0))
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await scrollProgress(.4)
  const resumed = await positions()
  assert.ok(Math.abs(resumed[2].y) < 2 && resumed[1].y > 0 && resumed[0].y > resumed[1].y, JSON.stringify(resumed))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload({ waitUntil: 'networkidle' })
  assert.ok((await positions()).every(photo => photo.y === 0))
  evidence.push('Live and initial reduced motion show final static images; returning to normal motion restores scroll control')
  assert.deepEqual(errors, [])
  await writeFile('test-results/renewal-check.json', JSON.stringify({ evidence, errors }, null, 2))
  console.log(evidence.join('\n'))
} finally {
  await browser.close()
}
