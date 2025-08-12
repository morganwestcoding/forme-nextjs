'use client';

import Container from '@/components/Container';
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
    <Container>
      <div className="max-w-screen-lg">
        <div className="flex flex-col">
          <ProfileHead
            user={user}
            currentUser={currentUser}
            posts={posts}
            listings={listings}
          />
        </div>
      </div>
    </Container>
  );
};

export default ProfileClient;
