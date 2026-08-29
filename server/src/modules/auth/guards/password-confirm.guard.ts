import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PasswordConfirmGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const superPassword = request.headers['x-super-password'];

    if (!user || !user.id) {
      throw new UnauthorizedException('Authentication required');
    }

    if (!superPassword) {
      throw new ForbiddenException('Super admin password confirmation required');
    }

    const adminUser = await this.prisma.adminUser.findUnique({
      where: { id: user.id },
    });

    if (!adminUser) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(superPassword, adminUser.passwordHash);

    if (!isPasswordValid) {
      throw new ForbiddenException('Invalid password confirmation');
    }

    return true;
  }
}
