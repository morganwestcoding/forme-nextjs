// app/market/page.tsx
import MarketContent from './MarketContent';
import MarketWrapper from './MarketWrapper';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getListings from '@/app/actions/getListings';

interface MarketPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

async function MarketPage({ searchParams }: MarketPageProps) {
  const listings = await getListings(searchParams);
  const currentUser = await getCurrentUser();

  return (
    <MarketWrapper>
      <MarketContent 
        searchParams={searchParams} 
        listings={listings}
        currentUser={currentUser}
      />
    </MarketWrapper>
  );
}

export default MarketPage;