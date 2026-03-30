import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  // NestJS 앱이 시작될 때 딱 한 번 실행됩니다.
  async onModuleInit() {
    // DB에 연결을 시도합니다.
    await this.$connect();
  }
}