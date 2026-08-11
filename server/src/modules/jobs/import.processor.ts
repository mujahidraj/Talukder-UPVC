import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MediaService } from '../media/media.service';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import { ProductStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ImportProcessor {
  private readonly logger = new Logger(ImportProcessor.name);

  constructor(
    private prisma: PrismaService,
    private mediaService: MediaService,
  ) {}

  async processExcelImport(jobId: string, filePath: string, userId: string) {
    this.logger.log(`Processing Excel import job ${jobId} with file ${filePath}`);

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new Error('No worksheets found in the Excel file');
    }

    const rowCount = worksheet.rowCount;
    if (rowCount <= 1) {
      throw new Error('Excel file is empty or missing data rows');
    }

    // Process categories cache
    const categoryCache = new Map<string, string>();
    
    const getOrCreateCategory = async (mainName: string, subName?: string, subSubName?: string) => {
      let currentParentId: string | null = null;
      const categories = [mainName, subName, subSubName].filter(Boolean) as string[];
      
      let lastId: string | null = null;
      let path = '';
      
      for (const catName of categories) {
        path += catName + '>';
        if (categoryCache.has(path)) {
          lastId = categoryCache.get(path)!;
          currentParentId = lastId;
          continue;
        }

        const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        let category: any = await this.prisma.category.findFirst({
          where: { name: catName, parentId: currentParentId },
        });

        if (!category) {
          // find max order
          const maxOrder = await this.prisma.category.aggregate({
            where: { parentId: currentParentId },
            _max: { sortOrder: true },
          });

          // calculate level
          let level = 0;
          if (currentParentId) {
             const parent = await this.prisma.category.findUnique({ where: { id: currentParentId } });
             if (parent) level = parent.level + 1;
          }

          category = await this.prisma.category.create({
            data: {
              name: catName,
              slug: slug + '-' + Date.now().toString(36), // ensure unique slug
              parentId: currentParentId,
              level,
              sortOrder: (maxOrder._max.sortOrder || 0) + 1,
            }
          });
        }
        
        lastId = category.id;
        currentParentId = lastId;
        categoryCache.set(path, lastId!);
      }
      
      return lastId;
    };

    // Images
    const images = worksheet.getImages();
    // Map nativeRow -> images array
    const imageRowMap = new Map<number, any[]>();
    for (const img of images) {
      if (img.range.tl.nativeRow !== undefined) {
        const rowKey = img.range.tl.nativeRow;
        if (!imageRowMap.has(rowKey)) {
          imageRowMap.set(rowKey, []);
        }
        imageRowMap.get(rowKey)!.push(img);
      }
    }

    let rowsSuccess = 0;
    let rowsFailed = 0;

    for (let rowIndex = 2; rowIndex <= rowCount; rowIndex++) {
      try {
        const row = worksheet.getRow(rowIndex);
        // Column mapping based on user input
        const mainCat = row.getCell(1).text;
        const subCat = row.getCell(2).text;
        const subSubCat = row.getCell(3).text;
        const productCode = row.getCell(4).text;
        const productName = row.getCell(5).text;
        const fittingType = row.getCell(6).text;
        const size = row.getCell(7).text;
        const thickness = row.getCell(8).text;
        const length = row.getCell(9).text;
        const color = row.getCell(10).text;
        const classType = row.getCell(11).text;
        const material = row.getCell(12).text;
        const brand = row.getCell(13).text;
        const description = row.getCell(14).text;
        const featuresStr = row.getCell(15).text;
        const applicationsStr = row.getCell(16).text;
        let statusStr = row.getCell(17).text;

        if (!productCode || !productName) {
           continue; // skip empty rows
        }


        
        // Get Category
        let categoryId = null;
        if (mainCat) {
           categoryId = await getOrCreateCategory(mainCat, subCat, subSubCat);
        }

        if (!categoryId) {
           throw new Error(`Category is required but missing on row ${rowIndex}`);
        }

        // Status
        let status: ProductStatus = ProductStatus.ACTIVE;
        statusStr = statusStr.toUpperCase();
        if (Object.keys(ProductStatus).includes(statusStr)) {
          status = statusStr as ProductStatus;
        }

        const features = featuresStr ? featuresStr.split(',').map(s => s.trim()).filter(Boolean) : [];
        const applications = applicationsStr ? applicationsStr.split(',').map(s => s.trim()).filter(Boolean) : [];

        // Check if exists
        let product = await this.prisma.product.findUnique({
          where: { productCode },
        });

        const data = {
          productName,
          slug: productCode.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + uuidv4().slice(0, 4),
          categoryId,
          fittingConnectionType: fittingType || null,
          size: size || 'Standard',
          thicknessMm: thickness || null,
          length: length || null,
          color: color || null,
          classType: classType || null,
          material: material || null,
          brandManufacturer: brand || null,
          description: description || null,
          features,
          applications,
          status,
        };

        if (product) {
          product = await this.prisma.product.update({
            where: { id: product.id },
            data: { ...data, lastModifiedById: userId, isDeleted: false, slug: product.slug },
          });
        } else {
          product = await this.prisma.product.create({
            data: {
              productCode,
              ...data,
              createdById: userId,
              lastModifiedById: userId,
            }
          });
        }

        // Process images (array)
        const rowImages = imageRowMap.get(rowIndex - 1);
        if (rowImages && rowImages.length > 0) {
           // Delete existing images for this product since we are overriding from excel
           await this.prisma.productImage.deleteMany({ where: { productId: product.id } });
           
           for (let i = 0; i < rowImages.length; i++) {
             const imgDef = rowImages[i];
             const mediaId = imgDef.imageId;
             // @ts-ignore
             const mediaData = workbook.model.media[mediaId];
             if (mediaData && mediaData.buffer) {
               const buffer = mediaData.buffer;
               const ext = mediaData.extension || 'png';
  
               const multerFile = {
                 buffer,
                 originalname: `import-${productCode}-${i}.${ext}`,
                 mimetype: ext === 'png' ? 'image/png' : 'image/jpeg',
                 size: buffer.byteLength,
               } as unknown as Express.Multer.File;
  
               // first image is primary
               await this.mediaService.uploadProductImage(product.id, multerFile, i === 0);
             }
           }
        }

        rowsSuccess++;
      } catch (err) {
        this.logger.error(`Error processing row ${rowIndex}:`, err);
        rowsFailed++;
      }

      // Update progress every 10 rows
      if (rowIndex % 10 === 0) {
        await this.prisma.importJob.update({
          where: { id: jobId },
          data: { progress: Math.floor((rowIndex / rowCount) * 100) },
        });
      }
    }

    // Cleanup Excel file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return { rowsSuccess, rowsFailed };
  }
}
