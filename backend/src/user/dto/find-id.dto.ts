// src/user/dto/find-id.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class FindIdDto {
  @ApiProperty({
    description: '가입 시 등록한 이메일',
    example: 'user@example.com',
  })
  email: string;
}