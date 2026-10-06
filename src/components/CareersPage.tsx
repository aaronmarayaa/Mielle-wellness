import { useEffect, useRef, useState, type FormEvent } from 'react'
import { applicationEmail, resumeError } from '../lib/applicationForm'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { CareerPhoneField } from './CareerPhoneField'
import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js/min'

const opportunities = [
  'Registered Massage Therapist (RMT)',
  'Osteopathic Therapist',
  'Acupuncturist',
  'Lymphatic Drainage Therapist',
]

export function CareersPage() {
  const applicationForm = useRef<HTMLFormElement>(null)
  const firstName = useRef<HTMLInputElement>(null)
  const [filename, setFilename] = useState('')
  const [fileError, setFileError] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(() => new URLSearchParams(window.location.search).get('application') === 'submitted')

  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.get('application') === 'submitted') {
      applicationForm.current?.reset()
      url.searchParams.delete('application')
      history.replaceState(history.state, '', url)
    }
    function restorePage() { setSending(false) }
    window.addEventListener('pageshow', restorePage)
    return () => window.removeEventListener('pageshow', restorePage)
  }, [])

  function clearFeedback() {
    setSent(false)
  }

  function sendApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending) return
    const form = event.currentTarget
    const data = new FormData(form)
    const resume = data.get('attachment') as File
    const validation = resumeError(resume)
    if (validation) {
      setFileError(validation)
      return
    }
    clearFeedback()
    const name = `${String(data.get('firstName') ?? '').trim()} ${String(data.get('lastName') ?? '').trim()}`.trim()
    const phone = parsePhoneNumberFromString(String(data.get('phone')).trim(), String(data.get('phoneCountry')) as CountryCode)
    const next = new URL('/careers', window.location.href)
    next.searchParams.set('application', 'submitted')
    next.hash = 'application'
    form.addEventListener('formdata', event => {
      const submission = (event as FormDataEvent).formData
      submission.set('name', name)
      submission.delete('firstName')
      submission.delete('lastName')
      submission.delete('phoneCountry')
      if (phone) submission.set('phone', phone.formatInternational())
      submission.set('_subject', `Mielle Wellness | Career application from ${name}`)
      submission.set('_template', 'table')
      submission.set('_url', window.location.href)
      submission.set('_next', next.href)
    }, { once: true })
    form.submit()
    setSending(true)
  }

  return <>
    <section className="careers-hero" aria-labelledby="careers-title">
      <img src="/assets/careers-body-scrub.jpg" alt="" width="7190" height="4799" fetchPriority="high" />
      <div className="careers-hero-copy">
        <h1 id="careers-title">Careers</h1>
        <p>Seeking a Career at Mielle Wellness</p>
      </div>
    </section>

    <section className="careers-intro" aria-labelledby="careers-welcome">
      <div className="careers-poster" data-reveal><img src="/assets/careers-hiring.png" alt="Mielle Wellness is hiring massage, osteopathic, acupuncture and lymphatic drainage therapists. Build your wellness career in a clean, respectful and supportive workplace." width="2550" height="3300" loading="lazy" /></div>
      <div className="careers-welcome" data-reveal>
        <h2 id="careers-welcome">Welcome to Mielle Wellness</h2>
        <p>At Mielle Wellness, we pride ourselves on fostering a clean, welcoming, and respectful environment for both our clients and our team. Our dedication to helping clients achieve their physical well-being, relieve tension, and restore balance is at the heart of everything we do. We are committed to creating a space where relaxation, care, and professionalism come together in every experience.</p>
        <Button asChild className="careers-action"><a href="#application" onClick={event => {
          event.preventDefault()
          history.pushState(null, '', '#application')
          firstName.current?.focus({ preventScroll: true })
          document.getElementById('application')?.scrollIntoView({ block: 'start' })
        }}>Apply Now</a></Button>
      </div>
    </section>

    <section className="careers-application" aria-labelledby="application-title">
      <div className="career-opportunities" data-reveal>
        <h2>Current Opportunities</h2>
        <ul>{opportunities.map(opportunity => <li key={opportunity}>{opportunity}</li>)}</ul>
        <p className="career-apply-note"><em>***Fill out the form to apply***</em></p>
      </div>
      <div id="application" className="application-form-wrap" data-reveal>
        <h2 id="application-title">Send an Application</h2>
        <form ref={applicationForm} className="application-form" action={`https://formsubmit.co/${applicationEmail}`} method="POST" encType="multipart/form-data" onSubmit={sendApplication} onChange={clearFeedback} aria-busy={sending}>
          <fieldset>
            <legend className="sr-only">Your application details</legend>
            <div className="application-fields">
              <label htmlFor="application-first-name">First name *<Input ref={firstName} id="application-first-name" name="firstName" autoComplete="given-name" placeholder="First name" required maxLength={100} /></label>
              <label htmlFor="application-last-name">Last name *<Input id="application-last-name" name="lastName" autoComplete="family-name" placeholder="Last name" required maxLength={100} /></label>
              <label htmlFor="application-email">Email *<Input id="application-email" name="email" type="email" autoComplete="email" placeholder="Email" required maxLength={254} /></label>
              <CareerPhoneField onChange={clearFeedback} />
              <label className="application-message" htmlFor="application-message">Message (optional)<textarea id="application-message" name="message" placeholder="Message" rows={4} maxLength={5000} /></label>
              <div className="application-resume">
                <label id="resume-label" htmlFor="application-resume">File upload *</label>
                <div className="resume-upload">
                  <span className="careers-action">Upload Your Resume</span>
                  <input id="application-resume" name="attachment" type="file" required accept=".pdf,.doc,.docx" aria-labelledby="resume-label" aria-describedby={`resume-hint resume-filename${fileError ? ' resume-error' : ''}`} aria-invalid={fileError ? true : undefined} onInvalid={() => { if (!filename) setFileError('Please select your resume.') }} onChange={event => {
                    const file = event.currentTarget.files?.[0]
                    const validation = resumeError(file)
                    event.currentTarget.setCustomValidity(validation)
                    setFilename(file?.name ?? '')
                    setFileError(validation)
                  }} />
                </div>
                <p id="resume-hint" className="sr-only">PDF, DOC or DOCX. Maximum 10 MB.</p>
                <p id="resume-filename" className={filename ? 'resume-filename' : 'sr-only'} role="status">{filename}</p>
                {fileError && <p id="resume-error" className="form-error" role="alert">{fileError}</p>}
              </div>
            </div>
            <Button className="careers-action application-submit" type="submit" disabled={sending}>{sending ? 'Sending…' : 'Submit'}</Button>
          </fieldset>
          {sent && <p className="application-feedback" role="status">Your application has been submitted. Thank you for applying.</p>}
        </form>
      </div>
    </section>
  </>
}
