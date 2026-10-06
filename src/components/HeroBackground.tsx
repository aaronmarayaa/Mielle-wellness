import { useEffect, useRef, useState } from 'react'

export function HeroBackground() {
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [failed, setFailed] = useState(false)
  const video = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(preference.matches)
    preference.addEventListener('change', update)
    return () => preference.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const element = video.current
    if (!element) return
    let inView = true
    const updatePlayback = () => {
      if (inView && !document.hidden) void element.play().catch(() => {})
      else element.pause()
    }
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      updatePlayback()
    }) : undefined
    observer?.observe(element)
    document.addEventListener('visibilitychange', updatePlayback)
    updatePlayback()
    return () => {
      observer?.disconnect()
      document.removeEventListener('visibilitychange', updatePlayback)
      element.pause()
    }
  }, [reducedMotion, failed])

  if (reducedMotion || failed) {
    return <img className="hero-background" src="/assets/home-1006-poster.jpg" alt="" aria-hidden="true" fetchPriority="high" />
  }

  return <video
    ref={video}
    className="hero-background"
    src="/assets/home-1006.mp4"
    poster="/assets/home-1006-poster.jpg"
    autoPlay
    muted
    loop
    playsInline
    preload="metadata"
    aria-hidden="true"
    onError={() => setFailed(true)}
  />
}
