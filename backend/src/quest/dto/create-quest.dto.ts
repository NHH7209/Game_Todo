// src/quest/dto/create-quest.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestDto {
  @ApiProperty({ description: '퀘스트(할일) 제목' })
  title: string;

  @ApiProperty({
    description: '퀘스트 상세 설명 (선택 사항)',
    required: false,
  })
  description?: string;
}