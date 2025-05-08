'use client';

import React, { useState } from 'react';
import { Check, ShoppingCart, ChevronRight } from 'lucide-react';

interface ServiceItem {
  id: string;
  serviceName: string;
  price: number;
  category?: string;
  description?: string;
}

interface ServiceCategory {
  category: string;
  items: ServiceItem[];
}

interface ServicesSectionProps {
  listing: any;
  currentUser: any;
  isOwner: boolean;
  services: ServiceItem[];
  onServiceSelect?: (serviceId: string, serviceName: string, price: number) => void;
}

const ServicesSection: React.FC<ServicesSectionProps> = ({
  listing,
  currentUser,
  isOwner,
  services,
  onServiceSelect
}) => {
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([]);
  const [activeTab, setActiveTab] = useState('services');
  
  // Group services by category
  const servicesByCategory: ServiceCategory[] = [];
  
  services.forEach(service => {
    const category = service.category || 'Other';
    let categoryGroup = servicesByCategory.find(cat => cat.category === category);
    
    if (!categoryGroup) {
      categoryGroup = { category, items: [] };
      servicesByCategory.push(categoryGroup);
    }
    
    categoryGroup.items.push({
      ...service,
      id: service.id,
      serviceName: service.serviceName,
      price: service.price,
      description: service.description || `Professional ${service.serviceName} service tailored to your needs.`,
    });
  });

  const toggleServiceSelection = (service: ServiceItem) => {
    setSelectedServices(prev => 
      prev.find(s => s.id === service.id)
        ? prev.filter(s => s.id !== service.id)
        : [...prev, service]
    );
  };

  const calculateTotal = () => {
    return selectedServices.reduce((total, service) => total + service.price, 0);
  };

  const handleBookSelected = () => {
    // If only one service is selected, use the onServiceSelect callback
    if (selectedServices.length === 1 && onServiceSelect) {
      const service = selectedServices[0];
      onServiceSelect(service.id, service.serviceName, service.price);
    } else {
      // Handle booking multiple services (you'll need to implement this)
      console.log('Book multiple services:', selectedServices);
    }
  };

  const tabs = [
    { id: 'services', label: 'Services' },
    { id: 'team', label: 'Team' },
    { id: 'reviews', label: 'Reviews' }
  ];

  return (
    <div className="w-full col-span-full">
      {/* Tabs */}
      <div className="flex space-x-6 border-b border-neutral-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-4 py-3
              ${activeTab === tab.id 
                ? 'text-green-600 border-b-2 border-green-600' 
                : 'text-neutral-500 hover:text-neutral-800'}
              transition-colors
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Services Content */}
      <div className="max-w-4xl mx-auto p-6">
        {activeTab === 'services' && (
          <div className="space-y-8">
            {servicesByCategory.map((category) => (
              <div key={category.category}>
                <h2 className="text-2xl font-semibold text-neutral-800 mb-4">
                  {category.category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {category.items.map((service) => (
                    <div 
                      key={service.id}
                      className={`
                        bg-white rounded-2xl p-6 
                        border transition-all duration-300
                        ${selectedServices.find(s => s.id === service.id)
                          ? 'border-green-500 bg-green-50/50' 
                          : 'border-neutral-200 hover:border-neutral-300'}
                        cursor-pointer
                        relative
                      `}
                      onClick={() => toggleServiceSelection(service)}
                    >
                      {/* Selection Indicator */}
                      <div 
                        className={`
                          absolute top-4 right-4 w-6 h-6 rounded-full 
                          border-2 flex items-center justify-center
                          ${selectedServices.find(s => s.id === service.id)
                            ? 'bg-green-500 border-green-500'
                            : 'border-neutral-300'}
                        `}
                      >
                        {selectedServices.find(s => s.id === service.id) && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>

                      {/* Service Details */}
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                          {service.serviceName}
                        </h3>
                        <p className="text-neutral-600 text-sm mb-3">
                          {service.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-neutral-500 text-xs">
                            60 min
                          </span>
                          <span className="font-bold text-neutral-800 text-lg">
                            ${service.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'team' && (
          <div className="text-neutral-600 text-center py-6">
            Team information will be displayed here
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="text-neutral-600 text-center py-6">
            Reviews will be displayed here
          </div>
        )}
      </div>

      {/* Booking Summary */}
      {selectedServices.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl p-4 z-50">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <ShoppingCart className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-neutral-800">
                  {selectedServices.length} Service{selectedServices.length > 1 ? 's' : ''}
                </p>
                <p className="text-neutral-600 text-sm">
                  Total: ${calculateTotal()}
                </p>
              </div>
            </div>
            <button 
              onClick={handleBookSelected}
              className="bg-green-500 text-white px-6 py-3 rounded-xl 
              hover:bg-green-600 transition-colors flex items-center"
            >
              Book Selected
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServicesSection;