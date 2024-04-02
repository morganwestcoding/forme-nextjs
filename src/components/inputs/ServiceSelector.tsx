// ServiceSelector.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { categories } from '../Categories';

export type Service = {
  serviceName: string;
  price: number;
  category: string;
};

type ServiceSelectorProps = {
  onServicesChange: (services: Service[]) => void;
  existingServices: Service[];
};

const ServiceSelector = ({ onServicesChange, existingServices }: ServiceSelectorProps) => {
  const [services, setServices] = useState<Service[]>(existingServices);

  useEffect(() => {
    onServicesChange(services);
  }, [services, onServicesChange]);

  const handleServiceChange = (index: number, field: keyof Service, value: string | number) => {
    const updatedServices = services.map((service, i) => {
      if (i === index) {
        return { ...service, [field]: typeof value === 'number' ? value : value.toString() };
      }
      return service;
    });
    setServices(updatedServices);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {services.map((service, index) => (
        <div key={index} className="flex flex-row justify-between mb-3 gap-3">
          <input
            type="text"
            placeholder="Service Name"
            value={service.serviceName}
            onChange={(e) => handleServiceChange(index, 'serviceName', e.target.value)}
            className="rounded border-white bg-transparent text-white border p-2 flex-1"
          />
          <input
            type="number"
            placeholder="Price"
            value={service.price}
            onChange={(e) => handleServiceChange(index, 'price', parseFloat(e.target.value))}
            className="rounded border-white bg-transparent text-white border p-2 w-1/4"
          />
          <select
            value={service.category}
            onChange={(e) => handleServiceChange(index, 'category', e.target.value)}
            className="rounded border-white bg-transparent text-white border p-2 w-1/4"
          >
            <option value="">Category</option>
            {categories.map((category) => (
              <option key={category.label} value={category.label}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
};

export default ServiceSelector;
