import { useState, useEffect, useRef } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Rocket, Mail, ChevronRight, CheckCircle2, ChevronDown, Wrench, ShoppingCart, Gift } from 'lucide-react'
import { getProductsByCategory, type Product } from './productStore'
import { getCartCount } from './cartStore'
import AdminPanel from './AdminPanel'
import ProductDetail from './ProductDetail'
import PaymentSuccess from './PaymentSuccess'
import CheckoutPage from './CheckoutPage'
import CartPage from './CartPage'
import MyPage from './MyPage'
import CourseViewer from './CourseViewer'

import { useAuthStore } from './authStore'
import Toast from './components/Toast'
import NewsletterModal from './components/NewsletterModal'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'spline-viewer': any;
    }
  }
}

/* ── 섹션 페이드인 래퍼 ── */
const SectionFadeIn = ({ children }: { children: React.ReactNode }) => (
  <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}>
    {children}
  </motion.div>
)

/* ── 동적 상품 카드 (공통) ── */
function DynamicCard({ product }: { product: Product }) {
  const navigate = useNavigate()
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.35 }}
      onClick={() => navigate(`/products/${product.id}`)}
      className="hover-lift bg-dinoclass-background rounded-2xl overflow-hidden cursor-pointer flex flex-col border border-dinoclass-surface hover:border-dinoclass-spark/50"
    >
      <div className="aspect-square object-cover bg-zinc-800/80 overflow-hidden relative">
        {product.imageUrl && <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />}
        <div className="absolute top-3 left-3 bg-dinoclass-spark text-black text-[10px] font-bold px-2 py-0.5 rounded">NEW</div>
      </div>
      <div className="p-6 flex flex-col h-full">
        <h3 className="font-bold text-lg mb-1 flex-grow">{product.name}</h3>
        {product.description && <p className="text-dinoclass-textSub text-sm mb-3 line-clamp-2">{product.description}</p>}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-lg font-bold font-mono">{product.price}</span>
          <span className="text-dinoclass-spark text-sm font-bold">자세히 보기</span>
        </div>
      </div>
    </motion.div>
  )
}

/* ── 홈 화면 컴포넌트 ── */
function HomeContent({ setIsNewsletterOpen }: { setIsNewsletterOpen: (v: boolean) => void }) {
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [ebookProducts, setEbookProducts] = useState<Product[]>([])
  const [vodProducts, setVodProducts] = useState<Product[]>([])
  const [freebieProducts, setFreebieProducts] = useState<Product[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [msgPhase, setMsgPhase] = useState(0) // 0: Idle, 1: Right Msg, 2: Idle, 3: Left Msg

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgPhase(p => (p + 1) % 4)
    }, 5000) // Change phase every 5 seconds
    return () => clearInterval(msgInterval)
  }, [])

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const ebooks = await getProductsByCategory('ebook')
      const vods = await getProductsByCategory('vod')
      const freebies = await getProductsByCategory('freebie')
      if (isMounted) {
        setEbookProducts(ebooks)
        setVodProducts(vods)
        setFreebieProducts(freebies)
      }
    }
    load()
    intervalRef.current = setInterval(load, 2000)
    return () => { 
      isMounted = false
      if (intervalRef.current) clearInterval(intervalRef.current) 
    }
  }, [])

  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i)


  return (
    <>
      {/* Hero */}
      <section className="w-full h-[75vh] relative overflow-hidden flex items-center justify-center bg-[#fafafa]">
        
        {/* Spline 3D Robot (Shifted down to hide the Spline logo, full width to avoid box effect) */}
        <div className="absolute bottom-[-60px] left-0 w-full h-[100vh] z-0">
          <spline-viewer url="https://prod.spline.design/Onqvfz8w6QhTorLz/scene.splinecode" className="block w-full h-full"></spline-viewer>
        </div>

        {/* Radial Menu Buttons & Speech Bubbles */}
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center w-full overflow-hidden md:overflow-visible">
          <AnimatePresence mode="popLayout">
            {/* ── Left Side Menus (Hidden when Left Bubble is active) ── */}
            {msgPhase !== 3 && (
              <motion.div key="left-menus" exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }} className="absolute inset-0">
                {/* Top Left - Gifts */}
                <motion.a
                  href="#gifts"
                  initial={{ opacity: 0, x: -50, y: -50 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}
                  className="glass-button pointer-events-auto absolute top-[15%] left-[5%] md:left-[25%] lg:left-[28%] xl:left-[30%] px-5 py-2.5 md:px-6 md:py-3 lg:px-8 lg:py-4 xl:px-10 xl:py-5 2xl:px-12 2xl:py-6 rounded-full hover:scale-125 transition-all duration-300 font-bold text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl whitespace-nowrap flex items-center gap-2 group cursor-pointer"
                >
                  <span className="text-xl group-hover:animate-bounce">🎁</span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-orange-400 to-rose-500 animate-gradient-xy">웰컴선물키트</span>
                </motion.a>
                {/* Middle Left - E-book */}
                <motion.a
                  href="#ebook"
                  initial={{ opacity: 0, x: -50, y: 0 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                  className="glass-button pointer-events-auto absolute top-[45%] left-[2%] md:left-[18%] lg:left-[22%] xl:left-[24%] px-5 py-2.5 md:px-6 md:py-3 lg:px-8 lg:py-4 xl:px-10 xl:py-5 2xl:px-12 2xl:py-6 rounded-full hover:scale-125 transition-all duration-300 font-bold text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl whitespace-nowrap flex items-center gap-2 group cursor-pointer"
                >
                  <span className="text-xl group-hover:animate-bounce">📖</span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-500 to-green-600 animate-gradient-xy">전자책</span>
                </motion.a>
                {/* Bottom Left - Free Course */}
                <motion.a
                  href="#free-course"
                  initial={{ opacity: 0, x: -50, y: 50 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                  className="glass-button pointer-events-auto absolute top-[75%] left-[5%] md:left-[23%] lg:left-[25%] xl:left-[27%] px-5 py-2.5 md:px-6 md:py-3 lg:px-8 lg:py-4 xl:px-10 xl:py-5 2xl:px-12 2xl:py-6 rounded-full hover:scale-125 transition-all duration-300 font-bold text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl whitespace-nowrap flex items-center gap-2 group cursor-pointer"
                >
                  <span className="text-xl group-hover:animate-bounce">🎓</span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 via-amber-400 to-orange-500 animate-gradient-xy">무료 강의</span>
                </motion.a>
              </motion.div>
            )}

            {/* ── Right Side Menus (Hidden when Right Bubble is active) ── */}
            {msgPhase !== 1 && (
              <motion.div key="right-menus" exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }} className="absolute inset-0">
                {/* Top Right - VOD */}
                <motion.a
                  href="#vod"
                  initial={{ opacity: 0, x: 50, y: -50 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}
                  className="glass-button pointer-events-auto absolute top-[15%] right-[5%] md:right-[25%] lg:right-[28%] xl:right-[30%] px-5 py-2.5 md:px-6 md:py-3 lg:px-8 lg:py-4 xl:px-10 xl:py-5 2xl:px-12 2xl:py-6 rounded-full hover:scale-125 transition-all duration-300 font-bold text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl whitespace-nowrap flex items-center gap-2 group cursor-pointer"
                >
                  <span className="text-xl group-hover:animate-bounce">📺</span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 animate-gradient-xy">VOD 강의</span>
                </motion.a>
                {/* Middle Right - Reviews */}
                <motion.a
                  href="#reviews"
                  initial={{ opacity: 0, x: 50, y: 0 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                  className="glass-button pointer-events-auto absolute top-[45%] right-[2%] md:right-[18%] lg:right-[22%] xl:right-[24%] px-5 py-2.5 md:px-6 md:py-3 lg:px-8 lg:py-4 xl:px-10 xl:py-5 2xl:px-12 2xl:py-6 rounded-full hover:scale-125 transition-all duration-300 font-bold text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl whitespace-nowrap flex items-center gap-2 group cursor-pointer"
                >
                  <span className="text-xl group-hover:animate-bounce">💬</span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-fuchsia-500 to-violet-600 animate-gradient-xy">수강생 후기</span>
                </motion.a>
                {/* Bottom Right - FAQ */}
                <motion.a
                  href="#faq"
                  initial={{ opacity: 0, x: 50, y: 50 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                  className="glass-button pointer-events-auto absolute top-[75%] right-[5%] md:right-[22%] lg:right-[24%] xl:right-[26%] px-5 py-2.5 md:px-6 md:py-3 lg:px-8 lg:py-4 xl:px-10 xl:py-5 2xl:px-12 2xl:py-6 rounded-full hover:scale-125 transition-all duration-300 font-bold text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl whitespace-nowrap flex items-center gap-2 group cursor-pointer"
                >
                  <span className="text-xl group-hover:animate-bounce">❓</span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-sky-400 to-blue-500 animate-gradient-xy">자주 묻는 질문</span>
                </motion.a>
              </motion.div>
            )}

            {/* ── Right Speech Bubble (Message 1) ── */}
            {msgPhase === 1 && (
              <motion.div
                key="bubble-right"
                initial={{ opacity: 0, scale: 0.8, x: 50 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 50 }}
                transition={{ type: 'spring', bounce: 0.4 }}
                className="absolute top-1/2 -translate-y-1/2 right-[5%] md:right-[8%] lg:right-[10%] xl:right-[12%] w-[300px] md:w-[420px] lg:w-[480px] py-14 px-8 md:px-12 flex items-center justify-center z-20 pointer-events-auto"
                style={{
                  background: 'rgba(235, 245, 255, 0.25)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1), inset 0 0 20px rgba(255,255,255,0.2)',
                  borderRadius: '240px 200px 260px 180px / 120px 140px 130px 160px' /* 비대칭 자연스러운 타원형 */
                }}
              >
                {/* 말풍선 꼬리 (왼쪽 뾰족하게) */}
                <div 
                  className="absolute top-[50%] -translate-y-1/2 -left-3 w-8 h-8 -z-10" 
                  style={{
                    background: 'rgba(235, 245, 255, 0.25)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderLeft: '1px solid rgba(255, 255, 255, 0.4)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
                    transform: 'rotate(45deg) skew(15deg, 15deg)'
                  }} 
                />
                <p className="font-['Nanum_Pen_Script'] text-[28px] md:text-[36px] lg:text-[40px] text-zinc-800 leading-relaxed relative z-10 text-center tracking-wide break-keep">
                  당신의 지식을 콘텐츠로 바꾸어<br/>수익화하는 방법을 연구합니다.
                </p>
              </motion.div>
            )}

            {/* ── Left Speech Bubble (Message 2) ── */}
            {msgPhase === 3 && (
              <motion.div
                key="bubble-left"
                initial={{ opacity: 0, scale: 0.8, x: -50 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -50 }}
                transition={{ type: 'spring', bounce: 0.4 }}
                className="absolute top-1/2 -translate-y-1/2 left-[5%] md:left-[8%] lg:left-[10%] xl:left-[12%] w-[300px] md:w-[420px] lg:w-[480px] py-14 px-8 md:px-12 flex items-center justify-center z-20 pointer-events-auto"
                style={{
                  background: 'rgba(235, 245, 255, 0.25)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1), inset 0 0 20px rgba(255,255,255,0.2)',
                  borderRadius: '200px 240px 180px 260px / 140px 120px 160px 130px' /* 비대칭 자연스러운 타원형 */
                }}
              >
                {/* 말풍선 꼬리 (오른쪽 뾰족하게) */}
                <div 
                  className="absolute top-[50%] -translate-y-1/2 -right-3 w-8 h-8 -z-10" 
                  style={{
                    background: 'rgba(235, 245, 255, 0.25)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderRight: '1px solid rgba(255, 255, 255, 0.4)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.4)',
                    transform: 'rotate(45deg) skew(15deg, 15deg)'
                  }} 
                />
                <p className="font-['Nanum_Pen_Script'] text-[28px] md:text-[36px] lg:text-[40px] text-zinc-800 leading-relaxed relative z-10 text-center tracking-wide break-keep">
                  흩어져 있는 노하우를 모아<br/>평생 수익을 창출하는<br/>시스템을 구축하세요.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
      {/* ── 웰컴선물키트 (freebie) ── */}
      <section id="gifts" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <SectionFadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">🎁 웰컴선물키트</h2>
              <p className="text-dinoclass-textSub text-lg">뉴스레터를 구독하시면 수익화에 필요한 웰컴선물키트 10종을 무료로 드립니다!</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
              {Array.from({ length: 10 }).map((_, i) => {
                const product = freebieProducts[i];
                return (
                  <div key={i} className="bg-dinoclass-surface rounded-2xl overflow-hidden aspect-square flex items-center justify-center border border-zinc-100 shadow-sm relative">
                    {product && product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    ) : (
                      <img src={`/dummy_gift_${(i % 3) + 1}.png`} alt="Coming Soon" className="w-full h-full object-cover" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-12 text-center">
              <button 
                onClick={() => setIsNewsletterOpen(true)}
                className="bg-dinoclass-spark text-black font-bold px-8 py-4 rounded-xl hover:bg-yellow-400 transition-colors hover:shadow-[0_0_20px_rgba(254,232,0,0.2)] inline-flex items-center gap-2"
              >
                웰컴선물키트 10종 무료 다운로드
              </button>
            </div>
          </SectionFadeIn>
        </div>
      </section>

      {/* ── VOD 강의 (vod) ── */}
      <section id="vod" className="py-24 bg-premium-grey">
        <div className="max-w-7xl mx-auto px-6">
          <SectionFadeIn>
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">VOD 강의</h2>
              <p className="text-dinoclass-textSub text-lg">지식을 수익화하는 모든 과정을 기초부터 탄탄하게 알려드립니다.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {vodProducts.length === 0 && [1, 2, 3, 4].map((i) => (
                <div
                  key={`dummy-${i}`}
                  onClick={() => navigate(`/products/static-vod-${i}`)}
                  className="hover-lift bg-dinoclass-surface rounded-2xl overflow-hidden cursor-pointer flex flex-col h-full border border-transparent hover:border-dinoclass-spark/50"
                >
                  <div className="aspect-square object-cover bg-zinc-800 relative overflow-hidden">
                    <img src={`/vod_dummy_${i}.png`} alt={`VOD Class ${i}`} className="w-full h-full object-cover" />
                    <div className="absolute top-4 right-4 bg-dinoclass-spark text-black text-xs font-bold px-2 py-1 rounded">BEST</div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="font-bold text-lg mb-2">지식 창업 올인원 마스터 클래스 {i}기</h3>
                    <p className="text-dinoclass-textSub text-sm mb-6 flex-grow">나만의 지식을 찾아 상품화하고, 자동 결제 시스템을 구축하는 A to Z</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xl font-bold font-mono">199,000원</span>
                      <span className="text-dinoclass-spark text-sm font-bold">자세히 보기 &rarr;</span>
                    </div>
                  </div>
                </div>
              ))}
              {/* 관리자 등록 VOD */}
              <AnimatePresence>
                {vodProducts.map((p) => <DynamicCard key={p.id} product={p} />)}
              </AnimatePresence>
            </div>
          </SectionFadeIn>
        </div>
      </section>

      {/* ── 전자책 (ebook) ── */}
      <section id="ebook" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <SectionFadeIn>
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">전자책</h2>
              <p className="text-dinoclass-textSub text-lg">핵심만 압축한 전자책으로 수익화의 지름길을 확인하세요.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {ebookProducts.length === 0 && [
                { id: 'static-ebook-1', title: "왕초보를 위한 패시브 인컴 기초 설계도", price: "29,000원", index: 1 },
                { id: 'static-ebook-2', title: "안 팔리는 전자책을 베스트셀러로 만드는 카피라이팅", price: "39,000원", index: 2 },
                { id: 'static-ebook-3', title: "하루 1시간, 월 100만 원 자동 수익 시스템 구축법", price: "49,000원", index: 3 },
                { id: 'static-ebook-4', title: "잘 팔리는 상세페이지의 비밀 공식 10가지", price: "35,000원", index: 4 }
              ].map((book) => (
                <div
                  key={book.id}
                  onClick={() => navigate(`/products/${book.id}`)}
                  className="hover-lift bg-dinoclass-background rounded-2xl overflow-hidden cursor-pointer flex flex-col h-full border border-dinoclass-surface hover:border-dinoclass-spark/50"
                >
                  <div className="aspect-square object-cover bg-zinc-800/80 relative overflow-hidden">
                    <img src={`/ebook_dummy_${book.index}.png`} alt={book.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="font-bold text-lg mb-2 flex-grow">{book.title}</h3>
                    <div className="flex items-center justify-between mt-auto pt-4">
                      <span className="text-lg font-bold font-mono">{book.price}</span>
                      <span className="text-dinoclass-spark text-sm font-bold">자세히 보기</span>
                    </div>
                  </div>
                </div>
              ))}
              {/* 관리자 등록 전자책 */}
              <AnimatePresence>
                {ebookProducts.map((p) => <DynamicCard key={p.id} product={p} />)}
              </AnimatePresence>
            </div>
          </SectionFadeIn>
        </div>
      </section>

      {/* ── 무료 강의 (free-course) ── */}
      <section id="free-course" className="py-24 bg-premium-grey">
        <div className="max-w-7xl mx-auto px-6">
          <SectionFadeIn>
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">무료 강의</h2>
              <p className="text-dinoclass-textSub text-lg">부담 없이 시작할 수 있는 디노클래스의 무료 맛보기 강의입니다.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { id: 'static-free-1', title: "[무료] 1시간 만에 이해하는 자동화 수익의 원리", originalPrice: "59,000원", price: "0원", index: 1 },
                { id: 'static-free-2', title: "[무료] 나만의 지식 아이템 찾기 특강", originalPrice: "49,000원", price: "0원", index: 2 },
                { id: 'static-free-3', title: "[무료] 블로그로 시작하는 제2의 월급 만들기", originalPrice: "39,000원", price: "0원", index: 3 },
                { id: 'static-free-4', title: "[무료] 왕초보 탈출 마인드셋 특강", originalPrice: "29,000원", price: "0원", index: 4 }
              ].map((course) => (
                <div
                  key={course.id}
                  onClick={() => navigate(`/products/${course.id}`)}
                  className="hover-lift bg-dinoclass-surface rounded-2xl overflow-hidden cursor-pointer flex flex-col h-full border border-transparent hover:border-dinoclass-spark/50"
                >
                  <div className="aspect-square object-cover bg-zinc-800 relative overflow-hidden">
                    <img src={`/free_dummy_${course.index}.png`} alt={course.title} className="w-full h-full object-cover" />
                    <div className="absolute top-4 right-4 bg-dinoclass-spark text-black text-xs font-bold px-2 py-1 rounded">FREE</div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="font-bold text-lg mb-2 flex-grow">{course.title}</h3>
                    <div className="flex items-center justify-between mt-auto pt-4">
                      <div className="flex items-baseline gap-2">
                        <del className="text-sm text-zinc-400 font-mono">{course.originalPrice}</del>
                        <span className="text-lg font-bold font-mono text-dinoclass-spark">{course.price}</span>
                      </div>
                      <span className="text-dinoclass-spark text-sm font-bold">수강하기 &rarr;</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionFadeIn>
        </div>
      </section>

      {/* ── 수강생 후기 ── */}
      <section id="reviews" className="py-24 bg-white relative overflow-hidden">
        <SectionFadeIn>
          <div className="text-center mb-16 px-6">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">수강생 리얼 후기</h2>
            <p className="text-dinoclass-textSub text-lg">이미 많은 분들이 경제적 자유를 향해 나아가고 있습니다</p>
          </div>
          <div className="marquee-container py-4">
            {[0,1].map((setIdx) => (
              <div key={setIdx} className="marquee-content" aria-hidden={setIdx === 1}>
                {[
                  { content: "퇴근 후 2시간씩 투자해서 월급 외 수익을 만들었어요. 로드맵이 너무 구체적이라 따라하기 쉽습니다.", name: "이*진", role: "직장인", avatar: "이" },
                  { content: "지금까지 들었던 강의 중 단연 최고입니다. 템플릿이 정말 유용해요.", name: "박*우", role: "프리랜서", avatar: "박" },
                  { content: "초보자도 이해하기 쉽게 설명해주셔서 포기하지 않고 끝까지 완강할 수 있었습니다.", name: "최*리", role: "대학생", avatar: "최" },
                  { content: "막연했던 지식 창업의 뼈대를 제대로 세워주는 강의입니다. 강력 추천합니다!", name: "정*영", role: "기획자", avatar: "정" },
                  { content: "강의 듣고 일주일 만에 첫 전자책 판매에 성공했습니다. 정말 실전적인 내용만 있네요!", name: "김*훈", role: "마케터", avatar: "김" }
                ].map((r, i) => (
                  <div key={`${setIdx}-${i}`} className="w-[350px] bg-dinoclass-surface p-6 flex flex-col justify-between rounded-2xl border border-dinoclass-surface/50">
                    <div>
                      <div className="flex items-center gap-1 mb-4 text-dinoclass-spark">{[1,2,3,4,5].map(s => <span key={s}>★</span>)}</div>
                      <p className="text-dinoclass-textMain mb-8 text-sm leading-relaxed">"{r.content}"</p>
                    </div>
                    <div className="flex items-center gap-3 mt-auto">
                      <div className="w-10 h-10 rounded-full border border-dinoclass-spark flex items-center justify-center text-dinoclass-spark font-bold">{r.avatar}</div>
                      <div>
                        <div className="font-bold text-white text-sm">{r.name}</div>
                        <div className="text-dinoclass-textSub text-xs">{r.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </SectionFadeIn>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-premium-grey">
        <div className="max-w-3xl mx-auto px-6">
          <SectionFadeIn>
            <div className="text-center mb-16"><h2 className="text-3xl md:text-4xl font-bold">자주 묻는 질문</h2></div>
            <div className="space-y-4">
              {[
                { q: "초보자도 수익을 낼 수 있나요?", a: "네, 기초부터 하나하나 차근차근 알려드리기 때문에 완전 초보자도 충분히 수익 파이프라인을 구축할 수 있습니다." },
                { q: "결제하면 수강 기간은 어떻게 되나요?", a: "디노클래스의 모든 강의와 전자책은 '단건 결제'로 이루어집니다. 한 번 결제하시면 평생 무제한으로 소장하고 수강하실 수 있습니다." },
                { q: "환불 규정은 어떻게 되나요?", a: "결제 즉시 전자책과 모든 자료를 평생 소장하실 수 있는 디지털 상품의 특성상, 결제 이후에는 환불이 어렵습니다. 신중히 고민 후 결제해 주세요." },
              ].map((faq, i) => (
                <div key={i} className="bg-dinoclass-background border border-dinoclass-surface rounded-xl overflow-hidden">
                  <button onClick={() => toggleFaq(i)} className="w-full flex items-center justify-between p-6 text-left hover:bg-dinoclass-surface/50 transition-colors">
                    <span className="font-bold">{faq.q}</span>
                    <ChevronDown className={`transform transition-transform ${openFaq === i ? 'rotate-180 text-dinoclass-spark' : 'text-dinoclass-textSub'}`} />
                  </button>
                  {openFaq === i && <div className="p-6 pt-0 text-dinoclass-textSub">{faq.a}</div>}
                </div>
              ))}
            </div>
          </SectionFadeIn>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-24 px-6 relative overflow-hidden">
        <SectionFadeIn>
          <div className="max-w-5xl mx-auto bg-dinoclass-surface rounded-3xl overflow-hidden relative z-10 border border-dinoclass-spark/20 flex flex-col md:flex-row">
            
            {/* 좌측: 움직이는 메일 아이콘 영역 */}
            <div className="w-full md:w-1/2 bg-zinc-800/30 flex items-center justify-center p-16 md:p-0 min-h-[300px]">
              <motion.div 
                animate={{ x: [0, 5, -2, 3, 0] }} 
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="relative flex items-center"
              >
                {/* 스피드 라인 (달려오는 효과) */}
                <div className="absolute -left-12 flex flex-col gap-2.5">
                  <motion.div animate={{ width: [15, 30, 15], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 0.6 }} className="h-1.5 bg-dinoclass-textSub rounded-full" />
                  <motion.div animate={{ width: [25, 45, 25], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }} className="h-1.5 bg-dinoclass-textSub rounded-full" />
                  <motion.div animate={{ width: [10, 20, 10], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }} className="h-1.5 bg-dinoclass-textSub rounded-full" />
                </div>
                
                <Mail className="w-24 h-24 md:w-32 md:h-32 text-dinoclass-spark drop-shadow-[0_0_15px_rgba(254,232,0,0.3)] ml-4" strokeWidth={1.5} />
              </motion.div>
            </div>

            {/* 우측: 텍스트 및 버튼 영역 */}
            <div className="w-full md:w-1/2 p-12 md:p-16 flex flex-col justify-center text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">디노클래스의 뉴스레터</h2>
              <p className="text-dinoclass-textSub text-lg mb-10 leading-relaxed">
                가장 빨리 수익화하는 방법, 최신 노하우를 일주일에 한 번씩 메일로 받아보세요!
              </p>
              <div>
                <button 
                  onClick={() => setIsNewsletterOpen(true)} 
                  className="bg-dinoclass-spark text-black font-bold px-8 py-4 rounded-xl hover:bg-yellow-400 transition-colors hover:shadow-[0_0_20px_rgba(254,232,0,0.2)]"
                >
                  무료 뉴스레터 구독하기
                </button>
              </div>
            </div>

          </div>
        </SectionFadeIn>
      </section>
    </>
  )
}

/* ══════ 메인 App 컴포넌트 ══════ */
export default function App() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const user = useAuthStore(state => state.user)
  const login = useAuthStore(state => state.login)
  const logout = useAuthStore(state => state.logout)
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }
  const navigate = useNavigate()

  useEffect(() => {
    // Check initial user from query params, etc.
  }, [])

  useEffect(() => {
    // load initial cart count
    setCartCount(getCartCount())
    
    // listen to cart updates
    const handleCartUpdate = () => setCartCount(getCartCount())
    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => window.removeEventListener('cartUpdated', handleCartUpdate)
  }, [])


  return (
    <div className="min-h-screen bg-dinoclass-background text-dinoclass-textMain font-sans flex flex-col">
      {/* ══════ Header ══════ */}
      <header className="sticky top-0 z-50 bg-[#fafafa]/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer pt-0.5" onClick={() => { setIsAdmin(false); window.location.href = '/' }}>
            <span className="text-xl font-bold tracking-wide text-zinc-800">디노클래스</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-zinc-500 font-light text-[15px] -mt-0.5">
            {!isAdmin && (<>
              <a href="/" className="hover:text-zinc-900 transition-colors">홈</a>
              <a href="/#gifts" className="hover:text-zinc-900 transition-colors">웰컴선물키트</a>
              <a href="/#vod" className="hover:text-zinc-900 transition-colors">VOD 강의</a>
              <a href="/#ebook" className="hover:text-zinc-900 transition-colors">전자책</a>
              <a href="/#free-course" className="hover:text-zinc-900 transition-colors">무료 강의</a>
              <a href="/#reviews" className="hover:text-zinc-900 transition-colors">수강생 후기</a>
              <a href="/#faq" className="hover:text-zinc-900 transition-colors">FAQ</a>
            </>)}
          </nav>
          <div className="flex gap-2 items-center -mt-0.5">
            {!isAdmin && (<>
              <button 
                onClick={() => navigate('/cart')}
                className="relative p-1.5 text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center translate-x-1 -translate-y-1">
                    {cartCount}
                  </span>
                )}
              </button>
              {user ? (
                <>
                  <span className="text-zinc-500 text-sm px-2 font-medium">{user.name}님</span>
                  <button onClick={() => navigate('/mypage')} className="border border-zinc-200 text-zinc-700 bg-white/50 backdrop-blur-sm px-4 py-1.5 rounded-full font-medium hover:bg-white hover:shadow-sm hover:border-zinc-300 transition-all text-sm">마이페이지</button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => {
                      const email = window.prompt('로그인할 이메일을 입력하세요 (임시)');
                      if (email) login(email, window.prompt('이름을 입력하세요') || '수강생');
                    }}
                    className="text-zinc-500 hover:text-zinc-900 transition-colors text-sm px-2"
                  >
                    로그인
                  </button>
                  <button onClick={() => navigate('/mypage')} className="border border-zinc-200 text-zinc-700 bg-white/50 backdrop-blur-sm px-4 py-1.5 rounded-full font-medium hover:bg-white hover:shadow-sm hover:border-zinc-300 transition-all text-sm">마이페이지</button>
                </>
              )}
            </>)}
            <button
              id="admin-toggle"
              onClick={() => setIsAdmin(!isAdmin)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                isAdmin
                  ? 'bg-zinc-800 text-white shadow-md'
                  : 'bg-transparent text-zinc-400 border border-zinc-200 hover:border-zinc-300 hover:text-zinc-700'
              }`}
            >
              <Wrench size={13} />
              <span className="hidden sm:inline">{isAdmin ? '홈으로 돌아가기' : '관리자 모드'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ══════ Main Content ══════ */}
      <main className="flex-grow">
        {isAdmin ? (
          <AdminPanel />
        ) : (
          <Routes>
            <Route path="/" element={<HomeContent setIsNewsletterOpen={setIsNewsletterOpen} />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/fail" element={<PaymentSuccess />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/course/:id" element={<CourseViewer />} />
          </Routes>
        )}
      </main>

      {/* ══════ Footer ══════ */}
      <footer className="bg-black py-12 border-t border-zinc-900 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-dinoclass-textSub text-sm flex flex-col md:flex-row justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 text-white mb-6"><Rocket size={20} /><span className="text-xl font-bold tracking-tight">디노클래스</span></div>
            <div className="space-y-2 max-w-sm leading-relaxed">
              <p>상호 : 디노클래스 | 대표 : 권윤혜</p>
              <p>사업자등록번호 : [사업자등록번호 입력]</p>
              <p>통신판매업신고번호 : [통신판매업신고번호 입력]</p>
              <p>이메일 : [이메일 주소 입력]</p>
            </div>
          </div>
          <div className="flex flex-col md:items-end justify-between">
            <div className="flex gap-6 mb-8 text-white font-medium">
              <a href="#" className="hover:text-dinoclass-spark transition-colors">이용약관</a>
              <a href="#" className="hover:text-dinoclass-spark transition-colors">개인정보처리방침</a>
            </div>
            <div className="text-left md:text-right">
              <p className="mb-2 text-zinc-500">결제 즉시 전자책과 모든 자료를 평생 소장하실 수 있는 디지털 상품의 특성상,<br className="hidden md:block"/>결제 이후에는 환불이 어렵습니다. 구매 전 커리큘럼을 충분히 살펴보시길 권해 드려요^^</p>
              <p className="text-zinc-600 mt-6">&copy; {new Date().getFullYear()} DinoClass. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
      {/* ══════ Toast & Modals ══════ */}
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
      <NewsletterModal 
        isOpen={isNewsletterOpen} 
        onClose={() => setIsNewsletterOpen(false)} 
        onShowToast={showToast} 
      />
    </div>
  )
}
