import { useState } from 'react'
import { useCart } from '../lib/cart.jsx'
import { CURRENCY } from '../lib/data.js'

export function Swatches({ colors, value, onChange }) {
  return (
    <div className="swatches" role="radiogroup" aria-label="اللون">
      {colors.map((c) => (
        <button
          key={c.id}
          role="radio"
          aria-checked={c.id === value}
          aria-label={c.name}
          title={c.name}
          className={`swatch${c.id === value ? ' is-on' : ''}`}
          style={{ background: c.hex }}
          onClick={() => onChange(c.id)}
          data-cursor={c.name}
        />
      ))}
    </div>
  )
}

// Price, colour, size and add-to-cart for one product.
export default function Buy({ product, color, onColor, note }) {
  const { add } = useCart()
  const [size, setSize] = useState(product.sizes ? 'L' : null)
  const picked = product.colors.find((c) => c.id === color)

  return (
    <div className="buy" data-reveal>
      <div className="buy__row">
        <span className="buy__name">{product.name}</span>
        <span className="buy__price">{product.price} {CURRENCY}</span>
      </div>
      {product.colors.length > 1 && (
        <div className="buy__row">
          <span className="buy__label">اللون</span>
          <Swatches colors={product.colors} value={color} onChange={onColor} />
          <span className="buy__picked">{picked?.name}</span>
        </div>
      )}
      {product.sizes && (
        <div className="buy__row">
          <span className="buy__label">المقاس</span>
          <div className="sizes" role="radiogroup" aria-label="المقاس">
            {product.sizes.map((s) => (
              <button
                key={s}
                role="radio"
                aria-checked={s === size}
                className={`size${s === size ? ' is-on' : ''}`}
                onClick={() => setSize(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="buy__go">
        <button className="btn btn--wide" onClick={() => add(product.id, color, size)} data-cursor="ضيف">
          ضيف للسلة <span aria-hidden="true">+</span>
        </button>
        {note && <p className="buy__small">{note}</p>}
      </div>
    </div>
  )
}
