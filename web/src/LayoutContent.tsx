// components/LayoutContent.tsx
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import Container from '@/components/Container';
import { SafeUser } from '@/app/types';

interface LayoutContentProps {
  children: React.ReactNode;
  currentUser?: SafeUser | null;
}

// Routes that should have the shared PageHeader rendered above their content.
// Defined here (rather than inside each page) so the header stays mounted
// across navigations within this set — clicking between Home / Settings /
// Bookings / etc. no longer unmounts and re-mounts the header.
const HEADER_ROUTES: Array<{ match: (p: string) => boolean; label?: string }> = [
  { match: (p) => p === '/' },
  { match: (p) => p === '/shops' },
  { match: (p) => p.startsWith('/bookings') },
  { match: (p) => p.startsWith('/settings'), label: 'Settings' },
  { match: (p) => p.startsWith('/messages'), label: 'Messages' },
  { match: (p) => p.startsWith('/favorites'), label: 'Favorites' },
  { match: (p) => p.startsWith('/subscription'), label: 'Subscription' },
  { match: (p) => p.startsWith('/properties'), label: 'My Listings' },
  { match: (p) => p.startsWith('/team'), label: 'Teammate Central' },
  { match: (p) => p.startsWith('/licensing'), label: 'Licensing' },
  { match: (p) => p.startsWith('/analytics'), label: 'Analytics' },
];

export default function LayoutContent({ children, currentUser = null }: LayoutContentProps) {
  const pathname = usePathname();

  // Skip the wrapper for full-screen pages (they have their own layouts)
  const isFullScreenPage =
    pathname?.startsWith('/register') ||
    pathname?.startsWith('/listing/new') ||
    pathname?.startsWith('/reserve') ||
    pathname?.startsWith('/post/new') ||
    pathname?.startsWith('/maps') ||
    pathname?.startsWith('/newsfeed');

  if (isFullScreenPage) {
    return <>{children}</>;
  }

  const matched = pathname ? HEADER_ROUTES.find((r) => r.match(pathname)) : undefined;

  return (
    <div className="flex-1 relative">
      <main className="pt-3 pb-8">
        {matched && (
          <Container>
            <PageHeader currentUser={currentUser} currentPage={matched.label} />
          </Container>
        )}
        {children}
      </main>
    </div>
  );
}
