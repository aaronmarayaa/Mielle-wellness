import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowRight, Menu, X } from 'lucide-react'
import { Button } from './components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './components/ui/dialog'
import { Input } from './components/ui/input'
import { BotanicalBackdrop, useBotanicalFade } from './components/BotanicalBackdrop'
import { HeroBackground } from './components/HeroBackground'
import { AboutPage } from './components/AboutPage'
import { ServicesPage } from './components/ServicesPage'
import { ServicesNav } from './components/ServicesNav'
import { SkinTreatmentPage } from './components/SkinTreatmentPage'
import { DirectBillingPage } from './components/DirectBillingPage'
import { PromosPage } from './components/PromosPage'
import { CareersPage } from './components/CareersPage'
import { applicationEmail } from './lib/applicationForm'
import { sendForm } from './lib/sendForm'

const SITE = 'https://www.miellewellness.ca'
const BOOKING = 'https://miellewellness.noterro.com/'
const EMAIL = 'miellewellness@gmail.com'
const MAP = 'https://www.google.com/maps/search/?api=1&query=Mielle+Wellness+1935+32+Ave+NE+Calgary'
const asset = (name: string) => `/assets/${name}`

const insurers = [
  ['0.png', 'Sun Life'], ['1.webp', 'Canada Life'], ['2.png', 'Alberta Blue Cross'],
  ['3.jpg', 'Manulife'], ['4.png', 'Co-operators'], ['5.webp', 'GroupHEALTH'],
  ['6.png', 'Equitable Life of Canada'], ['7.jpeg', 'CINUP'], ['8.png', 'NexgenRx'],
  ['9.png', 'Union Benefits'], ['10.png', 'UV Assurance'], ['11.png', 'RWAM'],
  ['12.png', 'People Corporation'], ['13.png', 'Maximum Benefit'], ['14.png', 'First Canadian Financial Group'],
  ['15.png', 'D.A. Townley'], ['16.webp', 'GroupSource'], ['17.png', 'Cowan'],
  ['18.png', 'Chambers of Commerce Group Insurance Plan'], ['19.png', 'Coughlin'], ['20.png', 'Canadian Construction Workers Union'],
  ['21.jpg', 'BPA'], ['22.png', 'Johnston Group'], ['23.png', 'Beneva'], ['24.png', 'Johnson'],
  ['pbas.png', 'The PBAS Group'], ['manitoba.svg', 'Manitoba Blue Cross'],
  ['ssq.gif', 'SSQ Insurance'], ['empire.png', 'Empire Life'], ['gsc.png', 'Green Shield Canada'],
  ['desjardins.svg', 'Desjardins'], ['claimsecure.png', 'ClaimSecure'],
]

const services = [
  {
    title: 'Massage Therapy', image: 'home-back-massage.jpg',
    alt: 'A massage therapist applying pressure to a client’s upper back',
    description: 'For the tension you’ve been carrying. Massage and cupping, with care shaped around how your body feels today.',
    detail: 'Relaxation massage · Cupping therapy',
  },
  {
    title: 'Facial Treatments', image: 'home-face-massage.jpg',
    alt: 'A therapist gently massaging a client’s face beside candles',
    description: 'A moment to rest while we care for your skin. Professional facials and a conversation about what your skin needs.',
    detail: 'Facials · Personalized skincare',
  },
  {
    title: 'Skin Treatments', image: 'home-skin-treatment.jpg',
    alt: 'A professional using a handheld skin treatment device with blue light',
    description: 'Thoughtful attention to your skin, including laser hair removal. We’ll talk through your needs before you choose a treatment.',
    detail: 'Skin care · Laser hair removal',
  },
]

const reviews = [
  '“The massage was amazing! My therapist took the time to understand my skin needs and customized everything perfectly. My complexion looks brighter and feels refreshed, Mielle Wellness truly cares about your body.”',
  '“I had a massage at Mielle Wellness and it was incredible! The therapist targeted all my tension spots, and I left feeling completely relaxed and rejuvenated. This is hands down the best massage experience in Calgary!”',
  '“I booked a Massage at Mielle Wellness, and it was pure bliss from start to finish! My body felt so relaxed after the session. Definitely my new go-to spot in Calgary!”',
]

function TextLink({ children, href, onClick, className = '' }: { children: React.ReactNode; href?: string; onClick?: () => void; className?: string }) {
  const content = <>{children}<ArrowRight aria-hidden="true" size={23} strokeWidth={1.2} /></>
  return href ? <a className={`text-link ${className}`} href={href}>{content}</a> : <button className={`text-link ${className}`} onClick={onClick}>{content}</button>
}

function ScrollOffer() {
  const offer = useRef<HTMLElement>(null)

  useEffect(() => {
    const home = document.getElementById('home')
    const element = offer.current
    const stage = element?.parentElement
    const hero = stage?.querySelector<HTMLElement>('.hero')
    const header = document.querySelector<HTMLElement>('.site-header')
    if (!home || !element || !stage || !hero || !header) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let inView = true
    let opacity = -1

    const update = () => {
      frame = 0
      const rect = home.getBoundingClientRect()
      const stageHeight = stage.offsetHeight
      // Reveal the offer before the next section starts covering the stage.
      const travel = Math.max(rect.height - stageHeight - window.innerHeight, 1)
      const progress = Math.max(0, Math.min(1, -rect.top / travel))

      const revealStart = .05
      const revealEnd = .16
      let next = 0

      if (reducedMotion.matches) {
        next = progress >= revealStart ? 1 : 0
      } else if (progress >= revealStart && progress < revealEnd) {
        next = (progress - revealStart) / (revealEnd - revealStart)
      } else if (progress >= revealEnd) {
        next = 1
      }

      next = Math.round(Math.max(0, Math.min(1, next)) * 1000) / 1000
      const covered = rect.bottom - stageHeight <= header.offsetHeight
      if (next === opacity && stage.inert === covered) return
      if (next !== opacity) element.style.setProperty('--offer-opacity', String(next))
      opacity = next
      const visible = next > .025 && !covered
      element.classList.toggle('is-visible', visible)
      element.setAttribute('aria-hidden', String(!visible))
      hero.inert = visible || covered
      stage.inert = covered
      stage.classList.toggle('is-covered', covered)
    }
    const schedule = () => { if (inView && !frame) frame = window.requestAnimationFrame(update) }
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      if (!frame) frame = window.requestAnimationFrame(update)
    }) : undefined

    update()
    observer?.observe(home)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    reducedMotion.addEventListener('change', schedule)
    return () => {
      window.cancelAnimationFrame(frame)
      observer?.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      reducedMotion.removeEventListener('change', schedule)
    }
  }, [])

  return <aside
    ref={offer}
    className="scroll-offer"
    aria-hidden="true"
  >
    <div className="scroll-offer-content">
      <h2>EXCLUSIVE OFFER</h2>
      <h1>10% Off Your First<br />Appointment</h1>
      <img className="scroll-offer-logo" src={asset('logo-full.png')} alt="Mielle Wellness" />
      <a className="scroll-offer-cta" href="/services">Book your appointment now <ArrowRight aria-hidden="true" size={22} strokeWidth={1.15} /></a>
    </div>
  </aside>
}

function App() {
  const currentPath = window.location.pathname.replace(/\/$/, '')
  const isAboutPage = currentPath === '/about'
  const isServicesPage = currentPath === '/services'
  const isInClinicPage = currentPath === '/in-clinic'
  const isMobileServicePage = currentPath === '/mobile-service'
  const isSkinTreatmentPage = currentPath === '/skin-treatment'
  const isDirectBillingPage = currentPath === '/direct-billing'
  const isPromosPage = currentPath === '/promos'
  const isCareersPage = currentPath === '/careers'
  const isInnerPage = isAboutPage || isServicesPage || isInClinicPage || isMobileServicePage || isSkinTreatmentPage || isDirectBillingPage || isPromosPage || isCareersPage
  useBotanicalFade()
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [booking, setBooking] = useState<string | null>(null)
  const [insuranceOpen, setInsuranceOpen] = useState(false)
  const [reviewIndex, setReviewIndex] = useState(0)
  const [messageSending, setMessageSending] = useState(false)
  const [messageSent, setMessageSent] = useState(false)
  const [messageError, setMessageError] = useState('')
  const menuButton = useRef<HTMLButtonElement>(null)
  const bookingOrigin = useRef<HTMLElement | null>(null)

  useEffect(() => {
    document.title = isAboutPage ? 'About | Mielle Wellness' : isInClinicPage ? 'In-Clinic Services | Mielle Wellness' : isMobileServicePage ? 'Mobile Services | Mielle Wellness' : isSkinTreatmentPage ? 'Skin Treatment | Mielle Wellness' : isDirectBillingPage ? 'Direct Billing | Mielle Wellness' : isPromosPage ? 'Promos | Mielle Wellness' : isCareersPage ? 'Careers | Mielle Wellness' : isServicesPage ? 'Services | Mielle Wellness' : 'Mielle Wellness | Enhance Wellness, Embrace Life'
  }, [isAboutPage, isServicesPage, isInClinicPage, isMobileServicePage, isSkinTreatmentPage, isDirectBillingPage, isPromosPage, isCareersPage])

  useEffect(() => {
    const fragment = window.location.hash
    if (!fragment) return
    let cancelled = false
    document.fonts.ready.then(() => {
      if (!cancelled && window.location.hash === fragment) document.getElementById(fragment.slice(1))?.scrollIntoView({ block: 'start' })
    })
    return () => { cancelled = true }
  }, [currentPath])

  useEffect(() => {
    if (isInnerPage) {
      setScrolled(true)
      return
    }
    const sections = [...document.querySelectorAll<HTMLElement>('main [data-nav]')]
    const stage = document.querySelector<HTMLElement>('.home-stage')
    let frame = 0
    let previousScrolled = false
    let previousSection = 'home'
    const update = () => {
      frame = 0
      const bounds = sections.map(section => section.getBoundingClientRect())
      const homeBounds = bounds[0]
      const nextScrolled = (homeBounds?.bottom || 0) - (stage?.offsetHeight || 0) <= window.innerHeight
      const nextSection = sections.filter((_, index) => bounds[index].top < window.innerHeight * .35).at(-1)?.id || 'home'
      if (nextScrolled !== previousScrolled) {
        previousScrolled = nextScrolled
        setScrolled(nextScrolled)
      }
      if (nextSection !== previousSection) {
        previousSection = nextSection
        setActiveSection(nextSection)
      }
    }
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [isInnerPage])

  useEffect(() => {
    const elements = [...document.querySelectorAll<HTMLElement>('[data-reveal]')]
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    let observer: IntersectionObserver | undefined
    let serviceObserver: IntersectionObserver | undefined
    const configure = () => {
      observer?.disconnect()
      serviceObserver?.disconnect()
      elements.forEach(element => element.classList.remove('reveal-ready', 'is-revealed'))
      if (preference.matches || !('IntersectionObserver' in window)) return
      const reveal = (entries: IntersectionObserverEntry[], currentObserver: IntersectionObserver) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed')
            currentObserver.unobserve(entry.target)
          }
        })
      }
      observer = new IntersectionObserver(reveal, { threshold: .1, rootMargin: '0px 0px -40px 0px' })
      serviceObserver = new IntersectionObserver(reveal, { threshold: 0, rootMargin: '0px 0px -24px 0px' })
      elements.forEach(element => {
        element.classList.add('reveal-ready')
        const currentObserver = element.closest('.services-section') ? serviceObserver : observer
        currentObserver?.observe(element)
      })
    }
    configure()
    preference.addEventListener('change', configure)
    return () => {
      observer?.disconnect()
      serviceObserver?.disconnect()
      preference.removeEventListener('change', configure)
      elements.forEach(element => element.classList.remove('reveal-ready', 'is-revealed'))
    }
  }, [])

  useEffect(() => {
    const closeMenu = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menuOpen) {
        setMenuOpen(false)
        menuButton.current?.focus()
      }
    }
    const fitNavigation = () => { if (window.innerWidth >= 1280) setMenuOpen(false) }
    window.addEventListener('keydown', closeMenu)
    window.addEventListener('resize', fitNavigation)
    return () => {
      window.removeEventListener('keydown', closeMenu)
      window.removeEventListener('resize', fitNavigation)
    }
  }, [menuOpen])

  function openBooking(kind = 'Book an appointment') {
    bookingOrigin.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setMenuOpen(false)
    setBooking(kind)
  }

  function clearMessageFeedback() {
    setMessageSent(false)
    setMessageError('')
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    clearMessageFeedback()
    setMessageSending(true)
    try {
      await sendForm(data)
      form.reset()
      setMessageSent(true)
    } catch (error) {
      setMessageError(error instanceof Error ? error.message : 'We could not send your message. Please try again.')
    } finally {
      setMessageSending(false)
    }
  }

  const homeHref = (section: string) => isInnerPage ? `/#${section}` : `#${section}`
  const contactHref = homeHref('contact')
  const nav = <>
    <a href={homeHref('home')} aria-current={!isInnerPage && activeSection === 'home' ? 'location' : undefined} onClick={() => setMenuOpen(false)}>HOME</a>
    <a href="/about" aria-current={isAboutPage ? 'page' : undefined} onClick={() => setMenuOpen(false)}>ABOUT</a>
    <ServicesNav currentPath={currentPath} onNavigate={() => setMenuOpen(false)} />
    <a href="/direct-billing" aria-current={isDirectBillingPage ? 'page' : undefined} onClick={() => setMenuOpen(false)}>DIRECT BILLING</a>
    <a href="/promos" aria-current={isPromosPage ? 'page' : undefined} onClick={() => setMenuOpen(false)}>PROMOS</a>
    <a href="/careers" aria-current={isCareersPage ? 'page' : undefined} onClick={() => setMenuOpen(false)}>CAREERS</a>
    <a href={contactHref} aria-current={!isInnerPage && activeSection === 'contact' ? 'location' : undefined} onClick={() => setMenuOpen(false)}>CONTACT</a>
  </>

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <header className={`site-header ${isInnerPage ? 'about-header' : ''} ${isInnerPage || scrolled || menuOpen ? 'is-solid' : ''}`}>
        <a href={homeHref('home')} className="header-logo" aria-label="Mielle Wellness home"><img src={asset('logo-mark.png')} alt="" width="140" height="117" /></a>
        <nav className="desktop-nav" aria-label="Main navigation">{nav}</nav>
        <Button className="header-booking" asChild><a href={BOOKING} target="_blank" rel="noreferrer">BOOK APPOINTMENT</a></Button>
        <Button ref={menuButton} variant="ghost" className="menu-button" aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? 'Close' : 'Menu'}
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </Button>
        {menuOpen && <><button className="menu-backdrop" tabIndex={-1} aria-label="Close navigation" onClick={() => { setMenuOpen(false); menuButton.current?.focus() }} /><nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">{nav}<a href={BOOKING} target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)}>BOOK APPOINTMENT</a></nav></>}
      </header>

      <main id="main" className={isInnerPage ? `inner-page ${isAboutPage ? 'about-page' : isPromosPage ? 'promos-page' : isCareersPage ? 'careers-page' : 'services-page'}` : undefined} tabIndex={-1} inert={menuOpen}>
        {isAboutPage ? <AboutPage /> : isSkinTreatmentPage ? <SkinTreatmentPage /> : isDirectBillingPage ? <DirectBillingPage insurers={insurers} /> : isPromosPage ? <PromosPage /> : isCareersPage ? <CareersPage /> : isServicesPage || isInClinicPage || isMobileServicePage ? <ServicesPage onBook={openBooking} variant={isInClinicPage ? 'in-clinic' : isMobileServicePage ? 'mobile' : 'overview'} /> : <>
        <div id="home" className="home-cover" data-nav>
          <div className="home-stage">
          <section className="hero">
            <HeroBackground />
            <div className="hero-content">
              <h1 className="hero-brand"><span className="sr-only">Mielle Wellness. Massage, facials, and skincare in Calgary.</span><img src={asset('logo-full.png')} alt="" width="600" height="542" /></h1>
              <p className="hero-description">Massage, professional facials, and skin treatments designed around how you feel today. Visit our Calgary clinic, or let massage come to you.</p>
              <div className="hero-actions">
                <Button size="lg" asChild><a href="/in-clinic">Book In-Clinic <ArrowRight aria-hidden="true" size={20} strokeWidth={1.4} /></a></Button>
                <Button variant="outline" size="lg" asChild><a href="/mobile-service">Book Mobile <ArrowRight aria-hidden="true" size={20} strokeWidth={1.4} /></a></Button>
                <Button variant="outline" size="lg" asChild><a href="/skin-treatment">Skin Treatment <ArrowRight aria-hidden="true" size={20} strokeWidth={1.4} /></a></Button>
              </div>
            </div>
          </section>
          <ScrollOffer />
          </div>
        </div>

        <section id="booking-options" className="booking-section botanical-section">
          <BotanicalBackdrop side="right" />
          <div className="booking-intro section-intro" data-reveal>
            <div><p className="eyebrow">A NOTE FROM MIELLE</p><h2>Come in. Exhale.<br /><em>Stay awhile.</em></h2></div>
            <div className="booking-note"><h3>Direct Billing</h3><p>We’re excited to announce that our mobile and in-clinic massage services are now available in one easy booking system! Whether you prefer to visit us or enjoy treatment in the comfort of your home, booking your self-care is now simpler, faster, and more convenient than ever.</p></div>
          </div>
          <div className="booking-panels">
            <article className="booking-panel" data-reveal>
              <img src={asset('home-facial-towels.jpg')} alt="White spa towels and candles beside a lantern and green foliage" width="5384" height="3589" loading="lazy" />
              <div className="booking-panel-content"><p className="eyebrow">01 / WE COME TO YOU</p><h3>In your own space.</h3><p>Prefer to stay home? Our mobile massage service brings care to familiar surroundings.</p><TextLink href="/mobile-service">Book Mobile</TextLink></div>
            </article>
            <article className="booking-panel" data-reveal>
              <img src={asset('home-massage-towels.jpg')} alt="Rolled gray towels, massage oil and candles in a spa setting" width="5472" height="3648" loading="lazy" />
              <div className="booking-panel-content"><p className="eyebrow">02 / HERE IN CALGARY</p><h3>A little change of pace.</h3><p>Step into our clinic for massage, facials, and skin treatments. We’ll take it from here.</p><TextLink href="/in-clinic">Book In-Clinic</TextLink></div>
            </article>
          </div>
        </section>

        <section id="about" className="about-section botanical-section" data-nav>
          <BotanicalBackdrop side="right" />
          <img src={asset('about.png')} alt="The gold Mielle Wellness emblem mounted on a marble wall" width="900" height="982" loading="lazy" />
          <div className="about-content" data-reveal><p className="eyebrow">ABOUT MIELLE WELLNESS</p><h2>Care is<br /><em>personal.</em></h2><p className="about-description">A massage for a tired body. Time spent listening to your skin concerns. Mielle is a place for those small, meaningful acts of care, with treatments chosen together.</p><p className="about-location">Our Calgary clinic</p><TextLink href="/about">Read more</TextLink></div>
        </section>

        <section id="services" className="services-section botanical-section" data-nav>
          <BotanicalBackdrop dense />
          <div className="section-intro services-intro" data-reveal><div><p className="eyebrow">THE TREATMENT MENU</p><h2>Body. Skin.<br /><em>A little breathing room.</em></h2></div><p>Start with what you need today.<br />We’ll help with the rest.</p></div>
          <div className="service-list">{services.map((service, index) => <article className="service-row" key={service.image} data-reveal>
            <div className="service-image-wrap"><img className="service-image" src={asset(service.image)} alt={service.alt} loading="lazy" /></div>
            <div className="service-content"><p className="service-number">0{index + 1}</p><h3>{service.title}</h3><p>{service.description}</p><p className="service-detail">{service.detail}</p><TextLink href="/in-clinic">Book now</TextLink></div>
          </article>)}</div>
        </section>

        <section id="direct-billing" className="billing-section" data-nav>
          <div className="section-intro" data-reveal><div><p className="eyebrow">THE PRACTICAL DETAILS</p><h2>Less paperwork.<br />More time for you.</h2></div><div className="billing-copy"><p>We offer direct billing for eligible insurance plans. Ask us about your coverage before your visit.</p><TextLink href="/direct-billing">See All</TextLink></div></div>
          <div className="insurance-carousel" role="region" aria-label="Direct Billing">
            <div className="insurance-track">
              {[0, 1].map(copy => <div className="insurance-group" key={copy} aria-hidden={copy === 1 ? true : undefined}>
                {insurers.map(([file, name]) => <div className="insurance-logo" key={file}><img src={asset(`insurer-${file}`)} alt={copy === 0 ? name : ''} loading="lazy" /></div>)}
              </div>)}
            </div>
          </div>
        </section>

        <section className="interior-section" aria-label="A calm treatment-room setting"><img src={asset('home-treatment-room.jpg')} alt="An amber-lit treatment room with a massage table, lamps and candles" width="6067" height="3467" loading="lazy" data-reveal /></section>

        <section id="reviews" className="reviews-section" aria-labelledby="reviews-title">
          <div className="reviews-top"><h2 id="reviews-title">WHAT CLIENTS SAY</h2><div className="review-controls">
            <Button variant="outline" className="review-arrow" aria-label="Previous review" onClick={() => setReviewIndex(index => (index + reviews.length - 1) % reviews.length)}><ArrowLeft size={25} strokeWidth={1.2} aria-hidden="true" /></Button>
            <Button variant="outline" className="review-arrow" aria-label="Next review" onClick={() => setReviewIndex(index => (index + 1) % reviews.length)}><ArrowRight size={25} strokeWidth={1.2} aria-hidden="true" /></Button>
          </div></div>
          <div className="review-stars" role="img" aria-label="5 out of 5 stars">{Array.from({ length: 5 }, (_, index) => <span key={index} aria-hidden="true">★</span>)}</div>
          <div className="review-stage" aria-live="polite" aria-atomic="true">{reviews.map((review, index) => <blockquote key={review} aria-hidden={index !== reviewIndex}>{review}</blockquote>)}</div>
        </section>

        </>}
        {!isInnerPage && <section id="contact" className="contact-section" data-nav>
          <div className="contact-heading" data-reveal><h2 className="contact-kicker">YOUR NEXT VISIT</h2><h1>We’re here.</h1><p>For a question, a conversation,<br />or a little time for yourself.</p></div>
          <div className="contact-grid">
            <div className="contact-info">
              <h3>Visit Mielle.</h3><p className="contact-intro">Call us about a treatment or leave a message below. We’d love to hear from you.</p>
              <address><a className="contact-phone" href="tel:+18254078617">(825) 407-8617</a><a href={MAP} target="_blank" rel="noreferrer">Suite 134 - 1935 - 32 Ave. NE<br />Calgary, AB, T2E 7C8</a></address>
              <div className="arrival-info"><a href={MAP} target="_blank" rel="noreferrer" className="map-link" aria-label="Open directions to Mielle Wellness in Google Maps"><img src={asset('map.png')} alt="Map showing the Mielle Wellness entrance at the back of the building off 32 Avenue NE" width="441" height="488" loading="lazy" /></a><p className="directions">Enter through the back of the building, by the large parking lot. Refer to the map or call us if you need a hand finding the entrance.</p></div>
            </div>
            <div className="contact-form-wrap"><h3>Leave us a message.</h3><p className="form-intro">Tell us how we can help.</p>
              <form className="contact-form" onSubmit={sendMessage} onChange={clearMessageFeedback} aria-busy={messageSending}>
                <label htmlFor="first-name">First name *<Input id="first-name" name="firstName" autoComplete="given-name" required maxLength={100} disabled={messageSending} /></label>
                <label htmlFor="last-name">Last name<Input id="last-name" name="lastName" autoComplete="family-name" maxLength={100} disabled={messageSending} /></label>
                <label htmlFor="contact-email">Email *<Input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} disabled={messageSending} /></label>
                <label htmlFor="message">Message *<textarea id="message" name="message" rows={4} required maxLength={5000} disabled={messageSending} /></label>
                <Button type="submit" variant={isInnerPage ? 'light' : 'default'} className="send-button" disabled={messageSending}>{messageSending ? 'Sending…' : 'SEND'} <ArrowRight size={20} aria-hidden="true" /></Button>
                {messageSent && <p className="form-feedback" role="status">Your message has been submitted. Thank you for contacting us.</p>}
                {messageError && <p className="form-feedback form-error" role="alert">{messageError} <a className="underline-link" href={`mailto:${applicationEmail}`}>{applicationEmail}</a></p>}
              </form>
            </div>
          </div>
        </section>}

      </main>


      <footer className="site-footer" inert={menuOpen}>
        <p className="footer-wordmark">Mielle Wellness</p>
        <div className="footer-grid">
          <nav className="footer-navigation" aria-label="Footer navigation"><a href={homeHref('home')}>Home</a><a href="/services">Services</a><a href={BOOKING} target="_blank" rel="noreferrer">Booking</a><a href="/#reviews">Reviews</a><a href={contactHref}>Contact</a></nav>
          <div className="footer-social"><a href="https://www.instagram.com/miellewellness/" target="_blank" rel="noreferrer">Instagram</a><a href="https://www.facebook.com/miellewellness" target="_blank" rel="noreferrer">Facebook</a><a href="https://www.tiktok.com/@mielle.wellness" target="_blank" rel="noreferrer">TikTok</a></div>
          <address className="footer-contact"><a href="tel:+18254078617">(825) 407-8617</a><a href={`mailto:${EMAIL}`}>{EMAIL}</a><a href={MAP} target="_blank" rel="noreferrer">Suite 134 - 1935 - 32 Ave. NE<br /><span>Calgary, AB, T2E 7C8</span></a></address>
        </div>
        <p className="copyright">© {new Date().getFullYear()} Mielle Wellness.<span>Powered by <a href="http://www.ascendlogix.com" target="_blank" rel="noreferrer">Ascend Logix</a></span></p>
      </footer>

      <Dialog open={booking !== null} onOpenChange={(open) => { if (!open) setBooking(null) }}><DialogContent className="booking-dialog" onCloseAutoFocus={event => {
        const origin = bookingOrigin.current
        if (origin?.isConnected) {
          event.preventDefault()
          origin.focus({ preventScroll: true })
        }
      }}><DialogTitle className="dialog-title">{booking}</DialogTitle><DialogDescription>Choose where you’d like to enjoy your treatment.</DialogDescription><div className="booking-dialog-options"><Button asChild size="lg"><a href={BOOKING} target="_blank" rel="noreferrer">Book In-Clinic <ArrowRight size={21} /></a></Button><Button asChild size="lg"><a href={`${SITE}/mobile-service`} target="_blank" rel="noreferrer">Book Mobile <ArrowRight size={21} /></a></Button><Button asChild variant="outline" size="lg"><a href={`${SITE}/skin-treatment`} target="_blank" rel="noreferrer">Skin Treatment <ArrowRight size={21} /></a></Button></div><p className="dialog-footnote">Questions before booking? <a href="tel:+18254078617">Call (825) 407-8617</a></p></DialogContent></Dialog>
      <Dialog open={insuranceOpen} onOpenChange={setInsuranceOpen}><DialogContent className="insurance-dialog"><DialogTitle className="dialog-title">Direct Billing</DialogTitle><DialogDescription>Eligible insurance providers. Please contact us to confirm coverage with your plan.</DialogDescription><div className="all-insurers">{insurers.map(([file, name]) => <img key={file} src={asset(`insurer-${file}`)} alt={name} loading="lazy" />)}</div><a className="text-link" href="tel:+18254078617">Confirm your coverage <ArrowRight size={22} /></a></DialogContent></Dialog>
    </>
  )
}

export default App
