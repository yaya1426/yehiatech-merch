import { sizeTable, specs } from '../lib/data.js'

function SizeTable({ title, rows }) {
  return (
    <div className="table" data-reveal>
      <h3>
        {title} <span className="mono" style={{ fontSize: 12, fontWeight: 400 }}>cm</span>
      </h3>
      <table>
        <thead>
          <tr>
            <th>المقاس</th>
            <th>الطول</th>
            <th>عرض الصدر</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([size, length, chest]) => (
            <tr key={size}>
              <td>{size}</td>
              <td>{length}</td>
              <td>{chest}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Details() {
  return (
    <section className="section" id="details" data-file="sizes.csv">
      <div data-reveal>
        <span className="eyebrow">05 · sizes.csv</span>
        <h2 className="h2">المقاسات والتفاصيل.</h2>
        <p className="lead">القصّة واسعة شوية. لو إنت بين مقاسين، خد الأصغر.</p>
      </div>
      <div className="tables">
        <SizeTable title="الهودي" rows={sizeTable.hoodie} />
        <SizeTable title="التيشيرت" rows={sizeTable.tee} />
      </div>
      <div className="specs">
        {specs.map((s) => (
          <div className="spec" key={s.title} data-reveal>
            <h3>{s.title}</h3>
            <ul>
              {s.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
