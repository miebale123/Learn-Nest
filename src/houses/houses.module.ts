import {
  Module,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersModule } from 'src/users/users.module';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

/* -------------------- ENTITY -------------------- */
@Entity('houses')
export class House {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  secure_url: string;

  @ManyToOne(() => User, (user) => user.houses, { nullable: false })
  user: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

/* -------------------- DTO -------------------- */
export class HouseDto {
  userId: number;
}

/* -------------------- CONTROLLER -------------------- */
@Controller('houses')
export class HouseController {
  constructor(
    private readonly usersService: UsersService,
    // @InjectRepository(House)
    // private readonly houseRepository: Repository<House>,
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

    const user = await this.usersService.findById(dto.userId);
    if (!user) throw new NotFoundException('User not found');

    // const newHouse = this.houseRepository.create({
    //   secure_url: result.secure_url,
    //   user,
    // });

    // return await this.houseRepository.save(newHouse);
  }
}

/* -------------------- MODULE -------------------- */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forFeature([House]),
    forwardRef(() => UsersModule),
  ],
  controllers: [HouseController],
  providers: [UsersService]
})
export class HousesModule {}
