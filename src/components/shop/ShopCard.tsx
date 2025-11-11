'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import SmartBadgeShop from './SmartBadgeShop';
import HeartButton from '../HeartButton';
import { SafeShop, SafeUser } from '@/app/types';

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
}) => {
  const router = useRouter();

  const [city, state] = data.location?.split(',').map((s) => s.trim()) || [];
  const productCount = data.productCount || data.products?.length || 0;
  const shopRating = (data as any)?.rating ?? 4.8;
  const cardImage = data.logo || '/placeholder.jpg';

  const handleCardClick = () => {
    router.push(`/shops/${data.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="
        group cursor-pointer relative overflow-hidden
        rounded-lg bg-white transition-all duration-300
        hover:-translate-y-1 hover:scale-[1.01] hover:shadow-md
        max-w-[250px]"
    >
      {/* Background image + lighter-at-top, bottom-heavy gradient */}
      <div className="absolute inset-0 z-0">
        <Image
          src={cardImage}
          alt={data.name}
          fill
          className="object-cover"
          sizes="(max-width:768px) 100vw, 33vw"
          priority={false}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top,' +
              'rgba(0,0,0,0.75) 0%,' +
              'rgba(0,0,0,0.70) 12%,' +
              'rgba(0,0,0,0.60) 26%,' +
              'rgba(0,0,0,0.45) 42%,' +
              'rgba(0,0,0,0.30) 56%,' +
              'rgba(0,0,0,0.15) 70%,' +
              'rgba(0,0,0,0.04) 82%,' +
              'rgba(0,0,0,0.00) 90%,' +
              'rgba(0,0,0,0.00) 100%)',
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Match ListingCard height exactly */}
        <div className="relative h-[350px]">
          {/* Heart - Using HeartButton component */}
          <div className="absolute top-4 right-4 z-20">
            <HeartButton
              listingId={data.id}
              currentUser={currentUser}
              variant="default"
            />
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-5 left-5 right-5 z-20">
            {/* Title + inline badge (stays with last word) */}
            <div className="mb-1">
              <h1 className="text-white text-md leading-6 font-semibold drop-shadow inline">
                <span className="align-middle">{data.name}</span>
                {data.isVerified && (
                  <span className="inline-flex items-center align-middle ml-1 translate-y-[1px]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      className="text-white/90 shrink-0"
                      aria-label="Verified"
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
                  </span>
                )}
              </h1>
            </div>

            {/* Location - improved formatting */}
            <div className="text-white/90 text-[11px] leading-4 mb-4">
              {/* City, State on one line with better spacing */}
              <div className="flex items-center gap-1 mb-1">
                <span className="truncate">
                  {city && state ? `${city}, ${state}` : city || state || 'Location not specified'}
                </span>
              </div>
              {/* Product count below with subtle styling */}
              <div className="opacity-80 mt-0.5 font-light text-[10px]">
                {productCount} products
              </div>
            </div>

            {/* Rating + followers */}
            <div className="flex items-center">
              <SmartBadgeShop
                rating={shopRating}
                isTrending={data.isVerified || false}
                followerCount={data.followerCount || data.followers?.length || 0}
              />
            </div>
          </div>
        </div>

        <div className="pb-2" />
      </div>
    </div>
  );
};

export default ShopCard;