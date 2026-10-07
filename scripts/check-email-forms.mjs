import { chromium, expect } from '@playwright/test'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'

await mkdir('test-results', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
const evidence = [], errors = []
page.on('pageerror', error => errors.push(error.message))
let expectedHttpError = false
page.on('console', message => {
  if (message.type() === 'error' && !(expectedHttpError && /Failed to load resource.*(?:502|ERR_FAILED)/.test(message.text()))) errors.push(message.text())
})
let mode = 'success', captured, release
await page.route('https://formsubmit.co/ajax/**', async route => {
  assert.equal(route.request().url(), 'https://formsubmit.co/ajax/miellewellness@gmail.com')
  const request = route.request()
  assert.equal(request.method(), 'POST')
  captured = await new Request(request.url(), { method: 'POST', headers: request.headers(), body: request.postDataBuffer() }).formData()
  if (mode === 'pending') await new Promise(resolve => { release = resolve })
  if (mode === 'network') { await route.abort('failed'); return }
  if (mode === 'failure') { await route.fulfill({ status: 502, json: { success: false } }); return }
  if (mode.startsWith('activation')) { await route.fulfill({ json: { success: mode === 'activation' ? 'true' : 'false', message: 'Please check your email inbox and activate your form.' } }); return }
  if (mode === 'malformed') { await route.fulfill({ contentType: 'text/html', body: '<h1>Gateway error</h1>' }); return }
  if (mode === 'rejected') { await route.fulfill({ json: { success: 'false', message: 'Rejected' } }); return }
  await route.fulfill({ json: { success: 'true', message: 'Form submitted successfully' } })
})
try {
  for (const route of ['/', '/#contact']) {
    for (const width of [375, 1440]) {
      await page.setViewportSize({ width, height: 1000 })
      await page.goto(`http://localhost:5173${route}`, { waitUntil: 'networkidle' })
      const form = page.locator('.contact-form')
      await form.getByRole('button', { name: 'SEND', exact: true }).click()
      assert.equal(await form.evaluate(el => el.checkValidity()), false)
      await page.locator('#first-name').fill('Zoë')
      await page.locator('#last-name').fill('Visitor')
      await page.locator('#contact-email').fill('zoe@example.com')
      captured = undefined
      await form.getByRole('button', { name: 'SEND', exact: true }).click()
      assert.equal(await page.locator('#message').evaluate(el => el.validity.valueMissing), true)
      await expect(page.locator('#message')).toBeFocused()
      assert.equal(captured, undefined)
      await page.locator('#message').fill('A treatment enquiry.\nThank you.')
      mode = 'pending'; release = undefined
      await form.getByRole('button', { name: 'SEND', exact: true }).click()
      await expect(form).toHaveAttribute('aria-busy', 'true')
      await expect(form.getByRole('button', { name: 'Sending…' })).toBeDisabled()
      await expect(page.locator('#message')).toBeDisabled()
      await expect(form.locator('.form-feedback')).toHaveCount(0)
      await expect.poll(() => !!release).toBe(true)
      assert.equal(captured.get('name'), 'Zoë Visitor')
      assert.equal(captured.get('email'), 'zoe@example.com')
      assert.equal(captured.get('_subject'), 'Mielle Wellness | Website enquiry from Zoë Visitor')
      assert.equal(captured.get('_template'), 'table')
      assert.ok(captured.get('_url').startsWith(`http://localhost:5173${route}`))
      assert.equal(String(captured.get('message')).replaceAll('\r\n', '\n'), 'A treatment enquiry.\nThank you.')
      release()
      await expect(form.getByRole('status')).toContainText('Your message has been submitted.')
      await expect(form).toHaveAttribute('aria-busy', 'false')
      for (const id of ['first-name', 'last-name', 'contact-email', 'message']) await expect(page.locator(`#${id}`)).toHaveValue('')
      await page.locator('#first-name').fill('Zoë')
      await page.locator('#last-name').fill('Visitor')
      await page.locator('#contact-email').fill('zoe@example.com')
      await page.locator('#message').fill('Changed enquiry')
      await expect(form.locator('.form-feedback')).toHaveCount(0)
      for (const failure of ['activation', 'activation-false', 'failure', 'network', 'malformed', 'rejected']) {
        mode = failure; expectedHttpError = ['failure', 'network'].includes(failure)
        await form.getByRole('button', { name: 'SEND', exact: true }).click()
        await expect(form.getByRole('alert')).toContainText(failure.startsWith('activation') ? 'awaiting inbox confirmation' : 'We could not send your message.')
        await expect(form.getByRole('status')).toHaveCount(0)
        await expect(page.locator('#message')).toHaveValue('Changed enquiry')
        await expect(form.getByRole('button', { name: 'SEND', exact: true })).toBeEnabled()
        await expect(form.getByRole('link', { name: 'miellewellness@gmail.com' })).toHaveAttribute('href', 'mailto:miellewellness@gmail.com')
      }
      mode = 'success'; expectedHttpError = false
      await form.getByRole('button', { name: 'SEND', exact: true }).click()
      await expect(form.getByRole('status')).toContainText('Your message has been submitted.')
      await expect(form.getByRole('alert')).toHaveCount(0)
      for (const id of ['first-name', 'last-name', 'contact-email', 'message']) await expect(page.locator(`#${id}`)).toHaveValue('')
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      evidence.push(`${route} at ${width}px: blank contact message is blocked before a request; Mielle subject, reply email, exact text, recipient and source URL; pending/disabled controls; activation, rejection, network and non-JSON errors preserve data; retry, clearing every field after acceptance and stale-feedback clearing pass.`)
    }
  }
  assert.deepEqual(errors, [])
  await writeFile('test-results/email-forms-check.json', JSON.stringify({ evidence, errors, actualDelivery: 'Not tested; requires recipient activation and inbox verification.' }, null, 2))
  console.log(evidence.join('\n'))
} finally { await browser.close() }
