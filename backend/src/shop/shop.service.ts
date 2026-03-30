// src/shop/shop.service.ts

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShopService {
  constructor(private prisma: PrismaService) {}

  // --- [추가] 상점 아이템 전체 목록 조회 ---
  async findAllItems() {
    // 'ShopItem' 테이블의 모든 항목을 조회합니다.
    return this.prisma.shopItem.findMany({
      orderBy: {
        price: 'asc', // 가격순으로 정렬 (낮은 가격부터)
      },
    });
  }

  async buyItem(userId: number, itemId: number) {
    // 1. 아이템 정보 조회 (가격 확인용)
    const item = await this.prisma.shopItem.findUnique({
      where: { id: itemId },
    });
    if (!item) {
      throw new HttpException(
        '존재하지 않는 아이템입니다.',
        HttpStatus.NOT_FOUND,
      );
    }

    // 2. 유저 정보 조회 (현재 골드 확인용)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new HttpException(
        '사용자를 찾을 수 없습니다.',
        HttpStatus.NOT_FOUND,
      );
    }

    // 3. 이미 구매한 아이템인지 확인
    const existingItem = await this.prisma.userInventory.findUnique({
      where: {
        userId_itemId: {
          userId: userId,
          itemId: itemId,
        },
      },
    });
    if (existingItem) {
      throw new HttpException('이미 구매한 아이템입니다.', HttpStatus.CONFLICT);
    }

    // 4. [핵심] 골드 부족 확인
    if (user.gold < item.price) {
      throw new HttpException(
        `골드가 부족합니다. (보유: ${user.gold}G / 필요: ${item.price}G)`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // 5. [트랜잭션] 골드 차감 + 아이템 지급을 한 번에 처리
    return this.prisma.$transaction(async (tx) => {
      // A. 골드 차감
      await tx.user.update({
        where: { id: userId },
        data: { gold: { decrement: item.price } }, // 현재 값에서 차감
      });

      // B. 인벤토리에 아이템 추가
      const newInventoryItem = await tx.userInventory.create({
        data: {
          userId: userId,
          itemId: itemId,
        },
      });

      return newInventoryItem;
    });
  }

  // --- [추가] 내 인벤토리 (구매한 아이템) 조회 ---
  async findMyInventory(userId: number) {
    // 1. 'UserInventory' 테이블에서 내(userId)가 구매한 기록을 찾습니다.
    return this.prisma.userInventory.findMany({
      where: {
        userId: userId,
      },
      // 2. [중요] 'include'를 사용해 연결된 'ShopItem'의 상세 정보
      // (이름, 이미지, 카테고리 등)를 함께 가져옵니다.
      include: {
        item: {
          select: {
            name: true,
            description: true,
            image: true,
            equipSlot: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // 최근 구매 순으로 정렬
      },
    });
  }
}
