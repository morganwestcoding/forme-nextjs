'use client';

import { useRouter } from "next/navigation";
import Image from "next/image";

interface Event {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageSrc: string;
  category: string;
  price: string;
}

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const router = useRouter();
  
  // Extract date parts
  const dateParts = event.date.split(' ');
  const month = dateParts[0];
  const day = dateParts[1];
  
  return (
    <div 
      onClick={() => router.push('/events')}
      className="group flex items-center gap-3 mb-4 p-2 rounded-2xl bg-gray-50 hover:bg-white transition-all duration-300 cursor-pointer hover:shadow-sm"
    >
      {/* Date Box */}
      <div className="min-w-16 h-16 flex flex-col items-center justify-center rounded-lg bg-white shadow-sm group-hover:bg-[#60A5FA] group-hover:text-white transition-colors duration-300">
        <span className="text-xs font-medium uppercase text-neutral-500 group-hover:text-white/90">{month}</span>
        <span className="text-xl font-semibold">{day}</span>
      </div>
      
      {/* Event Image */}
      <div className="relative w-16 h-16 overflow-hidden rounded-lg">
        <Image
          src={event.imageSrc}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      
      {/* Event Details */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium truncate group-hover:text-[#60A5FA] transition-colors duration-300">
          {event.title}
        </h3>
        
        <p className="text-xs text-neutral-500 truncate mt-0.5">
          {event.description}
        </p>
        
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-1 text-xs text-neutral-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2 C 8 2 4 5 4 10 C 4 15 12 22 12 22 C 12 22 20 15 20 10 C 20 5 16 2 12 2 Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="truncate">{event.location}</span>
          </div>
          
          <span className="text-xs font-medium text-neutral-700">{event.price}</span>
        </div>
      </div>
      
      {/* Action icon with smooth transition */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14"></path>
          <path d="m12 5 7 7-7 7"></path>
        </svg>
      </div>
    </div>
  );
};

export default EventCard;