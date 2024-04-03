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
  const [inputValues, setInputValues] = useState<string[]>(existingServices.map(service => service.price.toString()));

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
    if (field === 'price') {
      // Also update the inputValues state for price inputs
      const updatedInputValues = [...inputValues];
      updatedInputValues[index] = value.toString();
      setInputValues(updatedInputValues);
    }
  
  };

  const formatPriceForDisplay = (price: number) => {
    return parseFloat(price.toString()).toFixed(2);
  };

  const handleBlur = (index: number) => {
    // On blur, update the service price to be formatted and also reflect in the inputValues
    const formattedPrice = formatPriceForDisplay(parseFloat(inputValues[index]));
    const updatedInputValues = [...inputValues];
    updatedInputValues[index] = formattedPrice;
    setInputValues(updatedInputValues);
    handleServiceChange(index, 'price', formattedPrice);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {services.map((service, index) => (
        <div key={index} className="flex flex-row justify-between mb-3 gap-2">
          <input
            type="text"
            placeholder="Service Name"
            value={service.serviceName}
            onChange={(e) => handleServiceChange(index, 'serviceName', e.target.value)}
            className="rounded border-white text-white bg-transparent border p-3 flex-1"
          />
           <input
            type="text"
            placeholder="Price"
            value={inputValues[index]} // Use inputValues state for controlling input
            onBlur={() => handleBlur(index)} // Format on blur
            onChange={(e) => {
              setInputValues(values => {
                const updated = [...values];
                updated[index] = e.target.value; // Directly use the input value
                return updated;
              });
              if (!isNaN(parseFloat(e.target.value))) {
                handleServiceChange(index, 'price', parseFloat(e.target.value));
              }
            }}
            className="rounded border border-white text-white bg-transparent p-3 w-1/4"
          />
          <select
            value={service.category}
            onChange={(e) => handleServiceChange(index, 'category', e.target.value)}
            className="rounded border border-white text-white bg-transparent p-3 w-1/4"
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