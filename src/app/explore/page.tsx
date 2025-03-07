import getCurrentUser from "@/app/actions/getCurrentUser";
import getListings from "@/app/actions/getListings";
import ExploreClient from "./ExploreClient";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const ExplorePage = async () => {
  const currentUser = await getCurrentUser();
  const listings = await getListings({ });
  
  return (
    <ExploreClient
      initialListings={listings}
      currentUser={currentUser}
    />
  );
};

export default ExplorePage;