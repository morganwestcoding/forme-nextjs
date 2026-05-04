import getCurrentUser from '@/app/actions/getCurrentUser';
import { redirect } from 'next/navigation';
import TeamClient from './TeamClient';

export const metadata = {
  title: 'Team',
  description: 'Manage your employees and collaborators',
  robots: { index: false, follow: false },
};

export default async function TeamPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/');
  }

  return <TeamClient currentUser={currentUser} />;
}
