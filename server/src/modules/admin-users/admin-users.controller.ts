import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRole } from '@prisma/client';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { ResetPasswordAdminDto } from './dto/reset-password-admin.dto';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN)
export class AdminUsersController {
  constructor(private adminUsersService: AdminUsersService) {}

  @Get()
  findAll() {
    return this.adminUsersService.findAll();
  }

  @Post()
  create(@Body() body: CreateAdminUserDto) {
    return this.adminUsersService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateAdminUserDto) {
    return this.adminUsersService.update(id, body);
  }

  @Post(':id/reset-password')
  resetPassword(@Param('id') id: string, @Body() body: ResetPasswordAdminDto) {
    return this.adminUsersService.resetPassword(id, body.password);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.adminUsersService.delete(id);
  }
}
