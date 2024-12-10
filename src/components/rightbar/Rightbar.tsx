'use client';
import { useRouter } from "next/navigation";
import { useState } from "react";
import useSubscribeModal from "@/app/hooks/useSubscribeModal";

const articles = [
  {
    title: "Crush The Curve",
    description: "Crush the Curve revolutionizes fitness with results-driven, cutting-edge workouts.",
    imageSrc: "/assets/wellness.jpg",
  },
  {
    title: "Iron And Age",
    description: "Iron and Edge delivers bold workouts and fitness tips for modern men.",
    imageSrc: "/assets/fit.jpg",
  },
  {
    title: "Lather, Razor, Repeat, Refine",
    description: "Explore the latest trends, techniques, and tips for mastering the art of barbering.",
    imageSrc:"/assets/barber.jpg",
  },
  {
    title: "Pure Tranquil Escape",
    description: "Indulge in luxurious treatments designed to rejuvenate your body and calm your mind.",
    imageSrc: "/assets/spa.jpg",
  },
];

export default function Rightbar() {
  const router = useRouter();
  const [isToggled, setIsToggled] = useState(false);
  const subscribeModal = useSubscribeModal();

  return (
    <div className="hidden md:flex flex-col justify-end bg-transparent gap-3 h-auto mt-8">
      <div className="w-full rounded-2xl drop-shadow-sm bg-[#ffffff] p-6 relative"
      onClick={() => subscribeModal.onOpen()}>
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="text-lg font-bold">Subscribe today</div>
          </div>
          <div className="text-sm font-normal text-gray-600"> 

          Access priority features, advanced analytics, and exclusive early access to innovations, keeping you ahead.
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col justify-start rounded-2xl shadow-sm bg-[#ffffff] p-0 mx-0 overflow-hidden pb-5">
        <div className="px-6 py-6 text-lg font-bold">What&apos;s Happening</div>
        <hr />
        {articles.map((article, index) => (
          <div key={index} className="flex justify-between items-center hover:bg-[#D5D7D8] hover:text-white w-full px-6 py-4" onClick={() => router.push('/articles')}>
            <div>
              <h3 className="text-base font-semibold">{article.title}</h3>
              <p className="text-sm pr-4">{article.description}</p>
            </div>
            <div className="w-20 h-20 bg-gray-300 rounded-xl drop-shadow flex-shrink-0" style={{ backgroundImage: `url(${article.imageSrc})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
          </div>
        ))}
      </div>
    </div>
  );
}