// ListingHead.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { SafeListing, SafeUser } from '@/app/types';
import ServiceCard from '@/components/listings/ServiceCard';
import WorkerCard from './WorkerCard';
import {
  MapPin, Star, Sparkles, TrendingUp, Layers, Search,
  Clipboard, Users, Clock, Grid, List, ChevronDown, ShoppingCart
} from 'lucide-react';

interface ServiceItem {
  id: string;
  serviceName: string;
  price: number;
  category?: string;
  description?: string;
  popular?: boolean;
}

interface ListingHeadProps {
  listing: SafeListing & { user: SafeUser };
  currentUser?: SafeUser | null;
  Services: ServiceItem[];
}

const ListingHead: React.FC<ListingHeadProps> = ({ listing, Services }) => {
  const { title, location, galleryImages, imageSrc } = listing;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [activeTab, setActiveTab] = useState<'Services' | 'team' | 'reviews'>('Services');
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const [city, state] = location?.split(',').map(s => s.trim()) || [];
  const stateAcronym = state || '';

  const ServicesByCategory = (Services || []).reduce((acc, service) => {
    const category = service.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(service);
    return acc;
  }, {} as Record<string, ServiceItem[]>);

  const toggleServiceselection = (service: ServiceItem) => {
    setSelectedServices(prev =>
      prev.find(s => s.id === service.id)
        ? prev.filter(s => s.id !== service.id)
        : [...prev, service]
    );
  };

  const renderServiceGrid = () => (
    <div className="space-y-4">
      {Object.entries(ServicesByCategory).map(([category, items]) => (
        <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-200">
          <button
            onClick={() => setExpandedCategory(prev => prev === category ? null : category)}
            className="w-full flex justify-between items-center p-4"
          >
            <div className="font-medium text-gray-800">{category}</div>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${expandedCategory === category ? 'rotate-180' : ''}`}
            />
          </button>
          {expandedCategory === category && (
            <div className="px-4 pb-4">
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-3`}>
                {items.map(service => (
                  <div
                    key={service.id}
                    onClick={() => toggleServiceselection(service)}
                    className={`bg-neutral-50 p-4 rounded-xl border cursor-pointer hover:border-green-400 transition
                      ${selectedServices.find(s => s.id === service.id) ? 'ring-2 ring-green-600 bg-green-50' : ''}`}
                  >
                    <div className="font-semibold text-gray-800">{service.serviceName}</div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {service.description || 'Professional service'}
                    </p>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-gray-500 text-sm">60 min</span>
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
  );

  return (
    <div className="w-full">
      {/* Header + Location */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <div className="flex items-center gap-2 text-gray-600 text">
   
          <span>{city}, {stateAcronym}</span>
        </div>
      </div>

      {/* Search + Action Buttons */}
      <div className="flex items-center gap-2 mb-6">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search this listing..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full h-12 pl-12 pr-4 border text-sm border-gray-200 rounded-xl"
          />
        </div>
        <button className="px-4 py-3 rounded-xl bg-white shadow-sm text-sm text-gray-500 hover:bg-neutral-100 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
            <path d="M15 8C15 5.23858 12.7614 3 10 3C7.23858 3 5 5.23858 5 8C5 10.7614 7.23858 13 10 13C12.7614 13 15 10.7614 15 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17.5 21L17.5 14M14 17.5H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 20C3 16.134 6.13401 13 10 13C11.4872 13 12.8662 13.4638 14 14.2547" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Follow
        </button>
        <button className="px-4 py-3 rounded-xl bg-white shadow-sm text-sm text-gray-500 hover:bg-neutral-100 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
            <path d="M2 6L8.91302 9.91697C11.4616 11.361 12.5384 11.361 15.087 9.91697L22 6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M2.01577 13.4756C2.08114 16.5412 2.11383 18.0739 3.24496 19.2094C4.37608 20.3448 5.95033 20.3843 9.09883 20.4634C11.0393 20.5122 12.9607 20.5122 14.9012 20.4634C18.0497 20.3843 19.6239 20.3448 20.7551 19.2094C21.8862 18.0739 21.9189 16.5412 21.9842 13.4756C22.0053 12.4899 22.0053 11.5101 21.9842 10.5244C21.9189 7.45886 21.8862 5.92609 20.7551 4.79066C19.6239 3.65523 18.0497 3.61568 14.9012 3.53657C12.9607 3.48781 11.0393 3.48781 9.09882 3.53656C5.95033 3.61566 4.37608 3.65521 3.24495 4.79065C2.11382 5.92608 2.08114 7.45885 2.01576 10.5244C1.99474 11.5101 1.99475 12.4899 2.01577 13.4756Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
          Message
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button onClick={() => setActiveTab('Services')} className={`pb-4 mr-6 flex items-center text-sm gap-2 ${activeTab === 'Services' ? 'border-b-2 border-[#60A5FA] text-[#60A5FA]' : 'text-gray-500 hover:text-[#60A5FA]'}`}>
          <Clipboard className="w-5 h-5" /> Services
        </button>
        <button onClick={() => setActiveTab('team')} className={`pb-4 mr-6 flex items-center text-sm gap-2 ${activeTab === 'team' ? 'border-b-2 border-[#60A5FA] text-[#60A5FA]' : 'text-gray-500 hover:text-[#60A5FA]'}`}>
          <Users className="w-5 h-5" /> Team
        </button>
        <button onClick={() => setActiveTab('reviews')} className={`pb-4 flex items-center text-sm gap-2 ${activeTab === 'reviews' ? 'border-b-2 border-[#60A5FA] text-[#60A5FA]' : 'text-gray-500 hover:text-[#60A5FA]'}`}>
          <Star className="w-5 h-5" /> Reviews
        </button>
      </div>
      {activeTab === 'Services' && (
  <div className="space-y-6">
    <h2 className="text-xl font-bold text-neutral-800">Services</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Services.map(service => (
        <ServiceCard
          key={service.id}
          service={{
            id: service.id,
            serviceName: service.serviceName,
            price: service.price,
            category: service.category || '',
          }}
          listingLocation={listing.location ?? ''}
          listingTitle={listing.title}
          listingImage={listing.galleryImages?.[0] || listing.imageSrc}
        />
      ))}
    </div>
  </div>
)}

      {activeTab === 'team' && (
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
       {listing.employees.map((employee) => (
         <WorkerCard
           key={employee.id}
           employee={employee}
           listingTitle={listing.title}
           onBook={() => {}} // You can pass a booking handler if needed
           onFollow={() => {}}
         />
       ))}
     </div>
      )}
      {activeTab === 'reviews' && (
        <div className="text-center text-gray-500 py-10">Reviews will be displayed here.</div>
      )}
    </div>
  );
};

export default ListingHead;
