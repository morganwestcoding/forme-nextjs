'use client';

import React, { useState, useRef, useCallback } from 'react';
import { PlusSignIcon, PencilEdit01Icon } from 'hugeicons-react';
import Image from 'next/image';
import TypeformHeading from '@/components/registration/TypeformHeading';
import ImageCropModal from '@/components/inputs/ImageCropModal';
import { uploadToCloudinary, buildTransformUrl } from '@/lib/cloudinary';

interface MediaStepProps {
  mediaSrc: string;
  mediaType: 'image' | 'video';
  beforeImageSrc: string;
  onMediaChange: (src: string, type: 'image' | 'video') => void;
  onBeforeImageChange: (src: string) => void;
}

const VIDEO_EXTS = ['mp4', 'mov', 'avi', 'webm'];
const POST_FEED_ASPECT = 9 / 16;

const MediaStep: React.FC<MediaStepProps> = ({
  mediaSrc,
  mediaType,
  beforeImageSrc,
  onMediaChange,
  onBeforeImageChange,
}) => {
  const [showBeforeAfter, setShowBeforeAfter] = useState(!!beforeImageSrc);
  const [uploading, setUploading] = useState<'before' | 'after' | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropIsVideo, setCropIsVideo] = useState(false);
  const [cropTarget, setCropTarget] = useState<'before' | 'after'>('after');
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  const uploadMedia = useCallback(async (blob: Blob, target: 'before' | 'after', isVideo: boolean) => {
    setUploading(target);
    try {
      const data = await uploadToCloudinary(blob, 'uploads/posts', isVideo ? 'auto' : 'image');
      if (isVideo) {
        if (target === 'after') onMediaChange(data.secure_url, 'video');
      } else {
        const width = 600;
        const height = Math.round(width / POST_FEED_ASPECT);
        const finalUrl = buildTransformUrl(data.public_id, `q_auto:good,f_auto,w_${width},h_${height},c_fill,g_auto`);
        if (target === 'before') {
          onBeforeImageChange(finalUrl);
        } else {
          onMediaChange(finalUrl, 'image');
        }
      }
    } catch {
      // upload failed
    } finally {
      setUploading(null);
    }
  }, [onMediaChange, onBeforeImageChange]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>, target: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const isVideo = file.type.startsWith('video/') || VIDEO_EXTS.includes(ext);

    setCropTarget(target);
    setCropIsVideo(isVideo);
    setCropSrc(URL.createObjectURL(file));
  }, []);

  const handleCropComplete = useCallback((blob: Blob) => {
    setCropSrc(null);
    uploadMedia(blob, cropTarget, cropIsVideo);
  }, [uploadMedia, cropTarget, cropIsVideo]);

  const handleCropClose = useCallback(() => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  }, [cropSrc]);

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
  }) => {
    const isUploading = uploading === target;
    const ref = target === 'before' ? beforeInputRef : afterInputRef;

    return (
      <div className="flex flex-col items-center gap-2">
        <div
          onClick={() => !isUploading && ref.current?.click()}
          className={`
            rounded-xl cursor-pointer relative overflow-hidden
            transition-all duration-300 group
            ${imageSrc
              ? 'hover:shadow-elevation-2 hover:-translate-y-1'
              : 'border-2 border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/50 hover:border-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800'
            }
            ${isUploading ? 'opacity-60 pointer-events-none' : ''}
          `}
          style={{ width: '200px', aspectRatio: '9 / 16' }}
        >
          {isUploading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-stone-200 dark:border-stone-700 border-t-stone-600 rounded-full animate-spin" />
            </div>
          ) : imageSrc ? (
            <>
              {boxIsVideo ? (
                <video src={imageSrc} className="absolute inset-0 w-full h-full object-cover" muted loop autoPlay playsInline />
              ) : (
                <Image src={imageSrc} alt={label} fill sizes="(max-width: 640px) 50vw, 280px" className="object-cover" />
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
              <div className="w-10 h-10 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-center shadow-elevation-1">
                <PlusSignIcon className="w-5 h-5 text-stone-400 dark:text-stone-500" />
              </div>
            </div>
          )}
        </div>
        <span className="text-xs font-medium text-stone-500 dark:text-stone-500">{label}</span>
      </div>
    );
  };

  return (
    <div>
      <TypeformHeading
        question="Show your work"
        subtitle={showBeforeAfter ? "Upload before & after photos to showcase your transformation." : "Upload a photo or video."}
      />

      {/* Hidden file inputs */}
      <input
        ref={beforeInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp"
        onChange={(e) => handleFileSelect(e, 'before')}
        className="hidden"
      />
      <input
        ref={afterInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,.mp4,.mov,.avi,.webm"
        onChange={(e) => handleFileSelect(e, 'after')}
        className="hidden"
      />

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

      {/* Before/After toggle — only for images */}
      {mediaType !== 'video' && (
      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={() => setShowBeforeAfter(!showBeforeAfter)}
          className="flex items-center gap-3 text-sm text-stone-600 hover:text-stone-900 dark:hover:text-stone-100 dark:text-stone-100 transition-colors"
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

      {/* Crop modal for images and videos */}
      {cropSrc && (
        <ImageCropModal
          isOpen
          {...(cropIsVideo ? { videoSrc: cropSrc } : { imageSrc: cropSrc })}
          aspect={POST_FEED_ASPECT}
          onClose={handleCropClose}
          onComplete={handleCropComplete}
        />
      )}
    </div>
  );
};

export default MediaStep;
