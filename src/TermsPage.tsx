import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function TermsPage() {
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-dinoclass-background text-dinoclass-textMain pt-8 pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-dinoclass-textSub hover:text-white mb-8 transition-colors"
        >
          <ChevronLeft size={20} />
          돌아가기
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dinoclass-surface rounded-3xl p-8 md:p-12 border border-dinoclass-surface shadow-xl"
        >
          <h1 className="text-3xl font-bold mb-8">이용약관</h1>
          
          <div className="space-y-8 text-dinoclass-textSub leading-relaxed text-sm">
            <section>
              <h2 className="text-lg font-bold text-white mb-3">제1조 (목적)</h2>
              <p>이 약관은 디노클래스(이하 "회사"라 합니다)가 운영하는 웹사이트(이하 "사이트"라 합니다)에서 제공하는 인터넷 관련 서비스(이하 "서비스"라 합니다)를 이용함에 있어 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">제2조 (정의)</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>"사이트"란 회사가 재화 또는 용역을 이용자에게 제공하기 위하여 컴퓨터 등 정보통신설비를 이용하여 재화 등을 거래할 수 있도록 설정한 가상의 영업장을 말합니다.</li>
                <li>"이용자"란 "사이트"에 접속하여 이 약관에 따라 "사이트"가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</li>
                <li>"회원"이라 함은 "사이트"에 개인정보를 제공하여 회원등록을 한 자로서, "사이트"의 정보를 지속적으로 제공받으며, "사이트"가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">제3조 (서비스의 제공 및 변경)</h2>
              <p>회사는 다음과 같은 업무를 수행합니다.</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>디지털 콘텐츠(전자책, VOD 강의 등)의 판매 및 서비스 제공</li>
                <li>기타 회사가 정하는 업무</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">제4조 (이용계약의 성립)</h2>
              <p>이용계약은 회원이 되고자 하는 자(이하 "가입신청자")가 약관의 내용에 대하여 동의를 한 다음 회원가입신청을 하고 회사가 이러한 신청에 대하여 승낙함으로써 성립됩니다.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">제5조 (청약철회 및 환불)</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>디노클래스에서 제공하는 상품(전자책, VOD 강의 등)은 복제가 가능한 디지털 콘텐츠이므로, 원칙적으로 결제 완료 및 상품 제공(다운로드 또는 스트리밍 접근 권한 부여) 이후에는 청약철회 및 환불이 불가능합니다.</li>
                <li>다만, 회사의 귀책사유로 인하여 서비스를 이용하지 못한 경우에는 전액 환불합니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">제6조 (회사의 의무)</h2>
              <p>회사는 법령과 이 약관이 금지하거나 공서양속에 반하는 행위를 하지 않으며 이 약관이 정하는 바에 따라 지속적이고, 안정적으로 서비스를 제공하는데 최선을 다하여야 합니다.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">제7조 (이용자의 의무)</h2>
              <p>이용자는 다음 행위를 하여서는 안 됩니다.</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>신청 또는 변경 시 허위 내용의 등록</li>
                <li>타인의 정보 도용</li>
                <li>회사가 정한 정보 이외의 정보 등의 송신 또는 게시</li>
                <li>회사 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                <li>회사 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">제8조 (저작권의 귀속 및 이용제한)</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>회사가 작성한 저작물에 대한 저작권 기타 지적재산권은 회사에 귀속합니다.</li>
                <li>이용자는 회사를 이용함으로써 얻은 정보 중 회사에게 지적재산권이 귀속된 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">제9조 (분쟁해결)</h2>
              <p>회사는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 피해보상처리기구를 설치, 운영합니다. 회사는 이용자로부터 제출되는 불만사항 및 의견은 우선적으로 그 사항을 처리합니다.</p>
            </section>
            
            <div className="pt-8 border-t border-dinoclass-surface mt-12 text-xs opacity-70">
              <p>본 약관은 2026년 6월 18일부터 적용됩니다.</p>
            </div>

            <div className="mt-12 flex justify-center">
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-8 py-4 bg-dinoclass-spark text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors shadow-lg"
              >
                <ChevronLeft size={20} />
                돌아가기
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
