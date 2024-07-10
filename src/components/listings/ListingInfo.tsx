'use client';

import dynamic from "next/dynamic";
import { IconType } from "react-icons";
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';

import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';

import useStates from "@/app/hooks/useStates";
import { SafeService, SafeUser } from "@/app/types";
import Heading from "../Heading";
import Avatar from "../ui/avatar";
import ListingCategory from "./ListingCategory";

/*const Map = dynamic(() => import('../Map'), {
  ssr: false 
});*/

interface ListingInfoProps {
  title: string;
  id: string;
  currentUser?: SafeUser | null;
  user: SafeUser;
  description: string;
  category: {
    label: string;
    description: string;
  } | undefined;
  location: string;
  services?: SafeService[];
}

const ListingInfo: React.FC<ListingInfoProps> = ({
  title,
  user,
  id,
  currentUser,
  description,
  category,
  location,

  services 
}) => {


  return ( 
    <div className="w-full h-auto p-6 mr-8 mt-8">
    {/* Title and Category Label Side by Side */}
    <div className="flex items-center justify-between mb-4">
      {/* Assuming Heading can only accept title and subtitle, we keep it for the title */}
      <Heading title={title} subtitle={location} label={category?.label} />
    </div>
   
    <div className="flex justify-start space-x-2 mb-6"> {/* Adjusted for direct layout under Heading */}
        <div
          className="flex items-center shadow-sm justify-start p-2  rounded-lg border bg-white w-24"
          onClick={() => console.log('Share div clicked')}
        >
          <div className="flex flex-col   rounded p-1 cursor-pointer" >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" color="#a2a2a2" fill="none">
    <path d="M18 7C18.7745 7.16058 19.3588 7.42859 19.8284 7.87589C21 8.99181 21 10.7879 21 14.38C21 17.9721 21 19.7681 19.8284 20.8841C18.6569 22 16.7712 22 13 22H11C7.22876 22 5.34315 22 4.17157 20.8841C3 19.7681 3 17.9721 3 14.38C3 10.7879 3 8.99181 4.17157 7.87589C4.64118 7.42859 5.2255 7.16058 6 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    <path d="M12.0253 2.00052L12 14M12.0253 2.00052C11.8627 1.99379 11.6991 2.05191 11.5533 2.17492C10.6469 2.94006 9 4.92886 9 4.92886M12.0253 2.00052C12.1711 2.00657 12.3162 2.06476 12.4468 2.17508C13.3531 2.94037 15 4.92886 15 4.92886" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
</svg>
          </div>
          <span className="ml-2 text-[#a2a2a2] text-xs group-hover:text-white font-light ">Share</span>
        </div>
        <div
          className="flex items-center shadow-sm justify-start p-2  rounded-md border bg-white w-24"
          onClick={() => console.log('Share div clicked')}
        >
          <div className="flex flex-col   rounded-full p-1  cursor-pointer" >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" color="#a2a2a2" fill="none">
          <path d="M4 17.9808V9.70753C4 6.07416 4 4.25748 5.17157 3.12874C6.34315 2 8.22876 2 12 2C15.7712 2 17.6569 2 18.8284 3.12874C20 4.25748 20 6.07416 20 9.70753V17.9808C20 20.2867 20 21.4396 19.2272 21.8523C17.7305 22.6514 14.9232 19.9852 13.59 19.1824C12.8168 18.7168 12.4302 18.484 12 18.484C11.5698 18.484 11.1832 18.7168 10.41 19.1824C9.0768 19.9852 6.26947 22.6514 4.77285 21.8523C4 21.4396 4 20.2867 4 17.9808Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          </div>
          <span className="ml-2 text-[#a2a2a2] text-xs group-hover:text-white font-light ">Save</span>
        </div>
      </div>
      <hr className="mt-2 -mx-6"/>
     
      {/* Additional content */}
    </div>
   );
}

export default ListingInfo;
