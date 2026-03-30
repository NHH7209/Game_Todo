// src/setting/dto/update-setting.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSettingDto {
  @ApiProperty({
    description: '변경할 전화번호 (선택 사항)',
    required: false,
  })
  phone?: string;

  @ApiProperty({
    description: '변경할 주소 (선택 사항)',
    required: false,
  })
  address?: string;
}