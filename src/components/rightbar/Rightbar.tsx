'use client';

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import useSubscribeModal from "@/app/hooks/useSubscribeModal";
import MorphingText from "./MorphingText";
import RotatingText from "./RotatingText";
import Search from "../header/Search";
import EventCard from "../EventCard";
import { SafeListing } from "@/app/types";
import Image from "next/image";

const events = [
  {
    title: "Crush The Curve",
    description: "High-intensity fitness workshop",
    date: "Feb 15",
    time: "2:00 PM PST",
    location: "Anchorage, AK",
    imageSrc: "/assets/wellness.jpg",
    category: "Fitness",
    price: "$45"
  },
  {
    title: "Barber Battle",
    description: "Professional styling competition",
    date: "Feb 25",
    time: "3:00 PM CST",
    location: "Miami, FL",
    imageSrc: "/assets/barber.jpg",
    category: "Competition",
    price: "$85"
  },
  {
    title: "Wellness Retreat",
    description: "Full day of relaxation",
    date: "Mar 1",
    time: "9:00 AM HST",
    location: "Honolulu, HI", 
    imageSrc: "/assets/spa.jpg",
    category: "Wellness",
    price: "$120"
  },
];

interface RightbarProps {
  listings?: SafeListing[];
  currentUser?: any;
}

export default function Rightbar({ listings = [], currentUser }: RightbarProps) {
  const router = useRouter();
  const subscribeModal = useSubscribeModal();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (listings.length > 4) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          (prevIndex + 4 >= listings.length) ? 0 : prevIndex + 4
        );
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [listings?.length]);

    // Add null check for listings
    if (!listings || listings.length === 0) {
      console.log('No listings available');
      return null;
    }
  

    const currentStores = listings?.slice(currentIndex, Math.min(currentIndex + 4, listings.length)) || [];
    const totalPages = Math.ceil(listings.length / 4); // Add this line before return

  return (
    <div className="hidden md:flex flex-col gap-6 h-auto mt-8 w-full">
      <Search />

      {/* Trending Stores Section */}
      <div className="w-full ">
     
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-lg font-semibold">Trending Stores</h2>
            <button 
              className="text-sm text-gray-500 hover:text-[#F08080] transition-colors"
              onClick={() => router.push('/listings')}
            >
              View all
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 ">
            {currentStores.map((listing, index) => (
              <div 
                key={index}
                onClick={() => router.push(`/listings/${listing.id}`)}
                className="aspect-w-1 aspect-h-1 w-full"
              >
                <div
                  className="w-full h-full bg-gray-300 shadow-sm rounded-md"
                  style={{ 
                    backgroundImage: `url(${listing.imageSrc})`, 
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center'
                  }}
                />
              </div>
            ))}
          </div>

          {listings.length > 4 && (
            <div className="flex justify-center gap-2 shadow-sm">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx * 4)}
                />
              ))}
            </div>
          )}
    
      </div>

         
            <div 
        className="relative rounded-lg overflow-hidden -mt-2 cursor-pointer bg-slate-800 shadow-sm"
        onClick={() => subscribeModal.onOpen()}
      >
        <div className="relative h-32 flex items-center justify-center">
          <RotatingText />
        </div>
      </div>
  

      {/* Events Section */}
      <div className="w-full">
      
          <div className="flex items-center justify-between mb-4 -mt-2">
            <h2 className="text-lg font-semibold">Upcoming Events</h2>
            <button 
              className="text-sm text-gray-500 hover:text-[#F08080] transition-colors"
              onClick={() => router.push('/events')}
            >
              View all
            </button>
          </div>

          <div className="flex flex-col">
            {events.map((event, index) => (
              <EventCard key={index} event={event} />
            ))}
          </div>
        </div>
  


    </div>
  );
}