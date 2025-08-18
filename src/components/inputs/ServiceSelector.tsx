// components/inputs/ServiceSelector.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { categories } from '../Categories';
import FloatingLabelSelect, { FLSelectOption } from './FloatingLabelSelect';

export type Service = {
  serviceName: string;
  price: number;
  category: string;
};

type ServiceSelectorProps = {
  onServicesChange: (services: Service[]) => void;
  existingServices: Service[];
  id?: string;
};

const MAX_ROWS = 6;

const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  onServicesChange,
  existingServices,
  id,
}) => {
  const [services, setServices] = useState<Service[]>(
    existingServices?.length
      ? existingServices
      : [{ serviceName: '', price: 0, category: '' }]
  );

  // keep price as string for editing
  const [priceInputs, setPriceInputs] = useState<string[]>(
    (existingServices?.length ? existingServices : [{ price: 0 } as Service]).map((s) =>
      s.price && s.price !== 0 ? s.price.toFixed(2) : ''
    )
  );

  // label size control (xs while focused)
  const [focusedName, setFocusedName] = useState<boolean[]>(
    (existingServices?.length ? existingServices : services).map(() => false)
  );
  const [focusedPrice, setFocusedPrice] = useState<boolean[]>(
    (existingServices?.length ? existingServices : services).map(() => false)
  );

  const categoryOptions: FLSelectOption[] = useMemo(
    () => categories.map((c) => ({ label: c.label, value: c.label })),
    []
  );

  // emit numeric values upward
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
    setServices((prev) => [...prev, { serviceName: '', price: 0, category: '' }]);
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
    <div id={id} className="w-full -mt-4">
      {services.map((svc, i) => {
        const nameFocused = focusedName[i];
        const nameHasValue = !!svc.serviceName;

        const priceFocused = focusedPrice[i];
        const priceHasValue = !!priceInputs[i];

        const hasCategory = !!svc.category;

        // match FloatingLabelSelect's float behavior
        const labelPos = (focused: boolean, hasValue: boolean, left: string) =>
          focused || hasValue
            ? `top-6 -translate-y-4 ${left}`
            : `top-1/2 -translate-y-1/2 ${left}`;
        const labelSize = (focused: boolean) => (focused ? 'text-xs' : 'text-sm');

        return (
          <div key={`svc-row-${i}`} className="flex flex-row items-center mb-3 gap-3">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* SERVICE NAME — NO fixed height; same paddings/typography as select */}
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
                    'peer w-full rounded-lg outline-none transition border !h-auto', // kill any previous h-*
                    'bg-[#fafafa] border-neutral-300 focus:border-black',
                    'text-[14px] leading-[20px]',
                    'pt-6 pb-3 pl-4 pr-10', // 24 / 12 / 16 / 40
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

              {/* PRICE — same metrics; decimal on blur */}
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

              {/* CATEGORY — keep your FloatingLabelSelect untouched */}
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

            {services.length > 1 && (
              <button
                type="button"
                onClick={() => removeService(i)}
                className="ml-1 p-2 hover:bg-neutral-100 rounded-full transition"
                aria-label="Remove service"
                title="Remove service"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 text-neutral-500 hover:text-neutral-800"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        );
      })}

      {services.length < MAX_ROWS && (
        <button
          type="button"
          onClick={addService}
          className="mt-2 flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-800 rounded-md p-2 hover:bg-neutral-100 transition"
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
