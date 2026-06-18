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
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
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
