'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CldUploadWidget, type CldUploadWidgetResults } from 'next-cloudinary';
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

    console.log(`[MediaStep] Upload success - target: ${target}, type: ${processed?.type}, url: ${processed?.url}`);

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
          w-[220px] h-[220px] rounded-2xl cursor-pointer relative overflow-hidden
          transition-all duration-200 group
          ${imageSrc
            ? 'hover:opacity-90'
            : 'border-2 border-dashed border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
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
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-white rounded-md text-xs font-medium text-gray-900">
                  Replace
                </span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onRemove(); }}
                  className="px-2 py-1 bg-white/90 rounded-md text-xs font-medium text-red-600 hover:bg-white"
                >
                  Remove
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-2">
            {widgetOpen && uploadTargetRef.current === target ? (
              <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center group-hover:bg-gray-300 transition-colors">
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <p className="text-[11px] text-gray-400">Photo or video</p>
              </>
            )}
          </div>
        )}
      </div>
      <span className="text-xs font-medium text-gray-500">{label}</span>
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
                        className="w-4 h-4 text-gray-300 animate-pulse"
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
                    isVideo={mediaType === 'video'}
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
          className="flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            showBeforeAfter ? 'border-gray-900 bg-gray-900' : 'border-gray-300'
          }`}>
            {showBeforeAfter && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <path d="M5 12l5 5L20 7" />
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
