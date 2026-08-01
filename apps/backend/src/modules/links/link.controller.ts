import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateLinkDto } from './dto/create-link.dto';

@Controller('links')
export class LinkController {
  @Post()
  create(@Body() _dto: CreateLinkDto) {
    // Skeleton only: do not call LinkService or use a fake user id.
    // Will be implemented after JWT/Auth is integrated.
    throw new Error('Not implemented');
  }

  @Get()
  findAll() {
    // Skeleton only
    throw new Error('Not implemented');
  }

  @Get(':id')
  findById(@Param('id') _id: string) {
    // Skeleton only
    throw new Error('Not implemented');
  }

  @Delete(':id')
  remove(@Param('id') _id: string) {
    // Skeleton only
    throw new Error('Not implemented');
  }
}
