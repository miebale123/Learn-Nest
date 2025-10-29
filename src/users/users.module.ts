import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { HousesModule } from 'src/houses/houses.module';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => HousesModule)],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
