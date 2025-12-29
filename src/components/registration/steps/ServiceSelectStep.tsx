'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import TypeformHeading from '../TypeformHeading';

interface ServiceSelectStepProps {
  selectedListingId: string;
  selectedServices: string[];
  onServicesChange: (serviceIds: string[]) => void;
}

interface Service {
  id: string;
  serviceName: string;
  price: number;
  category?: string;
}

export default function ServiceSelectStep({ selectedListingId, selectedServices, onServicesChange }: ServiceSelectStepProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      if (!selectedListingId || selectedListingId === 'SKIP') {
        setServices([]);
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/api/listings/${selectedListingId}/services`);
        setServices(response.data?.services || []);
      } catch (error) {
        console.error('Failed to fetch services:', error);
        setServices([]);
      }
      setIsLoading(false);
    };

    fetchServices();
  }, [selectedListingId]);

  const toggleService = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      onServicesChange(selectedServices.filter(id => id !== serviceId));
    } else {
      onServicesChange([...selectedServices, serviceId]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <TypeformHeading
        question="What services do you provide?"
        subtitle="Select all the services you offer to clients"
      />

      {services.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {services.map((service, index) => {
            const isSelected = selectedServices.includes(service.id);
            return (
              <motion.button
                key={service.id}
                type="button"
                onClick={() => toggleService(service.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                whileTap={{ scale: 0.97 }}
                className={`
                  p-4 rounded-xl border text-left transition-all duration-200
                  ${isSelected
                    ? 'border-gray-300 bg-gray-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <span className="text-sm font-medium block truncate text-gray-900">{service.serviceName}</span>
                <span className="text-xs mt-1 block text-gray-500">
                  ${service.price}
                </span>
              </motion.button>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No services found for this business</p>
          <p className="text-sm text-gray-400 mt-1">You can add services later</p>
        </div>
      )}

      {selectedServices.length > 0 && (
        <p className="text-sm text-gray-500 text-center mt-6">
          {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
}
