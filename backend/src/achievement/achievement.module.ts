// src/achievement/achievement.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { AchievementController } from './achievement.controller';
import { PrismaModule } from '../prisma/prisma.module'; // [추가]
import { UserModule } from '../user/user.module'; // [추가]

@Module({
  imports: [
    PrismaModule, // 1. DB 접근용
    forwardRef(() => UserModule),
  ],
  controllers: [AchievementController],
  providers: [AchievementService],
  exports: [AchievementService], 
})
export class AchievementModule {}