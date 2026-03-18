import getCurrentUser from "@/app/actions/getCurrentUser";
import getShopById from "@/app/actions/getShopById";
import getShops from "@/app/actions/getShops";
import EmptyState from "@/components/EmptyState";
import ShopClient from "./ShopClient";

const ShopPage = async ({ params }: { params: { shopsId?: string } }) => {
  const shop = await getShopById({ shopId: params.shopsId }); // <-- map to shopId
  const currentUser = await getCurrentUser();

  if (!shop) {
    return (
      <EmptyState
        title="Shop not found"
        subtitle="This shop does not exist or was removed."
      />
    );
  }

  // Fetch related shops (same category, excluding current shop)
  const relatedShops = await getShops({
    category: (shop as any).category || undefined,
    limit: 10,
  }).then((shops) => shops.filter((s) => s.id !== shop.id));

  return <ShopClient shop={shop as any} currentUser={currentUser} relatedShops={relatedShops} />;
};

export default ShopPage;
