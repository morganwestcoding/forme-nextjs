'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { categories } from '../Categories';

export type Service = {
  id?: string;           // carry DB id so PUT can upsert, not delete
  serviceName: string;
  price: number;
  category: string;
  duration?: number;     // duration in minutes
};

type ServiceSelectorProps = {
  onServicesChange: (services: Service[]) => void;
  existingServices: Service[];
  id?: string;
  /** when provided, only render this one row for focused, single-item editing */
  singleIndex?: number;
};

const MAX_ROWS = Number.POSITIVE_INFINITY;

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
      }))
    : [{ serviceName: '', price: 0, category: '' }];

  const [services, setServices] = useState<Service[]>(initialRows);

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
    setServices((prev) => [...prev, { serviceName: '', price: 0, category: '' }]);
    setPriceInputs((prev) => [...prev, '']);
  };

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

          return (
            <div key={`svc-row-${i}`}>
              <div className="space-y-4">
                {/* Service Name */}
                <div>
                  <label htmlFor={`serviceName-${i}`} className="block text-sm font-medium text-stone-700 dark:text-stone-200 dark:text-stone-200 mb-2">
                    Service name
                  </label>
                  <input
                    id={`serviceName-${i}`}
                    type="text"
                    value={svc.serviceName}
                    onChange={(e) => setRow(i, { serviceName: e.target.value })}
                    className="w-full px-4 py-3.5 bg-stone-50 dark:bg-stone-900 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 dark:border-stone-800 rounded-xl text-stone-900 dark:text-stone-100 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all"
                    placeholder="e.g. Haircut"
                  />
                </div>

                {/* Price & Category row */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label htmlFor={`servicePrice-${i}`} className="block text-sm font-medium text-stone-700 dark:text-stone-200 dark:text-stone-200 mb-2">
                      Price
                    </label>
                    <input
                      id={`servicePrice-${i}`}
                      type="text"
                      inputMode="decimal"
                      value={priceInputs[i]}
                      onChange={(e) => handlePriceChange(i, e.target.value)}
                      onBlur={() => handlePriceBlur(i)}
                      className="w-full px-4 py-3.5 bg-stone-50 dark:bg-stone-900 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 dark:border-stone-800 rounded-xl text-stone-900 dark:text-stone-100 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all"
                      placeholder="0.00"
                    />
                  </div>

                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 dark:text-stone-200 mb-2">
                    Category
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {categoryOptions.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setRow(i, { category: cat })}
                        className={`
                          p-3 rounded-xl border text-sm font-medium transition-all duration-200
                          ${svc.category === cat
                            ? 'border-stone-300 dark:border-stone-700 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 dark:bg-stone-800 text-stone-900 dark:text-stone-100 dark:text-stone-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]'
                            : 'border-stone-200 dark:border-stone-800 dark:border-stone-800 bg-white dark:bg-stone-900 dark:bg-stone-900 text-stone-700 dark:text-stone-200 dark:text-stone-200 hover:border-stone-300 dark:border-stone-700 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 dark:bg-stone-900 dark:hover:bg-stone-800 dark:bg-stone-900'
                          }
                        `}
                      >
                        {cat}
                      </button>
                    ))}
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
          className="mt-6 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-stone-700 dark:text-stone-200 dark:text-stone-200 hover:text-stone-900 dark:hover:text-stone-100 dark:text-stone-100 dark:hover:text-stone-100 dark:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800 dark:hover:bg-stone-800 dark:bg-stone-800 transition"
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