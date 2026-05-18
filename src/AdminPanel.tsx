import { useState, useEffect, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Trash2, Image, DollarSign, FileText, Package,
  ShieldCheck, LayoutDashboard, Database, Tag, ChevronDown
} from 'lucide-react'
import {
  getProducts, addProduct, deleteProduct,
  CATEGORY_LABELS,
  type Product, type ProductCategory
} from './productStore'

const CATEGORIES: ProductCategory[] = ['ebook', 'vod', 'freebie']

export default function AdminPanel() {
  /* ─── state ─── */
  const [products, setProducts] = useState<Product[]>([])
  const [category, setCategory] = useState<ProductCategory>('ebook')
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<ProductCategory | 'all'>('all')

  const reload = () => setProducts(getProducts())
  useEffect(reload, [])

  /* ─── handlers ─── */
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
      imageUrl: imageUrl.trim(),
    })
    setName(''); setPrice(''); setDescription(''); setImageUrl('')
    reload()
    showToast(`✅ [${CATEGORY_LABELS[category]}] 상품이 등록되었습니다!`)
  }

  const handleDelete = (id: string) => {
    if (!window.confirm('정말 이 상품을 삭제하시겠습니까?')) return
    deleteProduct(id)
    reload()
    showToast('🗑️ 상품이 삭제되었습니다.')
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

              {/* 이미지 URL */}
              <div>
                <label className="admin-label flex items-center gap-2 mb-2">
                  <Image size={14} className="text-dinoclass-spark" />
                  상품 이미지 URL
                </label>
                <input
                  id="product-image-url"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="admin-input"
                />
                {imageUrl && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-dinoclass-surface h-32 bg-zinc-900">
                    <img
                      src={imageUrl}
                      alt="미리보기"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                )}
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
                        <th className="text-center py-3 px-3 text-dinoclass-textSub font-semibold border-b border-dinoclass-surface">삭제</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {filteredProducts.map((product) => (
                          <motion.tr
                            key={product.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -40 }}
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
                            <td className="py-3 px-3 text-center">
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                title="상품 삭제"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
