import PageSkeleton from '@/components/loaders/PageSkeleton';
import Container from '@/components/Container';

export default function Loading() {
  return (
    <Container>
      <PageSkeleton
        title="Favorites"
        subtitle="A one stop shop for all of your favorite things"
      />
    </Container>
  );
}
