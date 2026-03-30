// src/skill/skill.controller.ts
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { SkillService } from './skill.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('skill')
export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  @Get('my')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  findMySkills(@Request() req) {
    return this.skillService.findMySkills(req.user.userId);
  }

}