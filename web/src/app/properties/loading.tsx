import { PageHeaderSkeleton, SectionHeaderSkeleton, CardGridSkeleton } from '@/components/ui/skeleton';

export default function PropertiesLoading() {
  return (
    <div className="pb-20 pt-2 px-4 sm:px-6">
      <PageHeaderSkeleton />
      <div className="mt-8">
        <SectionHeaderSkeleton />
        <CardGridSkeleton count={6} />
      </div>
    </div>
  );
}
