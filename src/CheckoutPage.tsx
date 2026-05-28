import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, CreditCard, ShieldCheck, Loader2 } from 'lucide-react'
import { loadTossPayments } from '@tosspayments/tosspayments-sdk'
import { getProductById, CATEGORY_LABELS, type Product } from './productStore'
import { getCartProducts } from './cartStore'

// 토스페이먼츠 문서용 테스트 결제위젯 키 (실제 결제 안 됨)
const TOSS_CLIENT_KEY = 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm'

/** 가격 문자열에서 숫자만 추출 ("39,000원" → 39000) */
function parsePriceToNumber(priceStr: string): number {
  const num = Number(priceStr.replace(/[^0-9]/g, ''))
  return isNaN(num) ? 0 : num
}

export default function CheckoutPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const productId = searchParams.get('productId')
  const isCart = searchParams.get('isCart') === 'true'

  const [checkoutItems, setCheckoutItems] = useState<Product[]>([])
  const [ready, setReady] = useState(false)
  const [paying, setPaying] = useState(false)
  
  const widgetsRef = useRef<Awaited<ReturnType<Awaited<ReturnType<typeof loadTossPayments>>['widgets']>> | null>(null)
  const paymentMethodRef = useRef<HTMLDivElement>(null)
  const agreementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    
    let isMounted = true;
    const fetchData = async () => {
      if (isCart) {
        const cartItems = await getCartProducts()
        if (isMounted && cartItems.length > 0) setCheckoutItems(cartItems)
      } else if (productId) {
        const found = await getProductById(productId)
        if (isMounted && found) setCheckoutItems([found])
      }
    }
    fetchData();
    return () => { isMounted = false; }
  }, [productId, isCart])

  const totalAmount = checkoutItems.reduce((sum, item) => sum + parsePriceToNumber(item.price), 0)

  // 대표 주문명 생성
  let orderName = ''
  if (checkoutItems.length === 1) {
    orderName = checkoutItems[0].name
  } else if (checkoutItems.length > 1) {
    orderName = `${checkoutItems[0].name} 외 ${checkoutItems.length - 1}건`
  }

  /* ── 토스페이먼츠 결제위젯 초기화 및 렌더링 ── */
  useEffect(() => {
    if (checkoutItems.length === 0 || totalAmount <= 0) return

    let destroyed = false

    ;(async () => {
      try {
        const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY)
        const widgets = tossPayments.widgets({ customerKey: 'ANONYMOUS' })
        widgetsRef.current = widgets

        await widgets.setAmount({ currency: 'KRW', value: totalAmount })

        if (destroyed) return

        // 결제 수단 UI 렌더링
        await widgets.renderPaymentMethods({
          selector: '#payment-method',
        })

        // 약관 UI 렌더링
        await widgets.renderAgreement({
          selector: '#agreement',
        })

        if (!destroyed) setReady(true)
      } catch (err) {
        console.error('결제 위젯 초기화 실패:', err)
      }
    })()

    return () => { destroyed = true }
  }, [checkoutItems, totalAmount])

  /* ── 결제 요청 ── */
  const handlePay = async () => {
    if (!widgetsRef.current || checkoutItems.length === 0) return
    setPaying(true)
    try {
      const orderId = isCart ? `order-cart-${Date.now()}` : `order-${checkoutItems[0].id}-${Date.now()}`
      const pIdParam = !isCart ? `&productId=${checkoutItems[0].id}` : ''
      await widgetsRef.current.requestPayment({
        orderId,
        orderName,
        successUrl: `${window.location.origin}/payment/success?isCart=${isCart}${pIdParam}`,
        failUrl: `${window.location.origin}/payment/fail`,
      })
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string }
      if (error.code !== 'USER_CANCEL') {
        console.error('결제 요청 실패:', error)
        alert(`결제 요청 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`)
      }
    } finally {
      setPaying(false)
    }
  }

  /* ── 상품 없음 ── */
  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-bold mb-4">상품 정보를 찾을 수 없습니다</h2>
          <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 bg-dinoclass-spark text-black font-bold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-colors">
            <ArrowLeft size={18} /> 메인으로 돌아가기
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* 뒤로가기 */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-dinoclass-textSub hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">뒤로가기</span>
      </motion.button>

      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8"
      >
        <div className="w-12 h-12 rounded-xl bg-dinoclass-spark/10 flex items-center justify-center">
          <CreditCard className="text-dinoclass-spark" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">결제하기</h1>
          <p className="text-dinoclass-textSub text-sm">토스페이먼츠 안전결제</p>
        </div>
      </motion.div>

      {/* 주문 요약 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-dinoclass-surface/50 rounded-2xl p-6 mb-8 border border-dinoclass-surface"
      >
        <h3 className="text-sm text-dinoclass-textSub font-bold mb-4 border-b border-dinoclass-surface pb-3">주문 상품 ({checkoutItems.length}개)</h3>
        
        <div className="space-y-4 mb-4">
          {checkoutItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4">
              {item.imageUrl && (
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-900 flex-shrink-0">
                  <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-grow">
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded mb-1 ${
                  item.category === 'ebook' ? 'bg-blue-500/15 text-blue-400' :
                  item.category === 'vod' ? 'bg-purple-500/15 text-purple-400' :
                  'bg-emerald-500/15 text-emerald-400'
                }`}>
                  {CATEGORY_LABELS[item.category]}
                </span>
                <p className="font-bold text-white text-sm">{item.name}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-white font-mono">{item.price}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-dinoclass-surface pt-4 flex justify-between items-center">
          <span className="text-dinoclass-textSub">총 결제 금액</span>
          <span className="text-2xl font-bold font-mono text-dinoclass-spark">
            {totalAmount.toLocaleString()}원
          </span>
        </div>
      </motion.div>

      {/* 토스페이먼츠 결제 수단 위젯 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl overflow-hidden mb-4"
      >
        <div id="payment-method" ref={paymentMethodRef} className="min-h-[200px]">
          {!ready && (
            <div className="flex flex-col items-center justify-center h-[200px] gap-3">
              <Loader2 className="text-zinc-400 animate-spin" size={28} />
              <p className="text-zinc-500 text-sm">결제 수단을 불러오는 중...</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* 약관 동의 위젯 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl overflow-hidden mb-8"
      >
        <div id="agreement" ref={agreementRef} />
      </motion.div>

      {/* 결제 버튼 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <button
          onClick={handlePay}
          disabled={!ready || paying}
          className="w-full flex items-center justify-center gap-3 bg-dinoclass-spark text-black font-bold py-5 rounded-2xl text-lg hover:bg-yellow-400 transition-all hover:shadow-[0_0_24px_rgba(254,232,0,0.25)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {paying ? (
            <><Loader2 size={20} className="animate-spin" /> 결제 진행 중...</>
          ) : (
            <><ShieldCheck size={20} /> {totalAmount.toLocaleString()}원 결제하기</>
          )}
        </button>

        <div className="flex items-center justify-center gap-2 mt-4 text-dinoclass-textSub text-xs">
          <ShieldCheck size={12} />
          <span>토스페이먼츠 테스트 모드 · 실제 결제 금액이 청구되지 않습니다</span>
        </div>
      </motion.div>
    </div>
  )
}

