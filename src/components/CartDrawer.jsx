import { useEffect, useRef, useState } from 'react'
import { asset } from '../lib/assets.js'
import { useCart } from '../lib/cart.jsx'
import { CURRENCY, products } from '../lib/data.js'
import { lockScroll } from '../lib/scroll.js'

export default function CartDrawer() {
  const { items, total, open, setOpen, changeQty, remove } = useCart()
  const [note, setNote] = useState(false)
  const closeBtn = useRef(null)

  useEffect(() => {
    lockScroll(open)
    if (!open) {
      setNote(false)
      return
    }
    closeBtn.current?.focus()
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, setOpen])

  return (
    <>
      <div className={`scrim${open ? ' is-on' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`drawer${open ? ' is-on' : ''}`} role="dialog" aria-modal="true" aria-label="السلة" data-lenis-prevent>
        <div className="drawer__head">
          <h2>السلة</h2>
          <button className="drawer__x" onClick={() => setOpen(false)} aria-label="اقفل السلة" ref={closeBtn}>
            ✕
          </button>
        </div>

        <div className="drawer__list">
          {items.length === 0 && (
            <div className="drawer__empty">
              السلة فاضية… زي ملف جديد.
              <span className="mono">// TODO: add merch</span>
            </div>
          )}
          {items.map((item) => {
            const p = products[item.product]
            const color = p.colors.find((c) => c.id === item.color)
            return (
              <div className="item" key={item.key}>
                <img src={asset(p.image(item.color))} alt="" />
                <div>
                  <b>{p.name}</b>
                  <small>
                    {color?.name}
                    {item.size && <> · <span className="mono">{item.size}</span></>}
                  </small>
                  <div>
                    <span className="item__qty">
                      <button onClick={() => changeQty(item.key, -1)} aria-label="قلّل الكمية">−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => changeQty(item.key, 1)} aria-label="زوّد الكمية">+</button>
                    </span>
                  </div>
                </div>
                <div className="item__side">
                  {p.price * item.qty} {CURRENCY}
                  <button onClick={() => remove(item.key)}>شيل</button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="drawer__foot">
          <div className="drawer__total">
            <span>الإجمالي</span>
            <span>{total} {CURRENCY}</span>
          </div>
          <button className="btn btn--wide" disabled={items.length === 0} onClick={() => setNote(true)}>
            كمّل الطلب
          </button>
          {note && (
            <p className="drawer__note" role="status">
              ده متجر تجريبي. البيع لسه ما فتحش، ومفيش دفع ولا أي بيانات اتسجلت.
            </p>
          )}
        </div>
      </aside>
    </>
  )
}
