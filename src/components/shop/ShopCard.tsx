'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import axios from 'axios';
import SmartBadgeShop from './SmartBadgeShop';
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

  const [isFollowing, setIsFollowing] = useState(
    currentUser ? !!data.followers?.includes(currentUser.id) : false
  );

  const [city, state] = data.location?.split(',').map((s) => s.trim()) || [];
  const productCount = data.productCount || data.products?.length || 0;
  const shopRating = (data as any)?.rating ?? 4.8;
  const cardImage = data.logo || '/placeholder.jpg';

  const handleCardClick = () => {
    router.push(`/shops/${data.id}`);
  };

  // Heart (follow/unfollow) — same placement/feel as ListingCard heart
  const handleHeartClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      router.push('/login'); // or noop if you prefer
      return;
    }
    try {
      const endpoint = `/api/shops/${data.id}/follow`;
      const method = isFollowing ? 'delete' : 'post';
      await axios[method](endpoint);
      setIsFollowing(!isFollowing);
    } catch (err) {
      // silent fail to match ListingCard minimalism
      // console.error(err);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="
        group cursor-pointer relative overflow-hidden
        rounded-xl bg-white shadow-lg transition-all duration-300
        hover:shadow-xl max-w-[250px]"
    >
      {/* Background image + layered scrim (matches ListingCard) */}
      <div className="absolute inset-0 z-0">
        <Image
          src={cardImage}
          alt={data.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width:768px) 100vw, 33vw"
          priority={false}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top,' +
              'rgba(0,0,0,0.98) 0%,' +
              'rgba(0,0,0,0.96) 12%,' +
              'rgba(0,0,0,0.90) 26%,' +
              'rgba(0,0,0,0.70) 42%,' +
              'rgba(0,0,0,0.45) 56%,' +
              'rgba(0,0,0,0.20) 70%,' +
              'rgba(0,0,0,0.06) 82%,' +
              'rgba(0,0,0,0.00) 90%,' +
              'rgba(0,0,0,0.00) 100%)',
          }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
      </div>

      <div className="relative z-10">
        {/* Match ListingCard height exactly */}
        <div className="relative h-[350px]">
          {/* Heart */}
          <div className="absolute top-4 right-4 z-20">
            <div
              role="button"
              aria-label="Follow"
              onClick={handleHeartClick}
              className="hover:scale-[1.06] transition-transform"
              title={isFollowing ? 'Unfollow' : 'Follow'}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="30"
                height="30"
                style={{ filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.30)) backdrop-blur-sm ' }}
              >
                <defs>
                  <stop offset="0" stopColor="rgba(255,255,255,0.75)" />
                  <stop offset="0.55" stopColor="rgba(255,255,255,0.18)" />
                  <stop offset="1" stopColor="rgba(255,255,255,0.00)" />
                </defs>
                <path
                  d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z"
                  fill={isFollowing ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.22)'}
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z"
                  fill="url(#heartGlassGrad)"
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
            </div>
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

            {/* Location (one line) + products below */}
            <div className="text-white/90 text-[11px] leading-4 mb-2">
              <div className="flex items-center gap-1">
                <span>
                  {city}
                  {state ? `, ${state}` : ''}
                </span>
              </div>
              <div className="opacity-90 mt-0.5">{productCount} products</div>
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