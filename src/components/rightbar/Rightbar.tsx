'use client';
import { useRouter } from "next/navigation";
import { useState } from "react";

const articles = [
  {
    title: "Startup Challenges",
    description: "Key strategies to tackle startup obstacles.",
    imageSrc: "/assets/business-3.jpg",
  },
  {
    title: "Digital Age Marketing",
    description: "Exploring innovative digital marketing methods.",
    imageSrc: "/assets/business-4.jpg",
  },
  {
    title: "Sustainable Business",
    description: "Adopting sustainability for business success.",
    imageSrc:"/assets/business-1.jpg",
  },
  {
    title: "Social Entrepreneurship",
    description: "Entrepreneurs blending profit with social impact.",
    imageSrc: "/assets/business-2.jpg",
  },
];

export default function Rightbar() {
  const router = useRouter();
  const [isToggled, setIsToggled] = useState(false);

  return (
    <div className="flex flex-col justify-end bg-transparent gap-3 pr-24 h-auto mt-8">
      <div className="w-full rounded-2xl drop-shadow-sm bg-[#ffffff] p-6 relative">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="text-lg font-bold">Subscribe today</div>
         {/*<label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={isToggled}
                onChange={() => setIsToggled(!isToggled)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#b1dafe]"></div>
            </label>*/}
          </div>
          <div className="text-sm font-normal text-gray-600"> Experience priority features, enhanced analytics, 
          and be at the forefront of innovation with exclusive early access to new features.
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col justify-start rounded-2xl shadow-sm bg-[#ffffff] p-0 mx-0 overflow-hidden pb-5">
        <div className="px-6 py-6 text-lg font-bold">What&apos;s Happening</div>
        <hr />
        {articles.map((article, index) => (
          <div key={index} className="flex justify-between items-center hover:bg-[#b1dafe] hover:text-white w-full px-6 py-4" onClick={() => router.push('/articles')}>
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