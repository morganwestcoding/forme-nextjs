// app/shop/page.tsx
import ShopClient from '@/app/shops/ShopClient';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getShops from '@/app/actions/getShops';
import getProducts from '@/app/actions/getProducts';
import getProductCategories from '@/app/actions/getProductCategories';
import { SafeShop, SafeProduct, SafeProductCategory } from '@/app/types';

interface ShopPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export const metadata = {
  title: 'Shop - Forme',
  description: 'Discover unique products from our vendors',
};

async function ShopPage({ searchParams }: ShopPageProps) {
  const currentUser = await getCurrentUser();
  
  // Convert search params to the proper types
  const shopParams = {
    hasProducts: true,
    limit: 6,
    sort: 'popular' as const
  };
  
  const productParams = {
    featured: true,
    limit: 8,
    sort: 'newest' as const
  };

  try {
    // Fetch data in parallel
    const [shops, featuredProducts, categories] = await Promise.all([
      getShops(shopParams),
      getProducts(productParams),
      getProductCategories()
    ]);

    // Use type assertion to tell TypeScript that you know the data matches your types
    // This is a simpler solution but requires you to be certain the data structure is compatible
    return (
      <ShopClient 
        initialShops={shops as unknown as SafeShop[]}
        featuredProducts={featuredProducts as unknown as SafeProduct[]}
        categories={categories}
        currentUser={currentUser}
      />
    );
  } catch (error) {
    console.error("Error fetching shop data:", error);
    // Return empty arrays if there's an error
    return (
      <ShopClient 
        initialShops={[]}
        featuredProducts={[]}
        categories={[]}
        currentUser={currentUser}
      />
    );
  }
}

export default ShopPage;