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
import { ChevronRight, User, Calendar, Clock, ExternalLink, Heart, Share2, Star, ChevronDown, Scissors, Droplet, SprayCan, Waves, Palette, Flower, Dumbbell, SearchCheckIcon } from 'lucide-react';
import HeartButton from "@/components/HeartButton";
import { IconType } from "react-icons";
import ReservationModal from "../modals/ReservationModal"; 

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
  const [showReservationModal, setShowReservationModal] = useState(false);
  
  // Group services by category
  const serviceCategories = useMemo<ServiceCategory[]>(() => {
    const categoryMap = new Map<string, ServiceCategory>();
    
    // Define category icons - this would need to be customized for your actual categories
    const categoryIcons: Record<string, any> = {
      'Massage': Waves,
      'Wellness': Flower,
      'Fitness': Dumbbell,
      'Nails': Palette,
      'Spa': Droplet,
      'Barber': Scissors,
      'Default': User, // Fallback icon
      'Salon': SprayCan,
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

  // Get main category icon
  const mainCategory = data.category || 'Default';
  const categoryIcons: Record<string, any> = {
    'Massage': Waves,
    'Wellness': Flower,
    'Fitness': Dumbbell,
    'Nails': Palette,
    'Spa': Droplet,
    'Barber': Scissors,
    'Default': User,
    'Salon': SprayCan,
  };
  const MainCategoryIcon = categoryIcons[mainCategory] || categoryIcons['Default'];

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
    <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl overflow-hidden max-w-xl relative">
      {/* Full-height image background with gradient overlay */}
      <div className="absolute inset-0 z-0">
        <Image 
          src={data.imageSrc}
          alt={data.title}
          fill
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay for entire card */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#60A5FA]/10 via-black/60 to-black"></div>
 
      </div>

      {/* Card content with relative positioning */}
      <div className="relative z-10">
        {/* Image Header Section */}
        <div className="relative h-[300px] overflow-hidden">
        <div className="absolute top-4 left-4 z-20">
            <div className="bg-black/40 border border-white backdrop-blur-sm rounded-lg px-3 py-1.5 text-white">
              <span className="text-xs">{data.category}</span>
            </div>
          </div>
          {/* Action Buttons 
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
                className="text-neutral-800 group-hover:text-[#60A5FA]"
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
                className="text-neutral-800 group-hover:text-[#60A5FA]"
              > 
                <path d="M21 6.5C21 8.15685 19.6569 9.5 18 9.5C16.3431 9.5 15 8.15685 15 6.5C15 4.84315 16.3431 3.5 18 3.5C19.6569 3.5 21 4.84315 21 6.5Z" stroke="currentColor" strokeWidth="1.5"></path>
                <path d="M9 12C9 13.6569 7.65685 15 6 15C4.34315 15 3 13.6569 3 12C3 10.3431 4.34315 9 6 9C7.65685 9 9 10.3431 9 12Z" stroke="currentColor" strokeWidth="1.5"></path>
                <path d="M21 17.5C21 19.1569 19.6569 20.5 18 20.5C16.3431 20.5 15 19.1569 15 17.5C15 15.8431 16.3431 14.5 18 14.5C19.6569 14.5 21 15.8431 21 17.5Z" stroke="currentColor" strokeWidth="1.5"></path>
                <path d="M8.72852 10.7495L15.2285 7.75M8.72852 13.25L15.2285 16.2495" stroke="currentColor" strokeWidth="1.5"></path>
              </svg>
            </button>

            <button 
              onClick={(e) => handleViewListing(e)}
              className="bg-white/80 hover:bg-white/90 rounded-full p-3
              flex items-center justify-center transition-colors group"
              aria-label="View Listing Details"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none"
                className="text-neutral-800 group-hover:text-[#60A5FA]"
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
          */}

           {/* Location and Rating */}
           <div className="absolute bottom-5 left-5 right-5 text-white z-20">
           <div className="flex items-center space-x-2 mb-1">
              <h1 className="text-xl font-medium drop-shadow-lg">{data.title}</h1>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="#519872">
                <path d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M9 12.8929L10.8 14.5L15 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-xs drop-shadow-md font-thin flex items-center mb-3">
              {city}, {state} • 2.3 miles away
            </p>
            
            {/* Stats Section - Dribbble Style */}
            <div className="flex items-center justify-between bg-black/20 border-white border backdrop-blur-sm rounded-lg px-4 py-3 text-white">
              <div className="flex flex-col items-center space-y-1">
                <div className="flex items-center space-x-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="currentColor" fill="none">
    <path d="M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
</svg>
                  <span className="text-sm font-medium">3.8k</span>
                </div>
                <span className="text-xs opacity-70">Likes</span>
              </div>
              
              <div className="w-px h-8 bg-white/30"></div>
              
              <div className="flex flex-col items-center space-y-1">
                <div className="flex items-center space-x-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="currentColor" fill="none">
    <path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
</svg>
                  <span className="text-sm font-medium">4.7</span>
                </div>
                <span className="text-xs opacity-70">Rating</span>
              </div>
              
              <div className="w-px h-8 bg-white/30"></div>
              
              <div className="flex flex-col items-center space-y-1">
    <div className="flex items-center space-x-1">
      {/* Sun icon for open */}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2" />
        <path d="M12 21v2" />
        <path d="M4.22 4.22l1.42 1.42" />
        <path d="M18.36 18.36l1.42 1.42" />
        <path d="M1 12h2" />
        <path d="M21 12h2" />
        <path d="M4.22 19.78l1.42-1.42" />
        <path d="M18.36 5.64l1.42-1.42" />
      </svg>
      <span className="text-sm font-medium">Open</span>
    </div>
    <span className="text-xs opacity-70">Now</span>
  </div>
</div>
         
          </div>
        </div>


        {/* Non-Reservation View */}
        {!reservation && (
          <div className="px-5 pb-4 pt-2 -mt-3">
  <button 
    onClick={() => setShowReservationModal(true)}
    className="w-full bg-[#60A5FA]/50 backdrop-blur-md text-white p-3 rounded-xl
        flex items-center justify-center hover:bg-white/10 transition-all
        shadow-lg border border-white/10"
  >
    <div className="flex items-center text-center gap-3">

      <div className="flex flex-col items-center text-center">
        <span className="font-medium text-sm">Explore Services</span>
      </div>
    </div>
  </button>
</div>
        )}

        {/* Reservation View */}
        {reservation && (
          <div className="p-4 flex flex-col gap-4 backdrop-blur-md bg-black/40 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar src={reservation.user.image ?? undefined} />
                <div>
                  <h3 className="font-medium">
                    {reservation.user.name}
                  </h3>
                  <p className="text-sm text-gray-300">
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
              <div className="bg-white/10 p-3 rounded-lg">
                <span className="text-xs text-gray-300 block mb-1">Service</span>
                <span className="font-medium text-sm">{reservation.serviceName}</span>
              </div>
              <div className="bg-white/10 p-3 rounded-lg">
                <span className="text-xs text-gray-300 block mb-1">Time</span>
                <span className="font-medium text-sm">{reservation.time}</span>
              </div>
              <div className="bg-white/10 p-3 rounded-lg">
                <span className="text-xs text-gray-300 block mb-1">Employee</span>
                <span className="font-medium text-sm">
                  {data.employees?.find(emp => emp.id === reservation.employeeId)?.fullName || "Not assigned"}
                </span>
              </div>
              <div className="bg-white/10 p-3 rounded-lg">
                <span className="text-xs text-gray-300 block mb-1">Date</span>
                <span className="font-medium text-sm">{format(new Date(reservation.date), 'MMM d, yyyy')}</span>
              </div>
            </div>

            {reservation.note && (
              <div className="bg-white/10 p-3 rounded-lg">
                <span className="text-xs text-gray-300 block mb-1">Note</span>
                <p className="text-sm">{reservation.note}</p>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-white/10">
              <span className="text-gray-300 text-sm">Total</span>
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
                          hover:bg-[#60A5FA] hover:shadow-md transition-all 
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
                  className="flex-1 bg-gray-600 text-white font-medium py-3.5 rounded-xl 
                          hover:bg-gray-500 hover:shadow-sm transition-all 
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

      {/* ReservationModal */}
      {showReservationModal && (
        <ReservationModal
          isOpen={showReservationModal}
          onClose={() => setShowReservationModal(false)}
          listing={data}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default ListingCard;