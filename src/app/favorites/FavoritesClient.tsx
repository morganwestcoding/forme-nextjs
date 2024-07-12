import { SafeListing, SafeUser } from "@/app/types";

import Heading from "@/components/Heading";
import { categories } from '@/components/Categories';
import ListingCard from "@/components/listings/ListingCard";

interface FavoritesClientProps {
  listings: SafeListing[],
  currentUser?: SafeUser | null,
}

const FavoritesClient: React.FC<FavoritesClientProps> = ({
  listings,
  currentUser
}) => {
  return (
    <>
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
            currentUser={currentUser}
            key={listing.id}
            data={listing}
          />
        ))}
      </div>
      </div>
    </>
   );
}
 
export default FavoritesClient;