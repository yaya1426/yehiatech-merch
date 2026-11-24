import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { products } from './data.js'

const CartContext = createContext(null)
const KEY = 'yehiatech-merch-cart'

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(saved) ? saved.filter((i) => products[i.product]) : []
  } catch {
    return []
  }
}

function reducer(items, action) {
  switch (action.type) {
    case 'add': {
      const key = [action.product, action.color, action.size || ''].join('|')
      const found = items.find((i) => i.key === key)
      if (found) return items.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i))
      return [...items, { key, product: action.product, color: action.color, size: action.size || null, qty: 1 }]
    }
    case 'qty':
      return items
        .map((i) => (i.key === action.key ? { ...i, qty: i.qty + action.delta } : i))
        .filter((i) => i.qty > 0)
    case 'remove':
      return items.filter((i) => i.key !== action.key)
    case 'clear':
      return []
    default:
      return items
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, undefined, load)
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const timer = useRef()

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items))
    } catch {
      /* storage unavailable: the cart still works for this visit */
    }
  }, [items])

  const value = useMemo(() => {
    const count = items.reduce((n, i) => n + i.qty, 0)
    const total = items.reduce((n, i) => n + i.qty * products[i.product].price, 0)
    return {
      items,
      count,
      total,
      open,
      toast,
      setOpen,
      add(product, color, size) {
        dispatch({ type: 'add', product, color, size })
        clearTimeout(timer.current)
        setToast({ id: Date.now(), text: `${products[product].name} اتضاف للسلة` })
        timer.current = setTimeout(() => setToast(null), 2200)
      },
      changeQty: (key, delta) => dispatch({ type: 'qty', key, delta }),
      remove: (key) => dispatch({ type: 'remove', key }),
      clear: () => dispatch({ type: 'clear' }),
    }
  }, [items, open, toast])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
