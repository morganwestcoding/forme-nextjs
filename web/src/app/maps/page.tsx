import getCurrentUser from '@/app/actions/getCurrentUser';
import MapsClient from './MapsClient';

export const metadata = {
  title: 'Maps',
  description: 'Explore listings and workers on the map',
};

export const dynamic = 'force-dynamic';

async function MapsPage() {
  const currentUser = await getCurrentUser();
  return <MapsClient currentUser={currentUser} />;
}

export default MapsPage;
