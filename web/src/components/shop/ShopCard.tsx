'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SafeShop, SafeUser } from '@/app/types';
import { placeholderDataUri } from '@/lib/placeholders';

interface ShopCardProps {
  data: SafeShop;
  currentUser?: SafeUser | null;
}

const SAMPLE_OWNER_NAMES = new Set(['Jordan Riley', 'Maya Vega', 'Kai Chen']);

const ShopCard: React.FC<ShopCardProps> = ({ data }) => {
  const router = useRouter();
  const [city, state] = data.location?.split(',').map((s) => s.trim()) || [];
  const shopRating = Number(data.rating ?? 5.0).toFixed(1);
  const cardImage = data.coverImage || data.logo || placeholderDataUri(data.name || 'Shop');
  const products = data.products?.slice(0, 4) || [];
  const isSample = !!data.user?.name && SAMPLE_OWNER_NAMES.has(data.user.name);

  return (
    <div
      onClick={() => { if (/^[a-f\d]{24}$/i.test(data.id)) router.push(`/shops/${data.id}`); }}
      className="group cursor-pointer"
    >
      {/* Top row: image + info side by side */}
      <div className="flex flex-row gap-3">
        {/* Square image */}
        <div className="relative overflow-hidden rounded-xl flex-shrink-0 w-[120px] h-[120px] shadow-elevation-1">
          <Image
            src={cardImage}
            alt={data.name}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            sizes="120px"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center min-w-0">
          {/* Category — editorial cursive */}
          {(data.category || isSample) && (
            <p className="text-[11px] text-stone-400 dark:text-stone-400 leading-none" style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontStyle: 'italic' }}>
              {data.category}
              {isSample && <span className="text-amber-600 dark:text-amber-500">{data.category ? ' · sample' : 'sample'}</span>}
            </p>
          )}
          <h2 className="text-[15px] font-semibold text-stone-900 dark:text-stone-100   tracking-[-0.01em] leading-tight truncate mt-1.5">
            {data.name}
          </h2>
          <p className="text-[11px] text-stone-400   dark:text-stone-400          leading-none mt-1">
            {city && state ? `${city}, ${state}` : city || state || 'Location'}
          </p>
          <div className="flex items-center text-[11px] text-stone-400   dark:text-stone-400          leading-none mt-1.5 tabular-nums">
            <svg width="11" height="11" viewBox="0 0 24 24" className="mr-1 -mt-px flex-shrink-0">
              <defs>
                <linearGradient id={`shopStar-${data.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f5c842" />
                  <stop offset="100%" stopColor="#d4a017" />
                </linearGradient>
              </defs>
              <path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" fill={`url(#shopStar-${data.id})`} />
            </svg>
            <span className="text-stone-500  dark:text-stone-500          ">{shopRating}</span>
          </div>
        </div>
      </div>

      {/* 4 product circles below — same height as category buttons (h-9 = 36px) */}
      <div className="flex items-center gap-1.5 mt-2.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="relative w-9 h-9 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 flex-shrink-0">
            {products[i] ? (
              <Image
                src={products[i].image || placeholderDataUri(products[i].name || 'Product')}
                alt={products[i].name || ''}
                fill
                className="object-cover"
                sizes="36px"
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopCard;
