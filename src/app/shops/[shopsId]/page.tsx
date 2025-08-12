import getCurrentUser from "@/app/actions/getCurrentUser";
import getShopById from "@/app/actions/getShopById";
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

  return <ShopClient shop={shop as any} currentUser={currentUser} />;
};

export default ShopPage;
