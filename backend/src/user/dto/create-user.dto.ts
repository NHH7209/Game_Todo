// src/user/dto/create-user.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: '사용자 아이디',
    example: 'testuser',
  })
  username: string;

  @ApiProperty({
    description: '비밀번호',
    example: '1234',
  })
  password_1: string;

  @ApiProperty({
    description: '비밀번호 확인',
    example: '1234',
  })
  password_2: string;

  // [수정] 이메일을 다시 '필수'로 변경
  @ApiProperty({
    description: '이메일 (필수 - 아이디/비번 찾기용)',
    example: 'user@example.com',
  })
  email: string; // ?(물음표) 제거 -> 필수 입력
}