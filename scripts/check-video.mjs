import { chromium, expect } from '@playwright/test'
import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ reducedMotion: 'no-preference' })
const evidence = []
const errors = []
const contrast = []
page.on('pageerror', error => errors.push(error.message))
try {
  for (const [width, height] of [[320, 568], [375, 812], [1440, 900]]) {
    await page.setViewportSize({ width, height })
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    await expect(page.locator('.hero-content')).toHaveCSS('opacity', '1')
    await page.addStyleTag({ content: '*{transition:none!important}' })
    await page.waitForFunction(() => {
      const video = document.querySelector('video.hero-background')
      return video?.readyState >= 2 && !video.paused && video.currentTime > 0
    })
    const metadata = await page.locator('video').evaluate(video => ({ muted: video.muted, inline: video.playsInline, duration: video.duration }))
    assert.ok(metadata.muted && metadata.inline && metadata.duration > 38)
    await page.getByRole('button', { name: 'Pause background video' }).click()
    const pausedAt = await page.locator('video').evaluate(video => video.currentTime)
    await page.waitForTimeout(300)
    assert.equal(await page.locator('video').evaluate(video => video.currentTime), pausedAt)
    await expect(page.getByRole('button', { name: 'Play background video' })).toBeVisible()
    const controlBounds = await page.locator('.hero-video-control').boundingBox()
    assert.ok(controlBounds.width >= 44 && controlBounds.height >= 44)
    const logoBounds = await page.locator('.hero-brand').boundingBox()
    assert.ok(controlBounds.x >= logoBounds.x + logoBounds.width || controlBounds.y + controlBounds.height <= logoBounds.y)

    for (const fraction of [0, .17, .34, .51, .68, .85, .99]) {
      await page.locator('video').evaluate(async (video, fraction) => {
        const time = video.duration * fraction
        if (Math.abs(video.currentTime - time) < .001) return
        await new Promise(resolve => {
          video.addEventListener('seeked', resolve, { once: true })
          video.currentTime = time
        })
      }, fraction)
      const selectors = '.hero-description,.hero-actions>button,.desktop-nav>a,.desktop-nav>button,.header-booking,.menu-button,.hero-video-control'
      const items = await page.locator(selectors).evaluateAll(elements => elements.filter(el => el.getBoundingClientRect().width).map(el => {
        const rect = el.getBoundingClientRect(), style = getComputedStyle(el)
        return { label: el.getAttribute('aria-label') || el.textContent.trim(), x: rect.x + 2, y: rect.y + 2, width: rect.width - 4, height: rect.height - 4, color: style.color, threshold: el.matches('.hero-video-control') ? 3 : 4.5 }
      }))
      const hidden = await page.addStyleTag({ content: `${selectors}{color:transparent!important}.desktop-nav [aria-current]::after{visibility:hidden}` })
      const screenshot = (await page.screenshot()).toString('base64')
      const samples = await page.evaluate(async ({ screenshot, items }) => {
        const image = new Image()
        image.src = 'data:image/png;base64,' + screenshot
        await image.decode()
        const canvas = document.createElement('canvas')
        canvas.width = image.width; canvas.height = image.height
        const context = canvas.getContext('2d')
        context.drawImage(image, 0, 0)
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
        const luminance = rgb => rgb.map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0)
        return items.map(item => {
          const foreground = luminance(item.color.match(/\d+/g).slice(0, 3).map(Number))
          let minimum = Infinity
          for (let y = Math.max(0, Math.ceil(item.y)); y < Math.min(canvas.height, item.y + item.height); y++) {
            for (let x = Math.max(0, Math.ceil(item.x)); x < Math.min(canvas.width, item.x + item.width); x++) {
              const i = (y * canvas.width + x) * 4
              const background = luminance([...pixels.slice(i, i + 3)])
              minimum = Math.min(minimum, (Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05))
            }
          }
          return { label: item.label, contrast: Number(minimum.toFixed(2)), threshold: item.threshold, pass: minimum >= item.threshold }
        })
      }, { screenshot, items })
      await hidden.evaluate(el => el.remove())
      contrast.push(...samples.map(sample => ({ width, fraction, ...sample })))
      assert.ok(samples.every(sample => sample.pass), JSON.stringify({ width, fraction, samples }))
      if (fraction === .34) await page.screenshot({ path: `test-results/video-home-${width}.png` })
    }
    await page.getByRole('button', { name: 'Play background video' }).click()
    await page.waitForFunction(() => !document.querySelector('video').paused)
    await page.locator('video').evaluate(video => { video.currentTime = video.duration - .15 })
    await page.waitForFunction(() => document.querySelector('video').currentTime < 1)
    evidence.push(`${width}px: muted inline autoplay, pause/resume, loop restart, 44px control, clear logo, and seven video frames with readable text`)
  }

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('video')).toHaveCount(0)
  await expect(page.locator('img.hero-background')).toBeVisible()
  await expect(page.locator('.hero-video-control')).toHaveCount(0)
  await page.reload({ waitUntil: 'networkidle' })
  await expect(page.locator('video')).toHaveCount(0)
  assert.ok(await page.locator('img.hero-background').evaluate(image => image.naturalWidth > 0))
  evidence.push('Live and initial reduced-motion preferences use a loaded still frame without a video element')

  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(page.locator('video')).toHaveCount(1)
  await page.route('**/hero-video.mp4', route => route.abort())
  await page.reload({ waitUntil: 'networkidle' })
  await expect(page.locator('img.hero-background')).toBeVisible()
  assert.ok(await page.locator('img.hero-background').evaluate(image => image.naturalWidth > 0))
  evidence.push('A failed video request falls back to the same loaded still frame')
  assert.deepEqual(errors, [])
  await writeFile('test-results/video-check.json', JSON.stringify({ evidence, contrast, errors }, null, 2))
  console.log(evidence.join('\n'))
  console.log(`${contrast.length} video-frame regions pass; minimum ${Math.min(...contrast.map(item => item.contrast))}:1`)
} finally {
  await browser.close()
}
