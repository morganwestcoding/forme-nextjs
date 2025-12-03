import PageSkeleton from '@/components/loaders/PageSkeleton';
import Container from '@/components/Container';

export default function Loading() {
  return (
    <Container>
      <PageSkeleton
        title="Discover"
        subtitle="Share what's new with you and your business"
      />
    </Container>
  );
}
