'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { categories } from '../Categories';

export type Service = {
  id?: string;           // carry DB id so PUT can upsert, not delete
  serviceName: string;
  price: number;
  category: string;
  duration?: number;     // duration in minutes
  imageSrc?: string;     // service-specific image (optional, not used in registration)
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
          className="mt-6 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition"
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