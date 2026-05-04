import ShopClient from '@/app/shops/ShopClient';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getShops from '@/app/actions/getShops';
import getProducts from '@/app/actions/getProducts';
import Container from '@/components/Container';

export const metadata = {
  title: 'Shop',
  description: 'Discover unique products from our vendors',
};

export const dynamic = 'force-dynamic';

async function ShopPage() {
  const [currentUser, shops, products] = await Promise.all([
    getCurrentUser(),
    getShops({ sort: 'newest' }).catch((e) => {
      console.error('[shops/page] getShops failed', e);
      return [];
    }),
    getProducts({ sort: 'newest', limit: 24 }).catch((e) => {
      console.error('[shops/page] getProducts failed', e);
      return [];
    }),
  ]);

  return (
    <Container>
      <ShopClient
        initialShops={shops}
        featuredProducts={products}
        categories={[]}
        currentUser={currentUser}
      />
    </Container>
  );
}

export default ShopPage;
