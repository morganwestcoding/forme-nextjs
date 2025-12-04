// components/shop/ProductCard.tsx
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import axios from 'axios';
import { SafeProduct, SafeUser } from '@/app/types';
import SmartBadgeProduct from './SmartBadgeProduct';
import HeartButton from '../HeartButton';

interface ProductCardProps {
  data: SafeProduct;
  currentUser?: SafeUser | null;
  disabled?: boolean;
}

const formatPrice = (n: number) =>
  Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;

const ProductCard: React.FC<ProductCardProps> = ({ data, currentUser, disabled = false }) => {
  const router = useRouter();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const productImage = data.mainImage || '/placeholder.jpg';
  const priceLabel = formatPrice(data.price);
  const shopName = data.shop?.name || 'Unknown Shop';
  const rating = 4.8;
  const inStock = data.inventory > 0;

  const handleCardClick = () => {
    if (disabled) return;
    router.push(`/shop/products/${data.id}`);
  };

  const handleAddToCart = async () => {
    if (!currentUser || disabled || isAddingToCart || !inStock) return;

    try {
      setIsAddingToCart(true);
      const endpoint = `/api/products/${data.id}/cart`;
      await axios.post(endpoint);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group cursor-pointer rounded-lg overflow-hidden relative transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-md max-w-[250px]"
    >
      {/* Background image + product-specific gradient (more balanced) */}
      <div className="absolute inset-0 z-0">
        <Image
          src={productImage}
          alt={data.name}
          fill
          className="object-cover"
          sizes="(max-width:768px) 100vw, 33vw"
          priority={false}
        />
        {/* Product card has a more balanced gradient - darker at both top and bottom */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom,' +
              'rgba(0,0,0,0.50) 0%,' +
              'rgba(0,0,0,0.30) 15%,' +
              'rgba(0,0,0,0.10) 30%,' +
              'rgba(0,0,0,0.00) 45%,' +
              'rgba(0,0,0,0.00) 55%,' +
              'rgba(0,0,0,0.10) 70%,' +
              'rgba(0,0,0,0.40) 85%,' +
              'rgba(0,0,0,0.75) 100%)',
          }}
        />
      </div>

      <div className="relative z-10">
        <div className="relative h-[280px]">
          {/* Heart Button - Using HeartButton component */}
          <div className="absolute top-4 right-4 z-20">
            <HeartButton
              listingId={data.id}
              currentUser={currentUser}
              variant="default"
            />
          </div>

          {/* Out of stock badge - moved below heart */}
          {!inStock && (
            <div className="absolute top-12 right-3 z-20 bg-rose-500 text-white text-[10px] font-medium py-1 px-2 rounded-md shadow-lg">
              Out of stock
            </div>
          )}

          {/* Bottom info */}
          <div className="absolute bottom-4 left-4 right-4 z-20">
            {/* Product Name */}
            <div className="mb-0.5">
              <h1 className="text-white text-[15px] leading-tight font-semibold drop-shadow line-clamp-1">
                {data.name}
              </h1>
            </div>

            {/* Shop Name */}
            <div className="text-white/90 text-[10px] leading-tight mb-2.5">
              <span className="truncate">by {shopName}</span>
            </div>

            {/* Badges: Price and Checkout */}
            <div className="flex items-center gap-2">
              {/* Price badge */}
              <div className="flex items-center gap-1 text-xs text-white/90">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" className="text-emerald-400" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"></circle>
                  <path d="M15 9.5C15 8.11929 13.8807 7 12.5 7C11.1193 7 10 8.11929 10 9.5C10 10.8807 11.1193 12 12.5 12C13.8807 12 15 13.1193 15 14.5C15 15.8807 13.8807 17 12.5 17C11.1193 17 10 15.8807 10 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
                  <path d="M12.5 7V5.5M12.5 18.5V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
                </svg>
                <span className="font-semibold">{priceLabel}</span>
              </div>

              <span className="w-px h-3 bg-white/30" />

              {/* Checkout */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart();
                }}
                disabled={!inStock}
                className={`flex items-center gap-1 text-xs transition-colors ${
                  inStock
                    ? 'text-white/90 hover:text-white'
                    : 'text-white/40 cursor-not-allowed'
                }`}
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>

        <div className="pb-1" />
      </div>
    </div>
  );
};

export default ProductCard;