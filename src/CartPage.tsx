import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ShoppingCart, Trash2, CreditCard } from 'lucide-react'
import { type Product } from './productStore'
import { getCartProducts as getCartProds, removeFromCart as removeCartItem } from './cartStore'
import { CATEGORY_LABELS } from './productStore'

function parsePrice(priceStr: string): number {
  const num = Number(priceStr.replace(/[^0-9]/g, ''))
  return isNaN(num) ? 0 : num
}

export default function CartPage() {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState<(Product & { selectedOption?: { name: string; price: number } })[]>([])

  useEffect(() => {
    window.scrollTo(0, 0)
    getCartProds().then(setCartItems)
  }, [])

  const handleRemove = async (id: string) => {
    removeCartItem(id)
    const prods = await getCartProds()
    setCartItems(prods)
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) return
    navigate('/checkout?isCart=true')
  }

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.selectedOption ? item.selectedOption.price : parsePrice(item.price)), 0)

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 min-h-[70vh]">
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-dinoclass-textSub hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">뒤로가기</span>
      </motion.button>

      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-8 flex items-center gap-3"
      >
        <ShoppingCart className="text-dinoclass-spark" size={32} />
        장바구니
      </motion.h1>

      {cartItems.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-dinoclass-surface/30 rounded-2xl border border-dinoclass-surface"
        >
          <div className="w-16 h-16 bg-dinoclass-surface rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-600">
            <ShoppingCart size={32} />
          </div>
          <p className="text-dinoclass-textSub text-lg mb-6">장바구니에 담긴 상품이 없습니다.</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-dinoclass-spark text-black px-6 py-3 rounded-xl font-bold hover:bg-yellow-400 transition-colors"
          >
            상품 보러가기
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cartItems.map((item) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
                  className="bg-dinoclass-surface/50 rounded-2xl p-4 border border-dinoclass-surface flex gap-4 items-center overflow-hidden"
                >
                  <div className="w-20 h-20 rounded-xl bg-zinc-900 flex-shrink-0 overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700">Img</div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <span className="text-[10px] bg-dinoclass-surface px-2 py-0.5 rounded text-dinoclass-textSub mb-1 inline-block">
                      {CATEGORY_LABELS[item.category]}
                    </span>
                    <h3 className="font-bold text-white leading-tight">{item.name}</h3>
                    {item.selectedOption && (
                      <p className="text-sm text-dinoclass-textSub mt-1">옵션: {item.selectedOption.name}</p>
                    )}
                    <p className="text-dinoclass-spark font-bold mt-1 font-mono">
                      {item.selectedOption ? `${item.selectedOption.price.toLocaleString()}원` : item.price}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleRemove(item.id)}
                    className="p-3 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-dinoclass-surface/50 rounded-2xl p-6 border border-dinoclass-surface sticky top-24">
              <h3 className="text-lg font-bold mb-4 border-b border-dinoclass-surface pb-4">결제 요약</h3>
              <div className="flex justify-between items-center mb-4 text-dinoclass-textSub">
                <span>총 상품 금액</span>
                <span>{totalPrice.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between items-center mb-6 text-xl font-bold">
                <span>총 결제 금액</span>
                <span className="text-dinoclass-spark font-mono">{totalPrice.toLocaleString()}원</span>
              </div>
              <button 
                onClick={handleCheckout}
                className="w-full bg-dinoclass-spark text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-400 hover:shadow-[0_0_20px_rgba(254,232,0,0.2)] transition-all"
              >
                <CreditCard size={20} />
                결제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
