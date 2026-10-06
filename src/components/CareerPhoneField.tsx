import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js/min'

const flagAssets = import.meta.glob<string>('/node_modules/country-flag-icons/3x2/*.svg', { eager: true, query: '?url&no-inline', import: 'default' })
const countryNames = new Intl.DisplayNames(['en'], { type: 'region' })
const countries = getCountries().map(code => ({ code, name: code === 'CV' ? 'Cape Verde' : countryNames.of(code) ?? code, dial: `+${getCountryCallingCode(code)}` })).sort((a, b) => a.name.localeCompare(b.name))

function flag(code: CountryCode) {
  return flagAssets[`/node_modules/country-flag-icons/3x2/${code}.svg`]
}

export function CareerPhoneField({ onChange }: { onChange: () => void }) {
  const [country, setCountry] = useState<CountryCode>('CA')
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState('CA')
  const [above, setAbove] = useState(false)
  const [panelHeight, setPanelHeight] = useState(362)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const search = useRef<HTMLInputElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const selected = countries.find(item => item.code === country)!
  const filtered = countries.filter(item => `${item.name} ${item.dial} ${item.code}`.toLowerCase().includes(query.trim().toLowerCase()))

  function validate(value: string, code: CountryCode) {
    const number = parsePhoneNumberFromString(value, code)
    input.current?.setCustomValidity(value && (!/^[+\d\s().-]+$/.test(value) || !number?.isPossible()) ? 'Enter a complete phone number for the selected country.' : '')
  }

  function positionCountries() {
    const bounds = root.current!.getBoundingClientRect()
    const roomBelow = innerHeight - bounds.bottom - 12
    const headerBottom = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0
    const roomAbove = bounds.top - 12 - headerBottom
    const upwards = roomBelow < 362 && roomAbove > roomBelow
    setAbove(upwards)
    setPanelHeight(Math.min(362, Math.max(160, upwards ? roomAbove : roomBelow)))
  }

  function showCountries() {
    positionCountries()
    setQuery('')
    setActive(country)
    setOpen(true)
  }

  function choose(code: CountryCode) {
    if (input.current?.value.trim().startsWith('+') && code !== country) {
      const number = parsePhoneNumberFromString(input.current.value)
      if (number) input.current.value = number.nationalNumber
    }
    setCountry(code)
    validate(input.current?.value ?? '', code)
    setOpen(false)
    onChange()
    trigger.current?.focus()
  }

  useEffect(() => {
    const form = input.current?.form
    function reset() {
      setCountry('CA')
      setOpen(false)
      setQuery('')
      setActive('CA')
      input.current?.setCustomValidity('')
    }
    form?.addEventListener('reset', reset)
    return () => form?.removeEventListener('reset', reset)
  }, [])

  useEffect(() => {
    if (!open) return
    positionCountries()
    search.current?.focus({ preventScroll: true })
    function dismiss(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', dismiss)
    window.addEventListener('scroll', positionCountries, true)
    window.addEventListener('resize', positionCountries)
    return () => {
      document.removeEventListener('pointerdown', dismiss)
      window.removeEventListener('scroll', positionCountries, true)
      window.removeEventListener('resize', positionCountries)
    }
  }, [open])

  useEffect(() => {
    if (!open || !list.current) return
    const option = list.current.querySelector<HTMLElement>(`[data-country="${active}"]`)
    if (option) {
      const container = list.current
      const top = option.offsetTop
      if (top < container.scrollTop || top + option.offsetHeight > container.scrollTop + container.clientHeight) container.scrollTop = top - container.clientHeight / 2 + option.offsetHeight / 2
    }
  }, [active, open, query])

  function navigate(event: KeyboardEvent<HTMLInputElement>) {
    const index = filtered.findIndex(item => item.code === active)
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const next = (index + (event.key === 'ArrowDown' ? 1 : -1) + filtered.length) % filtered.length
      if (filtered[next]) setActive(filtered[next].code)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      if (filtered[index]) choose(filtered[index].code)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      trigger.current?.focus()
    } else if (event.key === 'Tab') {
      event.preventDefault()
      setOpen(false)
      if (event.shiftKey) trigger.current?.focus()
      else input.current?.focus()
    }
  }

  return <div className="application-phone-field">
    <label htmlFor="application-phone">Phone *</label>
    <div className="career-phone" ref={root} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false) }}>
      <button ref={trigger} type="button" className="career-country-trigger" aria-label={`Phone country: ${selected.name} (${selected.dial})`} aria-expanded={open} aria-controls="career-country-panel" aria-haspopup="listbox" onClick={() => open ? setOpen(false) : showCountries()} onKeyDown={event => { if (event.key === 'ArrowDown') { event.preventDefault(); showCountries() } }}>
        <img src={flag(country)} alt="" width="28" height="19" /><ChevronDown size={16} aria-hidden="true" />
      </button>
      <input ref={input} id="application-phone" name="phone" type="tel" autoComplete="tel" placeholder="Phone" required maxLength={30} onChange={event => {
        const value = event.currentTarget.value
        const parsed = value.trim().startsWith('+') ? parsePhoneNumberFromString(value) : undefined
        const code = parsed?.country ?? country
        if (code !== country) setCountry(code)
        validate(value, code)
      }} />
      <input type="hidden" name="phoneCountry" value={country} />
      {open && <div id="career-country-panel" className={`career-country-panel${above ? ' opens-above' : ''}`} style={{ maxHeight: panelHeight }}>
        <div className="career-country-search"><Search size={24} aria-hidden="true" /><input ref={search} type="search" placeholder="Search" aria-label="Search phone countries" role="combobox" aria-expanded="true" aria-controls="career-country-options" aria-autocomplete="list" aria-activedescendant={filtered.some(item => item.code === active) ? `career-country-${active}` : undefined} value={query} onChange={event => {
          setQuery(event.currentTarget.value)
          const first = countries.find(item => `${item.name} ${item.dial} ${item.code}`.toLowerCase().includes(event.currentTarget.value.trim().toLowerCase()))
          setActive(first?.code ?? '')
        }} onKeyDown={navigate} /></div>
        <ul ref={list} id="career-country-options" role="listbox" aria-label="Phone countries">
          {filtered.map(item => <li key={item.code} id={`career-country-${item.code}`} data-country={item.code} role="option" aria-selected={country === item.code} className={active === item.code ? 'is-active' : undefined} onPointerDown={event => event.preventDefault()} onClick={() => choose(item.code)}>
            <img src={flag(item.code)} alt="" width="28" height="19" loading="lazy" /><span>{item.name} <span className="career-country-dial">{item.dial}</span></span>
          </li>)}
        </ul>
        {!filtered.length && <p className="career-country-empty" role="status">No countries found.</p>}
      </div>}
    </div>
  </div>
}
