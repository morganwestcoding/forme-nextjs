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
  const [isFavorite, setIsFavorite] = useState(
    currentUser ? data.favoritedBy.includes(currentUser.id) : false
  );
  
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

  const handleAddToCart = () => {
    if (!inStock) {
      toast.error('This product is out of stock');
      return;
    }
    toast.success(`Added ${data.name} to cart`);
  };

  const handleViewProduct = () => {
    router.push(`/shop/products/${data.id}`);
  };

  // Get stock status text
  const getStockStatus = () => {
    if (!inStock) return 'Out of Stock';
    if (lowStock) return `${data.inventory} left`;
    return 'In Stock';
  };

  const getStockColor = () => {
    if (!inStock) return 'text-red-400';
    if (lowStock) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl overflow-hidden max-w-xl relative">
      {/* Full-height image background with gradient overlay */}
      <div className="absolute inset-0 z-0">
        <Image 
          src={data.mainImage}
          alt={data.name}
          fill
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay for entire card */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#60A5FA]/10 via-black/60 to-black"></div>
      </div>

      {/* Card content with relative positioning */}
      <div className="relative z-10">
        {/* Image Header Section */}
        <div className="relative h-[300px] overflow-hidden">
          {/* Category Label - Top Left */}
          <div className="absolute top-4 left-4 z-20">
            <div className="bg-black/40 border border-white backdrop-blur-sm rounded-lg px-3 py-1.5 text-white">
              <span className="text-xs">{data.category.name}</span>
            </div>
          </div>

          {/* Sale Badge - Top Right */}
          {isOnSale && (
            <div className="absolute top-4 right-4 z-20">
              <div className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-lg">
                {discount}% OFF
              </div>
            </div>
          )}

          {/* Product Info Section */}
          <div className="absolute bottom-5 left-5 right-5 text-white z-20">
            {/* Product Name and Shop - No Background */}
            <div className="mb-3">
              <div className="flex items-center space-x-2 mb-1">
                <h1 className="text-xl font-medium drop-shadow-lg">{data.name}</h1>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative h-4 w-4 rounded-full overflow-hidden">
                  <Image
                    fill
                    className="object-cover"
                    src={data.shop.logo}
                    alt={data.shop.name}
                  />
                </div>
                <p className="text-sm drop-shadow-lg">
                  by {data.shop.name}
                </p>
              </div>
            </div>
            
            {/* Stats Row - With Background */}
            <div className="bg-black/40 backdrop-blur-sm rounded-lg px-4 py-3 text-white">
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center space-y-1">
                  <div className="flex items-center space-x-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" color="currentColor" fill="none">
                      <path d="M12 2C13.1046 2 14 2.89543 14 4C14 5.10457 13.1046 6 12 6C10.8954 6 10 5.10457 10 4C10 2.89543 10.8954 2 12 2Z" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M12 22C13.1046 22 14 21.1046 14 20C14 18.8954 13.1046 18 12 18C10.8954 18 10 18.8954 10 20C10 21.1046 10.8954 22 12 22Z" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M5 12C5 13.1046 4.10457 14 3 14C1.89543 14 1 13.1046 1 12C1 10.8954 1.89543 10 3 10C4.10457 10 5 10.8954 5 12Z" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M23 12C23 13.1046 22.1046 14 21 14C19.8954 14 19 13.1046 19 12C19 10.8954 19.8954 10 21 10C22.1046 10 23 10.8954 23 12Z" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    <span className="text-sm font-medium">${data.price.toFixed(2)}</span>
                  </div>
                  <span className="text-xs opacity-70">Price</span>
                </div>
                
                <div className="w-px h-8 bg-white/30"></div>
                
                <div className="flex flex-col items-center space-y-1">
                  <div className="flex items-center space-x-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" color="currentColor" fill="none">
                      <path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-sm font-medium">4.9</span>
                  </div>
                  <span className="text-xs opacity-70">Rating</span>
                </div>
                
                <div className="w-px h-8 bg-white/30"></div>
                
                <div className="flex flex-col items-center space-y-1">
                  <div className="flex items-center space-x-1.5">
                    <div className={`w-3 h-3 rounded-full ${!inStock ? 'bg-red-400' : lowStock ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
                    <span className={`text-sm font-medium ${getStockColor()}`}>
                      {!inStock ? '0' : data.inventory}
                    </span>
                  </div>
                  <span className="text-xs opacity-70">Stock</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add to Cart Button */}
        <div className="px-5 pb-4 pt-2 -mt-3">
          <button 
            onClick={handleAddToCart}
            disabled={!inStock}
            className="w-full bg-[#60A5FA]/50 backdrop-blur-md text-white p-3 rounded-xl
                    flex items-center justify-center hover:bg-white/10 transition-all
                    shadow-lg border border-white/10 disabled:bg-gray-400/50 disabled:cursor-not-allowed"
          >
            {inStock ? (
              <span className="font-medium text-sm">Add to Cart</span>
            ) : (
              <span className="font-medium text-sm">Out of Stock</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;