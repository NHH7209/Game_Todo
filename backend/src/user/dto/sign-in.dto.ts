// src/user/dto/sign-in.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({
    description: '사용자 아이디',
    example: 'testuser',
  })
  username: string;

  @ApiProperty({
    description: '비밀번호',
    example: '1234',
  })
  password: string;
}