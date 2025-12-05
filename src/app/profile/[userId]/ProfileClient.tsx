'use client';

import Container from '@/components/Container';
import ProfileHead from '@/components/profile/ProfileHead';
import { SafeListing, SafePost, SafeUser, SafeReview } from '@/app/types';

interface ProfileClientProps {
  currentUser: SafeUser | null;
  posts: SafePost[];
  user: SafeUser;
  listings: SafeListing[];
  reviews?: SafeReview[];
  reviewStats?: {
    totalCount: number;
    averageRating: number;
  };
}

const ProfileClient: React.FC<ProfileClientProps> = ({
  user,
  posts,
  listings,
  currentUser,
  reviews = [],
  reviewStats,
}) => {
  if (!user) return null;

  return (
    <Container>
      <ProfileHead
        user={user}
        currentUser={currentUser}
        posts={posts}
        listings={listings}
        reviews={reviews}
        reviewStats={reviewStats}
      />
    </Container>
  );
};

export default ProfileClient;
