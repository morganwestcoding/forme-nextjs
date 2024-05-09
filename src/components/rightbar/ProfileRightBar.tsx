import React from 'react';
import { SafeProfile, SafeListing, SafeUser } from '@/app/types';
import Image from 'next/image';
import format from 'date-fns/format'; 
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';

interface ProfileRightbarProps {
  user: SafeUser;
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
const { bio, createdAt, location } = user;

const formattedDate = format(new Date(createdAt), 'PPP'); // Example format: Jan 1, 2020
    return (
      <div className="flex flex-col justify-end bg-transparent  gap-6 pr-16 h-auto mt-6">
         {/* Adjusted User Information Div to use Flex Grow to fill available space */}
         <div className="flex flex-col justify-between w-full md:w-11/12 rounded-2xl shadow-sm bg-[#ffffff] px-8 md:px-6 pt-6 pb-2 mx-3 md:mr-16 md:ml-2 relative min-h-[128px]">
          <div className="text-xl font-bold mb-2">About Me
            <div className="text-sm font-normal flex-grow">
              <p className="py-2 pb-2">
              {bio || "No bio available"} {/* Display bio here */}
              </p>
              
              </div>

              <ul>
                
             {/* Adjusted list items to include flex layout for icon and text alignment */}
             <li className="flex items-center pb-2 pt-2 rounded-lg shadow-sm bg-white border px-2 w-full mb-2"> 
              <div className="flex items-center justify-center p-1  cursor-pointer">
              
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={19} height={19} color={"#a2a2a2"} fill={"none"}>
    <path d="M14.5 9C14.5 10.3807 13.3807 11.5 12 11.5C10.6193 11.5 9.5 10.3807 9.5 9C9.5 7.61929 10.6193 6.5 12 6.5C13.3807 6.5 14.5 7.61929 14.5 9Z" stroke="currentColor" strokeWidth="1.5" />
    <path d="M18.2222 17C19.6167 18.9885 20.2838 20.0475 19.8865 20.8999C19.8466 20.9854 19.7999 21.0679 19.7469 21.1467C19.1724 22 17.6875 22 14.7178 22H9.28223C6.31251 22 4.82765 22 4.25311 21.1467C4.20005 21.0679 4.15339 20.9854 4.11355 20.8999C3.71619 20.0475 4.38326 18.9885 5.77778 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13.2574 17.4936C12.9201 17.8184 12.4693 18 12.0002 18C11.531 18 11.0802 17.8184 10.7429 17.4936C7.6543 14.5008 3.51519 11.1575 5.53371 6.30373C6.6251 3.67932 9.24494 2 12.0002 2C14.7554 2 17.3752 3.67933 18.4666 6.30373C20.4826 11.1514 16.3536 14.5111 13.2574 17.4936Z" stroke="currentColor" strokeWidth="1.5" />
</svg>
              </div>
                <span className="ml-4 text-xs font-light text-[#a2a2a2]">{location}</span>
              </li>
        
              <li className="flex items-center pb-2 pt-2 w-full rounded-lg shadow-sm bg-white border px-2">
              <div className="flex items-center justify-center  p-1  cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={19} height={19} color={"#a2a2a2"} fill={"none"}>
    <path d="M11 13H16M8 13H8.00898M13 17H8M16 17H15.991" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18 2V4M6 2V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.5 12.2432C2.5 7.88594 2.5 5.70728 3.75212 4.35364C5.00424 3 7.01949 3 11.05 3H12.95C16.9805 3 18.9958 3 20.2479 4.35364C21.5 5.70728 21.5 7.88594 21.5 12.2432V12.7568C21.5 17.1141 21.5 19.2927 20.2479 20.6464C18.9958 22 16.9805 22 12.95 22H11.05C7.01949 22 5.00424 22 3.75212 20.6464C2.5 19.2927 2.5 17.1141 2.5 12.7568V12.2432Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 8H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
</svg>
              </div>
                <span className="ml-4 text-xs font-light text-[#a2a2a2]">Joined {formattedDate}</span> {/* Display the formatted creation date here */}
              </li>
              </ul>
            
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