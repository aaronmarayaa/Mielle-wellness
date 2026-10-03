import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'

export function HeroBackground() {
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [failed, setFailed] = useState(false)
  const [paused, setPaused] = useState(true)
  const video = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(preference.matches)
    preference.addEventListener('change', update)
    return () => preference.removeEventListener('change', update)
  }, [])

  if (reducedMotion || failed) {
    return <img className="hero-background" src="/assets/hero-video-poster.jpg" alt="" aria-hidden="true" fetchPriority="high" />
  }

  const togglePlayback = () => {
    if (!video.current) return
    if (video.current.paused) video.current.play().catch(() => setPaused(true))
    else video.current.pause()
  }

  return <>
    <video ref={video} className="hero-background" src="/assets/hero-video.mp4" poster="/assets/hero-video-poster.jpg" autoPlay muted loop playsInline preload="metadata" aria-hidden="true" onPlay={() => setPaused(false)} onPause={() => setPaused(true)} onError={() => setFailed(true)} />
    <button className="hero-video-control" onClick={togglePlayback} aria-label={paused ? 'Play background video' : 'Pause background video'} title={paused ? 'Play background video' : 'Pause background video'}>
      {paused ? <Play size={18} strokeWidth={1.5} aria-hidden="true" /> : <Pause size={18} strokeWidth={1.5} aria-hidden="true" />}
    </button>
  </>
}
