import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

export function ServicesNav({ currentPath, onNavigate }: { currentPath: string; onNavigate: () => void }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const toggle = useRef<HTMLButtonElement>(null)
  const submenuId = useId()

  useEffect(() => {
    if (!open) return
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false)
    }
    const closeOnResize = () => setOpen(false)
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    window.addEventListener('resize', closeOnResize)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
      window.removeEventListener('resize', closeOnResize)
    }
  }, [open])

  return <div ref={root} className="services-navigation" data-active={['/in-clinic', '/mobile-service'].includes(currentPath) || undefined}
    onPointerEnter={event => { if (event.pointerType === 'mouse') setOpen(true) }}
    onPointerLeave={event => { if (!event.currentTarget.contains(document.activeElement)) setOpen(false) }}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false) }}
    onKeyDown={event => {
      if (event.key === 'Escape' && open) {
        event.preventDefault()
        event.stopPropagation()
        setOpen(false)
        toggle.current?.focus()
      }
      if (event.key === 'ArrowDown' && event.target instanceof HTMLElement && event.target.closest('.services-nav-row')) {
        event.preventDefault()
        setOpen(true)
        requestAnimationFrame(() => root.current?.querySelector<HTMLAnchorElement>('.services-submenu a')?.focus())
      }
    }}>
    <div className="services-nav-row">
      <a href="/services" aria-current={currentPath === '/services' ? 'page' : undefined} onClick={onNavigate}>SERVICES</a>
      <button ref={toggle} className="services-nav-toggle" type="button" aria-label="Service options" aria-expanded={open} aria-controls={submenuId} onClick={() => setOpen(value => !value)}>
        <ChevronDown size={15} strokeWidth={1.4} aria-hidden="true" />
      </button>
    </div>
    <ul id={submenuId} className="services-submenu" hidden={!open}>
      <li><a href="/in-clinic" aria-current={currentPath === '/in-clinic' ? 'page' : undefined} onClick={onNavigate}>In-Clinic Services</a></li>
      <li><a href="/mobile-service" aria-current={currentPath === '/mobile-service' ? 'page' : undefined} onClick={onNavigate}>Mobile Services</a></li>
      <li><a href="https://www.miellewellness.ca/skin-treatment" onClick={onNavigate}>Skin Treatment</a></li>
    </ul>
  </div>
}
