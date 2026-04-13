import { PageHeaderSkeleton, SectionHeaderSkeleton, CardGridSkeleton } from '@/components/ui/skeleton';

export default function FavoritesLoading() {
  return (
    <div className="pb-20 pt-2 px-4 sm:px-6">
      <PageHeaderSkeleton />
      <div className="mt-8">
        <SectionHeaderSkeleton />
        <CardGridSkeleton count={8} />
      </div>
    </div>
  );
}
