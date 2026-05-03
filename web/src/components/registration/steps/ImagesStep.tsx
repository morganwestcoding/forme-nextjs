'use client';

import { useRef, useState, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { Camera01Icon, PencilEdit01Icon } from 'hugeicons-react';
import TypeformHeading from '../TypeformHeading';
import ImageCropModal from '@/components/inputs/ImageCropModal';
import { uploadToCloudinary, buildTransformUrl } from '@/lib/cloudinary';

interface ImagesStepProps {
  userType?: string;
}

export default function ImagesStep({ userType }: ImagesStepProps) {
  const { watch, setValue, register } = useFormContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const image = watch('image');
  const bio = watch('bio');
  const firstName = watch('firstName');
  const lastName = watch('lastName');
  const name = [firstName, lastName].filter(Boolean).join(' ');
  const jobTitle = watch('jobTitle');

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
      const data = await uploadToCloudinary(blob, 'uploads/profiles');
      const finalUrl = buildTransformUrl(data.public_id, 'q_auto:good,f_auto,w_400,h_400,c_fill,g_face');
      setValue('image', finalUrl);
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
        question="Almost done!"
        subtitle={userType === 'customer' ? "Add a photo to personalize your profile" : "Add your photo so clients can recognize you"}
      />

      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="max-w-xl">
        {/* Profile section - avatar + info */}
        <div className="flex items-center gap-4">
          {/* Profile Photo */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-20 h-20 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-700 shadow-elevation-2 transition-colors relative overflow-hidden group flex-shrink-0 disabled:opacity-60"
          >
            {uploading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-5 h-5 border-2 border-stone-200 border-t-stone-600 rounded-full animate-spin" />
              </div>
            ) : image ? (
              <>
                <img src={image} alt="Profile" className="w-full h-full object-cover" />
                <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <PencilEdit01Icon className="w-5 h-5 text-white drop-shadow-sm" />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-stone-400 dark:text-stone-500">
                <Camera01Icon className="w-6 h-6" />
              </div>
            )}
          </button>

          {/* Name preview */}
          <div className="flex flex-col items-start">
            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">{name || 'Your Name'}</h3>
            <p className="text-sm text-stone-500 dark:text-stone-500">{jobTitle || 'Your profession'}</p>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-8">
          <label htmlFor="bio" className="block text-sm font-medium text-stone-900 dark:text-stone-100 mb-2">
            Bio
          </label>
          <textarea
            id="bio"
            {...register('bio')}
            rows={2}
            maxLength={350}
            className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all resize-none"
            placeholder="Tell clients a bit about yourself..."
          />
          <p className="text-xs text-stone-400 dark:text-stone-500 text-right mt-1">
            {(bio?.length || 0)}/350
          </p>
        </div>
      </div>

      {cropSrc && (
        <ImageCropModal
          isOpen
          imageSrc={cropSrc}
          aspect={1}
          onClose={handleCropClose}
          onComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
