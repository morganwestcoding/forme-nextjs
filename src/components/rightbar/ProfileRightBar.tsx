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

  const formattedDate = format(new Date(createdAt), 'PPP');

  // Function to get state acronym
  const getStateAcronym = (state: string) => {
    const stateMap: {[key: string]: string} = {
      'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
      'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
      'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
      'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
      'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
      'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
      'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
      'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
      'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
      'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
    };
    return stateMap[state] || state;
  };

  // Split location into city and state, and convert state to acronym
  const [city, state] = location?.split(',').map(s => s.trim()) || [];
  const stateAcronym = state ? getStateAcronym(state) : '';

  return (
    <div className="flex flex-col justify-end bg-transparent gap-3 h-auto mt-4">
      <div className="flex flex-col justify-between w-full rounded-2xl shadow-sm bg-[#ffffff] px-8 md:px-6 pt-6 pb-5 relative min-h-[128px]">
        <div className="text-xl font-bold">About Me
          <div className="text-sm font-normal flex-grow">
            <p className="py-2 pb-2">
              {bio || "No bio available"}
            </p>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center pb-2 pt-2 rounded-lg shadow-sm bg-white border px-2 flex-grow mr-2">
              <div className="flex items-center justify-center p-1 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" color="#a2a2a2" fill="none">
                  <path d="M13.6177 21.367C13.1841 21.773 12.6044 22 12.0011 22C11.3978 22 10.8182 21.773 10.3845 21.367C6.41302 17.626 1.09076 13.4469 3.68627 7.37966C5.08963 4.09916 8.45834 2 12.0011 2C15.5439 2 18.9126 4.09916 20.316 7.37966C22.9082 13.4393 17.599 17.6389 13.6177 21.367Z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M15.5 11C15.5 12.933 13.933 14.5 12 14.5C10.067 14.5 8.5 12.933 8.5 11C8.5 9.067 10.067 7.5 12 7.5C13.933 7.5 15.5 9.067 15.5 11Z" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
              <span className="ml-2 text-xs font-light text-[#a2a2a2]">{city}, {stateAcronym}</span>
            </div>
            <div className="flex items-center pb-2 pt-2 rounded-lg shadow-sm bg-white border px-2 flex-grow">
              <div className="flex items-center justify-center p-1 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={19} height={19} color={"#a2a2a2"} fill={"none"}>
                  <path d="M11 13H16M8 13H8.00898M13 17H8M16 17H15.991" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M18 2V4M6 2V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2.5 12.2432C2.5 7.88594 2.5 5.70728 3.75212 4.35364C5.00424 3 7.01949 3 11.05 3H12.95C16.9805 3 18.9958 3 20.2479 4.35364C21.5 5.70728 21.5 7.88594 21.5 12.2432V12.7568C21.5 17.1141 21.5 19.2927 20.2479 20.6464C18.9958 22 16.9805 22 12.95 22H11.05C7.01949 22 5.00424 22 3.75212 20.6464C2.5 19.2927 2.5 17.1141 2.5 12.7568V12.2432Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 8H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="ml-2 text-xs font-light text-[#a2a2a2]">Joined {formattedDate}</span>
            </div>
          </div>
        </div>
      </div>

      <ProfilePhotoGallery currentUser={user}/>
      
      {/* Storefront */}
      <div className="w-full flex flex-col justify-start rounded-2xl shadow-sm bg-[#ffffff] p-0 overflow-hidden pb-6">
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