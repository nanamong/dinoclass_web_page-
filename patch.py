import os

def patch_product_store():
    path = "d:/dev/dinoclass_web_page/src/productStore.ts"
    
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Find the block export const STATIC_PRODUCTS: Product[] = [ ... ];
    start_idx = content.find("export const STATIC_PRODUCTS: Product[] = [")
    if start_idx == -1:
        start_idx = content.find("export const STATIC_PRODUCTS: Product[] = [];")
        if start_idx == -1:
            print("Could not find STATIC_PRODUCTS start")
            return
            
    end_idx = content.find("];", start_idx) + 2
    
    if end_idx < 2:
        print("Could not find STATIC_PRODUCTS end")
        return

    content = content[:start_idx] + "export const STATIC_PRODUCTS: Product[] = [];" + content[end_idx:]

    # Update getProducts
    get_products_old = """export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const dynamicProducts = (data || []).map(mapRowToProduct);
    return [...dynamicProducts, ...STATIC_PRODUCTS];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [...STATIC_PRODUCTS];
  }
}"""
    get_products_new = """export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const dynamicProducts = (data || []).map(mapRowToProduct);
    return [...dynamicProducts, ...STATIC_PRODUCTS];
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}"""
    content = content.replace(get_products_old, get_products_new)

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Patched productStore.ts")

def patch_homepage():
    path = "d:/dev/dinoclass_web_page/src/HomePage.tsx"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Remove defaultBooks array
    default_books_start = content.find("// 기본(하드코딩) 전자책 데이터")
    if default_books_start != -1:
        default_books_end = content.find("]\n", default_books_start) + 2
        content = content[:default_books_start] + content[default_books_end:]

    # Add dbError state
    content = content.replace("const [showNewsletterModal, setShowNewsletterModal] = useState(false);", 
                              "const [showNewsletterModal, setShowNewsletterModal] = useState(false);\n  const [dbError, setDbError] = useState(false);")

    # Update useEffect for getProducts
    old_useeffect = """  useEffect(() => {
    const load = async () => setDynamicProducts(await getProducts());
    load();
    intervalRef.current = setInterval(load, 2000); // 2초마다 폴링
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);"""
    
    new_useeffect = """  useEffect(() => {
    const load = async () => {
      try {
        const products = await getProducts();
        setDynamicProducts(products);
        setDbError(false);
      } catch (error) {
        setDbError(true);
      }
    };
    load();
    intervalRef.current = setInterval(load, 2000); // 2초마다 폴링
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);"""
    content = content.replace(old_useeffect, new_useeffect)

    # Update VOD section
    vod_old_start = content.find('<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">')
    vod_old_end = content.find('</SectionFadeIn>', vod_old_start)
    if vod_old_start != -1 and vod_old_end != -1:
        vod_new = """{dbError ? (
                <div className="text-center py-12 bg-dinoclass-surface/50 rounded-2xl border border-red-500/20 text-red-400">
                  <p>데이터베이스(Supabase)가 일시 정지(Pause) 상태이거나 연결에 실패했습니다.</p>
                  <p className="text-sm mt-2 opacity-80">무료 요금제의 경우 프로젝트 대시보드에 접속하여 다시 활성화해주세요.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {dynamicProducts.filter(p => p.category === 'vod').map((product) => (
                    <Link to={`/product/${product.id}`} key={product.id} className="hover-lift bg-dinoclass-surface rounded-2xl overflow-hidden cursor-pointer flex flex-col h-full border border-transparent hover:border-dinoclass-spark/50">
                      <div className="aspect-square bg-zinc-800 relative">
                        {product.imageUrl && (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                        <p className="text-dinoclass-textSub text-sm mb-6 flex-grow">{product.description}</p>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-xl font-bold font-mono">{product.price}</span>
                          <span className="text-dinoclass-spark text-sm font-bold">수강하기 &rarr;</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {dynamicProducts.filter(p => p.category === 'vod').length === 0 && !dbError && (
                    <div className="col-span-full text-center py-12 text-dinoclass-textSub">
                      등록된 VOD 강의가 없습니다.
                    </div>
                  )}
                </div>
              )}
            """
        content = content[:vod_old_start] + vod_new + content[vod_old_end:]

    # Update Ebook section
    ebook_old_start = content.find('<div className="grid grid-cols-1 md:grid-cols-3 gap-6">', vod_old_end)
    ebook_old_end = content.find('</SectionFadeIn>', ebook_old_start)
    if ebook_old_start != -1 and ebook_old_end != -1:
        ebook_new = """{dbError ? (
                <div className="text-center py-12 bg-dinoclass-surface/50 rounded-2xl border border-red-500/20 text-red-400">
                  <p>데이터베이스(Supabase)가 일시 정지(Pause) 상태이거나 연결에 실패했습니다.</p>
                  <p className="text-sm mt-2 opacity-80">무료 요금제의 경우 프로젝트 대시보드에 접속하여 다시 활성화해주세요.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {dynamicProducts.filter(p => p.category === 'ebook').map((product) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.35 }}
                        className="h-full"
                      >
                        <Link to={`/product/${product.id}`} className="hover-lift bg-dinoclass-background rounded-2xl overflow-hidden cursor-pointer flex flex-col h-full border border-dinoclass-surface hover:border-dinoclass-spark/50">
                          <div className="aspect-square bg-zinc-800/80 overflow-hidden relative">
                            {product.imageUrl && (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            )}
                          </div>
                          <div className="p-6 flex flex-col flex-grow">
                            <h3 className="font-bold text-lg mb-1 flex-grow">{product.name}</h3>
                            <p className="text-dinoclass-textSub text-sm mb-3 line-clamp-2">{product.description}</p>
                            <div className="flex items-center justify-between mt-auto">
                              <span className="text-lg font-bold font-mono">{product.price}</span>
                              <span className="text-dinoclass-spark text-sm font-bold">자세히 보기</span>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                    {dynamicProducts.filter(p => p.category === 'ebook').length === 0 && !dbError && (
                      <div className="col-span-full text-center py-12 text-dinoclass-textSub">
                        등록된 전자책이 없습니다.
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            """
        content = content[:ebook_old_start] + ebook_new + content[ebook_old_end:]

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Patched HomePage.tsx")

patch_homepage()
