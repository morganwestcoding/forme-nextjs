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
  className?: string;     // applied to the frame
  label?: string;
  hint?: string;
  disabled?: boolean;
  accept?: Array<'png' | 'jpg' | 'jpeg' | 'webp' | 'svg'>;
  maxFileSizeMB?: number;
  ratio?: Ratio;          // used only if you don't supply explicit h-/aspect- classes
  rounded?: 'lg' | 'xl' | '2xl' | 'full';
  showRemove?: boolean;
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
}: ImageUploadProps) {
  const acceptText = useMemo(() => {
    const uniq = Array.from(new Set(accept)).map((t) => t.toUpperCase());
    return `${uniq.join(', ')} • Max ~${maxFileSizeMB}MB`;
  }, [accept, maxFileSizeMB]);

  const roundedClass =
    rounded === 'full'
      ? 'rounded-full'
      : rounded === '2xl'
      ? 'rounded-2xl'
      : rounded === 'lg'
      ? 'rounded-lg'
      : 'rounded-xl';

  // Only add aspect-* if the caller didn't set a fixed height/aspect
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

  const handleUpload = useCallback(
    (result: CldUploadWidgetResults) => {
      // @ts-expect-error Cloudinary result is loosely typed
      const secureUrl: string | undefined = result?.info?.secure_url;
      if (secureUrl) onChange(secureUrl);
    },
    [onChange]
  );

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
  
      </div>

      <CldUploadWidget
        uploadPreset={UPLOAD_PRESET}           // unsigned preset to avoid spinner hang
        onUpload={handleUpload}
        options={{
          multiple: false,
          maxFiles: 1,
          sources: ['local', 'url', 'camera'],
          resourceType: 'image',
          clientAllowedFormats: accept,
          maxImageFileSize: maxFileSizeMB * 1_000_000,
          folder: 'uploads',
          ...(hasExplicitSize
            ? {}
            : {
                cropping: true,
                croppingValidateDimensions: true,
                croppingShowDimensions: true,
                croppingAspectRatio:
                  ratio === 'square'
                    ? 1
                    : ratio === 'portrait'
                    ? 3 / 4
                    : ratio === 'tall'
                    ? 2 / 3
                    : ratio === 'wide'
                    ? 21 / 9
                    : 4 / 3,
              }),
        }}
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
              'relative w-full',
              aspectClasses,
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
            {/* Empty state (uses your SVG) */}
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
                  <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Upload image</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">Drag & drop or click</div>
                </div>
              </div>
            )}

            {/* Preview */}
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

                {/* Badge */}
                <div className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium bg-neutral-900/70 text-white">
                  {/* small camera/check mark look with same SVG color */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    color="#ffffff"
                    fill="none"
                  >
                    <path d="M14 3.5H10C6.2288 3.5 4.3431 3.5 3.1716 4.6716C2 5.8431 2 7.7288 2 11.5V13.5C2 17.2712 2 19.1569 3.1716 20.3284C4.3431 21.5 6.2288 21.5 10 21.5H14C17.7712 21.5 19.6569 21.5 20.8284 20.3284C22 19.1569 22 17.2712 22 13.5V11.5C22 7.7288 22 5.8431 20.8284 4.6716C19.6569 3.5 17.7712 3.5 14 3.5Z" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="8.5" cy="9" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M21.5 17.5L16.348 11.88C16.1263 11.6377 15.8131 11.5 15.485 11.5C15.1744 11.5 14.8766 11.6234 14.6571 11.8429L10 16.5L7.8393 14.3393C7.622 14.122 7.3274 14 7.0202 14C6.6893 14 6.3742 14.1415 6.1544 14.3888L2.5 18.5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  Image
                </div>

                {/* Actions */}
                <div className="absolute bottom-2 right-2 flex gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      // open widget to replace
                      (document.activeElement as HTMLElement)?.blur();
                      (open as any)?.();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium
                               bg-white/90 text-neutral-900 ring-1 ring-neutral-200 hover:bg-white"
                  >
                    {/* small refresh icon as SVG to avoid lucide dependency here */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="23 4 23 10 17 10"></polyline>
                      <polyline points="1 20 1 14 7 14"></polyline>
                      <path d="M3.51 9A9 9 0 0 1 20.49 7"></path>
                      <path d="M20.49 15A9 9 0 0 1 3.51 17"></path>
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
