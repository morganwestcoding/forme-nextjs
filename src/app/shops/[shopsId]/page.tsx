import ShopClient from './ShopClient';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getShopById from '@/app/actions/getShopById';
import getShopProducts from '@/app/actions/getShopProducts';
import ClientProviders from '@/components/ClientProviders';
import EmptyState from '@/components/EmptyState';

interface IParams {
  shopId?: string;
}

export const dynamic = 'force-dynamic';

const ShopDetailPage = async ({ params }: { params: IParams }) => {
  const currentUser = await getCurrentUser();

  try {
    // Fetch data in parallel
    const [shop, products] = await Promise.all([
      getShopById(params),
      getShopProducts(params)
    ]);

    if (!shop) {
      return (
        <ClientProviders>
          <EmptyState />
        </ClientProviders>
      );
    }

    return (
      <ClientProviders>
        <ShopClient
          shop={shop}
          products={products || []}
          currentUser={currentUser}
          posts={[]} // Add shop posts here if available
          categories={[]} // Add categories if needed for posts
        />
      </ClientProviders>
    );
  } catch (error) {
    console.error("Error fetching shop data:", error);
    return (
      <ClientProviders>
        <EmptyState />
      </ClientProviders>
    );
  }
}
 
export default ShopDetailPage;