'use client'
// ServiceSelector.tsx
// ServiceSelector.tsx

import React, { useState, useEffect } from 'react'; // Import useEffect
import { categories } from '../Categories'; // Import the categories from Categories.tsx

// Define the type for a single service
export type Service = {
  serviceName: string;
  price: number;
  category: string;
};

// Props type definition
type ServiceSelectorProps = {
  onServicesChange: (services: Service[]) => void; // Function to update the services in the parent component
  existingServices: Service[]; // Existing services passed from the parent component
};

const ServiceSelector = ({ onServicesChange, existingServices }: ServiceSelectorProps) => {
  // Initialize state for 3 rows of services using existingServices
  const [services, setServices] = useState<Service[]>(existingServices);

  // Effect to propagate changes to the parent component
  useEffect(() => {
    onServicesChange(services); // Notify the parent component of the service changes
  }, [services, onServicesChange]); // Depend on services and onServicesChange

  // Function to handle individual service changes
  const handleServiceChange = (index: number, field: keyof Service, value: string | number) => {
    const updatedServices = services.map((service, i) => {
      if (i === index) {
        if (field === 'price' && typeof value === 'number') {
          return { ...service, [field]: value }; // Update price
        } else if (typeof value === 'string') {
          return { ...service, [field]: value }; // Update serviceName or category
        }
      }
      return service;
    });
    setServices(updatedServices); // Update the local state
  };

  // Render 3 rows of service inputs
  return (
    <div>
      {services.map((service, index) => (
        <div key={index} className="flex flex-row justify-between mb-4">
          {/* Service Name Input */}
          <input
            type="text"
            placeholder="Service Name"
            value={service.serviceName}
            onChange={(e) => handleServiceChange(index, 'serviceName', e.target.value)}
            className="border p-2"
          />

          {/* Price Input */}
          <input
            type="number"
            placeholder="Price"
            value={service.price}
            onChange={(e) => handleServiceChange(index, 'price', parseFloat(e.target.value))}
            className="border p-2"
          />

          {/* Category Dropdown */}
          <select
            value={service.category}
            onChange={(e) => handleServiceChange(index, 'category', e.target.value)}
            className="border p-2"
          >
            <option value="">Select Category</option>
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
