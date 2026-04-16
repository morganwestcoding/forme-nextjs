import React from 'react';
import type { Metadata } from 'next';
import getProfileById from '@/app/actions/getProfileById';
import getCurrentUser from '@/app/actions/getCurrentUser';
import ClientOnly from '@/components/ClientOnly';
import ProfileClient from './ProfileClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { userId: string } }): Promise<Metadata> {
  const user = await getProfileById(params);
  if (!user) return { title: 'Profile Not Found' };

  const name = user.name || 'Professional';
  const description = user.bio
    ? user.bio.slice(0, 160)
    : `View ${name}'s professional profile on ForMe.`;

  return {
    title: name,
    description,
    openGraph: {
      title: `${name} — ForMe`,
      description,
      ...(user.image ? { images: [{ url: user.image }] } : {}),
    },
  };
}

const ProfilePage = async ({ params }: { params: { userId: string } }) => {
  const currentUser = await getCurrentUser();

  return (
    <ClientOnly>
      <ProfileClient
        userId={params.userId}
        currentUser={currentUser}
      />
    </ClientOnly>
  );
};

export default ProfilePage;
