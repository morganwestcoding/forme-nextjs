// components/LayoutContent.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface LayoutContentProps {
  children: React.ReactNode;
}

export default function LayoutContent({ children }: LayoutContentProps) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const check = () => setCollapsed(localStorage.getItem('sidebarCollapsed') === 'true');
    check();
    window.addEventListener('sidebarToggle', check);
    return () => window.removeEventListener('sidebarToggle', check);
  }, []);

  return (
    <div className={`flex-1 transition-all duration-300 ease-in-out ${collapsed ? 'pl-0' : 'pl-56'}`}>
      <main className="pt-0 pb-8">
        {children}
      </main>
    </div>
  );
}
