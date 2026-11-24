// Every image, video and vector in /assets, addressed by its path inside that folder.
const urls = import.meta.glob('/assets/**/*.{webp,mp4,svg}', { eager: true, query: '?url', import: 'default' })
const raws = import.meta.glob('/assets/{brand,print}/*.svg', { eager: true, query: '?raw', import: 'default' })

export function asset(path) {
  const url = urls['/assets/' + path]
  if (!url) console.warn('Missing asset:', path)
  return url
}

export function rawSvg(path) {
  return raws['/assets/' + path] || ''
}

// Inline SVG markup with the root <svg> given a class, so CSS can size and colour it.
export function svgMarkup(path, className = '') {
  return rawSvg(path).replace('<svg ', `<svg class="${className}" `)
}
