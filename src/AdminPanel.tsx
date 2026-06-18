import { useState, useEffect, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Trash2, Image, DollarSign, FileText, Package,
  ShieldCheck, LayoutDashboard, Database, Tag, ChevronDown, AlignLeft, Pencil, X, Save, ShoppingBag
} from 'lucide-react'
import {
  getProducts, addProduct, deleteProduct, updateProduct,
  CATEGORY_LABELS,
  type Product, type ProductCategory, type DetailBlock, parseDetailBlocks
} from './productStore'
import { getOrders, updateOrderStatus, deleteOrder, type Order, type OrderStatus } from './orderStore'
import { getSubscribers, deleteSubscriber, type Subscriber } from './newsletterStore'
import { compressImage } from './utils/imageCompressor'
import DetailBlockEditor from './components/DetailBlockEditor'

const CATEGORIES: ProductCategory[] = ['ebook', 'vod', 'freebie']

export default function AdminPanel() {
  /* ─── state ─── */
  const [products, setProducts] = useState<Product[]>([])
  const [category, setCategory] = useState<ProductCategory>('ebook')
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  /* ─── 에디터 state ─── */
  const [detailBlocks, setDetailBlocks] = useState<DetailBlock[]>([{ id: crypto.randomUUID(), type: 'text', value: '' }])
  const [imageUrl, setImageUrl] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<ProductCategory | 'all'>('all')

  /* ─── 이미지 업로드 인터페이스 추가 state ─── */
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload')
  const [isDragging, setIsDragging] = useState(false)
  const [isCompilingImage, setIsCompilingImage] = useState(false)

  /* ── 수정 모달 state ── */
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editDetailBlocks, setEditDetailBlocks] = useState<DetailBlock[]>([])
  const [editImageUrl, setEditImageUrl] = useState('')
  const [editVideoUrl, setEditVideoUrl] = useState('')
  const [editCategory, setEditCategory] = useState<ProductCategory>('ebook')

  /* ── 구글 시트 연동 state ── */
  const [showWebhookModal, setShowWebhookModal] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState('')

  /* ── 탭 상태 ── */
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'newsletters'>('products')
  const [newsletters, setNewsletters] = useState<Subscriber[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  /* ── 초기 데이터 로드 ── */
  const reload = async () => {
    setProducts(await getProducts())
  }
  
  const reloadOrders = () => {
    setOrders(getOrders())
  }
  
  const reloadNewsletters = async () => {
    setNewsletters(await getSubscribers())
  }

  useEffect(() => {
    reload()
    reloadOrders()
    reloadNewsletters()
    
    const savedUrl = localStorage.getItem('google_sheet_webhook_url')
    if (savedUrl) setWebhookUrl(savedUrl)
  }, [])

  const handleSaveWebhook = () => {
    localStorage.setItem('google_sheet_webhook_url', webhookUrl.trim())
    setShowWebhookModal(false)
    showToast('✅ 구글 시트 연동 URL이 저장되었습니다!')
  }

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
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !price.trim()) {
      showToast('⚠️ 상품명과 가격은 필수 입력입니다.')
      return
    }
    await addProduct({
      category,
      name: name.trim(),
      price: price.trim(),
      description: description.trim(),
      detailContent: JSON.stringify(detailBlocks),
      imageUrl: imageUrl.trim(),
      videoUrl: videoUrl.trim(),
    })
    setName(''); setPrice(''); setDescription(''); setVideoUrl(''); setDetailBlocks([{ id: crypto.randomUUID(), type: 'text', value: '' }]); setImageUrl('')
    await reload()
    showToast(`✅ [${CATEGORY_LABELS[category]}] 상품이 등록되었습니다!`)
  }

  const handleDelete = async (id: string) => {
    await deleteProduct(id)
    await reload()
    showToast('🗑️ 상품이 삭제되었습니다.')
  }

  const openEdit = (product: Product) => {
    setEditingProduct(product)
    setEditName(product.name)
    setEditPrice(product.price)
    setEditDescription(product.description)
    setEditDetailBlocks(parseDetailBlocks(product.detailContent))
    setEditImageUrl(product.imageUrl)
    setEditVideoUrl(product.videoUrl || '')
    setEditCategory(product.category)
  }

  const handleEditSave = async () => {
    if (!editingProduct) return
    if (!editName.trim() || !editPrice.trim()) {
      showToast('⚠️ 상품명과 가격은 필수 입력입니다.')
      return
    }
    await updateProduct(editingProduct.id, {
      category: editCategory,
      name: editName.trim(),
      price: editPrice.trim(),
      description: editDescription.trim(),
      detailContent: JSON.stringify(editDetailBlocks),
      imageUrl: editImageUrl.trim(),
      videoUrl: editVideoUrl.trim(),
    })
    setEditingProduct(null)
    await reload()
    showToast('✅ 상품이 수정되었습니다!')
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const handleOrderDelete = (id: string) => {
    if (confirm('주문 내역을 삭제하시겠습니까?')) {
      deleteOrder(id)
      reloadOrders()
      showToast('🗑️ 주문 내역이 삭제되었습니다.')
    }
  }

  const handleOrderStatus = (id: string, currentStatus: OrderStatus) => {
    const newStatus = currentStatus === 'SUCCESS' ? 'REFUNDED' : 'SUCCESS'
    updateOrderStatus(id, newStatus)
    reloadOrders()
    showToast(`🔄 상태가 [${newStatus === 'SUCCESS' ? '결제완료' : '환불/취소'}]로 변경되었습니다.`)
  }

  const filteredProducts = filterCategory === 'all'
    ? products
    : products.filter((p) => p.category === filterCategory)

  /* ─── render ─── */
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="admin-glass rounded-2xl p-8 mb-10 border border-dinoclass-spark/20"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-dinoclass-spark/10 flex items-center justify-center">
            <ShieldCheck className="text-dinoclass-spark" size={24} />
          </div>
          <div className="flex-grow">
            <h1 className="text-2xl font-bold text-white">통합 관리자 대시보드</h1>
            <p className="text-dinoclass-textSub text-sm">
              상품 관리부터 결제 내역, 고객 및 구독자 DB까지 한 곳에서 효율적으로 관리하세요.
            </p>
          </div>
          <button 
            onClick={() => setShowWebhookModal(true)}
            className="hidden md:flex items-center gap-2 bg-green-500/10 text-green-400 border border-green-500/30 px-5 py-2.5 rounded-xl font-bold hover:bg-green-500/20 transition-all text-sm"
          >
            📊 구글 시트 연동하기
          </button>
        </div>
      </motion.div>

      <div className="flex gap-4 mb-8 border-b border-dinoclass-surface pb-4">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-6 py-3 rounded-xl font-bold transition-all border ${
            activeTab === 'products' ? 'bg-dinoclass-spark text-black border-dinoclass-spark' : 'text-dinoclass-textSub border-dinoclass-surface hover:bg-dinoclass-surface/50 hover:border-dinoclass-spark/50 hover:text-white'
          }`}
        >
          📦 상품 DB 관리
        </button>
        <button
          onClick={() => { setActiveTab('orders'); reloadOrders(); }}
          className={`px-6 py-3 rounded-xl font-bold transition-all border ${
            activeTab === 'orders' ? 'bg-dinoclass-spark text-black border-dinoclass-spark' : 'text-dinoclass-textSub border-dinoclass-surface hover:bg-dinoclass-surface/50 hover:border-dinoclass-spark/50 hover:text-white'
          }`}
        >
          💳 결제 내역 관리
        </button>
        <button
          onClick={() => { setActiveTab('newsletters'); reloadNewsletters(); }}
          className={`px-6 py-3 rounded-xl font-bold transition-all border ${
            activeTab === 'newsletters' ? 'bg-dinoclass-spark text-black border-dinoclass-spark' : 'text-dinoclass-textSub border-dinoclass-surface hover:bg-dinoclass-surface/50 hover:border-dinoclass-spark/50 hover:text-white'
          }`}
        >
          📧 뉴스레터 구독자 관리
        </button>
      </div>

      {activeTab === 'products' ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
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

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="admin-label flex items-center gap-2">
                    <Image size={14} className="text-dinoclass-spark" />
                    상품 이미지
                  </label>
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

              {(category === 'vod' || category === 'freebie') && (
                <div>
                  <label htmlFor="product-video-url" className="admin-label flex items-center gap-2 mb-1.5">
                    <span className="text-dinoclass-spark">▶</span> Vimeo 동영상 링크 (선택)
                  </label>
                  <input
                    id="product-video-url"
                    type="url"
                    placeholder="https://player.vimeo.com/video/..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="admin-input"
                  />
                  <p className="text-[10px] text-dinoclass-textSub mt-1.5 ml-1">강의를 시청할 때 보여줄 Vimeo Embed URL을 입력하세요.</p>
                </div>
              )}

              <div>
                <label className="admin-label flex items-center gap-2 mb-3">
                  <AlignLeft size={14} className="text-dinoclass-spark" />
                  상세 페이지 내용
                </label>
                <div className="bg-dinoclass-surface/20 border border-dinoclass-surface rounded-xl p-4">
                  <DetailBlockEditor blocks={detailBlocks} onChange={setDetailBlocks} onShowToast={showToast} />
                </div>
                <div className="flex justify-between mt-1.5">
                  <p className="text-[10px] text-dinoclass-textSub">텍스트와 이미지를 자유롭게 추가하여 프리미엄 상세페이지를 구성하세요.</p>
                </div>
              </div>

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

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          <div className="admin-glass rounded-2xl border border-dinoclass-surface overflow-hidden">
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
      ) : activeTab === 'orders' ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="admin-glass rounded-2xl border border-dinoclass-surface overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-dinoclass-surface flex items-center justify-between">
            <h2 className="font-bold text-white text-lg flex items-center gap-2">
              <Database className="text-dinoclass-spark" size={20} />
              주문 내역 DB
            </h2>
            <span className="text-sm font-mono text-dinoclass-textSub">총 {orders.length}건</span>
          </div>
          {orders.length === 0 ? (
            <div className="p-16 text-center text-dinoclass-textSub">
              <Database size={48} className="mx-auto mb-4 opacity-20" />
              <p>아직 결제 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-dinoclass-surface/30 text-dinoclass-textSub border-b border-dinoclass-surface">
                  <tr>
                    <th className="px-6 py-4 font-medium whitespace-nowrap">결제일시</th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap">주문번호</th>
                    <th className="px-6 py-4 font-medium min-w-[200px]">주문명</th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap text-right">결제금액</th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap text-center">상태</th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap text-center">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dinoclass-surface">
                  {orders.slice().reverse().map((order) => (
                    <tr key={order.id} className="hover:bg-dinoclass-surface/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-dinoclass-textSub">
                        {new Date(order.createdAt).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-zinc-500 whitespace-nowrap">{order.id}</td>
                      <td className="px-6 py-4 text-white font-medium">{order.orderName}</td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-dinoclass-spark whitespace-nowrap">
                        {order.amount.toLocaleString()}원
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleOrderStatus(order.id, order.status)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                            order.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                          }`}
                        >
                          {order.status === 'SUCCESS' ? '결제완료' : '환불/취소'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <button onClick={() => handleOrderDelete(order.id)} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="내역 삭제">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="admin-glass rounded-2xl border border-dinoclass-surface overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-dinoclass-surface flex items-center justify-between">
            <h2 className="font-bold text-white text-lg flex items-center gap-2">
              <Database className="text-dinoclass-spark" size={20} />
              뉴스레터 구독자 DB
            </h2>
            <span className="text-sm font-mono text-dinoclass-textSub">총 {newsletters.length}명</span>
          </div>
          {newsletters.length === 0 ? (
            <div className="p-16 text-center text-dinoclass-textSub">
              <Database size={48} className="mx-auto mb-4 opacity-20" />
              <p>아직 뉴스레터 구독자가 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-dinoclass-surface/30 text-dinoclass-textSub border-b border-dinoclass-surface">
                  <tr>
                    <th className="px-6 py-4 font-medium whitespace-nowrap">신청일시</th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap">이름</th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap">전화번호</th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap">이메일</th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap text-center">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dinoclass-surface">
                  {newsletters.slice().reverse().map((sub) => (
                    <tr key={sub.id} className="hover:bg-dinoclass-surface/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-dinoclass-textSub">
                        {new Date(sub.createdAt).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 text-white font-medium whitespace-nowrap">{sub.name}</td>
                      <td className="px-6 py-4 text-white font-medium whitespace-nowrap">{sub.phone}</td>
                      <td className="px-6 py-4 font-mono text-dinoclass-spark whitespace-nowrap">{sub.email}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <button onClick={async () => {
                          if (confirm('이 구독자를 삭제하시겠습니까?')) {
                            await deleteSubscriber(sub.id)
                            await reloadNewsletters()
                            showToast('🗑️ 구독자가 삭제되었습니다.')
                          }
                        }} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="내역 삭제">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* ══════ 수정 모달 ══════ */}
      {editingProduct && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEditingProduct(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-dinoclass-background border border-dinoclass-surface rounded-2xl shadow-2xl"
          >
            <div className="sticky top-0 bg-dinoclass-background/95 backdrop-blur-md px-6 py-4 border-b border-dinoclass-surface flex items-center justify-between z-10">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Pencil size={16} className="text-dinoclass-spark" />
                상품 수정
              </h3>
              <button onClick={() => setEditingProduct(null)} className="p-1.5 rounded-lg hover:bg-dinoclass-surface text-dinoclass-textSub hover:text-white transition-all">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="admin-label flex items-center gap-2 mb-2"><Tag size={14} className="text-dinoclass-spark" /> 상품 종류</label>
                <div className="relative">
                  <select value={editCategory} onChange={(e) => setEditCategory(e.target.value as ProductCategory)} className="admin-select">
                    {CATEGORIES.map((cat) => (<option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>))}
                  </select>
                </div>
              </div>
              <div>
                <label className="admin-label flex items-center gap-2 mb-2"><Package size={14} className="text-dinoclass-spark" /> 상품명</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="admin-input" />
              </div>
              <div>
                <label className="admin-label flex items-center gap-2 mb-2"><DollarSign size={14} className="text-dinoclass-spark" /> 가격</label>
                <input type="text" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="admin-input" />
              </div>
              <div>
                <label className="admin-label flex items-center gap-2 mb-2"><FileText size={14} className="text-dinoclass-spark" /> 한 줄 설명</label>
                <input type="text" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="admin-input" />
              </div>
              <div>
                <label className="admin-label flex items-center gap-2 mb-2"><Image size={14} className="text-dinoclass-spark" /> 이미지 URL</label>
                <input type="text" value={editImageUrl} onChange={(e) => setEditImageUrl(e.target.value)} className="admin-input" />
              </div>
              <div>
                <label className="admin-label flex items-center gap-2 mb-3"><AlignLeft size={14} className="text-dinoclass-spark" /> 상세 페이지 내용</label>
                <DetailBlockEditor blocks={editDetailBlocks} onChange={setEditDetailBlocks} onShowToast={showToast} />
              </div>
            </div>

            <div className="sticky bottom-0 bg-dinoclass-background/95 backdrop-blur-md px-6 py-4 border-t border-dinoclass-surface flex gap-3 z-20">
              <button onClick={() => setEditingProduct(null)} className="flex-1 py-3 rounded-xl border border-dinoclass-surface text-dinoclass-textSub font-bold hover:bg-dinoclass-surface/50 transition-all">취소</button>
              <button onClick={handleEditSave} className="flex-1 py-3 rounded-xl bg-dinoclass-spark text-black font-bold hover:bg-yellow-400 transition-all flex items-center justify-center gap-2"><Save size={16} /> 저장하기</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ══════ 구글 시트 연동 모달 ══════ */}
      {showWebhookModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowWebhookModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md bg-dinoclass-background border border-dinoclass-surface rounded-2xl shadow-2xl p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                📊 구글 시트 웹훅 연동
              </h3>
              <button onClick={() => setShowWebhookModal(false)} className="text-dinoclass-textSub hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <p className="text-dinoclass-textSub text-sm mb-4 leading-relaxed">
              발급받으신 <b>Apps Script Webhook URL</b>을 아래에 입력해 주세요. 
              설정이 완료되면 고객이 뉴스레터를 구독할 때마다 즉시 구글 스프레드시트에 실시간으로 기록됩니다.
            </p>
            
            <input 
              type="text" 
              placeholder="https://script.google.com/macros/s/.../exec"
              value={webhookUrl}
              onChange={e => setWebhookUrl(e.target.value)}
              className="w-full bg-dinoclass-surface border border-dinoclass-surface rounded-xl px-4 py-3 mb-6 focus:outline-none focus:border-dinoclass-spark transition-colors text-white text-sm"
            />
            
            <button 
              onClick={handleSaveWebhook}
              className="w-full bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 transition-all"
            >
              연동 저장하기
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}
