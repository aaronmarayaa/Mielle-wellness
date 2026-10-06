import assert from 'node:assert/strict'

export async function mockContact(page) {
  await page.route('https://formsubmit.co/ajax/miellewellness@gmail.com', async route => {
    assert.equal(route.request().method(), 'POST')
    assert.ok(route.request().headers()['content-type'].startsWith('multipart/form-data;'))
    const request = route.request()
    const data = await new Request(request.url(), { method: 'POST', headers: request.headers(), body: request.postDataBuffer() }).formData()
    assert.ok(String(data.get('_subject')).startsWith('Mielle Wellness | Website enquiry'))
    assert.equal(data.get('_template'), 'table')
    assert.ok(data.get('email'))
    await route.fulfill({ json: { success: true } })
  })
}
