'use client';

import Container from "@/components/Container";
import ShopHead from "@/components/shop/ShopHead";
import { SafeProduct, SafeShop, SafeUser } from "@/app/types";

interface ShopClientProps {
  shop: SafeShop & { user: SafeUser; products: SafeProduct[]; employees?: any[]; storeHours?: any[] };
  currentUser?: SafeUser | null;
  posts?: any[];       // if you pass reels
  categories?: any[];  // if you pass post categories
}

const ShopClient: React.FC<ShopClientProps> = ({
  shop,
  currentUser,
  posts = [],
  categories = [],
}) => {
  return (
    <Container>
      <div className="max-w-screen-lg">
        <div className="flex flex-col">
          <ShopHead
            shop={shop}
            currentUser={currentUser}
            Products={shop.products}
            posts={posts}
            categories={categories}
          />
        </div>
      </div>
    </Container>
  );
};

export default ShopClient;
