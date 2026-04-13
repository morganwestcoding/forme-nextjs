import Skeleton, { PageHeaderSkeleton } from '@/components/ui/skeleton';

export default function MessagesLoading() {
  return (
    <div className="pb-20 pt-2 px-4 sm:px-6">
      <PageHeaderSkeleton />
      <div className="mt-8">
        <Skeleton className="h-7 w-32 mb-6" />
        <div className="flex border border-stone-200 rounded-2xl overflow-hidden" style={{ height: 'calc(100vh - 220px)' }}>
          <div className="w-[340px] border-r border-stone-200 p-4 space-y-4">
            <Skeleton className="h-10 w-full rounded-xl" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-11 h-11 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex-1" />
        </div>
      </div>
    </div>
  );
}
