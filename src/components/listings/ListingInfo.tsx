'use client';

import dynamic from "next/dynamic";
import { IconType } from "react-icons";

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
      
      {/* Additional content */}
    </div>
   );
}

export default ListingInfo;
