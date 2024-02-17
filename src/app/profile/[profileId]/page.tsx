

import getCurrentUser from "@/app/actions/getCurrentUser";
import getPost from "@/app/actions/getPost";
import getListings from "@/app/actions/getListings";
import ClientProviders from "@/components/ClientProviders";
import EmptyState from "@/components/EmptyState";
import ProfileClient from "./ProfileClient"; // Ensure this component is implemented


interface IParams {
  userId?: string; // Add this line to include userId in your interface
}

const ProfilePage = async ({ params }: { params: IParams }) => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <ClientProviders>
        <EmptyState />
      </ClientProviders>
    );
  }
  
  // Fetch posts and listings for the currentUser or another user based on params.userId
  const posts = await getPost({ userId: params.userId || currentUser.id });
  const listing = await getListings({ userId: params.userId || currentUser.id });



  // Render ProfileClient with fetched data
  return (
    <ClientProviders>
      <ProfileClient
        user={currentUser} 
         posts={posts}
         listings={listing}
        currentUser={currentUser}
      />
    </ClientProviders>
  );
};

export default ProfilePage;
