import { redirect } from 'next/navigation';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getProfileById from '@/app/actions/getProfileById';
import TypeformFlow from '@/components/registration/TypeformFlow';

interface IParams {
  userId: string;
}

export const dynamic = 'force-dynamic';

export default async function EditProfilePage({ params }: { params: IParams }) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/');
  }

  const profile = await getProfileById(params);

  if (!profile) {
    redirect('/');
  }

  // Check authorization: must be owner or admin/master
  const isOwner = profile.id === currentUser.id;
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'master';

  if (!isOwner && !isAdmin) {
    redirect(`/profile/${params.userId}`);
  }

  // Prepare profile data for the form
  const initialData = {
    id: profile.id,
    name: profile.name || '',
    email: profile.email || '',
    location: profile.location || '',
    bio: profile.bio || '',
    image: profile.image || profile.imageSrc || '',
    backgroundImage: profile.backgroundImage || '',
    interests: [], // Could fetch from user if stored
  };

  return (
    <TypeformFlow
      mode="edit"
      userId={params.userId}
      initialData={initialData}
    />
  );
}
