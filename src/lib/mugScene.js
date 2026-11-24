import * as THREE from 'three'
import { rawSvg } from './assets.js'

const R = 1 // mug radius
const H = 2.3 // mug height
const WALL = 0.07
const TEX_W = 4096
const TEX_H = Math.round((TEX_W / (2 * Math.PI * R)) * H) // keeps the print undistorted

// Where things sit on the wrap texture (0..1 across the circumference).
const BAR = { x0: 0.085, x1: 0.415, y: 0.53, h: 56 / TEX_H } // centred on 0.25, facing the camera at rest
const LOGO_X = 0.75 // the opposite side
const TEX_OFFSET = 0.25

const INK = { yellow: '#FFD60A', black: '#111111' }

function logoImage(color) {
  return new Promise((resolve) => {
    const svg = rawSvg('brand/logo-mark.svg').replace('fill="currentColor"', `fill="${color}"`)
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
  })
}

async function drawWrap(canvas, color) {
  const ctx = canvas.getContext('2d')
  const ink = INK[color.ink]
  ctx.fillStyle = color.hex
  ctx.fillRect(0, 0, TEX_W, TEX_H)

  // "context window" label and the empty track; the fill is a separate mesh so it can animate.
  try {
    await document.fonts.load('500 84px "Cascadia Code"')
  } catch {
    /* falls back to the system monospace */
  }
  const x0 = BAR.x0 * TEX_W
  const w = (BAR.x1 - BAR.x0) * TEX_W
  const y = BAR.y * TEX_H
  const h = BAR.h * TEX_H
  ctx.fillStyle = ink
  ctx.font = '500 84px "Cascadia Code", ui-monospace, Menlo, monospace'
  ctx.textBaseline = 'alphabetic'
  ctx.direction = 'ltr'
  ctx.textAlign = 'left'
  ctx.fillText('context window', x0, y - h / 2 - 34)
  ctx.strokeStyle = ink
  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.roundRect(x0, y - h / 2, w, h, h / 2)
  ctx.stroke()

  const logo = await logoImage(ink)
  if (logo) {
    const lh = 600
    const lw = (lh * logo.width) / logo.height
    ctx.drawImage(logo, LOGO_X * TEX_W - lw / 2, TEX_H * 0.5 - lh / 2, lw, lh)
  }
}

function shadowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(128, 128, 10, 128, 128, 128)
  g.addColorStop(0, 'rgba(60,45,20,.42)')
  g.addColorStop(0.55, 'rgba(60,45,20,.14)')
  g.addColorStop(1, 'rgba(60,45,20,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  return new THREE.CanvasTexture(c)
}

// u (0..1 on the texture) -> angle on the cylinder, measured from +Z toward +X.
const angle = (u) => (u - TEX_OFFSET) * Math.PI * 2

export function createMugScene(canvas, firstColor) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 60)
  scene.add(new THREE.HemisphereLight(0xffffff, 0xe7dcc2, 1.15))
  const key = new THREE.DirectionalLight(0xffffff, 2.3)
  key.position.set(-4, 6, 6)
  scene.add(key)
  const fill = new THREE.DirectionalLight(0xfff1d0, 0.7)
  fill.position.set(5, 2, 3)
  scene.add(fill)

  const wrapCanvas = document.createElement('canvas')
  wrapCanvas.width = TEX_W
  wrapCanvas.height = TEX_H
  const wrap = new THREE.CanvasTexture(wrapCanvas)
  wrap.colorSpace = THREE.SRGBColorSpace
  wrap.wrapS = THREE.RepeatWrapping
  wrap.offset.x = TEX_OFFSET
  wrap.anisotropy = renderer.capabilities.getMaxAnisotropy()

  const mats = {
    outer: new THREE.MeshStandardMaterial({ map: wrap, roughness: 0.8, metalness: 0 }),
    body: new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0 }),
    inner: new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0, side: THREE.BackSide }),
    innerFloor: new THREE.MeshStandardMaterial({ roughness: 0.6 }),
    coffee: new THREE.MeshStandardMaterial({ color: 0x2a1708, roughness: 0.18, metalness: 0.1 }),
    ink: new THREE.MeshBasicMaterial({ color: 0xffd60a }),
  }

  const mug = new THREE.Group()
  const add = (geo, mat, fn) => {
    const m = new THREE.Mesh(geo, mat)
    fn?.(m)
    mug.add(m)
    return m
  }
  add(new THREE.CylinderGeometry(R, R, H, 128, 1, true), mats.outer)
  add(new THREE.CylinderGeometry(R - WALL, R - WALL, H - 0.1, 96, 1, true), mats.inner, (m) => (m.position.y = 0.05))
  add(new THREE.RingGeometry(R - WALL, R, 128), mats.body, (m) => {
    m.rotation.x = -Math.PI / 2
    m.position.y = H / 2
  })
  add(new THREE.CircleGeometry(R, 96), mats.body, (m) => {
    m.rotation.x = Math.PI / 2
    m.position.y = -H / 2
  })
  add(new THREE.CircleGeometry(R - WALL, 96), mats.innerFloor, (m) => {
    m.rotation.x = -Math.PI / 2
    m.position.y = -H / 2 + 0.1
  })
  const coffee = add(new THREE.CircleGeometry(R - WALL - 0.005, 96), mats.coffee, (m) => (m.rotation.x = -Math.PI / 2))
  add(new THREE.TorusGeometry(0.62, 0.125, 24, 64, Math.PI), mats.body, (m) => {
    m.rotation.z = -Math.PI / 2
    m.scale.set(1.15, 0.95, 0.85) // local x becomes height after the turn
    m.position.x = R - 0.04
  })

  // The animated fill inside the printed track.
  const insetU = 14 / TEX_W
  const fillStart = angle(BAR.x0 + insetU)
  const fillSpan = angle(BAR.x1 - insetU) - fillStart
  const fillH = ((56 - 28) / TEX_H) * H
  const fillY = H / 2 - BAR.y * H
  const fillMesh = add(new THREE.BufferGeometry(), mats.ink, (m) => (m.position.y = fillY))
  let fillShown = -1
  const setFill = (p) => {
    const v = Math.max(0.0001, Math.min(1, p))
    if (Math.abs(v - fillShown) < 0.002) return
    fillShown = v
    fillMesh.geometry.dispose()
    fillMesh.geometry = new THREE.CylinderGeometry(R + 0.004, R + 0.004, fillH, 64, 1, true, fillStart, fillSpan * v)
    fillMesh.visible = p > 0.004
  }

  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(4.6, 4.6),
    new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false }),
  )
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = -H / 2 - 0.005
  const rig = new THREE.Group()
  rig.add(mug, shadow)
  scene.add(rig)

  const state = { progress: 0, drag: 0, shown: { fill: 0, rot: 0.55, level: 0 } }
  let width = 1
  let height = 1
  let disposed = false

  function setColor(color) {
    mats.body.color.set(color.hex)
    mats.body.roughness = mats.outer.roughness = color.rough
    mats.inner.color.set(color.inner)
    mats.innerFloor.color.set(color.inner)
    mats.inner.roughness = mats.innerFloor.roughness = color.rough
    mats.ink.color.set(INK[color.ink])
    drawWrap(wrapCanvas, color).then(() => {
      if (disposed) return
      wrap.needsUpdate = true
      render()
    })
  }

  function resize() {
    const el = canvas.parentElement
    width = el.clientWidth || 1
    height = el.clientHeight || 1
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    // Pull the camera back on narrow stages so the handle never clips.
    const dist = Math.max(6.1, 7.9 / camera.aspect)
    camera.position.set(0, dist * 0.34, dist)
    camera.lookAt(0, 0.02, 0)
    camera.updateProjectionMatrix()
    render()
  }

  // progress 0..1: the bar fills over the first 75%, then the mug turns to show the logo.
  function targets() {
    const p = state.progress
    const fillP = Math.min(1, p / 0.75)
    const turn = THREE.MathUtils.smoothstep(p, 0.8, 1)
    return {
      fill: fillP,
      // follow the head of the fill, then keep turning the same way until the logo faces us
      rot: THREE.MathUtils.lerp(THREE.MathUtils.lerp(0.55, -0.45, fillP), -Math.PI, turn) + state.drag,
      level: fillP,
    }
  }

  function render() {
    if (disposed) return
    const s = state.shown
    setFill(s.fill)
    mug.rotation.y = s.rot
    coffee.position.y = THREE.MathUtils.lerp(H / 2 - 0.14, H / 2 - 1.25, s.level)
    renderer.render(scene, camera)
  }

  // Ease toward the targets; returns true while still moving.
  function step() {
    const t = targets()
    const s = state.shown
    let moving = false
    for (const k of ['fill', 'rot', 'level']) {
      const d = t[k] - s[k]
      if (Math.abs(d) > 0.0005) {
        s[k] += d * 0.14
        moving = true
      } else s[k] = t[k]
    }
    render()
    return moving
  }

  setColor(firstColor)
  resize()

  return {
    setColor,
    resize,
    step,
    setProgress: (p) => (state.progress = p),
    setDrag: (d) => (state.drag = d),
    getDrag: () => state.drag,
    dispose() {
      disposed = true
      scene.traverse((o) => {
        o.geometry?.dispose()
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { m.map?.dispose(); m.dispose() })
      })
      renderer.dispose()
    },
  }
}
