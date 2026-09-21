import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { AdminRole } from '@prisma/client';

@Injectable()
export class AdminUsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.adminUser.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    name: string;
    email: string;
    role: AdminRole;
    password?: string;
  }) {
    const existing = await this.prisma.adminUser.findUnique({
      where: { email: data.email },
    });
    if (existing) throw new BadRequestException('Email already in use');

    // Generate a temporary password if not provided
    const isGenerated = !data.password;
    const plainPassword =
      data.password ||
      `Temp@${Math.random().toString(36).slice(-8)}${Math.floor(Math.random() * 10)}`;
    const passwordHash = await bcrypt.hash(plainPassword, 12);

    const user = await this.prisma.adminUser.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        passwordHash,
        mustChangePassword: true,
      },
      select: { id: true, name: true, email: true, role: true },
    });

    return {
      ...user,
      ...(isGenerated ? { temporaryPassword: plainPassword } : {}),
    };
  }

  async update(
    id: string,
    data: {
      name?: string;
      email?: string;
      role?: AdminRole;
      isActive?: boolean;
    },
  ) {
    if (data.email) {
      const existing = await this.prisma.adminUser.findUnique({
        where: { email: data.email },
      });
      if (existing && existing.id !== id)
        throw new BadRequestException('Email already in use');
    }

    return this.prisma.adminUser.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });
  }

  async resetPassword(id: string, newPassword?: string) {
    const isGenerated = !newPassword;
    const plainPassword =
      newPassword ||
      `Temp@${Math.random().toString(36).slice(-8)}${Math.floor(Math.random() * 10)}`;
    const passwordHash = await bcrypt.hash(plainPassword, 12);

    await this.prisma.adminUser.update({
      where: { id },
      data: { passwordHash, mustChangePassword: true },
    });

    return {
      message: 'Password reset successfully',
      ...(isGenerated ? { temporaryPassword: plainPassword } : {}),
    };
  }

  async delete(id: string) {
    const user = await this.prisma.adminUser.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === AdminRole.SUPER_ADMIN) {
      const superAdmins = await this.prisma.adminUser.count({
        where: { role: AdminRole.SUPER_ADMIN },
      });
      if (superAdmins <= 1)
        throw new BadRequestException('Cannot delete the last Super Admin');
    }
    return this.prisma.adminUser.delete({ where: { id } });
  }
}
