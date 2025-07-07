'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { SafeListing, SafeUser } from '@/app/types';
import ServiceCard from '@/components/listings/ServiceCard';
import WorkerCard from './WorkerCard';
import {
  Search, Grid, List, Clipboard, Users, Star, UserPlus,
} from 'lucide-react';

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
      {/* Clean Split Hero */}
      <div className="w-full h-64 -mt-8 relative overflow-hidden">
        {/* Text section */}
        <div className="absolute left-0 top-11 transform z-20 max-w-xl">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#60A5FA" color='#ffffff'>
                <path d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M9 12.8929L10.8 14.5L15 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-gray-900 text-sm">
              {city}{state ? `, ${state}` : ''}
            </p>
            {description && (
              <p className="text-gray-900 text-xs leading-relaxed line-clamp-3">
                {description}
              </p>
            )}
<div className="flex gap-2">
              {/* Followers Button */}
              <div className="rounded-lg px-3 py-1.5 transition-all duration-300 bg-gray-50 hover:bg-gray-100 flex justify-center min-w-[70px]">
                <div className="flex items-center gap-1.5 text-gray-600">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none">
    <path d="M13.1977 8H10.8023C7.35836 8 5.03641 11.5806 6.39304 14.7994C6.58202 15.2477 7.0156 15.5385 7.49535 15.5385H8.33892C8.62326 15.5385 8.87111 15.7352 8.94007 16.0157L10.0261 20.4328C10.2525 21.3539 11.0663 22 12 22C12.9337 22 13.7475 21.3539 13.9739 20.4328L15.0599 16.0157C15.1289 15.7352 15.3767 15.5385 15.6611 15.5385H16.5047C16.9844 15.5385 17.418 15.2477 17.607 14.7994C18.9636 11.5806 16.6416 8 13.1977 8Z" stroke="currentColor" stroke-width="1.5"></path>
    <circle cx="12" cy="5" r="3" stroke="currentColor" stroke-width="1.5"></circle>
</svg>
                  <span className="text-xs text-gray-700 font-medium">128</span>
                </div>
              </div>

              {/* Likes Button */}
              <div className="rounded-lg px-3 py-1.5 transition-all text-gray-600 duration-300 bg-gray-50 hover:bg-gray-100 flex justify-center min-w-[70px]">
                <div className="flex items-center gap-1.5">
   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none">
    <path d="M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
</svg>
                  <span className="text-xs text-gray-700 font-medium">42</span>
                </div>
              </div>

              {/* Rating Button */}
              <div className="rounded-lg px-3 py-1.5 transition-all text-gray-600 duration-300 bg-gray-50 hover:bg-gray-100 flex justify-center min-w-[70px]">
                <div className="flex items-center gap-1.5">
         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none">
    <path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
</svg>
                  <span className="text-xs text-gray-700 font-medium">4.7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        

        <div className="absolute right-0 top-2 bottom-0 w-96">
          <div className="relative h-full">
            <div className="flex flex-col h-full justify-center">
              {/* Top shelf */}
              <div className="flex justify-end">
                {(() => {
                  // Create array of available images
                  const availableImages = galleryImages && galleryImages.length > 0 ? galleryImages : [imageSrc];
                  // Get first 3 images for top shelf
                  const topShelfImages = Array(3).fill(null).map((_, idx) => 
                    availableImages[idx % availableImages.length]
                  );
                  return topShelfImages.map((img, idx) => {
                    // Determine rounding classes for top row
                    let roundingClass = '';
                    if (idx === 0) roundingClass = 'rounded-tl-lg'; // Left image: top-left corner
                    if (idx === 2) roundingClass = 'rounded-tr-lg'; // Right image: top-right corner
                    // Middle image (idx === 1) gets no rounding
                    
                    return (
                      <div 
                        key={`top-${idx}`}
                        className={`relative ${roundingClass} overflow-hidden shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg cursor-pointer`}
                        style={{
                          width: '120px',
                          height: '80px',
                        }}
                      >
                        <Image
                          src={img}
                          alt={`Shelf Top ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    );
                  });
                })()}
              </div>
              
              {/* Bottom shelf */}
              <div className="flex justify-end">
                {(() => {
                  // Create array of available images
                  const availableImages = galleryImages && galleryImages.length > 0 ? galleryImages : [imageSrc];
                  // Get next 3 images for bottom shelf (or repeat if not enough)
                  const bottomShelfImages = Array(3).fill(null).map((_, idx) => 
                    availableImages[(idx + 3) % availableImages.length]
                  );
                  return bottomShelfImages.map((img, idx) => {
                    // Determine rounding classes for bottom row
                    let roundingClass = '';
                    if (idx === 0) roundingClass = 'rounded-bl-lg'; // Left image: bottom-left corner
                    if (idx === 2) roundingClass = 'rounded-br-lg'; // Right image: bottom-right corner
                    // Middle image (idx === 1) gets no rounding
                    
                    return (
                      <div 
                        key={`bottom-${idx}`}
                        className={`relative ${roundingClass} overflow-hidden shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg cursor-pointer`}
                        style={{
                          width: '120px',
                          height: '80px',
                        }}
                      >
                        <Image
                          src={img}
                          alt={`Shelf Bottom ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Bar */}
      <div className="flex flex-wrap gap-2 items-center w-full">
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

        <button className="py-3 px-4 shadow-sm bg-white text-gray-500 rounded-xl hover:bg-neutral-100 transition-colors flex items-center space-x-2 text-sm">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none">
    <path d="M13.1977 8H10.8023C7.35836 8 5.03641 11.5806 6.39304 14.7994C6.58202 15.2477 7.0156 15.5385 7.49535 15.5385H8.33892C8.62326 15.5385 8.87111 15.7352 8.94007 16.0157L10.0261 20.4328C10.2525 21.3539 11.0663 22 12 22C12.9337 22 13.7475 21.3539 13.9739 20.4328L15.0599 16.0157C15.1289 15.7352 15.3767 15.5385 15.6611 15.5385H16.5047C16.9844 15.5385 17.418 15.2477 17.607 14.7994C18.9636 11.5806 16.6416 8 13.1977 8Z" stroke="currentColor" stroke-width="1.5"></path>
    <circle cx="12" cy="5" r="3" stroke="currentColor" stroke-width="1.5"></circle>
</svg>    <span>Follow</span>
        </button>

        <button className="py-3 px-4 shadow-sm bg-white text-gray-500 rounded-xl hover:bg-neutral-100 transition-colors flex items-center space-x-2 text-sm">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none">
    <path d="M16 2V6M8 2V6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M13 4H11C7.22876 4 5.34315 4 4.17157 5.17157C3 6.34315 3 8.22876 3 12V14C3 17.7712 3 19.6569 4.17157 20.8284C5.34315 22 7.22876 22 11 22H13C16.7712 22 18.6569 22 19.8284 20.8284C21 19.6569 21 17.7712 21 14V12C21 8.22876 21 6.34315 19.8284 5.17157C18.6569 4 16.7712 4 13 4Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M3 10H21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M11.9955 14H12.0045M11.9955 18H12.0045M15.991 14H16M8 14H8.00897M8 18H8.00897" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
</svg>
          <span>Reserve</span>
        </button>
      </div>


<div className="mt-6">
  <div className="flex border-b border-gray-200 relative justify-center">
    <div className="flex gap-8">
      {[
        { 
          key: 'Services', 
          label: 'Services', 
          icon: () => (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none">
              <path d="M7.99805 16H11.998M7.99805 11H15.998" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
              <path d="M7.5 3.5C5.9442 3.54667 5.01661 3.71984 4.37477 4.36227C3.49609 5.24177 3.49609 6.6573 3.49609 9.48836L3.49609 15.9944C3.49609 18.8255 3.49609 20.241 4.37477 21.1205C5.25345 22 6.66767 22 9.49609 22L14.4961 22C17.3245 22 18.7387 22 19.6174 21.1205C20.4961 20.241 20.4961 18.8255 20.4961 15.9944V9.48836C20.4961 6.6573 20.4961 5.24177 19.6174 4.36228C18.9756 3.71984 18.048 3.54667 16.4922 3.5" stroke="currentColor" strokeWidth="1.5"></path>
              <path d="M7.49609 3.75C7.49609 2.7835 8.2796 2 9.24609 2H14.7461C15.7126 2 16.4961 2.7835 16.4961 3.75C16.4961 4.7165 15.7126 5.5 14.7461 5.5H9.24609C8.2796 5.5 7.49609 4.7165 7.49609 3.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"></path>
            </svg>
          )
        },
        { 
          key: 'Team', 
          label: 'Team', 
          icon: () => (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none">
              <path d="M15 8C15 9.65685 13.6569 11 12 11C10.3431 11 9 9.65685 9 8C9 6.34315 10.3431 5 12 5C13.6569 5 15 6.34315 15 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              <path d="M16 4C17.6568 4 19 5.34315 19 7C19 8.22309 18.268 9.27523 17.2183 9.7423" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              <path d="M13.7143 14H10.2857C7.91876 14 5.99998 15.9188 5.99998 18.2857C5.99998 19.2325 6.76749 20 7.71426 20H16.2857C17.2325 20 18 19.2325 18 18.2857C18 15.9188 16.0812 14 13.7143 14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              <path d="M17.7143 13C20.0812 13 22 14.9188 22 17.2857C22 18.2325 21.2325 19 20.2857 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              <path d="M8 4C6.34315 4 5 5.34315 5 7C5 8.22309 5.73193 9.27523 6.78168 9.7423" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              <path d="M3.71429 19C2.76751 19 2 18.2325 2 17.2857C2 14.9188 3.91878 13 6.28571 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          )
        },
        { 
          key: 'Reviews', 
          label: 'Reviews', 
          icon: () => (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none">
              <path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          )
        },
      ].map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setActiveTab(key as any)}
          className={`pb-4 pt-3 px-6 flex items-center justify-center text-sm gap-2.5 transition-all duration-150 relative ${
            activeTab === key 
              ? 'font-medium' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          style={activeTab === key ? {
            color: '#60A5FA',
          } : {}}
        >
          <div className={`transition-transform duration-150 ${
            activeTab === key ? 'transform -translate-y-px' : ''
          }`}>
            <Icon />
          </div>
          <span className={`transition-transform duration-150 ${
            activeTab === key ? 'transform -translate-y-px' : ''
          }`}>{label}</span>
          {activeTab === key && (
            <div 
              className="absolute bottom-0 left-0 right-0 h-0.5"
              style={{ 
                backgroundColor: '#60A5FA'
              }}
            />
          )}
        </button>
      ))}
    </div>
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