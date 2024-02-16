// ProfileClient.tsx

import React from 'react';
import ClientProviders from '@/components/ClientProviders';
import ProfileHead from '@/components/profile/ProfileHead';
import Post from '@/components/feed/Post';
import ProfileInfo from '@/components/profile/ProfileInfo';
import ProfileImages from '@/components/profile/ProfileImages';
import UserListings from '@/components/profile/UserListings';
import { SafeUser, SafePost, SafeListing } from "@/app/types";

// Define the props interface here
interface ProfileClientProps {
  user: SafeUser;
  posts: SafePost[];
  listings: SafeListing[];
  currentUser: SafeUser | null;
}

const ProfileClient: React.FC<ProfileClientProps> = ({ user, posts, listings, currentUser }) => {
  return (
    <div>
      <ProfileHead user={user} />
      <div className="flex w-full">
        <div className="flex-none w-[45%] ml-20 mt-2">
          {posts.map((post, index) => (
            <Post key={index} post={post} />
          ))}
        </div>
        <div className="flex-grow w-[45%] ml-4">
          <ProfileInfo user={user} />
          <ProfileImages user={user} />
          <UserListings listings={listings} />
        </div>
      </div>
    </div>
  );
};

export default ProfileClient;