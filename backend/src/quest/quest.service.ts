import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateQuestDto } from './dto/create-quest.dto';
import { UpdateQuestDto } from './dto/update-quest.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config'; // ConfigService 임포트
import { AchievementService } from '../achievement/achievement.service';
import { GoogleGenerativeAI } from '@google/generative-ai'; // [추가] Gemini SDK
import { Difficulty } from '@prisma/client';

@Injectable()
export class QuestService {
private genAI: GoogleGenerativeAI;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private achievementService: AchievementService,
  ) {
    // 1. 생성자에서 Gemini 클라이언트 초기화
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  // ==================================================================
  // [핵심] AI 분석 전용 함수 (create와 update에서 공통으로 사용)
  // ==================================================================
  private async analyzeQuest(title: string, description?: string | null) {
    const result = {
      rewardExp: 10,
      rewardGold: 5,
      rewardSkillId: null as number | null,
      difficulty: Difficulty.NORMAL as Difficulty
    };

    try {
      if (this.genAI) {
        // 1. 스킬 목록 조회
        const availableSkills = await this.prisma.skill.findMany({
          select: { id: true, name: true, description: true },
        });

        const skillListText = availableSkills
          .map((s) => `ID ${s.id}: ${s.name} (${s.description})`)
          .join('\n');

        const model = this.genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          generationConfig: { responseMimeType: 'application/json' },
        });

        // [수정] 프롬프트에 Difficulty 관련 지시사항 추가
        const prompt = `
          You are a game master. Analyze the quest and determine difficulty and rewards.
          
          Quest Info:
          - Title: ${title}
          Description: ${description || 'None'}

          Available Skills List:
          ${skillListText}

          Instructions:
          1. Determine 'difficulty' level among: 'EASY', 'NORMAL', 'HARD'.
          2. Based on the difficulty, determine 'rewardExp' and 'rewardGold'.
             - EASY: 10-30 exp, 5-15 gold
             - NORMAL: 30-70 exp, 15-40 gold
             - HARD: 70-150 exp, 40-100 gold
          3. Select the most relevant 'rewardSkillId'.

          Output JSON schema:
          { 
            "difficulty": "string", 
            "rewardExp": number, 
            "rewardGold": number, 
            "rewardSkillId": number | null 
          }
        `;

        const aiResponse = await model.generateContent(prompt);
        const text = aiResponse.response.text();
        const data = JSON.parse(text);

        // 결과 적용
        if (data.rewardExp) result.rewardExp = data.rewardExp;
        if (data.rewardGold) result.rewardGold = data.rewardGold;

        if (data.difficulty && Object.values(Difficulty).includes(data.difficulty)) {
          result.difficulty = data.difficulty as Difficulty;
        }

        // 스킬 ID 유효성 검증
        if (data.rewardSkillId) {
          const isValid = availableSkills.some((s) => s.id === data.rewardSkillId);
          if (isValid) result.rewardSkillId = data.rewardSkillId;
        }
      }
    } catch (error) {
      console.error('Gemini Analysis Error:', error);
    }

    return result;
  }

  // --- [수정] 퀘스트 생성 ---
  async create(createQuestDto: CreateQuestDto, userId: number) {
    const { title, description } = createQuestDto;
    const rewards = await this.analyzeQuest(title, description);

    return this.prisma.quest.create({
      data: {
        title,
        description,
        rewardExp: rewards.rewardExp,
        rewardGold: rewards.rewardGold,
        rewardSkillId: rewards.rewardSkillId,
        difficulty: rewards.difficulty, // 👈 [추가] 난이도 저장
        authorId: userId,
      },
    });
  }

  // --- [수정] 퀘스트 수정 (보상 재계산 로직 추가) ---
  async update(questId: number, updateQuestDto: UpdateQuestDto, userId: number) {
    const oldQuest = await this.findOne(questId, userId);

    // 1. 이미 완료된 퀘스트는 수정 불가 (선택 사항 - 정책에 따라 다름)
    if (oldQuest.isCompleted) {
      throw new HttpException('이미 완료된 퀘스트는 수정할 수 없습니다.', HttpStatus.BAD_REQUEST);
    }

    // 2. 내용 변경 확인 및 AI 재평가
    const isContentChanged =
      (updateQuestDto.title && updateQuestDto.title !== oldQuest.title) ||
      (updateQuestDto.description !== undefined && updateQuestDto.description !== oldQuest.description);

    let newRewards = {};

    if (isContentChanged) {
      const targetTitle = updateQuestDto.title || oldQuest.title;
      const targetDesc = updateQuestDto.description !== undefined 
        ? updateQuestDto.description 
        : oldQuest.description;

      newRewards = await this.analyzeQuest(targetTitle, targetDesc);
    }

    // 3. 단순 업데이트 수행 (보상 지급 로직 제거됨)
    return this.prisma.quest.update({
      where: { id: questId },
      data: {
        title: updateQuestDto.title,
        description: updateQuestDto.description,
        ...newRewards, // AI가 다시 계산한 보상 적용
      },
    });
  }

  // --- [신규] 퀘스트 완료 처리 (보상 지급 전용) ---
  async complete(questId: number, userId: number) {
    const quest = await this.findOne(questId, userId);

    // 1. 이미 완료된 퀘스트인지 확인
    if (quest.isCompleted) {
      throw new HttpException('이미 완료된 퀘스트입니다.', HttpStatus.CONFLICT);
    }

    // 2. 트랜잭션으로 상태 변경 + 보상 지급
    const completedQuest = await this.prisma.$transaction(async (tx) => {
      // 2-1. 퀘스트 완료 상태로 변경
      const updated = await tx.quest.update({
        where: { id: questId },
        data: { 
          isCompleted: true,
          completedAt: new Date(),
        },
      });

      // 2-2. 사용자에게 경험치/골드 지급
      await tx.user.update({
        where: { id: userId },
        data: {
          exp: { increment: quest.rewardExp },
          gold: { increment: quest.rewardGold },
        },
      });

      // 2-3. 스킬(자격증) 보상 지급
      if (quest.rewardSkillId) {
        const existingSkill = await tx.userSkill.findUnique({
          where: {
            userId_skillId: { userId, skillId: quest.rewardSkillId },
          },
        });
        if (!existingSkill) {
          await tx.userSkill.create({
            data: { userId, skillId: quest.rewardSkillId },
          });
        }
      }

      return updated;
    });

    // 3. [이벤트 트리거] 업적 달성 여부 체크 (트랜잭션 밖에서 실행)
    // (async로 돌려서 사용자 응답 속도를 빠르게 유지)
    this.achievementService.checkQuestAchievements(userId);

    return completedQuest;
  }

  async findAll(userId: number) {
    // DB에서 authorId가 로그인한 userId와 일치하는 퀘스트만 찾습니다.
    return this.prisma.quest.findMany({
      where: {
        authorId: userId,
      },
      orderBy: {
        createdAt: 'desc', // 최신순으로 정렬
      },
    });
  }

// --- [추가] 퀘스트 1개 조회 (본인 것만) ---
  async findOne(questId: number, userId: number) {
    const quest = await this.prisma.quest.findUnique({
      where: { id: questId },
    });

    // 1. 퀘스트가 없거나
    // 2. 퀘스트의 주인(authorId)이 로그인한 사용자(userId)가 아닌 경우
    if (!quest || quest.authorId !== userId) {
      throw new HttpException('퀘스트를 찾을 수 없거나 권한이 없습니다.', HttpStatus.NOT_FOUND); // 404 에러
    }

    return quest;
  }

  // --- [추가] 퀘스트 삭제 (본인 것만) ---
  async remove(questId: number, userId: number) {
    // 1. 먼저 퀘스트가 내 것인지 확인 (findOne 로직 재사용)
    //    (내 것이 아니면 findOne에서 404 에러가 발생)
    await this.findOne(questId, userId);

    // 2. 내 것이 맞으면 삭제 진행
    await this.prisma.quest.delete({
      where: { id: questId },
    });

    return { message: '퀘스트가 성공적으로 삭제되었습니다.' };
  }
}
