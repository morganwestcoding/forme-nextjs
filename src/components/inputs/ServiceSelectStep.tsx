'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import Heading from '../Heading';

export type Service = {
  id: string;
  serviceName: string;
  price: number;
  category: string;
  imageSrc?: string | null;
};

interface ServiceSelectStepProps {
  selectedListingId: string;
  selectedServices: string[]; // Array of service IDs
  onServicesChange: (serviceIds: string[]) => void;
  isLoading?: boolean;
}

const ServiceSelectStep: React.FC<ServiceSelectStepProps> = ({
  selectedListingId,
  selectedServices,
  onServicesChange,
  isLoading = false,
}) => {
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter out invalid/empty services
  const validServices = useMemo(() => {
    return allServices.filter(service => {
      // Filter out services with no name, empty name, or price <= 0
      const hasValidName = service.serviceName && service.serviceName.trim().length > 0;
      const hasValidPrice = service.price && service.price > 0;
      return hasValidName && hasValidPrice;
    });
  }, [allServices]);

  // Fetch services for the selected listing
  useEffect(() => {
    if (!selectedListingId) {
      setAllServices([]);
      setError(null);
      return;
    }

    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/listings/${selectedListingId}/services`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Business not found');
          }
          throw new Error('Failed to fetch services');
        }
        
        const data = await response.json();
        const fetchedServices = data.services || [];
        
        setAllServices(fetchedServices);
        
        // Validate currently selected services still exist and are valid
        if (selectedServices.length > 0) {
          const validServiceIds = fetchedServices
            .filter((s: Service) => s.serviceName?.trim() && s.price > 0)
            .map((s: Service) => s.id);
          const stillValidServices = selectedServices.filter(id => validServiceIds.includes(id));
          
          if (stillValidServices.length !== selectedServices.length) {
            onServicesChange(stillValidServices);
            toast('Some previously selected services are no longer available', {
              icon: '⚠️',
            });
          }
        }
        
      } catch (error) {
        console.error('Error fetching services:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load services';
        setError(errorMessage);
        toast.error(errorMessage);
        setAllServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [selectedListingId, selectedServices, onServicesChange]);

  const handleServiceToggle = (serviceId: string) => {
    if (isLoading || loading) return;
    
    const isSelected = selectedServices.includes(serviceId);
    if (isSelected) {
      onServicesChange(selectedServices.filter(id => id !== serviceId));
    } else {
      onServicesChange([...selectedServices, serviceId]);
    }
  };

  const handleSelectAll = () => {
    if (isLoading || loading || validServices.length === 0) return;
    
    if (selectedServices.length === validServices.length) {
      // Deselect all
      onServicesChange([]);
    } else {
      // Select all valid services only
      onServicesChange(validServices.map(s => s.id));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Heading
          title="Loading services..."
          subtitle="Please wait while we fetch the available services."
        />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#60A5FA]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <Heading
          title="Error loading services"
          subtitle="There was a problem fetching the services for this business."
        />
        <div className="bg-red-50 rounded-lg p-6 text-center">
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (validServices.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <Heading
          title="No services available"
          subtitle="This business hasn't added any complete services yet."
        />
        <div className="bg-neutral-50 rounded-lg p-6 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-neutral-200 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-neutral-600 mb-2">
              The business owner hasn't finished setting up their services yet.
            </p>
            <p className="text-sm text-neutral-500">
              You can complete your registration and services can be assigned to you later by the business owner.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Heading
        title="Which services do you provide?"
        subtitle="Select the services you're trained and qualified to perform at this business."
      />

      {/* Select All Button - only show if there are valid services */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={handleSelectAll}
          disabled={isLoading || loading}
          className={`
            text-sm font-medium transition-colors
            ${isLoading || loading ? 'text-neutral-400 cursor-not-allowed' : 'text-[#60A5FA] hover:text-blue-600'}
          `}
        >
          {selectedServices.length === validServices.length ? 'Deselect All' : 'Select All'}
        </button>
        <span className="text-sm text-neutral-500">
          {selectedServices.length} of {validServices.length} selected
        </span>
      </div>

      {/* Services Grid - only show valid services */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {validServices.map((service) => {
          const isSelected = selectedServices.includes(service.id);
          
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => handleServiceToggle(service.id)}
              disabled={isLoading || loading}
              className={`
                p-4 rounded-xl border-2 text-left transition-all duration-200
                ${isSelected 
                  ? 'border-[#60A5FA] bg-blue-50' 
                  : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }
                ${isLoading || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:ring-offset-2
              `}
            >
              <div className="flex items-start gap-3">
                {/* Service Image */}
                <div className="w-12 h-12 rounded-lg bg-neutral-100 overflow-hidden shrink-0">
                  {service.imageSrc ? (
                    <img
                      src={service.imageSrc}
                      alt={service.serviceName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Service Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-medium truncate ${isSelected ? 'text-blue-900' : 'text-neutral-900'}`}>
                      {service.serviceName}
                    </h3>
                    {/* Checkbox */}
                    <div className={`
                      w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                      ${isSelected 
                        ? 'border-[#60A5FA] bg-[#60A5FA]' 
                        : 'border-neutral-300'
                      }
                    `}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`font-medium ${isSelected ? 'text-blue-700' : 'text-neutral-600'}`}>
                      ${service.price.toFixed(2)}
                    </span>
                    <span className="text-neutral-400">•</span>
                    <span className={`${isSelected ? 'text-blue-600' : 'text-neutral-500'}`}>
                      {service.category}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Show debug info if there are invalid services (in development) */}
      {process.env.NODE_ENV === 'development' && allServices.length > validServices.length && (
        <div className="bg-yellow-50 rounded-lg p-3 text-xs text-yellow-700">
          Debug: Filtered out {allServices.length - validServices.length} incomplete service(s)
        </div>
      )}

      {/* Helper Text */}
      <div className="bg-blue-50 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          <strong>Important:</strong> Only select services you're professionally trained and qualified to perform. 
          You can update your service assignments later through your profile settings or by contacting your manager.
        </p>
      </div>
      
      {/* Validation Note - only show if no services selected */}
      {selectedServices.length === 0 && (
        <div className="bg-amber-50 rounded-lg p-4">
          <p className="text-sm text-amber-700">
            <strong>Note:</strong> You haven't selected any services yet. You can complete registration without 
            selecting services, but you'll need to have services assigned before you can receive bookings.
          </p>
        </div>
      )}
    </div>
  );
};

export default ServiceSelectStep;