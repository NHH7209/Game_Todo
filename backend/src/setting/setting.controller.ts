// src/setting/setting.controller.ts

import {
  Controller,
  Get,
  Patch,
  Post, // [추가]
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SettingService } from './setting.service';
import { AuthGuard } from '@nestjs/passport'; // [추가]
import { ApiBearerAuth } from '@nestjs/swagger'; // [추가]
import { UpdateSettingDto } from './dto/update-setting.dto'; // [추가]
import { ChangePasswordDto } from './dto/change-password.dto'; // [추가]

@Controller('setting')
@UseGuards(AuthGuard('jwt')) // [인증] '문지기' 배치
@ApiBearerAuth('access-token') // [Swagger] 자물쇠 아이콘
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  // --- [추가] 내 정보 조회 API ---
  @Get() // GET /setting
  getMyInfo(@Request() req) {
    const userId = req.user.userId;
    return this.settingService.getMyInfo(userId);
  }

  // --- [추가] 내 정보 수정 API ---
  @Patch() // PATCH /setting
  updateMyInfo(@Body() updateSettingDto: UpdateSettingDto, @Request() req) {
    const userId = req.user.userId;
    return this.settingService.updateMyInfo(userId, updateSettingDto);
  }

  // --- [추가] 비밀번호 변경 API ---
  @Post('change-password') // POST /setting/change-password
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.settingService.changePassword(userId, changePasswordDto);
  }
}