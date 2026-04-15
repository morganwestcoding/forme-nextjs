'use client';

import { useFormContext } from 'react-hook-form';
import { CldUploadWidget, type CldUploadWidgetResults } from 'next-cloudinary';
import { Camera01Icon, PencilEdit01Icon } from 'hugeicons-react';
import TypeformHeading from '../TypeformHeading';

const UPLOAD_PRESET = 'cs0am6m7';

interface ImagesStepProps {
  userType?: string;
}

export default function ImagesStep({ userType }: ImagesStepProps) {
  const { watch, setValue, register } = useFormContext();

  const image = watch('image');
  const bio = watch('bio');
  const firstName = watch('firstName');
  const lastName = watch('lastName');
  const name = [firstName, lastName].filter(Boolean).join(' ');
  const jobTitle = watch('jobTitle');

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

  return (
    <div>
      <TypeformHeading
        question="Almost done!"
        subtitle={userType === 'customer' ? "Add a photo to personalize your profile" : "Add your photo so clients can recognize you"}
      />

      <div className="max-w-xl">
        {/* Profile section - avatar + info */}
        <div className="flex items-center gap-4">
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
              minImageWidth: 400,
              minImageHeight: 400,
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
                className="w-20 h-20 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:bg-stone-700 shadow-md transition-colors relative overflow-hidden group flex-shrink-0"
              >
                {image ? (
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
            )}
          </CldUploadWidget>

          {/* Name preview */}
          <div className="flex flex-col items-start">
            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">{name || 'Your Name'}</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 dark:text-stone-500">{jobTitle || 'Your profession'}</p>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-8">
          <label htmlFor="bio" className="block text-sm font-medium text-stone-900 dark:text-stone-100 mb-2">
            Bio <span className="text-stone-400 dark:text-stone-500 font-normal">(optional)</span>
          </label>
          <textarea
            id="bio"
            {...register('bio')}
            rows={2}
            maxLength={150}
            className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all resize-none"
            placeholder="Tell clients a bit about yourself..."
          />
          <p className="text-xs text-stone-400 dark:text-stone-500 text-right mt-1">
            {(bio?.length || 0)}/150
          </p>
        </div>
      </div>
    </div>
  );
}
