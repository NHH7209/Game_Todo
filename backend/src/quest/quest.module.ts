// src/quest/quest.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { QuestService } from './quest.service';
import { QuestController } from './quest.controller';
import { PrismaModule } from '../prisma/prisma.module'; // [추가]
import { UserModule } from '../user/user.module'; // [추가]
import { AchievementModule } from '../achievement/achievement.module';

@Module({
  imports: [
    PrismaModule, // 1. DB에 접근하기 위해
    UserModule,   // 2. 인증(AuthGuard) 기능을 사용하기 위해
    forwardRef(() => AchievementModule),
  ],
  controllers: [QuestController],
  providers: [QuestService],
})
export class QuestModule {}