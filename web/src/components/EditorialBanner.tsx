'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export interface BannerItem {
  src: string;
  alt: string;
  tag: string;
  title: string;
  subtitle: string;
  href: string;
}

interface EditorialBannerProps {
  banners: BannerItem[];
  /** Container id for walkthrough/highlight targeting (e.g. "wt-banner"). */
  id?: string;
  /** Smoothly fade & collapse the banner (used on Discover when filters are active). */
  hidden?: boolean;
  /** Auto-rotation interval in ms. Set to 0 to disable. */
  rotateMs?: number;
}

const EditorialBanner: React.FC<EditorialBannerProps> = ({
  banners,
  id,
  hidden = false,
  rotateMs = 12000,
}) => {
  const [activeBanner, setActiveBanner] = useState(0);

  useEffect(() => {
    if (!rotateMs || banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % banners.length);
    }, rotateMs);
    return () => clearInterval(interval);
  }, [rotateMs, banners.length]);

  if (banners.length === 0) return null;

  const active = banners[activeBanner] ?? banners[0];

  return (
    <div
      id={id}
      style={{
        opacity: hidden ? 0 : 1,
        maxHeight: hidden ? 0 : '600px',
        marginTop: hidden ? 0 : '2rem',
        overflow: 'hidden',
        pointerEvents: hidden ? 'none' : 'auto',
        transition: 'all 900ms ease-in-out',
      }}
    >
      <div className="relative group overflow-hidden rounded-2xl">
        <div className="aspect-[4/1] bg-stone-900 relative">
          {banners.map((banner, i) => (
            <div
              key={i}
              className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
              style={{ opacity: i === activeBanner ? 1 : 0 }}
            >
              <Image
                src={banner.src}
                alt={banner.alt}
                fill
                sizes="100vw"
                className="object-cover"
                priority={i === 0}
              />
            </div>
          ))}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />
          {/* Forme wordmark icon — top right */}
          <div className="absolute top-4 right-4 text-white/75">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="30"
              height="30"
              color="currentColor"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5.50586 16.9916L8.03146 10.0288C8.49073 9.06222 9.19305 8.26286 9.99777 10.18C10.7406 11.9497 11.8489 15.1903 12.5031 16.9954M6.65339 14.002H11.3215" />
              <path d="M3.46447 5.31802C2 6.63604 2 8.75736 2 13C2 17.2426 2 19.364 3.46447 20.682C4.92893 22 7.28596 22 12 22C16.714 22 19.0711 22 20.5355 20.682C22 19.364 22 17.2426 22 13C22 8.75736 22 6.63604 20.5355 5.31802C19.0711 4 16.714 4 12 4C7.28596 4 4.92893 4 3.46447 5.31802Z" />
              <path d="M18.4843 9.98682V12.9815M18.4843 12.9815V16.9252M18.4843 12.9815H16.466C16.2263 12.9815 15.9885 13.0261 15.7645 13.113C14.0707 13.7702 14.0707 16.2124 15.7645 16.8696C15.9885 16.9565 16.2263 17.0011 16.466 17.0011H18.4843" />
            </svg>
          </div>
          <div className="absolute bottom-0 left-0 p-5">
            <p
              className="text-xs tracking-wide text-white/80 mb-0.5 transition-opacity duration-700"
              style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontStyle: 'italic' }}
            >
              {active.tag}
            </p>
            <h3 className="text-xl font-bold text-white leading-snug transition-opacity duration-700">
              {active.title}
            </h3>
            <p className="text-sm text-white/70 mt-0.5 transition-opacity duration-700">
              {active.subtitle}
            </p>
          </div>
        </div>
      </div>
      {banners.length > 1 && (
        <div className="flex gap-1.5 mt-3 justify-center items-center">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveBanner(i)}
              className={`rounded-full transition-all duration-300 ${
                activeBanner === i
                  ? 'w-4 h-1.5 bg-stone-900 dark:bg-white dark:bg-stone-900'
                  : 'w-1.5 h-1.5 bg-stone-300 dark:bg-stone-600 hover:bg-stone-400 dark:hover:bg-stone-500'
              }`}
              aria-label={`Go to banner ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EditorialBanner;
