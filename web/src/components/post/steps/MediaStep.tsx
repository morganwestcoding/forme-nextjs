'use client';

import React, { useState, useRef } from 'react';
import { CldUploadWidget, type CldUploadWidgetResults } from 'next-cloudinary';
import { PlusSignIcon, PencilEdit01Icon } from 'hugeicons-react';
import Image from 'next/image';
import TypeformHeading from '@/components/registration/TypeformHeading';

const UPLOAD_PRESET = 'cs0am6m7';

const uploadOptions = {
  multiple: false,
  maxFiles: 1,
  sources: ['local', 'camera'] as ('local' | 'camera')[],
  resourceType: 'auto' as const,
  maxFileSize: 100_000_000,
  folder: 'uploads/posts',
};

interface MediaStepProps {
  mediaSrc: string;
  mediaType: 'image' | 'video';
  beforeImageSrc: string;
  onMediaChange: (src: string, type: 'image' | 'video') => void;
  onBeforeImageChange: (src: string) => void;
}

type UploadTarget = 'before' | 'after' | null;

const MediaStep: React.FC<MediaStepProps> = ({
  mediaSrc,
  mediaType,
  beforeImageSrc,
  onMediaChange,
  onBeforeImageChange,
}) => {
  const [showBeforeAfter, setShowBeforeAfter] = useState(!!beforeImageSrc);
  const [widgetOpen, setWidgetOpen] = useState(false);

  // Use ref to track which target was clicked (persists through widget lifecycle)
  const uploadTargetRef = useRef<UploadTarget>(null);

  // Store the open function from the widget
  const openFnRef = useRef<(() => void) | null>(null);

  const processResult = (result: CldUploadWidgetResults): { url: string; type: 'image' | 'video' } | null => {
    const info = result?.info;
    if (info && typeof info === 'object' && 'secure_url' in info) {
      const resourceType = (info as any).resource_type;
      const format = ((info as any).format || '').toLowerCase();
      const url = info.secure_url as string;
      const isVideo = resourceType === 'video' || ['mp4', 'mov', 'avi', 'webm'].includes(format) || /\.(mp4|mov|avi|webm)/i.test(url);
      const publicId = info.public_id;
      let cloudName: string | null = null;

      if (typeof info.secure_url === 'string') {
        const urlMatch = info.secure_url.match(/res\.cloudinary\.com\/([^/]+)/);
        cloudName = urlMatch ? urlMatch[1] : null;
      }

      if (isVideo) {
        return { url: info.secure_url as string, type: 'video' };
      }

      if (publicId && cloudName) {
        const transformations = `q_auto:good,f_auto,w_600,h_600,c_fill,g_auto`;
        return { url: `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`, type: 'image' };
      }
      return { url: info.secure_url as string, type: 'image' };
    }
    return null;
  };

  const handleSuccess = (result: CldUploadWidgetResults) => {
    const processed = processResult(result);
    const target = uploadTargetRef.current;

    if (processed && target) {
      if (target === 'before') {
        onBeforeImageChange(processed.url);
      } else {
        onMediaChange(processed.url, processed.type);
      }
    }
    uploadTargetRef.current = null;
    setWidgetOpen(false);
  };

  const handleClose = () => {
    uploadTargetRef.current = null;
    setWidgetOpen(false);
  };

  const handleBoxClick = (target: UploadTarget) => {
    uploadTargetRef.current = target;
    setWidgetOpen(true);
    // Call open immediately
    if (openFnRef.current) {
      openFnRef.current();
    }
  };

  // Upload box component
  const UploadBox = ({
    target,
    imageSrc,
    isVideo: boxIsVideo,
    label,
    onRemove,
  }: {
    target: 'before' | 'after';
    imageSrc: string;
    isVideo?: boolean;
    label: string;
    onRemove: () => void;
  }) => (
    <div className="flex flex-col items-center gap-2">
      <div
        onClick={() => handleBoxClick(target)}
        className={`
          w-[220px] h-[220px] rounded-xl cursor-pointer relative overflow-hidden
          transition-all duration-300 group
          ${imageSrc
            ? 'hover:shadow-lg hover:-translate-y-1'
            : 'border-2 border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/50 hover:border-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800'
          }
        `}
      >
        {imageSrc ? (
          <>
            {boxIsVideo ? (
              <video src={imageSrc} className="absolute inset-0 w-full h-full object-cover" muted loop autoPlay playsInline />
            ) : (
              <Image src={imageSrc} alt={label} fill className="object-cover" />
            )}
            <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex items-center gap-3">
                <PencilEdit01Icon className="w-5 h-5 text-white drop-shadow-sm" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onRemove(); }}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-center shadow-sm">
              <PlusSignIcon className="w-5 h-5 text-stone-400 dark:text-stone-500" />
            </div>
          </div>
        )}
      </div>
      <span className="text-xs font-medium text-stone-500  dark:text-stone-500">{label}</span>
    </div>
  );

  return (
    <div>
      <TypeformHeading
        question="Show your work"
        subtitle={showBeforeAfter ? "Upload before & after photos to showcase your transformation." : "Upload a photo or video. Square format works best."}
      />

      {/* Upload Widget — accepts both photos and videos */}
      <CldUploadWidget
        uploadPreset={UPLOAD_PRESET}
        onSuccess={handleSuccess}
        onClose={handleClose}
        onOpen={() => setWidgetOpen(true)}
        options={uploadOptions}
      >
        {({ open }) => {
          // Store the open function in ref so we can call it from click handlers
          openFnRef.current = open || null;

          return (
            <>
              {showBeforeAfter && mediaType !== 'video' ? (
                <div className="flex items-center justify-center gap-4">
                  <UploadBox
                    target="before"
                    imageSrc={beforeImageSrc}
                    label="Before"
                    onRemove={() => onBeforeImageChange('')}
                  />

                  {/* Animated chevrons */}
                  <div className="flex items-center -space-x-1 px-2">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 text-stone-300 animate-pulse"
                        style={{ animationDelay: `${i * 120}ms` }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    ))}
                  </div>

                  <UploadBox
                    target="after"
                    imageSrc={mediaSrc}
                    label="After"
                    onRemove={() => onMediaChange('', 'image')}
                  />
                </div>
              ) : (
                <div className="flex justify-center">
                  <UploadBox
                    target="after"
                    imageSrc={mediaSrc}
                    isVideo={mediaType === 'video'}
                    label="Your work"
                    onRemove={() => onMediaChange('', 'image')}
                  />
                </div>
              )}
            </>
          );
        }}
      </CldUploadWidget>

      {/* Before/After toggle — only for images */}
      {mediaType !== 'video' && (
      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={() => setShowBeforeAfter(!showBeforeAfter)}
          className="flex items-center gap-3 text-sm text-stone-600  hover:text-stone-900 dark:hover:text-stone-100 dark:text-stone-100 transition-colors"
        >
          <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
            showBeforeAfter ? 'border-stone-900 bg-stone-900' : 'border-stone-300 dark:border-stone-700'
          }`}>
            {showBeforeAfter && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span>Before & after transformation</span>
        </button>
      </div>
      )}
    </div>
  );
};

export default MediaStep;
