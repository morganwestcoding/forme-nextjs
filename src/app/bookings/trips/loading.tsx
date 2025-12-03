import PageSkeleton from '@/components/loaders/PageSkeleton';
import Container from '@/components/Container';

export default function Loading() {
  return (
    <Container>
      <PageSkeleton
        title="Trips"
        subtitle="Bookings you've made with other businesses"
      />
    </Container>
  );
}
