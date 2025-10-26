import { Module } from '@nestjs/common';
import { UploadController } from './upload-house.controller';

@Module({
  controllers: [UploadController],
})
export class UploadModule {}
