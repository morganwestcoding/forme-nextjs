'use client';

import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';

import Image from 'next/image';
import TypeformHeading from '@/components/registration/TypeformHeading';
import { itemVariants } from '@/components/registration/TypeformStep';
import { PlusSignIcon as Plus } from 'hugeicons-react';
import { uploadToCloudinary, buildTransformUrl } from '@/lib/cloudinary';

interface GalleryStepProps {
  galleryImages: string[];
  onGalleryChange: (images: string[]) => void;
}

export default function GalleryStep({
  galleryImages,
  onGalleryChange,
}: GalleryStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef(galleryImages);
  const [uploading, setUploading] = useState(false);

  // Keep ref in sync
  galleryRef.current = galleryImages;

  const handleFiles = useCallback(async (files: FileList) => {
    setUploading(true);
    try {
      const uploads = Array.from(files).map(async (file) => {
        const data = await uploadToCloudinary(file, 'uploads/listings/gallery');
        return buildTransformUrl(data.public_id, 'q_auto:good,f_auto,w_800,h_800,c_fill,g_auto');
      });
      const urls = await Promise.all(uploads);
      const updated = [...galleryRef.current, ...urls];
      onGalleryChange(updated);
    } catch {
      // upload failed
    } finally {
      setUploading(false);
    }
  }, [onGalleryChange]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    e.target.value = '';
    handleFiles(files);
  }, [handleFiles]);

  const removeImage = (index: number) => {
    onGalleryChange(galleryImages.filter((_, i) => i !== index));
  };

  return (
    <div>
      <TypeformHeading
        question="Add more photos"
        subtitle="Showcase your work with additional images (optional)"
      />

      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp"
        multiple
        onChange={handleFileSelect}
        className="hidden"
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
              sizes="175px"
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
        <motion.div
          onClick={() => !uploading && inputRef.current?.click()}
          variants={itemVariants}
          className={`cursor-pointer rounded-xl overflow-hidden border-2 border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/50 hover:border-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800 transition-all duration-300 flex flex-col items-center justify-center ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
          style={{ width: '175px', height: '175px' }}
        >
          {uploading ? (
            <div className="w-6 h-6 border-2 border-stone-200 border-t-stone-600 rounded-full animate-spin" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-center shadow-elevation-1">
              <Plus className="w-5 h-5 text-stone-400 dark:text-stone-500" />
            </div>
          )}
        </motion.div>
      </div>

      {galleryImages.length === 0 && (
        <p className="text-sm text-stone-400 dark:text-stone-500 text-center mt-6">
          You can skip this step or add photos later
        </p>
      )}
    </div>
  );
}
