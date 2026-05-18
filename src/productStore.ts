// localStorage 기반 상품 데이터 관리 모듈 (카테고리 지원)

export type ProductCategory = 'ebook' | 'vod' | 'freebie';

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  ebook: '전자책',
  vod: 'VOD 강의',
  freebie: '무료배포자료',
};

export interface Product {
  id: string;
  category: ProductCategory;
  name: string;
  price: string;
  description: string;
  imageUrl: string;
  createdAt: string;
}

const STORAGE_KEY = 'dinoclass_products';

/** localStorage에서 모든 상품 목록을 불러옵니다 */
export function getProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Product[];
  } catch {
    return [];
  }
}

/** 특정 카테고리의 상품만 불러옵니다 */
export function getProductsByCategory(category: ProductCategory): Product[] {
  return getProducts().filter((p) => p.category === category);
}

/** 새 상품을 localStorage에 추가합니다 */
export function addProduct(
  product: Omit<Product, 'id' | 'createdAt'>
): Product {
  const products = getProducts();
  const newProduct: Product = {
    ...product,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  products.push(newProduct);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  return newProduct;
}

/** 특정 id의 상품을 localStorage에서 삭제합니다 */
export function deleteProduct(id: string): void {
  const products = getProducts().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}
