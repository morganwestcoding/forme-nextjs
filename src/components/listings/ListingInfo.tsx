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
  currentUser?: SafeUser | null
  user: SafeUser,
  description: string;
  category: {
    label: string;
    description: string;
  } | undefined
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

  /*const coordinates = getByValue(locationValue)?.latlng*/

  return ( 
    <div className="col-span-4 flex flex-col gap-8 ">
    {/* Render Heading */}
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-white drop-shadow p-4 text-center">
    <Heading
      title={title}
      subtitle={`${location?.label}`}
    />

    {/* "Hosted by" section - Ensure this is not within the same flex container as Heading */}
    <div className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-center gap-2">
      <Avatar src={user?.image ?? undefined} />
      <span>Hosted by {user?.name}</span>
    </div>
    </div>
    </div>

    
      <hr />
      {category && (
        <ListingCategory
         
          label={category?.label}
          description={category?.description} 
        />
      )}
      <hr />
      <div className="
      text-lg font-light text-neutral-500">
        {description}
      </div>
      <hr />
      {/*<Map center={coordinates} />*/}
    </div>
   );
}
 
export default ListingInfo;