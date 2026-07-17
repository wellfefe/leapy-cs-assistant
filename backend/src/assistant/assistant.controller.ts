import { Body, Controller, Post } from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { AskQuestionDto } from './dto/ask-question.dto';

@Controller('assistant')
export class AssistantController {
    constructor(private readonly assistantService: AssistantService) { }

    @Post('ask')
    ask(@Body() body: AskQuestionDto) {
        return this.assistantService.ask(body.question);
    }
}