import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, User, Phone } from 'lucide-react';
import { addSubscriber } from '../newsletterStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export default function NewsletterModal({ isOpen, onClose, onShowToast }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim()) {
      onShowToast('⚠️ 모든 정보를 입력해주세요.');
      return;
    }
    
    addSubscriber({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
    });
    
    onShowToast('🎉 구독이 완료되었습니다!');
    setName('');
    setPhone('');
    setEmail('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* 모달 컨텐츠 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 border border-dinoclass-surface rounded-2xl p-8 w-full max-w-md shadow-2xl relative"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-dinoclass-spark/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-dinoclass-spark/20">
                  <Mail size={32} className="text-dinoclass-spark" />
                </div>
                <h2 className="text-2xl font-bold mb-2">무료 뉴스레터 구독</h2>
                <p className="text-dinoclass-textSub text-sm">
                  수익화 템플릿과 실전 노하우를 가장 먼저 받아보세요!
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dinoclass-textSub mb-1.5 ml-1">이름</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="홍길동"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-dinoclass-spark transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dinoclass-textSub mb-1.5 ml-1">전화번호</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="010-0000-0000"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-dinoclass-spark transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dinoclass-textSub mb-1.5 ml-1">이메일 주소</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-dinoclass-spark transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-dinoclass-spark text-black font-bold py-4 rounded-xl mt-4 hover:bg-yellow-400 transition-all hover:shadow-[0_0_20px_rgba(254,232,0,0.2)] active:scale-[0.98]"
                >
                  무료로 즉시 구독하기
                </button>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
