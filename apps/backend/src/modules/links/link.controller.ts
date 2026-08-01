import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateLinkDto } from './dto/create-link.dto';
import { LinkService } from './link.service';

@Controller('links')
export class LinkController {
  constructor(private readonly linkService: LinkService) {}

  @Post()
  create(@Body() _dto: CreateLinkDto) {
    // Skeleton only: will use linkService once auth is implemented.
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
