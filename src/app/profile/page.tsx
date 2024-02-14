
import getCurrentUser from "@/app/actions/getCurrentUser";

import ClientProviders from "@/components/ClientProviders";
import EmptyState from "@/components/EmptyState";
import getPosts, { IPostsParams } from "../actions/getPost";
import ProfileClient from "./ProfileClient";
import Post from "@/components/feed/Post";
import ProfileRightbar from "@/components/rightbar/ProfileRightBar";
import { categories } from "@/components/Categories";


interface IParams {
  listingId?: string;
}

const ProfilePage = async ({ params }: { params: IParams }) => {

  const currentUser = await getCurrentUser();
  const searchParams: IPostsParams = {};
  const posts = await getPosts(searchParams);

  return (
    <ClientProviders>
       <ProfileClient 
       initialUser={currentUser}
       posts={posts}
       currentUser={currentUser}
       categories={categories}
     /> 
    </ClientProviders>
  );
}
 
export default ProfilePage;