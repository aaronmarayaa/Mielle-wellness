import { useEffect, useRef } from 'react'
import { ArrowRight } from 'lucide-react'

const photographs = [
  { file: 'detail-reception.jpg', alt: 'Soft light across the reception seating and wooden desk' },
  { file: 'detail-facial.jpg', alt: 'Hands gently supporting a client’s face during a facial massage' },
  { file: 'detail-leaves.jpg', alt: 'Leaf shadows falling across a softly lit wall' },
]

export function RenewalSection() {
  const section = useRef<HTMLElement>(null)
  const scrollArea = useRef<HTMLDivElement>(null)
  const gallery = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = gallery.current
    const area = scrollArea.current
    const container = section.current
    if (!element || !area || !container) return
    const photographs = [...element.querySelectorAll<HTMLElement>('.renewal-photo')]
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0

    const update = () => {
      frame = 0
      const headerHeight = document.querySelector<HTMLElement>('.site-header')?.offsetHeight || 0
      const bounds = area.getBoundingClientRect()
      const scrollDistance = Math.max(1, bounds.height - element.getBoundingClientRect().height - 80)
      const progress = (headerHeight + 16 - bounds.top) / scrollDistance
      const rightProgress = progress * 2.5
      const positions = [rightProgress / 2 - .25, rightProgress / 2, rightProgress]
      photographs.forEach((photograph, index) => {
        const step = preference.matches ? 1 : Math.min(1, Math.max(0, positions[index]))
        photograph.style.setProperty('--image-progress', String(step))
      })
    }
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update) }
    const configure = () => {
      window.removeEventListener('scroll', schedule)
      container.classList.toggle('renewal-scroll-ready', !preference.matches)
      if (!preference.matches) window.addEventListener('scroll', schedule, { passive: true })
      schedule()
    }
    configure()
    window.addEventListener('resize', schedule)
    preference.addEventListener('change', configure)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      preference.removeEventListener('change', configure)
      container.classList.remove('renewal-scroll-ready')
    }
  }, [])

  return <section className="renewal-section" ref={section} aria-labelledby="renewal-title">
    <div className="renewal-copy">
      <p className="renewal-label">Mielle Wellness</p>
      <h2 id="renewal-title">Immerse yourself in the art of renewal with Mielle Wellness. Experience radiant skin, restorative massage, and professional wellness treatments brought together in perfect harmony.</h2>
      <a className="text-link" href="#services">See Services <ArrowRight size={23} strokeWidth={1.2} aria-hidden="true" /></a>
    </div>
    <div className="renewal-scroll" ref={scrollArea}>
      <div className="renewal-gallery" ref={gallery}>
        {photographs.map(photograph => <figure className="renewal-photo" key={photograph.file}>
          <img src={`/assets/${photograph.file}`} alt={photograph.alt} loading="lazy" />
        </figure>)}
      </div>
    </div>
  </section>
}
