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
    <div className="w-full bg-white rounded-2xl px-4 transition-all duration-300">
      <div className="flex flex-col">
        <div className="flex justify-between items-center w-full mb-1">
          <h2 className="text-xl font-bold text-black">About Us</h2>
        </div>
        <p className="text-sm text-black">
          {description}
        </p>
      </div>
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-3">Services</h2>
        <div className="grid grid-cols-3 gap-3">
          {currentServices.map(service => (
            <div 
              key={service.id} 
              className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
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