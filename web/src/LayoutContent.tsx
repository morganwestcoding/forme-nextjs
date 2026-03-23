// components/LayoutContent.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface LayoutContentProps {
  children: React.ReactNode;
}

export default function LayoutContent({ children }: LayoutContentProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Skip animation for full-screen pages (they have their own layouts)
  const isFullScreenPage = pathname?.startsWith('/register') || pathname?.startsWith('/listing/new') || pathname?.startsWith('/reserve') || pathname?.startsWith('/post/new') || pathname?.startsWith('/maps') || pathname?.startsWith('/newsfeed');

  const hideLogoOnPage = pathname?.startsWith('/profile') || pathname?.startsWith('/listings') || pathname?.startsWith('/listing/') || pathname?.startsWith('/shop/') || pathname?.startsWith('/shops/');

  const [collapsed, setCollapsed] = useState(false);
  const [fadeKey, setFadeKey] = useState(0);
  const [visible, setVisible] = useState(false);
  const isFadingOut = useRef(false);

  useEffect(() => {
    const check = () => setCollapsed(localStorage.getItem('sidebarCollapsed') === 'true');
    check();
    window.addEventListener('sidebarToggle', check);
    return () => window.removeEventListener('sidebarToggle', check);
  }, []);

  // Fade in on every non-fullscreen navigation
  useEffect(() => {
    if (isFullScreenPage) {
      // Reset so next non-fullscreen page starts invisible
      setVisible(false);
      return;
    }
    isFadingOut.current = false;
    setVisible(false);
    setFadeKey((k) => k + 1);
    // Double rAF to guarantee browser paints at opacity 0 before transitioning
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setVisible(true);
      });
    });
  }, [pathname, isFullScreenPage]);

  // Intercept internal link clicks to fade out before navigating
  useEffect(() => {
    if (isFullScreenPage) return;

    const handleClick = (e: MouseEvent) => {
      // Find the closest <a> tag
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) return;

      // Don't intercept if already fading out or same page
      if (isFadingOut.current || href === pathname) return;

      e.preventDefault();
      isFadingOut.current = true;
      setVisible(false);

      // Shorter fade for full-screen destinations since they handle their own entrance
      const isFullScreenDest = href.startsWith('/register') || href.startsWith('/listing/new') || href.startsWith('/reserve') || href.startsWith('/post/new') || href.startsWith('/maps') || href.startsWith('/newsfeed');

      setTimeout(() => {
        router.push(href);
      }, 400);
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [isFullScreenPage, pathname, router]);

  // For full-screen pages, render children directly without animation wrapper
  if (isFullScreenPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex-1 relative">
      {/* Persistent logo — fades with content on navigation */}
      <div className="absolute z-[70] pointer-events-none" style={{ top: '14px', left: 0, right: 0, opacity: (visible && !hideLogoOnPage) ? 1 : 0, transition: 'opacity 0.4s ease-out' }}>
        <div className="px-4 sm:px-6 lg:px-8 xl:px-16 mt-4 sm:mt-6 lg:mt-8">
          <div className="-mx-6 md:-mx-24 -mt-2 md:-mt-8">
            <div className="px-6 md:px-24 pt-8">
              <Link href="/" className="pointer-events-auto inline-block">
                <Image src="/logos/fm-logo.png" alt="Logo" width={72} height={46} className="opacity-90 hover:opacity-100 transition-opacity duration-200" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main
        key={fadeKey}
        className="pt-3 pb-8"
        style={{
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.4s ease-out',
        }}
      >
        {children}
      </main>
    </div>
  );
}
