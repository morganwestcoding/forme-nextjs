import { redirect } from 'next/navigation';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getProfileById from '@/app/actions/getProfileById';
import TypeformFlow from '@/components/registration/TypeformFlow';
import prisma from '@/app/libs/prismadb';

interface IParams {
  userId: string;
}

export const metadata = {
  title: 'Edit Profile',
  description: 'Update your professional profile',
  robots: { index: false, follow: false },
};

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

  // Resolve the job title: prefer what's stored on the user, otherwise fall
  // back to whatever their primary Employee record says so existing users
  // don't see a blank field the first time they open edit.
  let resolvedJobTitle: string = (profile as any).jobTitle || '';
  if (!resolvedJobTitle) {
    const primaryEmployee = await prisma.employee.findFirst({
      where: { userId: profile.id, isActive: true, jobTitle: { not: null } },
      select: { jobTitle: true },
    });
    resolvedJobTitle = primaryEmployee?.jobTitle || '';
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
    jobTitle: resolvedJobTitle,
    userType: (profile as any).userType || null,
  };

  return (
    <TypeformFlow
      mode="edit"
      userId={params.userId}
      initialData={initialData}
    />
  );
}
