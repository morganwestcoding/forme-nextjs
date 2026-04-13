import Skeleton, { PageHeaderSkeleton, CardGridSkeleton } from '@/components/ui/skeleton';

export default function BookingsLoading() {
  return (
    <div className="pb-20 pt-2 px-4 sm:px-6">
      <PageHeaderSkeleton />
      <div className="mt-8">
        {/* Title */}
        <Skeleton className="h-7 w-32 mb-2" />
        <Skeleton className="h-4 w-24 mb-8" />

        {/* Tab bar */}
        <div className="flex items-center gap-2 mb-8">
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
          <div className="w-px h-6 bg-stone-200 mx-4" />
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-20 rounded-full" />
        </div>

        <CardGridSkeleton count={6} />
      </div>
    </div>
  );
}
