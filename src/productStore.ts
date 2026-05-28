import { supabase } from './lib/supabaseClient';

export type ProductCategory = 'ebook' | 'vod' | 'freebie';

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  ebook: '전자책',
  vod: 'VOD 강의',
  freebie: '무료배포자료',
};

export type DetailBlock = {
  id: string;
  type: 'text' | 'image';
  value: string;
  align?: 'left' | 'center' | 'right';
  size?: 'h1' | 'h2' | 'p';
  highlight?: 'yellow' | 'green';
};

export function parseDetailBlocks(content?: string): DetailBlock[] {
  if (!content) return [{ id: crypto.randomUUID(), type: 'text', value: '' }];
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].type) {
      return parsed;
    }
  } catch (e) {
    // Ignore JSON parse errors for plain text
  }
  return [{ id: crypto.randomUUID(), type: 'text', value: content }];
}

export interface Product {
  id: string;
  category: ProductCategory;
  name: string;
  price: string;
  description: string;
  detailContent?: string;
  imageUrl: string;
  createdAt: string;
}

export const STATIC_PRODUCTS: Product[] = [
  { id: 'static-vod-1', category: 'vod', name: '지식 창업 올인원 마스터 클래스 1기', price: '199,000원', description: '나만의 지식을 찾아 상품화하고, 자동 결제 시스템을 구축하는 A to Z', detailContent: '이 강의는 지식 창업의 기초부터 실전까지 모든 과정을 다룹니다.\n\n✅ 나만의 콘텐츠 주제를 찾는 법\n✅ 전자책·VOD 제작 워크플로우\n✅ 자동 결제 시스템 세팅\n✅ 마케팅 퍼널 설계\n\n총 12개 챕터, 48개 강의로 구성되어 있으며 평생 소장 가능합니다.', imageUrl: '', createdAt: new Date().toISOString() },
  { id: 'static-vod-2', category: 'vod', name: '지식 창업 올인원 마스터 클래스 2기', price: '199,000원', description: '나만의 지식을 찾아 상품화하고, 자동 결제 시스템을 구축하는 A to Z', detailContent: '2기에서는 실전 사례와 최신 트렌드를 반영한 업데이트된 커리큘럼을 제공합니다.\n\n✅ 최신 AI 도구 활용법\n✅ 실전 매출 사례 분석\n✅ 1:1 피드백 세션 포함\n\n총 15개 챕터로 구성되어 있습니다.', imageUrl: '', createdAt: new Date().toISOString() },
  { id: 'static-vod-3', category: 'vod', name: '지식 창업 올인원 마스터 클래스 3기', price: '199,000원', description: '나만의 지식을 찾아 상품화하고, 자동 결제 시스템을 구축하는 A to Z', detailContent: '3기는 고급 마케팅 전략과 스케일업에 초점을 맞춘 심화 과정입니다.\n\n✅ 메타 광고 최적화\n✅ 이메일 마케팅 자동화\n✅ 매출 극대화 전략', imageUrl: '', createdAt: new Date().toISOString() },
  { id: 'static-vod-4', category: 'vod', name: '지식 창업 올인원 마스터 클래스 4기', price: '199,000원', description: '나만의 지식을 찾아 상품화하고, 자동 결제 시스템을 구축하는 A to Z', detailContent: '4기는 커뮤니티 빌딩과 브랜드 확장에 초점을 맞춘 최신 과정입니다.\n\n✅ 팬덤 커뮤니티 구축\n✅ 멤버십 모델 설계\n✅ 브랜드 스토리텔링', imageUrl: '', createdAt: new Date().toISOString() },
  { id: 'static-ebook-1', category: 'ebook', name: '왕초보를 위한 패시브 인컴 기초 설계도', price: '29,000원', description: '수익 파이프라인의 기초를 탄탄하게 다져주는 입문 전자책', detailContent: '이 전자책은 패시브 인컴의 개념부터 실전 설계까지 왕초보 눈높이에서 설명합니다.\n\n📖 목차\n1장. 패시브 인컴이란 무엇인가\n2장. 나에게 맞는 수익 모델 찾기\n3장. 첫 번째 상품 기획하기\n4장. 자동화 시스템 기초 세팅\n5장. 첫 매출을 만드는 런칭 전략\n\n총 120페이지, PDF 형식으로 제공됩니다.', imageUrl: '', createdAt: new Date().toISOString() },
  { id: 'static-ebook-2', category: 'ebook', name: '안 팔리는 전자책을 베스트셀러로 만드는 카피라이팅', price: '39,000원', description: '구매 전환율을 극대화하는 카피라이팅 비법 전자책', detailContent: '왜 같은 내용인데도 어떤 전자책은 팔리고, 어떤 전자책은 안 팔릴까요?\n\n이 전자책에서는 구매 전환율을 높이는 카피라이팅의 모든 비밀을 공개합니다.\n\n📖 목차\n1장. 팔리는 제목의 공식\n2장. 상세 페이지 카피 구조\n3장. 감정을 자극하는 스토리텔링\n4장. CTA(Call To Action) 최적화\n5장. 실전 카피 템플릿 10종\n\n총 95페이지, PDF 형식으로 제공됩니다.', imageUrl: '', createdAt: new Date().toISOString() },
  { id: 'static-ebook-3', category: 'ebook', name: '하루 1시간, 월 100만 원 자동 수익 시스템 구축법', price: '49,000원', description: '하루 1시간 투자로 월 100만 원 수익을 만드는 실전 가이드', detailContent: '바쁜 직장인도 하루 1시간이면 충분합니다.\n\n이 전자책은 최소한의 시간 투자로 최대의 수익을 만드는 자동화 시스템 구축법을 알려드립니다.\n\n📖 목차\n1장. 시간 대비 수익 극대화 원칙\n2장. 자동화 도구 완벽 가이드\n3장. 콘텐츠 자동 배포 시스템\n4장. 결제 자동화 세팅\n5장. 월 100만 원 달성 로드맵\n\n총 140페이지, PDF 형식으로 제공됩니다.', imageUrl: '', createdAt: new Date().toISOString() },
];

function mapRowToProduct(row: any): Product {
  return {
    id: row.id,
    category: row.category as ProductCategory,
    name: row.title,
    price: row.price,
    description: row.description,
    detailContent: row.detail_content,
    imageUrl: row.image_url,
    createdAt: row.created_at,
  };
}

export async function getProducts(): Promise<Product[]> {
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
}

export async function getProductsByCategory(category: ProductCategory): Promise<Product[]> {
  const allProducts = await getProducts();
  return allProducts.filter((p) => p.category === category);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const staticProduct = STATIC_PRODUCTS.find((p) => p.id === id);
  if (staticProduct) return staticProduct;

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return undefined;
    return mapRowToProduct(data);
  } catch (error) {
    console.error('Error fetching product by id:', error);
    return undefined;
  }
}

export async function addProduct(
  product: Omit<Product, 'id' | 'createdAt'>
): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([{
        category: product.category,
        title: product.name,
        price: product.price,
        description: product.description,
        detail_content: product.detailContent,
        image_url: product.imageUrl
      }])
      .select()
      .single();

    if (error) throw error;
    return mapRowToProduct(data);
  } catch (error) {
    console.error('Error adding product:', error);
    return null;
  }
}

export async function updateProduct(
  id: string,
  updates: Partial<Omit<Product, 'id' | 'createdAt'>>
): Promise<Product | undefined> {
  try {
    const dbUpdates: any = {};
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.name !== undefined) dbUpdates.title = updates.name;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.detailContent !== undefined) dbUpdates.detail_content = updates.detailContent;
    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;

    const { data, error } = await supabase
      .from('products')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapRowToProduct(data);
  } catch (error) {
    console.error('Error updating product:', error);
    return undefined;
  }
}

export async function deleteProduct(id: string): Promise<void> {
  if (STATIC_PRODUCTS.some(p => p.id === id)) return;
  
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting product:', error);
  }
}
