'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { CldUploadWidget, type CldUploadWidgetResults } from 'next-cloudinary';
import Image from 'next/image';
import { X, RefreshCw, Film, ImageIcon } from 'lucide-react';
import { MediaData, MediaType } from '@/app/types';

declare global {
  // eslint-disable-next-line no-var
  var cloudinary: any;
}

const UPLOAD_PRESET = 'cs0am6m7';

type Ratio = 'square' | 'landscape' | 'portrait' | 'wide' | 'tall' | 'free';

interface MediaUploadProps {
  onMediaUpload: (data: MediaData) => void;
  currentMedia?: MediaData | null;
  onRemove?: () => void;
  disabled?: boolean;
  ratio?: Ratio;
  heightClass?: string;
  rounded?: 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  label?: string;
  hint?: string;
  showReplaceRemove?: boolean;
  videoControls?: boolean;
}

const MediaUpload: React.FC<MediaUploadProps> = ({
  onMediaUpload,
  currentMedia = null,
  onRemove,
  disabled = false,
  ratio = 'landscape',
  heightClass = 'h-80',
  rounded = '2xl',
  className,
  label = 'Media',
  hint = 'Images, GIFs, or Videos • Max ~50MB',
  showReplaceRemove = true,
  videoControls = true,
}) => {
  const [mediaPreview, setMediaPreview] = useState<MediaData | null>(currentMedia);
  const [isUploading, setIsUploading] = useState(false);

  const roundedClass =
    rounded === 'md'
      ? 'rounded-md'
      : rounded === 'lg'
      ? 'rounded-lg'
      : rounded === 'xl'
      ? 'rounded-xl'
      : 'rounded-2xl';

  // Fixed cropping options with correct Cloudinary parameters
  const cropOptions = useMemo(() => {
    const baseOptions = {
      cropping: true,
      croppingShowBackButton: true,
      croppingShowDimensions: true,
      croppingValidateDimensions: true,
      showSkipCropButton: false,
      croppingCoordinatesMode: 'custom' as const,
    };

    switch (ratio) {
      case 'square':
        return {
          ...baseOptions,
          croppingAspectRatio: 1.0,
          croppingDefaultSelectionRatio: 1.0,
        };
      case 'portrait':
        return {
          ...baseOptions,
          croppingAspectRatio: 0.75, // 3:4
          croppingDefaultSelectionRatio: 0.75,
        };
      case 'tall':
        return {
          ...baseOptions,
          croppingAspectRatio: 0.67, // 2:3
          croppingDefaultSelectionRatio: 0.67,
        };
      case 'wide':
        return {
          ...baseOptions,
          croppingAspectRatio: 2.33, // 21:9
          croppingDefaultSelectionRatio: 2.33,
        };
      case 'landscape':
        return {
          ...baseOptions,
          croppingAspectRatio: 1.33, // 4:3
          croppingDefaultSelectionRatio: 1.33,
        };
      case 'free':
      default:
        return {
          cropping: true,
          croppingShowBackButton: true,
          croppingShowDimensions: true,
          croppingValidateDimensions: false,
          showSkipCropButton: true,
        };
    }
  }, [ratio]);

  const handleUpload = useCallback(
    (result: CldUploadWidgetResults) => {
      const info = result?.info;
      // @ts-expect-error
      const secureUrl: string | undefined = info?.secure_url;
      // @ts-expect-error
      const resourceType: string | undefined = info?.resource_type;
      // @ts-expect-error
      const format: string | undefined = info?.format;
      // @ts-expect-error
      const width: number | undefined = info?.width;
      // @ts-expect-error
      const height: number | undefined = info?.height;

      if (!secureUrl) {
        setIsUploading(false);
        return;
      }

      // Set uploading state when actual upload starts
      setIsUploading(true);

      let type: MediaType = 'image';
      if (resourceType === 'video') type = 'video';
      else if (format === 'gif') type = 'gif';

      const data: MediaData = { url: secureUrl, type, width, height };
      setMediaPreview(data);
      onMediaUpload(data);
      setIsUploading(false);
    },
    [onMediaUpload]
  );

  const handleError = useCallback((error: any) => {
    console.error('Upload error:', error);
    setIsUploading(false);
  }, []);

  const openIfOk = (open?: () => void) => {
    if (disabled) return;
    open?.();
  };

  const renderPreview = () => {
    if (!mediaPreview) return null;
    if (mediaPreview.type === 'video') {
      return (
        <video
          src={mediaPreview.url}
          className="w-full h-full object-cover"
          controls={!!videoControls}
          playsInline
          preload="metadata"
        />
      );
    }
    return (
      <Image
        src={mediaPreview.url}
        alt="Uploaded"
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 800px"
        priority
      />
    );
  };

  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{label}</span>
        {hint && <span className="text-xs text-neutral-500 dark:text-neutral-400">{hint}</span>}
      </div>

      <CldUploadWidget
        uploadPreset={UPLOAD_PRESET}
        onUpload={handleUpload}
        onError={handleError}
        onQueuesEnd={() => setIsUploading(false)}
        options={{
          multiple: false,
          maxFiles: 1,
          sources: ['local', 'url', 'camera'],
          resourceType: 'auto',
          clientAllowedFormats: ['image', 'video', 'gif'],
          maxImageFileSize: 10_000_000,
          maxVideoFileSize: 50_000_000,
          folder: 'uploads',
          // Apply the cropping options
          ...cropOptions,
          // Additional options for better upload experience
          showPoweredBy: false,
          theme: 'minimal',
          styles: {
            palette: {
              window: '#FFFFFF',
              sourceBg: '#F8FAFC',
              windowBorder: '#E2E8F0',
              tabIcon: '#64748B',
              inactiveTabIcon: '#94A3B8',
              menuIcons: '#64748B',
              link: '#3B82F6',
              action: '#3B82F6',
              inProgress: '#3B82F6',
              complete: '#10B981',
              error: '#EF4444',
              textDark: '#1E293B',
              textLight: '#64748B'
            }
          }
        }}
      >
        {({ open }) => (
          <div
            role="button"
            tabIndex={0}
            aria-label={mediaPreview ? 'Change media' : 'Upload media'}
            onClick={() => openIfOk(open)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openIfOk(open);
              }
            }}
            className={[
              'relative w-full',
              heightClass,
              roundedClass,
              'border border-dashed',
              'border-neutral-300 dark:border-neutral-700',
              'bg-white dark:bg-neutral-900',
              'hover:border-neutral-400 dark:hover:border-neutral-600',
              'transition-colors',
              disabled ? 'opacity-60 pointer-events-none' : 'cursor-pointer',
            ].join(' ')}
          >
            {!mediaPreview && (
              <div className="grid place-items-center w-full h-full p-4">
                <div className="flex flex-col items-center gap-2">
                  {/* Upload icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" color="#6B7280" fill="none">
                    <path d="M14 3.5H10C6.22876 3.5 4.34315 3.5 3.17157 4.67157C2 5.84315 2 7.72876 2 11.5V13.5C2 17.2712 2 19.1569 3.17157 20.3284C4.34315 21.5 6.22876 21.5 10 21.5H14C17.7712 21.5 19.6569 21.5 20.8284 20.3284C22 19.1569 22 17.2712 22 13.5V11.5C22 7.72876 22 5.84315 20.8284 4.67157C19.6569 3.5 17.7712 3.5 14 3.5Z" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="8.5" cy="9" r="1.5" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M21.5 17.5L16.348 11.8797C16.1263 11.6377 15.8131 11.5 15.485 11.5C15.1744 11.5 14.8766 11.6234 14.6571 11.8429L10 16.5L7.83928 14.3393C7.62204 14.122 7.32741 14 7.02019 14C6.68931 14 6.37423 14.1415 6.15441 14.3888L2.5 18.5" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="text-sm font-medium text-gray-500">Upload media</div>
                  <div className="text-xs text-gray-500">
                    Drag & drop or click
                  </div>
                </div>
              </div>
            )}

            {mediaPreview && (
              <>
                <div className={`absolute inset-0 overflow-hidden ${roundedClass}`}>{renderPreview()}</div>

                <div className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium bg-neutral-900/70 text-white">
                  {mediaPreview.type === 'video' ? (
                    <>
                      <Film className="h-3.5 w-3.5" />
                      Video
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-3.5 w-3.5" />
                      {mediaPreview.type === 'gif' ? 'GIF' : 'Image'}
                    </>
                  )}
                  {mediaPreview.width && mediaPreview.height && (
                    <span className="ml-1">
                      {mediaPreview.width}×{mediaPreview.height}
                    </span>
                  )}
                </div>

                {showReplaceRemove && (
                  <div className="absolute bottom-2 right-2 flex gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openIfOk(open);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium
                                 bg-white/90 text-neutral-900 ring-1 ring-neutral-200 hover:bg-white"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Replace
                    </button>
                    {onRemove && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove();
                          setMediaPreview(null);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium
                                   bg-white/90 text-neutral-900 ring-1 ring-neutral-200 hover:bg-white"
                      >
                        <X className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {isUploading && (
              <div className="absolute inset-0 grid place-items-center bg-neutral-900/40">
                <div className="flex items-center gap-2 text-white text-sm">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-90" />
                  </svg>
                  Uploading…
                </div>
              </div>
            )}
          </div>
        )}
      </CldUploadWidget>
    </div>
  );
};

export default MediaUpload;