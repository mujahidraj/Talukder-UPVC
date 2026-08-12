import * as path from 'path';
import * as fs from 'fs/promises';

export const safeUnlink = async (filePath: string | null) => {
  if (!filePath) return;
  const rootDir = path.resolve(__dirname, '..', '..');

  // filePath usually starts with '/' like '/uploads/products/full/xxx.jpeg'
  // using path.join or path.resolve requires removing the leading slash so it's not treated as absolute root
  const relativePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  const targetPath = path.resolve(rootDir, relativePath);

  if (!targetPath.startsWith(rootDir)) {
    console.warn(
      'Security Warning: Path traversal detected in image deletion',
      targetPath,
    );
    return;
  }

  await fs.unlink(targetPath).catch(() => {});
};

export const deleteProductImageFiles = async (
  images: {
    fullPath: string | null;
    mediumPath: string | null;
    thumbPath: string | null;
  }[],
) => {
  for (const img of images) {
    await safeUnlink(img.fullPath);
    await safeUnlink(img.mediumPath);
    await safeUnlink(img.thumbPath);
  }
};
