'use client';

import React from 'react';
import { SafeListing } from '@/app/types';
import Modal from './Modal';
import Button from '../ui/Button';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing?: SafeListing;
  // Optional overrides — when provided, the modal renders these instead of
  // the listing fields. Lets us reuse the modal for profiles, posts, etc.
  url?: string;
  title?: string;
  subtitle?: string;
  headerTitle?: string;
  headerSubtitle?: string;
}

const QRModal: React.FC<QRModalProps> = ({
  isOpen,
  onClose,
  listing,
  url,
  title,
  subtitle,
  headerTitle,
  headerSubtitle,
}) => {
  // Resolve the URL to encode in the QR. Explicit `url` wins, else fall back
  // to the listing URL for backwards compatibility with existing callers.
  const listingUrl = url
    ?? (typeof window !== 'undefined' && listing
      ? `${window.location.origin}/listings/${listing.id}`
      : '');

  const displayTitle = title ?? listing?.title ?? '';
  const displaySubtitle = subtitle ?? listing?.location ?? '';
  const modalHeaderTitle = headerTitle ?? 'Share Your Listing';
  const modalHeaderSubtitle = headerSubtitle ?? 'Let customers easily access your listing';

  // Generate QR code using qr-server.com API (no dependencies needed)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(listingUrl)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(listingUrl);
      // You could add a toast notification here if you have one
    } catch (err) {
      // silently handled
    }
  };

  const bodyContent = (
    <div className="flex flex-col items-center text-center space-y-6 py-4">
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
          {modalHeaderTitle}
        </h3>
        <p className="text-stone-600 dark:text-stone-300 text-sm">
          {modalHeaderSubtitle}
        </p>
      </div>

      {/* QR Code Container */}
      <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border-2 border-stone-100 dark:border-stone-800 shadow-elevation-1">
        <div className="w-48 h-48 mx-auto bg-white dark:bg-stone-900 rounded-xl flex items-center justify-center">
          {listingUrl ? (
            <img
              src={qrCodeUrl}
              alt={`QR Code for ${displayTitle}`}
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback if QR service fails
                const target = e.currentTarget;
                target.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'w-full h-full flex items-center justify-center text-stone-400 dark:text-stone-500 text-sm';
                fallback.innerHTML = 'QR Code<br/>Unavailable';
                target.parentNode?.appendChild(fallback);
              }}
            />
          ) : (
            <div className="text-stone-400 dark:text-stone-500 text-sm">
              Loading QR Code...
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1">
        <h4 className="font-medium text-stone-900 dark:text-stone-100">
          {displayTitle}
        </h4>
        {displaySubtitle && (
          <p className="text-sm text-stone-500  dark:text-stone-500">
            {displaySubtitle}
          </p>
        )}
      </div>

      {/* URL Display */}
      <div className="w-full">
        <div className="bg-stone-50 dark:bg-stone-900 rounded-xl p-3 border">
          <p className="text-xs text-stone-600 dark:text-stone-300 mb-1">URL:</p>
          <p className="text-sm font-mono text-stone-800 dark:text-stone-200 break-all">
            {listingUrl}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 w-full">
        <button
          onClick={handleCopyLink}
          className="flex-1 bg-stone-100  hover:bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 py-2.5 px-4 rounded-xl transition-colors text-sm font-medium flex items-center justify-center gap-2"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
          </svg>
          Copy Link
        </button>
        
        <Button onClick={onClose} type="button" fullWidth>
          Done
        </Button>
      </div>

      {/* Instructions */}
      <div className="text-center">
        <p className="text-xs text-stone-500  dark:text-stone-500">
          Scan this QR code with a phone camera to open the link
        </p>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={() => {}}
      title="QR Code"
      body={bodyContent}
      className="w-full md:w-[400px]"
      id="qr-modal"
      modalContentId="qr-modal-content"
    />
  );
};

export default QRModal;