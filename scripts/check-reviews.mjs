import { chromium, expect } from '@playwright/test'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'

await mkdir('test-results', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ reducedMotion: 'no-preference' })
const evidence = [], errors = []
const reviews = [
  '“The massage was amazing! My therapist took the time to understand my skin needs and customized everything perfectly. My complexion looks brighter and feels refreshed, Mielle Wellness truly cares about your body.”',
  '“I had a massage at Mielle Wellness and it was incredible! The therapist targeted all my tension spots, and I left feeling completely relaxed and rejuvenated. This is hands down the best massage experience in Calgary!”',
  '“I booked a Massage at Mielle Wellness, and it was pure bliss from start to finish! My body felt so relaxed after the session. Definitely my new go-to spot in Calgary!”',
]
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
const section = page.locator('#reviews')
const current = section.locator('blockquote[aria-hidden="false"]')
const next = section.getByRole('button', { name: 'Next review', exact: true })
const previous = section.getByRole('button', { name: 'Previous review', exact: true })

try {
  for (const width of [320, 375, 600, 768, 1024, 1240, 1440, 1900]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    await section.scrollIntoViewIfNeeded()
    await expect(section.getByRole('heading')).toHaveText('WHAT CLIENTS SAY')
    await expect(section.getByRole('img', { name: '5 out of 5 stars' })).toBeVisible()
    const stars = await section.locator('.review-stars').evaluate(el => {
      const first = el.firstElementChild.getBoundingClientRect()
      const last = el.lastElementChild.getBoundingClientRect()
      return { count: el.children.length, midpoint: (first.left + last.right) / 2, size: parseFloat(getComputedStyle(el).fontSize) }
    })
    assert.equal(stars.count, 5)
    assert.ok(stars.size >= 32 && stars.size <= 48)
    assert.ok(Math.abs(stars.midpoint - width / 2) < 1)
    const bounds = await section.locator('.reviews-top h2, .review-arrow').evaluateAll(elements => elements.map(el => el.getBoundingClientRect().toJSON()))
    assert.ok(bounds[0].right <= bounds[1].left)
    assert.ok(bounds.slice(1).every(rect => rect.width >= 44 && rect.height >= 44 && rect.right <= width))
    const height = (await section.boundingBox()).height

    for (let index = 0; index < reviews.length; index++) {
      await expect(current).toHaveCount(1)
      await expect(current).toHaveText(reviews[index])
      const snapshot = await section.ariaSnapshot()
      assert.ok(snapshot.includes(reviews[index]))
      assert.ok(reviews.filter((_, other) => index !== other).every(review => !snapshot.includes(review)))
      assert.ok(Math.abs((await section.boundingBox()).height - height) < 1)
      await next.click()
    }
    await expect(current).toHaveText(reviews[0])
    await previous.click()
    await expect(current).toHaveText(reviews[2])
    await next.click()
    await expect(current).toHaveText(reviews[0])
    await next.focus()
    await page.keyboard.press('Shift+Tab')
    await expect(previous).toBeFocused()
    assert.notEqual(await previous.evaluate(el => getComputedStyle(el).outlineStyle), 'none')
    await page.keyboard.press('Enter')
    await expect(current).toHaveText(reviews[2])
    await next.focus()
    await page.keyboard.press('Space')
    await expect(current).toHaveText(reviews[0])

    const contrast = await section.evaluate(el => {
      const luminance = color => color.match(/\d+/g).slice(0, 3).map(Number).map(v => v / 255)
        .map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)
        .reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0)
      const background = luminance(getComputedStyle(el).backgroundColor)
      return [...el.querySelectorAll('h2,.review-stars,blockquote[aria-hidden="false"],.review-arrow')].map(text => {
        const foreground = luminance(getComputedStyle(text).color)
        return (Math.max(background, foreground) + .05) / (Math.min(background, foreground) + .05)
      })
    })
    assert.ok(contrast.every(ratio => ratio >= 4.5))
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    if ([375, 768, 1440].includes(width)) {
      await next.evaluate(el => el.blur())
      const capture = await page.addStyleTag({ content: '.site-header,.skip-link{visibility:hidden!important}' })
      await section.screenshot({ path: `test-results/reviews-${width}.png` })
      await capture.evaluate(el => el.remove())
    }
    evidence.push(`${width}px: five centered ${stars.size}px stars, three exact supplied quotations, only active review exposed, next/previous wrap, stable height, 44px controls, Enter/Space/focus, no overflow, and ${Math.min(...contrast).toFixed(2)}:1 contrast`)
  }
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await next.click()
  await expect(current).toHaveText(reviews[1])
  await previous.click()
  await expect(current).toHaveText(reviews[0])
  evidence.push('Reduced motion retains working manual review controls; no automatic slide changes or excerpt labels')
  assert.equal(await page.locator('.review-note').count(), 0)
  assert.deepEqual(errors, [])
  await writeFile('test-results/reviews-check.json', JSON.stringify({ evidence, errors }, null, 2))
  console.log(evidence.join('\n'))
} finally {
  await browser.close()
}
