import React from 'react';
import Container from '@/components/Container';
import ClientOnly from '@/components/ClientOnly';
import BookingsHeader from './BookingsHeader';

export default function BookingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientOnly>
      <Container>
        <BookingsHeader
          // optionally pass counts or handlers:
          // bookingsCount={receivedCount}
          // tripsCount={tripsCount}
          // onSearch={(q) => console.log('search:', q)}
          // onOpenFilters={() => console.log('filters')}
          // onCreate={() => console.log('create')}
        />
        {children}
      </Container>
    </ClientOnly>
  );
}
