import PageSkeleton from '@/components/loaders/PageSkeleton';
import Container from '@/components/Container';

export default function Loading() {
  return (
    <Container>
      <PageSkeleton
        title="Vendors"
        subtitle="Discover unique shops and products from our vendors"
      />
    </Container>
  );
}
