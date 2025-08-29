// components/inputs/ServiceCard.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SafeListing, SafeUser } from '@/app/types';
import useReservationModal from '@/app/hooks/useReservationModal';
import useLoginModal from '@/app/hooks/useLoginModal';

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

/* ---------- Category → SVG icon ---------- */
function CategoryIcon({
  category,
  className = 'w-6 h-6',
}: {
  category?: string;
  className?: string;
}) {
  const stroke = 'currentColor';
  const sw = 1.6;

  switch ((category || '').toLowerCase()) {
    case 'spa':
    case 'wellness':
      return (
       
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none">
    <path d="M9.0923 16C8.78292 16.6819 8.0701 16.986 7.43887 17.3162L3.79262 19.2233C2.32845 19.9891 3.05949 22 4.62985 22C8.12204 22 10.8836 20.3064 14.0404 19C14.835 18.6711 15.2201 18.7415 16 19.0912" stroke="#141B34" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M9 19.0912C9.77995 18.7415 10.165 18.6711 10.9596 19C14.1164 20.3064 16.878 22 20.3702 22C21.9405 22 22.6715 19.9891 21.2074 19.2233L17.5611 17.3162C16.9299 16.986 16.2171 16.6819 15.9077 16" stroke="#141B34" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M10 4C10 5.10457 10.8954 6 12 6C13.1046 6 14 5.10457 14 4C14 2.89543 13.1046 2 12 2C10.8954 2 10 2.89543 10 4Z" stroke="#141B34" stroke-width="1.5" />
    <path d="M12 8C8.68629 8 6 10.6863 6 14C9.31371 14 12 11.3137 12 8Z" stroke="#141B34" stroke-width="1.5" stroke-linejoin="round" />
    <path d="M12 8C15.3137 8 18 10.6863 18 14C14.6863 14 12 11.3137 12 8Z" stroke="#141B34" stroke-width="1.5" stroke-linejoin="round" />
</svg>
      );
    case 'beauty':
    case 'nails':
      return (
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none">
    <path d="M4 14.0695C5.0145 14.0695 6.43122 13.7685 7.31944 14.4193L9.08188 15.7108C9.73667 16.1906 10.4458 16.0325 11.1765 15.9178C12.1389 15.7667 13 16.5875 13 17.6562C13 17.9482 10.9272 18.6905 10.6276 18.8316C10.0391 19.1088 9.36297 19.0406 8.83021 18.6502L6.84211 17.1934" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M13 17L17.091 15.1096C17.8244 14.854 18.6331 15.0535 19.1797 15.625L19.8505 16.3262C20.0902 16.5768 20.0338 16.9976 19.7375 17.1697L11.8829 21.7315C11.4097 22.0063 10.8514 22.0734 10.3309 21.9179L4 20.0269" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M12.0019 12C12.0019 12 14.1019 9.76142 14.1019 7C14.1019 4.23858 12.0019 2 12.0019 2C12.0019 2 9.9019 4.23858 9.9019 7C9.9019 9.76142 12.0019 12 12.0019 12ZM12.0019 12C12.0019 12 15.0689 11.9316 17.0019 9.95918C18.9349 7.98674 19.0019 4.85714 19.0019 4.85714C19.0019 4.85714 17.7324 4.88544 16.3122 5.43087M12.0019 12C12.0019 12 8.9349 11.9316 7.0019 9.95918C5.0689 7.98674 5.0019 4.85714 5.0019 4.85714C5.0019 4.85714 6.27135 4.88544 7.69157 5.43087" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>

        </svg>
      );
    case 'barber':
      return (
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none">
    <path d="M4 14.0695C5.0145 14.0695 6.43122 13.7685 7.31944 14.4193L9.08188 15.7108C9.73667 16.1906 10.4458 16.0325 11.1765 15.9178C12.1389 15.7667 13 16.5875 13 17.6562C13 17.9482 10.9272 18.6905 10.6276 18.8316C10.0391 19.1088 9.36297 19.0406 8.83021 18.6502L6.84211 17.1934" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M13 17L17.091 15.1096C17.8244 14.854 18.6331 15.0535 19.1797 15.625L19.8505 16.3262C20.0902 16.5768 20.0338 16.9976 19.7375 17.1697L11.8829 21.7315C11.4097 22.0063 10.8514 22.0734 10.3309 21.9179L4 20.0269" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M12.0019 12C12.0019 12 14.1019 9.76142 14.1019 7C14.1019 4.23858 12.0019 2 12.0019 2C12.0019 2 9.9019 4.23858 9.9019 7C9.9019 9.76142 12.0019 12 12.0019 12ZM12.0019 12C12.0019 12 15.0689 11.9316 17.0019 9.95918C18.9349 7.98674 19.0019 4.85714 19.0019 4.85714C19.0019 4.85714 17.7324 4.88544 16.3122 5.43087M12.0019 12C12.0019 12 8.9349 11.9316 7.0019 9.95918C5.0689 7.98674 5.0019 4.85714 5.0019 4.85714C5.0019 4.85714 6.27135 4.88544 7.69157 5.43087" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>

        </svg>
      );
    case 'fitness':
      return (
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none">
    <path d="M16 5.5C16 6.32843 15.3284 7 14.5 7C13.6716 7 13 6.32843 13 5.5C13 4.67157 13.6716 4 14.5 4C15.3284 4 16 4.67157 16 5.5Z" stroke="currentColor" stroke-width="1.5"></path>
    <path d="M14.3602 15L15.3039 14.454C16.3786 13.8323 16.9159 13.5214 16.9885 13.0784C16.9999 13.0092 17.0028 12.9391 16.9973 12.8694C16.9622 12.4229 16.4524 12.0789 15.4329 11.3907L10.7259 8.21359C8.87718 6.96577 8.45184 4.69114 9.75097 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M10.7259 8.21359C8.22588 10.7136 7 17.6324 7 21.0003M10.7259 8.21359C8.87718 6.96577 8.45184 4.69114 9.75097 3M10.7259 8.21359L13.3725 10M14.3602 15L15.3039 14.454C16.3786 13.8323 16.9159 13.5214 16.9885 13.0784C16.9999 13.0092 17.0028 12.9391 16.9973 12.8694C16.9622 12.4229 16.4524 12.0789 15.4329 11.3907L13.3725 10M15.0002 21.0003C14.0268 19.8647 13.0257 18.3 12.0502 16.8578C11.3666 15.8474 11.0249 15.3422 10.9845 14.8132M13.3725 10C12.5697 11.0391 12.0164 12.0207 11.6026 12.8942C11.1636 13.8209 10.9441 14.2843 10.9845 14.8132M10.9845 14.8132L8 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
</svg>
      );
    case 'salon':
      return (
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none">
    <path d="M4 14.0695C5.0145 14.0695 6.43122 13.7685 7.31944 14.4193L9.08188 15.7108C9.73667 16.1906 10.4458 16.0325 11.1765 15.9178C12.1389 15.7667 13 16.5875 13 17.6562C13 17.9482 10.9272 18.6905 10.6276 18.8316C10.0391 19.1088 9.36297 19.0406 8.83021 18.6502L6.84211 17.1934" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M13 17L17.091 15.1096C17.8244 14.854 18.6331 15.0535 19.1797 15.625L19.8505 16.3262C20.0902 16.5768 20.0338 16.9976 19.7375 17.1697L11.8829 21.7315C11.4097 22.0063 10.8514 22.0734 10.3309 21.9179L4 20.0269" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M12.0019 12C12.0019 12 14.1019 9.76142 14.1019 7C14.1019 4.23858 12.0019 2 12.0019 2C12.0019 2 9.9019 4.23858 9.9019 7C9.9019 9.76142 12.0019 12 12.0019 12ZM12.0019 12C12.0019 12 15.0689 11.9316 17.0019 9.95918C18.9349 7.98674 19.0019 4.85714 19.0019 4.85714C19.0019 4.85714 17.7324 4.88544 16.3122 5.43087M12.0019 12C12.0019 12 8.9349 11.9316 7.0019 9.95918C5.0689 7.98674 5.0019 4.85714 5.0019 4.85714C5.0019 4.85714 6.27135 4.88544 7.69157 5.43087" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>

        </svg>
      );
    default:
      return (
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none">
    <path d="M4 14.0695C5.0145 14.0695 6.43122 13.7685 7.31944 14.4193L9.08188 15.7108C9.73667 16.1906 10.4458 16.0325 11.1765 15.9178C12.1389 15.7667 13 16.5875 13 17.6562C13 17.9482 10.9272 18.6905 10.6276 18.8316C10.0391 19.1088 9.36297 19.0406 8.83021 18.6502L6.84211 17.1934" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M13 17L17.091 15.1096C17.8244 14.854 18.6331 15.0535 19.1797 15.625L19.8505 16.3262C20.0902 16.5768 20.0338 16.9976 19.7375 17.1697L11.8829 21.7315C11.4097 22.0063 10.8514 22.0734 10.3309 21.9179L4 20.0269" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M12.0019 12C12.0019 12 14.1019 9.76142 14.1019 7C14.1019 4.23858 12.0019 2 12.0019 2C12.0019 2 9.9019 4.23858 9.9019 7C9.9019 9.76142 12.0019 12 12.0019 12ZM12.0019 12C12.0019 12 15.0689 11.9316 17.0019 9.95918C18.9349 7.98674 19.0019 4.85714 19.0019 4.85714C19.0019 4.85714 17.7324 4.88544 16.3122 5.43087M12.0019 12C12.0019 12 8.9349 11.9316 7.0019 9.95918C5.0689 7.98674 5.0019 4.85714 5.0019 4.85714C5.0019 4.85714 6.27135 4.88544 7.69157 5.43087" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>

        </svg>
      );
  }
}
/* ----------------------------------------- */

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
  const reservationModal = useReservationModal();
  const loginModal = useLoginModal();

  const isOwner =
    !!currentUser?.id && !!listing?.user?.id && currentUser.id === listing.user.id;

  // Default click: open reservation modal with this service preselected
  const handleActivate = () => {
    if (disabled) return;
    if (onClick) { onClick(); return; }
    if (!listing) return;
    if (!currentUser) { loginModal.onOpen(); return; }
    reservationModal.onOpen(listing, currentUser, service.id);
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
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleActivate(); }
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
        'flex flex-col items-stretch',
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
            {/* edit icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M16.425 4.605L17.415 3.615c.82-.82 2.149-.82 2.97 0 .82.82.82 2.15 0 2.97l-0.99.99M16.425 4.605L9.766 11.264c-.508.508-.868 1.144-1.042 1.84L8 16l2.896-.724c.696-.174 1.332-.534 1.84-1.041l6.659-6.66M16.425 4.605l2.97 2.97" stroke="currentColor" strokeWidth="1.5" />
              <path d="M19 13.5c0 3.288 0 4.931-0.908 6.038-.166.203-.352.389-.555.555C16.431 21 14.787 21 11.5 21H11c-3.771 0-5.657 0-6.828-1.172C3 18.657 3 16.771 3 13.5V13c0-3.287 0-4.931.908-6.038.166-.202.352-.388.555-.555C5.569 5.5 7.213 5.5 10.5 5.5" stroke="currentColor" strokeWidth="1.5" />
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

      {/* LEFT-ALIGNED CONTENT */}
      <div className="flex-1 flex items-center justify-start gap-4">
        {/* Bigger rounded-xl icon square pinned left */}
        <div
          className={[
            'w-20 h-20 rounded-xl',
            selected ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600',
            'flex items-center justify-center',
            'transition-transform group-hover:scale-[1.03]',
            'shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]',
            'flex-shrink-0',
          ].join(' ')}
          aria-hidden="true"
        >
          <CategoryIcon category={service.category} className="w-6 h-6" />
        </div>

        {/* Text stack */}
        <div className="flex flex-col items-start text-left">
          {/* Price pill */}
          <span
            className={[
              'inline-flex items-center px-3.5 py-1 rounded-lg text-[11px] font-medium',
              'bg-green-50 text-[#10B981] border border-[#10B981]',
              'transition-transform group-hover:scale-[1.03]',
            ].join(' ')}
          >
            {priceLabel}
          </span>

          <div className="mt-1">
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
