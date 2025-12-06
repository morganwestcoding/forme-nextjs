import PageSkeleton from '@/components/loaders/PageSkeleton';
import Container from '@/components/Container';

export default function Loading() {
  return (
    <Container>
      <PageSkeleton
        title="Shops"
        subtitle="Discover unique shops and products"
      />
    </Container>
  );
}
