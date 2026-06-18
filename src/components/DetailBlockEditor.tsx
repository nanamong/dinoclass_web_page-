import React, { useRef, useState, useEffect } from 'react';
import { Image as ImageIcon, X, AlignLeft, AlignCenter, AlignRight, PaintBucket, Type } from 'lucide-react';
import { type DetailBlock } from '../productStore';
import { compressImage } from '../utils/imageCompressor';

/* ─── WYSIWYG 텍스트 에디터 블록 ─── */
const TextEditorBlock = ({ block, onChange, onFocus }: { block: DetailBlock, onChange: (val: string) => void, onFocus: () => void }) => {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (divRef.current && divRef.current.innerHTML !== block.value) {
      let html = block.value;
      // 기존 텍스트(HTML 태그가 없는 경우)를 HTML로 변환하여 하위 호환성 유지
      if (!html.includes('<') && html.trim() !== '') {
        html = html.split('\n').map(line => {
          if (line.trim() === '') return '<p><br></p>';
          
          let style = '';
          if (block.align === 'center') style += 'text-align: center; ';
          else if (block.align === 'right') style += 'text-align: right; ';
          
          let tag = 'p';
          if (block.size === 'h1') tag = 'h1';
          else if (block.size === 'h2') tag = 'h2';

          let inner = line;
          if (block.highlight === 'yellow') {
            inner = `<span style="background-color: yellow;">${line}</span>`;
          } else if (block.highlight === 'green') {
            inner = `<span style="background-color: aquamarine;">${line}</span>`;
          }

          return `<${tag} style="${style}">${inner}</${tag}>`;
        }).join('');
      } else if (html.trim() === '') {
        html = '<p><br></p>';
      }
      divRef.current.innerHTML = html;
      
      // 만약 HTML로 자동 변환되었다면 상위 컴포넌트에도 변경사항 알림
      if (html !== block.value) {
        onChange(html);
      }
    }
  }, []);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    onChange(e.currentTarget.innerHTML);
  };

  return (
    <div
      ref={divRef}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onFocus={onFocus}
      onBlur={(e) => onChange(e.currentTarget.innerHTML)}
      className="w-full bg-transparent focus:outline-none min-h-[40px] text-white outline-none prose-editor"
      placeholder="여기에 내용을 작성하세요..."
    />
  );
};

/* ─── 상세페이지 에디터 컴포넌트 ─── */
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

  const currentBlock = blocks.find(b => b.id === focusedId) 
    || [...blocks].reverse().find(b => b.type === 'text')
    || blocks[0];

  useEffect(() => {
    if (blocks.length === 0) {
      onChange([{ id: crypto.randomUUID(), type: 'text', value: '' }]);
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
      
      const newImageBlock: DetailBlock = { id: crypto.randomUUID(), type: 'image', value: compressed };
      const newTextBlock: DetailBlock = { id: crypto.randomUUID(), type: 'text', value: '' };
      
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

  const removeBlock = (id: string) => {
    const filtered = blocks.filter(b => b.id !== id);
    if (filtered.length === 0) {
      onChange([{ id: crypto.randomUUID(), type: 'text', value: '' }]);
    } else {
      onChange(filtered);
    }
  };

  // 브라우저 내장 WYSIWYG 명령어 실행
  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  return (
    <div className="flex flex-col border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/50">
      
      {/* ─── 상단 통합 툴바 ─── */}
      <div className="flex flex-wrap items-center gap-2 p-2 border-b border-zinc-800 bg-zinc-900 sticky top-0 z-10">
        
        {/* 크기 조절 (드롭다운) */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()} // 포커스 잃음 방지
            onClick={() => setShowSizeMenu(!showSizeMenu)}
            disabled={currentBlock?.type !== 'text'}
            className="p-1.5 rounded-md flex items-center justify-center bg-zinc-800 text-zinc-300 border border-zinc-700 hover:text-white transition-colors disabled:opacity-50"
            title="텍스트 크기"
          >
            <Type size={16} />
          </button>
          
          {showSizeMenu && currentBlock?.type === 'text' && (
            <div className="absolute top-full left-0 mt-1 w-32 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50 py-1 overflow-hidden">
              <button 
                onMouseDown={(e) => e.preventDefault()}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-700 text-zinc-300`}
                onClick={() => { applyFormat('formatBlock', 'H1'); setShowSizeMenu(false); }}
              >
                제목 1
              </button>
              <button 
                onMouseDown={(e) => e.preventDefault()}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-700 text-zinc-300`}
                onClick={() => { applyFormat('formatBlock', 'H2'); setShowSizeMenu(false); }}
              >
                제목 2
              </button>
              <button 
                onMouseDown={(e) => e.preventDefault()}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-700 text-zinc-300`}
                onClick={() => { applyFormat('formatBlock', 'P'); setShowSizeMenu(false); }}
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
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyFormat('justifyLeft')} 
            className={`p-1.5 rounded-md text-zinc-400 hover:text-white`}
            disabled={currentBlock?.type !== 'text'}
            title="왼쪽 정렬"
          ><AlignLeft size={14} /></button>
          <button 
            type="button" 
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyFormat('justifyCenter')} 
            className={`p-1.5 rounded-md text-zinc-400 hover:text-white`}
            disabled={currentBlock?.type !== 'text'}
            title="가운데 정렬"
          ><AlignCenter size={14} /></button>
          <button 
            type="button" 
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyFormat('justifyRight')} 
            className={`p-1.5 rounded-md text-zinc-400 hover:text-white`}
            disabled={currentBlock?.type !== 'text'}
            title="오른쪽 정렬"
          ><AlignRight size={14} /></button>
        </div>

        <div className="w-[1px] h-5 bg-zinc-700 mx-1" />

        {/* 형광펜 & 이미지 추가 */}
        <div className="flex bg-zinc-800 rounded-lg p-0.5 border border-zinc-700 items-center">
          <button 
            type="button" 
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyFormat('hiliteColor', 'yellow')} 
            className={`p-1.5 rounded-md flex items-center gap-1 text-zinc-400 hover:text-white`}
            disabled={currentBlock?.type !== 'text'}
            title="선택한 영역 노란색 강조"
          >
            <PaintBucket size={14} className="text-[#FEE800]" />
          </button>
          <button 
            type="button" 
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyFormat('hiliteColor', 'aquamarine')} 
            className={`p-1.5 rounded-md flex items-center gap-1 text-zinc-400 hover:text-white`}
            disabled={currentBlock?.type !== 'text'}
            title="선택한 영역 초록색 강조"
          >
            <PaintBucket size={14} className="text-dinoclass-spark" />
          </button>
          
          <div className="w-[1px] h-4 bg-zinc-700 mx-1" />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-md flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
            title="사진 추가"
          >
            <ImageIcon size={14} />
          </button>
        </div>
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
          <div key={block.id} className="relative group min-h-[40px]">
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
              <TextEditorBlock 
                block={block} 
                onChange={(html) => {
                  onChange(blocks.map(b => b.id === block.id ? { ...b, value: html } : b));
                }}
                onFocus={() => setFocusedId(block.id)}
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
