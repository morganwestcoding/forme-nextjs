'use client';

import dynamic from "next/dynamic";
import { IconType } from "react-icons";

import useStates from "@/app/hooks/useStates";
import { SafeUser } from "@/app/types";

import Avatar from "../ui/avatar";
import ListingCategory from "./ListingCategory";

/*const Map = dynamic(() => import('../Map'), { 
  ssr: false 
});*/

interface ListingInfoProps {
  user: SafeUser,
  description: string;
  category: {
    label: string;
    description: string;
  } | undefined
  locationValue: string;
}

const ListingInfo: React.FC<ListingInfoProps> = ({
  user,
  description,
  category,
  locationValue,
}) => {
  const { getByValue } = useStates();

  /*const coordinates = getByValue(locationValue)?.latlng*/

  return ( 
    <div className="col-span-4 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div 
          className="
            text-xl 
            font-semibold 
            flex 
            flex-row 
            items-center
            gap-2
          "
        >
          <div>Hosted by {user?.name}</div>
          <Avatar src={user?.image} />
        </div>
        <div className="
            flex 
            flex-row 
            items-center 
            gap-4 
            font-light
            text-neutral-500
          "
        >
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