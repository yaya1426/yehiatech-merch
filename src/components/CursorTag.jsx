import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/scroll.js'

// A small multiplayer-style name tag that trails the pointer and names what it is over.
export default function CursorTag() {
  const el = useRef(null)
  const [label, setLabel] = useState('أنت')
  const [on, setOn] = useState(false)

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const x = gsap.quickTo(el.current, 'x', { duration: 0.35, ease: 'power3' })
    const y = gsap.quickTo(el.current, 'y', { duration: 0.35, ease: 'power3' })
    const move = (e) => {
      x(e.clientX)
      y(e.clientY)
      setOn(true)
      const target = e.target.closest?.('[data-cursor]')
      setLabel(target ? target.dataset.cursor : 'أنت')
    }
    const leave = () => setOn(false)
    window.addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  }, [])

  return (
    <div className={`ctag${on ? ' is-on' : ''}${label !== 'أنت' ? ' is-act' : ''}`} ref={el} aria-hidden="true">
      <span>{label}</span>
    </div>
  )
}
