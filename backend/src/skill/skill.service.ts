// src/skill/skill.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SkillService {
  constructor(private prisma: PrismaService) {}

  async findMySkills(userId: number) {
    return this.prisma.userSkill.findMany({
      where: { userId },
      include: {
        skill: true, // 스킬 상세 정보 포함
      },
    });
  }
}