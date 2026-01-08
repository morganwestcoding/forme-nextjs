'use client';

import Container from "@/components/Container";
import ShopHead from "@/components/shop/ShopHead";
import { SafeProduct, SafeShop, SafeUser, SafePost } from "@/app/types";

interface ShopClientProps {
  shop: SafeShop & {
    user: SafeUser;
    products: SafeProduct[];
    employees?: any[];
    storeHours?: any[];
  };
  currentUser?: SafeUser | null;
  posts?: SafePost[];
  categories?: any[];
}

const ShopClient: React.FC<ShopClientProps> = ({
  shop,
  currentUser,
  posts = [],
  categories = [],
}) => {
  return (
    <Container>
      <ShopHead
        key={`${shop.id}-${(shop as any).coverImage}-${((shop as any).galleryImages || []).join('|')}`}
        shop={shop}
        currentUser={currentUser}
        Products={shop.products}
        posts={posts}
        categories={categories}
      />
    </Container>
  );
};

export default ShopClient;
