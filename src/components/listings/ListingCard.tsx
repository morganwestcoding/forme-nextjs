'use client';

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo, useState, useRef, useEffect } from "react";

import useRentModal from "@/app/hooks/useRentModal";
import axios from "axios";
import { toast } from "react-hot-toast";
import { format } from 'date-fns';
import Avatar from "../ui/avatar";

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
        rounded-2xl 
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
        pb-4
      `}>
{!reservation && (
  <>
    <div className="
      relative 
      overflow-hidden 
      rounded-t-2xl
      cursor-pointer 
      group
      h-32
      w-full
    ">
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
      <div className="absolute top-3 right-3">
        <HeartButton 
          listingId={data.id} 
          currentUser={currentUser}
        />
      </div>
    </div>

    {/* Replace this div with the new one that includes rating */}
    <div className="flex justify-between items-center px-6 pt-3 pb-2">
      <div 
        className={`w-8 h-5 ${categoryColor} shadow-sm rounded-md flex items-center justify-center`} 
        title={data.category}
      >
        <span className="text-white text-xs font-extralight">
          {data.category.charAt(0).toUpperCase()}
        </span>
      </div>
      {/* Add rating here */}
  {/* Rating with 5 stars */}
  <div className="flex items-center gap-0.5">
  <span className=" text-sm font-semibold mr-2 text-neutral-700">
          5.0
        </span>
    {[1, 2, 3, 4, 5].map((_, index) => (
      <svg 
        key={index}
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        width="19" 
        height="19" 
        className="text-neutral-700"
        fill="#ffffff"
      > 
        <path 
          d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" 
          stroke="#a2a2a2" 
          strokeWidth="1" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        /> 
      </svg>
    ))}
  </div>
</div>
  </>
)}

        {!reservation && (
          <div className="flex justify-between items-start px-6 pb-2">
            {/* Left side: Title and Location */}
            <div className="flex flex-col">
              <div className="font-medium text-sm capitalize">
                {data.title}
              </div>
              <div className="font-light text-xs text-neutral-500">
                {city}, {stateAcronym}
              </div>
            </div>
            


{/* Right side: Services Badge */}
{data.services && data.services.length > 0 && (
  <div className="inline-flex items-center gap-2 px-3 py-3 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition">
    <div className="flex gap-1.5">
    <button
        onClick={(e) => {
          e.stopPropagation();
          setCurrentServiceIndex(prev => 
            prev === 0 ? data.services.length - 1 : prev - 1
          );
        }}
        className="text-neutral-400 hover:text-neutral-600 transition cursor-pointer"
      >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" color="#a2a2a2" fill="none">
    <path d="M15 6C15 6 9.00001 10.4189 9 12C8.99999 13.5812 15 18 15 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
</svg>
</button>
      <span className="text-xs text-neutral-600">
        {data.services[currentServiceIndex].serviceName}
      </span>
      <span className="text-xs font-medium">
        ${data.services[currentServiceIndex].price}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setCurrentServiceIndex(prev => 
            prev === data.services.length - 1 ? 0 : prev + 1
          );
        }}
        className="text-neutral-400 hover:text-neutral-600 transition cursor-pointer"
      >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" color="#a2a2a2" fill="none">
    <path d="M9.00005 6C9.00005 6 15 10.4189 15 12C15 13.5812 9 18 9 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
</svg>
</button>
    </div>

  </div>
)}
  </div>
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
                      <div className="font-medium">{reservation.note}</div>
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