// ServiceSelector.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Select, { StylesConfig } from 'react-select';
import { categories } from '../Categories';

export type Service = {
  serviceName: string;
  price: number;
  category: string;
};

type CategoryOption = {
  value: string;
  label: string;
};

type ServiceSelectorProps = {
  onServicesChange: (services: Service[]) => void;
  existingServices: Service[];
};

const ServiceSelector: React.FC<ServiceSelectorProps> = ({ onServicesChange, existingServices }) => {
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

  const categoryOptions = categories.map(category => ({
    value: category.label,
    label: category.label,
  }));

  const customSelectStyles: StylesConfig<Service, false> = {
    control: (styles) => ({
      ...styles,
      background: 'transparent',
      borderColor: 'white',
      color: 'white',
      boxShadow: 'none',
      '&:hover': { borderColor: 'white' },
      minHeight: 'auto',
      padding: 6,
      width: 'auto', // Adjust width here as needed
    }),
    singleValue: (styles) => ({
      ...styles,
      color: 'white',
    }),
    input: (styles) => ({
      ...styles,
      color: 'white',
    }),
    option: (styles, { isFocused, isSelected }) => ({
      ...styles,
      backgroundColor: isFocused ? '#666' : isSelected ? 'white' : 'black',
      color: isSelected ? 'black' : 'white',
      ':active': {
        ...styles[':active'],
        backgroundColor: !isSelected ? '#aaa' : 'white',
      },
    }),
    menu: (styles) => ({
      ...styles,
      backgroundColor: 'black',
      borderColor: 'white',
    }),
    menuList: (styles) => ({
      ...styles,
      padding: 2,
    }),
  };

  return (
    <div className="max-w-2xl">
      {services.map((service, index) => (
        <div key={index} className="flex flex-row justify-between mb-3 gap-2">
          <input
            type="text"
            placeholder="Service Name"
            value={service.serviceName}
            onChange={(e) => handleServiceChange(index, 'serviceName', e.target.value)}
            className="rounded border-white bg-transparent text-white border p-3 flex-1"
          />
          <input
            type="number"
            placeholder="Price"
            value={service.price}
            onChange={(e) => handleServiceChange(index, 'price', parseFloat(e.target.value))}
            className="rounded border-white bg-transparent text-white border p-3 w-32"
          />
          <Select
            isSearchable={false}
            classNamePrefix="custom-select"
            options={categoryOptions}
            styles={customSelectStyles}
            onChange={(selectedOption) => 
              handleServiceChange(index, 'category', selectedOption ? selectedOption.value : '')
            }
            value={categoryOptions.find(option => option.value === service.category) || null}
          />
        </div>
      ))}
    </div>
  );
};

export default ServiceSelector;
