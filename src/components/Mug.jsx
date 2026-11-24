import { useEffect, useRef, useState } from 'react'
import { asset } from '../lib/assets.js'
import { useCart } from '../lib/cart.jsx'
import { CURRENCY, products } from '../lib/data.js'
import { gsap, ScrollTrigger, reducedMotion } from '../lib/scroll.js'
import { Swatches } from './Buy.jsx'

const p = products.mug

export default function Mug() {
  const { add } = useCart()
  const [color, setColor] = useState('matte-black')
  const [fallback, setFallback] = useState(false)
  const root = useRef(null)
  const canvas = useRef(null)
  const scene = useRef(null)
  const ui = useRef({})

  // Build the 3D mug only when the section is near, and drive it from scroll.
  useEffect(() => {
    let raf = 0
    let visible = false
    let st = null
    let cancelled = false
    let ro = null
    const drag = { on: false, x: 0, start: 0, tween: null }

    const loop = () => {
      raf = 0
      if (!scene.current || !visible) return
      if (scene.current.step() || drag.on) raf = requestAnimationFrame(loop)
    }
    const kick = () => {
      if (!raf && visible) raf = requestAnimationFrame(loop)
    }

    const setReadout = (progress) => {
      const pct = Math.round(Math.min(1, progress / 0.75) * 100)
      const { num, tokens, bar, box, msg } = ui.current
      if (!num) return
      num.textContent = `${pct}%`
      tokens.textContent = `${pct * 2}k / 200k tokens`
      bar.style.transform = `scaleX(${pct / 100})`
      box.classList.toggle('is-full', pct >= 100)
      msg.textContent =
        pct >= 100 ? 'الكونتكست اتملى. اعمل قهوة جديدة.' : pct > 0 ? 'كل ما تشرب… الكونتكست بيتملي.' : 'انزل بالصفحة واشرب معايا.'
    }

    const start = async () => {
      try {
        const { createMugScene } = await import('../lib/mugScene.js')
        if (cancelled) return
        scene.current = createMugScene(canvas.current, p.colors.find((c) => c.id === 'matte-black'))
      } catch (err) {
        console.warn('3D mug unavailable, showing the photo instead.', err)
        setFallback(true)
        return
      }
      ro = new ResizeObserver(() => scene.current?.resize())
      ro.observe(canvas.current.parentElement)
      if (st) scene.current.setProgress(reducedMotion() ? 0.75 : st.progress)
      kick()
    }

    st = ScrollTrigger.create({
      trigger: root.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const prog = reducedMotion() ? 0.75 : self.progress
        scene.current?.setProgress(prog)
        setReadout(prog)
        kick()
      },
    })
    setReadout(reducedMotion() ? 0.75 : 0)

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible && !scene.current && !cancelled) start()
        kick()
      },
      { rootMargin: '400px 0px' },
    )
    io.observe(root.current)

    // Drag the mug to turn it; it eases back when released.
    const c = canvas.current
    const down = (e) => {
      if (!scene.current) return
      drag.tween?.kill()
      drag.on = true
      drag.x = e.clientX
      drag.start = scene.current.getDrag()
      c.setPointerCapture(e.pointerId)
      c.style.cursor = 'grabbing'
      kick()
    }
    const move = (e) => {
      if (!drag.on) return
      scene.current.setDrag(drag.start + (e.clientX - drag.x) * 0.012)
    }
    const up = () => {
      if (!drag.on) return
      drag.on = false
      c.style.cursor = ''
      const o = { v: scene.current.getDrag() }
      drag.tween = gsap.to(o, {
        v: 0,
        duration: 1.2,
        ease: 'elastic.out(1, 0.6)',
        onUpdate: () => {
          scene.current?.setDrag(o.v)
          kick()
        },
      })
    }
    c.addEventListener('pointerdown', down)
    c.addEventListener('pointermove', move)
    c.addEventListener('pointerup', up)
    c.addEventListener('pointercancel', up)

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      io.disconnect()
      ro?.disconnect()
      st?.kill()
      drag.tween?.kill()
      c.removeEventListener('pointerdown', down)
      c.removeEventListener('pointermove', move)
      c.removeEventListener('pointerup', up)
      c.removeEventListener('pointercancel', up)
      scene.current?.dispose()
      scene.current = null
    }
  }, [])

  const pick = (id) => {
    setColor(id)
    scene.current?.setColor(p.colors.find((c) => c.id === id))
  }

  return (
    <section className="mug" id="mug" ref={root} data-file={p.file}>
      <div className="mug__pin">
        <div className="mug__stage">
          <canvas ref={canvas} hidden={fallback} data-cursor="لفّ المج" aria-label="مج ثلاثي الأبعاد، اسحبه عشان يلف" />
          {fallback && <img src={asset(p.image(color))} alt={`المج باللون ال${p.colors.find((c) => c.id === color).name}`} />}
          {!fallback && <span className="mug__drag">DRAG TO TURN · SCROLL TO DRINK</span>}
        </div>

        <div className="mug__copy">
          <span className="eyebrow">03 · {p.file}</span>
          <h2 className="h2">القهوة هي الـ context بتاعك.</h2>
          <p className="lead">شريط رفيع مطبوع حوالين المج، ومكتوب فوقه context window. واللوجو صغير على الوش التاني.</p>

          <div className="ctx" ref={(el) => (ui.current.box = el)}>
            <div className="ctx__top">
              <span ref={(el) => (ui.current.tokens = el)}>0k / 200k tokens</span>
              <b ref={(el) => (ui.current.num = el)}>0%</b>
            </div>
            <div className="ctx__bar"><i ref={(el) => (ui.current.bar = el)} /></div>
            <p className="ctx__msg" ref={(el) => (ui.current.msg = el)} aria-live="polite" />
          </div>

          <div className="mug__buy">
            <Swatches colors={p.colors} value={color} onChange={pick} />
            <span className="buy__price">{p.price} {CURRENCY}</span>
            <button className="btn" onClick={() => add('mug', color, null)} data-cursor="ضيف">
              ضيف للسلة <span aria-hidden="true">+</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
