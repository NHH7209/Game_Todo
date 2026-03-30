// src/user/dto/reset-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: '사용자 아이디',
    example: 'testuser',
  })
  username: string;

  @ApiProperty({
    description: '가입 시 등록한 이메일',
    example: 'user@example.com',
  })
  email: string;
}