// src/record/record.controller.ts

import {
  Controller,
  Get, // [추가]
  UseGuards, // [추가]
  Request, // [추가]
} from '@nestjs/common';
import { RecordService } from './record.service';
import { AuthGuard } from '@nestjs/passport'; // [추가]
import { ApiBearerAuth } from '@nestjs/swagger'; // [추가]

@Controller('record')
@UseGuards(AuthGuard('jwt')) // [인증] '문지기' 배치
@ApiBearerAuth('access-token') // [Swagger] 자물쇠 아이콘
export class RecordController {
  constructor(private readonly recordService: RecordService) {}

  // --- [추가] 출석 통계 조회 API ---
  @Get('attendance') // GET /record/attendance
  getAttendanceStats(@Request() req) {
    // 로그인한 사용자의 ID (req.user.userId)를 서비스로 넘깁니다.
    const userId = req.user.userId;
    return this.recordService.getAttendanceStats(userId);
  }

  // --- [추가] 퀘스트 통계 조회 API ---
  @Get('quest') // GET /record/quest
  getQuestStats(@Request() req) {
    // 로그인한 사용자의 ID (req.user.userId)를 서비스로 넘깁니다.
    const userId = req.user.userId;
    return this.recordService.getQuestStats(userId);
  }
}