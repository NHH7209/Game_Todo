// src/profile/profile.service.ts

import { Injectable, HttpException, HttpStatus } from '@nestjs/common'; // [수정]
import { PrismaService } from '../prisma/prisma.service';
import { EquipSlot } from '@prisma/client';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  // --- [추가] 장착 중인 프로필 조회 ---
  async getEquippedProfile(userId: number) {
    // 1. 장착 중인 아이템(인벤토리) 조회
    const equippedItems = await this.prisma.userInventory.findMany({
      where: {
        userId: userId,
        isEquipped: true, // 👈 장착한 것만
      },
      include: {
        item: { // 아이템 상세 정보 포함
          select: {
            name: true,
            image: true,
            category: true,
          },
        },
      },
    });

    // 2. 장착 중인 업적(배지) 조회
    const equippedAchievements = await this.prisma.userAchievement.findMany({
      where: {
        userId: userId,
        isEquipped: true, // 👈 장착한 것만
      },
      include: {
        achievement: { // 업적 상세 정보 포함
          select: {
            name: true,
            badgeImage: true,
          },
        },
      },
    });

    // 3. (확장용) User 테이블에서 칭호 등 다른 정보도 가져올 수 있습니다.
    // const userProfile = await this.prisma.user.findUnique({
    //   where: { id: userId },
    //   select: { username: true, equippedTitle: true }
    // });

    return {
      equippedItems: equippedItems,
      equippedAchievements: equippedAchievements,
    };
  }

  // --- [추가] 아이템 장착하기 ---
  async equipItem(userId: number, userInventoryId: number) {
    // 1. 내가 소유한 아이템인지 확인 + 아이템의 '장착 슬롯' 정보 가져오기
    const inventoryItem = await this.prisma.userInventory.findUnique({
      where: {
        id: userInventoryId,
        userId: userId,
      },
      include: {
        item: { select: { equipSlot: true, name: true } }, // equipSlot 가져오기
      },
    });

    if (!inventoryItem) {
      throw new HttpException('아이템을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }

    const slot = inventoryItem.item.equipSlot;

    // [예외 처리] 장착 불가능한 아이템인 경우
    if (slot === EquipSlot.NONE) {
      throw new HttpException('이 아이템은 장착할 수 없습니다.', HttpStatus.BAD_REQUEST);
    }

    // 2. [핵심] "나의 인벤토리 중", "지금 장착하려는 아이템과 같은 슬롯"인 아이템들을 찾아서 해제
    // 예: 내가 '투구(HEAD)'를 끼려는데 이미 '모자(HEAD)'를 끼고 있다면 모자를 벗김
    
    // (주의: UserInventory 자체에는 equipSlot 정보가 없으므로, item 관계를 통해 필터링해야 합니다)
    // Prisma에서는 relation 필터링을 이렇게 합니다.
    await this.prisma.userInventory.updateMany({
      where: {
        userId: userId,
        isEquipped: true, // 현재 장착 중인 것들 중에서
        item: {
          equipSlot: slot, // 슬롯이 겹치는 것만!
        },
      },
      data: {
        isEquipped: false, // 장착 해제
      },
    });

    // 3. 선택한 아이템 장착
    return this.prisma.userInventory.update({
      where: { id: userInventoryId },
      data: { isEquipped: true },
    });
  }

  // --- [추가] 업적(배지) 장착하기 ---
  async equipAchievement(userId: number, userAchievementId: number) {
    // 1. 내가 달성한 업적(userAchievementId)이 맞는지 확인
    const achievementToEquip = await this.prisma.userAchievement.findUnique({
      where: {
        id: userAchievementId,
        userId: userId, // 내가 달성한 것만
      },
    });

    if (!achievementToEquip) {
      throw new HttpException('업적을 찾을 수 없거나 권한이 없습니다.', HttpStatus.NOT_FOUND);
    }

    // 2. [핵심] 기존에 장착 중이던 배지를 모두 '장착 해제'시킵니다.
    // (아이템과 달리 업적(배지)은 카테고리가 1개)
    await this.prisma.userAchievement.updateMany({
      where: {
        userId: userId,
        isEquipped: true,
      },
      data: {
        isEquipped: false, // 모두 장착 해제
      },
    });

    // 3. 방금 선택한 업적만 '장착' 상태로 변경합니다.
    return this.prisma.userAchievement.update({
      where: {
        id: userAchievementId,
      },
      data: {
        isEquipped: true,
      },
    });
  }

  // --- [추가] 아이템 장착 해제 ---
  async unequipItem(userId: number, userInventoryId: number) {
    // 1. 내가 소유한 아이템(userInventoryId)이 맞는지 확인
    const itemToUnequip = await this.prisma.userInventory.findUnique({
      where: {
        id: userInventoryId,
        userId: userId, // 내가 소유한 것만
      },
    });

    if (!itemToUnequip) {
      throw new HttpException('아이템을 찾을 수 없거나 권한이 없습니다.', HttpStatus.NOT_FOUND);
    }

    // 2. 해당 아이템만 '장착 해제' 상태로 변경합니다.
    return this.prisma.userInventory.update({
      where: {
        id: userInventoryId,
      },
      data: {
        isEquipped: false,
      },
    });
  }

  // --- [추가] 업적(배지) 장착 해제 ---
  async unequipAchievement(userId: number, userAchievementId: number) {
    // 1. 내가 달성한 업적(userAchievementId)이 맞는지 확인
    const achievementToUnequip = await this.prisma.userAchievement.findUnique({
      where: {
        id: userAchievementId,
        userId: userId, // 내가 달성한 것만
      },
    });

    if (!achievementToUnequip) {
      throw new HttpException('업적을 찾을 수 없거나 권한이 없습니다.', HttpStatus.NOT_FOUND);
    }

    // 2. 해당 업적만 '장착 해제' 상태로 변경합니다.
    return this.prisma.userAchievement.update({
      where: {
        id: userAchievementId,
      },
      data: {
        isEquipped: false,
      },
    });
  }
}