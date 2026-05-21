import React, { useRef } from 'react';
import { Image, Type, X, Trash2 } from 'lucide-react';
import { type DetailBlock } from '../productStore';
import { compressImage } from '../utils/imageCompressor';

interface Props {
  blocks: DetailBlock[];
  onChange: (blocks: DetailBlock[]) => void;
  onShowToast: (msg: string) => void;
}

export default function DetailBlockEditor({ blocks, onChange, onShowToast }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addTextBlock = () => {
    onChange([...blocks, { id: crypto.randomUUID(), type: 'text', value: '' }]);
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
      onChange([...blocks, { id: crypto.randomUUID(), type: 'image', value: compressed }]);
    } catch (err) {
      console.error(err);
      onShowToast('⚠️ 이미지 압축 중 오류가 발생했습니다.');
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateBlock = (id: string, value: string) => {
    onChange(blocks.map(b => b.id === id ? { ...b, value } : b));
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
    <div className="space-y-4">
      <div className="space-y-3">
        {blocks.map((block, index) => (
          <div key={block.id} className="relative group bg-zinc-900/50 border border-dinoclass-surface rounded-xl p-3 transition-colors hover:border-dinoclass-spark/30">
            <div className="absolute -right-2 -top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => moveBlock(index, -1)}
                className="bg-zinc-800 text-white p-1.5 rounded-md hover:bg-zinc-700 text-xs"
                disabled={index === 0}
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveBlock(index, 1)}
                className="bg-zinc-800 text-white p-1.5 rounded-md hover:bg-zinc-700 text-xs"
                disabled={index === blocks.length - 1}
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeBlock(block.id)}
                className="bg-red-500/80 text-white p-1.5 rounded-md hover:bg-red-500"
              >
                <X size={14} />
              </button>
            </div>
            
            {block.type === 'text' ? (
              <textarea
                value={block.value}
                onChange={(e) => updateBlock(block.id, e.target.value)}
                className="w-full bg-transparent text-white focus:outline-none resize-y min-h-[80px] text-sm"
                placeholder="텍스트를 입력하세요..."
              />
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
        ))}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={addTextBlock}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-dinoclass-surface text-dinoclass-textSub font-medium hover:bg-dinoclass-surface/50 hover:text-white transition-all text-sm"
        >
          <Type size={16} />
          텍스트 추가
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-dinoclass-surface text-dinoclass-textSub font-medium hover:bg-dinoclass-surface/50 hover:text-white transition-all text-sm"
        >
          <Image size={16} />
          이미지 추가
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
      </div>
    </div>
  );
}
