import { asset } from '../lib/assets.js'
import { YOUTUBE_URL } from '../lib/data.js'
import { go } from './Header.jsx'

export default function About() {
  return (
    <section className="section" id="about" data-file="README.md">
      <div className="about">
        <div className="about__img" data-reveal>
          <img src={asset('lifestyle/about-yehia.webp')} alt="يحيى لابس تيشيرت git diff" loading="lazy" />
          <span>يحيى</span>
        </div>
        <div data-reveal>
          <span className="eyebrow">06 · README.md</span>
          <h2 className="h2">أنا يحيى.</h2>
          <p className="lead">
            بعمل فيديوهات عن هندسة البرمجيات والذكاء الاصطناعي على قناة <span className="ltr">Yehia Tech</span>.
          </p>
          <p className="lead">
            الميرش ده معمول للناس اللي بتتفرج: مطوّرين ومصممين بيحبوا الحاجة البسيطة، وبيفهموا النكتة من غير شرح.
          </p>
          <div className="hero__cta">
            <a className="btn btn--ink" href={YOUTUBE_URL} target="_blank" rel="noreferrer" data-cursor="افتح">
              القناة على يوتيوب <span aria-hidden="true">↗</span>
            </a>
            <a className="btn btn--ghost" href="#faq" onClick={(e) => go(e, 'faq')} data-cursor="روح">
              عندك سؤال؟
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
