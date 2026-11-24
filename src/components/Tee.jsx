import { useEffect, useRef, useState } from 'react'
import { asset } from '../lib/assets.js'
import { products } from '../lib/data.js'
import { reducedMotion } from '../lib/scroll.js'
import Buy from './Buy.jsx'

const p = products.tee
const DEL = 'أنا بكتب كود'
const ADD = 'أنا بسوق الـ AI'

// The two lines type themselves the first time the window scrolls into view.
function DiffWindow() {
  const root = useRef(null)
  const [n, setN] = useState(reducedMotion() ? DEL.length + ADD.length : 0)
  const [run, setRun] = useState(0)

  useEffect(() => {
    if (reducedMotion()) return
    let timer
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        let i = 0
        const tick = () => {
          i += 1
          setN(i)
          if (i < DEL.length + ADD.length) timer = setTimeout(tick, i === DEL.length ? 520 : 62)
        }
        timer = setTimeout(tick, 350)
      },
      { threshold: 0.6 },
    )
    io.observe(root.current)
    return () => {
      io.disconnect()
      clearTimeout(timer)
    }
  }, [run])

  const del = DEL.slice(0, Math.min(n, DEL.length))
  const add = ADD.slice(0, Math.max(0, n - DEL.length))
  const done = n >= DEL.length + ADD.length
  const replay = () => {
    setN(0)
    setRun((r) => r + 1)
  }

  return (
    <div className="diff" ref={root} data-reveal>
      <div className="diff__bar">
        <i />
        <span>tshirt.diff</span>
        <button style={{ marginLeft: 'auto', textDecoration: 'underline' }} onClick={replay} data-cursor="تاني">
          replay
        </button>
      </div>
      <div className="diff__body" aria-label={`- ${DEL} ثم + ${ADD}`}>
        <div className="diff__line del">
          <span className="diff__mark">-</span>
          <span className="diff__txt">{del}{n > 0 && n <= DEL.length && <i className="caret" />}</span>
        </div>
        <div className="diff__line add">
          <span className="diff__mark">+</span>
          <span className="diff__txt">{add}{n > DEL.length && <i className="caret" />}</span>
        </div>
      </div>
      <div className={`diff__stat${done ? ' is-on' : ''}`}>
        1 file changed, <b>1 insertion(+)</b>, <s>1 deletion(-)</s>
      </div>
    </div>
  )
}

export default function Tee() {
  const [color, setColor] = useState('white')
  const [view, setView] = useState('front')
  const views = [
    { id: 'front', src: asset(p.image(color)), alt: 'التيشيرت من قدام' },
    { id: 'detail', src: asset('details/detail-tee.webp'), alt: 'الطباعة عن قرب' },
    { id: 'life', src: asset('lifestyle/lifestyle-tee.webp'), alt: 'التيشيرت وهو ملبوس' },
  ]

  return (
    <section className="section" id="tee" data-file={p.file}>
      <div className="product product--flip">
        <div className="product__media" data-reveal>
          <div className="media">
            <span className="media__tag">{view === 'front' ? `tee-${color}.webp` : view === 'detail' ? 'detail-tee.webp' : 'lifestyle-tee.webp'}</span>
            {p.colors.map((c) => (
              <img
                key={c.id}
                src={asset(p.image(c.id))}
                alt={`التيشيرت باللون ال${c.name}`}
                className={view === 'front' && c.id === color ? 'is-on' : ''}
                loading="lazy"
              />
            ))}
            {views.slice(1).map((v) => (
              <img key={v.id} src={v.src} alt={v.alt} className={view === v.id ? 'is-on' : ''} loading="lazy" />
            ))}
          </div>
          <div className="thumbs">
            {views.map((v) => (
              <button key={v.id} className={view === v.id ? 'is-on' : ''} onClick={() => setView(v.id)} aria-label={v.alt} data-cursor="شوف">
                <img src={v.src} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <div data-reveal>
            <span className="eyebrow">02 · {p.file}</span>
            <h2 className="h2">سطر اتمسح، وسطر اتضاف.</h2>
            <p className="lead">‏git diff بالعربي، مطبوع بخط الكود. أقصر طريقة تشرح بيها شغلك اتغير إزاي.</p>
          </div>
          <DiffWindow />
          <Buy
            product={p}
            color={color}
            onColor={(id) => {
              setColor(id)
              setView('front')
            }}
            note="الأحمر والأخضر بيفتحوا شوية على الألوان الغامقة عشان يفضلوا مقروءين."
          />
        </div>
      </div>
    </section>
  )
}
