import { useEffect, useRef, useState } from 'react'
import { useCart } from '../lib/cart.jsx'
import { onScroll } from '../lib/scroll.js'

// An editor-style status bar: branch, current "file", scroll position, cart.
export default function StatusBar() {
  const { count, toast, setOpen } = useCart()
  const [file, setFile] = useState('hero-loop.mp4')
  const line = useRef(null)

  useEffect(() => {
    const sections = [...document.querySelectorAll('[data-file]')]
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setFile(e.target.dataset.file))
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    sections.forEach((s) => io.observe(s))
    const off = onScroll(({ scroll, limit }) => {
      if (line.current) line.current.textContent = `${Math.round((scroll / (limit || 1)) * 100)}%`
    })
    return () => {
      io.disconnect()
      off()
    }
  }, [])

  return (
    <div className="status" role="contentinfo" aria-label="شريط الحالة">
      <span className="is-branch">⎇ main</span>
      <span>{file}</span>
      <span className="is-wide">✓ 0 problems</span>
      <span className="is-grow">{toast && <em key={toast.id}>✓ {toast.text}</em>}</span>
      <span className="is-wide">UTF-8</span>
      <span className="is-wide">RTL</span>
      <span>Ln <b ref={line} style={{ fontWeight: 400 }}>0%</b></span>
      <button onClick={() => setOpen(true)}>cart: {count}</button>
    </div>
  )
}
