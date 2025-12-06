import PageSkeleton from '@/components/loaders/PageSkeleton';
import Container from '@/components/Container';

export default function Loading() {
  return (
    <Container>
      <PageSkeleton
        title="Businesses"
        subtitle="Discover unique places from our businesses"
      />
    </Container>
  );
}
