// components/shop/ProductCard.tsx
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SafeProduct, SafeUser } from '@/app/types';
import HeartButton from '../HeartButton';
import { placeholderDataUri } from '@/lib/placeholders';

interface ProductCardProps {
  data: SafeProduct;
  currentUser?: SafeUser | null;
  disabled?: boolean;
}

const formatPrice = (n: number) =>
  Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;

const ProductCard: React.FC<ProductCardProps> = ({ data, currentUser, disabled = false }) => {
  const router = useRouter();

  const productImage = data.mainImage || placeholderDataUri(data.name || 'Product');
  const priceLabel = formatPrice(data.price);
  const shopName = data.shop?.name || '';
  const categoryName = data.category?.name || '';
  const inStock = data.inventory > 0;

  const handleCardClick = () => {
    if (disabled) return;
    router.push(`/shops/products/${data.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group cursor-pointer w-full relative"
    >
      {/* Image */}
      <div
        className="relative overflow-hidden bg-stone-100 dark:bg-zinc-800"
        style={{ aspectRatio: '5 / 6', boxShadow: 'inset 0 0 30px rgba(0,0,0,0.08), inset 0 0 6px rgba(0,0,0,0.04)' }}
      >
        <Image
          src={productImage}
          alt={data.name}
          fill
          className="object-cover transition-all duration-700 ease-out group-hover:scale-105"
          sizes="300px"
        />

        {/* Heart — top right, on hover */}
        <div
          className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <HeartButton listingId={data.id} currentUser={currentUser} />
        </div>

        {/* Out of stock */}
        {!inStock && (
          <div className="absolute top-3 left-3 z-20">
            <span className="text-[10px] font-medium text-white bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1">Sold out</span>
          </div>
        )}
      </div>

      {/* Info — always visible */}
      <div className="mt-2">
        {(categoryName || shopName) && (
          <p className="text-[11px] text-stone-400 dark:text-zinc-500 leading-none truncate" style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontStyle: 'italic' }}>
            {categoryName || shopName}
          </p>
        )}

        <h2 className="text-[13px] font-semibold text-neutral-900 dark:text-zinc-100 tracking-[-0.01em] leading-snug line-clamp-2 mt-0.5">
          {data.name}
        </h2>

        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[12px] font-medium text-neutral-900 dark:text-zinc-100 tabular-nums">{priceLabel}</span>
          {shopName && categoryName && (
            <>
              <span className="text-stone-300 dark:text-zinc-600">·</span>
              <span className="text-[11px] text-stone-400 dark:text-zinc-500 truncate">{shopName}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
