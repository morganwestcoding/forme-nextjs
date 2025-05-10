'use client';

import React, { useState } from 'react';
import { 
  Check, ShoppingCart, ChevronRight, Grid, List,
  Clipboard, Users, Star, Clock, ChevronDown
} from 'lucide-react';

interface ServiceItem {
  id: string;
  serviceName: string;
  price: number;
  category?: string;
  description?: string;
  popular?: boolean;
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
  const [viewMode, setViewMode] = useState('grid');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('wellness');
  
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
      popular: service.id === services[1]?.id, // Just for example, mark one as popular
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

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const tabs = [
    { id: 'services', label: 'Services', icon: Clipboard },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'reviews', label: 'Reviews', icon: Star }
  ];

  const getCategoryIcon = (category: string) => {
    switch(category.toLowerCase()) {
      case 'wellness':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.875 10C8.60089 10 10 8.60089 10 6.875C10 5.14911 8.60089 3.75 6.875 3.75C5.14911 3.75 3.75 5.14911 3.75 6.875C3.75 8.60089 5.14911 10 6.875 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13.125 16.25C14.8509 16.25 16.25 14.8509 16.25 13.125C16.25 11.3991 14.8509 10 13.125 10C11.3991 10 10 11.3991 10 13.125C10 14.8509 11.3991 16.25 13.125 16.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'fitness':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.5 6.25H2.5C2.15482 6.25 1.875 6.52982 1.875 6.875V13.125C1.875 13.4702 2.15482 13.75 2.5 13.75H17.5C17.8452 13.75 18.125 13.4702 18.125 13.125V6.875C18.125 6.52982 17.8452 6.25 17.5 6.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 16.25V13.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15 16.25V13.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 6.25V3.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15 6.25V3.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 6.25V10H13.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
    }
  };

  return (
    <div className="w-full">
      {/* Business Info Strip */}
      <div className="border-b border-neutral-200">
        <div className="px-6">
          <div className="flex flex-wrap py-3 gap-4 text-xs text-neutral-700">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-green-600" />
              <span>Open Now • Closes 8 PM</span>
            </div>
            <div className="flex items-center">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2 text-green-600">
                <path d="M17.5 8.33334H2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17.5 8.33334C17.5 11.6971 17.5 13.379 16.5355 14.3431C15.571 15.3072 13.8891 15.3072 10.5254 15.3072H9.47461C6.11094 15.3072 4.42911 15.3072 3.46447 14.3431C2.5 13.379 2.5 11.6971 2.5 8.33334V8.33334C2.5 4.96968 2.5 3.28784 3.46447 2.32314C4.42911 1.35847 6.11094 1.35847 9.47461 1.35847H10.5254C13.8891 1.35847 15.571 1.35847 16.5355 2.32314C17.5 3.28784 17.5 4.96968 17.5 8.33334V8.33334Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5.83331 18.6417V15.3083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14.1667 18.6417V15.3083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9.99998 11.6667C11.1505 11.6667 12.0833 10.734 12.0833 9.58337C12.0833 8.43277 11.1505 7.50004 9.99998 7.50004C8.84939 7.50004 7.91666 8.43277 7.91666 9.58337C7.91666 10.734 8.84939 11.6667 9.99998 11.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Est. 2018</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex pt-0 bg-white border-b border-neutral-200">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 py-3 flex justify-center items-center gap-2
                ${activeTab === tab.id 
                  ? 'text-green-600 border-b-2 text-sm border-green-600' 
                  : 'text-neutral-500 text-sm hover:text-neutral-800'}
                transition-colors
              `}
            >
              <TabIcon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Services Content */}
      {activeTab === 'services' && (
        <div className="max-w-4xl  mx-auto px-6 pt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-neutral-800">Select Service</h2>
            {/* View Toggle */}
            <div className="flex bg-white border border-neutral-200 rounded-lg shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-l-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-green-100 text-green-600' 
                    : 'text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-r-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-green-100 text-green-600' 
                    : 'text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            {servicesByCategory.map((category) => (
              <div key={category.category} className="bg-white rounded-xl shadow-sm mb-4 border-b last:border-b-0">
                <button
                  onClick={() => toggleCategory(category.category)}
                  className="w-full flex justify-between items-center p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-green-600">{getCategoryIcon(category.category)}</span>
                    <span className="font-medium">{category.category}</span>
                  </div>
                  <ChevronDown 
                    className={`w-5 h-5 text-neutral-500 transition-transform duration-200 ${
                      expandedCategory === category.category ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                
                {expandedCategory === category.category && (
                  <div className="px-4 pb-4">
                    <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-3`}>
                      {category.items.map((service) => (
                        <div
                          key={service.id}
                          onClick={() => toggleServiceSelection(service)}
                          className={`
                            relative bg-neutral-50 p-4 rounded-xl cursor-pointer
                            transition-all duration-200 border border-neutral-200
                            ${selectedServices.find(s => s.id === service.id) 
                              ? 'ring-2 ring-green-500 bg-green-50' 
                              : 'hover:border-green-200'}
                          `}
                        >
                          {service.popular && (
                            <div className="absolute top-3 right-3">
                              <div className="bg-green-500 text-white text-xs font-semibold py-1 px-3 rounded-full">
                                Popular
                              </div>
                            </div>
                          )}
                          
                          <div className="mb-2">
                            <div className="font-semibold text-neutral-800">{service.serviceName}</div>
                            <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                              {service.description || `Professional ${service.serviceName} service tailored to your needs.`}
                            </p>
                          </div>
                          
                          <div className="flex justify-between items-center mt-4">
                            <span className="text-neutral-500 text-sm">60 min</span>
                            <span className="text-green-700 font-medium">${service.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="px-4 pt-6">
          <div className="text-neutral-600 text-center py-6">
            Team information will be displayed here
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="px-4 pt-6">
          <div className="text-neutral-600 text-center py-6">
            Reviews will be displayed here
          </div>
        </div>
      )}

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
              className="bg-green-600 text-white px-6 py-3 rounded-xl 
              hover:bg-green-700 transition-colors shadow-lg w-full max-w-xs"
            >
              Book Appointment
            </button>
          </div>
        </div>
      )}

      {/* Fixed Book Now Button - Only show if no services selected */}
      {selectedServices.length === 0 && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4 z-10">
          <button className="w-full max-w-md py-3 rounded-xl bg-green-600 text-white font-medium shadow-lg hover:bg-green-700 transition-colors">
            Book Appointment
          </button>
        </div>
      )}
    </div>
  );
};

export default ServicesSection;