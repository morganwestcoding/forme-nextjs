
import React from 'react';
import ProfileHead from '@/components/profile/ProfileHead';
import { SafePost, SafeListing, SafeUser} from "@/app/types";
import { categories } from '@/components/Categories';
import ProfileRightbar from '@/components/rightbar/ProfileRightBar';
import Container from '@/components/Container';

interface ProfileClientProps {
  currentUser: SafeUser | null;
  posts: SafePost[];
  user: SafeUser;
  listings: SafeListing[];
}

export const dynamic = 'force-dynamic';

const ProfileClient: React.FC<ProfileClientProps> = ({ user, posts, listings, currentUser }) => {
  if (!user) {
    return <div>No user data available</div>; // Handling case when user data is not available
  }
  return (
    <Container>
    <div>
       <ProfileHead user={user} currentUser={currentUser} />
      <div className="flex w-full">
        <div className="flex-none w-[50%]">

        </div>
        <div className="flex-grow w-[50%] ml-3">
        <ProfileRightbar user={user} listings={listings} />
        </div>
      </div>
    </div>
    </Container>
  );
};

export default ProfileClient;