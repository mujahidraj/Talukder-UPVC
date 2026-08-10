import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, ProductStatus } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';

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
    } = query;

    const where: Prisma.ProductWhereInput = {
      isDeleted: false,
    };

    if (search) {
      const searchTerms = search.split(/\\s+/).join(' | ');
      where.OR = [
        { productName: { search: searchTerms } },
        { productCode: { search: searchTerms } },
        { description: { search: searchTerms } },
        { applications: { hasSome: [search] } },
        {
          category: {
            OR: [
              { name: { search: searchTerms } },
              {
                parent: {
                  name: { search: searchTerms },
                },
              },
            ],
          },
        },
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
    return this.prisma.product.findMany({
      where: {
        categoryId,
        id: { not: productId },
        isDeleted: false,
        status: ProductStatus.ACTIVE,
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      },
      take: limit,
    });
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
    return this.prisma.product.delete({ where: { id } });
  }

  async bulkStatusChange(ids: string[], status: ProductStatus) {
    return this.prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { status },
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

  async getFilterOptions() {
    const [sizes, colors, materials, classTypes, fittingTypes] =
      await Promise.all([
        this.prisma.product.findMany({
          where: { isDeleted: false },
          select: { size: true },
          distinct: ['size'],
          orderBy: { size: 'asc' },
        }),
        this.prisma.product.findMany({
          where: { isDeleted: false, color: { not: null } },
          select: { color: true },
          distinct: ['color'],
          orderBy: { color: 'asc' },
        }),
        this.prisma.product.findMany({
          where: { isDeleted: false, material: { not: null } },
          select: { material: true },
          distinct: ['material'],
        }),
        this.prisma.product.findMany({
          where: { isDeleted: false, classType: { not: null } },
          select: { classType: true },
          distinct: ['classType'],
        }),
        this.prisma.product.findMany({
          where: {
            isDeleted: false,
            fittingConnectionType: { not: null },
          },
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

  private generateSlug(name: string, size?: string, code?: string): string {
    const parts = [name, size, code].filter(Boolean).join(' ');
    return parts
      .toLowerCase()
      .replace(/[&]/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
