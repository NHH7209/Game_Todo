// src/user/jwt.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // 1. 헤더에서 토큰 추출
      ignoreExpiration: false, // 2. 토큰 만료 기간 무시 안 함
      secretOrKey: "MySuperSecretKey123!@#"
    });
  }

  // 4. 검증 성공 시 실행됨
  // payload에는 로그인 시 넣었던 { username: user.username, sub: user.id }가 들어옴
  async validate(payload: any) {
    // 이 리턴값이 Controller의 @Request() user 객체에 주입됨
    return { userId: payload.sub, username: payload.username };
  }
}   