import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlayCircle, LogOut, BookOpen } from 'lucide-react';
import { useAuthStore } from './authStore';
import { useMyCourseStore } from './myCourseStore';
import { CATEGORY_LABELS } from './productStore';

export default function MyPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const enrolledCourses = useMyCourseStore((state) => state.enrolledCourses);

  // If not logged in, ask to login
  if (!user) {
    return (
      <div className="min-h-screen bg-premium-grey flex flex-col items-center justify-center px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">로그인이 필요합니다</h2>
        <p className="text-dinoclass-textSub mb-8">마이페이지를 이용하시려면 로그인을 해주세요.</p>
        <button
          onClick={() => {
            const email = window.prompt('이메일을 입력하세요 (임시 데모)');
            if (email) {
              const name = window.prompt('이름을 입력하세요') || '수강생';
              useAuthStore.getState().login(email, name);
            }
          }}
          className="bg-dinoclass-spark text-black font-bold py-3 px-8 rounded-xl"
        >
          임시 로그인하기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Profile Area */}
      <div className="bg-zinc-900 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-dinoclass-spark text-black flex items-center justify-center text-3xl font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">안녕하세요, {user.name}님!</h1>
              <p className="text-zinc-400">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors font-medium"
            >
              메인으로
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors flex items-center gap-2 font-medium"
            >
              <LogOut size={18} /> 로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* Course List Area */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <BookOpen className="text-dinoclass-spark" /> 내 수강 목록
          </h2>
          <span className="bg-dinoclass-surface text-dinoclass-textSub px-4 py-1.5 rounded-full text-sm font-bold">
            총 {enrolledCourses.length}개
          </span>
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="bg-dinoclass-surface/20 border border-dinoclass-surface rounded-2xl p-16 text-center">
            <p className="text-dinoclass-textSub text-lg mb-6">아직 수강 중인 강의가 없습니다.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-dinoclass-spark text-black font-bold py-3 px-8 rounded-xl"
            >
              강의 구경하러 가기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <motion.div
                key={course.product.id}
                whileHover={{ y: -4 }}
                className="border border-dinoclass-surface rounded-2xl overflow-hidden flex flex-col bg-white shadow-sm hover:shadow-xl hover:border-dinoclass-spark/50 transition-all"
              >
                <div className="aspect-video bg-zinc-900 relative">
                  {course.product.imageUrl ? (
                    <img src={course.product.imageUrl} alt={course.product.name} className="w-full h-full object-cover opacity-80" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">No Image</div>
                  )}
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur text-white text-xs px-2 py-1 rounded font-bold">
                    {CATEGORY_LABELS[course.product.category]}
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2 leading-tight">
                    {course.product.name}
                  </h3>
                  {course.selectedOption && (
                    <p className="text-sm text-dinoclass-textSub mb-4">
                      {course.selectedOption.name}
                    </p>
                  )}
                  <div className="mt-auto">
                    {(course.product.category === 'vod' || course.product.category === 'freebie' || course.product.category === 'free_course') ? (
                      <button
                        onClick={() => navigate(`/course/${course.product.id}`)}
                        className="w-full bg-dinoclass-spark text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-400 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                      >
                        <PlayCircle size={18} /> 강의 시청하기
                      </button>
                    ) : (
                      <button
                        onClick={() => alert('전자책 다운로드는 곧 지원될 예정입니다.')}
                        className="w-full bg-dinoclass-surface text-dinoclass-textMain font-bold py-3 rounded-xl hover:bg-zinc-200 transition-colors"
                      >
                        전자책 다운로드
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
