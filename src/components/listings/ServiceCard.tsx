// components/inputs/ServiceCard.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SafeListing, SafeUser } from '@/app/types';

interface ServiceItem {
  id: string;
  serviceName: string;
  price: number;
  category: string;
  imageSrc?: string | null;
  description?: string;
  popular?: boolean;
  isNew?: boolean;
  unit?: string; // "60 min", "session", etc.
}

interface ServiceCardProps {
  service: ServiceItem;
  listing?: (SafeListing & { user: SafeUser }) | null;
  currentUser?: SafeUser | null;
  onClick?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  selected?: boolean;
  disabled?: boolean;
  storeHours?: any[];
}

const formatPrice = (n: number) =>
  Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  listing,
  currentUser,
  onClick,
  onEdit,
  onDuplicate,
  selected = false,
  disabled = false,
}) => {
  const router = useRouter();
  const isOwner =
    !!currentUser?.id && !!listing?.user?.id && currentUser.id === listing.user.id;

  const handleActivate = () => {
    if (disabled) return;
    onClick?.();
  };

  const goToEditThisService = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (onEdit) return onEdit();
    if (!service.id) return;
    const params = new URLSearchParams(window.location.search);
    params.set('editServiceId', service.id);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleDuplicate = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    onDuplicate?.();
  };

  const priceNum = Number(service.price ?? 0);
  const priceLabel = service.unit
    ? `${formatPrice(priceNum)} / ${service.unit}`
    : formatPrice(priceNum);

  const aria = `${service.serviceName || 'Service'} — ${priceLabel}`;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={aria}
      onClick={handleActivate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleActivate();
        }
      }}
      className={[
        'group relative w-full',
        'rounded-2xl border bg-white p-5',
        'transition-all duration-200',
        disabled
          ? 'opacity-60 cursor-not-allowed'
          : 'cursor-pointer hover:shadow-md hover:border-blue-300',
        selected
          ? 'ring-2 ring-blue-500/40 border-blue-300 bg-blue-50/30'
          : 'border-gray-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
        'h-[130px]',
        'flex flex-col items-stretch text-center',
      ].join(' ')}
    >
      {(service.popular || service.isNew) && (
        <div className="absolute left-3 top-3 flex items-center gap-1">
          {service.popular && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-amber-50 text-amber-700 border border-amber-100">
              Popular
            </span>
          )}
          {service.isNew && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
              New
            </span>
          )}
        </div>
      )}

      {(isOwner || onEdit || onDuplicate) && (
        <div className="absolute right-4 top-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
          <div
            role="button"
            tabIndex={0}
            aria-label={`Edit ${service.serviceName || 'service'}`}
            onClick={goToEditThisService}
            onKeyDown={(e) => e.key === 'Enter' && goToEditThisService(e)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border bg-white text-neutral-700 hover:bg-neutral-50 hover:border-gray-300 shadow-sm"
          >
            {/* small edit icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M16.4249 4.60509L17.4149 3.6151C18.2351 2.79497 19.5648 2.79497 20.3849 3.6151C21.205 4.43524 21.205 5.76493 20.3849 6.58507L19.3949 7.57506M16.4249 4.60509L9.76558 11.2644C9.25807 11.772 8.89804 12.4078 8.72397 13.1041L8 16L10.8959 15.276C11.5922 15.102 12.228 14.7419 12.7356 14.2344L19.3949 7.57506M16.4249 4.60509L19.3949 7.57506" stroke="currentColor" strokeWidth="1.5"></path>
              <path d="M18.9999 13.5C18.9999 16.7875 18.9999 18.4312 18.092 19.5376C17.9258 19.7401 17.7401 19.9258 17.5375 20.092C16.4312 21 14.7874 21 11.4999 21H11C7.22876 21 5.34316 21 4.17159 19.8284C3.00003 18.6569 3 16.7712 3 13V12.5C3 9.21252 3 7.56879 3.90794 6.46244C4.07417 6.2599 4.2599 6.07417 4.46244 5.90794C5.56879 5 7.21252 5 10.5 5" stroke="currentColor" strokeWidth="1.5"></path>
            </svg>
          </div>

          {onDuplicate && (
            <div
              role="button"
              tabIndex={0}
              aria-label={`Duplicate ${service.serviceName || 'service'}`}
              onClick={handleDuplicate}
              onKeyDown={(e) => e.key === 'Enter' && handleDuplicate(e)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border bg-white text-neutral-700 hover:bg-neutral-50 hover:border-gray-300 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M8 8.5C8 7.12 9.12 6 10.5 6H16.5C17.88 6 19 7.12 19 8.5V14.5C19 15.88 17.88 17 16.5 17H10.5C9.12 17 8 15.88 8 14.5V8.5Z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M6 10.5V15.5C6 17.985 8.015 20 10.5 20H15.5" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
          )}
        </div>
      )}

      {/* Centered content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-2">
        {/* Price pill (green) */}
        <div>
          <span
            className={[
              'inline-flex items-center px-4 py-1.5 rounded-lg text-xs font-medium',
              'bg-green-50 text-[#10B981] border border-[#10B981]',
              'transition-transform group-hover:scale-[1.03]',
            ].join(' ')}
            aria-hidden="true"
          >
            {priceLabel}
          </span>
        </div>

        {/* Name → category */}
        <div className="flex flex-col items-center">
          <div className="text-sm font-semibold text-gray-900 leading-snug truncate max-w-[16rem]">
            {service.serviceName || 'Untitled Service'}
          </div>

          {service.category && (
            <div className="text-[11px] text-gray-500 mt-0.5 truncate max-w-[16rem]">
              {service.category}
            </div>
          )}
        </div>
      </div>

      {service.description && (
        <div className="hidden group-hover:block text-[11px] text-gray-500 mt-2 truncate">
          {service.description}
        </div>
      )}
    </div>
  );
};

export default ServiceCard;
