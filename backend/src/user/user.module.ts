// src/user/user.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy'; // [추가]
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AchievementModule } from '../achievement/achievement.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => AchievementModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule], // ConfigModule을 임포트
      inject: [ConfigService], // ConfigService를 주입받음
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // .env의 JWT_SECRET 사용
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [UserController],
  providers: [UserService, JwtStrategy, GoogleStrategy], // [수정] JwtStrategy 추가
})
export class UserModule {}