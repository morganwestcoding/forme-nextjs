'use client';

import { useFormContext } from 'react-hook-form';
import { CldUploadWidget, type CldUploadWidgetResults } from 'next-cloudinary';
import { Plus, Check } from 'lucide-react';
import TypeformHeading from '../TypeformHeading';

const UPLOAD_PRESET = 'cs0am6m7';
const LISTING_CARD_ASPECT = 250 / 280;

export default function ListingInfoStep() {
  const { register, watch, setValue, formState: { errors } } = useFormContext();

  const listingImage = watch('listingImage');

  const handleImageUpload = (result: CldUploadWidgetResults) => {
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
        setValue('listingImage', finalUrl);
      } else {
        setValue('listingImage', info.secure_url as string);
      }
    }
  };

  return (
    <div>
      <TypeformHeading
        question="Create your listing"
        subtitle="This is how clients will find you"
      />

      <div className="flex gap-6 items-center">
        {/* Left: Image upload / preview */}
        <div className="flex-shrink-0">
          <CldUploadWidget
            uploadPreset={UPLOAD_PRESET}
            onSuccess={handleImageUpload}
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
                  ${listingImage
                    ? 'hover:shadow-lg bg-neutral-900 hover:-translate-y-1'
                    : 'border-2 border-dashed border-gray-200 bg-gray-50/50 hover:border-gray-900 hover:bg-gray-100'}
                `}
                style={{ width: '200px', height: '224px' }}
              >
                {listingImage ? (
                  <>
                    <img
                      src={listingImage}
                      alt="Listing preview"
                      className="w-full h-full object-cover transition-[transform,filter] duration-500 ease-out group-hover:scale-105 group-hover:brightness-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="text-white text-xs font-medium px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg">Change</span>
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

          {listingImage && (
            <div className="flex items-center justify-center gap-1.5 mt-3">
              <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-emerald-600" />
              </div>
              <span className="text-xs text-emerald-600 font-medium">Photo added</span>
            </div>
          )}
        </div>

        {/* Right: Form inputs */}
        <div className="flex-1 min-w-0 space-y-4">
          <div>
            <label htmlFor="listingTitle" className="block text-sm font-medium text-gray-700 mb-2">
              Listing title
            </label>
            <input
              id="listingTitle"
              type="text"
              {...register('listingTitle', { required: 'Title is required' })}
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              placeholder="e.g., John's Hair Studio"
            />
            {errors.listingTitle && (
              <p className="mt-2 text-sm text-red-500">{errors.listingTitle.message as string}</p>
            )}
          </div>

          <div>
            <label htmlFor="listingDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              id="listingDescription"
              type="text"
              {...register('listingDescription', { required: 'Description is required' })}
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              placeholder="Briefly describe your services"
            />
            {errors.listingDescription && (
              <p className="mt-2 text-sm text-red-500">{errors.listingDescription.message as string}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
