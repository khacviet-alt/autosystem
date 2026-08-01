import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { LinkPublicDto, LinkStatus, LinkProvider } from './dto/link-public.dto';

@Injectable()
export class LinkService {
  private readonly logger = new Logger(LinkService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLinkDto, userId: string): Promise<LinkPublicDto> {
    const originalUrl = dto.originalUrl.trim();
    const provider = this.detectProvider(originalUrl);

    try {
      const created = await this.prisma.link.create({
        data: {
          userId,
          originalUrl,
          normalizedUrl: originalUrl,
          provider,
          status: 'CREATED',
        },
      });

      const status = this.mapStatus(created.status);
      const mappedProvider = this.mapProvider(created.provider);

      return new LinkPublicDto({
        id: created.id,
        originalUrl: created.originalUrl,
        normalizedUrl: created.normalizedUrl,
        provider: mappedProvider,
        status,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      });
    } catch (error: unknown) {
      this.logger.error(
        'Error creating link',
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('UNABLE_TO_CREATE_LINK');
    }
  }

  async findAllByUserId(userId: string): Promise<LinkPublicDto[]> {
    try {
      const rows = await this.prisma.link.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return rows.map((r) =>
        new LinkPublicDto({
          id: r.id,
          originalUrl: r.originalUrl,
          normalizedUrl: r.normalizedUrl,
          provider: this.mapProvider(r.provider),
          status: this.mapStatus(r.status),
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        }),
      );
    } catch (error: unknown) {
      this.logger.error(
        `Error fetching links for user ${userId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('UNABLE_TO_FETCH_LINKS');
    }
  }

  async findById(id: string, userId: string): Promise<unknown | null> {
    throw new Error('Not implemented');
  }

  async remove(id: string, userId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  private detectProvider(url: string): LinkProvider {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname === 'shopee.vn' || hostname.endsWith('.shopee.vn')) return 'shopee';
    return 'unknown';
  }

  private mapProvider(value: unknown): LinkProvider {
    switch (String(value)) {
      case 'shopee':
        return 'shopee';
      default:
        this.logger.warn(`Unexpected provider: ${String(value)}, falling back to 'unknown'`);
        return 'unknown';
    }
  }

  private mapStatus(value: unknown): LinkStatus {
    switch (String(value)) {
      case 'CREATED':
        return 'CREATED';
      case 'PROCESSING':
        return 'PROCESSING';
      case 'DONE':
        return 'DONE';
      case 'FAILED':
        return 'FAILED';
      default:
        this.logger.warn(
          `Unexpected link status from DB: ${String(value)}, falling back to CREATED`,
        );
        return 'CREATED';
    }
  }
}
