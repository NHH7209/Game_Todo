import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  UseGuards, // [추가]
  Request, // [추가]
  ParseIntPipe,

} from '@nestjs/common';
import { QuestService } from './quest.service';
import { CreateQuestDto } from './dto/create-quest.dto';
import { UpdateQuestDto } from './dto/update-quest.dto';
import { AuthGuard } from '@nestjs/passport'; // [추가]
import { ApiBearerAuth } from '@nestjs/swagger'; // [추가]

@ApiBearerAuth('access-token') // [추가] Swagger에 자물쇠 아이콘 표시
@UseGuards(AuthGuard('jwt')) // 👈 [추가] 이 컨트롤러 전체를 '문지기'가 지킵니다!
@Controller('quest')
export class QuestController {
  constructor(private readonly questService: QuestService) {}

  @Post()
  create(@Body() createQuestDto: CreateQuestDto, @Request() req) {
    // [수정] req.user (로그인한 사용자 정보)에서 userId를 가져옵니다.
    const userId = req.user.userId;
    return this.questService.create(createQuestDto, userId);
  }

  @Get()
  findAll(@Request() req) {
    // 로그인한 사용자의 ID (req.user.userId)를 서비스로 넘깁니다.
    const userId = req.user.userId;
    return this.questService.findAll(userId);
  }

  // --- [수정] 퀘스트 1개 조회 ---
  // GET /quest/1 (예: 1번 퀘스트)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) questId: number, @Request() req) {
    // [수정] questId와 userId를 서비스로 넘깁니다.
    // ParseIntPipe: URL 파라미터 'id'를 숫자(number)로 자동 변환해 줍니다.
    const userId = req.user.userId;
    return this.questService.findOne(questId, userId);
  }

  // --- [수정] 퀘스트 내용 수정 ---
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) questId: number,
    @Body() updateQuestDto: UpdateQuestDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    // DTO에서 isCompleted가 들어와도 서비스에서 무시하거나 DTO를 수정해서 빼버리는 게 좋습니다.
    return this.questService.update(questId, updateQuestDto, userId);
  }

  // --- [신규] 퀘스트 완료 처리 ---
  @Patch(':id/complete')
  complete(@Param('id', ParseIntPipe) questId: number, @Request() req) {
    const userId = req.user.userId;
    return this.questService.complete(questId, userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) questId: number, @Request() req) {
    const userId = req.user.userId;
    return this.questService.remove(questId, userId);
  }
}
