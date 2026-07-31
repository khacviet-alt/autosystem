import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { LinkService } from './link.service';

@Module({
  imports: [PrismaModule],
  providers: [LinkService],
  exports: [LinkService],
})
export class LinkModule {}
