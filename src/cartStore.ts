import { getProductById, type Product } from './productStore'

const CART_STORAGE_KEY = 'dinoclass_cart'

export interface CartItem {
  productId: string
  addedAt: number
}

// 초기 장바구니 로드
function loadCart(): CartItem[] {
  try {
    const data = localStorage.getItem(CART_STORAGE_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('Failed to load cart', e)
  }
  return []
}

// 장바구니 저장
function saveCart(cart: CartItem[]) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  // 커스텀 이벤트를 발생시켜 다른 컴포넌트(예: 헤더)에서 장바구니 변경을 감지할 수 있게 함
  window.dispatchEvent(new Event('cartUpdated'))
}

export function getCartItems(): CartItem[] {
  return loadCart()
}

export function getCartProducts(): Product[] {
  const cart = loadCart()
  const products: Product[] = []
  cart.forEach(item => {
    const p = getProductById(item.productId)
    if (p) products.push(p)
  })
  return products
}

export function addToCart(productId: string) {
  const cart = loadCart()
  // 이미 담겨있다면 리턴 (디지털 상품이므로 중복 불가)
  if (cart.find(c => c.productId === productId)) {
    return false // 이미 존재함
  }
  cart.push({ productId, addedAt: Date.now() })
  saveCart(cart)
  return true // 추가됨
}

export function removeFromCart(productId: string) {
  let cart = loadCart()
  cart = cart.filter(c => c.productId !== productId)
  saveCart(cart)
}

export function clearCart() {
  saveCart([])
}

export function getCartCount(): number {
  return loadCart().length
}
