import getCurrentUser from '@/app/actions/getCurrentUser';
import { redirect } from 'next/navigation';
import TeamClient from './TeamClient';


export default async function TeamPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/');
  }

  return <TeamClient currentUser={currentUser} />;
}
