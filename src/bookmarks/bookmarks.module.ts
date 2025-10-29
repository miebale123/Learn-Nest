import { Controller, Post, Body, Module, Get, Param } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Bookmark } from './bookmarks.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';

class CreateBookmarkDto {
  userId: number;
  secure_url: string;
  price: string;
  location: string;
}

@Controller('bookmarks')
class BookmarkController {
  constructor(
    @InjectRepository(Bookmark)
    private readonly bookmarkRepository: Repository<Bookmark>,
    private readonly usersService: UsersService,
  ) {}

  @Post('create-bookmark')
  async createBookmark(@Body() dto: CreateBookmarkDto) {
    const user = await this.usersService.findById(dto.userId);
    if (!user) return;
    const newBookmark = this.bookmarkRepository.create({
      price: dto.price,
      location: dto.location,
      secure_url: dto.secure_url,
      user: user,
    });

    await this.bookmarkRepository.save(newBookmark);
  }

  @Get()
  async getBookmark(@Param('id') id: number) {
    const foundUser = await this.usersService.findById(id);
    if (!foundUser) return;
    return foundUser.bookmarks;
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Bookmark, User])],
  controllers: [BookmarkController],
  providers: [UsersService],
})
export class BookmarkModule {}
