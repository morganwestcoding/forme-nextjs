'use client';

import Image from 'next/image';
import { useCallback, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import ImageCropModal from './ImageCropModal';
import { uploadToCloudinary, buildTransformUrl } from '@/lib/cloudinary';

type Ratio = 'square' | 'landscape' | 'portrait' | 'wide' | 'tall';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  className?: string;
  label?: string;
  hint?: string;
  disabled?: boolean;
  accept?: string[];
  maxFileSizeMB?: number;
  ratio?: Ratio;
  rounded?: 'lg' | 'xl' | '2xl' | 'full';
  showRemove?: boolean;
  enableCrop?: boolean;
  folder?: string;
  gravity?: string;
  cropMode?: string;
  /** Custom aspect ratio number — overrides ratio prop for crop */
  customAspectRatio?: number;
}

const ASPECT_MAP: Record<Ratio, number> = {
  square: 1,
  landscape: 4 / 3,
  portrait: 3 / 4,
  tall: 2 / 3,
  wide: 21 / 9,
};

const DIMENSION_MAP: Record<Ratio, { w: number; h: number }> = {
  square: { w: 400, h: 400 },
  landscape: { w: 800, h: 600 },
  portrait: { w: 600, h: 800 },
  tall: { w: 600, h: 900 },
  wide: { w: 1200, h: 514 },
};

export default function ImageUpload({
  value,
  onChange,
  onRemove,
  className,
  label = 'Image',
  hint,
  disabled = false,
  accept = ['png', 'jpg', 'jpeg', 'webp'],
  maxFileSizeMB = 10,
  ratio = 'landscape',
  rounded = '2xl',
  showRemove = true,
  enableCrop = true,
  folder = 'uploads',
  gravity = 'g_auto',
  customAspectRatio,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const roundedClass =
    rounded === 'full' ? 'rounded-full'
    : rounded === '2xl' ? 'rounded-2xl'
    : 'rounded-xl';

  const hasExplicitSize = !!className && /\b(h-|min-h-|max-h-|aspect-)/.test(className);

  const aspectClasses = useMemo(() => {
    if (hasExplicitSize) return '';
    switch (ratio) {
      case 'square': return 'aspect-square';
      case 'portrait': return 'aspect-[3/4]';
      case 'tall': return 'aspect-[2/3]';
      case 'wide': return 'aspect-[21/9]';
      case 'landscape':
      default: return 'aspect-[4/3]';
    }
  }, [ratio, hasExplicitSize]);

  const cropAspect = customAspectRatio ?? ASPECT_MAP[ratio];

  const acceptString = accept.map((ext) => `.${ext}`).join(',');

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so re-selecting the same file triggers change
    e.target.value = '';

    if (file.size > maxFileSizeMB * 1_000_000) {
      return;
    }

    if (enableCrop) {
      const objectUrl = URL.createObjectURL(file);
      setCropSrc(objectUrl);
    } else {
      handleUpload(file);
    }
  }, [enableCrop, maxFileSizeMB]);

  const handleUpload = useCallback(async (blob: Blob) => {
    setUploading(true);
    try {
      const data = await uploadToCloudinary(blob, folder);

      const dims = DIMENSION_MAP[ratio];
      const w = customAspectRatio ? dims.w : dims.w;
      const h = customAspectRatio ? Math.round(dims.w / customAspectRatio) : dims.h;
      const cropType = ratio === 'square' ? 'c_thumb' : 'c_fill';
      const transforms = `q_auto:good,f_auto,w_${w},h_${h},${cropType},${gravity}`;

      const finalUrl = buildTransformUrl(data.public_id, transforms);
      onChange(finalUrl);
    } catch {
      // upload failed — user can retry
    } finally {
      setUploading(false);
    }
  }, [folder, ratio, gravity, customAspectRatio, onChange]);

  const handleCropComplete = useCallback((blob: Blob) => {
    setCropSrc(null);
    handleUpload(blob);
  }, [handleUpload]);

  const handleCropClose = useCallback(() => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  }, [cropSrc]);

  return (
    <div className="w-full h-full">
      {hint && (
        <div className="mb-2 text-xs text-stone-500 dark:text-stone-500">
          {hint}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={acceptString}
        onChange={handleFileSelect}
        className="hidden"
      />

      <div
        role="button"
        tabIndex={0}
        aria-label={value ? 'Change image' : 'Upload image'}
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (disabled || uploading) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={clsx(
          'group relative',
          rounded === 'full' ? 'aspect-square' : aspectClasses,
          roundedClass,
          'border-2 border-dashed border-stone-200 dark:border-stone-800',
          'bg-stone-50 dark:bg-stone-900/30',
          'hover:border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:bg-stone-900/30',
          'transition-all duration-200',
          (disabled || uploading) ? 'opacity-60 pointer-events-none' : 'cursor-pointer',
          className,
        )}
      >
        {/* Empty state */}
        {!value && !uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="32"
              height="32"
              fill="none"
              className="text-stone-400 group-hover:text-stone-500 dark:text-stone-400 transition-colors duration-200 flex-shrink-0 mt-3.5"
              style={{ display: 'block' }}
            >
              <path d="M3 16L7.46967 11.5303C7.80923 11.1908 8.26978 11 8.75 11C9.23022 11 9.69077 11.1908 10.0303 11.5303L14 15.5M15.5 17L14 15.5M21 16L18.5303 13.5303C18.1908 13.1908 17.7302 13 17.25 13C16.7698 13 16.3092 13.1908 15.9697 13.5303L14 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15.5 8C15.7761 8 16 7.77614 16 7.5C16 7.22386 15.7761 7 15.5 7M15.5 8C15.2239 8 15 7.77614 15 7.5C15 7.22386 15.2239 7 15.5 7M15.5 8V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3.69797 19.7472C2.5 18.3446 2.5 16.2297 2.5 12C2.5 7.77027 2.5 5.6554 3.69797 4.25276C3.86808 4.05358 4.05358 3.86808 4.25276 3.69797C5.6554 2.5 7.77027 2.5 12 2.5C16.2297 2.5 18.3446 2.5 19.7472 3.69797C19.9464 3.86808 20.1319 4.05358 20.302 4.25276C21.5 5.6554 21.5 7.77027 21.5 12C21.5 16.2297 21.5 18.3446 20.302 19.7472C20.1319 19.9464 19.9464 20.1319 19.7472 20.302C18.3446 21.5 16.2297 21.5 12 21.5C7.77027 21.5 5.6554 21.5 4.25276 20.302C4.05358 20.1319 3.86808 19.9464 3.69797 19.7472Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3 className="text-sm font-medium text-stone-600 group-hover:text-stone-900 dark:hover:text-stone-100 dark:text-stone-100 transition-colors duration-200 text-center">
              {label}
            </h3>
          </div>
        )}

        {/* Uploading state */}
        {uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-stone-200 border-t-stone-600 dark:border-stone-700 dark:border-t-stone-300 rounded-full animate-spin" />
            <span className="text-xs font-medium text-stone-500">Uploading...</span>
          </div>
        )}

        {/* Image preview */}
        {value && !uploading && (
          <>
            <Image
              src={value}
              alt="Uploaded"
              fill
              className={clsx('object-cover', rounded !== 'full' && roundedClass)}
              sizes="(max-width: 768px) 100vw, 800px"
              priority
            />

            {rounded === 'full' && (
              <div className="absolute inset-0 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <defs>
                    <mask id="circle-mask">
                      <rect x="0" y="0" width="100" height="100" fill="white" />
                      <circle cx="50" cy="50" r="48" fill="black" />
                    </mask>
                  </defs>
                  <rect x="0" y="0" width="100" height="100" fill="black" fillOpacity="0.5" mask="url(#circle-mask)" />
                  <circle cx="50" cy="50" r="48" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="2,2" />
                </svg>
              </div>
            )}

            <div className="absolute bottom-2 right-2 flex gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl px-2 py-1 text-xs font-medium
                  bg-white/90 text-stone-900 dark:text-stone-100 ring-1 ring-stone-200 hover:bg-white dark:bg-stone-900"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                </svg>
                Replace
              </button>

              {showRemove && onRemove && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl px-2 py-1 text-xs font-medium
                    bg-white/90 text-stone-900 dark:text-stone-100 ring-1 ring-stone-200 hover:bg-white dark:bg-stone-900"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Remove
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Crop modal */}
      {cropSrc && (
        <ImageCropModal
          isOpen
          imageSrc={cropSrc}
          aspect={cropAspect}
          onClose={handleCropClose}
          onComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
