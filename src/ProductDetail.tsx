import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ShoppingCart, Rocket, Tag } from 'lucide-react'
import { getProductById, CATEGORY_LABELS, type Product, parseDetailBlocks } from './productStore'
import { addToCart } from './cartStore'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [dbError, setDbError] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!id) { setNotFound(true); return }
    
    let isMounted = true;
    const fetchProduct = async () => {
      try {
        const found = await getProductById(id)
        if (!isMounted) return;
        if (found) {
          setProduct(found)
        } else {
          setNotFound(true)
        }
      } catch (err) {
        if (!isMounted) return;
        setDbError(true)
      }
    }
    fetchProduct();
    return () => { isMounted = false; }
  }, [id])

  /* ── 결제 페이지로 이동 ── */
  const handlePayment = () => {
    if (!product) return
    navigate(`/checkout?productId=${product.id}`)
  }

  /* ── 장바구니 담기 ── */
  const handleAddToCart = () => {
    if (!product) return
    const added = addToCart(product.id)
    if (added) {
      if (window.confirm('장바구니에 담겼습니다. 장바구니로 이동하시겠습니까?')) {
        navigate('/cart')
      }
    } else {
      alert('이미 장바구니에 담긴 상품입니다.')
    }
  }

  /* ── 상품 없음 (404) ── */
  if (notFound) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-20 h-20 rounded-2xl bg-dinoclass-surface flex items-center justify-center mx-auto mb-6">
            <Rocket className="text-dinoclass-spark" size={36} />
          </div>
          <h2 className="text-3xl font-bold mb-4">상품을 찾을 수 없습니다</h2>
          <p className="text-dinoclass-textSub mb-8 max-w-md mx-auto">
            요청하신 상품이 존재하지 않거나 삭제되었을 수 있습니다.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 bg-dinoclass-spark text-black font-bold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-colors"
          >
            <ArrowLeft size={18} />
            메인으로 돌아가기
          </button>
        </motion.div>
      </div>
    )
  }

  /* ── DB 통신 에러 ── */
  if (dbError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-20 h-20 rounded-2xl bg-dinoclass-surface flex items-center justify-center mx-auto mb-6">
            <Rocket className="text-red-400" size={36} />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-red-400">데이터베이스 오류</h2>
          <p className="text-dinoclass-textSub mb-8 max-w-md mx-auto">
            데이터베이스(Supabase)가 일시 정지(Pause) 상태이거나 연결에 실패했습니다.<br />
            무료 요금제의 경우 프로젝트 대시보드에 접속하여 다시 활성화해주세요.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 bg-dinoclass-spark text-black font-bold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-colors"
          >
            <ArrowLeft size={18} />
            메인으로 돌아가기
          </button>
        </motion.div>
      </div>
    )
  }

  /* ── 로딩 ── */
  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-dinoclass-spark border-t-transparent animate-spin" />
      </div>
    )
  }

  /* ── 상세 페이지 렌더링 ── */
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* 뒤로가기 */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-dinoclass-textSub hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">뒤로가기</span>
      </motion.button>

      {/* 상품 정보 상단 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        {/* 좌측: 상품 이미지 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden border border-dinoclass-surface bg-dinoclass-surface aspect-square object-cover flex items-center justify-center"
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-zinc-600">
              <Rocket size={48} />
              <span className="text-sm font-medium">상품 이미지</span>
            </div>
          )}
        </motion.div>

        {/* 우측: 상품 정보 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col justify-center"
        >
          {/* 카테고리 뱃지 */}
          <div className="flex items-center gap-2 mb-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
              product.category === 'ebook'
                ? 'bg-blue-500/15 text-blue-400'
                : product.category === 'vod'
                ? 'bg-purple-500/15 text-purple-400'
                : 'bg-emerald-500/15 text-emerald-400'
            }`}>
              <Tag size={12} />
              {CATEGORY_LABELS[product.category]}
            </span>
          </div>

          {/* 상품명 */}
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            {product.name}
          </h1>

          {/* 한 줄 설명 */}
          {product.description && (
            <p className="text-dinoclass-textSub text-lg mb-6 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* 가격 */}
          <div className="flex items-baseline gap-3 mb-8">
            <span className="text-4xl font-bold font-mono text-dinoclass-spark">
              {product.price}
            </span>
            <span className="text-dinoclass-textSub text-sm">
              (단건 결제 · 평생 소장)
            </span>
          </div>

          {/* CTA 버튼 */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handlePayment}
              className="flex-1 flex items-center justify-center gap-3 bg-dinoclass-spark text-black font-bold py-4 px-8 rounded-xl text-lg hover:bg-yellow-400 transition-all hover:shadow-[0_0_24px_rgba(254,232,0,0.25)] active:scale-[0.98]"
            >
              <ShoppingCart size={20} /> 구매하기
            </button>
            <button 
              onClick={handleAddToCart}
              className="flex items-center justify-center gap-2 bg-dinoclass-surface border border-dinoclass-surface text-white font-bold py-4 px-6 rounded-xl hover:border-dinoclass-spark/40 transition-all"
            >
              장바구니 담기
            </button>
          </div>

          {/* 안내 */}
          <div className="mt-6 bg-dinoclass-surface/50 rounded-xl p-4 border border-dinoclass-surface">
            <ul className="space-y-2 text-sm text-dinoclass-textSub">
              <li className="flex items-center gap-2">
                <span className="text-dinoclass-spark">✓</span> 결제 즉시 콘텐츠 이용 가능
              </li>
              <li className="flex items-center gap-2">
                <span className="text-dinoclass-spark">✓</span> 한 번 결제로 평생 무제한 소장
              </li>
              <li className="flex items-center gap-2">
                <span className="text-dinoclass-spark">✓</span> 디지털 상품 특성상 환불 불가
              </li>
            </ul>
          </div>
        </motion.div>
      </div>

      {/* ── 상세 설명 영역 ── */}
      {(product.detailContent && product.detailContent.trim()) ? (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="border-t border-dinoclass-surface pt-12">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <div className="w-1 h-6 bg-dinoclass-spark rounded-full" />
              상세 설명
            </h2>
            <div className="bg-dinoclass-surface/30 rounded-2xl p-8 md:p-12 border border-dinoclass-surface">
              <div className="prose-detail max-w-none flex flex-col gap-6">
                {parseDetailBlocks(product.detailContent).map((block) => (
                  <div key={block.id}>
                    {block.type === 'text' ? (
                      <div className={`
                        ${block.align === 'center' ? 'text-center' : block.align === 'right' ? 'text-right' : 'text-left'}
                        ${block.size === 'h1' ? 'text-3xl font-bold mt-8 mb-4' : 
                          block.size === 'h2' ? 'text-2xl font-bold mt-6 mb-3' : 'text-base mt-2 mb-2'}
                      `}>
                        {block.value.split('\n').map((line, i) => (
                          line.trim() === ''
                            ? <div key={i} className="h-4" />
                            : <p key={i} className={`${block.size === 'p' || !block.size ? 'text-dinoclass-textMain leading-relaxed' : ''}`}>
                                <span className={`${
                                  block.highlight === 'yellow' ? 'bg-[#FEE800]/20 text-[#FEE800] px-1 rounded' :
                                  block.highlight === 'green' ? 'bg-[#34D399]/20 text-[#34D399] px-1 rounded' : ''
                                }`}>
                                  {line}
                                </span>
                              </p>
                        ))}
                      </div>
                    ) : (
                      <div className="w-full flex justify-center rounded-xl overflow-hidden shadow-2xl border border-dinoclass-surface bg-zinc-950 my-6">
                        {block.value && (
                          <img
                            src={block.value}
                            alt="상세 이미지"
                            className="w-full max-w-4xl object-contain rounded-xl"
                          />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>
      ) : (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="border-t border-dinoclass-surface pt-12">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <div className="w-1 h-6 bg-dinoclass-spark rounded-full" />
              상세 설명
            </h2>
            <div className="bg-dinoclass-surface/30 rounded-2xl p-12 border border-dinoclass-surface text-center">
              <p className="text-dinoclass-textSub">상세 설명이 아직 등록되지 않았습니다.</p>
            </div>
          </div>
        </motion.section>
      )}
    </div>
  )
}
