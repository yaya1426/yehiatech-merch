import { useEffect, useRef, useState } from 'react'
import { asset } from '../lib/assets.js'

// The logo loads as a grey skeleton, fills in black, then the screen lifts away.
export default function Loader({ onDone }) {
  const [stage, setStage] = useState('loading') // loading -> filled -> done
  const finished = useRef(false)

  const finish = () => {
    if (finished.current) return
    finished.current = true
    setStage('filled')
    setTimeout(() => {
      setStage('done')
      onDone()
    }, 520)
  }

  useEffect(() => {
    const min = new Promise((r) => setTimeout(r, 1300))
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve()
    const cap = new Promise((r) => setTimeout(r, 4000))
    Promise.race([Promise.all([min, fonts]), cap]).then(finish)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className={`loader${stage !== 'loading' ? ' is-filled' : ''}${stage === 'done' ? ' is-done' : ''}`}
      onClick={finish}
      aria-hidden={stage === 'done'}
    >
      <div className="loader__mark" style={{ '--mark': `url("${asset('brand/logo-mark.svg')}")` }}>
        <i className="loader__skel" />
        <i className="loader__ink" />
      </div>
      <div className="loader__bars"><b /><b /></div>
      <div className="loader__skip">LOADING… CLICK TO SKIP</div>
    </div>
  )
}
