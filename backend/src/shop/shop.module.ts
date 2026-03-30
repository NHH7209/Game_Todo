// src/shop/shop.module.ts

import { Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    PrismaModule, // 1. DB 접근용
    UserModule,   // 2. 인증(AuthGuard)용
  ],
  controllers: [ShopController],
  providers: [ShopService],
})
export class ShopModule {}