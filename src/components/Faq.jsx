import { useEffect, useRef, useState } from 'react'
import { svgMarkup } from '../lib/assets.js'
import { faq } from '../lib/data.js'
import { reducedMotion } from '../lib/scroll.js'

// Questions are sent as chat messages; the answer arrives after «يحيى بيكتب…».
export default function Faq() {
  const [thread, setThread] = useState([{ from: 'them', text: 'أهلاً! اسألني أي حاجة عن الميرش.' }])
  const [asked, setAsked] = useState([])
  const [typing, setTyping] = useState(false)
  const timer = useRef()

  useEffect(() => () => clearTimeout(timer.current), [])

  const ask = (i) => {
    if (typing || asked.includes(i)) return
    setAsked((a) => [...a, i])
    setThread((t) => [...t, { from: 'me', text: faq[i].q }])
    setTyping(true)
    timer.current = setTimeout(
      () => {
        setTyping(false)
        setThread((t) => [...t, { from: 'them', text: faq[i].a }])
      },
      reducedMotion() ? 0 : 1100,
    )
  }

  return (
    <section className="section" id="faq" data-file="chat.log">
      <div data-reveal>
        <span className="eyebrow">07 · chat.log</span>
        <h2 className="h2">عندك سؤال؟</h2>
        <p className="lead">دوس على أي سؤال ويحيى هيرد عليك.</p>
      </div>

      <div className="chat" data-reveal>
        <div className="chat__bar">
          <div className="chat__avatar" dangerouslySetInnerHTML={{ __html: svgMarkup('brand/logo-mark.svg') }} />
          <div>
            <b>يحيى</b>
            <small>{typing ? 'بيكتب…' : 'متصل دلوقتي'}</small>
          </div>
        </div>
        <div className="chat__thread" aria-live="polite">
          {thread.map((m, i) => (
            <div key={i} className={`bubble bubble--${m.from}`}>{m.text}</div>
          ))}
          {typing && (
            <div className="typing">
              <i><b /><b /><b /></i>
              يحيى بيكتب…
            </div>
          )}
        </div>
        <div className="chat__asks">
          {faq.map((f, i) => (
            <button key={f.q} className="ask" onClick={() => ask(i)} disabled={asked.includes(i)} data-cursor="اسأل">
              {f.q}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
