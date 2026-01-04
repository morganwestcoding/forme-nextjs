'use client';

import { useFormContext } from 'react-hook-form';
import { CldUploadWidget, type CldUploadWidgetResults } from 'next-cloudinary';
import { Camera01Icon, Image01Icon } from 'hugeicons-react';
import TypeformHeading from '../TypeformHeading';

const UPLOAD_PRESET = 'cs0am6m7';

export default function ImagesStep() {
  const { watch, setValue, register } = useFormContext();

  const image = watch('image');
  const backgroundImage = watch('backgroundImage');
  const bio = watch('bio');

  const handleProfileUpload = (result: CldUploadWidgetResults) => {
    const info = result?.info;
    if (info && typeof info === 'object' && 'secure_url' in info) {
      const publicId = (info as any).public_id;
      let cloudName: string | null = null;
      if (typeof info.secure_url === 'string') {
        const urlMatch = info.secure_url.match(/res\.cloudinary\.com\/([^/]+)/);
        cloudName = urlMatch ? urlMatch[1] : null;
      }
      if (publicId && cloudName) {
        const finalUrl = `https://res.cloudinary.com/${cloudName}/image/upload/q_auto:good,f_auto,w_400,h_400,c_fill,g_face/${publicId}`;
        setValue('image', finalUrl);
      } else {
        setValue('image', info.secure_url as string);
      }
    }
  };

  const handleBackgroundUpload = (result: CldUploadWidgetResults) => {
    const info = result?.info;
    if (info && typeof info === 'object' && 'secure_url' in info) {
      const publicId = (info as any).public_id;
      let cloudName: string | null = null;
      if (typeof info.secure_url === 'string') {
        const urlMatch = info.secure_url.match(/res\.cloudinary\.com\/([^/]+)/);
        cloudName = urlMatch ? urlMatch[1] : null;
      }
      if (publicId && cloudName) {
        const finalUrl = `https://res.cloudinary.com/${cloudName}/image/upload/q_auto:good,f_auto,w_500,h_560,c_fill,g_auto/${publicId}`;
        setValue('backgroundImage', finalUrl);
      } else {
        setValue('backgroundImage', info.secure_url as string);
      }
    }
  };

  return (
    <div>
      <TypeformHeading
        question="Almost done!"
        subtitle="Add your photos so clients can recognize you"
      />

      <div className="max-w-xl">
        {/* Cover Photo */}
        <CldUploadWidget
          uploadPreset={UPLOAD_PRESET}
          onSuccess={handleBackgroundUpload}
          options={{
            multiple: false,
            maxFiles: 1,
            sources: ['local', 'camera'],
            resourceType: 'image',
            clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp'],
            maxImageFileSize: 10_000_000,
            cropping: true,
            croppingAspectRatio: 3,
            croppingShowBackButton: true,
            showSkipCropButton: false,
            folder: 'uploads/backgrounds',
          }}
        >
          {(bgProps) => (
            <button
              type="button"
              onClick={() => bgProps?.open?.()}
              className="w-full h-28 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors relative overflow-hidden group"
            >
              {backgroundImage ? (
                <>
                  <img src={backgroundImage} alt="Cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">Change cover</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full gap-2 text-gray-400">
                  <Image01Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">Add cover photo</span>
                </div>
              )}
            </button>
          )}
        </CldUploadWidget>

        {/* Profile section - avatar + info like ProfileHead */}
        <div className="flex items-center gap-4 -mt-10 ml-4">
          {/* Profile Photo */}
          <CldUploadWidget
            uploadPreset={UPLOAD_PRESET}
            onSuccess={handleProfileUpload}
            options={{
              multiple: false,
              maxFiles: 1,
              sources: ['local', 'camera'],
              resourceType: 'image',
              clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp'],
              maxImageFileSize: 5_000_000,
              cropping: true,
              croppingAspectRatio: 1,
              croppingShowBackButton: true,
              showSkipCropButton: false,
              folder: 'uploads/profiles',
            }}
          >
            {(profileProps) => (
              <button
                type="button"
                onClick={() => profileProps?.open?.()}
                className="w-20 h-20 rounded-full bg-gray-100 hover:bg-gray-200 border-4 border-white shadow-lg transition-colors relative overflow-hidden group flex-shrink-0"
              >
                {image ? (
                  <>
                    <img src={image} alt="Profile" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <Camera01Icon className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Camera01Icon className="w-6 h-6" />
                  </div>
                )}
              </button>
            )}
          </CldUploadWidget>

          {/* Name preview + helper text */}
          <div className="flex flex-col items-start pt-8">
            <h3 className="text-xl font-bold text-gray-900">{name || 'Your Name'}</h3>
            <p className="text-sm text-gray-500">{jobTitle || 'Your profession'}</p>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-8">
          <label htmlFor="bio" className="block text-sm font-medium text-gray-900 mb-2">
            Bio <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="bio"
            {...register('bio')}
            rows={2}
            maxLength={150}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none"
            placeholder="Tell clients a bit about yourself..."
          />
          <p className="text-xs text-gray-400 text-right mt-1">
            {(bio?.length || 0)}/150
          </p>
        </div>
      </div>
    </div>
  );
}
