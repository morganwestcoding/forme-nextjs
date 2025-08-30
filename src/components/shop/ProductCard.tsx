'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import SmartBadgeProduct from './SmartBadgeProduct';
import { SafeProduct, SafeUser } from '@/app/types';

interface ProductCardProps {
  data: SafeProduct;
  currentUser?: SafeUser | null;
  onAction?: (id: string) => void;
  disabled?: boolean;
  actionId?: string;
  actionLabel?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  data,
  currentUser,
  onAction,
  disabled,
  actionId = '',
}) => {
  const router = useRouter();

  const [isFavorite, setIsFavorite] = useState(
    currentUser ? data.favoritedBy.includes(currentUser.id) : false
  );

  // Inventory
  const inStock = data.inventory > 0;
  const lowStock = inStock && data.inventory <= data.lowStockThreshold;
  const stockStatus: 'in' | 'low' | 'out' = !inStock ? 'out' : lowStock ? 'low' : 'in';

  // Sale status & discount
  const isOnSale =
    data.compareAtPrice !== null &&
    data.compareAtPrice !== undefined &&
    data.compareAtPrice > data.price;

const shopLocation = (data.shop as { location?: string } | undefined)?.location;
const parts = shopLocation ? shopLocation.split(',').map((s: string) => s.trim()) : [];
const city = parts[0] ?? '';
const state = parts[1] ?? '';
  const productImage = data.mainImage || '/placeholder.jpg';

  const handleCardClick = () => {
    router.push(`/shop/products/${data.id}`);
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      toast.error('Please sign in to favorite products.');
      return;
    }
    try {
      const endpoint = `/api/products/${data.id}/favorite`;
      const method = isFavorite ? 'delete' : 'post';
      await axios[method](endpoint);
      setIsFavorite((v) => !v);
      toast.success(!isFavorite ? 'Added to favorites' : 'Removed from favorites');
    } catch {
      toast.error('Something went wrong');
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!inStock) {
      toast.error('This product is out of stock');
      return;
    }
    // Add-to-cart logic goes here…
    toast.success(`Added ${data.name} to cart`);
  };

  const onPriceClick = () => {
    router.push(`/shop/products/${data.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="
        group cursor-pointer relative overflow-hidden
        rounded-2xl bg-white shadow-lg transition-all duration-300
        hover:shadow-2xl"
    >
      {/* Background image + layered scrim (match Listing/Shop) */}
      <div className="absolute inset-0 z-0">
        <Image
          src={productImage}
          alt={data.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width:768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
      </div>

      <div className="relative z-10">
        {/* Consistent image area height */}
        <div className="relative h-[345px]">
          {/* Category pill (top-left) */}
          <div className="absolute top-4 left-4 z-20">
            <div className="bg-white/90 backdrop-blur-md border border-white/30 rounded-xl w-24 py-2 shadow-lg hover:bg-white/80 transition">
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-xs font-normal text-black tracking-wide">
                  {data.category?.name || 'Product'}
                </span>
              </div>
            </div>
          </div>

          {/* Glassy heart (same look as Shop/Listing) positioned to the left of the right rail */}
          <div className="absolute top-4 right-[6.25rem] z-20">
            <button
              aria-label={isFavorite ? 'Unfavorite' : 'Favorite'}
              onClick={handleFavorite}
              className="p-1.5 hover:scale-[1.06] transition-transform"
              title={isFavorite ? 'Unfavorite' : 'Favorite'}
            >
              {/* Glassy heart path (no circular backdrop) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="28"
                height="28"
                style={{ filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.30))' }}
              >
                <defs>
                  <linearGradient id="heartGlassGradProd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="rgba(255,255,255,0.75)" />
                    <stop offset="0.55" stopColor="rgba(255,255,255,0.18)" />
                    <stop offset="1" stopColor="rgba(255,255,255,0.00)" />
                  </linearGradient>
                </defs>
                <path
                  d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z"
                  fill={isFavorite ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.22)'}
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z"
                  fill="url(#heartGlassGradProd)"
                  opacity="0.9"
                />
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

          {/* RIGHT PRICE RAIL (distinct signature) */}
          <div className="absolute top-4 right-4 z-20">
            <SmartBadgeProduct
              price={data.price}
              compareAtPrice={data.compareAtPrice ?? undefined}
              isOnSale={isOnSale}
              stockStatus={stockStatus}
              unitsLeft={lowStock ? data.inventory : undefined}
              onPriceClick={onPriceClick}
            />
          </div>

          {/* Bottom glass dock: title + meta (lean — product differs via right rail) */}
          <div className="absolute bottom-5 left-5 right-5 z-20">
            <div
              className="
                rounded-2xl px-4 py-3
                bg-white/10 backdrop-blur-md border border-white/20
                shadow-[0_6px_20px_rgba(0,0,0,0.25)]"
            >
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-white text-[20px] leading-6 font-semibold drop-shadow">
                  {data.name}
                </h1>
                {data.isFeatured && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    className="text-white/90"
                    aria-label="Featured"
                  >
                    <path
                      d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="#60A5FA"
                    />
                    <path
                      d="M9 12.8929L10.8 14.5L15 9.5"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>

              <div className="flex items-center gap-1 text-white/90 text-[11px] leading-4">
                <span className="truncate">
                  by {data.shop?.name || 'Shop'}
                </span>
                <span className="opacity-70">•</span>
                <span className="opacity-90">
                  {city}
                  {state ? `, ${state}` : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Add to Cart button (consistent with other cards) */}
        <div className="px-5 pb-4 pt-2 -mt-3">
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className="w-full bg-[#60A5FA]/50 backdrop-blur-md text-white p-3 rounded-xl
              flex items-center justify-center hover:bg-white/10 transition-all
              shadow-lg border border-white/10 disabled:bg-gray-400/50 disabled:cursor-not-allowed"
          >
            <span className="font-medium text-sm">
              {inStock ? 'Add to Cart' : 'Out of Stock'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
