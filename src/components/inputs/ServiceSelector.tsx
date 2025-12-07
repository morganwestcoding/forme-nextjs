'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { CldUploadWidget, type CldUploadWidgetResults } from 'next-cloudinary';
import { categories } from '../Categories';
import { Check } from 'lucide-react';

export type Service = {
  id?: string;           // carry DB id so PUT can upsert, not delete
  serviceName: string;
  price: number;
  category: string;
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
            <div key={`svc-row-${i}`} className="flex gap-5 items-start">
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
                      className="group cursor-pointer rounded-xl overflow-hidden relative transition-all duration-300 hover:-translate-y-1 hover:shadow-lg max-w-[250px]"
                      style={{ width: '250px', height: '280px' }}
                    >
                      {/* Background */}
                      <div className="absolute inset-0 z-0">
                        {hasImage ? (
                          <>
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
                          </>
                        ) : (
                          /* Empty state - clean placeholder */
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200">
                            {/* Centered camera icon */}
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
                            {/* Bottom gradient for text readability */}
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

                      {/* Content overlay - matches ServiceCard */}
                      <div className="absolute bottom-4 left-4 right-4 z-10">
                        {/* Service Name */}
                        <h3 className="text-white text-lg leading-tight font-semibold drop-shadow mb-0.5 truncate">
                          {svc.serviceName || 'Untitled Service'}
                        </h3>

                        {/* Category + Duration */}
                        <div className="text-white/90 text-xs leading-tight mb-2.5">
                          <span className="line-clamp-1">{svc.category || 'Category'} · 60 min</span>
                        </div>

                        {/* Price badge - matches SmartBadgePrice dark variant */}
                        <div className="flex items-center">
                          <span className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-lg text-white text-sm font-semibold">
                            ${priceNum > 0 ? priceNum.toFixed(0) : '0'}
                          </span>
                        </div>
                      </div>

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 z-20">
                        <span className="text-white text-sm font-medium px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
                          {hasImage ? 'Change photo' : 'Add photo'}
                        </span>
                      </div>

                      {/* Uploading overlay */}
                      {uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
                          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                  )}
                </CldUploadWidget>

                {/* Success indicator */}
                {hasImage && !uploading && (
                  <div className="flex items-center justify-center gap-1.5 mt-3">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-emerald-600" />
                    </div>
                    <span className="text-xs text-emerald-600 font-medium">Photo added</span>
                  </div>
                )}
              </div>

              {/* Right: Form Controls */}
              <div className="flex-1 min-w-0 space-y-4">
                {/* Service Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Service name
                  </label>
                  <input
                    id={`serviceName-${i}`}
                    value={svc.serviceName}
                    onChange={(e) => setRow(i, { serviceName: e.target.value })}
                    placeholder="e.g. Haircut, Massage..."
                    className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all placeholder:text-gray-400"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                    <input
                      id={`servicePrice-${i}`}
                      value={priceInputs[i]}
                      onChange={(e) => handlePriceChange(i, e.target.value)}
                      onBlur={() => handlePriceBlur(i)}
                      inputMode="decimal"
                      placeholder="0.00"
                      className="w-full pl-7 pr-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Category
                  </label>
                  <select
                    value={svc.category}
                    onChange={(e) => setRow(i, { category: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                    }}
                  >
                    <option value="">Select category</option>
                    {categoryOptions.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Tip */}
                <p className="text-xs text-gray-400">
                  Click the card to add a photo
                </p>
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