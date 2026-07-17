import { Injectable } from '@nestjs/common';

@Injectable()
export class AssistantService {
    ask(question: string) {
        return {
            question,
            answer:
                'Esta é uma resposta temporária para confirmar que a rota está funcionando.',
            source: null,
            excerpt: null,
            reasoning:
                'Resposta fixa utilizada antes da implementação da busca nos documentos.',
        };
    }
}