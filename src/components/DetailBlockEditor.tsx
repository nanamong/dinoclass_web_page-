import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Type, X, Trash2, AlignLeft, AlignCenter, Heading1, Heading2, Text as TextIcon, Plus } from 'lucide-react';
import { type DetailBlock } from '../productStore';
import { compressImage } from '../utils/imageCompressor';

interface Props {
  blocks: DetailBlock[];
  onChange: (blocks: DetailBlock[]) => void;
  onShowToast: (msg: string) => void;
}

export default function DetailBlockEditor({ blocks, onChange, onShowToast }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [insertIndex, setInsertIndex] = useState<number | null>(null);

  const insertBlock = (index: number, type: 'text' | 'image', value = '') => {
    const newBlock: DetailBlock = { id: crypto.randomUUID(), type, value };
    if (type === 'text') {
      newBlock.size = 'p';
      newBlock.align = 'left';
    }
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    onChange(newBlocks);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      onShowToast('⚠️ 이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    try {
      const compressed = await compressImage(file, 800, 0.7);
      if (insertIndex !== null) {
        insertBlock(insertIndex, 'image', compressed);
      } else {
        onChange([...blocks, { id: crypto.randomUUID(), type: 'image', value: compressed }]);
      }
    } catch (err) {
      console.error(err);
      onShowToast('⚠️ 이미지 압축 중 오류가 발생했습니다.');
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setInsertIndex(null);
  };

  const openImageUpload = (index: number | null) => {
    setInsertIndex(index);
    fileInputRef.current?.click();
  };

  const updateBlock = (id: string, updates: Partial<DetailBlock>) => {
    onChange(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const removeBlock = (id: string) => {
    onChange(blocks.filter(b => b.id !== id));
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= blocks.length) return;
    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[index + direction];
    newBlocks[index + direction] = temp;
    onChange(newBlocks);
  };

  return (
    <div className="space-y-2">
      {blocks.map((block, index) => (
        <React.Fragment key={block.id}>
          {/* 블록 본체 */}
          <div className="relative group bg-zinc-900/50 border border-transparent hover:border-dinoclass-spark/30 rounded-xl p-3 transition-colors">
            
            {/* 우측 상단 컨트롤러 */}
            <div className="absolute -right-2 -top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button
                type="button"
                onClick={() => moveBlock(index, -1)}
                className="bg-zinc-800 text-white p-1.5 rounded-md hover:bg-zinc-700 text-xs shadow-lg"
                disabled={index === 0}
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveBlock(index, 1)}
                className="bg-zinc-800 text-white p-1.5 rounded-md hover:bg-zinc-700 text-xs shadow-lg"
                disabled={index === blocks.length - 1}
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeBlock(block.id)}
                className="bg-red-500/80 text-white p-1.5 rounded-md hover:bg-red-500 shadow-lg"
              >
                <X size={14} />
              </button>
            </div>
            
            {block.type === 'text' ? (
              <div className="flex flex-col gap-2">
                {/* 텍스트 포맷팅 툴바 */}
                <div className="flex gap-1 border-b border-zinc-800 pb-2 mb-1">
                  <button type="button" onClick={() => updateBlock(block.id, { size: 'h1' })} className={`p-1.5 rounded ${block.size === 'h1' ? 'bg-zinc-700 text-dinoclass-spark' : 'text-zinc-400 hover:bg-zinc-800'}`} title="큰 제목">
                    <Heading1 size={14} />
                  </button>
                  <button type="button" onClick={() => updateBlock(block.id, { size: 'h2' })} className={`p-1.5 rounded ${block.size === 'h2' ? 'bg-zinc-700 text-dinoclass-spark' : 'text-zinc-400 hover:bg-zinc-800'}`} title="작은 제목">
                    <Heading2 size={14} />
                  </button>
                  <button type="button" onClick={() => updateBlock(block.id, { size: 'p' })} className={`p-1.5 rounded ${!block.size || block.size === 'p' ? 'bg-zinc-700 text-dinoclass-spark' : 'text-zinc-400 hover:bg-zinc-800'}`} title="본문">
                    <TextIcon size={14} />
                  </button>
                  <div className="w-[1px] h-4 bg-zinc-700 mx-1 self-center" />
                  <button type="button" onClick={() => updateBlock(block.id, { align: 'left' })} className={`p-1.5 rounded ${!block.align || block.align === 'left' ? 'bg-zinc-700 text-dinoclass-spark' : 'text-zinc-400 hover:bg-zinc-800'}`} title="왼쪽 정렬">
                    <AlignLeft size={14} />
                  </button>
                  <button type="button" onClick={() => updateBlock(block.id, { align: 'center' })} className={`p-1.5 rounded ${block.align === 'center' ? 'bg-zinc-700 text-dinoclass-spark' : 'text-zinc-400 hover:bg-zinc-800'}`} title="가운데 정렬">
                    <AlignCenter size={14} />
                  </button>
                </div>
                
                {/* 텍스트 입력창 */}
                <textarea
                  value={block.value}
                  onChange={(e) => updateBlock(block.id, { value: e.target.value })}
                  className={`w-full bg-transparent text-white focus:outline-none resize-y min-h-[80px] ${
                    block.size === 'h1' ? 'text-2xl font-bold' : 
                    block.size === 'h2' ? 'text-xl font-bold' : 'text-sm'
                  } ${block.align === 'center' ? 'text-center' : 'text-left'}`}
                  placeholder="내용을 입력하세요..."
                />
              </div>
            ) : (
              <div className="flex justify-center bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800 relative">
                {block.value ? (
                  <img src={block.value} alt="본문 이미지" className="max-h-[300px] object-contain" />
                ) : (
                  <div className="h-24 flex items-center justify-center text-zinc-500">이미지가 없습니다</div>
                )}
              </div>
            )}
          </div>

          {/* 블록 중간 인라인 삽입 컨트롤 (마지막 블록 제외) */}
          {index < blocks.length - 1 && (
            <div className="relative h-4 flex items-center justify-center group/insert -my-1 z-0">
              <div className="absolute w-full h-[1px] bg-zinc-800/0 group-hover/insert:bg-dinoclass-spark/50 transition-colors" />
              <div className="flex gap-2 opacity-0 group-hover/insert:opacity-100 transition-opacity bg-dinoclass-background px-3">
                <button type="button" onClick={() => insertBlock(index, 'text')} className="flex items-center gap-1 text-[10px] bg-zinc-800 text-zinc-300 px-2 py-1 rounded-full hover:bg-dinoclass-spark hover:text-black">
                  <Plus size={10} /> 텍스트
                </button>
                <button type="button" onClick={() => openImageUpload(index)} className="flex items-center gap-1 text-[10px] bg-zinc-800 text-zinc-300 px-2 py-1 rounded-full hover:bg-dinoclass-spark hover:text-black">
                  <Plus size={10} /> 이미지
                </button>
              </div>
            </div>
          )}
        </React.Fragment>
      ))}

      {/* 맨 아래 기본 추가 버튼 */}
      <div className="flex gap-2 pt-4">
        <button
          type="button"
          onClick={() => insertBlock(blocks.length - 1, 'text')}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-zinc-700 border-dashed text-zinc-400 font-medium hover:bg-zinc-800 hover:text-white transition-all text-sm"
        >
          <Type size={16} />
          텍스트 추가
        </button>
        <button
          type="button"
          onClick={() => openImageUpload(null)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-zinc-700 border-dashed text-zinc-400 font-medium hover:bg-zinc-800 hover:text-white transition-all text-sm"
        >
          <ImageIcon size={16} />
          이미지 추가
        </button>
      </div>

      {/* 공용 파일 인풋 */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
