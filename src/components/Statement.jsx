import { useLayoutEffect, useRef } from 'react'
import { gsap, reducedMotion } from '../lib/scroll.js'

const words = 'مش ميرش عليه لوجو وخلاص. كل قطعة فيها *نكتة* *داخلية* صغيرة… لو ضحكت، يبقى إنت مننا.'.split(' ')

export default function Statement() {
  const root = useRef(null)

  useLayoutEffect(() => {
    if (reducedMotion()) {
      gsap.set(root.current.querySelectorAll('.w'), { opacity: 1 })
      return
    }
    const ctx = gsap.context(() => {
      gsap.to('.w', {
        opacity: 1,
        ease: 'none',
        stagger: 0.12,
        scrollTrigger: { trigger: root.current, start: 'top 78%', end: 'bottom 62%', scrub: true },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <>
      <div className="cut">// COMMIT 01 — WHY</div>
      <section className="section statement" ref={root}>
        <p>
          {words.map((w, i) => {
            const hl = w.startsWith('*')
            return (
              <span key={i}>
                <span className={`w${hl ? ' hl' : ''}`}>{w.replaceAll('*', '')}</span>{' '}
              </span>
            )
          })}
        </p>
      </section>
    </>
  )
}
