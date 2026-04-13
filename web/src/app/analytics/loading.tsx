import { PageHeaderSkeleton, StatGridSkeleton, SectionHeaderSkeleton, CardGridSkeleton } from '@/components/ui/skeleton';

export default function AnalyticsLoading() {
  return (
    <div className="pb-20 pt-2 px-4 sm:px-6">
      <PageHeaderSkeleton />
      <div className="mt-8">
        <StatGridSkeleton count={4} />
      </div>
      <div className="mt-8">
        <SectionHeaderSkeleton />
        <CardGridSkeleton count={4} columns="grid-cols-1 sm:grid-cols-2" />
      </div>
    </div>
  );
}
