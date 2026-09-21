const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Find all products where metaTitle or metaDescription is null
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { metaTitle: null },
        { metaTitle: '' },
        { metaDescription: null },
        { metaDescription: '' },
      ],
    },
    select: {
      id: true,
      productName: true,
      description: true,
      metaTitle: true,
      metaDescription: true,
    },
  });

  console.log(`Found ${products.length} products with missing meta fields.`);

  let updated = 0;
  for (const product of products) {
    const data = {};

    if (!product.metaTitle) {
      data.metaTitle = product.productName;
    }

    if (!product.metaDescription) {
      // Use product description if available, otherwise generate from product name
      data.metaDescription = product.description
        ? product.description.substring(0, 160)
        : `Buy ${product.productName} – premium uPVC pipes & fittings from Talukder uPVC Fittings Ltd. BS-3505 certified, made in Bangladesh.`;
    }

    if (Object.keys(data).length > 0) {
      await prisma.product.update({
        where: { id: product.id },
        data,
      });
      updated++;
      console.log(`  ✓ Updated: ${product.productName} → metaTitle: "${data.metaTitle || '(kept)'}", metaDesc: "${(data.metaDescription || '(kept)').substring(0, 50)}..."`);
    }
  }

  console.log(`\nDone! Updated ${updated} products.`);

  // Also fix categories
  const categories = await prisma.category.findMany({
    where: {
      OR: [
        { metaTitle: null },
        { metaTitle: '' },
        { metaDescription: null },
        { metaDescription: '' },
      ],
    },
    select: {
      id: true,
      name: true,
      description: true,
      metaTitle: true,
      metaDescription: true,
    },
  });

  console.log(`\nFound ${categories.length} categories with missing meta fields.`);

  let catUpdated = 0;
  for (const cat of categories) {
    const data = {};

    if (!cat.metaTitle) {
      data.metaTitle = cat.name;
    }

    if (!cat.metaDescription) {
      data.metaDescription = cat.description
        ? cat.description.substring(0, 160)
        : `Browse ${cat.name} – premium uPVC pipes & fittings from Talukder uPVC Fittings Ltd.`;
    }

    if (Object.keys(data).length > 0) {
      await prisma.category.update({
        where: { id: cat.id },
        data,
      });
      catUpdated++;
      console.log(`  ✓ Updated category: ${cat.name}`);
    }
  }

  console.log(`\nDone! Updated ${catUpdated} categories.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
