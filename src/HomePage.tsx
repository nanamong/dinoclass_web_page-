import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Rocket, Mail, ChevronRight, CheckCircle2, ChevronDown 
} from 'lucide-react'
import { getProducts, type Product } from './productStore'

const SectionFadeIn = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6 }}
  >
    {children}
  </motion.div>
)

// 기본(하드코딩) 전자책 데이터 — 관리자가 등록한 상품 위에 함께 노출됩니다.
const defaultBooks = [
  { title: "왕초보를 위한 패시브 인컴 기초 설계도", price: "29,000원" },
  { title: "안 팔리는 전자책을 베스트셀러로 만드는 카피라이팅", price: "39,000원" },
  { title: "하루 1시간, 월 100만 원 자동 수익 시스템 구축법", price: "49,000원" },
]

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [dynamicProducts, setDynamicProducts] = useState<Product[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // localStorage에서 관리자가 등록한 상품을 주기적으로 읽어와 실시간 반영
  useEffect(() => {
    const load = () => setDynamicProducts(getProducts());
    load();
    intervalRef.current = setInterval(load, 1000); // 1초마다 폴링
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const toggleFaq = (index: number) => {
    if (openFaq === index) setOpenFaq(null);
    else setOpenFaq(index);
  }

  return (
    <div className="min-h-screen bg-dinoclass-background text-dinoclass-textMain font-sans flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-dinoclass-background/80 backdrop-blur-md border-b border-dinoclass-surface">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-dinoclass-spark">
            <Rocket size={28} />
            <span className="text-2xl font-bold tracking-tight text-white">디노클래스</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-dinoclass-textSub font-medium">
            <a href="#" className="hover:text-dinoclass-spark transition-colors">홈</a>
            <a href="#gifts" className="hover:text-dinoclass-spark transition-colors">웰컴선물키트</a>
            <a href="#vod" className="hover:text-dinoclass-spark transition-colors">VOD 강의</a>
            <a href="#ebook" className="hover:text-dinoclass-spark transition-colors">전자책</a>
            <a href="#reviews" className="hover:text-dinoclass-spark transition-colors">수강생 후기</a>
          </nav>
          <div className="flex gap-4">
            <button className="text-dinoclass-textSub hover:text-white transition-colors">로그인</button>
            <button className="bg-dinoclass-spark text-black px-5 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors">
              마이페이지
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-32 pb-40 px-6 overflow-hidden">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-bold leading-tight mb-8"
            >
              당신의 지식을 콘텐츠로 바꾸어 <br className="hidden md:block"/>
              <span className="text-dinoclass-spark">수익화하는 방법을 연구합니다.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-dinoclass-textSub mb-12 max-w-2xl mx-auto"
            >
              흩어져 있는 노하우를 모아 평생 수익을 창출하는 세일즈 머신을 구축하세요.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center"
            >
              <button className="hover-lift flex items-center gap-3 bg-dinoclass-surface border border-dinoclass-spark/30 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-[0_0_20px_rgba(254,232,0,0.15)] group">
                <Mail className="text-dinoclass-spark group-hover:scale-110 transition-transform" />
                무료 뉴스레터 구독하기
                <ChevronRight className="text-dinoclass-textSub group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
          
          {/* Decorative background elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-dinoclass-spark/5 blur-[120px] rounded-full pointer-events-none"></div>
        </section>

        {/* Welcome Gifts Section */}
        <section id="gifts" className="py-24 bg-dinoclass-surface/50 border-y border-dinoclass-surface">
          <div className="max-w-7xl mx-auto px-6">
            <SectionFadeIn>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">🎁 웰컴선물키트</h2>
                <p className="text-dinoclass-textSub text-lg">
                  뉴스레터를 구독하시면 수익화에 필요한 템플릿과 노하우를 무료로 드립니다!
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  "자동화 수익 파이프라인 템플릿",
                  "팔리는 랜딩페이지 카피라이팅 가이드",
                  "초보자를 위한 전자책 작성 노하우 PDF"
                ].map((title, i) => (
                  <div key={i} className="hover-lift bg-dinoclass-background border border-dinoclass-surface rounded-2xl p-8 cursor-pointer group">
                    <div className="w-12 h-12 bg-dinoclass-surface rounded-xl flex items-center justify-center mb-6 group-hover:bg-dinoclass-spark/10 transition-colors">
                      <CheckCircle2 className="text-dinoclass-spark" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{title}</h3>
                    <p className="text-dinoclass-textSub text-sm">이메일 구독 즉시 다운로드 링크를 보내드립니다.</p>
                  </div>
                ))}
              </div>
            </SectionFadeIn>
          </div>
        </section>

        {/* VOD Lectures Section */}
        <section id="vod" className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <SectionFadeIn>
              <div className="mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">VOD 강의</h2>
                <p className="text-dinoclass-textSub text-lg">
                  지식을 수익화하는 모든 과정을 기초부터 탄탄하게 알려드립니다.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="hover-lift bg-dinoclass-surface rounded-2xl overflow-hidden cursor-pointer flex flex-col h-full border border-transparent hover:border-dinoclass-spark/50">
                    <div className="h-48 bg-zinc-800 relative">
                      <div className="absolute top-4 right-4 bg-dinoclass-spark text-black text-xs font-bold px-2 py-1 rounded">BEST</div>
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="font-bold text-lg mb-2">지식 창업 올인원 마스터 클래스 {i}기</h3>
                      <p className="text-dinoclass-textSub text-sm mb-6 flex-grow">나만의 지식을 찾아 상품화하고, 자동 결제 시스템을 구축하는 A to Z</p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-xl font-bold font-mono">199,000원</span>
                        <span className="text-dinoclass-spark text-sm font-bold">수강하기 &rarr;</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionFadeIn>
          </div>
        </section>

        {/* E-book Section — 기본 상품 + 관리자 등록 상품 */}
        <section id="ebook" className="py-24 bg-dinoclass-surface/50 border-y border-dinoclass-surface">
          <div className="max-w-7xl mx-auto px-6">
            <SectionFadeIn>
              <div className="mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">디노에뜨의 전자책</h2>
                <p className="text-dinoclass-textSub text-lg">
                  핵심만 압축한 전자책으로 수익화의 지름길을 확인하세요.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 기본(하드코딩) 전자책 카드 */}
                {defaultBooks.map((book, i) => (
                  <div key={`default-${i}`} className="hover-lift bg-dinoclass-background rounded-2xl overflow-hidden cursor-pointer flex flex-col border border-dinoclass-surface hover:border-dinoclass-spark/50">
                    <div className="h-40 bg-zinc-800/80"></div>
                    <div className="p-6 flex flex-col h-full">
                      <h3 className="font-bold text-lg mb-2 flex-grow">{book.title}</h3>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-lg font-bold font-mono">{book.price}</span>
                        <span className="text-dinoclass-spark text-sm font-bold">자세히 보기</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* 관리자가 등록한 동적 상품 카드 */}
                <AnimatePresence>
                  {dynamicProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.35 }}
                      className="hover-lift bg-dinoclass-background rounded-2xl overflow-hidden cursor-pointer flex flex-col border border-dinoclass-surface hover:border-dinoclass-spark/50"
                    >
                      <div className="h-40 bg-zinc-800/80 overflow-hidden relative">
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        )}
                        <div className="absolute top-3 left-3 bg-dinoclass-spark text-black text-[10px] font-bold px-2 py-0.5 rounded">NEW</div>
                      </div>
                      <div className="p-6 flex flex-col h-full">
                        <h3 className="font-bold text-lg mb-1 flex-grow">{product.name}</h3>
                        <p className="text-dinoclass-textSub text-sm mb-3 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-lg font-bold font-mono">{product.price}</span>
                          <span className="text-dinoclass-spark text-sm font-bold">자세히 보기</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </SectionFadeIn>
          </div>
        </section>

        {/* Reviews Marquee Section */}
        <section id="reviews" className="py-24 overflow-hidden">
          <SectionFadeIn>
            <div className="text-center mb-16 px-6">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">수강생 리얼 후기</h2>
              <p className="text-dinoclass-textSub text-lg">
                이미 많은 분들이 경제적 자유를 향해 나아가고 있습니다
              </p>
            </div>
            
            <div className="marquee-container py-4">
              <div className="marquee-content">
                {[
                  { content: "퇴근 후 2시간씩 투자해서 월급 외 수익을 만들었어요. 로드맵이 너무 구체적이라 따라하기 쉽습니다.", name: "이*진", role: "직장인", avatar: "이" },
                  { content: "지금까지 들었던 강의 중 단연 최고입니다. 템플릿이 정말 유용해요.", name: "박*우", role: "프리랜서", avatar: "박" },
                  { content: "초보자도 이해하기 쉽게 설명해주셔서 포기하지 않고 끝까지 완강할 수 있었습니다.", name: "최*리", role: "대학생", avatar: "최" },
                  { content: "막연했던 지식 창업의 뼈대를 제대로 세워주는 강의입니다. 강력 추천합니다!", name: "정*영", role: "기획자", avatar: "정" },
                  { content: "강의 듣고 일주일 만에 첫 전자책 판매에 성공했습니다. 정말 실전적인 내용만 있네요!", name: "김*훈", role: "마케터", avatar: "김" }
                ].map((review, i) => (
                  <div key={`a-${i}`} className="w-[350px] bg-dinoclass-surface p-6 flex flex-col justify-between rounded-2xl border border-dinoclass-surface/50">
                    <div>
                      <div className="flex items-center gap-1 mb-4 text-dinoclass-spark">
                        {[1, 2, 3, 4, 5].map(star => <span key={star}>★</span>)}
                      </div>
                      <p className="text-dinoclass-textMain mb-8 text-sm leading-relaxed">
                        "{review.content}"
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-auto">
                      <div className="w-10 h-10 rounded-full border border-dinoclass-spark flex items-center justify-center text-dinoclass-spark font-bold">
                        {review.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{review.name}</div>
                        <div className="text-dinoclass-textSub text-xs">{review.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="marquee-content" aria-hidden="true">
                {[
                  { content: "퇴근 후 2시간씩 투자해서 월급 외 수익을 만들었어요. 로드맵이 너무 구체적이라 따라하기 쉽습니다.", name: "이*진", role: "직장인", avatar: "이" },
                  { content: "지금까지 들었던 강의 중 단연 최고입니다. 템플릿이 정말 유용해요.", name: "박*우", role: "프리랜서", avatar: "박" },
                  { content: "초보자도 이해하기 쉽게 설명해주셔서 포기하지 않고 끝까지 완강할 수 있었습니다.", name: "최*리", role: "대학생", avatar: "최" },
                  { content: "막연했던 지식 창업의 뼈대를 제대로 세워주는 강의입니다. 강력 추천합니다!", name: "정*영", role: "기획자", avatar: "정" },
                  { content: "강의 듣고 일주일 만에 첫 전자책 판매에 성공했습니다. 정말 실전적인 내용만 있네요!", name: "김*훈", role: "마케터", avatar: "김" }
                ].map((review, i) => (
                  <div key={`b-${i}`} className="w-[350px] bg-dinoclass-surface p-6 flex flex-col justify-between rounded-2xl border border-dinoclass-surface/50">
                    <div>
                      <div className="flex items-center gap-1 mb-4 text-dinoclass-spark">
                        {[1, 2, 3, 4, 5].map(star => <span key={star}>★</span>)}
                      </div>
                      <p className="text-dinoclass-textMain mb-8 text-sm leading-relaxed">
                        "{review.content}"
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-auto">
                      <div className="w-10 h-10 rounded-full border border-dinoclass-spark flex items-center justify-center text-dinoclass-spark font-bold">
                        {review.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{review.name}</div>
                        <div className="text-dinoclass-textSub text-xs">{review.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionFadeIn>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-dinoclass-surface/30">
          <div className="max-w-3xl mx-auto px-6">
            <SectionFadeIn>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold">자주 묻는 질문</h2>
              </div>
              
              <div className="space-y-4">
                {[
                  { q: "초보자도 수익을 낼 수 있나요?", a: "네, 기초부터 하나하나 차근차근 알려드리기 때문에 완전 초보자도 충분히 수익 파이프라인을 구축할 수 있습니다." },
                  { q: "결제하면 수강 기간은 어떻게 되나요?", a: "디노클래스의 모든 강의와 전자책은 '단건 결제'로 이루어집니다. 한 번 결제하시면 평생 무제한으로 소장하고 수강하실 수 있습니다." },
                  { q: "환불 규정은 어떻게 되나요?", a: "결제 즉시 전자책과 모든 자료를 평생 소장하실 수 있는 디지털 상품의 특성상, 결제 이후에는 환불이 어렵습니다. 신중히 고민 후 결제해 주세요." },
                ].map((faq, i) => (
                  <div key={i} className="bg-dinoclass-background border border-dinoclass-surface rounded-xl overflow-hidden">
                    <button 
                      onClick={() => toggleFaq(i)}
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-dinoclass-surface/50 transition-colors"
                    >
                      <span className="font-bold">{faq.q}</span>
                      <ChevronDown className={`transform transition-transform ${openFaq === i ? 'rotate-180 text-dinoclass-spark' : 'text-dinoclass-textSub'}`} />
                    </button>
                    {openFaq === i && (
                      <div className="p-6 pt-0 text-dinoclass-textSub">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </SectionFadeIn>
          </div>
        </section>

        {/* Bottom CTA Newsletter Section */}
        <section className="py-24 px-6 relative overflow-hidden">
          <SectionFadeIn>
            <div className="max-w-4xl mx-auto bg-dinoclass-surface rounded-3xl p-12 md:p-20 text-center relative z-10 border border-dinoclass-spark/20">
              <Mail className="w-16 h-16 text-dinoclass-spark mx-auto mb-6" />
              <h2 className="text-3xl md:text-5xl font-bold mb-6">디노클래스의 뉴스레터</h2>
              <p className="text-dinoclass-textSub text-lg mb-10 max-w-2xl mx-auto">
                가장 빨리 수익화하는 방법, 최신 노하우를 일주일에 한 번씩 메일로 받아보세요!
              </p>
              <div className="flex flex-col sm:flex-row justify-center max-w-md mx-auto gap-4">
                <input 
                  type="email" 
                  placeholder="이메일 주소를 입력해주세요" 
                  className="flex-grow bg-dinoclass-background border border-dinoclass-textSub/30 rounded-xl px-6 py-4 outline-none focus:border-dinoclass-spark transition-colors"
                />
                <button className="bg-dinoclass-spark text-black font-bold px-8 py-4 rounded-xl hover:bg-yellow-400 transition-colors whitespace-nowrap">
                  무료 구독하기
                </button>
              </div>
            </div>
          </SectionFadeIn>
        </section>
      </main>

      {/* Footer — 맨 아래에 관리자 로그인 링크를 비밀스럽게 배치 */}
      <footer className="bg-black py-12 border-t border-zinc-900 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-dinoclass-textSub text-sm flex flex-col md:flex-row justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 text-white mb-6">
              <Rocket size={20} />
              <span className="text-xl font-bold tracking-tight">디노클래스</span>
            </div>
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
              <p className="mb-2 text-zinc-500">
                결제 즉시 전자책과 모든 자료를 평생 소장하실 수 있는 디지털 상품의 특성상,<br className="hidden md:block"/>결제 이후에는 환불이 어렵습니다. 구매 전 커리큘럼을 충분히 살펴보시길 권해 드려요^^
              </p>
              <p className="text-zinc-600 mt-6">&copy; {new Date().getFullYear()} DinoClass. All rights reserved.</p>
              {/* 관리자 로그인 — 비밀스럽게 배치 */}
              <Link 
                to="/admin" 
                className="inline-block mt-4 text-zinc-700 text-[10px] hover:text-zinc-500 transition-colors select-none"
              >
                관리자
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
