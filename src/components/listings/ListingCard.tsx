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

  return (
    <div className="col-span-1 flex justify-center w-full max-w-[550px] mx-auto">
      <div className="bg-white rounded-lg flex flex-col w-full shadow-sm transition-all duration-300 overflow-hidden">
        {!reservation && (
          <>
{/* Image Section */}
<div className="relative h-[155px] w-full group cursor-pointer overflow-hidden">
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
  
  {/* Category Tag */}
  <div className="absolute top-6 left-6 z-10">
    <div className="px-3 py-1.5 backdrop-blur-sm bg-black/50 rounded-md border border-white/20
                    transition-all duration-300 transform group-hover:translate-y-0 group-hover:opacity-100
                    shadow-lg">
      <span className="text-white text-xs capitalize">
        {data.category}
      </span>
    </div>
  </div>

  {/* Action Buttons */}
  <div className="absolute top-4 right-6 flex items-center gap-2 z-10 
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
      className="p-3.5 rounded-full bg-black/50 border border-white/20 backdrop-blur-sm 
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
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 
                    bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5 
                    opacity-0 transition-all duration-300 
                    group-hover:opacity-100 transform scale-95 group-hover:scale-100">
      {allImages.map((_, index) => (
        <button
          key={index}
          onClick={(e) => handleImageChange(index, e)}
          className={`w-2 h-2 rounded-full transition-all duration-200
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

            {/* Content Section */}
            <div className="px-6 pt-6 pb-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex flex-col">
                  <h3 className="font-semibold text-gray-900">
                    {data.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {city}, {stateAcronym}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <div className="bg-gray-50 rounded-md p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-1">
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
                            className={`w-2 h-2 rounded-md transition-all duration-300 
                              ${currentServiceIndex === index 
                                ? 'bg-[#F9AE8B] w-6' 
                                : 'bg-gray-300 hover:bg-gray-400'
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 px-4 rounded-xl transition-all duration-300 text-sm font-medium"
                  >
                    Quick Book
                  </button>
                  
                  <button 
                    onClick={() => router.push(`/listings/${data.id}`)}
                    className="flex-1 bg-gradient-to-r from-[#F9AE8B] to-[#FFC5A8] text-white py-3.5 px-4 rounded-xl transition-all duration-300 
                      hover:shadow-md hover:from-[#F9AE8B] hover:to-[#F9AE8B] text-sm font-medium
                      flex items-center justify-center gap-2"
                  >
                    <span>Reserve</span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      className="w-4 h-4"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M5 12h14M12 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}


        {/* Reservation View */}
        {reservation && (
          <div className="p-4 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Avatar />
              <div>
                <h3 className="font-medium text-gray-900">
                  {reservation.user.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {format(new Date(reservation.date), 'PP')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-sm text-gray-500 block mb-1">Service</span>
                <span className="font-medium">{reservation.serviceName}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-sm text-gray-500 block mb-1">Time</span>
                <span className="font-medium">{reservation.time}</span>
              </div>
            </div>

            {reservation.note && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-sm text-gray-500 block mb-1">Note</span>
                <p className="text-sm">{reservation.note}</p>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="text-gray-500">Total</span>
              <span className="font-semibold text-lg">${reservation.totalPrice}</span>
            </div>

            {/* Accept/Decline Buttons */}
            {showAcceptDecline && reservation.status !== 'accepted' && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAccept?.();
                  }}
                  disabled={disabled}
                  className="flex-1 bg-green-500 text-white font-medium py-2 rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Accept
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDecline?.();
                  }}
                  disabled={disabled}
                  className="flex-1 bg-red-500 text-white font-medium py-2 rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Decline
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