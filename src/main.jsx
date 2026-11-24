import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { CartProvider } from './lib/cart.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <CartProvider>
    <App />
  </CartProvider>,
)
