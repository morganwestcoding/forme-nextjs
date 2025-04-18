'use client';

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { SafeListing, SafeReservation, SafeUser } from "@/app/types";
import useRentModal from "@/app/hooks/useRentModal";
import useListingDetailsModal from "@/app/hooks/useListingDetailsModal";
import { format } from 'date-fns';
import Avatar from "../ui/avatar";
import { categories } from "../Categories";
import axios from "axios";
import { toast } from "react-hot-toast";
import HeartButton from "@/components/HeartButton";

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
  disabled,
  actionId = '',
  actionLabel,
  onAccept,
  onDecline,
  showAcceptDecline,
  currentUser,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const rentModal = useRentModal();
  const listingDetailsModal = useListingDetailsModal();
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Create array of all images including main image
  const allImages = [data.imageSrc, ...(data.galleryImages || [])];
  const hasMultipleImages = allImages.length > 1;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    rentModal.onOpen(data);
  };

  const handleDelete = async (e: React.MouseEvent) => {
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

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || !actionId || !onAction) return;
    onAction(actionId);
  };

  const handleImageChange = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  const getStateAcronym = (state: string) => {
    const stateMap: {[key: string]: string} = {
      'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
      'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
      'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
      'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
      'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
      'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
      'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
      'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
      'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
      'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
    };
    return stateMap[state] || state;
  };

  const [city, state] = data.location?.split(',').map(s => s.trim()) || [];
  const stateAcronym = state ? getStateAcronym(state) : '';

  // Don't display category tag if it's the default category
  const shouldDisplayCategory = data.category && data.category !== 'Default' && data.category !== 'All';

  // Add this to your ListingCard component
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

  return (
    <div className="col-span-1 flex justify-center w-full max-w-[395px] mx-auto">
      <div className="bg-white border rounded-2xl flex flex-col w-full transition-all duration-300 overflow-hidden hover:shadow-md">
        {!reservation && (
          <>
            {/* Adding p-4 for entire content area (including image) */}
            <div className="p-6">
              {/* Image Section with rounded corners */}
              <div className="relative h-[175px] w-full group cursor-pointer overflow-hidden shadow rounded-xl">
                <Image
                  onClick={() => router.push(`/listings/${data.id}`)} 
                  fill
                  className="object-cover w-full h-full transform transition-all duration-500 
                            group-hover:scale-110"
                  src={allImages[currentImageIndex]}
                  alt="Listing"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/50 
                              opacity-0 transition-all duration-300 group-hover:opacity-100" />
                
                  {/* Category Tag - Only show if not default */}
         

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex items-center gap-2 z-10 
                              opacity-0 translate-y-2 transition-all duration-300 
                              group-hover:opacity-100 group-hover:translate-y-0">
                  <HeartButton 
                    listingId={data.id}
                    currentUser={currentUser}
                    favoriteIds={data.favoriteIds}
                  />
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsSaved(!isSaved);
                    }}
                    className="p-2.5 rounded-full bg-black/50 border border-white/20 backdrop-blur-sm 
                              hover:bg-black/60 transition-all duration-300 shadow-lg
                              transform scale-90 group-hover:scale-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="21" height="21" color="#ffffff" fill="none">
                      <path d="M18.7083 7C20.1334 8.59227 21 10.6949 21 13C21 17.9706 16.9706 22 12 22C7.02944 22 3 17.9706 3 13C3 10.6949 3.86656 8.59227 5.29168 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="rgba(0, 0, 0, 0.35)" />
                      <path d="M12.0253 2.00052L12 14M12.0253 2.00052C11.8627 1.99379 11.6991 2.05191 11.5533 2.17492C10.6469 2.94006 9 4.92886 9 4.92886M12.0253 2.00052C12.1711 2.00657 12.3162 2.06476 12.4468 2.17508C13.3531 2.94037 15 4.92886 15 4.92886" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>

                {/* Image Navigation Dots */}
                {hasMultipleImages && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 
                                  bg-black/30 backdrop-blur-sm rounded-full px-2.5 py-1.5 
                                  opacity-0 transition-all duration-300 
                                  group-hover:opacity-100 transform scale-95 group-hover:scale-100">
                    {allImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => handleImageChange(index, e)}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-200
                          ${currentImageIndex === index 
                            ? 'bg-white scale-110' 
                            : 'bg-white/40 hover:bg-white/60'
                          }
                        `}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Content Section - No need for additional borders since everything is within the p-4 */}
              <div className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex flex-col">
                    <h3 className="font-medium text-gray-900 text-base">
                      {data.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {city}, {stateAcronym}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 mb-1">
                            {data.services[currentServiceIndex].serviceName}
                          </div>
                          <div className="font-semibold text-sm">
                            ${data.services[currentServiceIndex].price}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {data.services.map((_, index) => (
                            <button
                              key={index}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentServiceIndex(index);
                              }}
                              className={`w-2 h-2 rounded-full transition-all duration-300 
                                ${currentServiceIndex === index 
                                  ? 'bg-[#60A5FA] w-7 h-2' 
                                  : 'bg-gray-300 hover:bg-gray-400'
                                }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    {/* Quick Book Button - Styled like sidebar buttons */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg text-xs font-medium
                                hover:bg-gray-200 hover:shadow-sm transition-all duration-200 
                                flex items-center justify-start h-11"
                    >
                      <div className="w-6 flex items-center justify-center">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24" 
                          width="18" 
                          height="18" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="1.5"
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path 
                            d="M2.5 12.2432C2.5 7.88594 2.5 5.70728 3.75212 4.35364C5.00424 3 7.01949 3 11.05 3H12.95C16.9805 3 18.9958 3 20.2479 4.35364C21.5 5.70728 21.5 7.88594 21.5 12.2432V12.7568C21.5 17.1141 21.5 19.2927 20.2479 20.6464C18.9958 22 16.9805 22 12.95 22H11.05C7.01949 22 5.00424 22 3.75212 20.6464C2.5 19.2927 2.5 17.1141 2.5 12.7568V12.2432Z" 
                            stroke="currentColor" 
                            strokeWidth="1.5"
                          />
                          <path 
                            d="M18 2V4M6 2V4M3 8H21" 
                            stroke="currentColor" 
                            strokeWidth="1.5" 
                            strokeLinecap="round"
                          />
                          <path 
                            d="M11.9955 13H12.0045M11.9955 17H12.0045M15.991 13H16M8 13H8.00897M8 17H8.00897" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                      <span className="ml-2">Quick Book</span>
                    </button>
                    
                    {/* Reserve Button - Right-aligned icon */}
                    <button 
                      onClick={() => router.push(`/listings/${data.id}`)}
                      className="flex-1 bg-[#60A5FA] text-white py-3 px-4 rounded-lg text-xs font-medium
                                shadow-sm hover:shadow-md hover:bg-[#4287f5] transition-all duration-200
                                flex items-center justify-between h-11"
                    >
                      <span className="flex-1 text-center">Reserve</span>
                      <div className="w-6 flex items-center justify-center">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24" 
                          width="18" 
                          height="18" 
                          color="#ffffff" 
                          fill="none"
                        >
                          <path 
                            d="M20.0001 11.9998L4.00012 11.9998" 
                            stroke="currentColor" 
                            strokeWidth="1.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                          />
                          <path 
                            d="M15.0003 17C15.0003 17 20.0002 13.3176 20.0002 12C20.0002 10.6824 15.0002 7 15.0002 7" 
                            stroke="currentColor" 
                            strokeWidth="1.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                          />
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Reservation View */}
        {reservation && (
          <div className="p-4 flex flex-col gap-4 border rounded-xl">
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
                  {reservation.listing.employees.find(emp => emp.id === reservation.employeeId)?.fullName || "Not assigned"}
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
                    onAccept?.();
                  }}
                  disabled={disabled}
                  className="flex-1 bg-[#60A5FA] text-white font-medium py-3.5 rounded-xl 
                          hover:bg-[#4287f5] hover:shadow-md transition-all 
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
                    onDecline?.();
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
    </div>
  );
}

export default ListingCard;