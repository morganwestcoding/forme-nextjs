// components/LayoutContent.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface LayoutContentProps {
  children: React.ReactNode;
}

export default function LayoutContent({ children }: LayoutContentProps) {
  const pathname = usePathname();

  // Skip animation for register page (it has its own full-screen layout)
  const isRegisterPage = pathname?.startsWith('/register');

  const [collapsed, setCollapsed] = useState(false);
  // Initialize hasAnimated to true for register page to avoid flash of invisible content
  const [hasAnimated, setHasAnimated] = useState(isRegisterPage ?? false);

  useEffect(() => {
    const check = () => setCollapsed(localStorage.getItem('sidebarCollapsed') === 'true');
    check();
    window.addEventListener('sidebarToggle', check);

    // Only animate once per session (skip for register page)
    if (isRegisterPage) {
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
  }, [isRegisterPage]);

  // For register page, render children directly without animation wrapper
  if (isRegisterPage) {
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
