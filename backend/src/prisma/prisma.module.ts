// src/prisma/prisma.module.ts

import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService], // 'providers'는 이미 되어있을 겁니다.
  exports: [PrismaService], // 👈 여기가 비어있습니다!
})
export class PrismaModule {}