import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const categories = await this.prisma.category.findMany({
      where: { parentId: null, isVisible: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        children: {
          where: { isVisible: true },
          include: {
            children: {
              where: { isVisible: true },
              orderBy: { sortOrder: 'asc' },
              include: { _count: { select: { products: true } } }
            },
            _count: { select: { products: true } },
          },
          orderBy: { sortOrder: 'asc' },
        },
        _count: { select: { products: true } },
      },
    });

    // Helper to calculate total products including subcategories
    const calculateTotalProducts = (cat: any) => {
      let total = cat._count?.products || 0;
      if (cat.children && cat.children.length > 0) {
        cat.children = cat.children.map(calculateTotalProducts);
        total += cat.children.reduce((acc: number, child: any) => acc + child.totalProducts, 0);
      }
      return { ...cat, totalProducts: total };
    };

    return categories.map(calculateTotalProducts);
  }

  async getTree() {
    const categories = await this.prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Build tree from flat list
    const map = new Map<string, any>();
    const roots: any[] = [];

    categories.forEach((cat) => {
      map.set(cat.id, { ...cat, children: [] });
    });

    categories.forEach((cat) => {
      const node = map.get(cat.id);
      if (cat.parentId && map.has(cat.parentId)) {
        map.get(cat.parentId).children.push(node);
      } else if (!cat.parentId) {
        roots.push(node);
      }
    });

    const calculateTotalProducts = (cat: any) => {
      let total = cat._count?.products || 0;
      if (cat.children && cat.children.length > 0) {
        cat.children = cat.children.map(calculateTotalProducts);
        total += cat.children.reduce((acc: number, child: any) => acc + child.totalProducts, 0);
      }
      return { ...cat, totalProducts: total };
    };

    return roots.map(calculateTotalProducts);
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        children: {
          where: { isVisible: true },
          include: {
            children: {
              where: { isVisible: true },
              orderBy: { sortOrder: 'asc' },
            },
            _count: { select: { products: true } },
          },
          orderBy: { sortOrder: 'asc' },
        },
        parent: {
          include: { parent: true },
        },
        _count: { select: { products: true } },
      },
    });

    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async findAllAdmin() {
    return this.prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
        parent: true,
      },
      orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  async create(data: {
    name: string;
    slug?: string;
    description?: string;
    image?: string;
    parentId?: string;
    isVisible?: boolean;
    metaTitle?: string;
    metaDescription?: string;
  }) {
    const slug =
      data.slug ||
      data.name
        .toLowerCase()
        .replace(/[&]/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    let level = 0;
    if (data.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: data.parentId },
      });
      if (parent) level = parent.level + 1;
    }

    const maxOrder = await this.prisma.category.aggregate({
      where: { parentId: data.parentId || null },
      _max: { sortOrder: true },
    });

    return this.prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        image: data.image,
        parentId: data.parentId,
        level,
        sortOrder: (maxOrder._max.sortOrder || 0) + 1,
        isVisible: data.isVisible ?? true,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
      },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      image?: string;
      parentId?: string;
      isVisible?: boolean;
      sortOrder?: number;
      metaTitle?: string;
      metaDescription?: string;
    },
  ) {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    // Check if category has active products
    const activeCount = await this.prisma.product.count({
      where: { categoryId: id, isDeleted: false },
    });
    if (activeCount > 0) {
      throw new Error(
        `Cannot delete category with ${activeCount} active products. Reassign or delete them first.`,
      );
    }

    // Find any soft-deleted products in this category
    const softDeletedProducts = await this.prisma.product.findMany({
      where: { categoryId: id, isDeleted: true },
      select: { id: true },
    });

    if (softDeletedProducts.length > 0) {
      const ids = softDeletedProducts.map((p) => p.id);
      
      // Clean up relations that would block product hard deletion
      await this.prisma.enquiryItem.deleteMany({
        where: { productId: { in: ids } },
      });
      await this.prisma.wishlistItem.deleteMany({
        where: { productId: { in: ids } },
      });
      await this.prisma.productImage.deleteMany({
        where: { productId: { in: ids } },
      });

      // Permanently delete the soft-deleted products
      await this.prisma.product.deleteMany({
        where: { id: { in: ids } },
      });
    }

    // Delete children first
    await this.prisma.category.deleteMany({
      where: { parentId: id },
    });

    return this.prisma.category.delete({ where: { id } });
  }

  async reorder(items: { id: string; sortOrder: number }[]) {
    const updates = items.map((item) =>
      this.prisma.category.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      }),
    );
    return this.prisma.$transaction(updates);
  }
}
