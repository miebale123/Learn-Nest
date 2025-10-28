// import {
//   Controller,
//   Get,
//   Post,
//   UploadedFile,
//   UseInterceptors,
//   Body,
// } from '@nestjs/common';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
// import { diskStorage } from 'multer';

import { Controller, Get } from '@nestjs/common';

// const UPLOAD_DIR = './uploads';
// const META_FILE = './uploads/houses.json';

// if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR);
// if (!existsSync(META_FILE)) writeFileSync(META_FILE, JSON.stringify([]));

// interface House {
//   id: number;
//   url: string;
//   location: string;
//   area: string;
//   bathroom: number;
//   bedroom: number;
// }

// @Controller('upload')
// export class UploadController {
//   @Post()
//   @UseInterceptors(
//     FileInterceptor('file', {
//       storage: diskStorage({
//         destination: UPLOAD_DIR,
//         filename: (_req, file, cb) =>
//           cb(null, Date.now() + '-' + file.originalname),
//       }),
//     }),
//   )
//   upload(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
//     const id = Math.floor(Math.random() * 500);
//     const url = `/uploads/${file.filename}`;

//     const house: House = {
//       id,
//       url,
//       location: body.location || '',
//       area: body.area || '',
//       bathroom: Number(body.bathroom) || 0,
//       bedroom: Number(body.bedroom) || 0,
//     };

//     // Read existing houses
//     const raw = readFileSync(META_FILE, 'utf8');
//     const houses: House[] = JSON.parse(raw);

//     // Add new house
//     houses.push(house);

//     // Save
//     writeFileSync(META_FILE, JSON.stringify(houses, null, 2));

//     return { message: 'uploaded file', house };
//   }

//   @Get()
//   getAllHouses(): House[] {
//     if (!existsSync(META_FILE)) return [];
//     const raw = readFileSync(META_FILE, 'utf8');
//     return JSON.parse(raw);
//   }
// }

@Controller()
export class UploadController {
  @Get()
  async getImages(){
         
  }
}
