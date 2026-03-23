import getCurrentUser from '@/app/actions/getCurrentUser';
import getTeamData from '@/app/actions/getTeamData';
import { redirect } from 'next/navigation';
import TeamClient from './TeamClient';

export const dynamic = 'force-dynamic';

export default async function TeamPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/');
  }

  const teamData = await getTeamData(currentUser.id);

  return <TeamClient currentUser={currentUser} teamData={teamData} />;
}
