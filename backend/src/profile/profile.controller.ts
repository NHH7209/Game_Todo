// src/profile/profile.controller.ts

import {
  Controller,
  Get,
  Patch, // [추가]
  Param, // [추가]
  ParseIntPipe, // [추가]
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AuthGuard } from '@nestjs/passport'; // [추가]
import { ApiBearerAuth } from '@nestjs/swagger'; // [추가]

@Controller('profile')
@UseGuards(AuthGuard('jwt')) // [인증] '문지기' 배치
@ApiBearerAuth('access-token') // [Swagger] 자물쇠 아이콘
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // --- [추가] 내 프로필 (장착 아이템) 조회 API ---
  @Get() // GET /profile
  getEquippedProfile(@Request() req) {
    // 로그인한 사용자의 ID (req.user.userId)를 서비스로 넘깁니다.
    const userId = req.user.userId;
    return this.profileService.getEquippedProfile(userId);
  }

  // --- [추가] 아이템 장착 API ---
  // PATCH /profile/item/5/equip (예: 내 인벤토리 5번 항목 장착)
  @Patch('item/:id/equip')
  equipItem(@Param('id', ParseIntPipe) userInventoryId: number, @Request() req) {
    const userId = req.user.userId;
    return this.profileService.equipItem(userId, userInventoryId);
  }

  // --- [추가] 업적(배지) 장착 API ---
  // PATCH /profile/achievement/3/equip (예: 내 3번 달성 기록 장착)
  @Patch('achievement/:id/equip')
  equipAchievement(
    @Param('id', ParseIntPipe) userAchievementId: number,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.profileService.equipAchievement(userId, userAchievementId);
  }

  // --- [추가] 아이템 장착 해제 API ---
  @Patch('item/:id/unequip')
  unequipItem(@Param('id', ParseIntPipe) userInventoryId: number, @Request() req) {
    const userId = req.user.userId;
    return this.profileService.unequipItem(userId, userInventoryId);
  }

  // --- [추가] 업적(배지) 장착 해제 API ---
  @Patch('achievement/:id/unequip')
  unequipAchievement(
    @Param('id', ParseIntPipe) userAchievementId: number,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.profileService.unequipAchievement(userId, userAchievementId);
  }
}