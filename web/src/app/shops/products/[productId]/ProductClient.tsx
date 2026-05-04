'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { SafeProduct, SafeUser } from '@/app/types';
import Container from '@/components/Container';
import HeartButton from '@/components/HeartButton';
import Button from '@/components/ui/Button';
import ProductCard from '@/components/shop/ProductCard';
import { placeholderDataUri } from '@/lib/placeholders';
import { Cancel01Icon } from 'hugeicons-react';

interface ProductClientProps {
  product: SafeProduct & {
    shop: {
      id: string;
      name: string;
      logo: string;
      userId?: string;
      location?: string | null;
      coverImage?: string | null;
    };
  };
  currentUser?: SafeUser | null;
  relatedProducts?: SafeProduct[];
}

const formatPrice = (n: number) =>
  Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;

const ProductClient: React.FC<ProductClientProps> = ({
  product,
  currentUser,
  relatedProducts = [],
}) => {
  const router = useRouter();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showDropdown, setShowDropdown] = useState(false);

  const leftColumnRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);

  // Forward scroll events from left column to right column
  useEffect(() => {
    const leftCol = leftColumnRef.current;
    const rightCol = rightColumnRef.current;
    if (!leftCol || !rightCol) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      rightCol.scrollTop += e.deltaY;
    };

    leftCol.addEventListener('wheel', handleWheel, { passive: false });
    return () => leftCol.removeEventListener('wheel', handleWheel);
  }, []);

  // Extract dominant color
  const [dominantColor, setDominantColor] = useState<string | null>(null);
  useEffect(() => {
    const src = product.mainImage;
    if (!src || src.startsWith('data:')) return;
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = 20;
        canvas.height = 20;
        ctx.drawImage(img, 0, 0, 20, 20);
        const data = ctx.getImageData(0, 0, 20, 20).data;
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
          if (brightness > 30 && brightness < 220) {
            r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
          }
        }
        if (count > 0) setDominantColor(`${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(b / count)}`);
      } catch {}
    };
    img.src = src;
  }, [product.mainImage]);

  const allImages = useMemo(() => {
    const images = [product.mainImage];
    if (product.galleryImages?.length) {
      images.push(...product.galleryImages);
    }
    return images.filter(Boolean);
  }, [product]);

  const inStock = product.inventory > 0;
  const hasComparePrice = product.compareAtPrice && product.compareAtPrice > product.price;
  const discount = hasComparePrice
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  const options = product.options;
  const variants = product.variants;

  const handleAddToCart = () => {
    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    toast.success('Proceeding to checkout...');
  };

  const handleShare = () => {
    const url = `${window.location.origin}/shops/products/${product.id}`;
    if (navigator.share) {
      navigator.share({ title: product.name, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied');
    }
  };

  return (
    <Container>
      {/* Dropdown backdrop */}
      {showDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
      )}

      {/* ========== TWO-COLUMN LAYOUT ========== */}
      <div className="flex gap-6 -mx-6 md:-mx-24 px-6 md:px-24 -mt-2 md:-mt-8 md:h-[calc(100vh-2rem)] md:overflow-hidden">

        {/* ===== LEFT COLUMN - Product Card ===== */}
        <div ref={leftColumnRef} className="w-[320px] flex-shrink-0 hidden md:flex flex-col gap-4 py-10">
          <div
            className="rounded-2xl overflow-hidden border border-stone-200/40 shadow-elevation-1 transition-colors duration-700"
            style={{
              background: dominantColor
                ? `linear-gradient(180deg, rgba(${dominantColor}, 0.06) 0%, rgba(${dominantColor}, 0.02) 40%, white 100%)`
                : 'white',
            }}
          >
            {/* Centered Image & Identity */}
            <div className="pt-8 pb-5 px-6 text-center relative">
              {/* Back button - top left */}
              <button
                onClick={() => router.back()}
                className="absolute top-3 left-3 w-8 h-8 flex items-center justify-center text-stone-400  hover:text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800 rounded-full transition-all z-20"
                type="button"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M5 12l7-7M5 12l7 7"/>
                </svg>
              </button>

              {/* Heart - top right */}
              <div className="absolute top-3 right-3 z-20" onClick={(e) => e.stopPropagation()}>
                <HeartButton listingId={product.id} currentUser={currentUser} />
              </div>

              {/* Product Image — bigger than profile/listing avatars */}
              <div className="w-40 h-40 rounded-2xl mx-auto overflow-hidden border-[3px] border-white" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)' }}>
                <img src={allImages[selectedImageIndex] || placeholderDataUri(product.name || 'Product')} alt={product.name} className="w-full h-full object-cover" />
              </div>

              <div className="mt-3">
                {/* Category & Shop */}
                <p className="text-[13px] text-stone-400 dark:text-stone-500">
                  {product.category?.name && (
                    <span style={{ fontFamily: "'Georgia', serif", fontStyle: 'italic' }}>{product.category.name}</span>
                  )}
                  {product.category?.name && product.shop?.name && (
                    <span className="text-stone-300 mx-1">·</span>
                  )}
                  {product.shop?.name && (
                    <button
                      onClick={() => router.push(`/shops/${product.shop.id}`)}
                      className="text-stone-400  hover:text-stone-600 dark:text-stone-300 transition-colors"
                    >
                      {product.shop.name}
                    </button>
                  )}
                </p>

                <h1 className="text-lg font-semibold text-stone-900 dark:text-stone-100 text-center tracking-tight mt-1">
                  {product.name}
                </h1>

                {/* Price */}
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-[15px] font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                    {formatPrice(product.price)}
                  </span>
                  {hasComparePrice && (
                    <span className="text-[12px] text-stone-400 dark:text-stone-500 line-through tabular-nums">
                      {formatPrice(product.compareAtPrice!)}
                    </span>
                  )}
                  {discount > 0 && (
                    <span className="text-[11px] font-medium text-rose-500">{discount}% off</span>
                  )}
                </div>

                {!inStock && (
                  <p className="text-[12px] text-danger font-medium mt-1">Sold out</p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="px-6 py-5">
              <div className="flex items-center justify-between text-center">
                <div className="flex-1">
                  <p className="text-[18px] font-bold text-stone-900 dark:text-stone-100 tabular-nums">{product.inventory}</p>
                  <p className="text-[12px] text-stone-400 dark:text-stone-500 mt-0.5">in stock</p>
                </div>
                <div className="w-px h-10 bg-stone-100 dark:bg-stone-800" />
                <div className="flex-1">
                  <p className="text-[18px] font-bold text-stone-900 dark:text-stone-100 tabular-nums">{product.favoritedBy?.length || 0}</p>
                  <p className="text-[12px] text-stone-400 dark:text-stone-500 mt-0.5">likes</p>
                </div>
                <div className="w-px h-10 bg-stone-100 dark:bg-stone-800" />
                <div className="flex-1">
                  <p className="text-[18px] font-bold text-stone-900 dark:text-stone-100 tabular-nums">{product.reviews?.length || 0}</p>
                  <p className="text-[12px] text-stone-400 dark:text-stone-500 mt-0.5">reviews</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="px-6 py-5">
              {product.description ? (
                <p className="text-[13px] text-stone-500  dark:text-stone-500 leading-[1.7] line-clamp-4">
                  {product.description}
                </p>
              ) : (
                <p className="text-[13px] text-stone-400 dark:text-stone-500 leading-[1.7]">
                  No description available.
                </p>
              )}

              {/* Share */}
              <div className="flex items-center justify-center gap-4 mt-6 mb-2">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 text-stone-400  hover:text-stone-600 dark:text-stone-300 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.0017 3C7.05534 3.03208 5.41096 3.21929 4.31838 4.31188C2.99988 5.63037 2.99988 7.75248 2.99988 11.9966C2.99988 16.2409 2.99988 18.363 4.31838 19.6815C5.63688 21 7.75899 21 12.0032 21C16.2474 21 18.3695 21 19.688 19.6815C20.7808 18.5887 20.9678 16.9438 20.9999 13.9963" />
                    <path d="M14 3H18C19.4142 3 20.1213 3 20.5607 3.43934C21 3.87868 21 4.58579 21 6V10M20 4L11 13" />
                  </svg>
                  <span className="text-[12px]">Share</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-5">
              <div className="flex gap-2.5">
                <Button
                  onClick={handleBuyNow}
                  disabled={!inStock}
                  fullWidth
                  size="lg"
                  type="button"
                >
                  Buy Now
                </Button>
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-stone-50  hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800 disabled:bg-stone-50  disabled:text-stone-300 text-stone-700 dark:text-stone-200 rounded-xl text-[13px] font-medium transition-all border border-stone-200/60"
                  type="button"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ===== RIGHT COLUMN - Content ===== */}
        <div ref={rightColumnRef} className="flex-1 min-w-0 md:overflow-y-auto md:py-14 scrollbar-hide">
          {/* Mobile Header */}
          <div className="md:hidden mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-stone-100 dark:bg-stone-800 border-2 border-white shadow-elevation-2 overflow-hidden flex-shrink-0">
                <Image
                  src={product.mainImage || placeholderDataUri(product.name || 'Product')}
                  alt={product.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-stone-900 dark:text-stone-100 truncate">{product.name}</h1>
                <p className="text-sm text-stone-500  dark:text-stone-500">{formatPrice(product.price)}</p>
              </div>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                aria-label={showDropdown ? 'Close menu' : 'More options'}
                className="relative w-8 h-8 rounded-full flex items-center justify-center text-stone-400  hover:text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800"
                type="button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={`absolute transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${showDropdown ? 'opacity-0 scale-75 rotate-90' : 'opacity-100 scale-100 rotate-0'}`}
                >
                  <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
                </svg>
                <Cancel01Icon
                  className={`absolute w-4 h-4 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${showDropdown ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-90'}`}
                  strokeWidth={2}
                />
              </button>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-12">

            {/* Photos Section */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">Photos</h3>
                  <span className="text-[11px] font-medium text-stone-500  dark:text-stone-500 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-full tabular-nums">{allImages.length}</span>
                </div>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-0.5 overflow-hidden rounded-xl">
                {allImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative overflow-hidden bg-stone-100 dark:bg-stone-800 group cursor-pointer ${
                      idx === selectedImageIndex ? 'ring-2 ring-stone-900 ring-inset' : ''
                    }`}
                    style={{
                      paddingBottom: '100%',
                      opacity: 0,
                      animation: `fadeInUp 520ms ease-out both`,
                      animationDelay: `${Math.min(60 + idx * 30, 360)}ms`,
                    }}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Options / Variants Section */}
            {options && options.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">Options</h3>
                </div>
                {options.map((option: any, optIdx: number) => (
                  <div key={optIdx} className="mb-4">
                    <p className="text-[12px] font-medium text-stone-600 dark:text-stone-300 mb-3">{option.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {(option.values || []).map((val: string, valIdx: number) => {
                        const variantIndex = variants?.findIndex(
                          (v: any) => v.optionValues?.[option.name] === val
                        );
                        const isSelected = selectedVariant === variantIndex;
                        const variantData = variantIndex !== undefined && variantIndex >= 0 ? variants?.[variantIndex] : null;
                        const variantInStock = variantData ? (variantData.inventory ?? 1) > 0 : true;

                        return (
                          <button
                            key={valIdx}
                            onClick={() => setSelectedVariant(variantIndex ?? null)}
                            disabled={!variantInStock}
                            className={`px-5 py-2.5 rounded-xl text-[13px] font-medium transition-all border ${
                              isSelected
                                ? 'bg-stone-900 text-white border-stone-900'
                                : variantInStock
                                  ? 'bg-stone-50 dark:bg-stone-900 text-stone-700 dark:text-stone-200 border-stone-200/60 hover:border-stone-300 dark:border-stone-700'
                                  : 'bg-stone-50 dark:bg-stone-900 text-stone-300 border-stone-100 dark:border-stone-800 cursor-not-allowed line-through'
                            }`}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* Quantity Section */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">Quantity</h3>
              </div>
              <div className="inline-flex items-center border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center text-stone-500  dark:text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 dark:bg-stone-900 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /></svg>
                </button>
                <span className="w-12 h-12 flex items-center justify-center text-[14px] font-semibold text-stone-900 dark:text-stone-100 tabular-nums border-x border-stone-200 dark:border-stone-800">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))}
                  className="w-12 h-12 flex items-center justify-center text-stone-500  dark:text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 dark:bg-stone-900 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                </button>
              </div>
            </section>

            {/* Product Details Section */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">Details</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-lg">
                {product.category?.name && (
                  <div>
                    <p className="text-[11px] text-stone-400 dark:text-stone-500 uppercase tracking-wider">Category</p>
                    <p className="text-[13px] text-stone-700 dark:text-stone-200 font-medium mt-0.5">{product.category.name}</p>
                  </div>
                )}
                {product.sku && (
                  <div>
                    <p className="text-[11px] text-stone-400 dark:text-stone-500 uppercase tracking-wider">SKU</p>
                    <p className="text-[13px] text-stone-700 dark:text-stone-200 font-medium mt-0.5">{product.sku}</p>
                  </div>
                )}
                {product.weight && (
                  <div>
                    <p className="text-[11px] text-stone-400 dark:text-stone-500 uppercase tracking-wider">Weight</p>
                    <p className="text-[13px] text-stone-700 dark:text-stone-200 font-medium mt-0.5">{product.weight}g</p>
                  </div>
                )}
                <div>
                  <p className="text-[11px] text-stone-400 dark:text-stone-500 uppercase tracking-wider">Availability</p>
                  <p className={`text-[13px] font-medium mt-0.5 ${inStock ? 'text-success-soft-foreground' : 'text-danger'}`}>
                    {inStock ? 'In Stock' : 'Sold Out'}
                  </p>
                </div>
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-5">
                  {product.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-medium text-stone-500  dark:text-stone-500 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </section>



            {/* Shop Section */}
            {product.shop && (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">Sold by</h3>
                </div>
                <button
                  onClick={() => router.push(`/shops/${product.shop.id}`)}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50  hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800 border border-stone-100 dark:border-stone-800 hover:border-stone-200  transition-all w-full max-w-md text-left"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-200 dark:bg-stone-700 flex-shrink-0">
                    {product.shop.logo && (
                      <Image
                        src={product.shop.logo}
                        alt={product.shop.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-stone-900 dark:text-stone-100 truncate">{product.shop.name}</p>
                    {product.shop.location && (
                      <p className="text-[12px] text-stone-400 dark:text-stone-500 truncate">{product.shop.location}</p>
                    )}
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400 dark:text-stone-500">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              </section>
            )}

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">More from {product.shop?.name}</h3>
                    <span className="text-[11px] font-medium text-stone-500  dark:text-stone-500 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-full tabular-nums">{relatedProducts.length}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-0.5 overflow-hidden rounded-xl">
                  {relatedProducts.slice(0, 10).map((relProduct, idx) => (
                    <div
                      key={relProduct.id}
                      style={{
                        opacity: 0,
                        animation: `fadeInUp 520ms ease-out both`,
                        animationDelay: `${Math.min(60 + idx * 30, 360)}ms`,
                      }}
                    >
                      <ProductCard data={relProduct} currentUser={currentUser} />
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        </div>
      </div>
    </Container>
  );
};

export default ProductClient;
