'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { CldUploadWidget, type CldUploadWidgetResults } from 'next-cloudinary';
import { categories } from '../Categories';

export type Service = {
  id?: string;           // carry DB id so PUT can upsert, not delete
  serviceName: string;
  price: number;
  category: string;
  duration?: number;     // duration in minutes
  imageSrc?: string;     // service-specific image
};

type ServiceSelectorProps = {
  onServicesChange: (services: Service[]) => void;
  existingServices: Service[];
  id?: string;
  /** when provided, only render this one row for focused, single-item editing */
  singleIndex?: number;
};

const UPLOAD_PRESET = 'cs0am6m7';
const MAX_ROWS = Number.POSITIVE_INFINITY;

// Service card aspect ratio: 250/280 ≈ 0.893
const CARD_ASPECT_RATIO = 250 / 280;

const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  onServicesChange,
  existingServices,
  id,
  singleIndex,
}) => {
  const hasExisting = Array.isArray(existingServices) && existingServices.length > 0;

  const initialRows: Service[] = hasExisting
    ? existingServices.map((s) => ({
        id: s.id,
        serviceName: s.serviceName ?? '',
        price: typeof s.price === 'number' ? s.price : 0,
        category: s.category ?? '',
        imageSrc: s.imageSrc ?? '',
      }))
    : [{ serviceName: '', price: 0, category: '', imageSrc: '' }];

  const [services, setServices] = useState<Service[]>(initialRows);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  // keep price as string for editing UX
  const [priceInputs, setPriceInputs] = useState<string[]>(
    initialRows.map((s) => (s.price ? Number(s.price).toFixed(2) : ''))
  );

  const categoryOptions = useMemo(
    () => categories.map((c) => c.label),
    []
  );

  useEffect(() => {
    const next = services.map((svc, i) => ({
      ...svc,
      price: parseFloat(priceInputs[i]) || 0,
    }));
    onServicesChange(next);
  }, [services, priceInputs, onServicesChange]);

  const setRow = (idx: number, patch: Partial<Service>) => {
    setServices((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...patch };
      return copy;
    });
  };

  const handlePriceChange = (idx: number, raw: string) => {
    const normalized = raw.replace(/[^\d.]/g, '');
    setPriceInputs((prev) => {
      const copy = [...prev];
      copy[idx] = normalized;
      return copy;
    });
  };

  const handlePriceBlur = (idx: number) => {
    setPriceInputs((prev) => {
      const copy = [...prev];
      const num = parseFloat(copy[idx]);
      copy[idx] = isNaN(num) ? '' : num.toFixed(2);
      return copy;
    });
  };

  const addService = () => {
    setServices((prev) => [...prev, { serviceName: '', price: 0, category: '', imageSrc: '' }]);
    setPriceInputs((prev) => [...prev, '']);
  };

  // Handle cloudinary upload result
  const handleUpload = useCallback((idx: number, result: CldUploadWidgetResults) => {
    const info = result?.info;
    if (info && typeof info === 'object' && 'secure_url' in info) {
      // Build cropped URL with correct aspect ratio
      const publicId = info.public_id;
      let cloudName: string | null = null;

      if (typeof info.secure_url === 'string') {
        const urlMatch = info.secure_url.match(/res\.cloudinary\.com\/([^/]+)/);
        cloudName = urlMatch ? urlMatch[1] : null;
      }

      if (publicId && cloudName) {
        // Apply cropping for 250/280 aspect ratio
        const width = 500;
        const height = Math.round(width / CARD_ASPECT_RATIO);
        const transformations = `q_auto:good,f_auto,w_${width},h_${height},c_fill,g_auto`;
        const finalUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`;
        setRow(idx, { imageSrc: finalUrl });
      } else {
        setRow(idx, { imageSrc: info.secure_url as string });
      }
    }
    setUploadingIndex(null);
  }, []);

  // determine which indices to render (single-item mode vs full)
  const indicesToRender = useMemo(() => {
    if (typeof singleIndex === 'number' && singleIndex >= 0 && singleIndex < services.length) {
      return [singleIndex];
    }
    return services.map((_, i) => i);
  }, [singleIndex, services]);

  return (
    <div id={id} className="w-full">
      <div className="space-y-8">
        {indicesToRender.map((i) => {
          const svc = services[i];
          const priceNum = parseFloat(priceInputs[i]) || 0;
          const hasImage = !!svc.imageSrc;
          const uploading = uploadingIndex === i;

          return (
            <div key={`svc-row-${i}`} className="flex gap-5 items-center">
              {/* Left: Service Card Preview (exact 250x280 like ServiceCard) */}
              <div className="flex-shrink-0">
                <CldUploadWidget
                  uploadPreset={UPLOAD_PRESET}
                  onUpload={(result) => handleUpload(i, result)}
                  onOpen={() => setUploadingIndex(i)}
                  options={{
                    multiple: false,
                    maxFiles: 1,
                    sources: ['local', 'camera'],
                    resourceType: 'image',
                    clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp'],
                    maxImageFileSize: 10_000_000,
                    cropping: true,
                    croppingAspectRatio: CARD_ASPECT_RATIO,
                    croppingShowBackButton: true,
                    showSkipCropButton: false,
                    folder: `uploads/services`,
                  }}
                >
                  {({ open }) => (
                    <div
                      onClick={() => open?.()}
                      className={`group cursor-pointer rounded-xl overflow-hidden relative transition-all duration-300 hover:-translate-y-1 max-w-[250px] ${hasImage ? 'hover:shadow-lg' : 'border-2 border-dashed border-neutral-200 hover:border-neutral-300 bg-neutral-50'}`}
                      style={{ width: '250px', height: '280px' }}
                    >
                      {hasImage ? (
                        <>
                          {/* Image state */}
                          <div className="absolute inset-0 z-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={svc.imageSrc}
                              alt={svc.serviceName || 'Service'}
                              className="w-full h-full object-cover"
                            />
                            {/* Top gradient */}
                            <div
                              className="absolute inset-0 pointer-events-none"
                              style={{
                                background:
                                  'linear-gradient(to bottom,' +
                                  'rgba(0,0,0,0.35) 0%,' +
                                  'rgba(0,0,0,0.20) 15%,' +
                                  'rgba(0,0,0,0.10) 30%,' +
                                  'rgba(0,0,0,0.00) 45%)',
                              }}
                            />
                            {/* Bottom gradient */}
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
                          </div>

                          {/* Content overlay */}
                          <div className="absolute bottom-4 left-4 right-4 z-10">
                            <h3 className="text-white text-lg leading-tight font-semibold drop-shadow mb-0.5 truncate">
                              {svc.serviceName || 'Untitled Service'}
                            </h3>
                            <div className="text-white/90 text-xs leading-tight mb-2.5">
                              <span className="line-clamp-1">{svc.category || 'Category'} · 60 min</span>
                            </div>
                            <div className="flex items-center">
                              <span className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-lg text-white text-sm font-semibold">
                                ${priceNum > 0 ? priceNum.toFixed(0) : '0'}
                              </span>
                            </div>
                          </div>

                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 z-20">
                            <span className="text-white text-sm font-medium px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
                              Change photo
                            </span>
                          </div>
                        </>
                      ) : (
                        /* Empty state - clean upload prompt */
                        <div className="h-full flex flex-col items-center justify-center text-center p-4">
                          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-3 group-hover:bg-neutral-200 transition-colors">
                            <svg
                              className="w-6 h-6 text-neutral-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-neutral-500 group-hover:text-neutral-600 transition-colors">Add photo</span>
                          <span className="text-xs text-neutral-400 mt-1">Click to upload</span>
                        </div>
                      )}

                      {/* Uploading overlay */}
                      {uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
                          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                  )}
                </CldUploadWidget>

              </div>

              {/* Right: Form Controls */}
              <div className="flex-1 min-w-0 space-y-4">
                {/* Service Name */}
                <div>
                  <label htmlFor={`serviceName-${i}`} className="block text-sm font-medium text-gray-700 mb-2">
                    Service name
                  </label>
                  <input
                    id={`serviceName-${i}`}
                    type="text"
                    value={svc.serviceName}
                    onChange={(e) => setRow(i, { serviceName: e.target.value })}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder="e.g. Haircut"
                  />
                </div>

                {/* Price & Category row */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label htmlFor={`servicePrice-${i}`} className="block text-sm font-medium text-gray-700 mb-2">
                      Price
                    </label>
                    <input
                      id={`servicePrice-${i}`}
                      type="text"
                      inputMode="decimal"
                      value={priceInputs[i]}
                      onChange={(e) => handlePriceChange(i, e.target.value)}
                      onBlur={() => handlePriceBlur(i)}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="flex-1">
                    <label htmlFor={`serviceCategory-${i}`} className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        id={`serviceCategory-${i}`}
                        value={svc.category}
                        onChange={(e) => setRow(i, { category: e.target.value })}
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select</option>
                        {categoryOptions.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hide global add button in single-item mode */}
      {typeof singleIndex !== 'number' && services.length < MAX_ROWS && (
        <button
          type="button"
          onClick={addService}
          className="mt-6 inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Service
        </button>
      )}
    </div>
  );
};

export default ServiceSelector;