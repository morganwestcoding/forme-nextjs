'use client';

import React from 'react';
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { SafeListing, SafeReservation, SafeUser, SafeService } from "@/app/types";
import useRentModal from "@/app/hooks/useRentModal";
import useListingDetailsModal from "@/app/hooks/useListingDetailsModal";
import { format } from 'date-fns';
import Avatar from "../ui/avatar";
import { categories } from "../Categories";
import axios from "axios";
import { toast } from "react-hot-toast";
import { ChevronRight, User, Calendar, Clock, ExternalLink, Heart, Share2, Star, ChevronDown, Scissors, Droplet, Waves, Palette, Anchor, Rocket, SearchCheckIcon } from 'lucide-react';
import HeartButton from "@/components/HeartButton";
import { IconType } from "react-icons";

// Define a type for the service with additional UI properties
interface EnhancedService extends SafeService {
  icon: any;
  estimatedDuration: string;
}

// Define a type for category
interface ServiceCategory {
  id: string;
  name: string;
  color: string;
  icon: any;
  services: EnhancedService[];
}

interface ListingCardProps {
  data: SafeListing;
  reservation?: SafeReservation;
  onAction?: (id: string) => void;
  disabled?: boolean;
  actionId?: string;
  actionLabel?: string;
  onAccept?: () => void;
  onDecline?: () => void;
  showAcceptDecline?: boolean;
  currentUser?: SafeUser | null;
  categories: typeof categories;
}

const ListingCard: React.FC<ListingCardProps> = ({
  data,
  categories,
  reservation,
  onAction,
  disabled = false,
  actionId = '',
  actionLabel,
  onAccept,
  onDecline,
  showAcceptDecline,
  currentUser,
}) => {
  const router = useRouter();
  const rentModal = useRentModal();
  const listingDetailsModal = useListingDetailsModal();
  const [step, setStep] = useState<number>(1);
  const [selectedService, setSelectedService] = useState<EnhancedService | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  // Group services by category
  const serviceCategories = useMemo<ServiceCategory[]>(() => {
    const categoryMap = new Map<string, ServiceCategory>();
    
    // Define category icons - this would need to be customized for your actual categories
    const categoryIcons: Record<string, any> = {
      'Massage': Waves,
      'Wellness': Anchor,
      'Fitness': Rocket,
      'Nails': Palette,
      'Spa': Droplet,
      'Barber': Scissors,
      'Default': User // Fallback icon
    };
    
    // Define category colors - customize as needed
    const categoryColors: Record<string, string> = {
      'Massage': 'bg-[#D4B185]',
      'Wellness': 'bg-[#C4D4A9]',
      'Fitness': 'bg-[#86A4BB]',
      'Nails': 'bg-[#E5B9AD]',
      'Spa': 'bg-[#D8C3CE]',
      'Barber': 'bg-[#D6C3B6]',
      'Default': 'bg-gray-200'
    };
    
    // Group services by category
    data.services.forEach(service => {
      const category = service.category || 'Default';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          id: category.toLowerCase().replace(/\s+/g, '-'),
          name: category,
          color: categoryColors[category] || categoryColors['Default'],
          icon: categoryIcons[category] || categoryIcons['Default'],
          services: []
        });
      }
      
      // Get estimated duration based on price (just an example)
      // You might want to customize this or add duration to your service model
      const estimatedDuration = 
        service.price < 50 ? '30 min' :
        service.price < 80 ? '45 min' :
        service.price < 120 ? '60 min' : '90 min';
      
      const serviceWithIcon: EnhancedService = {
        ...service,
        icon: categoryIcons[category] || categoryIcons['Default'],
        estimatedDuration: estimatedDuration // Use estimatedDuration instead of duration
      };
      
      const categoryData = categoryMap.get(category);
      if (categoryData) {
        categoryData.services.push(serviceWithIcon);
      }
    });
    
    return Array.from(categoryMap.values());
  }, [data.services]);

  const handleEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    rentModal.onOpen(data);
  };

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (disabled || !actionId) return;

    try {
      await axios.delete(`/api/listings/${actionId}`);
      toast.success('Listing deleted');
      router.refresh();
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const handleAction = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (disabled || !actionId || !onAction) return;
    onAction(actionId);
  };

  const handleShare = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    console.log('Share listing');
  };

  const handleViewListing = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    router.push(`/listings/${data.id}`);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(prev => prev === categoryId ? null : categoryId);
  };

  const getStatusBadgeStyles = (status: string) => {
    switch(status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default: // pending or any other state
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'accepted':
        return 'accepted';
      case 'declined':
        return 'declined';
      default: // pending or any other state
        return '...pending';
    }
  };

  // Extract city and state from location
  const [city, state] = data.location?.split(',').map(s => s.trim()) || [];

  return (
    <div className="bg-white rounded-3xl shadow-md overflow-hidden max-w-xl mx-2">
      {/* Image Header Section */}
      <div className="relative h-[200px] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/70 z-10"></div>
        
        <Image 
          src={data.imageSrc}
          alt={data.title}
          fill
          className="w-full h-full object-cover absolute"
        />
        
{/* Action Buttons */}
<div className="absolute top-4 right-4 flex space-x-2 z-20">
  <button 
    onClick={(e) => {
      e.stopPropagation();
      setIsFavorite(!isFavorite);
    }}
    className="bg-white/80 hover:bg-white/90 rounded-full p-3
    flex items-center justify-center transition-colors group"
    aria-label="Add to Favorites"
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" 
      className=" text-neutral-800 group-hover:text-green-600"
    > 
      <path d="M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  </button>

  <button 
    onClick={(e) => handleShare(e)}
    className="bg-white/80 hover:bg-white/90 rounded-full p-3
    flex items-center justify-center transition-colors group"
    aria-label="Share Listing"
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none"
      className=" text-neutral-800 group-hover:text-green-600"
    > 
    <path d="M21 6.5C21 8.15685 19.6569 9.5 18 9.5C16.3431 9.5 15 8.15685 15 6.5C15 4.84315 16.3431 3.5 18 3.5C19.6569 3.5 21 4.84315 21 6.5Z" stroke="currentColor" stroke-width="1.5"></path>
    <path d="M9 12C9 13.6569 7.65685 15 6 15C4.34315 15 3 13.6569 3 12C3 10.3431 4.34315 9 6 9C7.65685 9 9 10.3431 9 12Z" stroke="currentColor" stroke-width="1.5"></path>
    <path d="M21 17.5C21 19.1569 19.6569 20.5 18 20.5C16.3431 20.5 15 19.1569 15 17.5C15 15.8431 16.3431 14.5 18 14.5C19.6569 14.5 21 15.8431 21 17.5Z" stroke="currentColor" stroke-width="1.5"></path>
    <path d="M8.72852 10.7495L15.2285 7.75M8.72852 13.25L15.2285 16.2495" stroke="currentColor"  stroke-width="1.5"></path>
</svg>

  </button>

  <button 
    onClick={(e) => handleViewListing(e)}
    className="bg-white/80 hover:bg-white/90 rounded-full p-3
    flex items-center justify-center transition-colors group"
    aria-label="View Listing Details"
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none"
      className=" text-neutral-800 group-hover:text-green-600"
    > 
      <path d="M2 12C2 7.75736 2 5.63604 3.46447 4.31802C4.92893 3 7.28596 3 12 3C16.714 3 19.0711 3 20.5355 4.31802C22 5.63604 22 7.75736 22 12C22 16.2426 22 18.364 20.5355 19.682C19.0711 21 16.714 21 12 21C7.28596 21 4.92893 21 3.46447 19.682C2 18.364 2 16.2426 2 12Z" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      /> 
      <path d="M8.4 8H7.6C6.84575 8 6.46863 8 6.23431 8.23431C6 8.46863 6 8.84575 6 9.6V10.4C6 11.1542 6 11.5314 6.23431 11.7657C6.46863 12 6.84575 12 7.6 12H8.4C9.15425 12 9.53137 12 9.76569 11.7657C10 11.5314 10 11.1542 10 10.4V9.6C10 8.84576 10 8.46863 9.76569 8.23431C9.53137 8 9.15425 8 8.4 8Z" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinejoin="round" 
      /> 
      <path d="M6 16H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /> 
      <path d="M14 8H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /> 
      <path d="M14 12H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /> 
      <path d="M14 16H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /> 
    </svg>
  </button>
</div>

        {/* Location and Rating */}
        <div className="absolute bottom-4 left-4 text-white  z-20">
          <div className="flex items-center space-x-2 mb-1">
            <h1 className="text-xl font-bold drop-shadow-lg">{data.title}</h1>
            <div className="flex items-center bg-white/30 rounded-lg px-2 py-1">
              <Star className="w-4 h-4 text-yellow-400 mr-1" />
              <span className="text-sm font-semibold pr-1">4.7</span>
            </div>
          </div>
          <p className="text-xs drop-shadow-md flex items-center">
            {city}, {state} • 2.3 miles away
          </p>
        </div>
      </div>

      {/* Non-Reservation View */}
      {!reservation && (
        <div className="p-6 pt-4">
          {/* Quick Info Strip */}
          <div className="flex justify-between items-center mb-4 text-xs text-neutral-600">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-green-600" />
              Open Now • Closes 8 PM
            </div>
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2 text-green-600" />
              {data.employees?.length || 0} Employees
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center mb-6">
            {[1, 2, 3].map((currentStep) => (
              <div 
                key={currentStep} 
                className={`h-1.5 flex-1 mx-1 rounded-full ${
                  step >= currentStep 
                    ? 'bg-green-500' 
                    : 'bg-neutral-200'
                }`}
              />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-neutral-800">Select Service</h2>
              
              {/* Accordion-Style Service Categories */}
              <div className="max-h-[50vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  {serviceCategories.map((category) => (
                    <div key={category.id} className="border-b pb-2">
                      {/* Category Header */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCategory(category.id);
                        }}
                        className="w-full flex justify-between items-center py-2 hover:bg-neutral-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <category.icon className="w-5 h-5 text-green-600" />
                          <span className="text-xs font-medium text-neutral-800">{category.name}</span>
                        </div>
                        <ChevronDown 
                          className={`w-5 h-5 text-neutral-600 transition-transform ${
                            expandedCategory === category.id ? 'rotate-180' : ''
                          }`} 
                        />
                      </button>

                      {/* Expanded Services */}
                      {expandedCategory === category.id && (
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          {category.services.map((service) => {
                            return (
                              <button
                                key={service.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedService(service);
                                  setStep(2);
                                }}
                                className={`
                                  flex flex-col items-center p-4 rounded-2xl transition-all
                                  ${selectedService?.id === service.id 
                                    ? 'bg-green-100 border-2 border-green-500' 
                                    : 'bg-neutral-100 hover:bg-green-50'}
                                `}
                              >
                                <SearchCheckIcon className="w-8 h-8 text-green-600" />
                                <span className="mt-2 text-neutral-800">{service.serviceName}</span>
                                <div className="flex justify-between w-full text-sm text-neutral-600 mt-1">
                                  <span>${service.price}</span>
                                  <span>{service.estimatedDuration}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-neutral-800">Choose Therapist</h2>
              <div className="space-y-3">
                {data.employees?.map((employee) => (
                  <button
                    key={employee.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEmployee(employee);
                      setStep(3);
                    }}
                    className={`
                      w-full flex items-center justify-between p-4 rounded-2xl transition-all
                      ${selectedEmployee?.id === employee.id 
                        ? 'bg-green-100 border-2 border-green-500' 
                        : 'bg-neutral-100 hover:bg-green-50'}
                    `}
                  >
                    <div className="flex items-center">
                      <User className="w-10 h-10 mr-4 text-green-600" />
                      <div className="text-left">
                        <div className="flex items-center">
                          <span className="font-semibold text-neutral-800 mr-2">{employee.fullName}</span>
                          <div className="flex items-center text-xs text-neutral-600">
                            <Star className="w-4 h-4 text-yellow-500 mr-1" />
                            4.7
                          </div>
                        </div>
                        <div className="text-sm text-neutral-600">{selectedService?.category || "Specialist"}</div>
                        <div className="text-xs text-neutral-500">
                          {selectedService?.category || "Category"} • {selectedService?.serviceName || "Service"}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="text-green-600" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-neutral-800">Pick a Time</h2>
              <div className="flex space-x-3">
                <div className="flex-1 flex items-center bg-neutral-100 rounded-xl p-3">
                  <Calendar className="mr-2 text-green-600" />
                  <input 
                    type="date" 
                    className="bg-transparent w-full focus:outline-none" 
                  />
                </div>
                <div className="flex-1 flex items-center bg-neutral-100 rounded-xl p-3">
                  <Clock className="mr-2 text-green-600" />
                  <input 
                    type="time" 
                    className="bg-transparent w-full focus:outline-none" 
                  />
                </div>
              </div>

              {/* Additional Service Details */}
              {selectedService && selectedEmployee && (
                <div className="bg-neutral-100 rounded-2xl p-4 mt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-neutral-800">{selectedService.serviceName}</h3>
                      <p className="text-sm text-neutral-600">{selectedService.estimatedDuration || "60 min"}</p>
                    </div>
                    <span className="font-medium text-neutral-800">${selectedService.price}</span>
                  </div>
                  <div className="mt-2 flex items-center">
                    <User className="w-6 h-6 mr-2 text-green-600" />
                    <span className="text-sm text-neutral-600">{selectedEmployee.fullName}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedService && selectedEmployee && step === 3 && (
            <button 
              onClick={() => router.push(`/listings/${data.id}`)}
              className="w-full mt-6 bg-green-500 text-white py-4 rounded-2xl 
              hover:bg-green-600 transition-colors flex items-center justify-center"
            >
              Reserve Now
              <ChevronRight className="ml-2" />
            </button>
          )}
        </div>
      )}

      {/* Reservation View */}
      {reservation && (
        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar src={reservation.user.image ?? undefined} />
              <div>
                <h3 className="font-medium text-gray-900">
                  {reservation.user.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {format(new Date(reservation.date), 'PP')}
                </p>
              </div>
            </div>
            
            {/* Status Badge */}
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyles(reservation.status)}`}>
              {getStatusText(reservation.status)}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="text-xs text-gray-500 block mb-1">Service</span>
              <span className="font-medium text-sm">{reservation.serviceName}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="text-xs text-gray-500 block mb-1">Time</span>
              <span className="font-medium text-sm">{reservation.time}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="text-xs text-gray-500 block mb-1">Employee</span>
              <span className="font-medium text-sm">
                {data.employees?.find(emp => emp.id === reservation.employeeId)?.fullName || "Not assigned"}
              </span>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <span className="text-xs text-gray-500 block mb-1">Date</span>
              <span className="font-medium text-sm">{format(new Date(reservation.date), 'MMM d, yyyy')}</span>
            </div>
          </div>

          {reservation.note && (
            <div className="bg-gray-50 p-3 rounded-xl">
              <span className="text-xs text-gray-500 block mb-1">Note</span>
              <p className="text-sm">{reservation.note}</p>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <span className="text-gray-500 text-sm">Total</span>
            <span className="font-semibold text-base">${reservation.totalPrice}</span>
          </div>

          {/* Only show Accept/Decline Buttons if status is pending */}
          {showAcceptDecline && reservation.status === 'pending' && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onAccept) onAccept();
                }}
                disabled={disabled}
                className="flex-1 bg-green-500 text-white font-medium py-3.5 rounded-xl 
                        hover:bg-green-600 hover:shadow-md transition-all 
                        disabled:opacity-50 disabled:cursor-not-allowed text-sm
                        flex items-center justify-center"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  className="w-4 h-4 mr-1.5"
                  strokeWidth="2"
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span>Accept</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onDecline) onDecline();
                }}
                disabled={disabled}
                className="flex-1 bg-gray-200 text-gray-700 font-medium py-3.5 rounded-xl 
                        hover:bg-gray-300 hover:shadow-sm transition-all 
                        disabled:opacity-50 disabled:cursor-not-allowed text-sm
                        flex items-center justify-center"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  className="w-4 h-4 mr-1.5"
                  strokeWidth="2"
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
                <span>Decline</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ListingCard;