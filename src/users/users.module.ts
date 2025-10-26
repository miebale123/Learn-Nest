import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { Bookmark } from 'src/bookmarks/bookmark.entity';
import { House } from 'src/House/house.entity';
import { User } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, Bookmark, House])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
