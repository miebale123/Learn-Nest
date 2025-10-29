// import {
//   Controller,
//   Get,
//   Post,
//   Delete,
//   Param,
//   Body,
//   Injectable,
//   Module,
//   NotFoundException,
// } from '@nestjs/common';
// import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { User } from 'src/users/entities';
// import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

import { Module } from '@nestjs/common';

// /* -------------------- ENTITY -------------------- */
// @Entity('bookmarks')
// export class Bookmark {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column()
//   title: string;

//   @Column()
//   imageUrl: string;

//   @Column()
//   publicId: string; // House public ID for delete later

//   @ManyToOne(() => User, (user) => user.bookmarks)
//   user: User;
// }

// /* -------------------- DTO -------------------- */
// class CreateBookmarkDto {
//   title: string;
//   imageUrl: string;
// }

// /* -------------------- REPOSITORY -------------------- */
// @Injectable()
// class BookmarkRepository {
//   constructor(
//     @InjectRepository(Bookmark)
//     private readonly repo: Repository<Bookmark>,
//   ) {}

//   findAll() {
//     return this.repo.find();
//   }

//   findById(id: number) {
//     return this.repo.findOne({ where: { id } });
//   }

//   create(bookmarkData: Partial<Bookmark>) {
//     const bookmark = this.repo.create(bookmarkData);
//     return this.repo.save(bookmark);
//   }

//   async delete(id: number) {
//     const bookmark = await this.findById(id);
//     if (!bookmark) throw new NotFoundException('Bookmark not found');

//     // Delete from House before DB
//     await house.uploader.destroy(bookmark.publicId);
//     return this.repo.remove(bookmark);
//   }
// }

// /* -------------------- SERVICE -------------------- */
// @Injectable()
// class BookmarkService {
//   constructor(private readonly repo: BookmarkRepository) {}

//   async getAll() {
//     return this.repo.findAll();
//   }

//   async addBookmark(dto: CreateBookmarkDto, user: User) {
//     const uploadResult = await house.uploader.upload(dto.imageUrl);

//     return this.repo.create({
//       title: dto.title,
//       imageUrl: uploadResult.secure_url,
//       publicId: uploadResult.public_id,
//       user,
//     });
//   }

//   async removeBookmark(id: number) {
//     return this.repo.delete(id);
//   }
// }

// /* -------------------- CONTROLLER -------------------- */
// @Controller('bookmarks')
// class BookmarkController {
//   constructor(private readonly service: BookmarkService) {}

//   @Get()
//   async getAll() {
//     return this.service.getAll();
//   }

//   @Post()
//   async create(@Body() dto: CreateBookmarkDto, user: User) {
//     return this.service.addBookmark(dto, user);
//   }

//   @Delete(':id')
//   async remove(@Param('id') id: number) {
//     return this.service.removeBookmark(+id);
//   }
// }

// /* -------------------- MODULE -------------------- */
// @Module({
//   imports: [TypeOrmModule.forFeature([Bookmark])],
//   controllers: [BookmarkController],
//   providers: [BookmarkRepository, BookmarkService],
// })
@Module({})
export class BookmarkModule {}
