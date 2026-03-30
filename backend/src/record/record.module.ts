// src/record/record.module.ts

import { Module } from '@nestjs/common';
import { RecordService } from './record.service';
import { RecordController } from './record.controller';
import { PrismaModule } from '../prisma/prisma.module'; // [추가]
import { UserModule } from '../user/user.module'; // [추가]

@Module({
  imports: [
    PrismaModule, // 1. DB 접근용
    UserModule,   // 2. 인증(AuthGuard)용
  ],
  controllers: [RecordController],
  providers: [RecordService],
})
export class RecordModule {}