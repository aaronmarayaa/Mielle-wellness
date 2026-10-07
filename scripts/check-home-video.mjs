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
    const menuIntro = page.locator('.services-intro')
    await expect(menuIntro).toHaveCSS('opacity', '0')
    await expect(menuIntro).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 8)')
    await expect(menuIntro).toHaveCSS('transition-duration', '0.35s, 0.35s')
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
    await page.mouse.wheel(0, 120)
    await expect.poll(() => page.evaluate(() => Math.round(scrollY))).toBe(120)
    await expect(page.locator('.scroll-offer-content')).toHaveCSS('opacity', '1')
    await page.mouse.wheel(0, 120)
    await expect.poll(() => page.evaluate(() => Math.round(scrollY))).toBe(240)
    assert.ok(await page.locator('#booking-options').evaluate(el => el.getBoundingClientRect().top >= innerHeight), 'Offer remains uncovered after two 120px scroll steps')
    await page.mouse.wheel(0, 120)
    await expect.poll(() => page.evaluate(() => Math.round(scrollY))).toBe(360)
    assert.ok(await page.locator('#booking-options').evaluate(el => el.getBoundingClientRect().top < innerHeight), 'Three 120px scroll steps start the note overlap')
    const plateau = []
    for (let distance = 60; distance <= 320; distance += 20) {
      await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), distance)
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
      if (await page.locator('.scroll-offer-content').evaluate(el => Number(getComputedStyle(el).opacity) === 1)) plateau.push(distance)
    }
    const hold = plateau.at(-1) - plateau[0]
    assert.ok(hold >= 240 && hold <= 340, `${width}px: offer keeps a brief hold before the note stacks`)
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
    if ([375, 1900].includes(width)) await page.screenshot({ path: `test-results/offer-short-${width}.png` })
    const bookingTop = await page.locator('#booking-options').evaluate(el => scrollY + el.getBoundingClientRect().top)
    for (const progress of [0, .25, .5, .75]) {
      await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), bookingTop - height + height * progress)
      await expect(page.locator('.scroll-offer-content')).toHaveCSS('opacity', '1')
      await expect(page.locator('.scroll-offer')).toHaveClass(/is-visible/)
      if (progress > 0) {
        await expect(page.locator('.site-header')).toHaveClass(/is-solid/)
        await expect(page.locator('.site-header')).toHaveCSS('color', 'rgb(0, 0, 0)')
      }
      const stack = await page.evaluate(() => {
        const stage = document.querySelector('.home-stage')
        const note = document.getElementById('booking-options')
        const edge = note.getBoundingClientRect().top
        return {
          stageTop: stage.getBoundingClientRect().top,
          edge,
          noteOnTop: edge >= innerHeight - 4 || note.contains(document.elementFromPoint(innerWidth / 2, edge + 4)),
          offerBehind: stage.contains(document.elementFromPoint(innerWidth / 2, Math.min(innerHeight - 4, edge - 4))),
        }
      })
      assert.ok(Math.abs(stack.stageTop) <= 1, `${width}px: offer stays pinned while note rises`)
      assert.ok(Math.abs(stack.edge - height * (1 - progress)) <= 2)
      assert.ok(stack.noteOnTop && stack.offerBehind, `${width}px: note covers the pinned offer at ${progress}`)
      if ([375, 1900].includes(width) && progress === .5) {
        await page.locator('#booking-options').evaluate(async section => {
          await Promise.all(section.getAnimations({ subtree: true }).map(animation => animation.finished.catch(() => {})))
        })
        await page.screenshot({ path: `test-results/home-note-stacking-${width}.png` })
      }
    }
    await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), bookingTop)
    await expect(page.locator('.scroll-offer')).not.toHaveClass(/is-visible/)
    await expect(page.locator('.scroll-offer-content')).toHaveCSS('opacity', '1')
    assert.equal(await page.locator('.home-stage').evaluate(el => el.inert), true)
    await expect(page.locator('.site-header')).toHaveClass(/is-solid/)
    await expect(page.locator('.site-header')).toHaveCSS('color', 'rgb(0, 0, 0)')
    const nextHeading = page.locator('.booking-intro h2')
    await expect(nextHeading).toBeInViewport()
    await expect.poll(() => nextHeading.evaluate(el => {
      const rect = el.getBoundingClientRect()
      return el.contains(document.elementFromPoint(rect.x + rect.width / 2, Math.min(innerHeight - 4, rect.y + rect.height / 2)))
    })).toBe(true)
    if ([375, 1900].includes(width)) {
      await expect(page.locator('.booking-intro')).toHaveCSS('opacity', '1')
      await page.locator('#booking-options').evaluate(async section => {
        await Promise.all(section.getAnimations({ subtree: true }).map(animation => animation.finished.catch(() => {})))
      })
      await page.screenshot({ path: `test-results/home-note-arrived-${width}.png` })
    }
    await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), plateau[Math.floor(plateau.length / 2)])
    await expect(page.locator('.scroll-offer-content')).toHaveCSS('opacity', '1')
    await expect.poll(() => page.locator('.home-stage').evaluate(el => el.inert)).toBe(false)
    await expect(page.locator('.site-header')).not.toHaveClass(/is-solid/)
    const releaseTop = await page.locator('#booking-options').evaluate(el => scrollY + el.getBoundingClientRect().top + 1)
    await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), releaseTop)
    await expect.poll(() => page.evaluate(() => Math.round(scrollY))).toBe(Math.round(releaseTop))
    await expect(page.locator('.scroll-offer'), `${width}x${height}: offer is inaccessible after the note covers it`).not.toHaveClass(/is-visible/)
    await page.locator('#booking-options').scrollIntoViewIfNeeded()
    await expect(page.locator('#booking-options')).toBeInViewport()
    await menuIntro.evaluate(el => scrollTo({ top: scrollY + el.getBoundingClientRect().top - innerHeight - 40, behavior: 'instant' }))
    await expect(menuIntro).not.toHaveClass(/is-revealed/)
    await menuIntro.evaluate(el => scrollTo({ top: scrollY + el.getBoundingClientRect().top - innerHeight + 80, behavior: 'instant' }))
    await page.waitForFunction(() => {
      const opacity = Number(getComputedStyle(document.querySelector('.services-intro')).opacity)
      return opacity > 0 && opacity < 1
    })
    await expect(menuIntro).toHaveCSS('opacity', '1')
    assert.ok(await menuIntro.evaluate(el => el.getBoundingClientRect().top < innerHeight), 'Treatment Menu visibly transitions after entering the viewport')
    await page.locator('#services').evaluate(el => el.scrollIntoView({ block: 'start', behavior: 'instant' }))
    await expect(page.locator('.services-section > .botanical-backdrop')).toHaveCSS('transition-duration', '0.4s')
    await expect(page.locator('.service-image').first()).toHaveCSS('transition-duration', '0.24s')
    await expect.poll(() => video.evaluate(el => el.paused)).toBe(true)
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    await expect(page.locator('.interior-section > p')).toHaveCount(0)
    assert.ok(await page.locator('.interior-section').evaluate(el => Math.abs(el.offsetHeight - el.querySelector('img').offsetHeight) <= 1), 'Room photograph has no caption strip')
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
    await expect.poll(() => video.evaluate(el => !el.paused)).toBe(true)
    if ([375, 1900].includes(width)) {
      await page.screenshot({ path: `test-results/home-1006-${width}.png` })
    }
    evidence.push(`${width}x${height}: supplied video autoplays muted/inline, pauses offscreen and resumes on return; three 120px wheel steps start the note overlap, offer stays fully opaque with ${blur}, keyboard link opens /services; four checkpoints show A note from Mielle rising above the pinned offer; covered offer becomes inert, navbar stays black, reverse restores offer; Treatment Menu visibly fades/slides on entry for 350ms/8px, with 400ms botanical fade and 240ms image hover; no room-photo caption strip or overflow`)
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
  await expect(page.locator('.services-intro')).toHaveCSS('opacity', '1')
  await expect(page.locator('.services-intro')).toHaveCSS('transform', 'none')
  await expect(page.locator('.services-intro')).toHaveCSS('transition-duration', '0s')
  await expect(page.locator('img.hero-background')).toHaveAttribute('src', '/assets/home-1006-poster.jpg')
  await expect.poll(() => page.locator('img.hero-background').evaluate(el => el.complete && el.naturalWidth === 854)).toBe(true)
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
  await expect(page.locator('video.hero-background')).toHaveCount(0)
  await page.evaluate(() => scrollTo({ top: innerHeight, behavior: 'instant' }))
  await expect(page.locator('.scroll-offer-content')).toHaveCSS('opacity', '1')
  await page.locator('#booking-options').evaluate(el => scrollTo({ top: scrollY + el.getBoundingClientRect().top, behavior: 'instant' }))
  await expect.poll(() => page.locator('.home-stage').evaluate(el => el.inert)).toBe(true)
  await expect(page.locator('.scroll-offer-content')).toHaveCSS('opacity', '1')
  await expect(page.locator('.booking-intro h2')).toBeInViewport()
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
  evidence.push('Video is byte-for-byte identical to supplied 1006.mp4; 17.368s loop restarts. Live/initial reduced motion and failed playback show the matching sharp still; reduced motion keeps the shorter offer sequence and visible content')
  assert.deepEqual(errors, [])
  await writeFile('test-results/home-video-offer-check.json', JSON.stringify({ evidence, holds, errors }, null, 2))
  console.log(evidence.join('\n'))
} finally {
  await browser.close()
}
