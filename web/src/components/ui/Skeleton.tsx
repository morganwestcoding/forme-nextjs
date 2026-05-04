import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const ROUNDED: Record<NonNullable<SkeletonProps['rounded']>, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

const Skeleton: React.FC<SkeletonProps> = ({
  rounded = 'md',
  className = '',
  ...rest
}) => {
  return (
    <div
      aria-hidden
      className={`animate-pulse bg-stone-200/60 dark:bg-stone-800/60 ${ROUNDED[rounded]} ${className}`}
      {...rest}
    />
  );
};

/**
 * Matches the real PageHeader: outer -mx-6 md:-mx-24 -mt-2 md:-mt-8
 * Inner px-6 md:px-24 pt-8.
 * Row 1: 48x48 logo + mr-4 + flex-1 max-w-xl rounded-full search pill + 4x (w-12 h-12 rounded-full) icon buttons.
 * Row 2: nav row with 6 text pills separated visually by "/" (mt-4, paddingLeft: calc(72px + 1rem + 1.25rem)).
 */
export const PageHeaderSkeleton: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => (
  <div className={embedded ? '' : '-mx-6 md:-mx-24 -mt-2 md:-mt-8'}>
    <div className={embedded ? 'relative pt-4' : 'relative px-6 md:px-24 pt-8'}>
      <div className="flex items-center gap-3 w-full">
        <Skeleton rounded="full" className="h-12 w-12 shrink-0 mr-4" />
        <div className="flex-1 max-w-xl">
          <Skeleton rounded="xl" className="h-12 w-full" />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Skeleton rounded="full" className="h-12 w-12 shrink-0" />
          <Skeleton rounded="full" className="h-12 w-12 shrink-0" />
          <Skeleton rounded="full" className="h-12 w-12 shrink-0" />
          <Skeleton rounded="full" className="h-12 w-12 shrink-0 ml-1" />
        </div>
      </div>
      <div
        className="flex items-center gap-3 mt-4"
        style={{ paddingLeft: 'calc(72px + 1rem + 1.25rem)' }}
      >
        {['h-4 w-10', 'h-4 w-16', 'h-4 w-10', 'h-4 w-12', 'h-4 w-16', 'h-4 w-14'].map((cls, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="text-stone-300 dark:text-stone-600 text-sm">/</span>}
            <Skeleton className={cls} />
          </React.Fragment>
        ))}
      </div>
    </div>
  </div>
);

export const ContainerSkeleton: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-16 mx-auto mt-4 sm:mt-6 lg:mt-8">
    {children}
  </div>
);

/**
 * Horizontal-layout ListingCard skeleton (default variant).
 * Real card: rounded-2xl p-3 -mx-3 flex gap-4, 120x120 image, text column.
 */
export const ListingCardSkeleton: React.FC = () => (
  <div className="rounded-2xl p-3 -mx-3 flex flex-row gap-4">
    <Skeleton rounded="xl" className="w-[120px] h-[120px] shrink-0" />
    <div className="flex flex-col justify-center min-w-0 flex-1">
      <Skeleton className="h-3 w-20 mb-1.5" />
      <Skeleton className="h-4 w-3/4 mb-1" />
      <Skeleton className="h-4 w-1/2 mb-2" />
      <Skeleton className="h-3 w-24 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  </div>
);

/**
 * ShopCard skeleton — flex row: 120x120 image + 3 text lines, then 4 product thumbs below.
 */
export const ShopCardSkeleton: React.FC = () => (
  <div>
    <div className="flex flex-row gap-3">
      <Skeleton rounded="xl" className="w-[120px] h-[120px] shrink-0" />
      <div className="flex flex-col justify-center min-w-0">
        <Skeleton className="h-4 w-36 mb-2" />
        <Skeleton className="h-3 w-24 mb-2" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
    <div className="flex items-center gap-1.5 mt-2.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} rounded="xl" className="w-9 h-9 shrink-0" />
      ))}
    </div>
  </div>
);

/**
 * ProductCard skeleton — aspect-[5/6] image + 2 text rows.
 */
export const ProductCardSkeleton: React.FC = () => (
  <div>
    <Skeleton rounded="xl" className="w-full aspect-[5/6]" />
    <Skeleton className="h-3 w-16 mt-2" />
    <Skeleton className="h-4 w-3/4 mt-1.5" />
    <Skeleton className="h-3 w-1/2 mt-1.5" />
  </div>
);

/**
 * PostCard grid-square skeleton (used in mosaic rails/post feeds).
 */
export const PostCardSquareSkeleton: React.FC<{ className?: string }> = ({ className = 'aspect-square' }) => (
  <Skeleton rounded="none" className={`w-full ${className}`} />
);

/**
 * ServiceCard / WorkerCard / ListingCard "compact + solidBackground" skeleton.
 * Used on listing detail + profile detail inside the right-column grids.
 * Real card is h-[180px] rounded-xl with category label, title, bottom rating.
 */
export const CompactCardSkeleton: React.FC = () => (
  <div className="rounded-xl border border-stone-200/80 dark:border-stone-700 bg-gradient-to-br from-white to-stone-50/80 dark:from-stone-900 dark:to-stone-900 h-[180px] p-5 flex flex-col">
    <Skeleton className="h-3 w-16 mb-2" />
    <Skeleton className="h-4 w-3/4 mb-1" />
    <Skeleton className="h-4 w-1/2" />
    <div className="flex-1" />
    <div className="flex items-end justify-between">
      <Skeleton className="h-7 w-12" />
      <Skeleton rounded="full" className="h-5 w-5" />
    </div>
  </div>
);

/**
 * ReviewCard skeleton — avatar + name + rating row, then content paragraph.
 */
export const ReviewCardSkeleton: React.FC = () => (
  <div className="p-5 rounded-2xl border border-stone-200/60 dark:border-stone-800">
    <div className="flex items-center gap-3 mb-3">
      <Skeleton rounded="full" className="h-10 w-10 shrink-0" />
      <div className="flex-1 min-w-0">
        <Skeleton className="h-4 w-28 mb-1.5" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
    <div className="flex gap-1 mb-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-3.5 w-3.5" />
      ))}
    </div>
    <Skeleton className="h-3 w-full mb-2" />
    <Skeleton className="h-3 w-full mb-2" />
    <Skeleton className="h-3 w-3/4" />
  </div>
);

/**
 * SectionHeader skeleton — heading + "View all" link on right.
 */
export const SectionHeaderSkeleton: React.FC<{ widthClass?: string }> = ({ widthClass = 'w-56' }) => (
  <div className="flex items-center justify-between mb-5">
    <div>
      <Skeleton className={`h-7 ${widthClass} mb-2`} />
      <Skeleton className="h-3 w-40" />
    </div>
    <div className="flex items-center gap-2">
      <Skeleton rounded="full" className="h-9 w-9" />
      <Skeleton rounded="full" className="h-9 w-9" />
      <Skeleton className="h-4 w-16" />
    </div>
  </div>
);

export default Skeleton;
