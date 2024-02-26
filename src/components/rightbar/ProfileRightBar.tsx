import React from 'react';
import { SafeProfile, SafeListing } from '@/app/types';
import Image from 'next/image';
import format from 'date-fns/format'; 

interface ProfileRightbarProps {
  user: SafeProfile;
  listings: SafeListing[];
}

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
const placeholderImages = [
  "/assets/business-2.jpg",
  "/assets/business-1.jpg",
  "/assets/business-4.jpg",
  "/assets/business-3.jpg",
  "/assets/skyline.jpg",
  "/assets/scenic view.jpeg",
  "/assets/water-sample.jpg",
  "/assets/coral-sample.jpg",
  "/assets/swimmer-sample.jpg",
];


const ProfileRightbar: React.FC<ProfileRightbarProps> = ({ user, listings  }) => {
const { bio, createdAt } = user;

const formattedDate = format(new Date(createdAt), 'PPP'); // Example format: Jan 1, 2020
    return (
      <div className="flex flex-col justify-end bg-transparent  gap-6 pr-16 h-auto mt-6">
         {/* Adjusted User Information Div to use Flex Grow to fill available space */}
         <div className="flex flex-col justify-between w-full md:w-11/12 rounded-2xl shadow-sm bg-[#ffffff] px-8 md:px-6 md:py-6 mx-3 md:mr-16 md:ml-2 relative min-h-[128px]">
          <div className="text-xl font-bold mb-2">About Me
            <div className="text-sm font-normal flex-grow">
              <p className="py-2">
              {bio || "No bio available"} {/* Display bio here */}
              </p>
              <ul>
             {/* Adjusted list items to include flex layout for icon and text alignment */}
             <li className="flex items-center pb-1">
                <Image src="/icons/location-tick-outline.svg" alt='notification-bell' width={21} height={21}/>
                <span className="ml-2">Your Location Here</span>
              </li>
              <li className="flex items-center">
                <Image src="/icons/calendar-tick.svg" alt='notification-bell' width={21} height={21}/>
                <span className="ml-2">Joined {formattedDate}</span> {/* Display the formatted creation date here */}
              </li>
              </ul>
            </div>
          </div>
        </div>


{/* Gallery Section: 3x3 Grid of Placeholder Images */}
<div className="w-full md:w-11/12 grid grid-cols-3 gap-0 mx-4 md:mr-20 md:ml-2 bg-transparent bg-opacity-80 rounded-2xl shadow-sm">
  {Array.from({ length: 9 }).map((_, index) => {
    // Determine the class for rounding specific corners based on the square's position
    let cornerClass = "";
    if (index === 0) cornerClass = "rounded-tl-2xl"; // Top-left corner of the grid
    if (index === 2) cornerClass = "rounded-tr-2xl"; // Top-right corner of the grid
    if (index === 6) cornerClass = "rounded-bl-2xl"; // Bottom-left corner of the grid
    if (index === 8) cornerClass = "rounded-br-2xl"; // Bottom-right corner of the grid

    const squareClasses = `w-full h-24 bg-white bg-opacity-80 ${cornerClass}`;
    return (
      <div key={index} className={squareClasses} style={{ position: 'relative' }}>
      <Image
      src={placeholderImages[index]}
      className={squareClasses}
      layout="fill"
      objectFit="cover"
      alt={`Placeholder ${index + 1}`}/>
      
      </div>
    );
  })}
</div>
      
{/* Storefront */}
<div className="w-full md:w-11/12 flex flex-col justify-start rounded-2xl shadow-sm bg-[#ffffff] p-0 mx-0 overflow-hidden ml-2 pb-2">
  <div className="px-6 pt-6 mb-2 text-xl font-bold">Morgans Storefronts</div>
  <div className="grid grid-cols-4 gap-4 p-4 ml-2">
  {listings.map((listing, index) => (
            <div key={index} className="w-20 h-20 bg-gray-300 rounded-md drop-shadow flex-shrink-0" style={{ backgroundImage: `url(${listing.imageSrc})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              {/* You can add overlays or text here if needed */}
            </div>
          ))}
  </div>
</div>
         
      </div>

      
    );
  }

  export default ProfileRightbar;