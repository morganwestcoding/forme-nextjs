import { PageHeaderSkeleton, SectionHeaderSkeleton, CardGridSkeleton, CategoryRowSkeleton, BannerSkeleton } from '@/components/ui/skeleton';

export default function ShopsLoading() {
  return (
    <div className="pb-20 pt-2">
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

      {/* Featured shops */}
      <div className="mt-2">
        <SectionHeaderSkeleton />
        <CardGridSkeleton count={6} columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" />
      </div>

      {/* Featured products */}
      <div className="mt-6">
        <SectionHeaderSkeleton />
        <CardGridSkeleton count={10} columns="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" />
      </div>
    </div>
  );
}
