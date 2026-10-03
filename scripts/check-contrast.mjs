import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ reducedMotion: 'reduce' })
const results = []

for (const width of [320, 375, 600, 768, 1024, 1240, 1440, 1900]) {
  await page.setViewportSize({ width, height: 1000 })
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)

  for (const [section, selectors, target] of [
    ['hero', ['.hero-description', '.hero-actions > button', '.desktop-nav > a', '.desktop-nav > button', '.header-booking', '.menu-button']],
    ['hero-hover-clinic', ['.hero-actions > button:first-child']],
    ['hero-hover-mobile', ['.hero-actions > button:nth-child(2)']],
    ['hero-hover-skin', ['.hero-actions > button:last-child']],
    ['booking', ['.booking-panel-content p']],
    ['home-offer', ['.home-offer-card p', '.home-offer-card h2', '.home-offer-card button'], '.home-offer-card'],
    ['booking-botanical', ['.booking-intro p', '.booking-intro h2', '.booking-note h3'], '.booking-intro'],
    ['services-botanical', ['.services-intro p', '.services-intro h2'], '.services-intro'],
    ['service-first', ['.service-row:first-child .service-content p', '.service-row:first-child h3', '.service-row:first-child .text-link'], '.service-row:first-child .service-content'],
    ['service-second', ['.service-row:nth-child(2) .service-content p', '.service-row:nth-child(2) h3', '.service-row:nth-child(2) .text-link'], '.service-row:nth-child(2) .service-content'],
    ['service-third', ['.service-row:nth-child(3) .service-content p', '.service-row:nth-child(3) h3', '.service-row:nth-child(3) .text-link'], '.service-row:nth-child(3) .service-content'],
    ['about-botanical', ['.about-content p', '.about-content h2', '.about-content .text-link'], '.about-content'],
    ['contact-botanical', ['.contact-heading p', '.contact-heading h2'], '.contact-heading'],
    ['contact-details', ['.contact-info p', '.contact-info h3', '.contact-info address a'], '.contact-info'],
  ]) {
    if (section.startsWith('hero-hover')) await page.locator(selectors[0]).hover()
    if (section === 'booking') await page.locator('.booking-panels').scrollIntoViewIfNeeded()
    if (target) {
      await page.mouse.move(1, 1)
      await page.locator(target).evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
    }
    const items = await page.evaluate(selectors => selectors.flatMap(selector =>
      [...document.querySelectorAll(selector)].filter(el => el.getBoundingClientRect().width).map(el => {
        const rect = el.getBoundingClientRect(), style = getComputedStyle(el)
        return {
          label: el.textContent.trim().slice(0, 40),
          rect: { x: rect.x + 2, y: rect.y + 2, width: rect.width - 4, height: rect.height - 4 },
          color: style.color, fontSize: parseFloat(style.fontSize),
        }
      }),
    ), selectors)
    const hiddenText = await page.addStyleTag({ content: selectors.map(s => `${s}{color:transparent!important}`).join('\n') + '\n.desktop-nav [aria-current]::after{visibility:hidden}' })
    const base64 = (await page.screenshot()).toString('base64')

    const values = await page.evaluate(async ({ base64, items, width, section }) => {
      const img = new Image()
      img.src = 'data:image/png;base64,' + base64
      await img.decode()
      const canvas = document.createElement('canvas')
      canvas.width = img.width; canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data
      const luminance = rgb => rgb.map(v => v / 255)
        .map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)
        .reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0)

      return items.flatMap(el => {
        const r = el.rect
        const x0 = Math.max(0, Math.ceil(r.x)), y0 = Math.max(0, Math.ceil(r.y))
        const x1 = Math.min(canvas.width, Math.floor(r.x + r.width))
        const y1 = Math.min(canvas.height, Math.floor(r.y + r.height))
        if (x1 <= x0 || y1 <= y0) return []
        const foreground = luminance(el.color.match(/\d+/g).slice(0, 3).map(Number))
        let minimum = Infinity
        for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
          const i = (y * canvas.width + x) * 4
          const background = luminance([...pixels.slice(i, i + 3)])
          minimum = Math.min(minimum, (Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05))
        }
        const threshold = el.fontSize >= 24 ? 3 : 4.5
        return [{ width, section, label: el.label, contrast: Number(minimum.toFixed(2)), threshold, pass: minimum >= threshold }]
      })
    }, { base64, items, width, section })
    results.push(...values)
    await hiddenText.evaluate(el => el.remove())
  }
}

await writeFile('test-results/contrast-check.json', JSON.stringify(results, null, 2))
await browser.close()
assert.ok(results.every(item => item.pass), JSON.stringify(results.filter(item => !item.pass)))
console.log(`Photo and navigation contrast: ${results.length} regions pass at eight widths`)
