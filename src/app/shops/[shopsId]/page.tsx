import getCurrentUser from '@/app/actions/getCurrentUser';
import getShopById from '@/app/actions/getProfileById';
import getShopProducts from '@/app/actions/getShopProducts';
import ClientProviders from '@/components/ClientProviders';
import EmptyState from '@/components/EmptyState';


interface IParams {
  shopId?: string;
}

export const dynamic = 'force-dynamic';

const ShopDetailPage = async ({ params }: { params: IParams }) => {
  const shop = await getShopById(params);
  const products = await getShopProducts(params);
  const currentUser = await getCurrentUser();

  if (!shop) {
    return (
      <ClientProviders>
        <EmptyState />
      </ClientProviders>
    );
  }

  return (
    <ClientProviders>
      <></>

    </ClientProviders>
  );
}
 
export default ShopDetailPage;