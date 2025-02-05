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
  }, [listings.length]);

  const currentStores = listings.slice(currentIndex, currentIndex + 4);

  return (
    <div className="hidden md:flex flex-col gap-6 h-auto mt-8 w-full">
      <Search />

      {/* Trending Stores Section */}
      {listings.length > 0 && (
        <div className="w-full rounded-xl overflow-hidden shadow-sm bg-white">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Trending Stores</h2>
              <button 
                className="text-sm text-gray-500 hover:text-[#F9AE8B] transition-colors"
                onClick={() => router.push('/listings')}
              >
                View all
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {currentStores.map((store) => (
                <div 
                  key={store.id}
                  onClick={() => router.push(`/listings/${store.id}`)}
                  className="aspect-square relative rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition group"
                >
                  <Image
                    fill
                    src={store.imageSrc}
                    alt={store.title}
                    className="object-cover transition group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>

            {listings.length > 4 && (
              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: Math.ceil(listings.length / 4) }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx * 4)}
                    className={`w-2 h-2 rounded-md transition-all duration-300 
                      ${currentIndex === idx * 4 
                        ? 'bg-[#F9AE8B] w-6' 
                        : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

            {/* Subscribe Banner */}
            <div 
        className="relative rounded-xl overflow-hidden cursor-pointer bg-slate-800 shadow-sm"
        onClick={() => subscribeModal.onOpen()}
      >
        <div className="relative h-32 flex items-center justify-center">
          <RotatingText />
        </div>
      </div>

      {/* Events Section */}
      <div className="w-full rounded-xl overflow-hidden shadow-sm bg-white">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Upcoming Events</h2>
            <button 
              className="text-sm text-gray-500 hover:text-[#F9AE8B] transition-colors"
              onClick={() => router.push('/events')}
            >
              View all
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {events.map((event, index) => (
              <EventCard key={index} event={event} />
            ))}
          </div>
        </div>
      </div>


    </div>
  );
}