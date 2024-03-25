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
    <div className="w-full h-auto rounded-2xl drop-shadow-sm bg-[#ffffff] p-6 mr-8 my-6">
    {/* Render Heading */}

    <Heading
      title={title}
      subtitle={`${location?.label}`}
    />
    


      <hr />
      {category && (
        <ListingCategory
         
          label={category?.label}
          description={category?.description} 
        />
      )}
      <hr />
      <hr />
      {/*<Map center={coordinates} />*/}
    </div>
   );
}
 
export default ListingInfo;