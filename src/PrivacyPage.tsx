import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold mb-8">개인정보처리방침</h1>
          
          <div className="space-y-8 text-dinoclass-textSub leading-relaxed text-sm">
            <section>
              <p>디노클래스(이하 "회사"라 합니다)는 「개인정보 보호법」 등 관련 법령을 준수하며, 이용자의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보 처리방침을 수립·공개합니다.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">1. 개인정보의 처리 목적</h2>
              <p>회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며 이용 목적이 변경되는 경우에는 관련 법령에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>회원 가입 및 관리: 회원 가입 의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지, 각종 고지·통지, 고충처리 등</li>
                <li>재화 또는 서비스 제공: 물품배송, 서비스 제공, 청구서 발송, 콘텐츠 제공, 맞춤 서비스 제공, 본인인증, 연령인증, 요금결제·정산, 채권추심 등</li>
                <li>마케팅 및 광고에의 활용: 신규 서비스(제품) 개발 및 맞춤 서비스 제공, 이벤트 및 참여기회 제공, 광고성 정보 제공 등</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">2. 처리하는 개인정보의 항목</h2>
              <p>회사는 다음의 개인정보 항목을 처리하고 있습니다.</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>필수항목: 이메일 주소, 이름(닉네임), 비밀번호</li>
                <li>선택항목: 휴대전화번호, 결제 정보(신용카드 정보, 은행계좌 정보 등 결제 시 필요한 정보)</li>
                <li>서비스 이용 과정에서 자동으로 생성되어 수집될 수 있는 항목: IP 주소, 쿠키, 방문 일시, 서비스 이용 기록, 불량 이용 기록 등</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">3. 개인정보의 처리 및 보유 기간</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>회사는 법령에 따른 개인정보 보유·이용기간 또는 이용자로부터 개인정보를 수집 시에 동의 받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</li>
                <li>각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.
                  <ul className="list-circle pl-5 mt-2 space-y-1">
                    <li>홈페이지 회원 가입 및 관리: 사업자/단체 홈페이지 탈퇴 시까지</li>
                    <li>다만, 관계 법령 위반에 따른 수사·조사 등이 진행 중인 경우에는 해당 수사·조사 종료 시까지</li>
                    <li>재화 또는 서비스 제공: 재화·서비스 공급완료 및 요금결제·정산 완료시까지</li>
                  </ul>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">4. 개인정보의 제3자 제공</h2>
              <p>회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다.</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>이용자들이 사전에 동의한 경우</li>
                <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">5. 정보주체의 권리, 의무 및 그 행사방법</h2>
              <p>이용자는 개인정보주체로서 언제든지 개인정보 열람, 정정, 삭제, 처리정지 요구 등의 권리를 행사할 수 있습니다. 권리 행사는 회사에 대해 서면, 전화, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 회사는 이에 대해 지체 없이 조치하겠습니다.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">6. 개인정보 보호책임자</h2>
              <p>회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
              <ul className="list-none space-y-1 mt-2 p-4 bg-zinc-900/50 rounded-xl">
                <li>▶ 개인정보 보호책임자</li>
                <li>성명 : 권윤혜</li>
                <li>직책 : 대표</li>
                <li>연락처 : a92151665@gmail.com</li>
              </ul>
            </section>

            <div className="pt-8 border-t border-dinoclass-surface mt-12 text-xs opacity-70">
              <p>본 개인정보처리방침은 2026년 6월 18일부터 적용됩니다.</p>
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
