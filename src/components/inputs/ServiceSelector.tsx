// components/inputs/ServiceSelector.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { categories } from '../Categories';
import FloatingLabelSelect, { FLSelectOption } from './FloatingLabelSelect';
import ImageUpload from './ImageUpload';

export type Service = {
  serviceName: string;
  price: number;
  category: string;
  /** Optional image used as the background for this service's card */
  imageSrc?: string;
};

type ServiceSelectorProps = {
  onServicesChange: (services: Service[]) => void;
  existingServices: Service[];
  /** Optional: shown in hints as the fallback image if a row has no image */
  listingImageSrc?: string;
  id?: string;
};

const MAX_ROWS = 6;

const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  onServicesChange,
  existingServices,
  listingImageSrc,
  id,
}) => {
  const hasExisting = Array.isArray(existingServices) && existingServices.length > 0;

  // Build initial rows WITHOUT duplicate keys
  const initialRows: Service[] = hasExisting
    ? existingServices.map((s) => ({
        serviceName: s.serviceName ?? '',
        price: typeof s.price === 'number' ? s.price : 0,
        category: s.category ?? '',
        imageSrc: s.imageSrc ?? '',
      }))
    : [{ serviceName: '', price: 0, category: '', imageSrc: '' }];

  const [services, setServices] = useState<Service[]>(initialRows);

  // Keep price as string for UX; derive from initialRows for consistent length
  const [priceInputs, setPriceInputs] = useState<string[]>(
    initialRows.map((s) => (s.price && s.price !== 0 ? Number(s.price).toFixed(2) : ''))
  );

  // label focus states
  const [focusedName, setFocusedName] = useState<boolean[]>(
    initialRows.map(() => false)
  );
  const [focusedPrice, setFocusedPrice] = useState<boolean[]>(
    initialRows.map(() => false)
  );

  const categoryOptions: FLSelectOption[] = useMemo(
    () => categories.map((c) => ({ label: c.label, value: c.label })),
    []
  );

  // Emit numeric values upward (include imageSrc passthrough)
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
    if (services.length >= MAX_ROWS) return;
    setServices((prev) => [...prev, { serviceName: '', price: 0, category: '', imageSrc: '' }]);
    setPriceInputs((prev) => [...prev, '']);
    setFocusedName((prev) => [...prev, false]);
    setFocusedPrice((prev) => [...prev, false]);
  };

  const removeService = (indexToRemove: number) => {
    setServices((prev) => prev.filter((_, i) => i !== indexToRemove));
    setPriceInputs((prev) => prev.filter((_, i) => i !== indexToRemove));
    setFocusedName((prev) => prev.filter((_, i) => i !== indexToRemove));
    setFocusedPrice((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  return (
    <div id={id} className="w-full">
      <div className="space-y-4">
        {services.map((svc, i) => {
          const nameFocused = focusedName[i];
          const nameHasValue = !!svc.serviceName;

          const priceFocused = focusedPrice[i];
          const priceHasValue = !!priceInputs[i];

          const hasCategory = !!svc.category;

          // float helpers
          const labelPos = (focused: boolean, hasValue: boolean, left: string) =>
            focused || hasValue
              ? `top-6 -translate-y-4 ${left}`
              : `top-1/2 -translate-y-1/2 ${left}`;
          const labelSize = (focused: boolean) => (focused ? 'text-xs' : 'text-sm');

          return (
            <div
              key={`svc-row-${i}`}
              className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
            >
              {/* Grid layout with generous spacing */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                {/* NAME */}
                <div className="relative md:col-span-4">
                  <input
                    id={`serviceName-${i}`}
                    value={svc.serviceName}
                    onChange={(e) => setRow(i, { serviceName: e.target.value })}
                    onFocus={() => {
                      const copy = [...focusedName]; copy[i] = true; setFocusedName(copy);
                    }}
                    onBlur={() => {
                      const copy = [...focusedName]; copy[i] = false; setFocusedName(copy);
                    }}
                    placeholder=" "
                    className={[
                      'peer w-full rounded-lg outline-none transition border !h-auto',
                      'bg-[#fafafa] border-neutral-300 focus:border-black',
                      'text-[14px] leading-[20px]',
                      'pt-6 pb-3 pl-4 pr-10',
                      'disabled:opacity-70 disabled:cursor-not-allowed',
                    ].join(' ')}
                  />
                  <label
                    htmlFor={`serviceName-${i}`}
                    className={[
                      'absolute origin-[0] pointer-events-none transition-all duration-150',
                      'text-neutral-500',
                      labelSize(nameFocused),
                      labelPos(nameFocused, nameHasValue, 'left-4'),
                    ].join(' ')}
                  >
                    Service Name
                  </label>
                </div>

                {/* PRICE */}
                <div className="relative md:col-span-2">
                  <input
                    id={`servicePrice-${i}`}
                    value={priceInputs[i]}
                    onChange={(e) => handlePriceChange(i, e.target.value)}
                    onFocus={() => {
                      const copy = [...focusedPrice]; copy[i] = true; setFocusedPrice(copy);
                    }}
                    onBlur={() => {
                      const copy = [...focusedPrice]; copy[i] = false; setFocusedPrice(copy);
                      handlePriceBlur(i);
                    }}
                    inputMode="decimal"
                    placeholder=" "
                    className={[
                      'peer w-full rounded-lg outline-none transition border !h-auto',
                      'bg-[#fafafa] border-neutral-300 focus:border-black',
                      'text-[14px] leading-[20px]',
                      'pt-6 pb-3 pl-4 pr-10',
                      'disabled:opacity-70 disabled:cursor-not-allowed',
                    ].join(' ')}
                  />
                  <label
                    htmlFor={`servicePrice-${i}`}
                    className={[
                      'absolute origin-[0] pointer-events-none transition-all duration-150',
                      'text-neutral-500',
                      labelSize(priceFocused),
                      labelPos(priceFocused, priceHasValue, 'left-4'),
                    ].join(' ')}
                  >
                    Price
                  </label>
                </div>

                {/* CATEGORY */}
                <div className="relative md:col-span-3">
                  <FloatingLabelSelect
                    label="Category"
                    options={categoryOptions}
                    value={hasCategory ? { label: svc.category, value: svc.category } : null}
                    onChange={(opt) => setRow(i, { category: opt ? opt.label : '' })}
                    isLoading={false}
                    isDisabled={false}
                  />
                </div>

                {/* IMAGE UPLOAD */}
                <div className="md:col-span-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-neutral-600">Service Image (optional)</span>
                    {listingImageSrc && (
                      <span className="text-[11px] text-neutral-400">
                        Fallback: listing image
                      </span>
                    )}
                  </div>
                  <ImageUpload
                    value={svc.imageSrc || ''}
                    onChange={(url) => setRow(i, { imageSrc: url })}
                    onRemove={() => setRow(i, { imageSrc: '' })}
                    className="w-full h-28 overflow-hidden"
                    ratio="landscape"
                    rounded="xl"
                    showRemove
                  />
                </div>
              </div>

              {/* Row actions */}
              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-neutral-500">
                  This image will be used as the service card background. If left empty, we’ll use
                  the listing image instead.
                </div>

                {services.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeService(i)}
                    className="ml-1 inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition"
                    aria-label="Remove service"
                    title="Remove service"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Remove
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {services.length < MAX_ROWS && (
        <button
          type="button"
          onClick={addService}
          className="mt-4 inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition"
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
