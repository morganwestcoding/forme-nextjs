'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import { Cancel01Icon } from 'hugeicons-react';

const menuBtnClass = "w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800 flex items-center gap-4 transition-colors duration-150";
const MENU_WIDTH = 176;

interface CardActionMenuProps {
  shareUrl: string;
  shareTitle: string;
  hasFavorited: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
  triggerClassName?: string;
  iconColorClass?: string;
  onOpenChange?: (open: boolean) => void;
}

const CardActionMenu: React.FC<CardActionMenuProps> = ({
  shareUrl,
  shareTitle,
  hasFavorited,
  onToggleFavorite,
  triggerClassName = '',
  iconColorClass = 'text-stone-500 dark:text-stone-300',
  onOpenChange,
}) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const onScroll = () => setOpen(false);
    window.addEventListener('scroll', onScroll, true);
    return () => window.removeEventListener('scroll', onScroll, true);
  }, [open]);

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!open) {
      const rect = e.currentTarget.getBoundingClientRect();
      const top = rect.bottom + 10;
      const left = Math.max(8, Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8));
      setPos({ top, left });
    }
    setOpen((v) => !v);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: shareTitle, url: shareUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied');
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(e);
  };

  const menu = open && pos ? (
    <>
      <div
        className="fixed inset-0 z-[60]"
        onClick={(e) => { e.stopPropagation(); setOpen(false); }}
      />
      <div
        className="fixed bg-white dark:bg-stone-900 rounded-xl shadow-xl border border-stone-200 dark:border-stone-800 py-2 z-[61] origin-top-right animate-[fadeInUp_160ms_ease-out]"
        style={{ top: pos.top, left: pos.left, width: MENU_WIDTH }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={handleFavorite} className={menuBtnClass} type="button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={hasFavorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={hasFavorited ? 'text-stone-900 dark:text-stone-100' : 'text-stone-500 dark:text-stone-500'}>
            <path d="M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z" />
          </svg>
          {hasFavorited ? 'Favorited' : 'Favorite'}
        </button>
        <button onClick={handleShare} className={menuBtnClass} type="button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-stone-500 dark:text-stone-500">
            <path d="M10.0017 3C7.05534 3.03208 5.41096 3.21929 4.31838 4.31188C2.99988 5.63037 2.99988 7.75248 2.99988 11.9966C2.99988 16.2409 2.99988 18.363 4.31838 19.6815C5.63688 21 7.75899 21 12.0032 21C16.2474 21 18.3695 21 19.688 19.6815C20.7808 18.5887 20.9678 16.9438 20.9999 13.9963" />
            <path d="M14 3H18C19.4142 3 20.1213 3 20.5607 3.43934C21 3.87868 21 4.58579 21 6V10M20 4L11 13" />
          </svg>
          Share
        </button>
      </div>
    </>
  ) : null;

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleToggle}
        aria-label={open ? 'Close menu' : 'More options'}
        type="button"
        className={`relative w-5 h-5 inline-flex items-center justify-center transition-colors duration-200 ${iconColorClass} ${triggerClassName}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`absolute transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${open ? 'opacity-0 scale-75 rotate-90' : 'opacity-100 scale-100 rotate-0'}`}
        >
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
        <Cancel01Icon
          className={`absolute w-5 h-5 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${open ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-90'}`}
          strokeWidth={2}
        />
      </button>
      {mounted && menu ? createPortal(menu, document.body) : null}
    </>
  );
};

export default CardActionMenu;
