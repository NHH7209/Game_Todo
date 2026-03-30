// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { QuestModule } from './quest/quest.module';
import { AchievementModule } from './achievement/achievement.module';
import { RecordModule } from './record/record.module';
import { ShopModule } from './shop/shop.module';
import { ProfileModule } from './profile/profile.module';
import { SettingModule } from './setting/setting.module';
import { SkillModule } from './skill/skill.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 전역 모듈로 설정
    }),
    PrismaModule,
    UserModule,
    QuestModule,
    AchievementModule,
    RecordModule,
    ShopModule,
    ProfileModule,
    SettingModule,
    SkillModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}