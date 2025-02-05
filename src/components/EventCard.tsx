'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
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
  
  return (
    <div 
      onClick={() => router.push('/events')}
      className="group relative bg-white rounded-md h-[125px] w-full mb-6 flex overflow-hidden shadow-sm 
        transition-all duration-300 hover:shadow cursor-pointer"
    >
      {/* Image Section */}
      <div className="relative w-[35%] h-full">
        <div className="absolute inset-0">
          <Image
            src={event.imageSrc}
            alt={event.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
        <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-xs px-2 py-1 rounded-md">
          {event.category}
        </span>
      </div>

      {/* Content Section */}
      <div className="flex-1 p-3 relative">
        {/* Top Section */}
        <div className="flex justify-between items-start">
          <span className="text-neutral-500 text-xs font-light">{event.date} • {event.time}</span>
          <div className="flex gap-2 opacity-0 -translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
            <svg 
              fill="#888888" 
              height="16" 
              viewBox="0 0 24 24" 
              width="16" 
              xmlns="http://www.w3.org/2000/svg" 
              className="hover:fill-gray-600 transition-colors cursor-pointer"
            >
              <path d="M0 0h24v24H0z" fill="none"/>
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
            </svg>
            <svg 
              fill="#888888" 
              height="16" 
              viewBox="0 0 24 24" 
              width="16" 
              xmlns="http://www.w3.org/2000/svg" 
              className="hover:fill-gray-600 transition-colors cursor-pointer"
            >
              <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
              <path d="M0 0h24v24H0z" fill="none"/>
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium mt-2 line-clamp-2">
          {event.title}
        </h3>
        <span className="text-xs text-neutral-500 ">{event.description}</span>

        {/* Bottom Section - Default */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between font-light text-xs text-neutral-500 transition-all duration-300 opacity-100 group-hover:opacity-0 group-hover:translate-y-2">
          <span>{event.location}</span>
          <span>{event.price}</span>
        </div>

        {/* Bottom Section - Reveal */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between text-xs transition-all duration-300 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
          <span className="text-neutral-500">#{event.category} #Event</span>
          <span className="text-[#41C1F2] hover:text-[#41C1F2]/80 transition-colors">
            VIEW EVENT
          </span>
        </div>
      </div>
    </div>
  );
};

export default EventCard;