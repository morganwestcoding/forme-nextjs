'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SafeProduct, SafeUser } from "@/app/types";
import { toast } from "react-hot-toast";
import axios from "axios";

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
  actionLabel,
}) => {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(
    currentUser ? data.favoritedBy.includes(currentUser.id) : false
  );
  
  // Create array of all images 
  const allImages = [data.mainImage, ...(data.galleryImages || [])];
  const hasMultipleImages = allImages.length > 1;

  // Check if product has variants
  const hasVariants = data.variants && data.variants.length > 0;
  
  // Safely check for compareAtPrice and calculate discount
  const isOnSale = data.compareAtPrice !== null && 
                  data.compareAtPrice !== undefined && 
                  data.compareAtPrice > data.price;
  
  const discount = isOnSale && data.compareAtPrice 
    ? Math.round(100 - (data.price / data.compareAtPrice * 100)) 
    : 0;

  // Check inventory status
  const inStock = data.inventory > 0;
  const lowStock = inStock && data.inventory <= data.lowStockThreshold;

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!currentUser) {
      return toast.error('You must be logged in to favorite products');
    }

    try {
      const endpoint = `/api/products/${data.id}/favorite`;
      const method = isFavorite ? 'delete' : 'post';
      
      await axios[method](endpoint);
      
      setIsFavorite(!isFavorite);
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || !actionId || !onAction) return;
    onAction(actionId);
  };

  const handleImageChange = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  return (
    <div className="col-span-1 flex justify-center w-full max-w-[280px] mx-auto">
      <div className="bg-white rounded-xl flex flex-col w-full transition-all duration-300 overflow-hidden border hover:shadow-md">
        {/* Image Section */}
        <div className="relative h-[200px] w-full group cursor-pointer overflow-hidden rounded-t-xl">
          <Image
            onClick={() => router.push(`/shop/products/${data.id}`)} 
            fill
            className="object-cover w-full h-full transform transition-all duration-500 
                      group-hover:scale-110"
            src={allImages[currentImageIndex]}
            alt={data.name}
          />
          
          {/* Sale Badge */}
          {isOnSale && (
            <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
              {discount}% OFF
            </div>
          )}
          
          {/* Stock Badge */}
          {!inStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-black/70 text-white text-sm font-medium px-3 py-1.5 rounded">
                Out of Stock
              </span>
            </div>
          )}
          
          {/* Low Stock Indicator */}
          {lowStock && (
            <div className="absolute bottom-3 left-3 z-10 bg-amber-500 text-white text-xs font-medium px-2 py-1 rounded">
              Only {data.inventory} left
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30 
                        opacity-0 transition-all duration-300 group-hover:opacity-100" />
          
          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex items-center gap-2 z-10 
                        opacity-0 translate-y-2 transition-all duration-300 
                        group-hover:opacity-100 group-hover:translate-y-0">
            <button 
              onClick={handleFavorite}
              className="p-2 rounded-full bg-white/90 border border-gray-200 backdrop-blur-sm 
                        hover:bg-white transition-all duration-300 shadow-lg
                        transform scale-90 group-hover:scale-100"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                width="18" 
                height="18" 
                fill={isFavorite ? "#f43f5e" : "none"} 
                stroke={isFavorite ? "#f43f5e" : "currentColor"} 
                strokeWidth="1.5" 
                className="text-gray-700"
              >
                <path d="M12.62 20.8101C12.28 20.9301 11.72 20.9301 11.38 20.8101C8.48 19.8201 2 15.6901 2 8.6901C2 5.6001 4.49 3.1001 7.56 3.1001C9.38 3.1001 10.99 3.9801 12 5.3401C13.01 3.9801 14.63 3.1001 16.44 3.1001C19.51 3.1001 22 5.6001 22 8.6901C22 15.6901 15.52 19.8201 12.62 20.8101Z" />
              </svg>
            </button>
          </div>

          {/* Image Navigation Dots */}
          {hasMultipleImages && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 
                            bg-black/30 backdrop-blur-sm rounded-full px-2.5 py-1.5 
                            opacity-0 transition-all duration-300 
                            group-hover:opacity-100 transform scale-95 group-hover:scale-100">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => handleImageChange(index, e)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-200
                    ${currentImageIndex === index 
                      ? 'bg-white scale-110' 
                      : 'bg-white/40 hover:bg-white/60'
                    }
                  `}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Shop Info */}
          <div className="flex items-center gap-2 mb-2">
            <div className="relative h-5 w-5 rounded-full overflow-hidden">
              <Image
                fill
                className="object-cover"
                src={data.shop.logo}
                alt={data.shop.name}
              />
            </div>
            <span className="text-xs text-gray-500">{data.shop.name}</span>
          </div>
          
          {/* Product Info */}
          <h3 
            className="font-medium text-gray-900 text-base mb-1 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer"
            onClick={() => router.push(`/shop/products/${data.id}`)}
          >
            {data.name}
          </h3>
          
          {/* Pricing */}
          <div className="flex items-center gap-2 mt-auto">
            <span className="font-semibold text-gray-900">
              ${data.price.toFixed(2)}
            </span>
            
            {isOnSale && data.compareAtPrice && (
              <span className="text-sm text-gray-500 line-through">
                ${data.compareAtPrice.toFixed(2)}
              </span>
            )}
          </div>
          
          {/* Variants Indicator if applicable */}
          {hasVariants && (
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              <span className="text-xs text-gray-500">Available in:</span>
              {data.variants?.slice(0, 3).map((variant, index) => (
                <span key={index} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                  {Object.values(variant.optionValues)[0]}
                </span>
              ))}
              {data.variants && data.variants.length > 3 && (
                <span className="text-xs text-gray-500">+{data.variants.length - 3} more</span>
              )}
            </div>
          )}
          
          {/* Add to Cart Button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (!inStock) {
                toast.error('This product is out of stock');
                return;
              }
              toast.success(`Added ${data.name} to cart`);
            }}
            disabled={!inStock}
            className="mt-3 w-full bg-[#60A5FA] text-white py-2.5 px-4 rounded-lg text-sm font-medium
                     shadow-sm hover:shadow-md hover:bg-[#4287f5] transition-all duration-200
                     flex items-center justify-center disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            {inStock ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                  <path d="M8 11V8a4 4 0 014-4v0a4 4 0 014 4v3" />
                  <path d="M19.225 12.65L20.075 20.65C20.1833 21.3955 19.6377 22.07 18.8917 22.1783C18.8306 22.1833 18.7694 22.1883 18.7083 22.1783L5.29168 22.1783C4.54334 22.1783 3.93334 21.5683 3.93334 20.82C3.93334 20.7589 3.93834 20.6977 3.94334 20.6367L4.77834 12.65C4.88584 11.8933 5.52751 11.3333 6.29168 11.3333L17.7083 11.3333C18.4725 11.3333 19.1142 11.8933 19.2217 12.65Z" />
                </svg>
                Add to Cart
              </>
            ) : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;