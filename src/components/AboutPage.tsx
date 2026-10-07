import { useEffect } from 'react'

const team = [
  { name: 'Michelle Paningbatan', role: 'Registered Massage Therapist', image: 'team-michelle.jpg' },
  { name: 'Ramin Hans', role: 'Certified & Licensed Aesthetician', image: 'team-ramin.jpg' },
  { name: 'Tiegsti Berhe', role: 'Registered Massage Therapist', image: 'team-tiegsti.jpg' },
  { name: 'Kalena Lewandowski', role: 'Registered Massage Therapist', image: 'team-kalena.jpg' },
  { name: 'Raine Canlas', role: 'Registered Massage Therapist', image: 'team-raine.png' },
]

const differences = [
  {
    title: '1. An Exceptional Team of Experts',
    description: 'At Mielle Wellness, our team is made up of highly trained massage therapists dedicated to providing exceptional care. We take the time to understand your individual goals and tailor each massage to your specific needs. Whether you’re seeking deep relaxation, relief from muscle tension, or overall wellness, our therapists ensure that every visit is a personalized and rejuvenating experience from start to finish.',
  },
  {
    title: '2. The Latest Treatments and Technology',
    description: 'We combine the art of touch with the science of modern wellness. Our treatments use advanced massage techniques to deliver the best possible results safely and effectively. From relaxing massages that calm the mind to therapeutic treatments that relieve muscle tension and improve circulation, every service is designed to promote balance, relaxation, and overall well-being.',
  },
  {
    title: '3. Proven Results',
    description: 'Our clients return not only for the deep relaxation but also for the lasting wellness benefits. We pride ourselves on delivering results you can truly feel, relieved muscle tension, reduced stress, improved circulation, and a renewed sense of balance. At Mielle Wellness, every massage is more than just a service; it’s a calming experience designed to restore the body, relax the mind, and support your overall well-being.',
  },
]

function BotanicalShape({ variant }: { variant: number }) {
  return <svg className={`about-botanical about-botanical-${variant}`} viewBox="0 0 500 360" aria-hidden="true" focusable="false">
    {variant === 0 ? <>
      <path d="M72 129C109 115 140 147 141 172C142 195 119 206 85 205C47 204 41 174 52 151Z" />
      <path d="M142 309L152 287L226 273L247 250L267 192L261 108L273 62L311 30L341 33L347 44L332 78L336 128L327 174L301 232Q296 251 309 251L324 232L339 206L350 141L376 93L406 76L440 84L458 95L482 89L499 107L481 132L438 158L405 183L366 231L339 253L284 259L258 270L162 315Q142 320 142 309Z" />
    </> : variant === 1 ? <>
      <path d="M44 128L106 36Q121 18 130 25Q135 33 119 45L102 65Q87 86 107 86L169 69L189 62L221 64L250 85L260 99L238 114L181 138L129 125L96 102L62 144Q48 151 44 128Z" />
      <path d="M236 249L221 210L225 180L235 151L250 171L273 218Q284 232 290 220L282 199L261 161L259 119L275 123L314 155L346 194L365 227L369 166L388 143L395 155L401 215L384 286L342 296L291 288L257 265L211 253L199 227L199 210L216 217L251 236L298 248Z" />
    </> : <>
      <path d="M61 196L48 169L47 141L54 111L62 91L74 88L81 67L100 61L108 45L128 42L137 28L157 31L171 24L187 29L201 39L201 58L187 91L179 121L180 151L201 183L228 208L258 238L282 278L293 319Q295 335 289 330L271 294L247 258L213 224Q197 203 169 198L141 198L110 205L74 223Z" />
      <path d="M414 136C435 123 454 139 459 162C469 192 444 196 428 190C405 192 396 175 406 152Z" />
    </>}
  </svg>
}

export function AboutPage() {
  useEffect(() => {
    const main = document.querySelector<HTMLElement>('.about-page')
    const cards = [...document.querySelectorAll<HTMLElement>('.about-difference')]
    const footer = document.querySelector<HTMLElement>('.site-footer')
    const header = document.querySelector<HTMLElement>('.site-header')
    if (!main || !footer || !header || cards.length !== 3) return
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let active = true
    let tops: number[] = []
    let progressValues: number[] = []

    const update = () => {
      frame = 0
      if (preference.matches) return
      const nextProgress = cards.map((_, index) => {
        const next = cards[index + 1] || footer
        const targetTop = tops[index + 1] ?? Math.max(header.offsetHeight, innerHeight - footer.offsetHeight)
        const progress = (innerHeight - next.getBoundingClientRect().top) / Math.max(1, innerHeight - targetTop)
        return Math.round(Math.max(0, Math.min(1, progress)) * 1000) / 1000
      })
      cards.forEach((card, index) => {
        if (nextProgress[index] === progressValues[index]) return
        card.style.setProperty('--herb-progress', String(nextProgress[index]))
      })
      progressValues = nextProgress
    }
    const schedule = () => { if (active && !frame) frame = requestAnimationFrame(update) }
    const configure = () => {
      window.removeEventListener('scroll', schedule)
      main.classList.toggle('about-stack-motion', !preference.matches)
      main.classList.add('about-stack-ready')
      cards.forEach(card => card.style.setProperty('--stack-top', '0px'))
      let top = header.offsetHeight
      tops = cards.map((card, index) => {
        card.style.setProperty('--stack-band-top', `${top}px`)
        card.style.setProperty('--stack-layer', String(index + 1))
        const offset = Math.min(top, innerHeight - card.offsetHeight)
        card.style.setProperty('--stack-top', `${offset}px`)
        const heading = card.querySelector('h2')!
        top += heading.getBoundingClientRect().bottom - card.getBoundingClientRect().top + 24
        return offset
      })
      cards.forEach(card => card.style.setProperty('--herb-progress', '0'))
      progressValues = cards.map(() => 0)
      if (!preference.matches) window.addEventListener('scroll', schedule, { passive: true })
      schedule()
    }
    configure()
    window.addEventListener('resize', configure)
    preference.addEventListener('change', configure)
    document.fonts.ready.then(() => { if (active) configure() })
    return () => {
      active = false
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', configure)
      preference.removeEventListener('change', configure)
      main.classList.remove('about-stack-ready', 'about-stack-motion')
      cards.forEach(card => {
        card.style.removeProperty('--herb-progress')
        card.style.removeProperty('--stack-top')
        card.style.removeProperty('--stack-band-top')
        card.style.removeProperty('--stack-layer')
      })
    }
  }, [])

  return <>
    <section className="about-page-intro" aria-labelledby="about-page-title">
      <div className="about-page-copy">
        <p className="eyebrow">MIELLE WELLNESS</p>
        <h1 id="about-page-title">Professional wellness, massage and skin treatments designed to relax, restore and renew</h1>
        <p>Welcome to Mielle Wellness, where relaxation, therapeutic care, and professional skin treatments come together to help you look and feel your best. Founded by a passionate team of professionals, we offer personalized massage, bodywork, facial, and skin treatments designed to relieve tension, restore balance, improve skin health, and support your overall well-being.</p>
        <p>What makes Mielle Wellness unique is our combination of professional care, modern techniques, advanced skincare technology, and a genuine passion for helping every client feel refreshed and confident. Our core values are care, integrity, quality and results are reflected in every treatment and experience we provide.</p>
      </div>
      <img className="about-page-emblem" src="/assets/about-portrait.png" alt="The gold Mielle Wellness emblem and Enhance Wellness, Embrace Life motto on a marble wall" width="720" height="861" fetchPriority="high" />
    </section>

    <section className="about-team" aria-labelledby="team-title">
      <h2 id="team-title">Our Team</h2>
      <div className="about-team-grid">{team.map(member => <article className="team-member" key={member.name}>
        <img src={`/assets/${member.image}`} alt={member.name} width="600" height="692" loading="lazy" />
        <h3>{member.name}</h3>
        <p>{member.role}</p>
      </article>)}</div>
    </section>

      {differences.map((difference, index) => <section className={`about-difference about-difference-${index}`} key={difference.title} aria-labelledby={`difference-title-${index}`}>
        {index === 0 && <p className="eyebrow">WHAT SETS US APART?</p>}
        <h2 id={`difference-title-${index}`}>{difference.title}</h2>
        <div className="about-difference-body"><p>{difference.description}</p><BotanicalShape variant={index} /></div>
      </section>)}
  </>
}

