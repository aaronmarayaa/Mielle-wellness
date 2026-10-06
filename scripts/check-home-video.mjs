import { chromium, expect } from '@playwright/test'
import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'

assert.deepEqual(await readFile('public/assets/home-1006.mp4'), await readFile('C:/Users/aaron/Downloads/1006.mp4'))
const browser = await chromium.launch({ channel: 'chrome' })
const evidence = [], errors = [], holds = []
try {
  const page = await browser.newPage()
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  for (const [width, height] of [[320, 568], [375, 812], [600, 700], [768, 900], [1024, 900], [1280, 720], [1440, 900], [1900, 988]]) {
    await page.setViewportSize({ width, height })
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
    const video = page.locator('video.hero-background')
    await expect(video).toHaveAttribute('src', '/assets/home-1006.mp4')
    await expect(video).toHaveAttribute('poster', '/assets/home-1006-poster.jpg')
    await expect(video).toHaveCSS('filter', 'none')
    await expect.poll(() => video.evaluate(el => el.readyState >= 2 && !el.paused && el.currentTime > 0), { timeout: 15000 }).toBe(true)
    const metadata = await video.evaluate(el => ({ muted: el.muted, loop: el.loop, inline: el.playsInline, width: el.videoWidth, height: el.videoHeight, duration: el.duration }))
    assert.ok(metadata.muted && metadata.loop && metadata.inline)
    assert.deepEqual([metadata.width, metadata.height], [854, 480])
    assert.ok(Math.abs(metadata.duration - 17.368) < .1)
    await page.evaluate(() => document.fonts.ready)
    await expect(page.locator('.hero-content')).toHaveCSS('opacity', '1')
    await expect(page.locator('.hero-description')).toHaveCSS('color', 'rgb(255, 255, 255)')
    for (const button of await page.locator('.hero-actions a').all()) {
      await expect(button).toHaveCSS('color', 'rgb(255, 255, 255)')
      const bounds = await button.boundingBox()
      if (bounds.y + bounds.height > height) {
        await page.screenshot({ path: 'test-results/home-short-screen.png' })
        console.log(await page.evaluate(() => [...document.querySelectorAll('.site-header,.home-stage,.hero,.hero-content,.hero-brand,.hero-description,.hero-actions')].map(el => ({ selector: el.className, bounds: el.getBoundingClientRect().toJSON(), padding: getComputedStyle(el).padding, margin: getComputedStyle(el).margin, transform: getComputedStyle(el).transform }))))
      }
      assert.ok(bounds.y + bounds.height <= height, `${width}x${height}: Home action stays inside viewport`)
    }
    const plateau = []
    for (let distance = height * .3; distance <= height * 1.6; distance += height * .1) {
      await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), distance)
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
      if (await page.locator('.scroll-offer-content').evaluate(el => Number(getComputedStyle(el).opacity) === 1)) plateau.push(distance)
    }
    const hold = plateau.at(-1) - plateau[0]
    assert.ok(hold >= height, `${width}px: offer should remain fully visible for at least one viewport of scrolling`)
    holds.push({ width, height, measuredFullVisibility: Math.round(hold) })
    await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), plateau[Math.floor(plateau.length / 2)])
    await expect(page.locator('.scroll-offer-content')).toHaveCSS('opacity', '1')
    const blur = await page.locator('.scroll-offer').evaluate(el => getComputedStyle(el, '::before').backdropFilter)
    assert.equal(blur, width <= 680 ? 'blur(4px)' : 'blur(8px)')
    const bounds = await page.locator('.scroll-offer-content').boundingBox()
    assert.ok(Math.abs(bounds.y + bounds.height / 2 - height / 2) <= 1)
    const booking = page.locator('.scroll-offer-cta')
    const bookingBounds = await booking.boundingBox()
    assert.ok(bookingBounds.y + bookingBounds.height <= height)
    await booking.focus()
    await expect(booking).toHaveAttribute('href', '/services')
    await page.keyboard.press('Enter')
    await page.waitForURL('**/services')
    await expect(page.locator('.treatment-card')).toHaveCount(8)
    await page.goBack({ waitUntil: 'networkidle' })
    await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), plateau[Math.floor(plateau.length / 2)])
    await expect(page.locator('.scroll-offer-content')).toHaveCSS('opacity', '1')
    if ([375, 1900].includes(width)) await page.screenshot({ path: `test-results/offer-longer-${width}.png` })
    await page.evaluate(() => scrollTo({ top: document.getElementById('home').offsetHeight - innerHeight + 1, behavior: 'instant' }))
    await expect(page.locator('.scroll-offer')).not.toHaveClass(/is-visible/)
    await page.locator('#booking-options').scrollIntoViewIfNeeded()
    await expect(page.locator('#booking-options')).toBeInViewport()
    await page.locator('#services').evaluate(el => el.scrollIntoView({ block: 'start', behavior: 'instant' }))
    await expect.poll(() => video.evaluate(el => el.paused)).toBe(true)
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
    await expect.poll(() => video.evaluate(el => !el.paused)).toBe(true)
    if ([375, 1900].includes(width)) {
      await page.screenshot({ path: `test-results/home-1006-${width}.png` })
    }
    evidence.push(`${width}x${height}: supplied video autoplays muted/inline, pauses offscreen and resumes on return; offer holds fully visible for ${Math.round(hold)}px with ${blur}, keyboard link opens /services, normal scroll to next section, no overflow`)
  }
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
  const measurements = await page.evaluate(async () => {
    const home = document.getElementById('home')
    const original = home.getBoundingClientRect
    let reads = 0
    home.getBoundingClientRect = function () { reads++; return original.call(this) }
    for (let index = 0; index < 100; index++) window.dispatchEvent(new Event('scroll'))
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    home.getBoundingClientRect = original
    return reads
  })
  assert.ok(measurements > 0 && measurements <= 3, `Scroll events are batched; measured ${measurements} Home bounds reads for 100 events`)
  evidence.push(`100 scroll events in one frame cause ${measurements} Home bounds reads; offer animation remains frame-batched`)
  await page.locator('video').evaluate(el => { el.currentTime = el.duration - .15 })
  await expect.poll(() => page.locator('video').evaluate(el => el.currentTime < 1)).toBe(true)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('video.hero-background')).toHaveCount(0)
  await expect(page.locator('img.hero-background')).toHaveAttribute('src', '/assets/home-1006-poster.jpg')
  await expect.poll(() => page.locator('img.hero-background').evaluate(el => el.complete && el.naturalWidth === 854)).toBe(true)
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
  await expect(page.locator('video.hero-background')).toHaveCount(0)
  await page.evaluate(() => scrollTo({ top: innerHeight, behavior: 'instant' }))
  await expect(page.locator('.scroll-offer-content')).toHaveCSS('opacity', '1')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(page.locator('video.hero-background')).toHaveCount(1)
  await expect(page.locator('video.hero-background')).toHaveCSS('filter', 'none')
  const fallback = await browser.newPage()
  await fallback.route('**/home-1006.mp4', route => route.abort())
  await fallback.goto('http://localhost:5173', { waitUntil: 'networkidle' })
  await expect(fallback.locator('img.hero-background')).toBeVisible()
  await expect(fallback.locator('img.hero-background')).toHaveAttribute('src', '/assets/home-1006-poster.jpg')
  await expect.poll(() => fallback.locator('img.hero-background').evaluate(el => el.complete && el.naturalWidth === 854)).toBe(true)
  await expect(fallback.locator('img.hero-background')).toHaveCSS('filter', 'none')
  await fallback.close()
  evidence.push('New asset is byte-for-byte identical to supplied 1006.mp4; 17.368s loop restarts. Live/initial reduced motion and failed playback show the matching sharp still; reduced motion keeps the longer offer hold')
  assert.deepEqual(errors, [])
  await writeFile('test-results/home-video-offer-check.json', JSON.stringify({ evidence, holds, errors }, null, 2))
  console.log(evidence.join('\n'))
} finally {
  await browser.close()
}
