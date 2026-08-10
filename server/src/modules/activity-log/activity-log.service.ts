import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ActivityLogService {
  constructor(private prisma: PrismaService) {}

  async log(data: {
    actorId: string;
    action: string;
    entity: string;
    entityId?: string;
    before?: any;
    after?: any;
    ipAddress?: string;
  }) {
    return this.prisma.activityLog.create({ data });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    action?: string;
    entity?: string;
  }) {
    const { page = 1, limit = 50, action, entity } = query;
    const where: any = {};
    if (action) where.action = action;
    if (entity) where.entity = entity;

    const [data, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        include: { actor: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
