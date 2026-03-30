import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      // [수정] '!'를 붙여서 값이 무조건 있다고 보장합니다.
      clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: configService.get<string>('GOOGLE_SECRET')!,
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL')!,
      scope: ['email', 'profile'], // 구글에서 받아올 정보들
    });
  }

  // 구글 인증이 성공하면 이 함수가 실행됩니다.
  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const { id, emails } = profile;

    // 여기서 반환한 객체가 req.user에 들어갑니다.
    return {
      provider: 'google',
      socialId: id,
      email: emails && emails.length > 0 ? emails[0].value : null,
      username: `google_${id}`, // 임시 유저네임
    };
  }
}