import { supabase } from './lib/supabaseClient';

export type ProductCategory = 'ebook' | 'vod' | 'freebie' | 'free_course';

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  ebook: '전자책',
  vod: 'VOD 강의',
  freebie: '웰컴선물키트',
  free_course: '무료 강의',
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
  videoUrl?: string;
  createdAt: string;
  lifetimePrice?: string;
}

function mapRowToProduct(row: any): Product {
  let price = row.price;
  let lifetimePrice: string | undefined = undefined;

  if (typeof price === 'string' && price.includes('|')) {
    const parts = price.split('|');
    price = parts[0];
    if (parts.length > 1) {
      lifetimePrice = parts[1];
    }
  }

  return {
    id: row.id,
    category: row.category as ProductCategory,
    name: row.name,
    price: price,
    description: row.description,
    detailContent: row.detail_content,
    imageUrl: row.image_url,
    createdAt: row.created_at,
    lifetimePrice,
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
    return dynamicProducts;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

export async function getProductsByCategory(category: ProductCategory): Promise<Product[]> {
  const allProducts = await getProducts();
  return allProducts.filter((p) => p.category === category);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  // 더미 상품(static) 클릭 시 가상의 상품 데이터를 반환하여 오류 화면 방지
  if (id.startsWith('static-')) {
    const isVod = id.includes('vod');
    const isEbook = id.includes('ebook');
    const numMatch = id.match(/\d+/);
    const num = numMatch ? numMatch[0] : '1';
    
    return {
      id,
      category: isVod ? 'vod' : isEbook ? 'ebook' : 'free_course',
      name: isVod ? `지식 창업 올인원 마스터 클래스 ${num}기` : isEbook ? '전자책 및 템플릿 샘플' : '[무료] 디노클래스 맛보기 특강',
      price: isVod ? '199,000원' : isEbook ? '29,000원' : '0원',
      description: '본 상품은 예시로 제공되는 더미 상품입니다. 관리자 페이지에서 실제 상품을 등록하시면 이 더미 상품들은 자동으로 사라집니다.',
      detailContent: JSON.stringify([
        { id: '1', type: 'text', size: 'h2', align: 'center', value: '이곳은 예시용 상세 페이지입니다.' },
        { id: '2', type: 'text', size: 'p', align: 'center', value: '관리자 페이지에 접속하여 대표님만의 찐 상품을 직접 등록해 보세요! 상품을 등록하는 즉시 메인 화면에 예쁘게 노출됩니다.' }
      ]),
      imageUrl: isVod ? `/vod_dummy_${num}.png` : isEbook ? `/ebook_dummy_${num}.png` : `/free_dummy_${num}.png`,
      videoUrl: isVod || !isEbook ? 'https://player.vimeo.com/video/100000000' : undefined, // 예시용 Vimeo 링크
      createdAt: new Date().toISOString()
    };
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return undefined; // Data not found
      }
      throw error;
    }
    if (!data) return undefined;
    return mapRowToProduct(data);
  } catch (error) {
    console.error('Error fetching product by id:', error);
    throw error;
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
        name: product.name,
        price: product.lifetimePrice ? `${product.price}|${product.lifetimePrice}` : product.price,
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
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.price !== undefined || updates.lifetimePrice !== undefined) {
      const priceVal = updates.price !== undefined ? updates.price : '';
      dbUpdates.price = updates.lifetimePrice ? `${priceVal}|${updates.lifetimePrice}` : priceVal;
    }
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
