'use client';

import { CldUploadWidget, CldUploadWidgetResults } from 'next-cloudinary';
import Image from 'next/image';
import { useCallback, useMemo, useState } from 'react';
import { X, RefreshCw, UploadCloud } from 'lucide-react';
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
  maxFileSizeMB?: number; // UI hint only; widget still enforces its own limits
  ratio?: Ratio;
  rounded?: 'lg' | 'xl' | '2xl' | 'full';
  showRemove?: boolean;
}

export default function ImageUpload({
  value,
  onChange,
  onRemove,
  className,
  label = 'Upload image',
  hint = 'PNG, JPG, SVG • Max ~5MB',
  disabled = false,
  accept = ['png', 'jpg', 'jpeg', 'webp', 'svg'],
  maxFileSizeMB = 5,
  ratio = 'landscape',
  rounded = 'xl',
  showRemove = true,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const acceptText = useMemo(() => {
    const uniq = Array.from(new Set(accept)).map(t => t.toUpperCase());
    return `${uniq.join(', ')} • Max ~${maxFileSizeMB}MB`;
  }, [accept, maxFileSizeMB]);

  const aspectClasses = useMemo(() => {
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
  }, [ratio]);

  const roundedClass = useMemo(() => {
    switch (rounded) {
      case 'lg':
        return 'rounded-lg';
      case 'xl':
        return 'rounded-xl';
      case '2xl':
        return 'rounded-2xl';
      case 'full':
        return 'rounded-full';
      default:
        return 'rounded-xl';
    }
  }, [rounded]);

  const handleUpload = useCallback(
    (result: CldUploadWidgetResults) => {
      // The result type union includes error shapes; guard for the success shape
      // @ts-expect-error Cloudinary typings are loose; check at runtime
      const secureUrl: string | undefined = result?.info?.secure_url;
      if (secureUrl) onChange(secureUrl);
      setIsUploading(false);
    },
    [onChange]
  );

  const beforeOpen = useCallback(() => {
    if (disabled) return false;
    setIsUploading(true);
    return true;
  }, [disabled]);

  const handleError = useCallback(() => {
    setIsUploading(false);
  }, []);

  const frameClasses =
    'relative flex items-center justify-center w-full overflow-hidden ' +
    `${roundedClass} ${aspectClasses} ` +
    'border border-white/10 bg-gradient-to-b from-white/5 to-white/0 ' +
    'backdrop-blur-sm ring-1 ring-inset ring-white/[0.06] ' +
    'shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_1px_2px_0_rgba(0,0,0,0.35)]';

  const idleButtonClasses =
    'group w-full h-full focus:outline-none focus-visible:ring-2 ' +
    'focus-visible:ring-[#60A5FA] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent';

  const emptyStateClasses =
    'flex flex-col items-center justify-center gap-3 w-full h-full ' +
    'border-2 border-dashed border-white/15 hover:border-[#60A5FA]/40 transition ' +
    'bg-white/[0.02] hover:bg-white/[0.04]';

  const overlayClasses =
    'absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition ' +
    'flex items-end p-2';

  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-white/90">{label}</span>
          {hint && (
            <span className="text-xs text-white/50">{hint || acceptText}</span>
          )}
        </div>
      )}

      <CldUploadWidget
        signatureEndpoint="/api/cloudinary-sign" // if you use signed uploads; else remove
        uploadPreset={UPLOAD_PRESET}
        onUpload={handleUpload}
        onQueuesEnd={() => setIsUploading(false)}
        onError={handleError}
        options={{
          multiple: false,
          maxFiles: 1,
          sources: ['local', 'camera', 'url', 'google_drive'],
          cropping: false,
          resourceType: 'image',
          clientAllowedFormats: accept,
          folder: 'uploads',
          // theme: 'minimal', // optional, Cloudinary widget theme
        }}
      >
        {({ open }) => (
          <div
            className={frameClasses}
            role="button"
            tabIndex={0}
            aria-label={value ? 'Change image' : 'Upload image'}
            onClick={() => {
              if (disabled) return;
              // If beforeOpen returns false, don't open
              const ok = beforeOpen();
              if (ok && open) open();
            }}
            onKeyDown={(e) => {
              if (disabled) return;
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const ok = beforeOpen();
                if (ok && open) open();
              }
            }}
          >
            {/* Empty state */}
            {!value && (
              <div className={clsx(emptyStateClasses, roundedClass)}>
                <UploadCloud className="h-7 w-7 text-white/60 group-hover:text-white/80 transition" />
                <div className="text-center">
                  <div className="text-sm font-medium text-white/90">
                    Drag & drop or click
                  </div>
                  <div className="text-xs text-white/50">
                    {acceptText}
                  </div>
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
                  className={clsx('object-cover', roundedClass)}
                  priority
                />
                <div className={overlayClasses}>
                  <div className="ml-auto flex gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (disabled) return;
                        if (open) {
                          setIsUploading(true);
                          open();
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium
                                 bg-white/10 hover:bg-white/15 text-white/90 backdrop-blur
                                 ring-1 ring-white/15 transition"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Replace
                    </button>

                    {showRemove && onRemove && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (disabled) return;
                          onRemove();
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium
                                   bg-white/10 hover:bg-white/15 text-white/90 backdrop-blur
                                   ring-1 ring-white/15 transition"
                      >
                        <X className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Click-capture for empty state */}
            <button
              type="button"
              className={idleButtonClasses}
              aria-hidden
              tabIndex={-1}
            />

            {/* Uploading overlay */}
            {isUploading && (
              <div
                className={clsx(
                  'absolute inset-0 flex items-center justify-center',
                  'bg-black/40 backdrop-blur-sm'
                )}
              >
                <div className="flex items-center gap-3">
                  <svg
                    className="h-5 w-5 animate-spin text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-20"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-80"
                      d="M22 12a10 10 0 0 1-10 10"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="text-sm text-white/90">Uploading…</span>
                </div>
              </div>
            )}
          </div>
        )}
      </CldUploadWidget>

      {/* Helper microcopy */}
      {!label && hint && (
        <div className="mt-2 text-xs text-white/50">{hint}</div>
      )}
    </div>
  );
}
