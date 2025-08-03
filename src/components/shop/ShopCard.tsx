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
  const [isFollowing, setIsFollowing] = useState(
    currentUser ? data.followers?.includes(currentUser.id) : false
  );

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

  const handleVisitShop = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/shop/${data.id}`);
  };

  // Extract city and state from location
  const [city, state] = data.location?.split(',').map(s => s.trim()) || [];

  // Get follower count and product count with fallbacks
  const followerCount = data.followerCount || data.followers?.length || 0;
  const productCount = data.productCount || data.products?.length || 0;

  return (
    <div
      onClick={() => router.push(`/shop/${data.id}`)}
      className="cursor-pointer bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden relative transition-all duration-200"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src={data.logo}
          alt={data.name}
          fill
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 card__overlay" />
      </div>

      <div className="relative z-10">
        <div className="relative h-[345px] overflow-hidden">
          {/* Category badge - top left (same as ListingCard) */}
          <div className="absolute top-4 left-4 z-20">
            <div className="bg-white/90 backdrop-blur-md border border-white/30 rounded-xl text-center w-24 py-2 shadow-lg hover:bg-white/30 transition-all duration-300">
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-xs font-normal text-black tracking-wide">{data.category || 'Shop'}</span>
              </div>
            </div>
          </div>

          {/* Main content at bottom (same layout as ListingCard) */}
          <div className="absolute bottom-5 left-5 right-5 text-white z-20">
            <div className="flex items-center space-x-2 mb-1">
              <h1 className="text-xl font-medium drop-shadow-lg">{data.name}</h1>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#60A5FA">
                <path d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M9 12.8929L10.8 14.5L15 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-xs drop-shadow-md font-thin flex items-center mb-3">
              {city && state ? `${city}, ${state}` : data.location || 'Online Shop'} • {followerCount} followers
            </p>
            
            {/* Shop Stats Badge (similar to SmartBadgeRating) */}
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-md rounded-lg px-3 py-2 border border-white/30">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" color="currentColor" fill="none">
                      <path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-sm font-medium">4.8</span>
                  </div>
                  
                  <div className="w-px h-4 bg-white/30"></div>
                  
                  <div className="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" color="currentColor" fill="none">
                      <path d="M8 11V8a4 4 0 014-4v0a4 4 0 014 4v3" />
                      <path d="M19.225 12.65L20.075 20.65C20.1833 21.3955 19.6377 22.07 18.8917 22.1783C18.8306 22.1833 18.7694 22.1883 18.7083 22.1783L5.29168 22.1783C4.54334 22.1783 3.93334 21.5683 3.93334 20.82C3.93334 20.7589 3.93834 20.6977 3.94334 20.6367L4.77834 12.65C4.88584 11.8933 5.52751 11.3333 6.29168 11.3333L17.7083 11.3333C18.4725 11.3333 19.1142 11.8933 19.2217 12.65Z" />
                    </svg>
                    <span className="text-sm font-medium">{productCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visit Shop Button (same style as ListingCard) */}
        <div className="px-5 pb-4 pt-2 -mt-3">
          <button
            onClick={handleVisitShop}
            className="w-full bg-[#60A5FA]/50 backdrop-blur-md text-white p-3 rounded-xl
            flex items-center justify-center hover:bg-white/10 transition-all
            shadow-lg border border-white/10"
          >
            <div className="flex items-center text-center gap-3">
              <div className="flex flex-col items-center text-center">
                <span className="font-medium text-sm">Visit Shop</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopCard;