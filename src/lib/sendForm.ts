import { applicationEmail } from './applicationForm'

export async function sendForm(data: FormData) {
  const name = `${String(data.get('firstName') ?? '').trim()} ${String(data.get('lastName') ?? '').trim()}`.trim()
  const submission = new FormData()
  submission.set('name', name)
  submission.set('email', String(data.get('email') ?? '').trim())
  submission.set('message', String(data.get('message') ?? '').trim())
  submission.set('_subject', `Mielle Wellness | Website enquiry from ${name}`)
  submission.set('_template', 'table')
  submission.set('_url', window.location.href)
  const response = await fetch(`https://formsubmit.co/ajax/${applicationEmail}`, {
    method: 'POST', headers: { Accept: 'application/json' }, body: submission,
    signal: AbortSignal.timeout(60000),
  }).catch(() => { throw new Error('We could not send your message. Please try again or email us directly.') })
  const result = await response.json().catch(() => null)
  if (/activat|confirm.*email|verify.*email/i.test(String(result?.message ?? ''))) throw new Error('Email sending is awaiting inbox confirmation. Please try again after it has been confirmed, or email us directly.')
  if (!response.ok || ![true, 'true'].includes(result?.success)) throw new Error('We could not send your message. Please try again or email us directly.')
}
