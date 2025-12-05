'use client';

import ProfileHead from '@/components/profile/ProfileHead';
import { SafeListing, SafePost, SafeUser } from '@/app/types';

interface ProfileClientProps {
  currentUser: SafeUser | null;
  posts: SafePost[];
  user: SafeUser;
  listings: SafeListing[];
}

const ProfileClient: React.FC<ProfileClientProps> = ({
  user,
  posts,
  listings,
  currentUser,
}) => {
  if (!user) return null;

  return (
    <ProfileHead
      user={user}
      currentUser={currentUser}
      posts={posts}
      listings={listings}
    />
  );
};

export default ProfileClient;
