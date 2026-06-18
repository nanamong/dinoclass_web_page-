import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, ArrowLeft, Rocket } from 'lucide-react'
import { clearCart, getCartProducts } from './cartStore'
import { addOrder } from './orderStore'
import { getProductById, type Product } from './productStore'
import { useMyCourseStore } from './myCourseStore'
import { useAuthStore } from './authStore'

export default function PaymentSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [orderId, setOrderId] = useState('')
  const [amount, setAmount] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
    
    const oid = searchParams.get('orderId')
    const amt = searchParams.get('amount')
    const isCart = searchParams.get('isCart') === 'true'
    const productId = searchParams.get('productId')

    if (oid) setOrderId(oid)
    if (amt) setAmount(amt)

    if (oid && amt) {
      const processOrder = async () => {
        let items: Product[] = []
        let orderName = ''

        if (isCart) {
          items = await getCartProducts()
          if (items.length === 1) orderName = items[0].name
          else if (items.length > 1) orderName = `${items[0].name} 외 ${items.length - 1}건`
        } else if (productId) {
          const prod = await getProductById(productId)
          if (prod) {
            let selectedOption = undefined
            if (prod.category === 'vod' && prod.lifetimePrice && searchParams.get('option') === 'lifetime') {
              selectedOption = { name: '무기한 평생 수강권', price: Number(prod.lifetimePrice.replace(/[^0-9]/g, '')) }
            }
            items = [{ ...prod, selectedOption }] as any
            orderName = prod.name
          }
        }

        addOrder({
          id: oid,
          orderName,
          amount: Number(amt),
          items,
          status: 'SUCCESS',
          createdAt: new Date().toISOString()
        })

        if (isCart) {
          clearCart()
        }

        // 수강 목록에 추가
        items.forEach((item: any) => {
          useMyCourseStore.getState().enroll(item, item.selectedOption)
        })

        // 구글 시트 웹훅 연동 전송 (유료 상품 구매자)
        try {
          const webhookUrl = localStorage.getItem('google_sheet_webhook_url');
          if (webhookUrl && webhookUrl.trim() && Number(amt) > 0) { // 무료 강의(0원)는 제외하려면 금액 체크
            const payload = {
              type: 'purchase',
              orderId: oid,
              amount: Number(amt),
              orderName: orderName,
              customerName: useAuthStore.getState().user?.name || '비회원',
              customerEmail: useAuthStore.getState().user?.email || '알 수 없음',
              createdAt: new Date().toISOString()
            };
            fetch(webhookUrl.trim(), {
              method: 'POST',
              mode: 'no-cors',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            }).catch(err => console.error('Purchase webhook send failed:', err));
          }
        } catch (e) {
          console.error('Purchase webhook error:', e);
        }
      }
      processOrder();
    }
  }, [searchParams])

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-md w-full text-center"
      >
        {/* 성공 아이콘 */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle2 className="text-emerald-400" size={48} />
        </motion.div>

        {/* 메시지 */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold mb-3 text-white"
        >
          결제가 완료되었습니다!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-dinoclass-textSub text-lg mb-8"
        >
          감사합니다. 구매하신 콘텐츠를 지금 바로 이용하실 수 있습니다.
        </motion.p>

        {/* 주문 정보 */}
        {(orderId || amount) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-dinoclass-surface/50 border border-dinoclass-surface rounded-xl p-6 mb-8 text-left"
          >
            {orderId && (
              <div className="flex justify-between items-center mb-3">
                <span className="text-dinoclass-textSub text-sm">주문번호</span>
                <span className="text-white text-sm font-mono">{orderId}</span>
              </div>
            )}
            {amount && (
              <div className="flex justify-between items-center">
                <span className="text-dinoclass-textSub text-sm">결제금액</span>
                <span className="text-dinoclass-spark font-bold font-mono">{Number(amount).toLocaleString()}원</span>
              </div>
            )}
          </motion.div>
        )}

        {/* 버튼 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col gap-3"
        >
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 bg-dinoclass-spark text-black font-bold py-4 px-8 rounded-xl hover:bg-yellow-400 transition-all"
          >
            <Rocket size={18} />
            메인으로 돌아가기
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center gap-2 bg-dinoclass-surface border border-dinoclass-surface text-dinoclass-textSub font-bold py-3 px-8 rounded-xl hover:text-white hover:border-dinoclass-spark/40 transition-all"
          >
            <ArrowLeft size={16} />
            이전 페이지
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}
