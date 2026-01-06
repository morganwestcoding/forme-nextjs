'use client';

import { ArrowLeft } from 'lucide-react';
import TypeformHeading from '@/components/registration/TypeformHeading';
import ImageUpload from '@/components/inputs/ImageUpload';

interface ImageFormStepProps {
  imageSrc: string;
  galleryImages: string[];
  editingIndex: number;
  title: string;
  location: string;
  onImageChange: (url: string) => void;
  onGalleryChange: (images: string[]) => void;
  onBack: () => void;
}

export default function ImageFormStep({
  imageSrc,
  galleryImages,
  editingIndex,
  title,
  location,
  onImageChange,
  onGalleryChange,
  onBack,
}: ImageFormStepProps) {
  const isMainImage = editingIndex === 0;
  const currentGalleryIndex = isMainImage ? -1 : editingIndex - 1;
  const currentImageValue = isMainImage ? imageSrc : (galleryImages[currentGalleryIndex] || '');
  const isNewImage = editingIndex >= (imageSrc ? 1 : 0) + galleryImages.length;

  const LISTING_CARD_ASPECT = 250 / 280;

  if (isMainImage) {
    return (
      <div>
        <div className="mb-6">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to images</span>
          </button>
        </div>

        <TypeformHeading
          question="Set your main listing photo"
          subtitle="This is the primary image displayed on listing cards"
        />

        <div className="flex gap-5 items-start">
          {/* Left: Listing Card Preview */}
          <div className="flex-shrink-0">
            <div
              className="rounded-xl overflow-hidden relative"
              style={{ width: '250px', height: '280px' }}
            >
              <div className="absolute inset-0 z-0">
                {currentImageValue ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentImageValue}
                      alt="Listing preview"
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          'linear-gradient(to top,' +
                          'rgba(0,0,0,0.72) 0%,' +
                          'rgba(0,0,0,0.55) 18%,' +
                          'rgba(0,0,0,0.32) 38%,' +
                          'rgba(0,0,0,0.12) 55%,' +
                          'rgba(0,0,0,0.00) 70%)',
                      }}
                    />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200">
                    <div className="absolute top-[35%] left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-16 h-16 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center border border-gray-200">
                        <svg
                          className="w-7 h-7 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                      </div>
                    </div>
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          'linear-gradient(to top,' +
                          'rgba(0,0,0,0.55) 0%,' +
                          'rgba(0,0,0,0.40) 20%,' +
                          'rgba(0,0,0,0.20) 40%,' +
                          'rgba(0,0,0,0.00) 60%)',
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="absolute bottom-4 left-4 right-4 z-10">
                <h3 className="text-white text-base leading-tight font-semibold drop-shadow line-clamp-2 mb-0.5">
                  {title || 'Your Listing Title'}
                </h3>
                <div className="text-white/90 text-xs leading-tight mb-2.5">
                  <span className="line-clamp-1">{location || 'Your location'}</span>
                </div>
                <div className="flex items-center">
                  <span className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-lg text-white text-xs font-medium">
                    Preview
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Upload Control */}
          <div className="flex-1 min-w-0 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Main listing photo
              </label>
              <ImageUpload
                value={currentImageValue}
                onChange={onImageChange}
                onRemove={() => onImageChange('')}
                ratio="square"
                rounded="xl"
                enableCrop={true}
                cropMode="fixed"
                customAspectRatio={LISTING_CARD_ASPECT}
                label=""
                uploadId="listing-main"
                className="w-full h-32"
              />
              <p className="text-[11px] text-gray-400 mt-1.5">
                Cropped to fit listing cards (250x280)
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={onBack}
            className="w-full px-6 py-2.5 rounded-lg font-medium text-sm bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98] transition-all duration-200"
          >
            Save photo
          </button>
        </div>
      </div>
    );
  }

  // Gallery image form
  return (
    <div>
      <div className="mb-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to images</span>
        </button>
      </div>

      <TypeformHeading
        question={isNewImage ? "Add gallery image" : "Edit gallery image"}
        subtitle="Additional photos shown in listing details"
      />

      <ImageUpload
        value={currentImageValue}
        onChange={(url) => {
          const newGallery = [...galleryImages];
          if (currentGalleryIndex < newGallery.length) {
            newGallery[currentGalleryIndex] = url;
          } else {
            newGallery.push(url);
          }
          onGalleryChange(newGallery);
        }}
        onRemove={() => {
          const newGallery = galleryImages.filter((_, i) => i !== currentGalleryIndex);
          onGalleryChange(newGallery);
        }}
        ratio="square"
        label="Upload Gallery Image"
        uploadId={`listing-gallery-${currentGalleryIndex}`}
        className="w-full max-w-2xl mx-auto"
      />

      <div className="mt-6">
        <button
          type="button"
          onClick={onBack}
          className="w-full px-6 py-2.5 rounded-lg font-medium text-sm bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98] transition-all duration-200"
        >
          Save photo
        </button>
      </div>
    </div>
  );
}
