// components/shop/ProductCard.tsx
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import axios from 'axios';
import { SafeProduct, SafeUser } from '@/app/types';

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

  const handleCardClick = () => {
    if (disabled) return;
    router.push(`/shop/products/${data.id}`);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser || disabled || isAddingToCart) return;
    
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
      {/* Background with shop image (grayscale) */}
      <div className="absolute inset-0 z-0">
        {/* Shop background image - grayscale and sharp */}
        <div className="absolute inset-0">
          <Image
            src={data.shop?.logo || productImage}
            alt=""
            fill
            className="object-cover grayscale scale-105"
            style={{ opacity: 0.75 }}
            sizes="250px"
          />
        </div>

        {/* Very light desaturation overlay */}
        <div
          className="absolute inset-0 bg-gray-600/15"
          style={{ mixBlendMode: 'multiply' }}
        />

        {/* Subtle blue radial gradient emanating from product position */}
        <div
          className="absolute inset-0 opacity-12"
          style={{
            background: 'radial-gradient(circle at 50% 28%, rgba(96, 165, 250, 0.18) 0%, transparent 55%)'
          }}
        />

        {/* Top gradient for framing and button visibility */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom,' +
              'rgba(0,0,0,0.35) 0%,' +
              'rgba(0,0,0,0.20) 15%,' +
              'rgba(0,0,0,0.10) 30%,' +
              'rgba(0,0,0,0.00) 45%)',
          }}
        />

        {/* Very strong bottom gradient for text readability */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top,' +
              'rgba(0,0,0,0.85) 0%,' +
              'rgba(0,0,0,0.75) 12%,' +
              'rgba(0,0,0,0.60) 25%,' +
              'rgba(0,0,0,0.45) 38%,' +
              'rgba(0,0,0,0.30) 50%,' +
              'rgba(0,0,0,0.15) 65%,' +
              'rgba(0,0,0,0.05) 80%,' +
              'rgba(0,0,0,0.00) 90%)',
          }}
        />
      </div>

      <div className="relative z-10">
        <div className="relative h-[350px]">
          {/* Add to Cart Button */}
          <div className="absolute top-4 right-4 z-20">
            <div
              role="button"
              aria-label="Add to cart"
              onClick={handleAddToCart}
              className="hover:scale-[1.06] transition-transform"
              title="Add to cart"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="30"
                height="30"
                color="white"
                fill="none"
                style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5)) backdrop-blur-md' }}
              >
                <path d="M8 16L16.7201 15.2733C19.4486 15.046 20.0611 14.45 20.3635 11.7289L21 6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                <path d="M6 6H22" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                <circle cx="6" cy="20" r="2" stroke="currentColor" strokeWidth="1" />
                <circle cx="17" cy="20" r="2" stroke="currentColor" strokeWidth="1" />
                <path d="M8 20L15 20" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                <path d="M2 2H2.966C3.91068 2 4.73414 2.62459 4.96326 3.51493L7.93852 15.0765C8.08887 15.6608 7.9602 16.2797 7.58824 16.7616L6.63213 18" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Product Image Circle - Centered towards middle */}
          <div className="absolute top-[32%] left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="relative transition-transform duration-300">
              <div className="w-28 h-28 rounded-full overflow-hidden shadow-lg border-2 border-white relative">
                <Image
                  src={productImage}
                  alt={data.name}
                  fill
                  className="object-cover"
                  priority={false}
                  sizes="112px"
                />
              </div>
            </div>
          </div>

          {/* Bottom info - positioned like WorkerCard */}
          <div className="absolute bottom-5 left-5 right-5 z-20">
            {/* Product Name */}
            <div className="mb-1">
              <h3 className="text-lg font-semibold text-white drop-shadow">
                {data.name}
              </h3>
            </div>

            {/* Shop Name */}
            <div className="text-white/90 text-[11px] leading-4 mb-4">
              <div className="flex items-start gap-1 mb-1">
                <span className="leading-4">From {shopName}</span>
              </div>
            </div>

            {/* Price and Rating Pills */}
            <div className="flex items-center gap-2">
              {/* Price pill */}
              <button
                onClick={(e) => { e.stopPropagation(); }}
                className="inline-flex rounded-xl hover:bg-white/10 transition-all duration-300 group p-0"
                type="button"
                aria-label="Price"
              >
                <div className="border rounded-md px-2 py-1 group-hover:scale-105 transition-all duration-300 shadow-sm inline-flex items-center justify-center gap-1 w-20 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400/40 shadow-green-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                  <span className="text-xs text-green-200">{priceLabel}</span>
                </div>
              </button>

              {/* Rating pill */}
              <button
                onClick={(e) => { e.stopPropagation(); }}
                className="inline-flex rounded-xl hover:bg-white/10 transition-all duration-300 group p-0"
                type="button"
                aria-label="Rating"
              >
                <div className="border rounded-md px-2 py-1 group-hover:scale-105 transition-all duration-300 shadow-sm inline-flex items-center justify-center gap-1 w-20 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-400/40 shadow-yellow-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
                  <span className="text-xs text-yellow-200">{rating}</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="pb-2" />
      </div>
    </div>
  );
};

export default ProductCard;