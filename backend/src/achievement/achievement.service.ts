// src/achievement/achievement.service.ts

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AchievementService {
  constructor(private prisma: PrismaService) {}

  // --- [추가] 내 업적 목록 조회 ---
  async findMyAchievements(userId: number) {
    // 1. 'UserAchievement' 테이블에서 내(userId)가 달성한 기록을 찾습니다.
    return this.prisma.userAchievement.findMany({
      where: {
        userId: userId,
      },
      // 2. [중요] 'include'를 사용해 연결된 'Achievement'의 상세 정보
      // (이름, 설명, 배지 이미지)를 함께 가져옵니다.
      include: {
        achievement: {
          select: {
            name: true,
            description: true,
            badgeImage: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // 최근 달성 순으로 정렬
      },
    });
  }

  async findAll() {
    // 'Achievement' 테이블의 모든 항목을 조회합니다.
    return this.prisma.achievement.findMany({
      orderBy: {
        id: 'asc', // ID 순으로 정렬
      },
    });
  }

  // --- [추가] 업적 달성 (완료) ---
  async completeAchievement(userId: number, achievementId: number) {
    // 1. 이미 달성한 업적인지 확인 (중복 방지)
    const existingEntry = await this.prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: { // @@unique([userId, achievementId]) 사용
          userId: userId,
          achievementId: achievementId,
        },
      },
    });

    if (existingEntry) {
      throw new HttpException('이미 달성한 업적입니다.', HttpStatus.CONFLICT); // 409 에러
    }

    // 2. 업적 달성 기록 생성 (UserAchievement 테이블에 추가)
    const newAchievement = await this.prisma.userAchievement.create({
      data: {
        userId: userId,
        achievementId: achievementId,
      },
    });

    return newAchievement;
  }

  // =================================================================
  // [핵심] 내부용 공통 함수: "이름"으로 업적을 찾아 유저에게 지급
  // =================================================================
  private async giveBadge(userId: number, achievementName: string) {
    // 1. 업적 정보 찾기
    const achievement = await this.prisma.achievement.findUnique({
      where: { name: achievementName },
    });
    if (!achievement) return; // DB에 없는 업적이면 무시

    // 2. 이미 가지고 있는지 확인
    const hasBadge = await this.prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId: userId,
          achievementId: achievement.id,
        },
      },
    });

    // 3. 없으면 지급!
    if (!hasBadge) {
      await this.prisma.userAchievement.create({
        data: { userId, achievementId: achievement.id },
      });
    }
  }

  // =================================================================
  // [체커 1] 로그인/출석 관련 업적 체크
  // (로그인 할 때마다 호출)
  // =================================================================
  async checkAttendanceAchievements(userId: number) {
    // 1. "새로운 모험의 시작" (첫 로그인) - 로그인했다는 것 자체가 조건 달성
    await this.giveBadge(userId, '새로운 모험의 시작');

    // 2. 연속 출석 체크
    // (간단하게 구현하기 위해 전체 출석 일수로 체크하겠습니다)
    const attendanceCount = await this.prisma.attendance.count({
      where: { userId },
    });

    if (attendanceCount >= 1) await this.giveBadge(userId, '새로운 모험의 시작');
    if (attendanceCount >= 3) await this.giveBadge(userId, '작심삼일 극복');
    if (attendanceCount >= 7) await this.giveBadge(userId, '성실함의 증명');
    if (attendanceCount >= 30) await this.giveBadge(userId, '한 달의 여정');
  }

  // =================================================================
  // [체커 2] 퀘스트 완료 관련 업적 체크
  // (퀘스트 완료 할 때마다 호출)
  // =================================================================
  async checkQuestAchievements(userId: number) {
    // 완료한 퀘스트 개수 세기
    const completedCount = await this.prisma.quest.count({
      where: { authorId: userId, isCompleted: true }, // authorId가 아니라 userId로 수정 필요할 수도 있음 (Quest 모델 확인)
      // *주의: Quest 모델의 작성자 필드명이 authorId라면 authorId로 검색
    });

    if (completedCount >= 1) await this.giveBadge(userId, '첫 번째 승리');
    if (completedCount >= 10) await this.giveBadge(userId, '숙련된 해결사');
    if (completedCount >= 50) await this.giveBadge(userId, '베테랑 모험가');
    if (completedCount >= 100) await this.giveBadge(userId, '전설의 시작');
  }
}