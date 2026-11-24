import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

let lenis = null
const listeners = new Set()

export function initScroll() {
  if (lenis) return lenis
  lenis = new Lenis({ lerp: reducedMotion() ? 1 : 0.115, smoothWheel: !reducedMotion() })
  lenis.on('scroll', (e) => {
    ScrollTrigger.update()
    listeners.forEach((fn) => fn(e))
  })
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export function destroyScroll() {
  if (!lenis) return
  lenis.destroy()
  lenis = null
}

export function onScroll(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function lockScroll(locked) {
  if (!lenis) return
  if (locked) lenis.stop()
  else lenis.start()
}

export function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset: id === 'top' ? 0 : -56, duration: 1.4 })
  else el.scrollIntoView({ behavior: 'smooth' })
}

export { gsap, ScrollTrigger }
