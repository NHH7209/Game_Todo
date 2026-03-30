// src/record/record.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecordService {
  constructor(private prisma: PrismaService) {}

  // --- [추가] 출석 통계 조회 ---
  async getAttendanceStats(userId: number) {
    // 1. 내 출석 기록 가져오기 (최신순 정렬)
    const records = await this.prisma.attendance.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      select: { date: true }, // "YYYY-MM-DD"
    });

    const totalDays = records.length;
    let consecutiveDays = 0;

    if (totalDays > 0) {
      // 한국 시간 기준 오늘 날짜 구하기
      const offset = 1000 * 60 * 60 * 9;
      const todayDate = new Date(new Date().getTime() + offset);
      const todayStr = todayDate.toISOString().split('T')[0];

      // 어제 날짜 구하기
      const yesterdayDate = new Date(todayDate);
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

      // 가장 최근 출석일
      const lastAttended = records[0].date;

      // [로직] 최근 출석이 '오늘'도 아니고 '어제'도 아니면 -> 연속 출석 깨짐 (0일)
      if (lastAttended !== todayStr && lastAttended !== yesterdayStr) {
        consecutiveDays = 0;
      } else {
        // 연속 출석 계산 시작
        // 기준일: 가장 최근 출석일부터 시작
        let checkDate = new Date(lastAttended); 

        for (const record of records) {
          const recordDateStr = record.date;
          const checkDateStr = checkDate.toISOString().split('T')[0];

          if (recordDateStr === checkDateStr) {
            // 날짜가 일치하면 연속 출석 +1
            consecutiveDays++;
            // 다음 비교를 위해 하루 전으로 이동
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            // 날짜가 이어지지 않으면 중단
            break;
          }
        }
      }
    }

    return {
      totalDays,
      consecutiveDays,
      records: records.map((r) => r.date),
    };
  }

  // --- [추가] 퀘스트 완료 통계 조회 ---
  async getQuestStats(userId: number) {
    // 1. 한국 시간 기준 '오늘의 시작'과 '끝' 구하기
    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000; // 9시간 (밀리초)
    
    // 한국 시간으로 변환된 현재 날짜
    const kstDate = new Date(now.getTime() + kstOffset);
    
    // 오늘의 시작 (00:00:00 KST) -> 다시 UTC로 변환
    const startOfTodayKST = new Date(kstDate.toISOString().split('T')[0] + 'T00:00:00.000Z');
    const startOfTodayUTC = new Date(startOfTodayKST.getTime() - kstOffset);

    // 오늘의 끝 (23:59:59 KST) -> 다시 UTC로 변환
    const endOfTodayKST = new Date(kstDate.toISOString().split('T')[0] + 'T23:59:59.999Z');
    const endOfTodayUTC = new Date(endOfTodayKST.getTime() - kstOffset);

    // 2. DB 카운팅 (최적화)
    // Promise.all로 3개의 쿼리를 동시에 실행해서 속도를 높입니다.
    const [totalQuests, completedQuests, completedToday] = await Promise.all([
      // A. 총 퀘스트 수
      this.prisma.quest.count({
        where: { authorId: userId },
      }),

      // B. 총 완료 퀘스트 수
      this.prisma.quest.count({
        where: { 
          authorId: userId, 
          isCompleted: true 
        },
      }),

      // C. [수정] '오늘' 완료한 퀘스트 수 (completedAt 기준)
      this.prisma.quest.count({
        where: {
          authorId: userId,
          isCompleted: true,
          completedAt: {
            gte: startOfTodayUTC, // 오늘 0시 이후
            lte: endOfTodayUTC,   // 오늘 23시 59분 이전
          },
        },
      }),
    ]);

    return {
      totalQuests,
      completedQuests,
      completedToday,
    };
  }
}