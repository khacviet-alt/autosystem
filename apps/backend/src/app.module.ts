import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { JwtModule } from './common/jwt/jwt.module';
import { UserModule } from './modules/users/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './health/health.module';
import { LinkModule } from './modules/links/link.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    PrismaModule,
    JwtModule,
    UserModule,
    AuthModule,
    HealthModule,
    LinkModule, // added per MVP wiring
  ],
})
export class AppModule {}
