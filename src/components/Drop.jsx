import { useRef } from 'react'
import { asset } from '../lib/assets.js'
import { CURRENCY, dropNotes, dropOrder, products } from '../lib/data.js'
import { go } from './Header.jsx'

export default function Drop() {
  const track = useRef(null)
  const drag = useRef(null)

  const step = (dir) => {
    const el = track.current
    const card = el.querySelector('.card')
    el.scrollBy({ left: dir * (card.offsetWidth + 24), behavior: 'smooth' })
  }

  // Mouse drag-to-scroll; touch uses the browser's own swipe.
  const down = (e) => {
    if (e.pointerType !== 'mouse') return
    drag.current = { x: e.clientX, left: track.current.scrollLeft, moved: false }
  }
  const move = (e) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    if (!d.moved && Math.abs(dx) > 6) {
      d.moved = true
      track.current.classList.add('is-drag')
      track.current.setPointerCapture(e.pointerId)
    }
    if (d.moved) track.current.scrollLeft = d.left - dx
  }
  const up = () => {
    if (!drag.current) return
    const moved = drag.current.moved
    drag.current = null
    if (moved) requestAnimationFrame(() => track.current?.classList.remove('is-drag'))
  }

  return (
    <section className="section drop" id="drop" data-file="drop-01/">
      <div className="drop__head">
        <div data-reveal>
          <span className="eyebrow">Drop 01 · 4 files changed</span>
          <h2 className="h2">المجموعة الأولى.</h2>
          <p className="lead">أربع قطع. اسحب وشوف، ودوس على أي واحدة عشان التفاصيل.</p>
        </div>
        <div className="drop__arrows" data-reveal>
          <button onClick={() => step(-1)} aria-label="القطعة اللي بعدها" data-cursor="التالي">←</button>
          <button onClick={() => step(1)} aria-label="القطعة اللي قبلها" data-cursor="السابق">→</button>
        </div>
      </div>

      <div
        className="drop__track"
        ref={track}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        data-cursor="اسحب"
        data-lenis-prevent-touch
      >
        {dropOrder.map((id, i) => {
          const p = products[id]
          return (
            <a className="card" key={id} href={`#${id}`} onClick={(e) => go(e, id)} draggable={false}>
              <div className="card__bar">
                <span>{String(i + 1).padStart(2, '0')} · {p.file}</span>
                <i />
              </div>
              <div className="card__img">
                <img src={asset(p.image(p.colors[0].id))} alt={p.name} loading="lazy" draggable={false} />
              </div>
              <div className="card__body">
                <div className="card__row">
                  <span className="card__name">{p.name}</span>
                  <span className="card__price">{p.price} {CURRENCY}</span>
                </div>
                <p className="card__note">{dropNotes[id]}</p>
                <div className="card__dots">
                  {p.colors.map((c) => (
                    <i key={c.id} style={{ background: c.hex }} title={c.name} />
                  ))}
                </div>
              </div>
            </a>
          )
        })}
      </div>
    </section>
  )
}
