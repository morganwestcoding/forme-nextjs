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

const ServiceSelector: React.FC<ServiceSelectorProps> = ({ onServicesChange, existingServices }) => {
  const [services, setServices] = useState<Service[]>(existingServices);
  // State to keep track of the raw input values for prices
  const [inputValues, setInputValues] = useState<string[]>(existingServices.map(service => service.price.toFixed(2)));

  useEffect(() => {
    onServicesChange(services.map((service, index) => ({
      ...service,
      // Ensure price is a number when updating services, converting raw input string to a number
      price: parseFloat(inputValues[index]) || 0
    })));
  }, [inputValues, onServicesChange]);

  const handleInputChange = (index: number, field: keyof Service, value: string) => {
    // Update the corresponding service detail based on the field
    const updatedServices = [...services];
    const updatedInputValues = [...inputValues];

    if (field === 'price') {
      // Update the raw input value for price fields
      updatedInputValues[index] = value; // Directly update with the raw input string
      setInputValues(updatedInputValues);
      updatedServices[index] = {
         ...updatedServices[index],
      [field]: parseFloat(value) || 0,
     };
    } else {
      updatedServices[index] = { ...updatedServices[index], [field]: value };
    }
      setServices(updatedServices);
    };

    const handleBlur = (index: number) => {
      const updatedInputValues = [...inputValues];
      updatedInputValues[index] = parseFloat(inputValues[index]).toFixed(2);
      setInputValues(updatedInputValues);
    };
  



  return (
    <div className="max-w-2xl ">
      {services.map((service, index) => (
        <div key={index} className="flex flex-row justify-between mb-3 gap-2">
          <input
            type="text"
            placeholder="Service Name"
            value={service.serviceName}
            onChange={(e) => handleInputChange(index, 'serviceName', e.target.value)}
            className="rounded border-white text-white bg-transparent border p-4 flex-1"
          />
<div className="flex relative items-center border border-white bg-transparent rounded p-4">
            <span className="absolute left-3 text-white">$</span>
            <input
              type="text"
              placeholder="Price"
              value={inputValues[index]}
              onChange={(e) => handleInputChange(index, 'price', e.target.value)}
              onBlur={() => handleBlur(index)}
              className="pl-8 bg-transparent text-white outline-none w-28"
            />
          </div>
          <select
            value={service.category}
            onChange={(e) => handleInputChange(index, 'category', e.target.value)}
            className="rounded border border-white text-white bg-transparent p-4 w-1/4"
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