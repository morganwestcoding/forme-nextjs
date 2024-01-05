'use client';

import { useState } from "react";
import { FieldErrors, FieldValues, UseFormRegister, useFieldArray, Control } from "react-hook-form";
import Input from './Input'; // Ensure this path is correct
import { categories } from '../Categories'; // Ensure this path is correct

interface ServiceSelectorProps {
  register: UseFormRegister<FieldValues>;
  control: Control<FieldValues>; // Import Control from react-hook-form
  errors: FieldErrors;
  isLoading: boolean;
}

const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  register,
  control,
  errors,
  isLoading
}) => {
  const { fields, append } = useFieldArray({
    control,
    name: "services"
  });

  const handleAddService = () => {
    append({ serviceName: "", price: "", category: "" });
  };

  return (
    <div>
      {fields.map((field, index) => (
        <div key={field.id} className="grid grid-cols-3 gap-4 mb-4">
          <Input
            id={`services[${index}].serviceName`}
            label="Service Name"
            
            disabled={isLoading}
            register={register}
            errors={errors}
            required
          />
          <Input
            id={`services[${index}].price`}
            label="Price"
            formatPrice
            type="number"
            
            disabled={isLoading}
            register={register}
            errors={errors}
            required
          />
          <div>
            <label htmlFor={`services[${index}].category`} className="block mb-2 text-sm font-medium text-gray-700">Category</label>
            <select
              id={`services[${index}].category`}
              {...register(`services[${index}].category`, { required: true })}
              className="
                bg-gray-50 
                border 
                border-gray-300 
                text-gray-900 
                text-sm 
                rounded-lg 
                focus:ring-blue-500 
                focus:border-blue-500 
                block 
                w-full 
                p-2.5
              "
            >
              {categories.map((cat) => (
                <option key={cat.label} value={cat.label} className="flex items-center">
                  <span className={`${cat.color} inline-block w-3 h-3 mr-2 rounded-full`} />
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}

      <button 
        type="button" 
        onClick={handleAddService}
        className="
          mt-4 
          bg-blue-500 
          hover:bg-blue-700 
          text-white 
          font-bold 
          py-2 
          px-4 
          rounded
        "
        disabled={isLoading}
      >
        Add More
      </button>
    </div>
  );
}

export default ServiceSelector;
