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
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

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
            <div className="relative h-[155px] w-full group">
              <Image
                onClick={() => router.push(`/listings/${data.id}`)} 
                fill
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                src={data.imageSrc}
                alt="Listing"
              />
              
              {/* Category Tag */}
              <div className="absolute top-4 left-6">
                <div className="px-4 py-1.5 bg-black/50 backdrop-blur-sm rounded-md">
                  <span className="text-white text-sm font-medium capitalize">
                    {data.category}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="absolute top-4 right-6 flex items-center gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLiked(!isLiked);
                  }}
                  className="p-3 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/60 transition"
                >
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="#ffffff" fill="none">
    <path d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
</svg>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSaved(!isSaved);
                  }}
                  className="p-3 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/60 transition"
                >
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="#ffffff" fill="none">
    <path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
</svg>
                </button>
              </div>
            </div>

            {/* Content Section */}
            <div className="px-6 pt-6 pb-5 ">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex flex-col">
                  <h3 className="font-semibold text-sm text-gray-900">
                    {data.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {city}, {stateAcronym}
                  </p>
                </div>
              </div>

              {/* Services and Reserve Section */}
              <div className="space-y-4">
                {/* Service Carousel with Indicator Dots */}
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
                      
                      {/* Service Navigation */}
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

                {/* Action Buttons Container */}
                <div className="flex items-center gap-2">
                  {/* Quick Book Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      // Quick book logic here
                    }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 px-4 rounded-xl transition-all duration-300 text-sm font-medium"
                  >
                    Quick Book
                  </button>
                  
                  {/* Reserve Button */}
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