import ShopClient from '@/app/shops/ShopClient';
import getCurrentUser from '@/app/actions/getCurrentUser';
import Container from '@/components/Container';

export const metadata = {
  title: 'Shop - ForMe',
  description: 'Discover unique products from our vendors',
};

export const dynamic = 'force-dynamic';

async function ShopPage() {
  const currentUser = await getCurrentUser();

  return (
    <Container>
      <ShopClient
        initialShops={[]}
        featuredProducts={[]}
        categories={[]}
        currentUser={currentUser}
      />
    </Container>
  );
}

export default ShopPage;
