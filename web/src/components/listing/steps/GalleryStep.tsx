'use client';

import { CldUploadWidget, type CldUploadWidgetResults } from 'next-cloudinary';
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import TypeformHeading from '@/components/registration/TypeformHeading';
import { itemVariants } from '@/components/registration/TypeformStep';

interface GalleryStepProps {
  galleryImages: string[];
  onGalleryChange: (images: string[]) => void;
}

const UPLOAD_PRESET = 'cs0am6m7';

export default function GalleryStep({
  galleryImages,
  onGalleryChange,
}: GalleryStepProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = useCallback((result: CldUploadWidgetResults) => {
    const info = result?.info;
    if (info && typeof info === 'object' && 'secure_url' in info) {
      const publicId = info.public_id;
      let cloudName: string | null = null;

      if (typeof info.secure_url === 'string') {
        const urlMatch = info.secure_url.match(/res\.cloudinary\.com\/([^/]+)/);
        cloudName = urlMatch ? urlMatch[1] : null;
      }

      if (publicId && cloudName) {
        const transformations = `q_auto:good,f_auto,w_800,h_800,c_fill,g_auto`;
        const finalUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`;
        onGalleryChange([...galleryImages, finalUrl]);
      } else {
        onGalleryChange([...galleryImages, info.secure_url as string]);
      }
    }
    setUploading(false);
  }, [galleryImages, onGalleryChange]);

  const removeImage = (index: number) => {
    onGalleryChange(galleryImages.filter((_, i) => i !== index));
  };

  return (
    <div>
      <TypeformHeading
        question="Add more photos"
        subtitle="Showcase your work with additional images (optional)"
      />

      <div className="grid grid-cols-3 gap-3">
        {galleryImages.map((imgUrl, i) => (
          <motion.div
            key={`gallery-${i}`}
            variants={itemVariants}
            className="relative aspect-square rounded-xl overflow-hidden group"
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
          onOpen={() => setUploading(true)}
          options={{
            multiple: false,
            maxFiles: 1,
            sources: ['local', 'camera'],
            resourceType: 'image',
            clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp'],
            maxImageFileSize: 10_000_000,
            folder: 'uploads/listings/gallery',
          }}
        >
          {({ open }) => (
            <motion.button
              type="button"
              onClick={() => open?.()}
              variants={itemVariants}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 transition-all flex flex-col items-center justify-center gap-2"
            >
              {uploading ? (
                <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span className="text-sm text-gray-500">Add photo</span>
                </>
              )}
            </motion.button>
          )}
        </CldUploadWidget>
      </div>

      {galleryImages.length === 0 && (
        <p className="text-sm text-gray-400 text-center mt-6">
          You can skip this step or add photos later
        </p>
      )}
    </div>
  );
}
