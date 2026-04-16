import MapsClient from './MapsClient';
import getCurrentUser from '@/app/actions/getCurrentUser';
import BetaGate from '@/components/BetaGate';

export const metadata = {
  title: 'Maps - ForMe',
  description: 'Explore listings and workers on the map',
};

export const dynamic = 'force-dynamic';

async function MapsPage() {
  const currentUser = await getCurrentUser();

  return (
    <BetaGate>
      <MapsClient currentUser={currentUser} />
    </BetaGate>
  );
}

export default MapsPage;
