// src/setting/dto/change-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ description: '현재 비밀번호' })
  currentPassword: string;

  @ApiProperty({ description: '새 비밀번호' })
  newPassword_1: string;

  @ApiProperty({ description: '새 비밀번호 확인' })
  newPassword_2: string;
}