import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, User, Phone, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import emailjs from '@emailjs/browser';
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
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setIsSuccess(false);
        setName('');
        setPhone('');
        setEmail('');
      }, 300);
    }
  }, [isOpen]);

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

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (serviceId && templateId && publicKey) {
      emailjs.send(
        serviceId,
        templateId,
        {
          to_name: name.trim(),
          to_email: email.trim(),
          homepage_url: window.location.origin
        },
        publicKey
      ).then((response) => {
        console.log('SUCCESS!', response.status, response.text);
      }).catch((err) => {
        console.error('FAILED...', err);
      });
    } else {
      console.warn("EmailJS is not configured. Email will not be sent.");
    }
    
    setIsSuccess(true);
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#fee800', '#2dd4bf', '#a855f7', '#fb7185']
    });
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
              className="bg-white border border-zinc-200 rounded-2xl p-8 w-full max-w-md shadow-2xl relative"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-800 transition-colors"
              >
                <X size={20} />
              </button>

              {isSuccess ? (
                <div className="text-center py-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-20 h-20 bg-dinoclass-spark/20 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle2 size={40} className="text-teal-600" />
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-4 text-zinc-900">구독이 완료되었습니다!</h2>
                  <p className="text-zinc-600 mb-8 leading-relaxed">
                    디노클래스의 웰컴선물키트를<br />입력하신 이메일로 보내드릴게요.
                  </p>
                  <button
                    onClick={onClose}
                    className="w-full bg-zinc-100 text-zinc-900 font-bold py-4 rounded-xl hover:bg-zinc-200 transition-all"
                  >
                    닫기
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-dinoclass-spark/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-dinoclass-spark/20">
                      <Mail size={32} className="text-dinoclass-spark" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-zinc-900">무료 뉴스레터 구독</h2>
                    <p className="text-zinc-500 text-sm">
                      수익화 템플릿과 실전 노하우를 가장 먼저 받아보세요!
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1.5 ml-1">이름</label>
                      <div className="relative">
                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="홍길동"
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-10 pr-4 text-zinc-900 focus:outline-none focus:border-dinoclass-spark focus:bg-white transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1.5 ml-1">전화번호</label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="010-0000-0000"
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-10 pr-4 text-zinc-900 focus:outline-none focus:border-dinoclass-spark focus:bg-white transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1.5 ml-1">이메일 주소</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="example@email.com"
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-10 pr-4 text-zinc-900 focus:outline-none focus:border-dinoclass-spark focus:bg-white transition-colors"
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
                </>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
