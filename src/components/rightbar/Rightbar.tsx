'use client';
import { useRouter } from "next/navigation";
import { useState } from "react";
import useSubscribeModal from "@/app/hooks/useSubscribeModal";
import MorphingText from "./MorphingText";
import RotatingText from "./RotatingText";
import Search from "../header/Search";
import EventCard from "../EventCard";

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

export default function Rightbar() {
  const router = useRouter();
  const subscribeModal = useSubscribeModal();

  return (
// Keep the original container width
<div className="hidden md:flex flex-col gap-6 h-auto mt-8 w-full">
  <Search/>

  <div className="flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold">Upcoming Events</h2>
      <button 
        className="text-sm text-gray-400 hover:text-[#F9AE8B] transition-colors"
        onClick={() => router.push('/events')}
      >
        View all
      </button>
    </div>

    {/* Adjust grid to fit within 360px width */}
    <div className="flex flex-col">
          {events.map((event, index) => (
            <EventCard key={index} event={event} />
          ))}
        </div>
  </div>

  {/* Keep RotatingText component */}
  <div 
    className="relative rounded-xl overflow-hidden cursor-pointer bg-slate-800"
    onClick={() => subscribeModal.onOpen()}
  >
    <div className="relative h-32 flex items-center justify-center">
      <RotatingText />
    </div>
  </div>
</div>
  );
}