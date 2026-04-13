import { PageHeaderSkeleton, SectionHeaderSkeleton, CardGridSkeleton, CategoryRowSkeleton, BannerSkeleton } from '@/components/ui/skeleton';

export default function HomeLoading() {
  return (
    <div className="pb-20 pt-2 px-4 sm:px-6">
      <PageHeaderSkeleton />

      {/* Banner */}
      <div className="mt-8">
        <BannerSkeleton />
      </div>

      {/* Category row */}
      <div className="mt-6">
        <SectionHeaderSkeleton />
        <CategoryRowSkeleton />
      </div>

      {/* Post feed */}
      <div className="mt-6">
        <SectionHeaderSkeleton />
        <CardGridSkeleton count={8} />
      </div>
    </div>
  );
}
