// ServiceSelector.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { categories } from '../Categories';
import Select, { StylesConfig, SingleValue } from 'react-select';

export type Service = {
  serviceName: string;
  price: number;
  category: string;
};

type ServiceSelectorProps = {
  onServicesChange: (services: Service[]) => void;
  existingServices: Service[];
};

interface CategoryOption {
  label: string;
  value: string;
}

const ServiceSelector: React.FC<ServiceSelectorProps> = ({ onServicesChange, existingServices }) => {
  const [services, setServices] = useState<Service[]>(existingServices);
  const [inputValues, setInputValues] = useState<string[]>(existingServices.map(service => service.price.toFixed(2)));
  const [focusedInputs, setFocusedInputs] = useState<boolean[]>(existingServices.map(() => false));

  useEffect(() => {
    onServicesChange(services.map((service, index) => ({
      ...service,
      price: parseFloat(inputValues[index]) || 0
    })));
  }, [services, inputValues, onServicesChange]);

  const handleInputChange = (index: number, field: keyof Service, value: string) => {
    const updatedServices = [...services];
    const updatedInputValues = [...inputValues];

    if (field === 'price') {
      updatedInputValues[index] = value;
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

  const handleFocus = (index: number) => {
    const newFocusedInputs = [...focusedInputs];
    newFocusedInputs[index] = true;
    setFocusedInputs(newFocusedInputs);
  };

  const handleBlur = (index: number) => {
    const updatedInputValues = [...inputValues];
    updatedInputValues[index] = parseFloat(inputValues[index]).toFixed(2);
    setInputValues(updatedInputValues);

    const newFocusedInputs = [...focusedInputs];
    newFocusedInputs[index] = false;
    setFocusedInputs(newFocusedInputs);
  };

  const handleCategoryChange = (index: number, selectedOption: SingleValue<CategoryOption>) => {
    handleInputChange(index, 'category', selectedOption?.value || '');
  };

  const customStyles: StylesConfig<CategoryOption, false> = {
    control: (styles) => ({
      ...styles,
      backgroundColor: 'transparent',
      borderColor: 'white',
      color: 'white',
      boxShadow: 'none',
      minHeight: '60px',
      height: '60px',
      '&:hover': {
        borderColor: 'white',
      },
    }),
    option: (styles, { isFocused, isSelected }) => ({
      ...styles,
      backgroundColor: isFocused ? 'grey' : 'black',
      color: 'white',
      cursor: 'pointer',
    }),
    singleValue: (styles) => ({
      ...styles,
      color: 'white',
      marginLeft: '0.5rem',
    }),
    input: (styles) => ({
      ...styles,
      color: 'white',
      marginLeft: '0.5rem',
    }),
    placeholder: (styles) => ({
      ...styles,
      color: 'white',
      marginLeft: '0.5rem',
    }),
    valueContainer: (styles) => ({
      ...styles,
      height: '58px',
      padding: '0 8px 0 0.5rem',
    }),
  };

  return (
    <div className="max-w-2xl">
      {services.map((service, index) => (
        <div key={index} className="flex flex-row justify-between mb-3 gap-3">
          <div className="relative w-1/3">
            <input
              type="text"
              id={`serviceName-${index}`}
              value={service.serviceName}
              onChange={(e) => handleInputChange(index, 'serviceName', e.target.value)}
              onFocus={() => handleFocus(index)}
              onBlur={() => handleBlur(index)}
              className="
                peer
                w-full
                h-[60px]
                px-4
                pt-1
                font-light 
                bg-transparent
                border-white 
                border
                rounded-md
                outline-none
                transition
                disabled:opacity-70
                disabled:cursor-not-allowed
                text-white
                text-sm
              "
              placeholder=""
            />
            <label 
              htmlFor={`serviceName-${index}`}
              className={`
                absolute 
                text-sm
                duration-150 
                transform 
                -translate-y-3 
                top-5 
                z-10 
                origin-[0] 
                left-4
                peer-placeholder-shown:scale-100 
                peer-placeholder-shown:translate-y-0 
                peer-focus:scale-75
                peer-focus:-translate-y-4
                text-zinc-400
                ${service.serviceName || focusedInputs[index] ? 'scale-75 -translate-y-4' : ''}
              `}
            >
              Service Name
            </label>
          </div>
          <div className="relative w-1/3">
            <input
              type="text"
              id={`price-${index}`}
              value={inputValues[index]}
              onChange={(e) => handleInputChange(index, 'price', e.target.value)}
              onBlur={() => handleBlur(index)}
              className="
                text-sm
                w-full
                h-[60px]
                px-4
                pl-8
                font-light
                bg-transparent
                border-white 
                border
                rounded-md
                outline-none
                transition
                disabled:opacity-70
                disabled:cursor-not-allowed
                text-white
              "
              placeholder="Price"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white">$</span>
          </div>
          <Select<CategoryOption>
            value={service.category ? { label: service.category, value: service.category } : null}
            onChange={(selectedOption) => handleCategoryChange(index, selectedOption)}
            options={categories.map(category => ({ label: category.label, value: category.label }))}
            styles={customStyles}
            placeholder="Category"
            className="w-1/3 text-sm"
          />
        </div>
      ))}
    </div>
  );
};

export default ServiceSelector;