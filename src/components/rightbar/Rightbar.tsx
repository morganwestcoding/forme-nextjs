'use client';
import { useRouter } from "next/navigation";
import { useState } from "react";
import useSubscribeModal from "@/app/hooks/useSubscribeModal";
import MorphingText from "./MorphingText";
import RotatingText from "./RotatingText";
import Search from "../header/Search";

const articles = [
  {
    title: "Crush The Curve",
    author: "The Fitness Hour",
    views: "120K views",
    timeAgo: "3 hours ago",
    imageSrc: "/assets/wellness.jpg",
  },
  {
    title: "Iron And Age",
    author: "Strength Central",
    views: "85K views",
    timeAgo: "5 hours ago",
    imageSrc: "/assets/fit.jpg",
  },
  {
    title: "Lather, Razor, Repeat, Refine",
    author: "Barber Talk",
    views: "95K views",
    timeAgo: "8 hours ago",
    imageSrc:"/assets/barber.jpg",
  },
  {
    title: "Pure Tranquil Escape",
    author: "Wellness Channel",
    views: "110K views",
    timeAgo: "10 hours ago",
    imageSrc: "/assets/spa.jpg",
  },
];

export default function Rightbar() {
  const router = useRouter();
  const [isToggled, setIsToggled] = useState(false);
  const subscribeModal = useSubscribeModal();

  return (
    <div className="hidden md:flex flex-col justify-end bg-transparent gap-3 h-auto mt-8">
      <Search/>


<div className="w-full flex flex-col justify-start pt-2 p-0 mx-0 overflow-hidden pb-5">
        <div className="pb-4 text-lg font-bold">What&apos;s Happening</div>
  
        <div className="grid grid-cols-2 gap-4">
          {articles.map((article, index) => (
            <div 
              key={index} 
              className="flex flex-col hover:bg-[#D5D7D8] rounded-lg cursor-pointer transition-colors" 
              onClick={() => router.push('/articles')}
            >
              <div 
                className="w-full h-24 shadow-sm shadow-slate-300 rounded-t-lg -mb-1" 
                style={{ 
                  backgroundImage: `url(${article.imageSrc})`, 
                  backgroundSize: 'cover', 
                  backgroundPosition: 'center' 
                  
                }}
              />
              <div className="flex flex-col p-4 bg-white rounded-b-lg ">
                <h3 className="text-xs font-semibold mb-1">{article.title}</h3>
                <p className="text-xs text-gray-500">{article.author}</p>
                <div className="flex items-center text-xs text-gray-500">
                  <span>{article.views}</span>
                  <span className="mx-1">&middot;</span>
                  <span>{article.timeAgo}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div 
  className="w-full rounded-lg overflow-hidden cursor-pointer relative"
  onClick={() => subscribeModal.onOpen()}
>
  <div className="relative h-32 bg-white flex items-center justify-center">
  <RotatingText />
  </div>
</div>
    </div>
  );
}