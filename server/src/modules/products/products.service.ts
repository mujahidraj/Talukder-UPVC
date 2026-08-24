import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, ProductStatus } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { deleteProductImageFiles } from '../../utils/file.utils';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryProductsDto) {
    const {
      page = 1,
      limit = 12,
      search,
      categoryId,
      status,
      size,
      color,
      material,
      classType,
      fittingType,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      isFeatured,
      isNewArrival,
    } = query;

    const where: Prisma.ProductWhereInput = {
      isDeleted: false,
    };

    if (search) {
      where.OR = [
        { productName: { contains: search, mode: 'insensitive' } },
        { productCode: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (categoryId) {
      // Include products in sub-categories too
      where.OR = [
        { categoryId },
        { category: { parentId: categoryId } },
        { category: { parent: { parentId: categoryId } } },
      ];
      // If there's also a search, we need to combine them
      if (search) {
        where.AND = [
          {
            OR: [
              { categoryId },
              { category: { parentId: categoryId } },
              { category: { parent: { parentId: categoryId } } },
            ],
          },
        ];
      }
    }

    if (status) where.status = status;
    if (size) where.size = { contains: size, mode: 'insensitive' };
    if (color) where.color = { contains: color, mode: 'insensitive' };
    if (material) where.material = { contains: material, mode: 'insensitive' };
    if (classType)
      where.classType = { contains: classType, mode: 'insensitive' };
    if (fittingType)
      where.fittingConnectionType = {
        contains: fittingType,
        mode: 'insensitive',
      };
    if (isFeatured !== undefined) where.isFeatured = isFeatured;
    if (isNewArrival !== undefined) where.isNewArrival = isNewArrival;

    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    if (sortBy === 'name') orderBy.productName = sortOrder as Prisma.SortOrder;
    else if (sortBy === 'code')
      orderBy.productCode = sortOrder as Prisma.SortOrder;
    else if (sortBy === 'views')
      orderBy.viewCount = sortOrder as Prisma.SortOrder;
    else orderBy.createdAt = sortOrder as Prisma.SortOrder;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: {
            include: {
              parent: {
                include: { parent: true },
              },
            },
          },
          images: {
            orderBy: { sortOrder: 'asc' },
            take: 1,
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTrash(query: QueryProductsDto) {
    const { page = 1, limit = 12, search } = query;

    const where: Prisma.ProductWhereInput = {
      isDeleted: true,
    };

    if (search) {
      where.OR = [
        { productName: { contains: search, mode: 'insensitive' } },
        { productCode: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: { select: { name: true } },
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMissingData(query: QueryProductsDto) {
    const { page = 1, limit = 12, search } = query;

    const where: Prisma.ProductWhereInput = {
      isDeleted: false,
      OR: [
        { thicknessMm: null },
        { thicknessMm: '' },
        { length: null },
        { length: '' },
        { color: null },
        { color: '' },
        { material: null },
        { material: '' },
      ],
    };

    if (search) {
      where.AND = [
        {
          OR: [
            { productName: { contains: search, mode: 'insensitive' } },
            { productCode: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: { select: { name: true } },
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllIds(
    query: QueryProductsDto,
    isDeleted: boolean = false,
  ): Promise<string[]> {
    const {
      search,
      categoryId,
      status,
      size,
      color,
      material,
      classType,
      fittingType,
    } = query;

    const where: any = { isDeleted };

    if (search) {
      where.OR = [
        { productName: { contains: search } },
        { productCode: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (categoryId && categoryId !== '') {
      where.categoryId = categoryId;
    }
    if (status && (status as any) !== '') where.status = status;
    if (size && size !== '') where.size = size;
    if (color && color !== '') where.color = color;
    if (material && material !== '') where.material = material;
    if (classType && classType !== '') where.classType = classType;
    if (fittingType && fittingType !== '')
      where.fittingConnectionType = fittingType;

    const products = await this.prisma.product.findMany({
      where,
      select: { id: true },
    });

    return products.map((p) => p.id);
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          include: {
            parent: {
              include: { parent: true },
            },
          },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!product || product.isDeleted) {
      throw new NotFoundException('Product not found');
    }

    // Increment view count
    await this.prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } },
    });

    return product;
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          include: {
            parent: { include: { parent: true } },
          },
        },
        images: { orderBy: { sortOrder: 'asc' } },
        createdBy: { select: { id: true, name: true } },
        lastModifiedBy: { select: { id: true, name: true } },
      },
    });

    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async getRelatedProducts(productId: string, categoryId: string, limit = 6) {
    // Fetch the original product to get its name
    const original = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { productName: true, categoryId: true },
    });

    if (!original) return [];

    // Find products with the same name (which means different sizes/variations)
    let related = await this.prisma.product.findMany({
      where: {
        productName: original.productName,
        id: { not: productId },
        isDeleted: false,
        status: ProductStatus.ACTIVE,
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      },
      take: limit,
      orderBy: { size: 'asc' }, // Order sizes logically if possible
    });

    // Fallback: If not enough variations, fill with other products from the same category
    if (related.length < limit) {
      const remainingLimit = limit - related.length;
      const excludeIds = [productId, ...related.map((p) => p.id)];

      const fallbackProducts = await this.prisma.product.findMany({
        where: {
          categoryId: original.categoryId,
          id: { notIn: excludeIds },
          isDeleted: false,
          status: ProductStatus.ACTIVE,
        },
        include: {
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        },
        take: remainingLimit,
      });

      related = [...related, ...fallbackProducts];
    }

    return related;
  }

  async search(query: string, limit = 10) {
    if (!query || query.length < 2) return [];

    const searchTerms = query.split(/\\s+/).join(' | ');
    return this.prisma.product.findMany({
      where: {
        isDeleted: false,
        OR: [
          { productName: { search: searchTerms } },
          { productCode: { search: searchTerms } },
          { description: { search: searchTerms } },
        ],
      },
      select: {
        id: true,
        productName: true,
        productCode: true,
        slug: true,
        size: true,
        status: true,
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
          select: { thumbPath: true, filePath: true },
        },
      },
      take: limit,
    });
  }

  async create(dto: CreateProductDto, userId: string) {
    const slug = this.generateSlug(dto.productName, dto.size, dto.productCode);

    return this.prisma.product.create({
      data: {
        productCode: dto.productCode,
        productName: dto.productName,
        slug,
        categoryId: dto.categoryId,
        fittingConnectionType: dto.fittingConnectionType,
        size: dto.size,
        thicknessMm: dto.thicknessMm,
        length: dto.length,
        color: dto.color,
        classType: dto.classType,
        material: dto.material,
        brandManufacturer: dto.brandManufacturer,
        description: dto.description,
        features: dto.features || [],
        applications: dto.applications || [],
        status: dto.status || ProductStatus.ACTIVE,
        sourcePageCatalog: dto.sourcePageCatalog,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        isFeatured: dto.isFeatured || false,
        createdById: userId,
      },
      include: {
        category: true,
        images: true,
      },
    });
  }

  async update(id: string, dto: UpdateProductDto, userId: string) {
    const existing = await this.findById(id);

    const updateData: any = { ...dto, lastModifiedById: userId };

    const d = dto as any;
    // Regenerate slug if name, size, or code changed
    if (d.productName || d.size || d.productCode) {
      updateData.slug = this.generateSlug(
        d.productName || existing.productName,
        d.size || existing.size,
        d.productCode || existing.productCode,
      );
    }

    return this.prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });
  }

  async softDelete(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async hardDelete(id: string) {
    // Delete relations that might block hard deletion
    await this.prisma.enquiryItem.deleteMany({ where: { productId: id } });
    await this.prisma.wishlistItem.deleteMany({ where: { productId: id } });
    const images = await this.prisma.productImage.findMany({
      where: { productId: id },
    });
    if (images.length > 0) {
      await deleteProductImageFiles(images);
    }
    await this.prisma.productImage.deleteMany({ where: { productId: id } });

    return this.prisma.product.delete({
      where: { id },
    });
  }

  async restore(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { isDeleted: false },
    });
  }

  async bulkStatusChange(ids: string[], status: ProductStatus) {
    return this.prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });
  }

  async bulkSoftDelete(ids: string[]) {
    return this.prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { isDeleted: true },
    });
  }

  async exportAll() {
    return this.prisma.product.findMany({
      where: { isDeleted: false },
      include: {
        category: {
          include: {
            parent: { include: { parent: true } },
          },
        },
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async toggleNewArrival(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    
    return this.prisma.product.update({
      where: { id },
      data: { isNewArrival: !product.isNewArrival }
    });
  }

  async clone(id: string, userId: string) {
    const source = await this.findById(id);
    const newCode = `${source.productCode}-copy-${Date.now().toString(36)}`;
    const newSlug = this.generateSlug(source.productName, source.size, newCode);

    return this.prisma.product.create({
      data: {
        productCode: newCode,
        productName: `${source.productName} (Copy)`,
        slug: newSlug,
        categoryId: source.categoryId,
        fittingConnectionType: source.fittingConnectionType,
        size: source.size,
        thicknessMm: source.thicknessMm,
        length: source.length,
        color: source.color,
        classType: source.classType,
        material: source.material,
        brandManufacturer: source.brandManufacturer,
        description: source.description,
        features: source.features,
        applications: source.applications,
        status: ProductStatus.ACTIVE,
        sourcePageCatalog: source.sourcePageCatalog,
        createdById: userId,
      },
      include: {
        category: true,
        images: true,
      },
    });
  }

  async getFilterOptions(categoryId?: string) {
    const where: Prisma.ProductWhereInput = { isDeleted: false };

    if (categoryId) {
      where.OR = [
        { categoryId },
        { category: { parentId: categoryId } },
        { category: { parent: { parentId: categoryId } } },
      ];
    }

    const [sizes, colors, materials, classTypes, fittingTypes] =
      await Promise.all([
        this.prisma.product.findMany({
          where,
          select: { size: true },
          distinct: ['size'],
          orderBy: { size: 'asc' },
        }),
        this.prisma.product.findMany({
          where: { ...where, color: { not: null } },
          select: { color: true },
          distinct: ['color'],
          orderBy: { color: 'asc' },
        }),
        this.prisma.product.findMany({
          where: { ...where, material: { not: null } },
          select: { material: true },
          distinct: ['material'],
        }),
        this.prisma.product.findMany({
          where: { ...where, classType: { not: null } },
          select: { classType: true },
          distinct: ['classType'],
        }),
        this.prisma.product.findMany({
          where: { ...where, fittingConnectionType: { not: null } },
          select: { fittingConnectionType: true },
          distinct: ['fittingConnectionType'],
        }),
      ]);

    return {
      sizes: sizes.map((s) => s.size),
      colors: colors.map((c) => c.color).filter(Boolean),
      materials: materials.map((m) => m.material).filter(Boolean),
      classTypes: classTypes.map((c) => c.classType).filter(Boolean),
      fittingTypes: fittingTypes
        .map((f) => f.fittingConnectionType)
        .filter(Boolean),
    };
  }

  /**
   * Helper to check if a category chain contains "tubewell"
   */
  private isTubewellCategory(category: any): boolean {
    if (!category) return false;
    const name = category.name?.toLowerCase() || '';
    if (name.includes('tubewell')) return true;
    if (category.parent) return this.isTubewellCategory(category.parent);
    return false;
  }

  /**
   * Returns products grouped by productName.
   * Tubewell products are returned individually (not grouped).
   */
  async findGrouped(query: QueryProductsDto) {
    const {
      page = 1,
      limit = 12,
      search,
      categoryId,
      status,
      size,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const where: Prisma.ProductWhereInput = {
      isDeleted: false,
    };

    if (search) {
      where.OR = [
        { productName: { contains: search, mode: 'insensitive' } },
        { productCode: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (categoryId) {
      const catFilter = [
        { categoryId },
        { category: { parentId: categoryId } },
        { category: { parent: { parentId: categoryId } } },
      ];
      if (search) {
        where.AND = [{ OR: catFilter }];
      } else {
        where.OR = catFilter;
      }
    }

    if (status) where.status = status;
    if (size) where.size = { contains: size, mode: 'insensitive' };

    // Fetch all matching products (we group in-memory)
    const allProducts = await this.prisma.product.findMany({
      where,
      include: {
        category: {
          include: {
            parent: {
              include: { parent: true },
            },
          },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
      },
      orderBy: { productName: 'asc' },
    });

    // Separate tubewell products from others
    const tubewellProducts: any[] = [];
    const otherProducts: any[] = [];

    for (const product of allProducts) {
      if (this.isTubewellCategory(product.category)) {
        tubewellProducts.push(product);
      } else {
        otherProducts.push(product);
      }
    }

    // Group non-tubewell products by productName
    const groupMap = new Map<string, any>();
    for (const product of otherProducts) {
      const key = product.productName;
      if (!groupMap.has(key)) {
        groupMap.set(key, {
          id: product.id, // ID of first product (used for links)
          productName: product.productName,
          slug: product.slug,
          description: product.description,
          category: product.category,
          features: product.features,
          applications: product.applications,
          images: product.images,
          isTubewell: false,
          variantCount: 0,
          variants: [],
        });
      }
      const group = groupMap.get(key);
      group.variantCount++;
      group.variants.push({
        id: product.id,
        productCode: product.productCode,
        slug: product.slug,
        size: product.size,
        thicknessMm: product.thicknessMm,
        length: product.length,
        color: product.color,
        classType: product.classType,
        material: product.material,
        fittingConnectionType: product.fittingConnectionType,
        brandManufacturer: product.brandManufacturer,
        status: product.status,
      });
      // Use first product that has an image
      if (
        (!group.images || group.images.length === 0) &&
        product.images?.length > 0
      ) {
        group.images = product.images;
      }
    }

    // Add tubewell products as individual entries
    for (const tw of tubewellProducts) {
      groupMap.set(`__tw_${tw.id}`, {
        id: tw.id,
        productName: tw.productName,
        slug: tw.slug,
        description: tw.description,
        category: tw.category,
        features: tw.features,
        applications: tw.applications,
        images: tw.images,
        isTubewell: true,
        variantCount: 1,
        variants: [
          {
            id: tw.id,
            productCode: tw.productCode,
            slug: tw.slug,
            size: tw.size,
            thicknessMm: tw.thicknessMm,
            length: tw.length,
            color: tw.color,
            classType: tw.classType,
            material: tw.material,
            fittingConnectionType: tw.fittingConnectionType,
            brandManufacturer: tw.brandManufacturer,
            status: tw.status,
          },
        ],
      });
    }

    const allGrouped = Array.from(groupMap.values());

    // Sort grouped results
    if (sortBy === 'name') {
      allGrouped.sort((a, b) =>
        sortOrder === 'asc'
          ? a.productName.localeCompare(b.productName)
          : b.productName.localeCompare(a.productName),
      );
    } else if (sortBy === 'variants') {
      allGrouped.sort((a, b) =>
        sortOrder === 'asc'
          ? a.variantCount - b.variantCount
          : b.variantCount - a.variantCount,
      );
    }
    // Default: keep alphabetical order

    // Paginate
    const total = allGrouped.length;
    const start = (page - 1) * limit;
    const paginated = allGrouped.slice(start, start + limit);

    return {
      data: paginated,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find a product group by slug — returns the product info + all variants with the same name.
   * For tubewell products, returns single product (old behavior).
   */
  async findGroupedBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          include: {
            parent: {
              include: { parent: true },
            },
          },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!product || product.isDeleted) {
      throw new NotFoundException('Product not found');
    }

    const isTubewell = this.isTubewellCategory(product.category);

    // Increment view count on the accessed product
    await this.prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } },
    });

    if (isTubewell) {
      // Return single product (old behavior)
      return {
        ...product,
        isTubewell: true,
        variants: [
          {
            id: product.id,
            productCode: product.productCode,
            slug: product.slug,
            size: product.size,
            thicknessMm: product.thicknessMm,
            length: product.length,
            color: product.color,
            classType: product.classType,
            material: product.material,
            fittingConnectionType: product.fittingConnectionType,
            brandManufacturer: product.brandManufacturer,
            status: product.status,
          },
        ],
      };
    }

    // Find all sibling products with the same name
    const siblings = await this.prisma.product.findMany({
      where: {
        productName: product.productName,
        isDeleted: false,
      },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
      },
      orderBy: { size: 'asc' },
    });

    const variants = siblings.map((s) => ({
      id: s.id,
      productCode: s.productCode,
      slug: s.slug,
      size: s.size,
      thicknessMm: s.thicknessMm,
      length: s.length,
      color: s.color,
      classType: s.classType,
      material: s.material,
      fittingConnectionType: s.fittingConnectionType,
      brandManufacturer: s.brandManufacturer,
      status: s.status,
      images: s.images,
    }));

    // Collect all images from all variants for the gallery
    const allImages = siblings.flatMap((s) => s.images || []);
    // Deduplicate by filePath
    const uniqueImages = Array.from(
      new Map(allImages.map((img) => [img.filePath, img])).values(),
    );

    return {
      ...product,
      images: uniqueImages.length > 0 ? uniqueImages : product.images,
      isTubewell: false,
      variants,
      variantCount: variants.length,
    };
  }

  /**
   * Get related grouped products for the detail page.
   * Returns other product groups from the same category (not tubewells).
   */
  async getRelatedGroupedProducts(
    productName: string,
    categoryId: string,
    limit = 6,
  ) {
    // Find distinct product names in the same category tree (excluding the current product)
    const related = await this.prisma.product.findMany({
      where: {
        productName: { not: productName },
        isDeleted: false,
        status: ProductStatus.ACTIVE,
        OR: [
          { categoryId },
          { category: { parentId: categoryId } },
          { category: { parent: { parentId: categoryId } } },
        ],
      },
      include: {
        category: {
          include: {
            parent: { include: { parent: true } },
          },
        },
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      },
      orderBy: { productName: 'asc' },
    });

    // Group by productName and deduplicate
    const seen = new Set<string>();
    const grouped: any[] = [];
    for (const p of related) {
      if (this.isTubewellCategory(p.category)) continue;
      if (seen.has(p.productName)) continue;
      seen.add(p.productName);
      grouped.push({
        id: p.id,
        productName: p.productName,
        slug: p.slug,
        category: p.category,
        images: p.images,
        isTubewell: false,
      });
      if (grouped.length >= limit) break;
    }

    return grouped;
  }

  private generateSlug(name: string, size?: string, code?: string): string {
    const parts = [name, size, code].filter(Boolean).join(' ');
    return parts
      .toLowerCase()
      .replace(/[&]/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
