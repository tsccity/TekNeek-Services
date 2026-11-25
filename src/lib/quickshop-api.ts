const projectUrl = 'https://hkungdyendvlpuveaepb.supabase.co';
const publishableKey = 'sb_publishable_uvA0jPNYWxDeN4UZ320ukA_r3n8pdWj';

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  brand: string | null;
  price_cents: number;
  image_url: string | null;
  product_variants: { id: string; size: string; color: string; stock_quantity: number | null }[];
}

export async function loadCatalog(): Promise<Product[]> {
  const url = new URL('/rest/v1/products', projectUrl);
  url.searchParams.set('select', 'id,slug,name,description,brand,price_cents,image_url,product_variants(id,size,color,stock_quantity)');
  url.searchParams.set('active', 'eq.true');
  const response = await fetch(url, { headers: { apikey: publishableKey, Accept: 'application/json' }, cache: 'no-store' });
  if (!response.ok) throw new Error('Catalog unavailable (' + response.status + ')');
  return await response.json() as Product[];
}
