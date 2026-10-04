import { chromium, expect } from '@playwright/test'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'

await mkdir('test-results', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ reducedMotion: 'no-preference' })
const evidence = [], errors = []
page.on('pageerror', error => errors.push(error.message))
const move = async top => page.evaluate(async top => {
  scrollTo({ top, behavior: 'instant' })
  await new Promise(requestAnimationFrame)
  await new Promise(requestAnimationFrame)
}, top)
const layout = () => page.evaluate(() => ({
  header: document.querySelector('.site-header').offsetHeight,
  cards: [...document.querySelectorAll('.about-difference')].map(el => ({
    start: el.getBoundingClientRect().top + scrollY,
    top: parseFloat(getComputedStyle(el).getPropertyValue('--stack-top')),
  })),
  contact: document.querySelector('.about-contact').getBoundingClientRect().top + scrollY,
  footer: document.querySelector('.about-footer').getBoundingClientRect().top + scrollY,
}))

try {
  for (const [width, height] of [[1024, 600], [1024, 900], [1440, 900], [1900, 850], [1900, 1000]]) {
    await page.setViewportSize({ width, height })
    await page.goto('http://localhost:5173/about', { waitUntil: 'networkidle' })
    await page.evaluate(async () => {
      [...document.images].forEach(image => { image.loading = 'eager' })
      await Promise.all([...document.images].map(image => image.decode()))
      await document.fonts.ready
    })
    await expect(page.locator('.about-page')).toHaveClass(/about-stack-ready/)
    const positions = await layout()
    for (let index = 0; index < 2; index++) {
      const start = positions.cards[index].start - positions.cards[index].top
      const end = positions.cards[index + 1].start - positions.cards[index + 1].top
      for (const progress of [0, .25, .5, .75, 1]) {
        await move(start + (end - start) * progress)
        const state = await page.locator('.about-difference').nth(index).evaluate(el => ({
          top: el.getBoundingClientRect().top,
          progress: Number(getComputedStyle(el).getPropertyValue('--herb-progress')),
          herbScale: new DOMMatrixReadOnly(getComputedStyle(el.querySelector('.about-botanical')).transform).a,
          leafTransform: getComputedStyle(el.querySelector('.about-botanical path')).transform,
        }))
        assert.ok(Math.abs(state.top - positions.cards[index].top) < 2)
        assert.ok(Math.abs(state.progress - progress) < .015, JSON.stringify({ width, index, progress, state }))
        assert.ok(Math.abs(state.herbScale - (1 - progress * .12)) < .01)
        if (progress > 0) assert.notEqual(state.leafTransform, 'none')
      }
      if (width === 1440 || (width === 1900 && height === 850)) await page.screenshot({ path: `test-results/about-stack-${width}-${height}-${index + 2}.png` })
    }
    const heads = await page.locator('.about-difference h2').evaluateAll(elements => elements.map(el => {
      const rect = el.getBoundingClientRect()
      return { top: rect.top, visible: el.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)) }
    }))
    assert.ok(heads.every(head => head.visible && head.top >= positions.header), JSON.stringify({ width, height, heads, positions }))
    const completedScroll = await page.evaluate(() => scrollY)
    const before = await page.locator('.about-difference').first().evaluate(el => getComputedStyle(el).getPropertyValue('--herb-progress'))
    await page.waitForTimeout(200)
    assert.equal(await page.locator('.about-difference').first().evaluate(el => getComputedStyle(el).getPropertyValue('--herb-progress')), before)
    await move(positions.cards[1].start - positions.cards[1].top - (height - positions.cards[1].top) * .5)
    const reverse = await page.locator('.about-difference').first().evaluate(el => Number(getComputedStyle(el).getPropertyValue('--herb-progress')))
    assert.ok(reverse > .45 && reverse < .55)
    await move(completedScroll)
    for (const progress of [.25, .5, 1]) {
      const start = positions.cards[2].start - positions.cards[2].top
      const end = positions.contact - positions.header
      await move(start + (end - start) * progress)
      const herb = await page.locator('.about-difference').nth(2).evaluate(el => Number(getComputedStyle(el).getPropertyValue('--herb-progress')))
      assert.ok(Math.abs(herb - progress) < .015)
    }
    assert.equal(await page.evaluate(header => Boolean(document.elementFromPoint(innerWidth / 2, header + 6)?.closest('.about-contact')), positions.header), true)
    if (width === 1440) await page.screenshot({ path: 'test-results/about-stack-contact-cover.png' })
    const footerStart = await page.locator('.about-footer').evaluate(el => el.getBoundingClientRect().top + scrollY)
    await move(footerStart - positions.header)
    assert.equal(await page.evaluate(header => Boolean(document.elementFromPoint(innerWidth / 2, header + 6)?.closest('.about-footer')), positions.header), true)
    if (width === 1440) await page.screenshot({ path: 'test-results/about-stack-footer-cover.png' })
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    evidence.push(`${width}x${height}: three pinned panels retain visible headings, ten scroll checkpoints fold/shrink herbs, reverse and paused scrolling are stable, contact and full-height footer cover the stack, no overflow`)
  }

  for (const [width, height] of [[320, 568], [375, 812], [768, 650], [1024, 600]]) {
    await page.setViewportSize({ width, height })
    await page.goto('http://localhost:5173/about', { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    await expect(page.locator('.about-page')).toHaveClass(/about-stack-ready/)
    await expect(page.locator('.about-difference').first()).toHaveCSS('position', 'sticky')
    const positions = await layout()
    for (let index = 0; index < 3; index++) {
      await move(positions.cards[index].start - positions.cards[index].top)
      const state = await page.locator('.about-difference').nth(index).evaluate(el => ({
        top: el.getBoundingClientRect().top,
        bottom: el.getBoundingClientRect().bottom,
      }))
      assert.ok(Math.abs(state.top - positions.cards[index].top) < 2)
      assert.ok(state.bottom <= height + 2, JSON.stringify({ width, height, index, state }))
      const reading = await page.locator('.about-difference').nth(index).locator('p').last().evaluate(el => {
        const rect = el.getBoundingClientRect()
        const hit = document.elementFromPoint(rect.x + 16, rect.bottom - 12)
        return { bottom: rect.bottom, visible: el.contains(hit), hit: hit?.className }
      })
      assert.ok(reading.bottom <= height + 1 && reading.visible, JSON.stringify({ width, height, index, reading }))
    }
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    await page.locator('#contact').scrollIntoViewIfNeeded()
    await page.getByRole('button', { name: 'SEND', exact: true }).click()
    assert.equal(await page.locator('#first-name').evaluate(el => el.validity.valueMissing), true)
    evidence.push(`${width}x${height}: panels remain sticky; taller panels scroll to their bottom before pinning, every paragraph is readable and Contact stays reachable`)
  }
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('http://localhost:5173/about', { waitUntil: 'networkidle' })
  await expect(page.locator('.about-page')).toHaveClass(/about-stack-ready/)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('.about-page')).toHaveClass(/about-stack-ready/)
  await expect(page.locator('.about-page')).not.toHaveClass(/about-stack-motion/)
  await expect(page.locator('.about-botanical').first()).toHaveCSS('transform', 'none')
  await page.reload({ waitUntil: 'networkidle' })
  await expect(page.locator('.about-page')).toHaveClass(/about-stack-ready/)
  await expect(page.locator('.about-page')).not.toHaveClass(/about-stack-motion/)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(page.locator('.about-page')).toHaveClass(/about-stack-ready/)
  evidence.push('Live/initial reduced motion preserves the stack layout and disables herb transforms; restoring normal motion re-enables herb movement')
  assert.deepEqual(errors, [])
  await writeFile('test-results/about-stack-check.json', JSON.stringify({ evidence, errors }, null, 2))
  console.log(evidence.join('\n'))
} finally {
  await browser.close()
}
