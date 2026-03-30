// src/user/user.service.ts

import {
  Injectable,
  HttpException,
  HttpStatus,
  Logger, // [추가]
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AchievementService } from '../achievement/achievement.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'; // [추가] bcrypt 임포트
import * as nodemailer from 'nodemailer'; // [추가]


@Injectable()
export class UserService {
  private transporter;

  constructor(
    private prisma: PrismaService,
    private achievementService: AchievementService,
    private jwtService: JwtService,
  ) {
    // 2. 생성자에서 전송기 초기화 (Gmail 설정)
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER, // .env에서 가져옴
        pass: process.env.MAIL_PASS, // .env에서 가져옴
      },
    });
  }

  // --- [소셜 로그인 로직] ---
  async socialLogin(reqUser: any) {
    if (!reqUser.email) {
       throw new HttpException('구글 계정에 이메일 정보가 없습니다.', HttpStatus.BAD_REQUEST);
    }

    // 1. 이메일로 이미 가입된 유저인지 확인
    let user = await this.prisma.user.findUnique({
      where: { email: reqUser.email },
    });

    // 2. 가입된 유저가 없으면 -> 자동 회원가입 진행
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          username: reqUser.username, // google_12345
          email: reqUser.email,
          provider: reqUser.provider, // 'google'
          socialId: reqUser.socialId,
          hashedPassword: null, // 소셜은 비밀번호 없음
          // 필요한 경우 여기에 기본 exp, gold 등을 설정 가능
        },
      });
    }

    // --- [출석 기록 로직] ---
    
    // [수정 2] 한국 시간(KST) 기준으로 오늘 날짜 구하기
    // UTC 시간에 9시간(32400000ms)을 더해서 계산합니다.
    const offset = 1000 * 60 * 60 * 9; // 9시간
    const koreaNow = new Date((new Date()).getTime() + offset);
    const today = koreaNow.toISOString().split('T')[0]; // "YYYY-MM-DD"

    // 4. 오늘 이미 출석했는지 확인
    const existingAttendance = await this.prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
    });

    // 5. 오늘 첫 로그인인 경우 출석 기록
    if (!existingAttendance) {
      await this.prisma.attendance.create({
        data: {
          userId: user.id,
          date: today,
        },
      });
      // (선택 사항) 출석 보상으로 경험치/골드를 여기서 바로 줄 수도 있습니다!
    }

    // 3. (이미 있든 방금 만들었든) 로그인 처리 -> JWT 토큰 발급
    const payload = { username: user.username, sub: user.id };

    this.achievementService.checkAttendanceAchievements(user.id);
    
    return {
      message: '소셜 로그인 성공',
      access_token: this.jwtService.sign(payload),
    };
  }

  // --- [회원가입 로직 추가] ---
  async signUp(createUserDto: CreateUserDto) {
    const { username, password_1, password_2, email } = createUserDto; // email 추가

    // 1. 비밀번호 확인
    if (password_1 !== password_2) {
      throw new HttpException('비밀번호가 일치하지 않습니다.', HttpStatus.BAD_REQUEST);
    }

    // 2. 유저 아이디 중복 확인
    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });
    if (existingUser) {
      throw new HttpException('이미 존재하는 아이디입니다.', HttpStatus.CONFLICT);
    }

    // [수정] 3. 이메일 중복 확인 (이메일이 입력된 경우에만!)
    if (email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email },
      });
      if (existingEmail) {
        throw new HttpException('이미 등록된 이메일입니다.', HttpStatus.CONFLICT);
      }
    }

    // 4. 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password_1, 10);

    // 5. 유저 생성
    const newUser = await this.prisma.user.create({
      data: {
        username,
        hashedPassword,
        email: email, // 입력 없으면 null 저장
      },
    });

    return { message: '회원가입 성공!', userId: newUser.id };
  }

  // --- [로그인 로직 추가] ---
  async signIn(signInDto: SignInDto) { // any 대신 DTO 사용 권장
    const { username, password } = signInDto;

    // 1. 유저 조회
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    // [수정 1] 유저가 없거나, 소셜 유저(비번 없음)인 경우 처리
    if (!user) {
      throw new HttpException(
        '아이디 또는 비밀번호가 잘못되었습니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // 소셜 로그인 유저는 비밀번호가 없으므로 여기서 막아야 합니다.
    if (!user.hashedPassword) {
      throw new HttpException(
        '소셜 계정(구글 등)으로 가입된 회원입니다. 소셜 로그인을 이용해주세요.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 2. 비밀번호 비교
    const isPasswordMatching = await bcrypt.compare(
      password,
      user.hashedPassword,
    );

    if (!isPasswordMatching) {
      throw new HttpException(
        '아이디 또는 비밀번호가 잘못되었습니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // --- [출석 기록 로직] ---
    
    // [수정 2] 한국 시간(KST) 기준으로 오늘 날짜 구하기
    // UTC 시간에 9시간(32400000ms)을 더해서 계산합니다.
    const offset = 1000 * 60 * 60 * 9; // 9시간
    const koreaNow = new Date((new Date()).getTime() + offset);
    const today = koreaNow.toISOString().split('T')[0]; // "YYYY-MM-DD"

    // 4. 오늘 이미 출석했는지 확인
    const existingAttendance = await this.prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
    });

    // 5. 오늘 첫 로그인인 경우 출석 기록
    if (!existingAttendance) {
      await this.prisma.attendance.create({
        data: {
          userId: user.id,
          date: today,
        },
      });
      // (선택 사항) 출석 보상으로 경험치/골드를 여기서 바로 줄 수도 있습니다!
    }


    // 6. JWT 발급
    const payload = { username: user.username, sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    this.achievementService.checkAttendanceAchievements(user.id);

    return {
      message: '로그인 성공!',
      access_token: accessToken,
      // (선택) 프론트엔드가 오늘 출석 여부를 바로 알면 좋으니 이것도 주면 좋습니다.
      isAttendanceChecked: !existingAttendance, 
    };
  }

// --- [수정] 아이디 찾기 (진짜 메일 발송) ---
  async findId(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new HttpException('가입된 이메일이 아닙니다.', HttpStatus.NOT_FOUND);
    }
    if (user.provider !== 'local') {
      throw new HttpException('소셜 로그인 유저입니다.', HttpStatus.BAD_REQUEST);
    }

    // [수정] 메일 발송
    await this.transporter.sendMail({
      from: process.env.MAIL_USER, // 보내는 사람
      to: email,                   // 받는 사람
      subject: '[Gamified Planner] 아이디 찾기 안내', // 제목
      text: `회원님의 아이디는 "${user.username}" 입니다.`, // 내용
    });

    return { message: '이메일로 아이디를 전송했습니다.' };
  }

  // --- [수정] 비밀번호 초기화 (진짜 메일 발송) ---
  async resetPassword(username: string, email: string) {
    const user = await this.prisma.user.findUnique({
      where: { username, email },
    });

    if (!user) {
      throw new HttpException('사용자 정보를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }
    if (user.provider !== 'local') {
      throw new HttpException('소셜 계정은 비밀번호를 초기화할 수 없습니다.', HttpStatus.BAD_REQUEST);
    }

    // 1. 임시 비밀번호 생성
    const tempPassword = Math.random().toString(36).slice(-8);
    
    // 2. DB 업데이트
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { hashedPassword },
    });

    // 3. [수정] 메일 발송
    await this.transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: '[Gamified Planner] 임시 비밀번호 안내',
      text: `회원님의 임시 비밀번호는 "${tempPassword}" 입니다.\n로그인 후 반드시 비밀번호를 변경해주세요.`,
    });

    return { message: '이메일로 임시 비밀번호를 전송했습니다.' };
  }

  // --- [추가] 상단 헤더 정보 조회 ---
  async getHeaderInfo(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        exp: true,
        gold: true,
        gem: true,
        // (프로필 사진 필드를 추가했다면 'profileImage: true' 등)
      },
    });
  }
}