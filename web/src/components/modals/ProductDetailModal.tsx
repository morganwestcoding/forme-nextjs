'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Modal from './Modal';
import useProductDetailModal from '@/app/hooks/useProductDetailModal';
import { SafeUser } from '@/app/types';
import HeartButton from '../HeartButton';

interface ProductDetailModalProps {
  currentUser?: SafeUser | null;
}

const formatPrice = (n: number) =>
  Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ currentUser }) => {
  const router = useRouter();
  const productDetailModal = useProductDetailModal();
  const product = productDetailModal.product;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Reset state when product changes
  React.useEffect(() => {
    setSelectedImageIndex(0);
    setSelectedVariant(null);
    setQuantity(1);
  }, [product?.id]);

  const allImages = useMemo(() => {
    if (!product) return [];
    const images = [product.mainImage];
    if (product.galleryImages?.length) {
      images.push(...product.galleryImages);
    }
    return images.filter(Boolean);
  }, [product]);

  const inStock = product ? product.inventory > 0 : false;
  const hasComparePrice = product?.compareAtPrice && product.compareAtPrice > product.price;
  const discount = hasComparePrice
    ? Math.round(((product!.compareAtPrice! - product!.price) / product!.compareAtPrice!) * 100)
    : 0;

  const options = product?.options as any[] | null | undefined;
  const variants = product?.variants as any[] | null | undefined;

  const handleAddToCart = () => {
    toast.success(`${product?.name} added to cart`);
    productDetailModal.onClose();
  };

  const handleBuyNow = () => {
    toast.success('Proceeding to checkout...');
    productDetailModal.onClose();
  };

  const handleShare = () => {
    const url = `${window.location.origin}/shop/products/${product?.id}`;
    if (navigator.share) {
      navigator.share({ title: product?.name, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied');
    }
  };

  if (!product) return null;

  const body = (
    <div className="flex flex-col">
      {/* Image Gallery */}
      <div className="relative -mx-6 -mt-2">
        <div
          className="relative w-full bg-stone-100 overflow-hidden"
          style={{ aspectRatio: '1 / 1' }}
        >
          <Image
            src={allImages[selectedImageIndex] || '/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 500px"
          />

          {/* Heart button */}
          <div
            className="absolute top-4 right-4 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <HeartButton listingId={product.id} currentUser={currentUser} />
          </div>

          {/* Out of stock badge */}
          {!inStock && (
            <div className="absolute top-4 left-4 z-20">
              <span className="text-[11px] font-medium text-white bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5">
                Sold out
              </span>
            </div>
          )}

          {/* Discount badge */}
          {discount > 0 && (
            <div className="absolute top-4 left-4 z-20">
              <span className="text-[11px] font-medium text-white bg-rose-500 rounded-full px-3 py-1.5">
                {discount}% off
              </span>
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        {allImages.length > 1 && (
          <div className="flex gap-1.5 px-6 mt-3">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                  idx === selectedImageIndex
                    ? 'border-stone-900'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <Image
                  src={img}
                  alt={`${product.name} ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="pt-5 pb-2">
        {/* Category & Shop */}
        <div className="flex items-center gap-2">
          {product.category?.name && (
            <span className="text-[11px] text-stone-400" style={{ fontFamily: "'Georgia', serif", fontStyle: 'italic' }}>
              {product.category.name}
            </span>
          )}
          {product.category?.name && product.shop?.name && (
            <span className="text-stone-300">·</span>
          )}
          {product.shop?.name && (
            <button
              onClick={() => {
                productDetailModal.onClose();
                router.push(`/shops/${product.shop.id}`);
              }}
              className="text-[11px] text-stone-400 hover:text-stone-600 transition-colors"
            >
              {product.shop.name}
            </button>
          )}
        </div>

        {/* Name */}
        <h2 className="text-[20px] font-semibold text-stone-900 tracking-tight mt-1 leading-snug">
          {product.name}
        </h2>

        {/* Price */}
        <div className="flex items-center gap-2.5 mt-2">
          <span className="text-[18px] font-bold text-stone-900 tabular-nums">
            {formatPrice(product.price)}
          </span>
          {hasComparePrice && (
            <span className="text-[14px] text-stone-400 line-through tabular-nums">
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>

        {/* Description */}
        {product.description && (
          <p className="text-[13px] text-stone-500 leading-[1.7] mt-4">
            {product.description}
          </p>
        )}

        {/* Options / Variants */}
        {options && options.length > 0 && (
          <div className="mt-5">
            {options.map((option: any, optIdx: number) => (
              <div key={optIdx}>
                <p className="text-[12px] font-medium text-stone-600 mb-2">{option.name}</p>
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
                        className={`px-4 py-2 rounded-xl text-[12px] font-medium transition-all border ${
                          isSelected
                            ? 'bg-stone-900 text-white border-stone-900'
                            : variantInStock
                              ? 'bg-stone-50 text-stone-700 border-stone-200/60 hover:border-stone-300'
                              : 'bg-stone-50 text-stone-300 border-stone-100 cursor-not-allowed line-through'
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quantity */}
        <div className="mt-5">
          <p className="text-[12px] font-medium text-stone-600 mb-2">Quantity</p>
          <div className="inline-flex items-center border border-stone-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 flex items-center justify-center text-stone-500 hover:bg-stone-50 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14" />
              </svg>
            </button>
            <span className="w-10 h-10 flex items-center justify-center text-[13px] font-semibold text-stone-900 tabular-nums border-x border-stone-200">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))}
              className="w-10 h-10 flex items-center justify-center text-stone-500 hover:bg-stone-50 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-5">
            {product.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-3 pb-1">
        <div className="flex gap-2.5">
          <button
            onClick={handleBuyNow}
            disabled={!inStock}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-3.5 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white rounded-xl text-[13px] font-medium transition-all"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
          >
            Buy Now
          </button>
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-stone-50 hover:bg-stone-100 disabled:bg-stone-50 disabled:text-stone-300 text-stone-700 rounded-xl text-[13px] font-medium transition-all border border-stone-200/60"
          >
            Add to Cart
          </button>
        </div>

        {/* Share */}
        <div className="flex items-center justify-center mt-4 mb-1">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-stone-400 hover:text-stone-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.0017 3C7.05534 3.03208 5.41096 3.21929 4.31838 4.31188C2.99988 5.63037 2.99988 7.75248 2.99988 11.9966C2.99988 16.2409 2.99988 18.363 4.31838 19.6815C5.63688 21 7.75899 21 12.0032 21C16.2474 21 18.3695 21 19.688 19.6815C20.7808 18.5887 20.9678 16.9438 20.9999 13.9963" />
              <path d="M14 3H18C19.4142 3 20.1213 3 20.5607 3.43934C21 3.87868 21 4.58579 21 6V10M20 4L11 13" />
            </svg>
            <span className="text-[12px]">Share</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={productDetailModal.isOpen}
      onClose={productDetailModal.onClose}
      onSubmit={() => {}}
      title={product.shop?.name || 'Product'}
      body={body}
    />
  );
};

export default ProductDetailModal;
