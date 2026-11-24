import { useEffect, useRef, useState } from 'react'
import { svgMarkup } from '../lib/assets.js'
import { useCart } from '../lib/cart.jsx'
import { onScroll, scrollToId } from '../lib/scroll.js'

const links = [
  ['hoodie', 'الهودي'],
  ['tee', 'التيشيرت'],
  ['mug', 'المج'],
  ['stickers', 'الاستيكرز'],
  ['faq', 'الأسئلة'],
]

export function go(e, id) {
  e.preventDefault()
  scrollToId(id)
}

export default function Header() {
  const { count, setOpen } = useCart()
  const [state, setState] = useState({ solid: false, hidden: false })
  const [bump, setBump] = useState(false)
  const last = useRef(0)

  useEffect(
    () =>
      onScroll(({ scroll }) => {
        const down = scroll > last.current + 4
        const up = scroll < last.current - 4
        if (down || up || scroll < 40) {
          setState((s) => {
            const next = { solid: scroll > 40, hidden: scroll > 300 ? (down ? true : up ? false : s.hidden) : false }
            return next.solid === s.solid && next.hidden === s.hidden ? s : next
          })
          last.current = scroll
        }
      }),
    [],
  )

  useEffect(() => {
    if (!count) return
    setBump(true)
    const t = setTimeout(() => setBump(false), 450)
    return () => clearTimeout(t)
  }, [count])

  return (
    <header className={`top${state.solid ? ' is-solid' : ''}${state.hidden ? ' is-hidden' : ''}`}>
      <a
        className="top__logo"
        href="#top"
        onClick={(e) => go(e, 'top')}
        aria-label="Yehia Tech"
        dangerouslySetInnerHTML={{ __html: svgMarkup('brand/logo-full.svg') }}
      />
      <nav className="top__nav" aria-label="أقسام الصفحة">
        {links.map(([id, label]) => (
          <a key={id} href={`#${id}`} onClick={(e) => go(e, id)} data-cursor="روح">
            {label}
          </a>
        ))}
      </nav>
      <button className="cartbtn" onClick={() => setOpen(true)} data-cursor="افتح">
        السلة <b className={bump ? 'is-bump' : ''}>{count}</b>
      </button>
    </header>
  )
}
