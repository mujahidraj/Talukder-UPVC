import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create Categories
  const pipes = await prisma.category.upsert({
    where: { slug: 'upvc-pipes' },
    update: {},
    create: {
      name: 'uPVC Pipes',
      slug: 'upvc-pipes',
      description: 'High quality uPVC pipes for water supply.',
    },
  });

  const fittings = await prisma.category.upsert({
    where: { slug: 'upvc-fittings' },
    update: {},
    create: {
      name: 'uPVC Fittings',
      slug: 'upvc-fittings',
      description: 'Durable fittings for plumbing needs.',
    },
  });

  const doors = await prisma.category.upsert({
    where: { slug: 'upvc-doors' },
    update: {},
    create: {
      name: 'uPVC Doors',
      slug: 'upvc-doors',
      description: 'Modern uPVC doors.',
    },
  });

  // Create Products
  await prisma.product.upsert({
    where: { productCode: 'PIPE-001' },
    update: {},
    create: {
      productCode: 'PIPE-001',
      productName: 'Talukder uPVC Thread Pipe',
      slug: 'talukder-upvc-thread-pipe-001',
      size: '1/2"',
      categoryId: pipes.id,
      brandManufacturer: 'Talukder uPVC',
      color: 'White',
      status: 'ACTIVE',
      description: 'Premium thread pipe for industrial and residential use.',
    }
  });

  await prisma.product.upsert({
    where: { productCode: 'PIPE-002' },
    update: {},
    create: {
      productCode: 'PIPE-002',
      productName: 'Talukder uPVC Plain Pipe',
      slug: 'talukder-upvc-plain-pipe-002',
      size: '3/4"',
      categoryId: pipes.id,
      brandManufacturer: 'Talukder uPVC',
      color: 'Grey',
      status: 'ACTIVE',
      description: 'BS-3505 standard plain pipe.',
    }
  });

  await prisma.product.upsert({
    where: { productCode: 'FIT-001' },
    update: {},
    create: {
      productCode: 'FIT-001',
      productName: 'uPVC Elbow 90°',
      slug: 'upvc-elbow-90-001',
      size: '1"',
      categoryId: fittings.id,
      brandManufacturer: 'Talukder uPVC',
      color: 'White',
      status: 'ACTIVE',
      description: 'High pressure 90 degree elbow.',
    }
  });

  await prisma.product.upsert({
    where: { productCode: 'FIT-002' },
    update: {},
    create: {
      productCode: 'FIT-002',
      productName: 'uPVC Tee',
      slug: 'upvc-tee-002',
      size: '1.5"',
      categoryId: fittings.id,
      brandManufacturer: 'Talukder uPVC',
      color: 'White',
      status: 'ACTIVE',
      description: 'Standard tee fitting.',
    }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
