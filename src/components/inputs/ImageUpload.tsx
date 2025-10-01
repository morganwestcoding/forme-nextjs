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
        {({ open }) => (
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
              'relative',
              rounded === 'full' ? 'aspect-square' : aspectClasses,
              roundedClass,
              'border border-dashed',
              'border-neutral-300 dark:border-neutral-700',
              'bg-white dark:bg-neutral-900',
              'hover:border-neutral-400 dark:hover:border-neutral-600',
              'transition-colors shadow-sm hover:shadow',
              disabled ? 'opacity-60 pointer-events-none' : 'cursor-pointer',
              className
            )}
          >
            {!value && (
              <div className="grid place-items-center w-full h-full p-6">
                <div className="flex flex-col items-center gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="40"
                    height="40"
                    color="#141B34"
                    fill="none"
                  >
                    <path
                      d="M14 3.5H10C6.22876 3.5 4.34315 3.5 3.17157 4.67157C2 5.84315 2 7.72876 2 11.5V13.5C2 17.2712 2 19.1569 3.17157 20.3284C4.34315 21.5 6.22876 21.5 10 21.5H14C17.7712 21.5 19.6569 21.5 20.8284 20.3284C22 19.1569 22 17.2712 22 13.5V11.5C22 7.72876 22 5.84315 20.8284 4.67157C19.6569 3.5 17.7712 3.5 14 3.5Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="8.5" cy="9" r="1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path
                      d="M21.5 17.5L16.348 11.8797C16.1263 11.6377 15.8131 11.5 15.485 11.5C15.1744 11.5 14.8766 11.6234 14.6571 11.8429L10 16.5L7.83928 14.3393C7.62204 14.122 7.32741 14 7.02019 14C6.68931 14 6.37423 14.1415 6.15441 14.3888L2.5 18.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    {enableCrop ? 'Upload & auto-crop' : 'Upload image'}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    Drag & drop or click
                  </div>
        
                </div>
              </div>
            )}

            {value && (
              <>
                <Image
                  src={value}
                  alt="Uploaded"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 800px"
                  priority
                />

                <div className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium bg-neutral-900/70 text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    color="#ffffff"
                    fill="none"
                  >
                    {enableCrop ? (
                      <path d="M6 2v3M18 6v12M6 8h12M6 22v-3M2 6h3M22 18h-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    ) : (
                      <>
                        <path d="M14 3.5H10C6.2288 3.5 4.3431 3.5 3.1716 4.6716C2 5.8431 2 7.7288 2 11.5V13.5C2 17.2712 2 19.1569 3.1716 20.3284C4.3431 21.5 6.2288 21.5 10 21.5H14C17.7712 21.5 19.6569 21.5 20.8284 20.3284C22 19.1569 22 17.2712 22 13.5V11.5C22 7.7288 22 5.8431 20.8284 4.6716C19.6569 3.5 17.7712 3.5 14 3.5Z" stroke="currentColor" strokeWidth="1.5" />
                        <circle cx="8.5" cy="9" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M21.5 17.5L16.348 11.88C16.1263 11.6377 15.8131 11.5 15.485 11.5C15.1744 11.5 14.8766 11.6234 14.6571 11.8429L10 16.5L7.8393 14.3393C7.622 14.122 7.3274 14 7.0202 14C6.6893 14 6.3742 14.1415 6.1544 14.3888L2.5 18.5" stroke="currentColor" strokeWidth="1.5" />
                      </>
                    )}
                  </svg>
                  {enableCrop ? 'Auto-cropped' : 'Image'}
                </div>

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