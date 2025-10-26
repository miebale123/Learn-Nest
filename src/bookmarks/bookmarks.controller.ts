

import { Controller, Get, Post, Body, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { existsSync, writeFileSync, readFileSync } from 'fs';

const BOOKMARK_FILE = './uploads/bookmarks.json';
if (!existsSync(BOOKMARK_FILE)) writeFileSync(BOOKMARK_FILE, JSON.stringify([]));

interface House {
  id: number;
  url: string;
  
}

@Controller('bookmarks')
export class BookmarksController {
  private readBookmarks(): House[] {
    try {
      const data = readFileSync(BOOKMARK_FILE, 'utf8');
      return JSON.parse(data || '[]');
    } catch {
      // if corrupted or empty file, reset it
      writeFileSync(BOOKMARK_FILE, JSON.stringify([]));
      return [];
    }
  }

  private saveBookmarks(data: House[]) {
    writeFileSync(BOOKMARK_FILE, JSON.stringify(data, null, 2));
  }

  @Get()
  getAll(): House[] {
    return this.readBookmarks();
  }

  @Post()
  create(@Body() house: House): House {
    const bookmarks = this.readBookmarks();

    if (!bookmarks.some(b => b.id === house.id)) {
      bookmarks.push(house);
      this.saveBookmarks(bookmarks);
    }

    return house;
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    let bookmarks = this.readBookmarks();
    bookmarks = bookmarks.filter(b => b.id !== id);
    this.saveBookmarks(bookmarks);
    return { deleted: id };
  }
}
