import { Controller, Body, UseGuards, Patch, Param, Get } from '@nestjs/common';
import { Roles } from 'src/auth';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/users/user.enum';
import { UsersService } from 'src/users/users.service';

@Controller('admin-page')
export class AdminController {
  constructor(private usersService: UsersService) {}
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  @Patch('users/:id/role')
  updateRole(@Param('id') id: string, @Body('role') role: UserRole) {
    return this.usersService.updateRole(+id, role);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  @Get()
  getAllUsers() {
    return this.usersService.getAllUsers();
  }
}
