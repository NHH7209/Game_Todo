// src/user/user.controller.ts

import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInDto } from './dto/sign-in.dto';
import { FindIdDto } from './dto/find-id.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  // 1. 사용자가 이 주소를 치면 구글 로그인 화면으로 이동합니다.
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Request() req) {
    // (자동 리다이렉트되므로 내용 없음)
  }

  // 2. 구글 로그인이 끝나면 구글이 사용자를 이 주소로 다시 보내줍니다.
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Request() req, @Res() res: Response) {
    // 1. 서비스 로직을 실행해서 토큰을 받아옵니다.
    const result = await this.userService.socialLogin(req.user);
    const accessToken = result.access_token;

    // 2. 프론트엔드 주소를 설정합니다. (환경변수로 빼는 것이 좋습니다)
    // 예: 리액트가 5173 포트에서 실행 중이라면
    const frontendUrl = process.env.FRONTEND_URL || 'http://49.50.133.193';
    
    // 3. 토큰을 쿼리 파라미터로 붙여서 리다이렉트합니다.
    // 이동 주소 예시: http://localhost:5173/auth/callback?token=eyJhbGci...
    // 프론트엔드 개발자에게 "이 주소로 보낼 테니 token을 꺼내 써라"고 말해주면 됩니다.
    return res.redirect(
    `${frontendUrl}/login.jsp?social=google&token=${accessToken}`,
    );
  }

  // (기존 signUp)
  @Post('signup')
  signUp(@Body() createUserDto: CreateUserDto) {
    return this.userService.signUp(createUserDto);
  }

  // --- [로그인 엔드포인트 추가] ---
  @Post('signin')
  signIn(@Body() signInDto: SignInDto) {
    return this.userService.signIn(signInDto);
  }

  // 1. 아이디 찾기
  @Post('find-id')
  findId(@Body() findIdDto: FindIdDto) { // 👈 DTO 객체로 통째로 받습니다.
    return this.userService.findId(findIdDto.email); // DTO에서 꺼내서 서비스로 전달
  }

  // --- [수정] 비밀번호 초기화 (DTO 사용) ---
  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) { // 👈 DTO 객체로 통째로 받습니다.
    return this.userService.resetPassword(
      resetPasswordDto.username,
      resetPasswordDto.email,
    );
  }

  // --- [수정] '내 정보' API가 헤더 정보를 반환하도록 변경 ---
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  getMyProfile(@Request() req) {
    const userId = req.user.userId;
    return this.userService.getHeaderInfo(userId);
  }
}