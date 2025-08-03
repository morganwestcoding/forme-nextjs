'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

import { SafeShop, SafeProduct, SafeUser, SafePost } from "@/app/types";

import Container from "@/components/Container";
import ShopHead from "@/components/shop/ShopHead";

export interface SelectedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface ShopClientProps {
  shop: SafeShop & {
    user: SafeUser;
  };
  products: SafeProduct[];
  currentUser?: SafeUser | null;
  posts?: SafePost[]; // For shop's social posts
  categories?: any[]; // For post categories
}

const ShopClient: React.FC<ShopClientProps> = ({
  shop,
  products,
  currentUser,
  posts = [],
  categories = []
}) => {
  const router = useRouter();
  
  // State for product interactions
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<SelectedProduct | null>(null);
  const [cartItems, setCartItems] = useState<SelectedProduct[]>([]);
  
  // Handle shop following
  const [isFollowing, setIsFollowing] = useState(
    currentUser ? shop.followers?.includes(currentUser.id) : false
  );

  // Check if current user owns this shop
  const isOwner = useMemo(() => {
    if (!currentUser || !shop?.user) {
      return false;
    }
    return currentUser.id === shop.user.id;
  }, [currentUser, shop.user]);

  // Handle location string
  const locationString = useMemo(() => {
    return shop.location || 'Online Shop';
  }, [shop.location]);

  // Handle product selection
  const onProductSelect = useCallback((product: SafeProduct) => {
    const selectedProd: SelectedProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.mainImage
    };
    
    setSelectedProduct(selectedProd);
    // Add to cart logic
    setCartItems(prev => [...prev, selectedProd]);
    toast.success(`${product.name} added to cart!`);
  }, []);

  // Handle shop follow/unfollow
  const onFollowToggle = useCallback(async () => {
    if (!currentUser) {
      toast.error('You must be logged in to follow shops');
      return;
    }

    try {
      const endpoint = `/api/shops/${shop.id}/follow`;
      const method = isFollowing ? 'delete' : 'post';
      
      await axios[method](endpoint);
      
      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? 'Shop unfollowed' : 'Shop followed');
      router.refresh();
    } catch (error) {
      toast.error('Something went wrong');
    }
  }, [currentUser, shop.id, isFollowing, router]);

  // Handle contact/message shop
  const onContactShop = useCallback(() => {
    if (!currentUser) {
      toast.error('You must be logged in to contact shops');
      return;
    }
    
    // Navigate to messages or open contact modal
    router.push(`/conversations/${shop.user.id}`);
  }, [currentUser, router, shop.user.id]);

  return (
    <Container>
      <div className="max-w-screen-lg">
        <div className="flex flex-col">
          <ShopHead
            shop={shop}
            currentUser={currentUser}
            products={products}
            posts={posts}
            categories={categories}
            isFollowing={isFollowing}
            onFollowToggle={onFollowToggle}
            onContactShop={onContactShop}
            onProductSelect={onProductSelect}
            cartItemCount={cartItems.length}
          />
        </div>
      </div>
      
      {/* Cart Modal or other modals can be added here */}
      {isCartModalOpen && selectedProduct && (
        <div>
          {/* Cart Modal Component */}
        </div>
      )}
    </Container>
  );
}
 
export default ShopClient;