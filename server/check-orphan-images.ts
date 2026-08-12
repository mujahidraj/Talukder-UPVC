import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const uploadsDir = path.join(__dirname, 'uploads', 'products');
  const fullDir = path.join(uploadsDir, 'full');
  const mediumDir = path.join(uploadsDir, 'medium');
  const thumbDir = path.join(uploadsDir, 'thumb');

  const getFiles = (dir: string) => {
    try {
      return fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => fs.statSync(path.join(dir, f)).isFile()) : [];
    } catch (e) {
      console.error(`Error reading directory ${dir}:`, e);
      return [];
    }
  };

  const fullFiles = getFiles(fullDir);
  const mediumFiles = getFiles(mediumDir);
  const thumbFiles = getFiles(thumbDir);

  console.log(`Files in OS: Full: ${fullFiles.length}, Medium: ${mediumFiles.length}, Thumb: ${thumbFiles.length}`);

  const dbImages = await prisma.productImage.findMany({
    include: { product: true }
  });
  
  console.log(`ProductImage DB records: ${dbImages.length}`);

  const extractFilename = (p: string | null) => p ? path.basename(p) : null;

  // DB contains paths like "/uploads/products/full/uuid.jpeg"
  const dbFullFileNames = new Set(dbImages.map(img => extractFilename(img.fullPath)).filter(Boolean));
  const dbMediumFileNames = new Set(dbImages.map(img => extractFilename(img.mediumPath)).filter(Boolean));
  const dbThumbFileNames = new Set(dbImages.map(img => extractFilename(img.thumbPath)).filter(Boolean));

  // Also check filePath if fullPath is missing for some reason
  dbImages.forEach(img => {
    const p = extractFilename(img.filePath);
    if (p) dbFullFileNames.add(p);
  });

  const orphanFull = fullFiles.filter(f => !dbFullFileNames.has(f));
  const orphanMedium = mediumFiles.filter(f => !dbMediumFileNames.has(f));
  const orphanThumb = thumbFiles.filter(f => !dbThumbFileNames.has(f));

  console.log('\n--- ORPHAN FILES (In OS, but not in DB) ---');
  console.log(`Full Dir: ${orphanFull.length} orphans`);
  console.log(`Medium Dir: ${orphanMedium.length} orphans`);
  console.log(`Thumb Dir: ${orphanThumb.length} orphans`);
  
  if (orphanFull.length > 0) {
    console.log('\nSample orphans (Full):', orphanFull.slice(0, 5));
  }

  // Find missing in File System (in DB but file missing)
  const missingFullFiles = dbImages.filter(img => {
    const f = extractFilename(img.filePath) || extractFilename(img.fullPath);
    return f && !fullFiles.includes(f);
  });

  console.log('\n--- MISSING FILES (In DB, but missing in Full Dir) ---');
  console.log(`Missing: ${missingFullFiles.length}`);
  if (missingFullFiles.length > 0) {
    missingFullFiles.slice(0, 5).forEach(m => console.log(`- DB ID: ${m.id}, Product ID: ${m.productId}, Path: ${m.filePath}`));
  }

  const softDeletedProducts = dbImages.filter(img => img.product?.isDeleted);
  console.log('\n--- IMAGES FOR SOFT-DELETED PRODUCTS ---');
  console.log(`Images: ${softDeletedProducts.length}`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
