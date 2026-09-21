import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const images = await prisma.productImage.findMany({ take: 5 });
  console.log(JSON.stringify(images, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
