export type LinkStatus = 'CREATED' | 'PROCESSING' | 'DONE' | 'FAILED';
export type LinkProvider = 'shopee' | 'unknown';

export class LinkPublicDto {
  id!: string;
  originalUrl!: string;
  normalizedUrl!: string;
  provider!: LinkProvider;
  status!: LinkStatus;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<LinkPublicDto>) {
    Object.assign(this, partial);
  }
}
