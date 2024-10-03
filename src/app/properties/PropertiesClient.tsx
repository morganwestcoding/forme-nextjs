'use client';

import { toast } from "react-hot-toast";
import axios from "axios";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { categories } from '@/components/Categories';
import { SafeListing, SafeUser } from "@/app/types";

import Heading from "@/components/Heading";
import ListingCard from "@/components/listings/ListingCard";

interface PropertiesClientProps {
  listings: SafeListing[],
  currentUser?: SafeUser | null,
}


export const dynamic = 'force-dynamic';

const PropertiesClient: React.FC<PropertiesClientProps> = ({
  listings,
  currentUser
}) => {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState('');

  const onDelete = useCallback((id: string) => {
    setDeletingId(id);

    axios.delete(`/api/listings/${id}`)
    .then(() => {
      toast.success('Listing deleted');
      router.refresh();
    })
    .catch((error) => {
      toast.error(error?.response?.data?.error)
    })
    .finally(() => {
      setDeletingId('');
    })
  }, [router]);


  return ( 
    <>
      <Heading
        title="Properties"
        subtitle="List of your properties"
      />
      <div className="pt-2 pl-4 mx-24 flex-1">
      <div 
        className="
          pt-6
      grid 
      grid-cols-4 
      sm:grid-cols-2 
      md:grid-cols-3 
      lg:grid-cols-4
      xl:grid-cols-5
      2xl:grid-cols-6
      gap-6
        "
      >
        {listings.map((listing: any) => (
          <ListingCard
          categories={categories}
            key={listing.id}
            data={listing}
            actionId={listing.id}
            onAction={onDelete}
            disabled={deletingId === listing.id}
            actionLabel="Delete property"
            currentUser={currentUser}
          />
        ))}
      </div>
      </div>
    </>
   );
}
 
export default PropertiesClient;