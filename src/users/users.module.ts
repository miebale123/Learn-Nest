import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { HousesModule } from 'src/houses/houses.module';
import { User } from './entities/user.entity';
import { Bookmark } from 'src/bookmarks/bookmarks.entity';
import { UsersController } from './users.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Bookmark]),
    forwardRef(() => HousesModule),
  ],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
