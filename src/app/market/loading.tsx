import PageSkeleton from '@/components/loaders/PageSkeleton';
import Container from '@/components/Container';

export default function Loading() {
  return (
    <Container>
      <PageSkeleton
        title="Market"
        subtitle="Discover unique places from our vendors"
      />
    </Container>
  );
}
