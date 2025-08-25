// components/inputs/ImageUploadGrid.tsx
'use client';

import React from 'react';
import { CldUploadWidget, type CldUploadWidgetResults } from 'next-cloudinary';
import Image from 'next/image';

declare global { var cloudinary: any }

const UPLOAD_PRESET = 'cs0am6m7';

interface ImageUploadGridProps {
  onChange: (value: string) => void;            // primary (profile) image
  onGalleryChange: (values: string[]) => void;   // gallery images
  value: string;
  galleryImages: string[];
  id?: string;
}

function getSecureUrl(res: CldUploadWidgetResults): string | undefined {
  // @ts-expect-error Cloudinary typing is loose
  return res?.info?.secure_url as string | undefined;
}

const profileFrame =
  'relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-white ' +
  'hover:border-blue-500 hover:shadow-md transition-all duration-200';

const imgActions =
  'absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition';

const addTileCard =
  'group relative rounded-2xl border-2 border-gray-200 bg-white p-3 ' +
  'hover:border-blue-500 hover:shadow-md transition-all duration-200';

const ImageUploadGrid: React.FC<ImageUploadGridProps> = ({
  onChange,
  onGalleryChange,
  value,
  galleryImages,
  id
}) => {
  return (
    <div id={id} className="flex flex-col gap-6">
      {/* Profile image */}
      <div>
        <div className="text-sm font-medium text-neutral-700 mb-2">Profile image</div>

        <CldUploadWidget
          uploadPreset={UPLOAD_PRESET}
          onUpload={(res) => {
            const url = getSecureUrl(res);
            if (url) onChange(url);
          }}
          options={{ multiple: false, maxFiles: 1, sources: ['local', 'url', 'camera'], folder: 'uploads' }}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open?.()}
              className={`${profileFrame} w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 mx-auto group`}
            >
              {!value ? (
                <div className="grid place-items-center w-full h-full">
                  <div className="rounded-full flex items-center justify-center bg-gray-100 text-gray-600 w-7 h-7 group-hover:bg-blue-50 group-hover:text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24">
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="mt-1 text-xs text-gray-600">Upload profile image</p>
                </div>
              ) : (
                <>
                  <Image src={value} alt="Profile image" fill className="object-cover" />
                  <div className={imgActions}>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); open?.(); }}
                      className="inline-flex items-center rounded-md px-2 py-1 text-[10px] font-medium bg-white/95 text-neutral-900 ring-1 ring-neutral-200 hover:bg-white"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onChange(''); }}
                      className="inline-flex items-center rounded-md px-2 py-1 text-[10px] font-medium bg-white/95 text-neutral-900 ring-1 ring-neutral-200 hover:bg-white"
                    >
                      Remove
                    </button>
                  </div>
                </>
              )}
            </button>
          )}
        </CldUploadWidget>
      </div>

      {/* Gallery — 3 cols on small, 4 cols on md+ to fill the row */}
      <div>
        <div className="text-sm font-medium text-neutral-700 mb-2">Gallery</div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
          {galleryImages.map((url, index) => (
            <CldUploadWidget
              key={`gallery-${index}`}
              uploadPreset={UPLOAD_PRESET}
              onUpload={(res) => {
                const nextUrl = getSecureUrl(res);
                if (!nextUrl) return;
                const next = [...galleryImages];
                next[index] = nextUrl;
                onGalleryChange(next);
              }}
              options={{ multiple: false, maxFiles: 1, sources: ['local', 'url', 'camera'], folder: 'uploads' }}
            >
              {({ open }) => (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => open?.()}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open?.(); } }}
                  className="relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-white hover:border-blue-500 hover:shadow-md transition-all duration-200 group w-full"
                >
                  {/* Safari-safe square (width controls height) */}
                  <div className="pb-[100%]" aria-hidden />
                  <div className="absolute inset-0">
                    {url ? (
                      <>
                        <Image src={url} alt={`Gallery ${index + 1}`} fill className="object-cover" />
                        <div className={imgActions}>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); open?.(); }}
                            className="inline-flex items-center rounded-md px-2 py-1 text-[10px] font-medium bg-white/95 text-neutral-900 ring-1 ring-neutral-200 hover:bg-white"
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const next = galleryImages.filter((_, i) => i !== index);
                              onGalleryChange(next);
                            }}
                            className="inline-flex items-center rounded-md px-2 py-1 text-[10px] font-medium bg-white/95 text-neutral-900 ring-1 ring-neutral-200 hover:bg-white"
                          >
                            Remove
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="grid place-items-center w-full h-full">
                        <div className="rounded-full flex items-center justify-center bg-gray-100 text-gray-600 w-6 h-6">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24">
                            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </div>
                        <p className="mt-1 text-[10px] text-gray-600">Upload</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CldUploadWidget>
          ))}

          {/* Add photo tile – participates in the first row on sm+ */}
          <CldUploadWidget
            uploadPreset={UPLOAD_PRESET}
            onUpload={(res) => {
              const url = getSecureUrl(res);
              if (!url) return;
              onGalleryChange([...(galleryImages || []), url]);
            }}
            options={{ multiple: false, maxFiles: 1, sources: ['local', 'url', 'camera'], folder: 'uploads' }}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={() => open?.()}
                className={`${addTileCard} relative w-full`}
              >
                <div className="pb-[100%]" aria-hidden />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <div className="rounded-full flex items-center justify-center bg-gray-100 text-gray-600 w-6 h-6 group-hover:bg-blue-50 group-hover:text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24">
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="min-w-0 text-center">
                    <p className="text-[13px] font-medium text-gray-900">Add a photo</p>
                    <p className="text-[11px] text-gray-500">PNG, JPG, WebP</p>
                  </div>
                </div>
              </button>
            )}
          </CldUploadWidget>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadGrid;
