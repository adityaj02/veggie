import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('veggies_cart')
      return saved ? JSON.parse(saved) : []
    } catch (_e) {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('veggies_cart', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = useCallback((item) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.name === item.name)
      if (existing) {
        return prev.map(i => i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }, [])

  const updateQuantity = useCallback((name, delta) => {
    setCartItems(prev => {
      return prev.map(i => {
        if (i.name === name) {
          const newQuantity = i.quantity + delta
          return { ...i, quantity: Math.max(0, newQuantity) }
        }
        return i
      }).filter(i => i.quantity > 0)
    })
  }, [])

  const removeFromCart = useCallback((name) => {
    setCartItems(prev => prev.filter(i => i.name !== name))
  }, [])

  const clearCart = useCallback(() => setCartItems([]), [])

  const replaceCart = useCallback((items) => {
    setCartItems(items)
  }, [])

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)

  const cartSubtotal = cartItems.reduce((acc, item) => {
    const priceStr = String(item.price).replace(/[^0-9.]/g, '')
    const priceNum = parseFloat(priceStr) || 0
    return acc + (priceNum * item.quantity)
  }, 0)

  const taxes = cartSubtotal * 0.05
  const delivery = cartSubtotal > 0 ? 40 : 0
  const cartTotal = cartSubtotal + taxes + delivery

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      replaceCart,
      cartCount,
      cartSubtotal,
      taxes,
      delivery,
      cartTotal,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
