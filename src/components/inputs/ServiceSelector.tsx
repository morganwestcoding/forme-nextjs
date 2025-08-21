'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { categories } from '../Categories';
import FloatingLabelSelect, { FLSelectOption } from './FloatingLabelSelect';
import ImageUpload from './ImageUpload';

export type Service = {
  serviceName: string;
  price: number;
  category: string;
  imageSrc?: string;
};

type ServiceSelectorProps = {
  onServicesChange: (services: Service[]) => void;
  existingServices: Service[];
  listingImageSrc?: string;
  id?: string;
  /** when provided, only render this one row for focused, single-item editing */
  singleIndex?: number;
};

const MAX_ROWS = 6;

const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  onServicesChange,
  existingServices,
  listingImageSrc,
  id,
  singleIndex,
}) => {
  const hasExisting = Array.isArray(existingServices) && existingServices.length > 0;

  const initialRows: Service[] = hasExisting
    ? existingServices.map((s) => ({
        serviceName: s.serviceName ?? '',
        price: typeof s.price === 'number' ? s.price : 0,
        category: s.category ?? '',
        imageSrc: s.imageSrc ?? '',
      }))
    : [{ serviceName: '', price: 0, category: '', imageSrc: '' }];

  const [services, setServices] = useState<Service[]>(initialRows);

  // keep price as string for editing UX
  const [priceInputs, setPriceInputs] = useState<string[]>(
    initialRows.map((s) => (s.price ? Number(s.price).toFixed(2) : ''))
  );

  // focus states for floating labels
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

  const labelPos = (focused: boolean, hasValue: boolean, left: string) =>
    focused || hasValue
      ? `top-6 -translate-y-4 ${left}`
      : `top-1/2 -translate-y-1/2 ${left}`;
  const labelSize = (focused: boolean) => (focused ? 'text-xs' : 'text-sm');

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
          const nameFocused = focusedName[i];
          const nameHasValue = !!svc.serviceName;

          const priceFocused = focusedPrice[i];
          const priceHasValue = !!priceInputs[i];

          const hasCategory = !!svc.category;

          return (
            <div key={`svc-row-${i}`} className="space-y-4">
              {/* IMAGE UPLOAD ON TOP */}
              <div>
                <ImageUpload
                  value={svc.imageSrc || ''}
                  onChange={(url) => setRow(i, { imageSrc: url })}
                  onRemove={() => setRow(i, { imageSrc: '' })}
                  className="w-full h-40 md:h-48 overflow-hidden"
                  ratio="landscape"
                  rounded="xl"
                />
                {listingImageSrc && (
                  <p className="mt-2 text-[11px] text-neutral-400">
                    Fallback: listing image will be used if this is left empty.
                  </p>
                )}
              </div>

              {/* SERVICE NAME */}
              <div className="relative">
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

              {/* PRICE + CATEGORY UNDER */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* PRICE */}
                <div className="relative">
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
                <div className="relative">
                  <FloatingLabelSelect
                    label="Category"
                    options={categoryOptions}
                    value={hasCategory ? { label: svc.category, value: svc.category } : null}
                    onChange={(opt) => setRow(i, { category: opt ? opt.label : '' })}
                    isLoading={false}
                    isDisabled={false}
                  />
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
