const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugShopData() {
  try {
    console.log('=== Checking Shop Data ===\n');

    const shops = await prisma.shop.findMany({
      include: {
        user: true,
        products: {
          include: { category: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });

    console.log(`Total shops found: ${shops.length}\n`);

    shops.forEach((shop, idx) => {
      console.log(`Shop ${idx + 1}: ${shop.name}`);
      console.log(`  - ID: ${shop.id}`);
      console.log(`  - Enabled: ${shop.shopEnabled}`);
      console.log(`  - Verified: ${shop.isVerified}`);
      console.log(`  - Logo: ${shop.logo || 'NO LOGO'}`);
      console.log(`  - Location: ${shop.location || 'NO LOCATION'}`);
      console.log(`  - Products: ${shop.products?.length || 0}`);
      console.log(`  - User: ${shop.user?.name || 'NO USER'}`);
      console.log(`  - Created: ${shop.createdAt}`);
      console.log('');
    });

    // Check what would be passed to the component
    console.log('=== Data that would be sent to ShopClient ===');
    console.log(`initialShops count: ${shops.length}`);
    console.log(`First shop name: ${shops[0]?.name || 'NONE'}`);
    console.log(`First shop has logo: ${shops[0]?.logo ? 'YES' : 'NO (will use placeholder)'}`);

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

debugShopData();
