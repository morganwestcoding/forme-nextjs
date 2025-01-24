'use client';

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import useRentModal from "@/app/hooks/useRentModal";
import axios from "axios";
import { toast } from "react-hot-toast";
import { format } from 'date-fns';
import Avatar from "../ui/avatar";
import useListingDetailsModal from "@/app/hooks/useListingDetailsModal";

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
  const listingDetailsModal = useListingDetailsModal(); 
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
  const servicesContainerRef = useRef<HTMLDivElement>(null);
  const categoryColor = categories.find(cat => cat.label === data.category)?.color || 'bg-gray-200';

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
    <div className="col-span-1 flex justify-center">
      <div className={`
        bg-[#ffffff] 
        rounded-lg
        flex 
        flex-col 
        gap-2 
        shadow-sm
        ${reservation ? 'w-80' : 'w-full max-w-[400px]'} 
        min-w-[275px]
        transition-all 
        duration-300
        mx-auto
        relative 
        pb-3
      `}>
        {!reservation && (
          <>
  
  <div className="relative overflow-hidden rounded-t-lg cursor-pointer group h-32 w-full">
  <div className="absolute inset-0 overflow-hidden rounded-t-lg">
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
  </div>
  {/* Category on left */}
  <div className="absolute top-4 left-6">
    <div 
      className={`py-2 w-20 backdrop-blur-sm bg-opacity-70  shadow-sm rounded-md border border-white flex items-center justify-center`} 
      title={data.category}
    >
      <span className="text-white text-xs font-extralight capitalize">
        {data.category}
      </span>
    </div>
  </div>

{/* Remove the existing circle container div and replace with this */}
<div className="absolute bottom-3 right-6 flex items-center gap-1">
  {/* Heart Icon */}
  <div className="flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm p-3 rounded-full">
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      width="21" 
      height="21" 
      color="#ffffff"
      fill="#ffffff"
      fillOpacity="0.2" 
    >
      <path 
        d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z" 
        stroke="currentColor" 
        strokeWidth="1" 
        strokeLinecap="round"
      />
    </svg>
  </div>

  {/* First Star */}
  <div className="flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm p-3 rounded-full">
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      width="21" 
      height="21" 
      color="#ffffff"
      fill="#ffffff"
      fillOpacity={0.2}
    > 
      <path 
        d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" 
        stroke="#ffffff" 
        strokeWidth="1" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      /> 
    </svg>
  </div>

  {/* Second Star */}
  <div className="flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm p-3 rounded-full">
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      width="21" 
      height="21" 
      color="#ffffff"
      fill="#ffffff"
      fillOpacity={0.2}
    > 

    <path d="M18 7C18.7745 7.16058 19.3588 7.42859 19.8284 7.87589C21 8.99181 21 10.7879 21 14.38C21 17.9721 21 19.7681 19.8284 20.8841C18.6569 22 16.7712 22 13 22H11C7.22876 22 5.34315 22 4.17157 20.8841C3 19.7681 3 17.9721 3 14.38C3 10.7879 3 8.99181 4.17157 7.87589C4.64118 7.42859 5.2255 7.16058 6 7" stroke="currentColor" stroke-width="1" stroke-linecap="round" />
    <path d="M12.0253 2.00052L12 14M12.0253 2.00052C11.8627 1.99379 11.6991 2.05191 11.5533 2.17492C10.6469 2.94006 9 4.92886 9 4.92886M12.0253 2.00052C12.1711 2.00657 12.3162 2.06476 12.4468 2.17508C13.3531 2.94037 15 4.92886 15 4.92886" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </div>
</div>
</div>

    {/* Title and Location - Now positioned at bottom center of image */}

    <div className="flex flex-col items-center backdrop-blur-sm px-4 py-2 rounded-lg">
      <div className="font-medium text-sm text-black capitalize">
        {data.title}
      </div>
      <div className="font-light text-xs text-neutral-500">
        {city}, {stateAcronym}
      </div>
    </div>




                          
    
  {/* Service and Reserve Button Container */}
<div className="flex justify-between items-center px-6 pb-2 gap 1.5">
  <div className="flex flex-1 rounded-md p-3 bg-slate-100 shadow-sm">
    {data.services && data.services.length > 0 && (
      <div className="flex w-full">
        {/* Service Section */}
        <div className="inline-flex items-center py-3 flex-1 w-36 rounded-md bg-white shadow-slate-300 shadow-sm ">
          <div className="w-full flex justify-center gap-1.5">
            <span className="text-xs text-black">
              {data.services[currentServiceIndex].serviceName}
            </span>
            <span className="text-xs font-medium text-black">
              ${data.services[currentServiceIndex].price}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentServiceIndex(prev => 
                  prev === data.services.length - 1 ? 0 : prev + 1
                );
              }}
              className="rotate-90 hover:text-neutral-600 transition cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" color="#6B7280" fill="none">
                <path d="M9.00005 6C9.00005 6 15 10.4189 15 12C15 13.5812 9 18 9 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Reserve Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/listings/${data.id}`);
          }}
          className="bg-gray-600 font-light ml-2 shadow-sm text-[#ffffff] text-[0.8rem] px-6 py-3   rounded-md transition hover:opacity-80"
        >
          Reserve
        </button>
      </div>
    )}
  </div>
</div>
     

          
       

          </>
        )}

        {reservation && (
          <>
            <div className="font-medium capitalize px-4 text-base pt-4">
              {data.title}
            </div>

            <div className="flex items-center gap-2 px-4 pb-4">
              <span className="font-light text-xs text-neutral-500">
                {city}, {stateAcronym}
              </span>
              <div 
                className={`w-8 h-5 ${categoryColor} shadow-sm rounded-md flex items-center justify-center`} 
                title={data.category}
              >
                <span className="text-white text-xs font-extralight">
                  {data.category.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            <div className="px-4 pb-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 border-t border-neutral-100 pb-3 pt-3 -mx-4 px-6">
                  <Avatar src={reservation.user.image || undefined} />
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {reservation.user.name}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-neutral-50 p-3 rounded-lg">
                      <div className="text-neutral-500 mb-1">Service</div>
                      <div className="font-medium truncate">{reservation.serviceName}</div>
                    </div>
                    <div className="bg-neutral-50 p-3 rounded-lg">
                      <div className="text-neutral-500 mb-1">Employee</div>
                      <div className="font-medium truncate">
                        {data.employees.find((emp: { id: string; fullName: string }) => 
                          emp.id === reservation.employeeId
                        )?.fullName}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm border-b border-neutral-100 -mx-4 px-4 pb-3">
                    <div className="bg-neutral-50 p-3 rounded-lg">
                      <div className="text-neutral-500 mb-1">Date</div>
                      <div className="font-medium">
                        {format(new Date(reservation.date), 'PP')}
                      </div>
                    </div>
                    <div className="bg-neutral-50 p-3 rounded-lg">
                      <div className="text-neutral-500 mb-1">Time</div>
                      <div className="font-medium">{reservation.time}</div>
                    </div>
                  </div>

                  {reservation.note && (
                    <div className="bg-neutral-50 p-3 rounded-lg text-sm">
                      <div className="text-neutral-500 mb-1">Note</div>
                      <div className="font-medium">{
                        reservation.note}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm text-neutral-500">Total</span>
                    <span className="text-base font-semibold">
                      ${reservation.totalPrice}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {onAction && actionLabel && !showAcceptDecline && (
          <div className="p-4 -mt-4">
            <ModalButton
              disabled={disabled}
              small
              label={actionLabel}
              onClick={handleAction}
            />
          </div>
        )}

        {reservation && showAcceptDecline && (
          <div className="p-4 -mt-5">
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