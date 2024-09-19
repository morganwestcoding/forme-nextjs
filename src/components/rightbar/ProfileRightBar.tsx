import React from 'react';
import {SafeListing, SafeUser} from '@/app/types';
import Link from 'next/link';
import Image from 'next/image';
import format from 'date-fns/format';
import ProfilePhotoGallery from '../inputs/ProfilePhotoGallery'



interface ProfileRightbarProps {
  user: SafeUser;
  listings: SafeListing[];
}

const ProfileRightbar: React.FC<ProfileRightbarProps> = ({ user, listings  }) => {
const { bio, createdAt, location } = user;

const formattedDate = format(new Date(createdAt), 'PPP'); // Example format: Jan 1, 2020
    return (
      <div className="flex flex-col justify-end bg-transparent  gap-3 pr-16 h-auto mt-4">
         {/* Adjusted User Information Div to use Flex Grow to fill available space */}
         <div className="flex flex-col justify-between w-full md:w-11/12 rounded-2xl shadow-sm bg-[#ffffff] px-8 md:px-6 pt-6 pb-5 mx-3 md:mr-16 md:ml-2 relative min-h-[128px]">
          <div className="text-xl font-bold">About Me
            <div className="text-sm font-normal flex-grow">
              <p className="py-2 pb-2">
              {bio || "No bio available"} {/* Display bio here */}
              </p>
              </div>
              <ul>
                
             {/* Adjusted list items to include flex layout for icon and text alignment */}
             <li className="flex items-center pb-2 pt-2 rounded-lg shadow-sm bg-white border px-2 w-full mb-3"> 
              <div className="flex items-center justify-center p-1  cursor-pointer">
              
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" color="#a2a2a2" fill="none">
    <path d="M11.922 4.79004C16.6963 3.16245 19.0834 2.34866 20.3674 3.63261C21.6513 4.91656 20.8375 7.30371 19.21 12.078L18.1016 15.3292C16.8517 18.9958 16.2267 20.8291 15.1964 20.9808C14.9195 21.0216 14.6328 20.9971 14.3587 20.9091C13.3395 20.5819 12.8007 18.6489 11.7231 14.783C11.4841 13.9255 11.3646 13.4967 11.0924 13.1692C11.0134 13.0742 10.9258 12.9866 10.8308 12.9076C10.5033 12.6354 10.0745 12.5159 9.21705 12.2769C5.35111 11.1993 3.41814 10.6605 3.0909 9.64127C3.00292 9.36724 2.97837 9.08053 3.01916 8.80355C3.17088 7.77332 5.00419 7.14834 8.6708 5.89838L11.922 4.79004Z" stroke="currentColor" stroke-width="1.5" />
</svg>
              </div>
                <span className="ml-4 text-xs font-light text-[#a2a2a2]">{location}</span>
              </li>
        
              <li className="flex items-center pb-2 pt-2 w-52 rounded-lg shadow-sm bg-white border px-2">
              <div className="flex items-center justify-center  p-1  cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={19} height={19} color={"#a2a2a2"} fill={"none"}>
    <path d="M11 13H16M8 13H8.00898M13 17H8M16 17H15.991" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18 2V4M6 2V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.5 12.2432C2.5 7.88594 2.5 5.70728 3.75212 4.35364C5.00424 3 7.01949 3 11.05 3H12.95C16.9805 3 18.9958 3 20.2479 4.35364C21.5 5.70728 21.5 7.88594 21.5 12.2432V12.7568C21.5 17.1141 21.5 19.2927 20.2479 20.6464C18.9958 22 16.9805 22 12.95 22H11.05C7.01949 22 5.00424 22 3.75212 20.6464C2.5 19.2927 2.5 17.1141 2.5 12.7568V12.2432Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 8H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
</svg>
              </div>
                <span className="ml-4 text-xs font-light text-[#a2a2a2]">Joined {formattedDate}</span> 
              </li>
              </ul>
            
          </div>
        </div>

<ProfilePhotoGallery currentUser={user}/>
      
{/* Storefront */}
<div className="w-full md:w-11/12 flex flex-col justify-start rounded-2xl shadow-sm bg-[#ffffff] p-0 mx-3 md:mr-16 md:ml-2 overflow-hidden pb-6">
  <div className="px-8 md:px-6 pt-6 mb-2 text-xl font-bold">{user.name ? user.name.split(' ')[0] : 'User'}&apos;s Storefronts</div>
  <div className="px-8 md:px-6 pb-2">
    {/* This empty div matches the layout in the gallery component */}
  </div>
  <div className="grid grid-cols-4 gap-2 px-8 md:px-6 ">
    {listings.map((listing, index) => (
      <Link key={index} href={`/listings/${listing.id}`} passHref>
        <div className="aspect-w-1 aspect-h-1 w-full">
          <div
            className="w-full h-full bg-gray-300 rounded-lg"
            style={{ 
              backgroundImage: `url(${listing.imageSrc})`, 
              backgroundSize: 'cover', 
              backgroundPosition: 'center'
            }}
          />
        </div>
      </Link>
    ))}
  </div>
</div>
</div>
         


      
    );
  }

  export default ProfileRightbar;