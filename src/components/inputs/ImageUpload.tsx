'use client';

import { CldUploadWidget, type CldUploadWidgetResults } from 'next-cloudinary';
import Image from 'next/image';
import { useCallback, useMemo } from 'react';
import clsx from 'clsx';

declare global {
  // eslint-disable-next-line no-var
  var cloudinary: any;
}

const UPLOAD_PRESET = 'cs0am6m7';

type Ratio = 'square' | 'landscape' | 'portrait' | 'wide' | 'tall';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  className?: string;
  label?: string;
  hint?: string;
  disabled?: boolean;
  accept?: Array<'png' | 'jpg' | 'jpeg' | 'webp' | 'svg'>;
  maxFileSizeMB?: number;
  ratio?: Ratio;
  rounded?: 'lg' | 'xl' | '2xl' | 'full';
  showRemove?: boolean;
  enableCrop?: boolean;
  cropMode?: 'free' | 'fixed';
  customAspectRatio?: number;
  uploadId?: string;
}

export default function ImageUpload({
  value,
  onChange,
  onRemove,
  className,
  label = 'Image',
  hint,
  disabled = false,
  accept = ['png', 'jpg', 'jpeg', 'webp', 'svg'],
  maxFileSizeMB = 10,
  ratio = 'landscape',
  rounded = '2xl',
  showRemove = true,
  enableCrop = true,
  cropMode = 'fixed',
  customAspectRatio,
  uploadId = 'default',
}: ImageUploadProps) {
  const roundedClass =
    rounded === 'full'
      ? 'rounded-full'
      : rounded === '2xl'
      ? 'rounded-2xl'
      : rounded === 'lg'
      ? 'rounded-lg'
      : 'rounded-xl';

  const hasExplicitSize = !!className && /\b(h-|min-h-|max-h-|aspect-)/.test(className);
  
  const aspectClasses = useMemo(() => {
    if (hasExplicitSize) return '';
    switch (ratio) {
      case 'square':
        return 'aspect-square';
      case 'portrait':
        return 'aspect-[3/4]';
      case 'tall':
        return 'aspect-[2/3]';
      case 'wide':
        return 'aspect-[21/9]';
      case 'landscape':
      default:
        return 'aspect-[4/3]';
    }
  }, [ratio, hasExplicitSize]);

  const getCropAspectRatio = useCallback(() => {
    if (customAspectRatio) return customAspectRatio;
    
    switch (ratio) {
      case 'square':
        return 1;
      case 'portrait':
        return 3 / 4;
      case 'tall':
        return 2 / 3;
      case 'wide':
        return 21 / 9;
      case 'landscape':
      default:
        return 4 / 3;
    }
  }, [ratio, customAspectRatio]);

  const buildCloudinaryUrl = useCallback((publicId: string, cloudName: string) => {
    console.log(`[${uploadId}] Building Cloudinary URL:`, { publicId, cloudName, enableCrop, ratio });

    if (!enableCrop) {
      const url = `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
      console.log(`[${uploadId}] Crop disabled, returning original:`, url);
      return url;
    }

    const aspectRatio = getCropAspectRatio();
    console.log(`[${uploadId}] Aspect ratio calculated:`, aspectRatio);

    let width: number;
    let height: number;

    if (ratio === 'square') {
      width = 400;
      height = 400;
    } else if (ratio === 'landscape') {
      width = 800;
      height = Math.round(800 / aspectRatio);
    } else if (ratio === 'wide') {
      width = 1200;
      height = Math.round(1200 / aspectRatio);
    } else {
      width = 600;
      height = Math.round(width / aspectRatio);
    }

    console.log(`[${uploadId}] Calculated dimensions:`, { width, height });

    let cropTransform: string;
    let gravity: string;

    if (ratio === 'square') {
      cropTransform = 'c_thumb';
      gravity = 'g_auto';
    } else {
      cropTransform = 'c_fill';
      gravity = 'g_auto';
    }

    console.log(`[${uploadId}] Crop strategy:`, { cropTransform, gravity });

    const transformations = [
      'q_auto:good',
      'f_auto',
      `w_${width}`,
      `h_${height}`,
      cropTransform,
      gravity,
    ].join(',');

    const finalUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`;
    
    console.log(`[${uploadId}] Final transformed URL:`, finalUrl);
    console.log(`[${uploadId}] Transformation string:`, transformations);
    
    return finalUrl;
  }, [enableCrop, getCropAspectRatio, ratio, uploadId]);

  const handleUpload = useCallback(
    (result: CldUploadWidgetResults) => {
      console.log(`[${uploadId}] Upload result received:`, result);
      
      const info = result?.info;
      
      if (info && typeof info === 'object') {
        const publicId = info.public_id;
        console.log(`[${uploadId}] Extracted publicId:`, publicId);
        
        let cloudName: string | null = null;
        
        if (typeof info.cloud_name === 'string') {
          cloudName = info.cloud_name;
          console.log(`[${uploadId}] Cloud name from info:`, cloudName);
        }
        
        if (!cloudName && typeof info.secure_url === 'string') {
          const urlMatch = info.secure_url.match(/res\.cloudinary\.com\/([^\/]+)/);
          cloudName = urlMatch ? urlMatch[1] : null;
          console.log(`[${uploadId}] Cloud name extracted from URL:`, cloudName);
        }
        
        if (publicId && cloudName) {
          let finalUrl: string;
          
          if (enableCrop) {
            finalUrl = buildCloudinaryUrl(publicId, cloudName);
            console.log(`[${uploadId}] Using cropped URL:`, finalUrl);
          } else {
            finalUrl = info.secure_url;
            console.log(`[${uploadId}] Using original URL:`, finalUrl);
          }
          
          onChange(finalUrl);
        } else {
          console.warn(`[${uploadId}] Missing publicId or cloudName:`, { publicId, cloudName });
          if (typeof info.secure_url === 'string') {
            console.log(`[${uploadId}] Falling back to secure_url:`, info.secure_url);
            onChange(info.secure_url);
          }
        }
      } else {
        console.error(`[${uploadId}] Invalid upload result info:`, info);
      }
    },
    [onChange, enableCrop, buildCloudinaryUrl, uploadId]
  );

  const cloudinaryOptions = useMemo(() => {
    const aspectRatio = getCropAspectRatio();
    
    const options = {
      multiple: false,
      maxFiles: 1,
      sources: ['local', 'url', 'camera'] as ('local' | 'url' | 'camera')[],
      resourceType: 'image' as const,
      clientAllowedFormats: accept,
      maxImageFileSize: maxFileSizeMB * 1_000_000,
      folder: `uploads/${uploadId}`,
      cropping: enableCrop,
      croppingAspectRatio: enableCrop && cropMode === 'fixed' ? aspectRatio : undefined,
      croppingShowBackButton: true,
      croppingValidateDimensions: true,
      showSkipCropButton: cropMode === 'free',
      croppingShowDimensions: true,
      quality: 'auto:good' as const,
      publicId: `${uploadId}_${Date.now()}`,
    };

    console.log(`[${uploadId}] Cloudinary options:`, options);
    return options;
  }, [accept, maxFileSizeMB, enableCrop, cropMode, getCropAspectRatio, uploadId]);

  return (
    <div>
      {hint && (
        <div className="mb-2 text-xs text-neutral-500 dark:text-neutral-400">
          {hint}
        </div>
      )}

      <CldUploadWidget
        uploadPreset={UPLOAD_PRESET}
        onUpload={handleUpload}
        options={cloudinaryOptions}
      >
        {({ open } = {}) => (
          <div
            role="button"
            tabIndex={0}
            aria-label={value ? 'Change image' : 'Upload image'}
            onClick={() => !disabled && open?.()}
            onKeyDown={(e) => {
              if (disabled) return;
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                open?.();
              }
            }}
            className={clsx(
              'group relative',
              rounded === 'full' ? 'aspect-square' : aspectClasses,
              roundedClass,
              'border-2 border-dashed border-gray-200',
              'bg-gray-50/30',
              'hover:border-blue-300 hover:bg-blue-50/30',
              'transition-all duration-200',
              disabled ? 'opacity-60 pointer-events-none' : 'cursor-pointer',
              className
            )}
          >
            {!value && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="32"
                  height="32"
                  fill="none"
                  className="text-gray-400 group-hover:text-blue-500 transition-colors duration-200 flex-shrink-0 mt-3.5"
                  style={{ display: 'block' }}
                >
                  <path d="M3 16L7.46967 11.5303C7.80923 11.1908 8.26978 11 8.75 11C9.23022 11 9.69077 11.1908 10.0303 11.5303L14 15.5M15.5 17L14 15.5M21 16L18.5303 13.5303C18.1908 13.1908 17.7302 13 17.25 13C16.7698 13 16.3092 13.1908 15.9697 13.5303L14 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                  <path d="M15.5 8C15.7761 8 16 7.77614 16 7.5C16 7.22386 15.7761 7 15.5 7M15.5 8C15.2239 8 15 7.77614 15 7.5C15 7.22386 15.2239 7 15.5 7M15.5 8V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                  <path d="M3.69797 19.7472C2.5 18.3446 2.5 16.2297 2.5 12C2.5 7.77027 2.5 5.6554 3.69797 4.25276C3.86808 4.05358 4.05358 3.86808 4.25276 3.69797C5.6554 2.5 7.77027 2.5 12 2.5C16.2297 2.5 18.3446 2.5 19.7472 3.69797C19.9464 3.86808 20.1319 4.05358 20.302 4.25276C21.5 5.6554 21.5 7.77027 21.5 12C21.5 16.2297 21.5 18.3446 20.302 19.7472C20.1319 19.9464 19.9464 20.1319 19.7472 20.302C18.3446 21.5 16.2297 21.5 12 21.5C7.77027 21.5 5.6554 21.5 4.25276 20.302C4.05358 20.1319 3.86808 19.9464 3.69797 19.7472Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
                <h3 className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors duration-200 text-center">
                  {label}
                </h3>
              </div>
            )}

            {value && (
              <>
                <Image
                  src={value}
                  alt="Uploaded"
                  fill
                  className={clsx("object-cover", rounded !== 'full' && roundedClass)}
                  sizes="(max-width: 768px) 100vw, 800px"
                  priority
                />

                {/* Circular overlay for rounded full images */}
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
                      (document.activeElement as HTMLElement)?.blur();
                      open?.();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium
                               bg-white/90 text-neutral-900 ring-1 ring-neutral-200 hover:bg-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"/>
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
                      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium
                                 bg-white/90 text-neutral-900 ring-1 ring-neutral-200 hover:bg-white"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                      Remove
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </CldUploadWidget>
    </div>
  );
}