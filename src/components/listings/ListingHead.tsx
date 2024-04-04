'use client';

import Image from "next/image";

import useStates from "@/app/hooks/useStates";
import { SafeService, SafeUser } from "@/app/types";

import Heading from "../Heading";
import HeartButton from "../HeartButton";

interface ListingHeadProps {
  title: string;
  state: string;
  city: string;
  imageSrc: string;
  id: string;
  currentUser?: SafeUser | null
  services?: SafeService[]; 
}

const ListingHead: React.FC<ListingHeadProps> = ({
  title,
  state,
  city,
  imageSrc,
  id,
  currentUser,
  services 
}) => {

  return ( 

      <div className="flex flex-col justify-between w-full md:w-11/12 rounded-2xl shadow-sm bg-[#ffffff] px-8 md:px-6 md:py-6 mx-3 md:mr-16 md:ml-2 relative min-h-[128px]
        "
      >
        <Image
          src={imageSrc}
          fill
          className="object-cover w-full"
          alt="Image"
        />
        <div
          className="
            absolute
            top-5
            right-5
          "
        >
          <HeartButton 
            listingId={id}
            currentUser={currentUser}
          />
        </div>
      </div>
   );
}
 
export default ListingHead;