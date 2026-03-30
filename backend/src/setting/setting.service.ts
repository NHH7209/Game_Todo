// src/setting/setting.service.ts

import { Injectable, HttpException, HttpStatus } from '@nestjs/common'; // [수정]
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingDto } from './dto/update-setting.dto'; // [추가]
import { ChangePasswordDto } from './dto/change-password.dto'; // [추가]
import * as bcrypt from 'bcrypt'; // [추가]

@Injectable()
export class SettingService {
  constructor(private prisma: PrismaService) {}

  // --- [추가] 내 정보 조회 ---
  async getMyInfo(userId: number) {
    // DB에서 'User' 테이블을 조회하되,
    // [중요] 'hashedPassword'는 절대 반환하지 않습니다.
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        address: true,
      },
    });
  }

  // --- [추가] 내 정보 수정 ---
  async updateMyInfo(userId: number, updateSettingDto: UpdateSettingDto) {
    // 1. DB에서 'User' 테이블의 정보를 수정합니다.
    //    DTO에 phone이 없으면 undefined가 전달되며, Prisma는 undefined 필드는 무시합니다.
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        phone: updateSettingDto.phone,
        address: updateSettingDto.address,
      },
      // [중요] 수정된 결과에서 비밀번호는 제외하고 반환합니다.
      select: {
        id: true,
        username: true,
        phone: true,
        address: true,
      },
    });
  }

  // --- [추가] 비밀번호 변경 ---
  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword_1, newPassword_2 } = changePasswordDto;

    // 1. 새 비밀번호 일치 여부 및 유저 조회 (기존 코드)
    if (newPassword_1 !== newPassword_2) {
      throw new HttpException(
        '새 비밀번호가 일치하지 않습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new HttpException(
        '사용자를 찾을 수 없습니다.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (!user.hashedPassword) {
      // 비밀번호가 null이면 (소셜 로그인 유저) 변경을 거부합니다.
      throw new HttpException(
        '소셜 로그인 계정은 비밀번호를 변경할 수 없습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 2. 현재 비밀번호가 맞는지 확인 (이제 TS는 user.hashedPassword가 string임을 보장합니다)
    const isPasswordMatching = await bcrypt.compare(
      currentPassword,
      user.hashedPassword, // 👈 이제 string | null 오류가 사라집니다.
    );

    if (!isPasswordMatching) {
      throw new HttpException(
        '현재 비밀번호가 일치하지 않습니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // 3. 새 비밀번호 암호화 및 저장 (기존 코드 유지)
    const newHashedPassword = await bcrypt.hash(newPassword_1, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        hashedPassword: newHashedPassword,
      },
    });

    return { message: '비밀번호가 성공적으로 변경되었습니다.' };
  }
}
