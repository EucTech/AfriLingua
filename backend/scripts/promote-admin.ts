import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const email = process.argv[2];
if (!email) {
  console.error('Usage: tsx scripts/promote-admin.ts <email>');
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  const user = await prisma.user.update({ where: { email }, data: { role: 'admin' } });
  console.log(`Promoted ${user.email} to admin`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
