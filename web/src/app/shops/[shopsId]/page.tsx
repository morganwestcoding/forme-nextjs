import type { Metadata } from 'next';
import getCurrentUser from "@/app/actions/getCurrentUser";
import getShopById from "@/app/actions/getShopById";
import ClientOnly from '@/components/ClientOnly';
import ShopClient from "./ShopClient";

export async function generateMetadata({ params }: { params: { shopsId?: string } }): Promise<Metadata> {
  const shop = await getShopById({ shopId: params.shopsId });
  if (!shop) return { title: 'Shop Not Found' };

  const description = shop.description
    ? shop.description.slice(0, 160)
    : `Shop at ${shop.name} on ForMe.`;

  return {
    title: shop.name,
    description,
    openGraph: {
      title: shop.name,
      description,
      ...(shop.coverImage ? { images: [{ url: shop.coverImage }] } : {}),
    },
  };
}

const ShopPage = async ({ params }: { params: { shopsId?: string } }) => {
  const currentUser = await getCurrentUser();

  return (
    <ClientOnly>
      <ShopClient
        shopId={params.shopsId}
        currentUser={currentUser}
      />
    </ClientOnly>
  );
};

export default ShopPage;
