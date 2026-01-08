'use client';

import { CldUploadWidget, type CldUploadWidgetResults } from 'next-cloudinary';
import { useState, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
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
        const width = 500;
        const height = Math.round(width / LISTING_CARD_ASPECT);
        const transformations = `q_auto:good,f_auto,w_${width},h_${height},c_fill,g_auto`;
        const finalUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`;
        onImageChange(finalUrl);
      } else {
        onImageChange(info.secure_url as string);
      }
    }
    setUploading(false);
  }, [onImageChange]);

  return (
    <div>
      <TypeformHeading
        question="Tell us about your business"
        subtitle="Add a photo and description to attract customers"
      />

      <div className="space-y-6">
        {/* Photo Upload - Centered */}
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
            cropping: true,
            croppingAspectRatio: LISTING_CARD_ASPECT,
            croppingShowBackButton: true,
            showSkipCropButton: false,
            folder: 'uploads/listings',
          }}
        >
          {({ open }) => (
            <div className="flex justify-center">
              <div
                onClick={() => open?.()}
                className={`group cursor-pointer rounded-2xl overflow-hidden relative transition-all duration-200 ${imageSrc ? 'hover:opacity-90' : 'border-2 border-dashed border-gray-300 hover:border-gray-400 bg-gray-50'}`}
                style={{ width: '160px', height: '180px' }}
              >
                {imageSrc ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageSrc}
                      alt="Listing preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-2xl">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                      </svg>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <svg
                      className="w-8 h-8 text-gray-400 mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-500">Add photo</span>
                  </div>
                )}

                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>
          )}
        </CldUploadWidget>

        {/* Business Name */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Business name
          </label>
          <input
            id="title"
            type="text"
            {...register('title', { required: 'Business name is required' })}
            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            placeholder="Your business name"
          />
          {errors.title && (
            <p className="mt-2 text-sm text-red-500">{errors.title.message as string}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            {...register('description', { required: 'Description is required' })}
            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none"
            placeholder="Describe what makes your business special..."
          />
          {errors.description && (
            <p className="mt-2 text-sm text-red-500">{errors.description.message as string}</p>
          )}
        </div>
      </div>
    </div>
  );
}
