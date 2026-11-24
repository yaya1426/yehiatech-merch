import { useEffect, useRef } from 'react'
import { asset } from '../lib/assets.js'
import { gsap, ScrollTrigger, reducedMotion, scrollToId } from '../lib/scroll.js'
import { go } from './Header.jsx'

// Each layer: home position (% of the stage) and width (vw) on desktop [x, y, w] and on phones [mx, my, mw],
// resting tilt, and depth (how strongly it floats and follows the pointer).
const LAYERS = [
  { id: 'tee', file: 'tshirt.diff', src: 'cutouts/tee.webp', to: 'tee', label: 'التيشيرت', d: [15, 45, 21], m: [24, 40, 40], rot: -9, depth: 0.45 },
  { id: 'hoodie', file: 'hoodie.fig', src: 'cutouts/hoodie.webp', to: 'hoodie', label: 'الهودي', d: [33, 55, 27], m: [55, 53, 50], rot: 3, depth: 0.75 },
  { id: 'mug', file: 'mug.ctx', src: 'cutouts/mug.webp', to: 'mug', label: 'المج', d: [47, 74, 13], m: [82, 76, 25], rot: -4, depth: 1.1 },
  { id: 'aaa', file: 'aaa.sticker', src: 'print/sticker-aaa.svg', to: 'stickers', label: 'استيكر AAA', sticker: true, d: [24, 18, 7], m: [30, 13, 15], rot: -6, depth: 1.25 },
  { id: 'enter', file: 'enter.key', src: 'print/sticker-key-enter.svg', to: 'stickers', label: 'استيكر Enter', sticker: true, d: [46, 26, 10], m: [79, 20, 23], rot: 7, depth: 1.4 },
  { id: 'cmdz', file: 'cmd-z.key', src: 'print/sticker-key-cmdz.svg', to: 'stickers', label: 'استيكر ⌘Z', sticker: true, d: [9, 79, 7.5], m: [13, 80, 17], rot: -11, depth: 1.5 },
  { id: 'typing', file: 'typing.sticker', src: 'print/sticker-typing.svg', to: 'stickers', label: 'استيكر يحيى بيكتب', sticker: true, d: [30, 90, 10], m: [46, 92, 23], rot: 4, depth: 1.3 },
]

const K = 70 // spring stiffness
const C = 9 // damping (a little bouncy on purpose)

export default function Hero({ ready }) {
  const root = useRef(null)
  const stage = useRef(null)
  const peer = useRef(null)
  const refs = useRef({})

  // The canvas engine: floating, pointer parallax, drag-and-throw with springs, selection, guides.
  useEffect(() => {
    const still = reducedMotion()
    const stageEl = stage.current
    const { rx, ry, gx, gy, iName, iPos, iSize, iRot } = refs.current
    const layers = [...stageEl.querySelectorAll('.layer')].map((el, i) => ({
      el, cfg: LAYERS[i], x: 0, y: 0, vx: 0, vy: 0, r: 0, vr: 0, drag: null, phase: i * 1.7,
    }))
    const pointer = { x: 0.5, y: 0.5, sx: 0.5, sy: 0.5, cx: 0, cy: 0, inside: false }
    let selected = null
    let scrollP = 0
    let raf = 0
    let last = 0
    let visible = true

    const select = (l) => {
      if (selected === l) return
      selected?.el.classList.remove('is-sel')
      selected = l
      if (!l) return
      l.el.classList.add('is-sel')
      l.el.querySelector('.layer__sel span').textContent = `${l.cfg.file} · ${l.el.offsetWidth} × ${l.el.offsetHeight}`
    }

    const inspect = () => {
      if (!selected) return
      const cx = (selected.el.offsetLeft + selected.x).toFixed(0)
      const cy = (selected.el.offsetTop + selected.y).toFixed(0)
      iName.textContent = selected.cfg.file
      iPos.textContent = `x ${cx}  y ${cy}`
      iSize.textContent = `${selected.el.offsetWidth} × ${selected.el.offsetHeight}`
      iRot.textContent = `${(selected.cfg.rot + selected.r).toFixed(1)}°`
    }

    // Smart guides: show a line when the dragged layer lines up with the stage centre or another layer.
    const guides = (l) => {
      const w = stageEl.clientWidth
      const h = stageEl.clientHeight
      const cx = l.el.offsetLeft + l.x
      const cy = l.el.offsetTop + l.y
      const xs = [w / 2, ...layers.filter((o) => o !== l).map((o) => o.el.offsetLeft + o.x)]
      const ys = [h / 2, ...layers.filter((o) => o !== l).map((o) => o.el.offsetTop + o.y)]
      const hitX = xs.find((v) => Math.abs(v - cx) < 7)
      const hitY = ys.find((v) => Math.abs(v - cy) < 7)
      gx.style.opacity = hitX === undefined ? 0 : 1
      gy.style.opacity = hitY === undefined ? 0 : 1
      if (hitX !== undefined) gx.style.transform = `translateX(${hitX}px)`
      if (hitY !== undefined) gy.style.transform = `translateY(${hitY}px)`
    }

    const frame = (t) => {
      raf = 0
      const dt = Math.min(0.033, (t - last) / 1000 || 0.016)
      last = t
      pointer.sx += (pointer.x - pointer.sx) * 0.08
      pointer.sy += (pointer.y - pointer.sy) * 0.08
      const time = t / 1000
      for (const l of layers) {
        const { depth, rot } = l.cfg
        if (l.drag) {
          const nx = pointer.cx - l.drag.ox
          const ny = pointer.cy - l.drag.oy
          l.vx = l.vx * 0.6 + ((nx - l.x) / dt) * 0.4
          l.vy = l.vy * 0.6 + ((ny - l.y) / dt) * 0.4
          l.x = nx
          l.y = ny
          l.r += (gsap.utils.clamp(-16, 16, l.vx * 0.012) - l.r) * 0.2
          l.vr = 0
          guides(l)
        } else {
          const restX = (pointer.sx - 0.5) * -depth * 38 + (still ? 0 : Math.sin(time * 0.6 + l.phase) * depth * 5)
          const restY = (pointer.sy - 0.5) * -depth * 26 + (still ? 0 : Math.cos(time * 0.5 + l.phase) * depth * 7) - scrollP * depth * 150
          l.vx += (-K * (l.x - restX) - C * l.vx) * dt
          l.vy += (-K * (l.y - restY) - C * l.vy) * dt
          l.x += l.vx * dt
          l.y += l.vy * dt
          l.vr += (-90 * l.r - 9 * l.vr) * dt
          l.r += l.vr * dt
        }
        l.el.style.transform = `translate(-50%, -50%) translate3d(${l.x.toFixed(2)}px, ${l.y.toFixed(2)}px, 0) rotate(${(rot + l.r).toFixed(2)}deg)`
      }
      inspect()
      if (visible) raf = requestAnimationFrame(frame)
    }
    const kick = () => {
      if (!raf && visible) raf = requestAnimationFrame(frame)
    }

    const onMove = (e) => {
      const s = stageEl.getBoundingClientRect()
      pointer.cx = e.clientX
      pointer.cy = e.clientY
      pointer.x = gsap.utils.clamp(0, 1, (e.clientX - s.left) / s.width)
      pointer.y = gsap.utils.clamp(0, 1, (e.clientY - s.top) / s.height)
      if (rx) rx.style.transform = `translateX(${e.clientX}px)`
      if (ry) ry.style.transform = `translateY(${e.clientY - s.top}px)`
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    const cleanups = layers.map((l) => {
      const down = (e) => {
        if (e.pointerType === 'touch') {
          // On phones a tap selects the layer and gives it a kick; dragging stays free for scrolling.
          select(l)
          l.vx += (Math.random() - 0.5) * 420
          l.vy -= 380
          l.vr += (Math.random() - 0.5) * 320
          return
        }
        e.preventDefault()
        l.el.setPointerCapture(e.pointerId)
        pointer.cx = e.clientX
        pointer.cy = e.clientY
        l.drag = { ox: e.clientX - l.x, oy: e.clientY - l.y, sx: e.clientX, sy: e.clientY, moved: false }
        l.el.classList.add('is-drag')
        select(l)
      }
      const move = (e) => {
        if (l.drag && Math.hypot(e.clientX - l.drag.sx, e.clientY - l.drag.sy) > 5) l.drag.moved = true
      }
      const up = () => {
        if (!l.drag) return
        const moved = l.drag.moved
        l.drag = null
        l.el.classList.remove('is-drag')
        gx.style.opacity = gy.style.opacity = 0
        if (!moved) scrollToId(l.cfg.to)
      }
      const enter = () => !layers.some((o) => o.drag) && select(l)
      const leave = () => !l.drag && selected === l && select(null)
      const key = (e) => e.key === 'Enter' && scrollToId(l.cfg.to)
      l.el.addEventListener('pointerdown', down)
      l.el.addEventListener('pointermove', move)
      l.el.addEventListener('pointerup', up)
      l.el.addEventListener('pointercancel', up)
      l.el.addEventListener('pointerenter', enter)
      l.el.addEventListener('pointerleave', leave)
      l.el.addEventListener('keydown', key)
      return () => {
        l.el.removeEventListener('pointerdown', down)
        l.el.removeEventListener('pointermove', move)
        l.el.removeEventListener('pointerup', up)
        l.el.removeEventListener('pointercancel', up)
        l.el.removeEventListener('pointerenter', enter)
        l.el.removeEventListener('pointerleave', leave)
        l.el.removeEventListener('keydown', key)
      }
    })

    // A second cursor, «يحيى», wanders the canvas, selecting and nudging layers.
    const order = [1, 4, 0, 2, 5, 3, 6]
    let turn = 0
    let peerTween = null
    let peerCall = null
    const visit = () => {
      if (still || !visible) return
      const l = layers[order[turn++ % order.length]]
      if (l.drag) {
        peerCall = gsap.delayedCall(0.6, visit)
        return
      }
      const x = l.el.offsetLeft + l.el.offsetWidth * 0.22
      const y = l.el.offsetTop + l.el.offsetHeight * 0.18
      peerTween = gsap.to(peer.current, {
        x, y, duration: 1.25, ease: 'power2.inOut',
        onComplete: () => {
          l.el.classList.add('is-peer')
          if (!l.drag) {
            l.vx += (Math.random() - 0.5) * 520
            l.vy -= 180 + Math.random() * 160
            l.vr += (Math.random() - 0.5) * 240
          }
          peerCall = gsap.delayedCall(1.5, () => {
            l.el.classList.remove('is-peer')
            visit()
          })
        },
      })
    }
    gsap.set(peer.current, { x: stageEl.clientWidth * 0.5, y: stageEl.clientHeight * 0.3 })
    const peerStart = gsap.delayedCall(2.6, visit)

    const st = ScrollTrigger.create({
      trigger: root.current, start: 'top top', end: 'bottom top',
      onUpdate: (self) => (scrollP = still ? 0 : self.progress),
    })
    const io = new IntersectionObserver(([e]) => {
      const was = visible
      visible = e.isIntersecting
      if (visible && !was) {
        kick()
        if (!peerTween?.isActive() && !peerCall?.isActive?.()) visit()
      }
    })
    io.observe(root.current)
    kick()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      cleanups.forEach((fn) => fn())
      peerTween?.kill()
      peerCall?.kill()
      peerStart.kill()
      st.kill()
      io.disconnect()
    }
  }, [])

  // Intro: headline lines rise and the layers pop in once the loader has lifted.
  useEffect(() => {
    if (!ready || reducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from('.hero__title .line > span', { yPercent: 150, duration: 1.1, ease: 'expo.out', stagger: 0.14, delay: 0.15 })
      gsap.from('.hero__eyebrow, .hero__sub, .hero__cta, .inspect', { autoAlpha: 0, y: 24, duration: 0.9, ease: 'expo.out', stagger: 0.1, delay: 0.55 })
      gsap.from('.layer__in', { autoAlpha: 0, scale: 0.55, y: 60, duration: 0.9, ease: 'back.out(1.7)', stagger: 0.07, delay: 0.2 })
      gsap.from('.peer', { autoAlpha: 0, duration: 0.5, delay: 2.2 })
    }, root)
    return () => ctx.revert()
  }, [ready])

  const set = (key) => (el) => (refs.current[key] = el)

  return (
    <section className="hero" id="top" ref={root} data-file="canvas.fig">
      <div className="hero__stage" ref={stage}>
        <div className="ruler ruler--x" aria-hidden="true"><b ref={set('rx')} /></div>
        <div className="ruler ruler--y" aria-hidden="true"><b ref={set('ry')} /></div>
        <div className="hero__board" aria-hidden="true"><span>Frame 1 · Drop 01</span></div>
        <i className="guide guide--x" ref={set('gx')} aria-hidden="true" />
        <i className="guide guide--y" ref={set('gy')} aria-hidden="true" />

        {LAYERS.map((l, i) => (
          <div
            key={l.id}
            className={`layer${l.sticker ? ' layer--sticker' : ''}`}
            style={{ '--x': l.d[0], '--y': l.d[1], '--w': l.d[2], '--mx': l.m[0], '--my': l.m[1], '--mw': l.m[2], zIndex: 2 + i }}
            role="link"
            tabIndex={0}
            aria-label={`${l.label}: روح للتفاصيل`}
            data-cursor="اسحب"
          >
            <div className="layer__in">
              <img src={asset(l.src)} alt="" draggable={false} />
              <div className="layer__sel" aria-hidden="true">
                <i /><i /><i /><i />
                <span />
              </div>
              <b className="layer__peer" aria-hidden="true">يحيى</b>
            </div>
          </div>
        ))}

        <div className="peer" ref={peer} aria-hidden="true">
          <svg viewBox="0 0 20 22" width="20" height="22">
            <path d="M2 2l15 8.2-6.6 1.5L7.6 19z" fill="#FFD60A" stroke="#111" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
          <span>يحيى</span>
        </div>
      </div>

      <div className="hero__copy">
        <span className="eyebrow hero__eyebrow">Yehia Tech · Drop 01</span>
        <h1 className="hero__title">
          <span className="line"><span>ميرش للي بطّل</span></span>
          <span className="line"><span>يكتب كود…</span></span>
          <span className="line"><span>وبقى <mark>يسوق الـ AI</mark>.</span></span>
        </h1>
        <p className="hero__sub">أربع قطع بسيطة، وكل واحدة فيها نكتة صغيرة هيفهمها أي مطوّر أو مصمم.{' '}
          <span className="only-fine">امسك أي قطعة وارميها.</span>
          <span className="only-touch">دوس على أي قطعة.</span>
        </p>
        <div className="hero__cta">
          <a className="btn" href="#drop" onClick={(e) => go(e, 'drop')} data-cursor="يلا">
            شوف المجموعة <span aria-hidden="true">←</span>
          </a>
          <a className="btn btn--ghost" href="#about" onClick={(e) => go(e, 'about')} data-cursor="روح">
            مين يحيى؟
          </a>
        </div>
        <div className="inspect" aria-hidden="true">
          <span><i>layer</i><b ref={set('iName')}>pick a layer</b></span>
          <span><i>position</i><b ref={set('iPos')}>x —  y —</b></span>
          <span><i>size</i><b ref={set('iSize')}>— × —</b></span>
          <span><i>rotate</i><b ref={set('iRot')}>—</b></span>
        </div>
      </div>
    </section>
  )
}
