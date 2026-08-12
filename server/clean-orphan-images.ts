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

  const dbImages = await prisma.productImage.findMany();
  const extractFilename = (p: string | null) => p ? path.basename(p) : null;

  const dbFullFileNames = new Set(dbImages.map(img => extractFilename(img.fullPath)).filter(Boolean));
  const dbMediumFileNames = new Set(dbImages.map(img => extractFilename(img.mediumPath)).filter(Boolean));
  const dbThumbFileNames = new Set(dbImages.map(img => extractFilename(img.thumbPath)).filter(Boolean));

  dbImages.forEach(img => {
    const p = extractFilename(img.filePath);
    if (p) dbFullFileNames.add(p);
  });

  const orphanFull = fullFiles.filter(f => !dbFullFileNames.has(f));
  const orphanMedium = mediumFiles.filter(f => !dbMediumFileNames.has(f));
  const orphanThumb = thumbFiles.filter(f => !dbThumbFileNames.has(f));

  console.log(`Found ${orphanFull.length} orphan files in 'full', ${orphanMedium.length} in 'medium', and ${orphanThumb.length} in 'thumb'.`);
  console.log('Starting deletion process...');

  let deletedCount = 0;

  const deleteFile = (dir: string, fileName: string) => {
    try {
      const filePath = path.join(dir, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    } catch (e) {
      console.error(`Failed to delete ${fileName} from ${dir}:`, e);
    }
  };

  orphanFull.forEach(f => deleteFile(fullDir, f));
  orphanMedium.forEach(f => deleteFile(mediumDir, f));
  orphanThumb.forEach(f => deleteFile(thumbDir, f));

  console.log(`Deletion complete. Successfully removed ${deletedCount} orphaned files.`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
