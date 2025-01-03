import { SafeListing, SafeUser } from "@/app/types";

import Heading from "@/components/Heading";
import { categories } from '@/components/Categories';
import ListingCard from "@/components/listings/ListingCard";
import Container from "@/components/Container";
import Pagination from "@/components/pagination/Pagination";

interface FavoritesClientProps {
  listings: SafeListing[],
  currentUser?: SafeUser | null,
  currentPage: number;
  totalPages: number;
  totalResults: number;
}

const ITEMS_PER_PAGE = 10;



const FavoritesClient: React.FC<FavoritesClientProps> = ({
  listings,
  currentUser,
  currentPage,
  totalPages,
  totalResults
}) => {
  return (
    <Container>
      <div className="pt-2 h-[calc(100vh-80px)] flex flex-col">
        <div className="
          pt-6
          flex-1
          grid 
          grid-cols-1
          lg:grid-cols-2
          xl:grid-cols-3
          2xl:grid-cols-3
          gap-4
      px-4
        ">
          {listings.map((listing: any) => (
         
              <ListingCard
              key={listing.id} 
                categories={categories}
                currentUser={currentUser}
                data={listing}
              />
     
          ))}
        </div>
      </div>
    </Container>
  );
}
 
export default FavoritesClient;