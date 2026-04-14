import MapsClient from './MapsClient';
import getListings from '@/app/actions/getListings';
import getCurrentUser from '@/app/actions/getCurrentUser';
import BetaGate from '@/components/BetaGate';

export const metadata = {
  title: 'Maps - ForMe',
  description: 'Explore listings and workers on the map',
};

export const dynamic = 'force-dynamic';

async function MapsPage() {
  const [listings, currentUser] = await Promise.all([
    getListings({}),
    getCurrentUser(),
  ]);

  return (
    <BetaGate>
      <MapsClient listings={listings} currentUser={currentUser} />
    </BetaGate>
  );
}

export default MapsPage;
