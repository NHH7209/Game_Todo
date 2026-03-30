import { ApiProperty, PartialType } from '@nestjs/swagger'; // [수정] ApiProperty 추가
import { CreateQuestDto } from './create-quest.dto';

export class UpdateQuestDto extends PartialType(CreateQuestDto) {
  // PartialType(CreateQuestDto)가 title과 description을
  // ?(선택적) 필드로 자동 변환해 줍니다.

  // [추가] isCompleted 필드를 수동으로 추가합니다.
  @ApiProperty({
    description: '퀘스트 완료 여부 (선택 사항)',
    required: false,
  })
  isCompleted?: boolean; // ?를 붙여 선택적 필드로 만듭니다.
}