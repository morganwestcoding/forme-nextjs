'use client';

import React from 'react';
import { SafeListing } from '@/app/types';
import Modal from './Modal';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: SafeListing;
}

const QRModal: React.FC<QRModalProps> = ({
  isOpen,
  onClose,
  listing
}) => {
  // Generate the listing URL
  const listingUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/listings/${listing.id}` 
    : '';

  // Generate QR code using qr-server.com API (no dependencies needed)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(listingUrl)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(listingUrl);
      // You could add a toast notification here if you have one
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const bodyContent = (
    <div className="flex flex-col items-center text-center space-y-6 py-4">
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">
          Share Your Listing
        </h3>
        <p className="text-gray-600 text-sm">
          Let customers easily access your listing
        </p>
      </div>

      {/* QR Code Container */}
      <div className="bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-sm">
        <div className="w-48 h-48 mx-auto bg-white rounded-lg flex items-center justify-center">
          {listingUrl ? (
            <img
              src={qrCodeUrl}
              alt={`QR Code for ${listing.title}`}
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback if QR service fails
                const target = e.currentTarget;
                target.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'w-full h-full flex items-center justify-center text-gray-400 text-sm';
                fallback.innerHTML = 'QR Code<br/>Unavailable';
                target.parentNode?.appendChild(fallback);
              }}
            />
          ) : (
            <div className="text-gray-400 text-sm">
              Loading QR Code...
            </div>
          )}
        </div>
      </div>

      {/* Listing Info */}
      <div className="space-y-1">
        <h4 className="font-medium text-gray-900">
          {listing.title}
        </h4>
        <p className="text-sm text-gray-500">
          {listing.location}
        </p>
      </div>

      {/* URL Display */}
      <div className="w-full">
        <div className="bg-gray-50 rounded-lg p-3 border">
          <p className="text-xs text-gray-600 mb-1">Listing URL:</p>
          <p className="text-sm font-mono text-gray-800 break-all">
            {listingUrl}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 w-full">
        <button
          onClick={handleCopyLink}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
          </svg>
          Copy Link
        </button>
        
        <button
          onClick={onClose}
          className="flex-1 bg-[#60A5FA] hover:bg-[#4F94E5] text-white py-2.5 px-4 rounded-lg transition-colors text-sm font-medium"
          type="button"
        >
          Done
        </button>
      </div>

      {/* Instructions */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Customers can scan this QR code with their phone camera to visit your listing
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