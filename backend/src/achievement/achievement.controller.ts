// src/achievement/achievement.controller.ts

import {
  Controller,
  Get,
  Post, // [추가]
  Param, // [추가]
  ParseIntPipe, // [추가]
  UseGuards,
  Request,
} from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { AuthGuard } from '@nestjs/passport'; // [추가]
import { ApiBearerAuth } from '@nestjs/swagger'; // [추가]

@Controller('achievement')
@UseGuards(AuthGuard('jwt')) // [인증] '문지기' 배치
@ApiBearerAuth('access-token') // [Swagger] 자물쇠 아이콘
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}

  // --- [추가] 내 업적 목록 조회 API ---
  @Get('my') // GET /achievement/my
  findMyAchievements(@Request() req) {
    // 로그인한 사용자의 ID (req.user.userId)를 서비스로 넘깁니다.
    const userId = req.user.userId;
    return this.achievementService.findMyAchievements(userId);
  }

  // --- [추가] 모든 업적 마스터 리스트 조회 API ---
  @Get() // GET /achievement
  findAll() {
    // '모든' 업적을 조회하므로 userId가 필요 없습니다.
    return this.achievementService.findAll();
  }

  // --- [추가] 업적 달성 API ---
  @Post(':id/complete') // POST /achievement/1/complete (예: 1번 업적 달성)
  completeAchievement(
    @Param('id', ParseIntPipe) achievementId: number,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.achievementService.completeAchievement(userId, achievementId);
  }
}