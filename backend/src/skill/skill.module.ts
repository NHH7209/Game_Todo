import { Module } from '@nestjs/common';
import { SkillService } from './skill.service';
import { SkillController } from './skill.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    PrismaModule, // 1. DB 접근용
    UserModule,   // 2. 인증(AuthGuard)용
  ],
  controllers: [SkillController],
  providers: [SkillService],
})
export class SkillModule {}
