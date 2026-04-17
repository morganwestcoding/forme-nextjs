'use client';

import { useRef, useState, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';

import TypeformHeading from '../TypeformHeading';
import { PencilEdit01Icon, PlusSignIcon as Plus } from 'hugeicons-react';
import ImageCropModal from '@/components/inputs/ImageCropModal';
import { uploadToCloudinary, buildTransformUrl } from '@/lib/cloudinary';

const LISTING_CARD_ASPECT = 250 / 280;

export default function ListingInfoStep() {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const listingImage = watch('listingImage');

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setCropSrc(URL.createObjectURL(file));
  }, []);

  const handleCropComplete = useCallback(async (blob: Blob) => {
    setCropSrc(null);
    setUploading(true);
    try {
      const data = await uploadToCloudinary(blob, 'uploads/listings');
      const width = 500;
      const height = Math.round(width / LISTING_CARD_ASPECT);
      const finalUrl = buildTransformUrl(data.public_id, `q_auto:good,f_auto,w_${width},h_${height},c_fill,g_auto`);
      setValue('listingImage', finalUrl);
    } catch {
      // upload failed
    } finally {
      setUploading(false);
    }
  }, [setValue]);

  const handleCropClose = useCallback(() => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  }, [cropSrc]);

  return (
    <div>
      <TypeformHeading
        question="Create your listing"
        subtitle="This is how clients will find you"
      />

      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex flex-col sm:flex-row gap-6 sm:items-center">
        {/* Left: Image upload / preview */}
        <div className="flex-shrink-0">
          <div
            onClick={() => !uploading && inputRef.current?.click()}
            className={`
              group cursor-pointer rounded-xl overflow-hidden relative transition-all duration-300
              ${listingImage
                ? 'hover:shadow-lg bg-stone-900 hover:-translate-y-1'
                : 'border-2 border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/50 hover:border-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800'}
              ${uploading ? 'opacity-60 pointer-events-none' : ''}
            `}
            style={{ width: '200px', height: '224px' }}
          >
            {uploading ? (
              <div className="h-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-stone-200 border-t-stone-600 rounded-full animate-spin" />
              </div>
            ) : listingImage ? (
              <>
                <img
                  src={listingImage}
                  alt="Listing preview"
                  className="w-full h-full object-cover transition-[transform,filter] duration-500 ease-out group-hover:scale-105 group-hover:brightness-105"
                />
                <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <PencilEdit01Icon className="w-5 h-5 text-white drop-shadow-sm" />
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-center shadow-sm">
                  <Plus className="w-5 h-5 text-stone-400 dark:text-stone-500" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Form inputs */}
        <div className="flex-1 min-w-0 space-y-4">
          <div>
            <label htmlFor="listingTitle" className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
              Listing title
            </label>
            <input
              id="listingTitle"
              type="text"
              {...register('listingTitle', { required: 'Title is required' })}
              className="w-full px-4 py-3.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all"
              placeholder="e.g., John's Hair Studio"
            />
            {errors.listingTitle && (
              <p className="mt-2 text-sm text-red-500">{errors.listingTitle.message as string}</p>
            )}
          </div>

          <div>
            <label htmlFor="listingDescription" className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
              Description
            </label>
            <textarea
              id="listingDescription"
              {...register('listingDescription', { required: 'Description is required' })}
              rows={3}
              className="w-full px-4 py-3.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all resize-none"
              placeholder="Briefly describe your services"
            />
            {errors.listingDescription && (
              <p className="mt-2 text-sm text-red-500">{errors.listingDescription.message as string}</p>
            )}
          </div>
        </div>
      </div>

      {cropSrc && (
        <ImageCropModal
          isOpen
          imageSrc={cropSrc}
          aspect={LISTING_CARD_ASPECT}
          onClose={handleCropClose}
          onComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
