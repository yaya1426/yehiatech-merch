import { svgMarkup } from '../lib/assets.js'
import { YOUTUBE_URL } from '../lib/data.js'
import { go } from './Header.jsx'

const links = [
  ['hoodie', 'الهودي'],
  ['tee', 'التيشيرت'],
  ['mug', 'المج'],
  ['stickers', 'الاستيكرز'],
  ['details', 'المقاسات'],
  ['faq', 'الأسئلة'],
]

export default function Footer() {
  return (
    <footer className="foot">
      <div className="foot__logo" dangerouslySetInnerHTML={{ __html: svgMarkup('brand/logo-full.svg') }} />
      <div className="foot__row">
        <nav className="foot__nav" aria-label="روابط آخر الصفحة">
          {links.map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={(e) => go(e, id)}>
              {label}
            </a>
          ))}
          <a href={YOUTUBE_URL} target="_blank" rel="noreferrer">
            يوتيوب ↗
          </a>
        </nav>
        <small>
          متجر تجريبي من <span className="ltr">Yehia Tech</span>. مفيش بيع حقيقي لسه.
          <span className="mono" style={{ marginInlineStart: 12 }}>exit 0</span>
        </small>
      </div>
    </footer>
  )
}
