const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkShops() {
  try {
    const shops = await prisma.shop.findMany({
      select: {
        id: true,
        name: true,
        shopEnabled: true,
        isVerified: true,
        userId: true,
        createdAt: true,
      },
      take: 10
    });

    console.log('Total shops found:', shops.length);
    console.log('\nShop details:');
    shops.forEach(shop => {
      console.log(`- ${shop.name} (enabled: ${shop.shopEnabled}, verified: ${shop.isVerified})`);
    });

    if (shops.length === 0) {
      console.log('\n⚠️  No shops found in the database!');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkShops();
