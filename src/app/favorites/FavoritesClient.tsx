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

const ITEMS_PER_PAGE = 8;



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
          sm:grid-cols-2 
          md:grid-cols-3 
          lg:grid-cols-4
          xl:grid-cols-5
          2xl:grid-cols-6
          gap-6
        ">
          {listings.map((listing: any) => (
            <div key={listing.id} className="flex justify-center">
              <ListingCard
                categories={categories}
                currentUser={currentUser}
                data={listing}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-center w-full pt-4">
          <div className="w-[500px]">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalResults={totalResults}
            />
          </div>
        </div>
      </div>
    </Container>
  );
}
 
export default FavoritesClient;