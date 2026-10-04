import { chromium, expect } from '@playwright/test'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'

await mkdir('test-results', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ reducedMotion: 'no-preference' })
const evidence = [], errors = []
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
const section = page.locator('#first-visit-offer')
const button = section.getByRole('button', { name: 'Book your appointment now' })

try {
  for (const [width, height] of [[320, 568], [375, 812], [600, 700], [768, 900], [960, 600], [1024, 600], [1440, 900], [1900, 940]]) {
    await page.setViewportSize({ width, height })
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    await expect(section.getByRole('heading')).toHaveText('10% Off Your First Appointment')
    await expect(section.locator('.eyebrow')).toHaveText('EXCLUSIVE OFFER')
    await section.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
    const bounds = await section.boundingBox()
    const action = await button.boundingBox()
    const copy = await section.locator('.offer-copy').boundingBox()
    assert.ok(bounds.height < 400, 'Offer should not reserve an extra screen of scrolling')
    assert.ok(action.height >= 44 && action.x >= 0 && action.x + action.width <= width)
    assert.ok(action.y >= 0 && action.y + action.height <= height)
    if (width >= 960) assert.ok(action.x >= copy.x + copy.width, 'Wide layouts put the action beside the offer')
    else assert.ok(action.y >= copy.y + copy.height, 'Narrow layouts stack the action below the offer')
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    const beforeScroll = await page.evaluate(() => scrollY)
    await button.focus()
    await expect(button).toBeFocused()
    assert.equal(await page.evaluate(() => scrollY), beforeScroll, 'Focus should not jump through an animation')
    await page.keyboard.press('Enter')
    await expect(page.getByRole('dialog').getByRole('heading', { name: 'Book your first appointment' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(button).toBeFocused()
    const contrast = await section.evaluate(el => {
      const luminance = color => color.match(/\d+/g).slice(0, 3).map(Number).map(v => v / 255)
        .map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)
        .reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0)
      return [...el.querySelectorAll('p,h2,button')].map(text => {
        const style = getComputedStyle(text)
        const background = luminance(style.backgroundColor === 'rgba(0, 0, 0, 0)' ? getComputedStyle(el).backgroundColor : style.backgroundColor)
        const foreground = luminance(style.color)
        return (Math.max(background, foreground) + .05) / (Math.min(background, foreground) + .05)
      })
    })
    assert.ok(contrast.every(ratio => ratio >= 4.5))
    if ([375, 768, 1440].includes(width)) {
      await button.evaluate(el => el.blur())
      await section.screenshot({ path: `test-results/offer-banner-${width}.png` })
    }
    const originalTop = (await section.boundingBox()).y
    await page.evaluate(() => scrollBy({ top: 80, behavior: 'instant' }))
    assert.ok(Math.abs((await section.boundingBox()).y - originalTop + 80) < 2, 'Offer follows ordinary page scrolling')
    evidence.push(`${width}x${height}: compact responsive offer, visible 44px+ action, exact wording, keyboard booking/Escape/focus restoration, ordinary scrolling, no overflow, ${Math.min(...contrast).toFixed(2)}:1 contrast`)
  }
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await section.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await expect(button).toBeVisible()
  await page.reload({ waitUntil: 'networkidle' })
  await section.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await button.click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  evidence.push('Live and initial reduced motion retain the fully visible offer and working booking action')
  assert.deepEqual(errors, [])
  await writeFile('test-results/offer-banner-check.json', JSON.stringify({ evidence, errors }, null, 2))
  console.log(evidence.join('\n'))
} finally {
  await browser.close()
}
