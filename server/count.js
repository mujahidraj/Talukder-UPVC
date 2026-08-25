const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.product.count();
  console.log('Total products in DB:', count);

  const products = await prisma.product.findMany({
    select: { productCode: true, productName: true }
  });

  const fs = require('fs');
  fs.writeFileSync('products.json', JSON.stringify(products, null, 2));

  await prisma.$disconnect();
}

main();
