import React, { useRef, useState, useEffect } from 'react';
import { Image as ImageIcon, X, AlignLeft, AlignCenter, AlignRight, PaintBucket, Type } from 'lucide-react';
import { type DetailBlock } from '../productStore';
import { compressImage } from '../utils/imageCompressor';

interface Props {
  blocks: DetailBlock[];
  onChange: (blocks: DetailBlock[]) => void;
  onShowToast: (msg: string) => void;
}

export default function DetailBlockEditor({ blocks, onChange, onShowToast }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [focusedId, setFocusedId] = useState<string | null>(blocks.find(b => b.type === 'text')?.id || null);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // 현재 포커스된 블록 찾기, 없으면 마지막 텍스트 블록
  const currentBlock = blocks.find(b => b.id === focusedId) 
    || [...blocks].reverse().find(b => b.type === 'text')
    || blocks[0];

  useEffect(() => {
    if (blocks.length === 0) {
      onChange([{ id: crypto.randomUUID(), type: 'text', value: '', size: 'p', align: 'left' }]);
    }
  }, [blocks, onChange]);

  const handleImageFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      onShowToast('⚠️ 이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    try {
      const compressed = await compressImage(file, 600, 0.7);
      
      // 포커스된 블록 바로 뒤에 이미지 삽입, 그 뒤에 빈 텍스트 블록 추가
      const newImageBlock: DetailBlock = { id: crypto.randomUUID(), type: 'image', value: compressed };
      const newTextBlock: DetailBlock = { id: crypto.randomUUID(), type: 'text', value: '', size: 'p', align: 'left' };
      
      const newBlocks = [...blocks];
      const index = blocks.findIndex(b => b.id === (focusedId || currentBlock?.id));
      
      if (index !== -1) {
        newBlocks.splice(index + 1, 0, newImageBlock, newTextBlock);
      } else {
        newBlocks.push(newImageBlock, newTextBlock);
      }
      
      onChange(newBlocks);
      setFocusedId(newTextBlock.id);
      
    } catch (err) {
      console.error(err);
      onShowToast('⚠️ 이미지 압축 중 오류가 발생했습니다.');
    }
  };

  const insertImageBlock = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await handleImageFiles(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateCurrentBlock = (updates: Partial<DetailBlock>) => {
    if (!currentBlock || currentBlock.type !== 'text') return;
    onChange(blocks.map(b => b.id === currentBlock.id ? { ...b, ...updates } : b));
  };

  const removeBlock = (id: string) => {
    const filtered = blocks.filter(b => b.id !== id);
    if (filtered.length === 0) {
      onChange([{ id: crypto.randomUUID(), type: 'text', value: '', size: 'p', align: 'left' }]);
    } else {
      onChange(filtered);
    }
  };

  return (
    <div className="flex flex-col border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/50">
      
      {/* ─── 상단 통합 툴바 ─── */}
      <div className="flex flex-wrap items-center gap-2 p-2 border-b border-zinc-800 bg-zinc-900 sticky top-0 z-10">
        
        {/* 크기 조절 (드롭다운) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSizeMenu(!showSizeMenu)}
            disabled={currentBlock?.type !== 'text'}
            className="p-1.5 rounded-md flex items-center justify-center bg-zinc-800 text-zinc-300 border border-zinc-700 hover:text-white transition-colors disabled:opacity-50"
            title="텍스트 크기"
          >
            <Type size={16} className={currentBlock?.type === 'text' ? "text-dinoclass-spark" : ""} />
          </button>
          
          {showSizeMenu && currentBlock?.type === 'text' && (
            <div className="absolute top-full left-0 mt-1 w-32 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50 py-1 overflow-hidden">
              <button 
                className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-700 ${currentBlock.size === 'h1' ? 'text-dinoclass-spark font-bold' : 'text-zinc-300'}`}
                onClick={() => { updateCurrentBlock({ size: 'h1' }); setShowSizeMenu(false); }}
              >
                제목 1
              </button>
              <button 
                className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-700 ${currentBlock.size === 'h2' ? 'text-dinoclass-spark font-bold' : 'text-zinc-300'}`}
                onClick={() => { updateCurrentBlock({ size: 'h2' }); setShowSizeMenu(false); }}
              >
                제목 2
              </button>
              <button 
                className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-700 ${currentBlock.size === 'p' || !currentBlock.size ? 'text-dinoclass-spark font-bold' : 'text-zinc-300'}`}
                onClick={() => { updateCurrentBlock({ size: 'p' }); setShowSizeMenu(false); }}
              >
                본문
              </button>
            </div>
          )}
        </div>

        <div className="w-[1px] h-5 bg-zinc-700 mx-1" />

        {/* 정렬 */}
        <div className="flex bg-zinc-800 rounded-lg p-0.5 border border-zinc-700">
          <button 
            type="button" 
            onClick={() => updateCurrentBlock({ align: 'left' })} 
            className={`p-1.5 rounded-md ${currentBlock?.align === 'left' || !currentBlock?.align ? 'bg-zinc-700 text-dinoclass-spark' : 'text-zinc-400 hover:text-white'}`}
            disabled={currentBlock?.type !== 'text'}
            title="왼쪽 정렬"
          ><AlignLeft size={14} /></button>
          <button 
            type="button" 
            onClick={() => updateCurrentBlock({ align: 'center' })} 
            className={`p-1.5 rounded-md ${currentBlock?.align === 'center' ? 'bg-zinc-700 text-dinoclass-spark' : 'text-zinc-400 hover:text-white'}`}
            disabled={currentBlock?.type !== 'text'}
            title="가운데 정렬"
          ><AlignCenter size={14} /></button>
          <button 
            type="button" 
            onClick={() => updateCurrentBlock({ align: 'right' })} 
            className={`p-1.5 rounded-md ${currentBlock?.align === 'right' ? 'bg-zinc-700 text-dinoclass-spark' : 'text-zinc-400 hover:text-white'}`}
            disabled={currentBlock?.type !== 'text'}
            title="오른쪽 정렬"
          ><AlignRight size={14} /></button>
        </div>

        <div className="w-[1px] h-5 bg-zinc-700 mx-1" />

        {/* 형광펜 */}
        <div className="flex bg-zinc-800 rounded-lg p-0.5 border border-zinc-700">
          <button 
            type="button" 
            onClick={() => updateCurrentBlock({ highlight: currentBlock?.highlight === 'yellow' ? undefined : 'yellow' })} 
            className={`p-1.5 rounded-md flex items-center gap-1 ${currentBlock?.highlight === 'yellow' ? 'bg-zinc-700 text-dinoclass-spark' : 'text-zinc-400 hover:text-white'}`}
            disabled={currentBlock?.type !== 'text'}
            title="노란색 강조"
          >
            <PaintBucket size={14} className="text-[#FEE800]" />
          </button>
          <button 
            type="button" 
            onClick={() => updateCurrentBlock({ highlight: currentBlock?.highlight === 'green' ? undefined : 'green' })} 
            className={`p-1.5 rounded-md flex items-center gap-1 ${currentBlock?.highlight === 'green' ? 'bg-zinc-700 text-dinoclass-spark' : 'text-zinc-400 hover:text-white'}`}
            disabled={currentBlock?.type !== 'text'}
            title="초록색 강조"
          >
            <PaintBucket size={14} className="text-[#34D399]" />
          </button>
        </div>

        <div className="flex-grow" />

        {/* 이미지 업로드 */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 bg-dinoclass-surface hover:bg-dinoclass-spark hover:text-black text-white px-3 py-1.5 rounded-lg font-bold text-sm transition-colors border border-dinoclass-spark/20"
        >
          <ImageIcon size={14} />
          사진 추가
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={insertImageBlock}
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* ─── 에디터 본문 ─── */}
      <div 
        className={`p-4 space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar transition-colors ${
          isDragging ? 'bg-dinoclass-spark/5 border-2 border-dashed border-dinoclass-spark rounded-b-xl' : ''
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onDrop={async (e) => {
          e.preventDefault();
          setIsDragging(false);
          await handleImageFiles(e.dataTransfer.files);
        }}
      >
        {blocks.map((block) => (
          <div key={block.id} className="relative group">
            {/* 삭제 버튼 */}
            <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button
                type="button"
                onClick={() => removeBlock(block.id)}
                className="bg-red-500/80 text-white p-1 rounded-md hover:bg-red-500 shadow-lg"
              >
                <X size={12} />
              </button>
            </div>
            
            {block.type === 'text' ? (
              <textarea
                value={block.value}
                onFocus={() => setFocusedId(block.id)}
                onChange={(e) => {
                  onChange(blocks.map(b => b.id === block.id ? { ...b, value: e.target.value } : b));
                  // 자동 높이 조절
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                className={`w-full bg-transparent focus:outline-none resize-none overflow-hidden transition-all placeholder:text-zinc-700 ${
                  block.size === 'h1' ? 'text-2xl font-bold' : 
                  block.size === 'h2' ? 'text-xl font-bold' : 'text-sm'
                } ${block.align === 'center' ? 'text-center' : block.align === 'right' ? 'text-right' : 'text-left'} ${
                  block.highlight === 'yellow' ? 'bg-[#FEE800]/20 text-[#FEE800]' : 
                  block.highlight === 'green' ? 'bg-[#34D399]/20 text-[#34D399]' : 'text-white'
                }`}
                placeholder="여기에 내용을 작성하세요..."
                style={{ minHeight: '40px' }}
              />
            ) : (
              <div className="flex justify-center bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800">
                {block.value ? (
                  <img src={block.value} alt="본문 이미지" className="max-w-full max-h-[400px] object-contain" />
                ) : null}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
