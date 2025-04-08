'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SafeShop, SafeUser } from "@/app/types";
import { toast } from "react-hot-toast";
import axios from "axios";

interface ShopCardProps {
  data: SafeShop;
  currentUser?: SafeUser | null;
  onAction?: (id: string) => void;
  disabled?: boolean;
  actionId?: string;
  actionLabel?: string;
}

const ShopCard: React.FC<ShopCardProps> = ({
  data,
  currentUser,
  onAction,
  disabled,
  actionId = '',
  actionLabel,
}) => {
  const router = useRouter();
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [isFollowing, setIsFollowing] = useState(
    currentUser ? data.followers.includes(currentUser.id) : false
  );

  // Get featured products if available
  const featuredProducts = data.featuredProductItems || [];
  const hasProducts = featuredProducts.length > 0;

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      return toast.error('You must be logged in to follow shops');
    }

    try {
      const endpoint = `/api/shops/${data.id}/follow`;
      const method = isFollowing ? 'delete' : 'post';
      
      await axios[method](endpoint);
      
      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? 'Shop unfollowed' : 'Shop followed');
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || !actionId || !onAction) return;
    onAction(actionId);
  };

  const getStateAcronym = (state: string) => {
    const stateMap: {[key: string]: string} = {
      'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
      'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
      'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
      'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
      'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
      'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
      'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
      'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
      'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
      'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
    };
    return stateMap[state] || state;
  };

  const [city, state] = data.location?.split(',').map(s => s.trim()) || [];
  const stateAcronym = state ? getStateAcronym(state) : '';

  return (
    <div className="col-span-1 flex justify-center w-full max-w-[350px] mx-auto">
      <div className="bg-white rounded-xl flex flex-col w-full transition-all duration-300 overflow-hidden hover:shadow-md">
        {/* Shop Header with Avatar */}
        <div className="p-4 border-b flex items-center gap-3">
          <div className="relative h-12 w-12 rounded-full overflow-hidden border shadow-sm">
            <Image
              fill
              className="object-cover"
              src={data.logo}
              alt={data.name}
            />
            {data.isVerified && (
              <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-0.5 border-2 border-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="10" height="10" fill="none">
                  <path d="M5 12.4545L8.63636 16L19 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="font-medium text-gray-900">{data.name}</h3>
              {data.isVerified && (
                <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Verified</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
              {data.location && (
                <span>{city}, {stateAcronym}</span>
              )}
              {data.followerCount !== undefined && (
                <>
                  <span className="text-gray-300">•</span>
                  <span>{data.followerCount} followers</span>
                </>
              )}
              {data.productCount !== undefined && (
                <>
                  <span className="text-gray-300">•</span>
                  <span>{data.productCount} products</span>
                </>
              )}
            </div>
          </div>
          
          <button
            onClick={handleFollow}
            className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors
              ${isFollowing 
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                : 'bg-blue-500 text-white hover:bg-blue-600'}`
            }
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>

        {/* Product Display Section */}
        {hasProducts ? (
          <>
            {/* Product Image */}
            <div className="relative h-[175px] w-full group cursor-pointer overflow-hidden">
              <Image
                onClick={() => router.push(`/shop/${data.id}/products/${featuredProducts[currentProductIndex].id}`)} 
                fill
                className="object-cover w-full h-full transform transition-all duration-500 
                          group-hover:scale-110"
                src={featuredProducts[currentProductIndex].image}
                alt={featuredProducts[currentProductIndex].name}
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/50 
                            opacity-0 transition-all duration-300 group-hover:opacity-100" />

              {/* Product Navigation Dots */}
              {featuredProducts.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 
                                bg-black/30 backdrop-blur-sm rounded-full px-2.5 py-1.5 
                                opacity-0 transition-all duration-300 
                                group-hover:opacity-100 transform scale-95 group-hover:scale-100">
                  {featuredProducts.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentProductIndex(index);
                      }}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-200
                        ${currentProductIndex === index 
                          ? 'bg-white scale-110' 
                          : 'bg-white/40 hover:bg-white/60'
                        }
                      `}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="px-4 pt-4 pb-4 border-x border-b rounded-b-xl">
              <div className="flex items-start justify-between mb-3">
                <div className="flex flex-col">
                  <h3 className="font-medium text-gray-900 text-base">
                    {featuredProducts[currentProductIndex].name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    By {data.name}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-gray-900">
                    ${featuredProducts[currentProductIndex].price}
                  </span>
                </div>
              </div>
              
              {/* Product Action Buttons */}
              <div className="flex items-center gap-2 mt-3">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle add to cart or similar action
                    toast.success(`Added ${featuredProducts[currentProductIndex].name} to cart`);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg text-xs font-medium
                            hover:bg-gray-200 hover:shadow-sm transition-all duration-200 
                            flex items-center justify-center h-11"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                    <path d="M8 11V8a4 4 0 014-4v0a4 4 0 014 4v3" />
                    <path d="M19.225 12.65L20.075 20.65C20.1833 21.3955 19.6377 22.07 18.8917 22.1783C18.8306 22.1833 18.7694 22.1883 18.7083 22.1783L5.29168 22.1783C4.54334 22.1783 3.93334 21.5683 3.93334 20.82C3.93334 20.7589 3.93834 20.6977 3.94334 20.6367L4.77834 12.65C4.88584 11.8933 5.52751 11.3333 6.29168 11.3333L17.7083 11.3333C18.4725 11.3333 19.1142 11.8933 19.2217 12.65Z" />
                  </svg>
                  Add to Cart
                </button>
                
                <button 
                  onClick={() => router.push(`/shop/${data.id}/products/${featuredProducts[currentProductIndex].id}`)}
                  className="flex-1 bg-[#60A5FA] text-white py-3 px-4 rounded-lg text-xs font-medium
                            shadow-sm hover:shadow-md hover:bg-[#4287f5] transition-all duration-200
                            flex items-center justify-between h-11"
                >
                  <span className="flex-1 text-center">View Details</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
                    <path d="M20.0001 11.9998L4.00012 11.9998" />
                    <path d="M15.0003 17C15.0003 17 20.0002 13.3176 20.0002 12C20.0002 10.6824 15.0002 7 15.0002 7" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          // No products view
          <div className="px-4 py-6 text-center border-x border-b rounded-b-xl flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <path d="M5 8h2m12 0h-2m-5 6v4m0 0h4m-4 0H8" />
                <path d="M19.225 6.65L20.075 14.65C20.1833 15.3955 19.6377 16.07 18.8917 16.1783C18.8306 16.1833 18.7694 16.1883 18.7083 16.1783L5.29168 16.1783C4.54334 16.1783 3.93334 15.5683 3.93334 14.82C3.93334 14.7589 3.93834 14.6977 3.94334 14.6367L4.77834 6.65C4.88584 5.89331 5.52751 5.33331 6.29168 5.33331L17.7083 5.33331C18.4725 5.33331 19.1142 5.89331 19.2217 6.65Z" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-700 mb-1">No products yet</h3>
            <p className="text-sm text-gray-500 mb-4">This shop hasn't added any products</p>
            
            <button 
              onClick={() => router.push(`/shop/${data.id}`)}
              className="bg-[#60A5FA] text-white py-2.5 px-4 rounded-lg text-sm font-medium
                       shadow-sm hover:shadow-md hover:bg-[#4287f5] transition-all duration-200
                       flex items-center justify-center"
            >
              Visit Shop
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" className="ml-1.5">
                <path d="M20.0001 11.9998L4.00012 11.9998" />
                <path d="M15.0003 17C15.0003 17 20.0002 13.3176 20.0002 12C20.0002 10.6824 15.0002 7 15.0002 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShopCard;