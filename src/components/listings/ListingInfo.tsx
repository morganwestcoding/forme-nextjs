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
  locationValue: string;
  services?: SafeService[];
}

const ListingInfo: React.FC<ListingInfoProps> = ({
  title,
  user,
  id,
  currentUser,
  description,
  category,
  locationValue,
  services 
}) => {
  const { getByValue } = useStates();
  const location = getByValue(locationValue);

  return ( 
    <div className="w-full h-auto p-6 mr-8 mt-8">
    {/* Title and Category Label Side by Side */}
    <div className="flex items-center justify-between mb-4">
      {/* Assuming Heading can only accept title and subtitle, we keep it for the title */}
      <Heading title={title} subtitle={`${location?.label}`}
        label={category?.label} />
    </div>
    
    <div className="flex justify-start space-x-2"> {/* Adjusted for direct layout under Heading */}
        <div
          className="flex items-center shadow-sm justify-start p-2  rounded-xl border bg-white w-24"
          onClick={() => console.log('Share div clicked')}
        >
          <div className="flex flex-col   rounded-full p-1 cursor-pointer" >
          <IosShareRoundedIcon className="w-4 h-4 text-[#a2a2a2] " />
          </div>
          <span className="ml-2 text-[#a2a2a2] text-xs group-hover:text-white font-light ">Share</span>
        </div>
        <div
          className="flex items-center shadow-sm justify-start p-2  rounded-xl border bg-white w-24"
          onClick={() => console.log('Share div clicked')}
        >
          <div className="flex flex-col   rounded-full p-1  cursor-pointer" >
          <BookmarkBorderOutlinedIcon className="w-4 h-4 text-[#a2a2a2] " />
          </div>
          <span className="ml-2 text-[#a2a2a2] text-xs group-hover:text-white font-light ">Save</span>
        </div>
      </div>
     
      {/* Additional content */}
    </div>
   );
}

export default ListingInfo;
