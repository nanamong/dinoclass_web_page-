import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PlayCircle } from 'lucide-react';
import { useMyCourseStore } from './myCourseStore';
import { getProductById, type Product } from './productStore';

export default function CourseViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const hasEnrolled = useMyCourseStore((state) => state.hasEnrolled);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    // 권한 체크
    if (!hasEnrolled(id)) {
      alert('수강 권한이 없습니다. 마이페이지로 이동합니다.');
      navigate('/mypage');
      return;
    }

    getProductById(id).then((prod) => {
      if (prod) setProduct(prod);
      setLoading(false);
    });
  }, [id, navigate, hasEnrolled]);

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-2 border-dinoclass-spark border-t-transparent animate-spin rounded-full"></div></div>;
  }

  if (!product) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">강의 정보를 불러올 수 없습니다.</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <header className="bg-black border-b border-zinc-800 p-4 flex items-center justify-between">
        <button 
          onClick={() => navigate('/mypage')}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} /> 마이페이지로
        </button>
        <h1 className="font-bold truncate max-w-xl text-center">{product.name}</h1>
        <div className="w-24"></div> {/* Spacer for centering */}
      </header>

      {/* Player Section */}
      <main className="flex-grow flex flex-col">
        <div className="w-full bg-black flex-grow flex items-center justify-center p-4 lg:p-10 relative">
          {product.videoUrl ? (
            <div className="w-full max-w-5xl aspect-video bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl relative">
              <iframe
                src={product.videoUrl.includes('vimeo') 
                  ? product.videoUrl + (product.videoUrl.includes('?') ? '&' : '?') + 'title=0&byline=0&portrait=0' 
                  : product.videoUrl}
                className="w-full h-full absolute top-0 left-0"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <div className="w-full max-w-5xl aspect-video bg-zinc-900 rounded-2xl flex flex-col items-center justify-center text-zinc-500">
              <PlayCircle size={64} className="mb-4 opacity-50" />
              <p>아직 동영상 링크가 등록되지 않았습니다.</p>
            </div>
          )}
        </div>
        
        {/* Course Info */}
        <div className="bg-zinc-900 p-6 lg:p-10 border-t border-zinc-800">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">{product.name}</h2>
            <p className="text-zinc-400 leading-relaxed">{product.description}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
