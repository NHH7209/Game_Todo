// src/profile/profile.module.ts

import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { PrismaModule } from '../prisma/prisma.module'; // [추가]
import { UserModule } from '../user/user.module'; // [추가]

@Module({
  imports: [
    PrismaModule, // 1. DB 접근용
    UserModule,   // 2. 인증(AuthGuard)용
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}