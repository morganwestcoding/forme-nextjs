'use client';

import { CldUploadWidget, type CldUploadWidgetResults } from 'next-cloudinary';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { PencilEdit01Icon } from 'hugeicons-react';
import TypeformHeading from '@/components/registration/TypeformHeading';

interface DetailsStepProps {
  imageSrc: string;
  title: string;
  location: string;
  onImageChange: (url: string) => void;
}

const UPLOAD_PRESET = 'cs0am6m7';
const LISTING_CARD_ASPECT = 250 / 280;

export default function DetailsStep({
  imageSrc,
  title,
  location,
  onImageChange,
}: DetailsStepProps) {
  const { register, formState: { errors } } = useFormContext();

  const handleUpload = useCallback((result: CldUploadWidgetResults) => {
    const info = result?.info;
    if (info && typeof info === 'object' && 'secure_url' in info) {
      const publicId = (info as any).public_id;
      let cloudName: string | null = null;

      if (typeof info.secure_url === 'string') {
        const urlMatch = info.secure_url.match(/res\.cloudinary\.com\/([^/]+)/);
        cloudName = urlMatch ? urlMatch[1] : null;
      }

      if (publicId && cloudName) {
        const width = 500;
        const height = Math.round(width / LISTING_CARD_ASPECT);
        const transformations = `q_auto:good,f_auto,w_${width},h_${height},c_fill,g_auto`;
        const finalUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`;
        onImageChange(finalUrl);
      } else {
        onImageChange(info.secure_url as string);
      }
    }
  }, [onImageChange]);

  return (
    <div>
      <TypeformHeading
        question="Tell us about your business"
        subtitle="This is how clients will find you"
      />

      <div className="flex flex-col sm:flex-row gap-6 sm:items-center">
        {/* Left: Image upload / preview */}
        <div className="flex-shrink-0">
          <CldUploadWidget
            uploadPreset={UPLOAD_PRESET}
            onSuccess={handleUpload}
            options={{
              multiple: false,
              maxFiles: 1,
              sources: ['local', 'camera'],
              resourceType: 'image',
              clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp'],
              maxImageFileSize: 10_000_000,
              cropping: true,
              croppingAspectRatio: LISTING_CARD_ASPECT,
              croppingShowBackButton: true,
              showSkipCropButton: false,
              folder: 'uploads/listings',
            }}
          >
            {(props) => (
              <div
                onClick={() => props?.open?.()}
                className={`
                  group cursor-pointer rounded-xl overflow-hidden relative transition-all duration-300
                  ${imageSrc
                    ? 'hover:shadow-lg bg-neutral-900 hover:-translate-y-1'
                    : 'border-2 border-dashed border-gray-200 bg-gray-50/50 hover:border-gray-900 hover:bg-gray-100'}
                `}
                style={{ width: '200px', height: '224px' }}
              >
                {imageSrc ? (
                  <>
                    <img
                      src={imageSrc}
                      alt="Listing preview"
                      className="w-full h-full object-cover transition-[transform,filter] duration-500 ease-out group-hover:scale-105 group-hover:brightness-105"
                    />
                    <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <PencilEdit01Icon className="w-5 h-5 text-white drop-shadow-sm" />
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                      <Plus className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </CldUploadWidget>
        </div>

        {/* Right: Form inputs */}
        <div className="flex-1 min-w-0 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Listing title
            </label>
            <input
              id="title"
              type="text"
              {...register('title', { required: 'Title is required' })}
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              placeholder="e.g., John's Hair Studio"
            />
            {errors.title && (
              <p className="mt-2 text-sm text-red-500">{errors.title.message as string}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              {...register('description', { required: 'Description is required' })}
              rows={3}
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none"
              placeholder="Briefly describe your services"
            />
            {errors.description && (
              <p className="mt-2 text-sm text-red-500">{errors.description.message as string}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
