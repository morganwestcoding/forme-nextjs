'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
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
  const shopRating = Number(data.rating ?? 5.0).toFixed(1);
  const cardImage = data.coverImage || data.logo || '/placeholder.jpg';

  return (
    <div
      onClick={() => router.push(`/shops/${data.id}`)}
      className="group cursor-pointer overflow-hidden rounded-xl transition-[transform,box-shadow,opacity] duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08),0_8px_16px_rgba(0,0,0,0.04)] active:scale-[0.98]"
    >
      {/* Image */}
      <div className="relative overflow-hidden rounded-xl">
        <Image
          src={cardImage}
          alt={data.name}
          width={100}
          height={100}
          className="w-[100px] h-[100px] object-cover transition-[transform,filter] duration-700 ease-out group-hover:scale-105 group-hover:brightness-105"
          priority={false}
        />
        {/* Heart — top-right */}
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" onClick={(e) => e.stopPropagation()}>
          <HeartButton
            listingId={data.id}
            currentUser={currentUser}
            variant="default"
          />
        </div>
      </div>

      {/* Info */}
      <div className="pt-3 pb-1">
        {/* Category — editorial cursive */}
        {(data as any).category && (
          <p className="text-[11px] text-stone-400 dark:text-zinc-500 leading-none" style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontStyle: 'italic' }}>
            {(data as any).category}
          </p>
        )}

        {/* Title + verified */}
        <h2 className="text-[15px] font-semibold text-neutral-900 dark:text-zinc-100 tracking-[-0.01em] leading-tight line-clamp-2 mt-0.5">
          {data.name}
          {data.isVerified && (
            <span className="inline-flex items-center align-middle ml-1 translate-y-[1px]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="13" height="13" className="shrink-0">
                <path d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z" stroke="#3b82f6" strokeWidth="1.5" fill="#60A5FA" />
                <path d="M9 12.8929L10.8 14.5L15 9.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          )}
        </h2>

        {/* Location */}
        <p className="text-[11px] text-stone-400 dark:text-zinc-500 leading-none mt-1.5">
          {city && state ? `${city}, ${state}` : city || state || 'Location'}
        </p>

        {/* Rating | Followers */}
        <div className="flex items-center text-[11px] text-stone-400 dark:text-zinc-500 leading-none mt-2 tabular-nums">
          <svg width="11" height="11" viewBox="0 0 24 24" className="mr-1 -mt-px flex-shrink-0">
            <defs>
              <linearGradient id="shopStarGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f5c842" />
                <stop offset="100%" stopColor="#d4a017" />
              </linearGradient>
            </defs>
            <path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" fill="url(#shopStarGold)" />
          </svg>
          <span className="text-stone-500 dark:text-zinc-400">{shopRating}</span>
          <span className="mx-1.5 text-stone-300 dark:text-zinc-600">|</span>
          <span>{data.followerCount || data.followers?.length || 0} followers</span>
        </div>
      </div>
    </div>
  );
};

export default ShopCard;
