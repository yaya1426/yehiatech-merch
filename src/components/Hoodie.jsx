import { useEffect, useRef, useState } from 'react'
import { asset, svgMarkup } from '../lib/assets.js'
import { products } from '../lib/data.js'
import { gsap } from '../lib/scroll.js'
import Buy from './Buy.jsx'

const p = products.hoodie
const INK = { yellow: '#FFD60A', black: '#111111' }

// The joke, made touchable: drag a handle and the size label updates, then it springs back.
function SelectionDemo({ color }) {
  const [scale, setScale] = useState(1)
  const board = useRef(null)
  const drag = useRef(null)
  const tween = useRef(null)

  const dist = (e) => {
    const r = board.current.getBoundingClientRect()
    return Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2))
  }
  const down = (e) => {
    tween.current?.kill()
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { start: dist(e), scale }
  }
  const move = (e) => {
    if (!drag.current) return
    setScale(gsap.utils.clamp(0.55, 1.75, (drag.current.scale * dist(e)) / drag.current.start))
  }
  const up = () => {
    if (!drag.current) return
    const from = { v: scale }
    drag.current = null
    tween.current = gsap.to(from, { v: 1, duration: 1, ease: 'elastic.out(1, 0.45)', onUpdate: () => setScale(from.v) })
  }
  useEffect(() => () => tween.current?.kill(), [])

  const n = Math.round(120 * scale)
  return (
    <div className="seldemo" data-reveal>
      <div className="seldemo__board" ref={board} style={{ background: color.hex, color: INK[color.ink] }}>
        <div className="seldemo__box" style={{ width: `${52 * scale}%`, '--blue': color.id === 'navy' ? '#4DB5FF' : undefined }}>
          <div dangerouslySetInnerHTML={{ __html: svgMarkup('brand/logo-mark.svg') }} style={{ display: 'contents' }} />
          {[0, 1, 2, 3].map((i) => (
            <i key={i} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} data-cursor="اسحب" />
          ))}
          <span className="mono">Y · {n} × {n}</span>
        </div>
      </div>
      <p>
        <b>جرّب بنفسك:</b> اسحب أي مقبض من الأربعة. المقاس اللي تحت اللوجو بيتغير، وأول ما تسيبه بيرجع
        <span className="ltr">&nbsp;120 × 120&nbsp;</span>
        زي المطبوع على الهودي.
      </p>
    </div>
  )
}

export default function Hoodie() {
  const [color, setColor] = useState('black')
  const [turning, setTurning] = useState(false)
  const video = useRef(null)
  const picked = p.colors.find((c) => c.id === color)

  const turn = () => {
    setColor('black')
    setTurning(true)
    const v = video.current
    v.currentTime = 0
    v.play().catch(() => setTurning(false))
  }
  const pick = (id) => {
    setTurning(false)
    video.current?.pause()
    setColor(id)
  }

  return (
    <section className="section" id="hoodie" data-file={p.file}>
      <div className="product">
        <div className="product__media" data-reveal>
          <div className="media">
            <span className="media__tag">hoodie-{color}.webp</span>
            {p.colors.map((c) => (
              <img
                key={c.id}
                src={asset(p.image(c.id))}
                alt={`الهودي باللون ال${c.name}`}
                className={c.id === color && !turning ? 'is-on' : ''}
                loading="lazy"
              />
            ))}
            <video
              ref={video}
              src={asset('video/hoodie-turn.mp4')}
              poster={asset('video/hoodie-turn-poster.webp')}
              muted
              playsInline
              preload="none"
              className={turning ? 'is-on' : ''}
              onEnded={() => setTurning(false)}
            />
            <button className="media__btn" onClick={turn} data-cursor="لفّ">
              <span className="mono">360°</span> لفّة كاملة
            </button>
          </div>
        </div>

        <div>
          <div data-reveal>
            <span className="eyebrow">01 · {p.file}</span>
            <h2 className="h2">اللوجو… وهو لسه متحدد.</h2>
            <p className="lead">
              اللوجو على الصدر كأنه لسه متحدد في برنامج التصميم: إطار أزرق رفيع، أربع مقابض صغيرة، والمقاس مكتوب تحته.
            </p>
          </div>
          <SelectionDemo color={picked} />
          <Buy product={p} color={color} onColor={pick} note="اللوجو أصفر على الألوان الغامقة، وأسود على الفاتحة." />
        </div>
      </div>
    </section>
  )
}
