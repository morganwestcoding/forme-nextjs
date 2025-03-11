import React from 'react';
import BookingTabs from '@/components/BookinTabs';
import Container from '@/components/Container';
import ClientOnly from '@/components/ClientOnly';

export default function BookingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientOnly>
      <Container>
        <BookingTabs />
        {children}
      </Container>
    </ClientOnly>
  );
}