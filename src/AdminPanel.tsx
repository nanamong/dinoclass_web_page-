import { useState, useEffect, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Trash2, Image, DollarSign, FileText, Package,
  ShieldCheck, LayoutDashboard, Database, Tag, ChevronDown, AlignLeft, Pencil, X, Save
} from 'lucide-react'
import {
  getProducts, addProduct, deleteProduct, updateProduct,
  CATEGORY_LABELS,
  type Product, type ProductCategory
} from './productStore'

const CATEGORIES: ProductCategory[] = ['ebook', 'vod', 'freebie']

/* 이미지 압축 및 Base64 변환 유틸리티 (localStorage 쿼터 초과 방지) */
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new window.Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 600
        const MAX_HEIGHT = 600
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(event.target?.result as string)
          return
        }

        ctx.drawImage(img, 0, 0, width, height)
        // JPEG 품질 0.7 압축으로 용량 최적화 (30KB~50KB 내외)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7)
        resolve(compressedBase64)
      }
      img.onerror = (err) => reject(err)
    }
    reader.onerror = (err) => reject(err)
  })
}

export default function AdminPanel() {
  /* ─── state ─── */
  const [products, setProducts] = useState<Product[]>([])
  const [category, setCategory] = useState<ProductCategory>('ebook')
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [detailContent, setDetailContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<ProductCategory | 'all'>('all')

  /* ─── 이미지 업로드 인터페이스 추가 state ─── */
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload')
  const [isDragging, setIsDragging] = useState(false)
  const [isCompilingImage, setIsCompilingImage] = useState(false)

  /* ─── 수정 모달 state ─── */
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editDetailContent, setEditDetailContent] = useState('')
  const [editImageUrl, setEditImageUrl] = useState('')
  const [editCategory, setEditCategory] = useState<ProductCategory>('ebook')

  const reload = () => setProducts(getProducts())
  useEffect(reload, [])

  /* ─── handlers ─── */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      await processImageFile(files[0])
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      await processImageFile(files[0])
    }
  }

  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('⚠️ 이미지 파일만 업로드할 수 있습니다.')
      return
    }
    // 최대 용량 5MB 체크 (압축 전)
    if (file.size > 5 * 1024 * 1024) {
      showToast('⚠️ 5MB 이하의 페이지만 업로드 가능합니다.')
      return
    }

    setIsCompilingImage(true)
    try {
      const compressed = await compressImage(file)
      setImageUrl(compressed)
      showToast('✅ 이미지가 정상적으로 압축 업로드되었습니다.')
    } catch (err) {
      console.error(err)
      showToast('⚠️ 이미지 변환 중 오류가 발생했습니다.')
    } finally {
      setIsCompilingImage(false)
    }
  }
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !price.trim()) {
      showToast('⚠️ 상품명과 가격은 필수 입력입니다.')
      return
    }
    addProduct({
      category,
      name: name.trim(),
      price: price.trim(),
      description: description.trim(),
      detailContent: detailContent.trim(),
      imageUrl: imageUrl.trim(),
    })
    setName(''); setPrice(''); setDescription(''); setDetailContent(''); setImageUrl('')
    reload()
    showToast(`✅ [${CATEGORY_LABELS[category]}] 상품이 등록되었습니다!`)
  }

  const handleDelete = (id: string) => {
    deleteProduct(id)
    reload()
    showToast('🗑️ 상품이 삭제되었습니다.')
  }

  const openEdit = (product: Product) => {
    setEditingProduct(product)
    setEditName(product.name)
    setEditPrice(product.price)
    setEditDescription(product.description)
    setEditDetailContent(product.detailContent || '')
    setEditImageUrl(product.imageUrl)
    setEditCategory(product.category)
  }

  const handleEditSave = () => {
    if (!editingProduct) return
    if (!editName.trim() || !editPrice.trim()) {
      showToast('⚠️ 상품명과 가격은 필수 입력입니다.')
      return
    }
    updateProduct(editingProduct.id, {
      category: editCategory,
      name: editName.trim(),
      price: editPrice.trim(),
      description: editDescription.trim(),
      detailContent: editDetailContent.trim(),
      imageUrl: editImageUrl,
    })
    setEditingProduct(null)
    reload()
    showToast('✅ 상품이 수정되었습니다!')
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const filteredProducts = filterCategory === 'all'
    ? products
    : products.filter((p) => p.category === filterCategory)

  /* ─── render ─── */
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-dinoclass-surface border border-dinoclass-spark/40 text-white px-8 py-4 rounded-xl shadow-2xl text-sm font-medium"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 환영 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="admin-glass rounded-2xl p-8 mb-10 border border-dinoclass-spark/20"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-dinoclass-spark/10 flex items-center justify-center">
            <ShieldCheck className="text-dinoclass-spark" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">상품 등록 대시보드</h1>
            <p className="text-dinoclass-textSub text-sm">
              상품을 등록하면 카테고리에 맞는 섹션에 실시간으로 자동 진열됩니다.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* ── 좌측: 상품 등록 폼 ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="admin-glass rounded-2xl border border-dinoclass-surface overflow-hidden">
            <div className="px-6 py-5 border-b border-dinoclass-surface flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-dinoclass-spark/10 flex items-center justify-center">
                <Plus className="text-dinoclass-spark" size={18} />
              </div>
              <h2 className="font-bold text-white text-lg">새 상품 등록</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* 상품 종류 분류 드롭다운 */}
              <div>
                <label className="admin-label flex items-center gap-2 mb-2">
                  <Tag size={14} className="text-dinoclass-spark" />
                  상품 종류 분류 <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select
                    id="product-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="admin-select"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_LABELS[cat]}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-dinoclass-textSub pointer-events-none" />
                </div>
              </div>

              {/* 상품명 */}
              <div>
                <label className="admin-label flex items-center gap-2 mb-2">
                  <Package size={14} className="text-dinoclass-spark" />
                  상품명 <span className="text-red-400">*</span>
                </label>
                <input
                  id="product-name"
                  type="text"
                  placeholder="예) 왕초보를 위한 패시브 인컴 가이드"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="admin-input"
                />
              </div>

              {/* 가격 */}
              <div>
                <label className="admin-label flex items-center gap-2 mb-2">
                  <DollarSign size={14} className="text-dinoclass-spark" />
                  가격 <span className="text-red-400">*</span>
                </label>
                <input
                  id="product-price"
                  type="text"
                  placeholder="예) 39,000원"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="admin-input"
                />
              </div>

              {/* 한 줄 설명 */}
              <div>
                <label className="admin-label flex items-center gap-2 mb-2">
                  <FileText size={14} className="text-dinoclass-spark" />
                  한 줄 설명
                </label>
                <input
                  id="product-description"
                  type="text"
                  placeholder="예) 부업으로 월 100만 원 수익을 만드는 실전 노하우"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="admin-input"
                />
              </div>

              {/* 상품 이미지 업로드 및 URL 주소 입력 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="admin-label flex items-center gap-2">
                    <Image size={14} className="text-dinoclass-spark" />
                    상품 이미지
                  </label>
                  {/* 토글 탭 */}
                  <div className="flex gap-1 bg-dinoclass-background/60 rounded-lg p-0.5 border border-dinoclass-surface">
                    <button
                      type="button"
                      onClick={() => setImageMode('upload')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                        imageMode === 'upload'
                          ? 'bg-dinoclass-spark text-black'
                          : 'text-dinoclass-textSub hover:text-white'
                      }`}
                    >
                      파일 업로드
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode('url')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                        imageMode === 'url'
                          ? 'bg-dinoclass-spark text-black'
                          : 'text-dinoclass-textSub hover:text-white'
                      }`}
                    >
                      웹 링크 입력
                    </button>
                  </div>
                </div>

                {imageMode === 'upload' ? (
                  /* 파일 업로드 드롭존 */
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => {
                      if (!imageUrl && !isCompilingImage) {
                        document.getElementById('file-upload-input')?.click()
                      }
                    }}
                    className={`relative rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer min-h-[140px] ${
                      isDragging
                        ? 'border-dinoclass-spark bg-dinoclass-spark/5 scale-[1.02] shadow-[0_0_15px_rgba(254,232,0,0.15)]'
                        : imageUrl
                        ? 'border-dinoclass-surface bg-zinc-900/40 hover:border-dinoclass-spark/30'
                        : 'border-dinoclass-surface bg-dinoclass-background/80 hover:border-dinoclass-spark/30'
                    }`}
                  >
                    <input
                      id="file-upload-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {isCompilingImage ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 rounded-full border-2 border-t-2 border-dinoclass-spark border-t-transparent animate-spin" />
                        <p className="text-xs text-dinoclass-textSub font-medium">이미지를 압축 가공 중입니다...</p>
                      </div>
                    ) : imageUrl ? (
                      /* 업로드 성공 미리보기 */
                      <div className="w-full relative flex items-center gap-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden border border-dinoclass-surface bg-zinc-950 flex-shrink-0">
                          <img
                            src={imageUrl}
                            alt="업로드 프리뷰"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-left flex-grow">
                          <p className="text-xs font-semibold text-white mb-0.5">업로드 완료</p>
                          <p className="text-[10px] text-dinoclass-textSub leading-relaxed">
                            로컬 이미지가 최적화 압축되어 대시보드 저장용 데이터로 로드되었습니다.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setImageUrl('')
                          }}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all border border-red-500/20"
                          title="이미지 삭제"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      /* 기본 대기 화면 */
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-xl bg-dinoclass-surface flex items-center justify-center mb-3 text-dinoclass-textSub">
                          <svg
                            className="w-5 h-5 text-dinoclass-textSub"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                        </div>
                        <p className="text-xs font-bold text-white mb-1">
                          여기에 이미지 파일을 드래그앤드롭 하세요
                        </p>
                        <p className="text-[10px] text-dinoclass-textSub">
                          또는 마우스로 클릭하여 내 컴퓨터에서 찾기
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* 웹 링크 URL 입력 폼 */
                  <div className="space-y-3">
                    <input
                      id="product-image-url"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="admin-input"
                    />
                    {imageUrl && (
                      <div className="relative rounded-xl overflow-hidden border border-dinoclass-surface h-32 bg-zinc-950 flex items-center justify-center">
                        <img
                          src={imageUrl}
                          alt="미리보기"
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-all"
                          title="이미지 삭제"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 상세 페이지 내용 */}
              <div>
                <label className="admin-label flex items-center gap-2 mb-2">
                  <AlignLeft size={14} className="text-dinoclass-spark" />
                  상세 페이지 내용
                </label>
                <textarea
                  id="product-detail-content"
                  placeholder="상세 페이지에 표시할 상품 소개, 목차, 특징 등을 자유롭게 입력하세요.&#10;&#10;줄바꿈으로 단락을 구분할 수 있습니다."
                  value={detailContent}
                  onChange={(e) => setDetailContent(e.target.value)}
                  rows={6}
                  className="admin-input resize-y min-h-[100px]"
                />
                <div className="flex justify-between mt-1.5">
                  <p className="text-[10px] text-dinoclass-textSub">고객이 '자세히 보기'를 클릭하면 볼 수 있는 상세 설명입니다.</p>
                  <span className="text-[10px] text-dinoclass-textSub font-mono">{detailContent.length}자</span>
                </div>
              </div>

              {/* 등록 버튼 */}
              <button
                id="submit-product"
                type="submit"
                className="w-full bg-dinoclass-spark text-black font-bold py-4 rounded-xl hover:bg-yellow-400 transition-all hover:shadow-[0_0_24px_rgba(254,232,0,0.25)] active:scale-[0.98] flex items-center justify-center gap-2 text-base"
              >
                <Plus size={18} />
                상품 등록하기
              </button>
            </form>
          </div>
        </motion.div>

        {/* ── 우측: DB 관리 테이블 ── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          <div className="admin-glass rounded-2xl border border-dinoclass-surface overflow-hidden">
            {/* 테이블 헤더 + 카테고리 필터 */}
            <div className="px-6 py-5 border-b border-dinoclass-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-dinoclass-spark/10 flex items-center justify-center">
                  <Database className="text-dinoclass-spark" size={18} />
                </div>
                <h2 className="font-bold text-white text-lg">상품 DB 관리</h2>
                <span className="text-dinoclass-textSub text-sm font-mono ml-1">
                  {filteredProducts.length}개
                </span>
              </div>
              {/* 카테고리 필터 탭 */}
              <div className="flex gap-1 bg-dinoclass-background/60 rounded-lg p-1">
                {(['all', ...CATEGORIES] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      filterCategory === cat
                        ? 'bg-dinoclass-spark text-black'
                        : 'text-dinoclass-textSub hover:text-white'
                    }`}
                  >
                    {cat === 'all' ? '전체' : CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <LayoutDashboard className="mx-auto mb-4 text-zinc-600" size={48} />
                  <p className="text-zinc-500 font-medium">등록된 상품이 없습니다</p>
                  <p className="text-zinc-600 text-sm mt-1">좌측 폼에서 첫 번째 상품을 등록해 보세요!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="admin-table w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left py-3 px-3 text-dinoclass-textSub font-semibold border-b border-dinoclass-surface">이미지</th>
                        <th className="text-left py-3 px-3 text-dinoclass-textSub font-semibold border-b border-dinoclass-surface">분류</th>
                        <th className="text-left py-3 px-3 text-dinoclass-textSub font-semibold border-b border-dinoclass-surface">상품명</th>
                        <th className="text-left py-3 px-3 text-dinoclass-textSub font-semibold border-b border-dinoclass-surface">가격</th>
                        <th className="text-left py-3 px-3 text-dinoclass-textSub font-semibold border-b border-dinoclass-surface">설명</th>
                        <th className="text-center py-3 px-3 text-dinoclass-textSub font-semibold border-b border-dinoclass-surface">관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr
                          key={product.id}
                          className="border-b border-dinoclass-surface/50 hover:bg-dinoclass-surface/30 transition-colors"
                        >
                          <td className="py-3 px-3">
                            <div className="w-11 h-11 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0">
                              {product.imageUrl ? (
                                <img src={product.imageUrl} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-600"><Image size={14} /></div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`admin-category-badge admin-category-badge--${product.category}`}>
                              {CATEGORY_LABELS[product.category]}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-medium text-white max-w-[140px] truncate">{product.name}</td>
                          <td className="py-3 px-3 font-mono text-dinoclass-spark whitespace-nowrap text-xs">{product.price}</td>
                          <td className="py-3 px-3 text-dinoclass-textSub max-w-[160px] truncate text-xs">{product.description || '—'}</td>
                          <td className="py-3 px-3">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => openEdit(product)}
                                className="p-2 rounded-lg text-zinc-500 hover:text-dinoclass-spark hover:bg-dinoclass-spark/10 transition-all"
                                title="상품 수정"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                title="상품 삭제"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ══════ 수정 모달 ══════ */}
      {editingProduct && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* 배경 오버레이 */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEditingProduct(null)} />
          {/* 모달 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-dinoclass-background border border-dinoclass-surface rounded-2xl shadow-2xl"
          >
            {/* 모달 헤더 */}
            <div className="sticky top-0 bg-dinoclass-background/95 backdrop-blur-md px-6 py-4 border-b border-dinoclass-surface flex items-center justify-between z-10">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Pencil size={16} className="text-dinoclass-spark" />
                상품 수정
              </h3>
              <button onClick={() => setEditingProduct(null)} className="p-1.5 rounded-lg hover:bg-dinoclass-surface text-dinoclass-textSub hover:text-white transition-all">
                <X size={18} />
              </button>
            </div>

            {/* 모달 본문 */}
            <div className="p-6 space-y-5">
              {/* 카테고리 */}
              <div>
                <label className="admin-label flex items-center gap-2 mb-2"><Tag size={14} className="text-dinoclass-spark" /> 상품 종류</label>
                <div className="relative">
                  <select value={editCategory} onChange={(e) => setEditCategory(e.target.value as ProductCategory)} className="admin-select">
                    {CATEGORIES.map((cat) => (<option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>))}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-dinoclass-textSub pointer-events-none" />
                </div>
              </div>
              {/* 상품명 */}
              <div>
                <label className="admin-label flex items-center gap-2 mb-2"><Package size={14} className="text-dinoclass-spark" /> 상품명 <span className="text-red-400">*</span></label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="admin-input" />
              </div>
              {/* 가격 */}
              <div>
                <label className="admin-label flex items-center gap-2 mb-2"><DollarSign size={14} className="text-dinoclass-spark" /> 가격 <span className="text-red-400">*</span></label>
                <input type="text" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="admin-input" />
              </div>
              {/* 한 줄 설명 */}
              <div>
                <label className="admin-label flex items-center gap-2 mb-2"><FileText size={14} className="text-dinoclass-spark" /> 한 줄 설명</label>
                <input type="text" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="admin-input" />
              </div>
              {/* 이미지 URL */}
              <div>
                <label className="admin-label flex items-center gap-2 mb-2"><Image size={14} className="text-dinoclass-spark" /> 이미지 URL</label>
                <input type="text" value={editImageUrl} onChange={(e) => setEditImageUrl(e.target.value)} className="admin-input" placeholder="https://... 또는 base64 데이터" />
                {editImageUrl && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-dinoclass-surface h-24 bg-zinc-900">
                    <img src={editImageUrl} alt="미리보기" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  </div>
                )}
              </div>
              {/* 상세 페이지 */}
              <div>
                <label className="admin-label flex items-center gap-2 mb-2"><AlignLeft size={14} className="text-dinoclass-spark" /> 상세 페이지 내용</label>
                <textarea value={editDetailContent} onChange={(e) => setEditDetailContent(e.target.value)} rows={6} className="admin-input resize-y min-h-[100px]" />
                <span className="text-[10px] text-dinoclass-textSub font-mono mt-1 block text-right">{editDetailContent.length}자</span>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="sticky bottom-0 bg-dinoclass-background/95 backdrop-blur-md px-6 py-4 border-t border-dinoclass-surface flex gap-3">
              <button onClick={() => setEditingProduct(null)} className="flex-1 py-3 rounded-xl border border-dinoclass-surface text-dinoclass-textSub font-bold hover:bg-dinoclass-surface/50 transition-all">취소</button>
              <button onClick={handleEditSave} className="flex-1 py-3 rounded-xl bg-dinoclass-spark text-black font-bold hover:bg-yellow-400 transition-all flex items-center justify-center gap-2"><Save size={16} /> 저장하기</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
