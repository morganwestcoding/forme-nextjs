'use client';

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import useRentModal from "@/app/hooks/useRentModal";
import axios from "axios";
import { toast } from "react-hot-toast";
import { format } from 'date-fns';

import { 
  SafeListing, 
  SafeReservation, 
  SafeUser 
} from "@/app/types";

import HeartButton from "../HeartButton";
import ModalButton from "../modals/ModalButton";
import { categories } from "../Categories";

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
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);

  const handleNextService = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentServiceIndex((prevIndex) => 
      (prevIndex + 1) % data.services.length
    );
  };

  const handlePreviousService = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentServiceIndex((prevIndex) => 
      prevIndex === 0 ? data.services.length - 1 : prevIndex - 1
    );
  };

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

  const currentService = data.services[currentServiceIndex];
  const categoryColor = categories.find(cat => cat.label === data.category)?.color || 'bg-gray-200';

  // Function to get state acronym
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

  // Split location into city and state, and convert state to acronym
  const [city, state] = data.location?.split(',').map(s => s.trim()) || [];
  const stateAcronym = state ? getStateAcronym(state) : '';

  return (
    <div className="col-span-1">
      <div className="bg-[#ffffff] rounded-2xl flex flex-col gap-2 w-48 shadow-sm">
        <div 
          className="
            w-full
            h-28
            relative 
            overflow-hidden 
            rounded-t-2xl
            cursor-pointer 
            group
          "
        >
          <Image
            onClick={() => router.push(`/listings/${data.id}`)} 
            fill
            className="
              object-cover 
              w-full
              h-full
              group-hover:scale-110 
              transition
            "
            src={data.imageSrc}
            alt="Listing"
          />
          {currentUser?.id === data.userId && pathname === '/properties' ? (
            <div className="absolute top-3 right-3 flex gap-2">
              <button 
                onClick={handleDelete}
                disabled={disabled}
                className="
                  bg-red-500 
                  p-2 
                  rounded-full 
                  hover:bg-red-600 
                  transition
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="white" 
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="absolute top-3 right-3">
              <HeartButton 
                listingId={data.id} 
                currentUser={currentUser}
              />
            </div>
          )}
        </div>

        <div className="px-4 pt-1 pb-1">
          <div 
            className={`w-8 h-5 ${categoryColor} shadow-sm rounded-md flex items-center justify-center`} 
            title={data.category}
          >
            <span className="text-white text-xs font-extralight">
              {data.category.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="font-medium text-sm capitalize px-4">
          {data.title}
        </div>

        <div className="font-light text-xs px-4 text-neutral-500 pb-2">
          {city}, {stateAcronym}
        </div>

        {reservation && (
  <div className="px-4 pb-2">
    {/* User Name */}
    <div className="font-semibold text-sm text-neutral-700 mb-1">
      {reservation.user?.name || 'Guest'}
    </div>
    {/* Service Selected */}
    <div className="font-light text-xs text-neutral-500">
      Service: {reservation.serviceName || 'Not specified'}
    </div>
    <div className="font-light text-xs text-neutral-500">
      Date: {format(new Date(reservation.date), 'PP')}
    </div>
    <div className="font-light text-xs text-neutral-500">
      Time: {reservation.time}
    </div>
    {reservation.note && (
      <div className="font-light text-xs text-neutral-500 mt-1">
        Note: {reservation.note}
      </div>
    )}
    <div className="font-semibold text-sm mt-1">
      Total: ${reservation.totalPrice}
    </div>
  </div>
)}
        
        <hr/>
        
        {data.services && data.services.length > 0 && !reservation && (
          <div className="flex justify-between text-xs capitalize items-center pb-3.5 pt-1 px-4">
            <button 
              className="mr-2" 
              onClick={handlePreviousService}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#a2a2a2" fill="none">
                <path d="M15 6C15 6 9.00001 10.4189 9 12C8.99999 13.5812 15 18 15 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="text-center text-[#7d8085] font-normal">
              <span className="block mb-1">
                {data.services[currentServiceIndex].serviceName}
              </span>
              <span>${data.services[currentServiceIndex].price}</span>
            </div>
            <button 
              className="ml-2" 
              onClick={handleNextService}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#a2a2a2" fill="none">
                <path d="M9.00005 6C9.00005 6 15 10.4189 15 12C15 13.5812 9 18 9 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}

        {/* Regular action button (edit/cancel) */}
        {onAction && actionLabel && !showAcceptDecline && (
          <div className="p-4 -mt-3">
            <ModalButton
              disabled={disabled}
              small
              label={actionLabel}
              onClick={handleAction}
            />
          </div>
        )}

        {/* Accept/Decline buttons */}
        {reservation && showAcceptDecline && (
          <div className="p-4">
            {reservation.status === 'accepted' ? (
              <button
                className="
                  w-full 
                  text-center 
                  py-2 
                  rounded-lg 
                  bg-green-500
                  text-white 
                  text-sm 
                  font-light
                  cursor-default
                "
              >
                Accepted
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAccept?.();
                  }}
                  disabled={disabled}
                  className="
                    flex-1
                    bg-green-500
                    text-white
                    text-sm
                    font-light
                    py-2
                    rounded-lg
                    transition
                    hover:bg-green-600
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  Accept
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDecline?.();
                  }}
                  disabled={disabled}
                  className="
                    flex-1
                    bg-red-500
                    text-white
                    text-sm
                    font-light
                    py-2
                    rounded-lg
                    transition
                    hover:bg-red-600
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
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