import { useCallback, useEffect, useState } from 'react'
import { gsap, ScrollTrigger, destroyScroll, initScroll, lockScroll, reducedMotion } from './lib/scroll.js'
import Loader from './components/Loader.jsx'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import Statement from './components/Statement.jsx'
import Drop from './components/Drop.jsx'
import Hoodie from './components/Hoodie.jsx'
import Tee from './components/Tee.jsx'
import Mug from './components/Mug.jsx'
import Stickers from './components/Stickers.jsx'
import Details from './components/Details.jsx'
import About from './components/About.jsx'
import Faq from './components/Faq.jsx'
import Footer from './components/Footer.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import StatusBar from './components/StatusBar.jsx'
import CursorTag from './components/CursorTag.jsx'

export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    initScroll()
    lockScroll(true)
    window.scrollTo(0, 0)

    // Reveal blocks marked data-reveal as they enter the viewport.
    const blocks = gsap.utils.toArray('[data-reveal]')
    let batch = []
    if (!reducedMotion()) {
      gsap.set(blocks, { autoAlpha: 0, y: 36 })
      batch = ScrollTrigger.batch(blocks, {
        start: 'top 88%',
        once: true,
        onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.14, overwrite: true }),
      })
    }
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    document.fonts?.ready.then(refresh)

    return () => {
      window.removeEventListener('load', refresh)
      batch.forEach((t) => t.kill())
      destroyScroll()
    }
  }, [])

  const onLoaded = useCallback(() => {
    lockScroll(false)
    setReady(true)
    ScrollTrigger.refresh()
  }, [])

  return (
    <>
      <Loader onDone={onLoaded} />
      <Header />
      <main>
        <Hero ready={ready} />
        <Statement />
        <Drop />
        <Hoodie />
        <Tee />
        <Mug />
        <Stickers />
        <Details />
        <About />
        <Faq />
      </main>
      <Footer />
      <CartDrawer />
      <StatusBar />
      <CursorTag />
    </>
  )
}
