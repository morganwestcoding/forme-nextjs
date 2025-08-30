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
  const [isFavorite, setIsFavorite] = useState(
    currentUser ? (data.favoritedBy || []).includes(currentUser.id) : false
  );

  const stateCls = disabled
    ? 'opacity-60 cursor-not-allowed'
    : 'cursor-pointer hover:shadow-md hover:border-blue-300';

  const productImage = data.mainImage || '/placeholder.jpg';
  const priceLabel = formatPrice(data.price);

  const handleCardClick = () => {
    if (disabled) return;
    router.push(`/shop/products/${data.id}`);
  };

  const handleHeartClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    try {
      const endpoint = `/api/products/${data.id}/favorite`;
      const method = isFavorite ? 'delete' : 'post';
      await (axios as any)[method](endpoint);
      setIsFavorite((v) => !v);
    } catch {
      /* no-op */
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative w-full rounded-2xl border border-gray-200 bg-white p-5 transition ${stateCls}`}
    >
      <div className="grid grid-cols-[130px_1fr] gap-4 items-start">
        {/* Image */}
        <div className="relative w-[130px] h-[130px] rounded-xl overflow-hidden bg-gray-100">
          <Image
            src={productImage}
            alt={data.name}
            fill
            className="object-cover"
            sizes="130px"
          />

          {/* Heart (exact ServiceCard white-glass styling) */}
          <button
            onClick={handleHeartClick}
            className="absolute bottom-2 right-2 p-1 transition-transform hover:scale-105"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="28"
              height="28"
              style={{ filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.30))' }}
            >
              <defs>
                  <stop offset="0" stopColor="rgba(255,255,255,0.75)" />
                  <stop offset="0.55" stopColor="rgba(255,255,255,0.18)" />
                  <stop offset="1" stopColor="rgba(255,255,255,0)" />
              </defs>
              {/* Base glass body (white border + semi-white fill) */}
              <path
                d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z"
                fill={isFavorite ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.22)'}
                stroke="rgba(255,255,255,0.55)"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Highlight sheen */}
              <path
                d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z"
                fill="url(#heartGlassGradWhite)"
                opacity="0.9"
              />
              {/* Subtle inner white edge */}
              <path
                d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z"
                fill="none"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="0.6"
                opacity="0.35"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col items-start text-left">
          <div className="text-sm font-semibold text-gray-900 leading-snug truncate max-w-[22rem]">
            {data.name || 'Untitled Product'}
          </div>

          {/* Price (fixed width w-16) */}
          <span
            className="mt-1 inline-flex w-16 items-center justify-center py-1 rounded-lg text-[11px] font-medium bg-green-50 text-emerald-600 border border-emerald-500"
            title={priceLabel}
          >
            {priceLabel}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
