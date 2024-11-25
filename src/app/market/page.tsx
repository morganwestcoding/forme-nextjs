// app/market/page.tsx
import Market from './market';
import MarketWrapper from './MarketWrapper';

export default function MarketPage({ 
  searchParams 
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  return (
    <MarketWrapper>
      <Market searchParams={searchParams} />
    </MarketWrapper>
  );
}