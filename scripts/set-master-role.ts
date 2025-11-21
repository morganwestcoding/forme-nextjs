/**
 * Script to set a user's role to master
 *
 * Usage: npx ts-node scripts/set-master-role.ts <email>
 * Example: npx ts-node scripts/set-master-role.ts admin@example.com
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setMasterRole(email: string) {
  if (!email) {
    console.error('Please provide an email address');
    console.log('Usage: npx ts-node scripts/set-master-role.ts <email>');
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'master' },
    });

    console.log(`Successfully updated user "${user.name}" (${user.email}) to master role`);
  } catch (error: any) {
    if (error.code === 'P2025') {
      console.error(`User with email "${email}" not found`);
    } else {
      console.error('Error updating user:', error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];
setMasterRole(email);
