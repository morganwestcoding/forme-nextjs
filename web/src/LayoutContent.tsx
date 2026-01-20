// components/LayoutContent.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface LayoutContentProps {
  children: React.ReactNode;
}

export default function LayoutContent({ children }: LayoutContentProps) {
  const pathname = usePathname();

  // Skip animation for full-screen pages (they have their own layouts)
  const isFullScreenPage = pathname?.startsWith('/register') || pathname?.startsWith('/listing/new') || pathname?.startsWith('/reserve') || pathname?.startsWith('/post/new');

  const [collapsed, setCollapsed] = useState(false);
  // Initialize hasAnimated to true for full-screen pages to avoid flash of invisible content
  const [hasAnimated, setHasAnimated] = useState(isFullScreenPage ?? false);

  useEffect(() => {
    const check = () => setCollapsed(localStorage.getItem('sidebarCollapsed') === 'true');
    check();
    window.addEventListener('sidebarToggle', check);

    // Only animate once per session (skip for full-screen pages)
    if (isFullScreenPage) {
      setHasAnimated(true);
    } else {
      const animated = sessionStorage.getItem('contentAnimated');
      if (!animated) {
        sessionStorage.setItem('contentAnimated', 'true');
        setTimeout(() => setHasAnimated(true), 100);
      } else {
        setHasAnimated(true);
      }
    }

    return () => {
      window.removeEventListener('sidebarToggle', check);
    };
  }, [isFullScreenPage]);

  // For full-screen pages, render children directly without animation wrapper
  if (isFullScreenPage) {
    return <>{children}</>;
  }

  return (
    <div className={`flex-1 transition-all duration-300 ease-in-out ${collapsed ? 'pl-16' : 'pl-56'}`}>
      <main
        className="pt-3 pb-8"
        style={{
          opacity: hasAnimated ? 1 : 0,
          transform: hasAnimated ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.6s ease-out 0.1s, transform 0.6s ease-out 0.1s'
        }}
      >
        {children}
      </main>
    </div>
  );
}
