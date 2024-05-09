'use client';
import { useRouter } from "next/navigation";


const articles = [
  {
    title: "Startup Challenges",
    description: "Key strategies to tackle startup obstacles.",
    imageSrc: "/assets/business-3.jpg", // Replace with your image path
  },
  {
    title: "Digital Age Marketing",
    description: "Exploring innovative digital marketing methods.",
    imageSrc: "/assets/business-4.jpg", // Replace with your image path
  },
  {
    title: "Sustainable Business",
    description: "Adopting sustainability for business success.",
    imageSrc:"/assets/business-1.jpg", // Replace with your image path
  },
  {
    title: "Social Entrepreneurship",
    description: "Entrepreneurs blending profit with social impact.",
    imageSrc: "/assets/business-2.jpg", // Replace with your image path
  },
  // ... more articles
];

export default function Rightbar() {
  const router = useRouter();
    return (
      <div className="flex flex-col justify-end bg-transparent  gap-6 pr-24 h-auto mt-8">
        <div className="w-full rounded-2xl drop-shadow-sm bg-[#ffffff] p-6 relative">
          <div className="text-lg font-bold mb-3">Subscribe today
            <div className="text-sm font-normal">Subscribe to unlock new features and if eligible, receive a share of ad&apos;s revenue.</div>
          </div>
        </div>


        <div className="w-full flex flex-col justify-start rounded-2xl shadow bg-[#ffffff]   p-0 mx-0 overflow-hidden  pb-5">
        <div className="px-6 py-6 text-lg font-bold">What&apos;s Happening</div>
        <hr />
        {articles.map((article, index) => (
          <div key={index} className="flex justify-between items-center hover:bg-[#b1dafe] hover:text-white  w-full px-6 py-4" onClick={() => router.push('/articles')}>
            <div>
              <h3 className="text-base font-semibold">{article.title}</h3>
              <p className="text-sm pr-4">{article.description}</p>
            </div>
            <div className="w-20 h-20 bg-gray-300 rounded-xl  drop-shadow flex-shrink-0" style={{ backgroundImage: `url(${article.imageSrc})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
          </div>
        ))}
        </div>
      </div>
    );
  }
  