'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { SafeListing, SafeUser } from '@/app/types';
import ServiceCard from '@/components/listings/ServiceCard';
import WorkerCard from './WorkerCard';
import { Search, Grid, List, Clipboard, Users, Star, Share2, Heart, UserPlus } from 'lucide-react';

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
  const { title, location, galleryImages, imageSrc, description, employees = [], user } = listing;
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'Services' | 'Team' | 'Reviews'>('Services');
  const [city, state] = location?.split(',').map(s => s.trim()) || [];

  return (
    <div className="w-full">
      {/* Background Banner */}
      <div className="relative w-full h-36 sm:h-36 rounded-xl overflow-hidden">
        <Image
          src={galleryImages?.[0] || imageSrc}
          alt="listing background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent z-10" />

        {/* Circular Action Buttons */}
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          {[Heart, Share2].map((Icon, index) => (
            <button key={index} className="p-3 rounded-full border-white border bg-black/10 backdrop-blur-md shadow-md flex items-center justify-center hover:bg-white transition">
              <Icon className="w-5 h-5 text-white" />
            </button>
          ))}
        </div>
      </div>

      {/* Centered Avatar & Info */}
      <div className="flex flex-col items-center -mt-12 z-20 relative">
        <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-md">
          <Image
            src={user.image || '/placeholder.jpg'}
            alt="avatar"
            width={96}
            height={96}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="text-center mt-4 space-y-1 px-[5vw]">
          <div className="flex justify-center items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#60A5FA" color="#ffffff">
              <path d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9 12.8929L10.8 14.5L15 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">{city}{state ? `, ${state}` : ''}</p>
          {description && <p className="line-clamp-2 text-gray-600 text-xs max-w-3xl mx-auto">{description}</p>}
          <p className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full inline-block">
  128 followers
</p>

        </div>
      </div>

      {/* CTA Bar: Search, Toggle, Follow, Reserve */}
      <div className="mt-6 flex flex-wrap gap-2 items-center w-full">
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

        <div className="bg-[#EBF4FE] rounded-xl flex items-center shadow-sm h-12 px-2">
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
          <UserPlus className="w-5 h-5" />
          <span>Follow</span>
        </button>

        <button className="h-12 px-4 shadow-sm bg-white text-gray-500 rounded-xl hover:bg-neutral-100 transition-colors flex items-center space-x-2 text-sm">
          <Clipboard className="w-5 h-5" />
          <span>Reserve</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-6 border-b flex gap-8">
        {[
          { key: 'Services', label: 'Services', icon: Clipboard },
          { key: 'Team', label: 'Team', icon: Users },
          { key: 'Reviews', label: 'Reviews', icon: Star },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`pb-4 ml-4 flex items-center text-sm gap-2 border-b-2 transition-colors duration-200 ${
              activeTab === key ? 'text-[#60A5FA] border-[#60A5FA]' : 'text-gray-500 border-transparent hover:text-[#60A5FA]'
            }`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
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
