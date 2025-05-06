import ShopClient from '@/app/shops/ShopClient';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getShops from '@/app/actions/getShops';
import getProducts from '@/app/actions/getProducts';
import getProductCategories from '@/app/actions/getProductCategories';
import { SafeShop, SafeProduct, SafeProductCategory } from '@/app/types';
import Container from '@/components/Container';


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

    return (
<Container>
        <ShopClient 
          initialShops={shops as unknown as SafeShop[]}
          featuredProducts={featuredProducts as unknown as SafeProduct[]}
          categories={categories}
          currentUser={currentUser}
        />
</Container>
    );
  } catch (error) {
    console.error("Error fetching shop data:", error);
    // Return with empty arrays if there's an error
    return (
<Container>
        <ShopClient 
          initialShops={[]}
          featuredProducts={[]}
          categories={[]}
          currentUser={currentUser}
        />
        </Container>

    );
  }
}

export default ShopPage;