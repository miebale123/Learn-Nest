import {
  Module,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  NotFoundException,
  forwardRef,
  Get,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import { Readable } from 'stream';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersModule } from 'src/users/users.module';
import { House } from './houses.entity';
import { Public } from 'src/common';

export class HouseDto {
  url: string;
  price: string;
  location: string;
}

@Controller('houses')
export class HousesController {
  constructor(
    @InjectRepository(House)
    private readonly houseRepository: Repository<House>,
  ) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_KEY,
      api_secret: process.env.CLOUDINARY_SECRET,
    });
  }

  @Post('create-house')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: HouseDto,
  ) {
    const result: UploadApiResponse = await new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          if (error) return reject(error);
          resolve(result);
        },
      );

      Readable.from(file.buffer).pipe(upload);
    });

    const newHouse = this.houseRepository.create({
      secure_url: result.secure_url,
      price: dto.price,
      location: dto.location,
    });

    return await this.houseRepository.save(newHouse);
  }

  @Public()
  @Get()
  async getAll() {
    return await this.houseRepository.find();
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    const house = await this.houseRepository.findOne({
      where: { id },
    });

    if (!house) throw new NotFoundException('House not found');
    return house;
  }
}

/* -------------------- MODULE -------------------- */
@Module({
  imports: [TypeOrmModule.forFeature([House]), forwardRef(() => UsersModule)],
  controllers: [HousesController],
})
export class HousesModule {}
