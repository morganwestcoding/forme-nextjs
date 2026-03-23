import { redirect } from 'next/navigation';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getShopById from '@/app/actions/getShopById';
import ShopFlow from '@/components/shop/ShopFlow';

interface IParams {
  shopsId: string;
}

export const dynamic = 'force-dynamic';

export default async function EditShopPage({ params }: { params: IParams }) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/');
  }

  const shop = await getShopById({ shopId: params.shopsId });

  if (!shop) {
    redirect('/shops');
  }

  // Check authorization: must be owner or admin/master
  const isOwner = shop.userId === currentUser.id;
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'master';

  if (!isOwner && !isAdmin) {
    redirect(`/shops/${params.shopsId}`);
  }

  return (
    <ShopFlow
      mode="edit"
      shopId={params.shopsId}
      initialData={shop as any}
    />
  );
}
