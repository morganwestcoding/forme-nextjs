'use client';

import { useFormContext } from 'react-hook-form';
import { CldUploadWidget, type CldUploadWidgetResults } from 'next-cloudinary';
import { Image01Icon, CheckmarkCircle01Icon } from 'hugeicons-react';
import TypeformHeading from '../TypeformHeading';

const UPLOAD_PRESET = 'cs0am6m7';

export default function ImagesStep() {
  const { watch, setValue, register } = useFormContext();

  const image = watch('image');
  const backgroundImage = watch('backgroundImage');
  const name = watch('name');
  const jobTitle = watch('jobTitle');
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

      <div className="flex gap-8 items-start">
        {/* Left: Card Preview - actual WorkerCard size */}
        <div className="flex-shrink-0">
          <p className="text-xs text-gray-500 mb-2 text-center">Preview</p>
          <div
            className={`
              relative rounded-xl overflow-hidden shadow-lg
              ${backgroundImage ? '' : 'bg-neutral-100'}
            `}
            style={{ width: '250px', height: '280px' }}
          >
            {/* Background */}
            {backgroundImage ? (
              <img src={backgroundImage} alt="Background" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Image01Icon className="w-10 h-10 text-neutral-300" />
              </div>
            )}

            {/* Profile photo */}
            <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div
                className={`
                  rounded-full overflow-hidden border-2 border-white shadow-lg
                  ${image ? '' : 'bg-neutral-200'}
                `}
                style={{ width: '96px', height: '96px' }}
              >
                {image ? (
                  <img src={image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-neutral-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Name/title */}
            <div className="absolute bottom-4 left-4 right-4 z-10">
              <h3 className="text-lg font-semibold text-neutral-600 leading-tight truncate">{name || 'Your Name'}</h3>
              <p className="text-neutral-400 text-xs leading-tight truncate">{jobTitle || 'Your Title'}</p>
            </div>
          </div>
        </div>

        {/* Right: Upload buttons and bio */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Upload buttons */}
          <div className="grid grid-cols-2 gap-3">
            {/* Profile photo upload */}
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
                  className={`
                    flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed transition-all
                    ${image
                      ? 'border-emerald-200 bg-emerald-50'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                    }
                  `}
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center border
                    ${image ? 'bg-emerald-100 border-emerald-200' : 'bg-white border-gray-200'}
                  `}>
                    {image ? (
                      <CheckmarkCircle01Icon className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    )}
                  </div>
                  <div className="text-center">
                    <p className={`text-xs font-medium ${image ? 'text-emerald-700' : 'text-gray-700'}`}>
                      {image ? 'Profile added' : 'Profile photo'}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {image ? 'Click to change' : 'Click to upload'}
                    </p>
                  </div>
                </button>
              )}
            </CldUploadWidget>

            {/* Background photo upload */}
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
                croppingAspectRatio: 250 / 280,
                croppingShowBackButton: true,
                showSkipCropButton: false,
                folder: 'uploads/backgrounds',
              }}
            >
              {(bgProps) => (
                <button
                  type="button"
                  onClick={() => bgProps?.open?.()}
                  className={`
                    flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed transition-all
                    ${backgroundImage
                      ? 'border-emerald-200 bg-emerald-50'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                    }
                  `}
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center border
                    ${backgroundImage ? 'bg-emerald-100 border-emerald-200' : 'bg-white border-gray-200'}
                  `}>
                    {backgroundImage ? (
                      <CheckmarkCircle01Icon className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    )}
                  </div>
                  <div className="text-center">
                    <p className={`text-xs font-medium ${backgroundImage ? 'text-emerald-700' : 'text-gray-700'}`}>
                      {backgroundImage ? 'Cover added' : 'Cover photo'}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {backgroundImage ? 'Click to change' : 'Click to upload'}
                    </p>
                  </div>
                </button>
              )}
            </CldUploadWidget>
          </div>

          {/* Bio input */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              Bio <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="bio"
              {...register('bio')}
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none"
              placeholder="Tell clients a bit about yourself..."
            />
            <p className="text-xs text-gray-400 text-right mt-1">
              {(bio?.length || 0)}/500
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
