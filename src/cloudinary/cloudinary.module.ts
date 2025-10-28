import { Module } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CloudinaryController } from './cloudinary.controller';
import { CloudinaryService } from './cloudinary.service';

@Module({
  imports: [ConfigModule],
  controllers: [CloudinaryController],
  providers: [
    {
      provide: 'CLOUDINARY',
      useFactory: (configService: ConfigService) => {
        const cloudinaryConfig = configService.get('config.cloudinary');
        cloudinary.config({
          cloud_name: cloudinaryConfig.cloud_name,
          api_key: cloudinaryConfig.api_key,
          api_secret: cloudinaryConfig.api_secret,
        });
        return cloudinary;
      },
      inject: [ConfigService],
    },
    CloudinaryService,
  ],
  exports: ['CLOUDINARY', CloudinaryService],
})
export class CloudinaryModule {}
