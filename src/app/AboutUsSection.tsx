'use client';

import { useState } from 'react';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface AboutUsSectionProps {
  description: string;
  listing: any;
  currentUser: any;
  isOwner: boolean;
  onEditListing: () => void;
  services: {
    id: string;
    serviceName: string;
    price: number;
  }[];
  onServiceSelect?: (serviceId: string, serviceName: string, price: number) => void;
}

const AboutUsSection = ({
  description,
  listing,
  currentUser,
  isOwner,
  onEditListing,
  services,
  onServiceSelect
}: AboutUsSectionProps) => {
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  
  // Calculate how many service groups we have
  const serviceGroups = Math.ceil(services.length / 3);
  
  // Get current services to display (3 at a time)
  const currentServices = services.slice(
    currentServiceIndex * 3, 
    Math.min((currentServiceIndex + 1) * 3, services.length)
  );

  const handleServiceClick = (service: any) => {
    if (onServiceSelect) {
      onServiceSelect(service.id, service.serviceName, service.price);
    }
  };

  return (
    <div className="w-full bg-white border rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-300">
      <div className="flex flex-col">
        {/* Top section with header and menu */}
        <div className="flex justify-between items-center w-full mb-1">
          <h2 className="text-xl font-bold text-black">About Us</h2>
          
          {/* Menu dots - positioned at the far right edge with no extra padding */}
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none p-0 flex items-center justify-center rotate-90 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" color="#71717A" fill="none" className='rotate-90'>
                <path d="M11.9959 12H12.0049" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M17.9998 12H18.0088" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5.99981 12H6.00879" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwner && (
                <DropdownMenuItem onClick={onEditListing} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                  Edit Listing
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                Share Listing
              </DropdownMenuItem>
              {!isOwner && (
                <DropdownMenuItem className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                  Report Listing
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Description paragraph */}
        <p className="text-sm text-black">
          {description}
        </p>
      </div>
      
      {/* Services Section */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-3">Services</h2>
        <div className="grid grid-cols-3 gap-3">
          {currentServices.map(service => (
            <div 
              key={service.id} 
              className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
              onClick={() => handleServiceClick(service)}
            >
              <h3 className="font-medium text-sm mb-1">{service.serviceName}</h3>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">10min</span>
                <span className="font-medium">${service.price}</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Service Navigation Indicators/Controls */}
        {services.length > 3 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {Array.from({ length: serviceGroups }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentServiceIndex(index)}
                className={`
                  transition-all duration-300 
                  ${currentServiceIndex === index 
                    ? 'bg-[#60A5FA] w-7 h-2' 
                    : 'bg-gray-300 hover:bg-gray-400 w-2 h-2'
                  } 
                  rounded-full
                `}
                aria-label={`View service group ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AboutUsSection;