
import React from 'react';
import ProfileHead from '@/components/profile/ProfileHead';
import Post from '@/components/feed/Post';
import { SafePost, SafeListing, SafeUser} from "@/app/types";
import { categories } from '@/components/Categories';
import ProfileRightbar from '@/components/rightbar/ProfileRightBar';

interface ProfileClientProps {
  posts: SafePost[];
  user: SafeUser;
  listings: SafeListing[];
}

export const dynamic = 'force-dynamic'

const ProfileClient: React.FC<ProfileClientProps> = ({ user, posts, listings }) => {
  if (!user) {
    return <div>No user data available</div>; // Handling case when user data is not available
  }
  return (
    <div>
       <ProfileHead user={user} />
      <div className="flex w-full">
        <div className="flex-none w-[45%] ml-28">
          {/* Posts Mapping */}
          {posts.map((post, index) => (
            <Post key={index} post={post} currentUser={user} categories={categories} />
          ))}
        </div>
        <div className="flex-grow w-[45%] ml-3">
        <ProfileRightbar user={user} listings={listings} />
        </div>
      </div>
    </div>
  );
};

export default ProfileClient;