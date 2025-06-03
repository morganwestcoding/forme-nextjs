'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { SafeListing, SafeUser } from '@/app/types';
import ServiceCard from '@/components/listings/ServiceCard';
import WorkerCard from './WorkerCard';
import { Search, Grid, List, Clipboard, Users, Star } from 'lucide-react';

interface ServiceItem {
  id: string;
  serviceName: string;
  price: number;
  category: string;
  description?: string;
  popular?: boolean;
}

interface ListingHeadProps {
  listing: SafeListing & { user: SafeUser; employees?: any[] };
  currentUser?: SafeUser | null;
  Services: ServiceItem[];
}

const ListingHead: React.FC<ListingHeadProps> = ({ listing, Services }) => {
  const { title, location, galleryImages, imageSrc, description, employees = [] } = listing;
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'Services' | 'Team' | 'Reviews'>('Services');
  const [city, state] = location?.split(',').map(s => s.trim()) || [];

  return (
    <div className="w-full">
      {/* Hero Banner with Overlaid Avatar, Title, Location */}
      <div className="relative h-48 sm:h-64 w-full rounded-xl overflow-hidden">
        <Image
          src={galleryImages?.[0] || imageSrc}
          alt="listing hero background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/30 to-transparent z-10" />

        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-sm">
            <Image
              src={listing.user.image || '/placeholder.jpg'}
              alt="avatar"
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
          </div>
          <div>
            <h1 className="text-white text-xl font-bold">{title}</h1>
            <p className="text-sm text-gray-200">{city}, {state}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-4 text-left">
        {description && (
          <p className="text-sm text-gray-500 max-w-3xl">{description}</p>
        )}

        {/* CTA Bar: Search, Toggle, Follow, Reserve */}
        <div className="mt-4 flex flex-wrap gap-2 items-center w-full">
          <div className="relative flex-grow h-12">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search services..."
              className="pl-12 pr-4 w-full h-full border text-sm border-gray-200 rounded-xl"
            />
          </div>

          <div className="bg-[#EBF4FE] rounded-xl flex items-center shadow-sm h-12">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#60A5FA]' : 'text-gray-400'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white shadow-sm text-[#60A5FA]' : 'text-gray-400'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          <button className="h-12 px-4 shadow-sm bg-white text-gray-500 rounded-xl hover:bg-neutral-100 transition-colors flex items-center space-x-2 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 10.5V15C3 17.828 3 19.243 3.879 20.121 4.757 21 6.172 21 9 21H12.5M21 10.5V12.5M7 17H11M15 18.5H22M18.5 22V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>Follow</span>
          </button>

          <button className="h-12 px-4 shadow-sm bg-white text-gray-500 rounded-xl hover:bg-neutral-100 transition-colors flex items-center space-x-2 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M16 2V4M11 2V4M6 2V4M19.5 10C19.5 6.7 19.5 5.05 18.475 4.025C17.45 3 15.8 3 12.5 3H9.5C6.2 3 4.55 3 3.525 4.025C2.5 5.05 2.5 6.7 2.5 10V15C2.5 18.3 2.5 19.95 3.525 20.975C4.55 22 6.2 22 9.5 22H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M17.5 14L17.5 22M21.5 18L13.5 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M7 15H11M7 10H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>Reserve</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-8">
          {[
            { key: 'Services', label: 'Services', icon: Clipboard },
            { key: 'Team', label: 'Team', icon: Users },
            { key: 'Reviews', label: 'Reviews', icon: Star },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`pb-4 flex items-center text-sm gap-2 border-b-2 transition-colors duration-200 ${
                activeTab === key ? 'text-[#60A5FA] border-[#60A5FA]' : 'text-gray-500 border-transparent hover:text-[#60A5FA]'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 sm:px-0 mt-6">
        {activeTab === 'Services' && (
          <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'flex flex-col gap-4'}`}>
            {Services.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                listingLocation={listing.location}
                listingTitle={listing.title}
                listingImage={galleryImages?.[0] || imageSrc}
              />
            ))}
          </div>
        )}

        {activeTab === 'Team' && employees.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map(employee => (
              <WorkerCard
                key={employee.id}
                employee={employee}
                listingTitle={title}
                onBook={() => {}}
                onFollow={() => {}}
              />
            ))}
          </div>
        )}

        {activeTab === 'Reviews' && (
          <div className="text-center text-gray-500 py-10">
            Reviews will be displayed here.
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingHead;
