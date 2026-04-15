'use client';

import { CldUploadWidget, type CldUploadWidgetResults } from 'next-cloudinary';
import { useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

import Image from 'next/image';
import TypeformHeading from '@/components/registration/TypeformHeading';
import { itemVariants } from '@/components/registration/TypeformStep';
import { PlusSignIcon as Plus } from 'hugeicons-react';

interface GalleryStepProps {
  galleryImages: string[];
  onGalleryChange: (images: string[]) => void;
}

const UPLOAD_PRESET = 'cs0am6m7';

export default function GalleryStep({
  galleryImages,
  onGalleryChange,
}: GalleryStepProps) {
  const galleryRef = useRef(galleryImages);

  useEffect(() => {
    galleryRef.current = galleryImages;
  }, [galleryImages]);

  const handleUpload = useCallback((result: CldUploadWidgetResults) => {
    const info = result?.info;
    if (info && typeof info === 'object' && 'secure_url' in info) {
      const publicId = info.public_id;
      let cloudName: string | null = null;

      if (typeof info.secure_url === 'string') {
        const urlMatch = info.secure_url.match(/res\.cloudinary\.com\/([^/]+)/);
        cloudName = urlMatch ? urlMatch[1] : null;
      }

      let finalUrl: string;
      if (publicId && cloudName) {
        const transformations = `q_auto:good,f_auto,w_800,h_800,c_fill,g_auto`;
        finalUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`;
      } else {
        finalUrl = info.secure_url as string;
      }

      const updated = [...galleryRef.current, finalUrl];
      galleryRef.current = updated;
      onGalleryChange(updated);
    }
  }, [onGalleryChange]);

  const removeImage = (index: number) => {
    onGalleryChange(galleryImages.filter((_, i) => i !== index));
  };

  return (
    <div>
      <TypeformHeading
        question="Add more photos"
        subtitle="Showcase your work with additional images (optional)"
      />

      <div className="flex flex-wrap gap-3">
        {galleryImages.map((imgUrl, i) => (
          <motion.div
            key={`gallery-${i}`}
            variants={itemVariants}
            className="relative rounded-xl overflow-hidden group"
            style={{ width: '175px', height: '175px' }}
          >
            <Image
              src={imgUrl}
              alt={`Gallery ${i + 1}`}
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        ))}

        {/* Add Photo Button */}
        <CldUploadWidget
          uploadPreset={UPLOAD_PRESET}
          onSuccess={handleUpload}
          options={{
            multiple: true,
            maxFiles: 20,
            sources: ['local', 'camera'],
            resourceType: 'image',
            clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp'],
            maxImageFileSize: 10_000_000,
            folder: 'uploads/listings/gallery',
          }}
        >
          {(props) => (
            <motion.div
              onClick={() => props?.open?.()}
              variants={itemVariants}
              className="cursor-pointer rounded-xl overflow-hidden border-2 border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/50 hover:border-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800 transition-all duration-300 flex flex-col items-center justify-center"
              style={{ width: '175px', height: '175px' }}
            >
              <div className="w-10 h-10 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-center shadow-sm">
                <Plus className="w-5 h-5 text-stone-400 dark:text-stone-500" />
              </div>
            </motion.div>
          )}
        </CldUploadWidget>
      </div>

      {galleryImages.length === 0 && (
        <p className="text-sm text-stone-400 dark:text-stone-500 text-center mt-6">
          You can skip this step or add photos later
        </p>
      )}
    </div>
  );
}
