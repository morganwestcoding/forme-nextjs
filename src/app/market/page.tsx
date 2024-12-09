// app/market/page.tsx
import MarketContent from './MarketContent';
import MarketWrapper from './MarketWrapper';

interface MarketPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

async function MarketPage({ searchParams }: MarketPageProps) {
  return (
    <MarketWrapper>
      {/* @ts-expect-error Async Server Component */}
      <MarketContent searchParams={searchParams} />
    </MarketWrapper>
  );
}

export default MarketPage;