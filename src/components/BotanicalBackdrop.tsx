import { useEffect } from 'react'

export function useBotanicalFade() {
  useEffect(() => {
    const sections = [...document.querySelectorAll<HTMLElement>('.botanical-section')]
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    let observer: IntersectionObserver | undefined
    const observeCenter = () => {
      observer?.disconnect()
      const margin = Math.round(window.innerHeight * .45)
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('botanical-visible')
            observer?.unobserve(entry.target)
          }
        })
      }, { rootMargin: `-${margin}px 0px -${margin}px 0px`, threshold: 0 })
      sections.filter(section => !section.classList.contains('botanical-visible')).forEach(section => observer?.observe(section))
    }
    const configure = () => {
      observer?.disconnect()
      observer = undefined
      sections.forEach(section => section.classList.remove('botanical-ready', 'botanical-visible'))
      if (preference.matches || !('IntersectionObserver' in window)) return
      sections.forEach(section => section.classList.add('botanical-ready'))
      observeCenter()
    }
    const resize = () => { if (observer) observeCenter() }
    configure()
    preference.addEventListener('change', configure)
    window.addEventListener('resize', resize)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', resize)
      preference.removeEventListener('change', configure)
      sections.forEach(section => section.classList.remove('botanical-ready', 'botanical-visible'))
    }
  }, [])
}

export function BotanicalBackdrop({ side = 'left', dense = false }: { side?: 'left' | 'right'; dense?: boolean }) {
  return <div className={`botanical-backdrop botanical-from-${side}`} aria-hidden="true">
    <img className="botanical-art botanical-art-primary" src="/assets/botanical-leaf.png" alt="" />
    <img className="botanical-art botanical-art-secondary" src="/assets/botanical-leaf.png" alt="" />
    {dense && <>
      <img className="botanical-art botanical-art-canopy" src="/assets/botanical-leaf.png" alt="" />
      <img className="botanical-art botanical-art-middle" src="/assets/botanical-leaf.png" alt="" />
    </>}
  </div>
}
