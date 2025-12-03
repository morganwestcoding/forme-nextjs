import PageSkeleton from '@/components/loaders/PageSkeleton';
import Container from '@/components/Container';

export default function Loading() {
  return (
    <Container>
      <PageSkeleton
        title="Reservations"
        subtitle="Reservations you've received from customers"
      />
    </Container>
  );
}
