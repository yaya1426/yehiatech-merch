import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { asset } from '../lib/assets.js'
import { useCart } from '../lib/cart.jsx'
import { CURRENCY, products, stickers } from '../lib/data.js'

const p = products.stickers
const TILT = { cmdz: -5, esc: 4, enter: -3, typing: 3, skeleton: -4, aaa: 6 }

// Positions are fractions of the board (centre of each sticker), so the layout scales.
const LAYOUTS = {
  wide: {
    lid: { x0: 0.39, x1: 0.95, y0: 0.11, y1: 0.89 },
    size: { cmdz: 0.1, esc: 0.1, enter: 0.135, typing: 0.135, skeleton: 0.095, aaa: 0.095 },
    start: {
      cmdz: [0.11, 0.3], esc: [0.26, 0.3], enter: [0.1, 0.56], typing: [0.27, 0.56], skeleton: [0.11, 0.82], aaa: [0.26, 0.82],
    },
  },
  tall: {
    lid: { x0: 0.06, x1: 0.94, y0: 0.44, y1: 0.96 },
    size: { cmdz: 0.24, esc: 0.24, enter: 0.32, typing: 0.31, skeleton: 0.22, aaa: 0.22 },
    start: {
      cmdz: [0.18, 0.14], esc: [0.5, 0.14], enter: [0.8, 0.31], typing: [0.3, 0.32], skeleton: [0.82, 0.13], aaa: [0.56, 0.33],
    },
  },
}

const isTall = () => window.matchMedia('(max-width: 760px)').matches

export default function Stickers() {
  const { add, open } = useCart()
  const [layout, setLayout] = useState(() => (isTall() ? 'tall' : 'wide'))
  const L = LAYOUTS[layout]
  const [pos, setPos] = useState(L.start)
  const [order, setOrder] = useState(stickers.map((s) => s.id))
  const [dragId, setDragId] = useState(null)
  const [pressed, setPressed] = useState(null)
  const [downKey, setDownKey] = useState(null)
  const history = useRef([])
  const board = useRef(null)
  const root = useRef(null)
  const drag = useRef(null)
  const inView = useRef(false)
  const cartOpen = useRef(open)
  cartOpen.current = open

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 760px)')
    const change = () => {
      const next = mq.matches ? 'tall' : 'wide'
      setLayout(next)
      setPos(LAYOUTS[next].start)
      history.current = []
    }
    mq.addEventListener('change', change)
    return () => mq.removeEventListener('change', change)
  }, [])

  const flash = (key) => {
    setDownKey(key)
    setTimeout(() => setDownKey(null), 160)
  }
  const undo = useCallback(() => {
    flash('undo')
    const last = history.current.pop()
    if (last) setPos((cur) => ({ ...cur, [last.id]: last.from }))
  }, [])
  const reset = useCallback(() => {
    flash('esc')
    history.current = []
    setPos(LAYOUTS[isTall() ? 'tall' : 'wide'].start)
  }, [])
  const buy = useCallback(() => {
    flash('enter')
    add('stickers', 'pack', null)
  }, [add])

  // The real keys work while the section is on screen.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => (inView.current = e.isIntersecting), { threshold: 0.35 })
    io.observe(root.current)
    const onKey = (e) => {
      if (!inView.current || cartOpen.current) return
      const el = document.activeElement
      const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
      if (typing) return
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        undo()
      } else if (e.key === 'Escape') reset()
      else if (e.key === 'Enter' && (!el || el === document.body)) buy()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      io.disconnect()
      window.removeEventListener('keydown', onKey)
    }
  }, [undo, reset, buy])

  const down = (e, id) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { id, x: e.clientX, y: e.clientY, from: pos[id], moved: false }
    setOrder((o) => [...o.filter((x) => x !== id), id])
    setPressed(id)
  }
  const move = (e) => {
    const d = drag.current
    if (!d) return
    const r = board.current.getBoundingClientRect()
    const dx = (e.clientX - d.x) / r.width
    const dy = (e.clientY - d.y) / r.height
    if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 5) {
      d.moved = true
      setDragId(d.id)
    }
    if (d.moved) {
      const clamp = (v) => Math.min(0.97, Math.max(0.03, v))
      setPos((cur) => ({ ...cur, [d.id]: [clamp(d.from[0] + dx), clamp(d.from[1] + dy)] }))
    }
  }
  const up = () => {
    const d = drag.current
    if (!d) return
    drag.current = null
    if (d.moved) history.current.push({ id: d.id, from: d.from })
    setDragId(null)
    setTimeout(() => setPressed(null), 120)
  }

  const onLid = useMemo(
    () => stickers.filter((s) => {
      const [x, y] = pos[s.id]
      return x > L.lid.x0 && x < L.lid.x1 && y > L.lid.y0 && y < L.lid.y1
    }).length,
    [pos, L],
  )

  return (
    <section className="section" id="stickers" ref={root} data-file={p.file}>
      <div data-reveal>
        <span className="eyebrow">04 · {p.file}</span>
        <h2 className="h2">ستة استيكرز للابتوب.</h2>
        <p className="lead">
          اسحبهم على ضهر اللابتوب ورتّبهم زي ما تحب. والكيبورد شغّال هنا: الزراير التلاتة اللي على الاستيكرز بتعمل اللي مكتوب عليها.
        </p>
      </div>

      <div className="board" ref={board} data-reveal>
        <div className="board__laptop" aria-hidden="true" />
        <div className="board__tray">STICKERS/ · DRAG ONTO THE LID</div>
        {stickers.map((s) => {
          const [x, y] = pos[s.id]
          const dragging = dragId === s.id
          return (
            <div
              key={s.id}
              className={`sticker${dragging ? ' is-drag' : ''}${pressed === s.id && !dragging ? ' is-press' : ''}`}
              style={{
                width: `${L.size[s.id] * 100}%`,
                left: `${x * 100}%`,
                top: `${y * 100}%`,
                zIndex: 2 + order.indexOf(s.id),
                transform: `translate(-50%, -50%) rotate(${dragging ? 0 : TILT[s.id]}deg) scale(${dragging ? 1.08 : 1})`,
                transition: dragging ? 'transform .2s' : 'left .7s var(--out), top .7s var(--out), transform .35s var(--out)',
              }}
              onPointerDown={(e) => down(e, s.id)}
              onPointerMove={move}
              onPointerUp={up}
              onPointerCancel={up}
              role="img"
              aria-label={s.label}
              data-cursor="اسحب"
            >
              <img src={asset(s.file)} alt="" draggable={false} />
            </div>
          )
        })}
      </div>

      <div className="keys" data-reveal>
        <button className={`key${downKey === 'undo' ? ' is-down' : ''}`} onClick={undo} data-cursor="ارجع">
          <kbd>⌘Z</kbd> ارجع
        </button>
        <button className={`key${downKey === 'esc' ? ' is-down' : ''}`} onClick={reset} data-cursor="اهرب">
          <kbd>Esc</kbd> اهرب
        </button>
        <button className={`key key--yellow${downKey === 'enter' ? ' is-down' : ''}`} onClick={buy} data-cursor="يلا">
          <kbd>Enter</kbd> يلا، ضيف الباك · <span style={{ fontFamily: 'var(--f-mono)' }}>{p.price} {CURRENCY}</span>
        </button>
        <span className="keys__count">{onLid} / 6 on the lid</span>
      </div>
    </section>
  )
}
