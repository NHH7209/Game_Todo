// src/shop/shop.controller.ts

import {
  Controller,
  Get,
  Post, // [추가]
  Param, // [추가]
  ParseIntPipe, // [추가]
  UseGuards,
  Request,
} from '@nestjs/common';
import { ShopService } from './shop.service';
import { AuthGuard } from '@nestjs/passport'; // [추가]
import { ApiBearerAuth } from '@nestjs/swagger'; // [추가]

@Controller('shop')
@ApiBearerAuth('access-token') // [수정] 컨트롤러 전체에 인증 적용
@UseGuards(AuthGuard('jwt')) // [수정] 컨트롤러 전체에 '문지기' 배치
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  // --- [추가] 상점 아이템 전체 목록 조회 API ---
  @Get() // GET /shop
  findAllItems() {
    // 모든 사용자가 동일한 목록을 보므로 userId가 필요 없습니다.
    return this.shopService.findAllItems();
  }

  // --- [추가] 아이템 구매 API ---
  @Post(':id/buy') // POST /shop/1/buy (예: 1번 아이템 구매)
  buyItem(@Param('id', ParseIntPipe) itemId: number, @Request() req) {
    const userId = req.user.userId;
    return this.shopService.buyItem(userId, itemId);
  }

  // --- [추가] 내 인벤토리 조회 API ---
  @Get('my-inventory') // GET /shop/my-inventory
  findMyInventory(@Request() req) {
    const userId = req.user.userId;
    return this.shopService.findMyInventory(userId);
  }
}