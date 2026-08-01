import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { LinkService } from './link.service';
import { LinkController } from './link.controller';

@Module({
  imports: [PrismaModule],
  controllers: [LinkController],
  providers: [LinkService],
  exports: [LinkService],
})
export class LinkModule {}
