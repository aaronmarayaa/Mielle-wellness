import { useEffect, type SVGProps } from 'react'

function InkPath(props: SVGProps<SVGPathElement>) {
  return <path pathLength={1} {...props} />
}

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

function OliveBranch({ placement = 'primary' }: { placement?: 'primary' | 'secondary' | 'canopy' | 'middle' }) {
  return <svg className={`botanical-art botanical-art-${placement}`} data-plant="olive" viewBox="0 0 320 480" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <InkPath d="M46 487C77 399 148 278 205 186C226 152 248 112 267 63M135 304C105 265 78 216 64 174M174 233C213 225 254 201 284 172" />
    <g className="botanical-leaves botanical-fill" fill="currentColor">
      <InkPath d="M73 416C38 398 18 370 17 342C47 349 72 382 73 416ZM90 380C130 382 161 367 176 340C145 337 110 351 90 380ZM119 329C86 312 63 281 62 252C92 264 114 299 119 329ZM149 278C186 282 217 269 234 244C202 240 168 254 149 278ZM168 246C143 222 132 190 137 163C162 181 171 220 168 246ZM199 196C231 203 260 192 277 170C247 165 216 177 199 196ZM219 161C198 137 194 108 202 83C224 103 228 136 219 161ZM239 123C269 126 293 111 306 88C277 88 253 101 239 123ZM263 74C257 44 270 16 291 1C296 31 284 56 263 74ZM102 250C78 249 54 235 43 213C68 212 91 230 102 250ZM78 206C84 180 81 154 64 137C53 161 58 188 78 206ZM220 214C240 234 264 241 288 236C277 214 249 206 220 214Z" />
      <InkPath d="M59 453C28 450 5 433-2 411C24 416 45 432 59 453ZM75 414C106 426 139 422 160 405C130 395 98 403 75 414ZM112 344C138 353 164 349 182 332C153 326 129 333 112 344ZM147 277C118 275 91 259 83 237C109 241 133 255 147 277ZM195 199C177 183 166 161 170 139C189 151 199 176 195 199ZM246 112C231 92 226 69 234 50C251 67 254 91 246 112Z" />
    </g>
    <InkPath className="botanical-detail" d="M74 410L29 358M97 378L159 349M120 325L76 268M158 276L217 251M167 238L143 180M207 194L261 177M221 152L207 100M247 120L292 96M265 69L286 18" strokeWidth=".65" />
    <InkPath className="botanical-detail" d="M58 450L13 424M79 414L143 409M117 343L166 336M145 274L99 249M194 195L175 154M245 108L237 66" strokeWidth=".65" />
    <InkPath className="botanical-leaves" d="M142 289L150 311M186 217L188 239M240 119L253 138" />
    <g className="botanical-leaves botanical-fill" fill="currentColor">
      <ellipse pathLength={1} cx="152" cy="322" rx="8" ry="13" transform="rotate(-18 152 322)" />
      <ellipse pathLength={1} cx="188" cy="250" rx="7" ry="11" transform="rotate(12 188 250)" />
      <ellipse pathLength={1} cx="257" cy="148" rx="6" ry="10" transform="rotate(-22 257 148)" />
    </g>
  </svg>
}

function LavenderSpike({ x, y, rotation = 0, scale = 1 }: { x: number; y: number; rotation?: number; scale?: number }) {
  return <g transform={`translate(${x} ${y}) rotate(${rotation}) scale(${scale})`}>
    <InkPath d="M1 113C-2 76 3 35 1-7" strokeWidth=".9" />
    <g fill="currentColor" fillOpacity=".3">
      {[0, 12, 25, 38, 52, 66, 81].map((height, index) => <g key={height} transform={`translate(${index % 2 ? 1 : -1} ${height})`}>
        <InkPath d="M-1 6C-9 6-19-2-17-9C-15-17-3-11-1 6Z" />
        <InkPath d="M2 9C10 8 20 0 17-7C13-13 4-8 2 9Z" />
      </g>)}
      <InkPath d="M1-5C-8-11-5-25 0-28C7-24 10-13 1-5Z" />
    </g>
  </g>
}

function LavenderSprigs() {
  return <svg className="botanical-art botanical-art-lavender" data-plant="lavender" viewBox="0 0 320 480" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <InkPath d="M168 487C159 376 147 257 139 155M177 483C198 409 214 333 225 260M152 418C126 377 99 334 82 278" />
    <LavenderSpike x={136} y={49} rotation={-3} />
    <LavenderSpike x={249} y={156} rotation={12} scale={.96} />
    <LavenderSpike x={61} y={185} rotation={-14} scale={.88} />
    <g fill="currentColor" fillOpacity=".16">
      <InkPath d="M155 331C133 309 120 277 119 254C140 273 153 301 155 331ZM158 352C177 326 184 296 180 273C164 295 159 328 158 352ZM188 437C212 411 223 383 224 355C204 374 191 408 188 437ZM129 378C98 358 81 333 76 309C103 324 122 351 129 378ZM206 359C223 340 235 318 237 298C219 310 209 335 206 359ZM166 433C142 415 126 391 120 369C144 383 160 409 166 433Z" />
    </g>
    <InkPath d="M155 328L125 269M159 348L178 288M188 433L220 370M128 375L84 322M207 355L232 312M165 430L128 383" strokeWidth=".65" />
  </svg>
}

export function BotanicalBackdrop({ side = 'left', dense = false }: { side?: 'left' | 'right'; dense?: boolean }) {
  return <div className={`botanical-backdrop botanical-olive botanical-from-${side}`} data-botanical="olive-lavender" aria-hidden="true">
    <OliveBranch />
    <OliveBranch placement="secondary" />
    {dense && <><OliveBranch placement="canopy" /><OliveBranch placement="middle" /></>}
    <LavenderSprigs />
  </div>
}
