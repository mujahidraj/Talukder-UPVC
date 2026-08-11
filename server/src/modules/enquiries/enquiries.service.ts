import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EnquiryStatus } from '@prisma/client';

@Injectable()
export class EnquiriesService {
  constructor(private prisma: PrismaService) {}

  async submit(data: {
    customerName: string;
    companyName?: string;
    email: string;
    phone: string;
    address?: string;
    district?: string;
    deliveryPref?: string;
    message?: string;
    sourcePage?: string;
    items: { productId: string; quantity: number; note?: string }[];
  }) {
    const enquiry = await this.prisma.enquiry.create({
      data: {
        customerName: data.customerName,
        companyName: data.companyName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        district: data.district,
        deliveryPref: data.deliveryPref,
        message: data.message,
        sourcePage: data.sourcePage,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            note: item.note,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
      },
    });

    // Increment enquiry count on products
    for (const item of data.items) {
      await this.prisma.product.update({
        where: { id: item.productId },
        data: { enquiryCount: { increment: 1 } },
      });
    }

    // TODO: Send email notification when SMTP is configured

    return enquiry;
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    status?: EnquiryStatus;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { page = 1, limit = 20, status, search, startDate, endDate } = query;

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.enquiry.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  productName: true,
                  productCode: true,
                  slug: true,
                },
              },
            },
          },
          assignedTo: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.enquiry.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const enquiry = await this.prisma.enquiry.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: { sortOrder: 'asc' }, take: 1 },
              },
            },
          },
        },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    if (!enquiry) throw new NotFoundException('Enquiry not found');
    return enquiry;
  }

  async updateStatus(
    id: string,
    status: EnquiryStatus,
    internalNotes?: string,
  ) {
    return this.prisma.enquiry.update({
      where: { id },
      data: { status, ...(internalNotes && { internalNotes }) },
    });
  }

  async assign(id: string, assignedToId: string) {
    return this.prisma.enquiry.update({
      where: { id },
      data: { assignedToId },
    });
  }

  async addNote(id: string, note: string) {
    const enquiry = await this.findById(id);
    const existing = enquiry.internalNotes || '';
    const timestamp = new Date().toISOString();
    const updated = `${existing}\n[${timestamp}] ${note}`.trim();

    return this.prisma.enquiry.update({
      where: { id },
      data: { internalNotes: updated },
    });
  }

  async getDashboardStats() {
    const [total, newToday, newThisWeek, statusCounts] = await Promise.all([
      this.prisma.enquiry.count(),
      this.prisma.enquiry.count({
        where: {
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      this.prisma.enquiry.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      this.prisma.enquiry.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    return { total, newToday, newThisWeek, statusCounts };
  }

  async delete(id: string) {
    // Delete items first due to foreign key
    await this.prisma.enquiryItem.deleteMany({
      where: { enquiryId: id },
    });
    return this.prisma.enquiry.delete({
      where: { id },
    });
  }
}
