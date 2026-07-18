import { Injectable } from '@nestjs/common';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

interface DocumentSection {
  document: string;
  title: string;
  content: string;
}

interface SearchResult extends DocumentSection {
  score: number;
  matchedTerms: string[];
}

@Injectable()
export class AssistantService {
  private readonly stopWords = new Set([
    'a',
    'ao',
    'aos',
    'as',
    'como',
    'com',
    'da',
    'das',
    'de',
    'do',
    'dos',
    'e',
    'em',
    'é',
    'o',
    'os',
    'para',
    'por',
    'qual',
    'quanto',
    'que',
    'um',
    'uma',
  ]);

  ask(question: string) {
    const sections = this.loadDocumentSections();
    const bestResult = this.findBestResult(question, sections);

    if (!bestResult || bestResult.score < 2) {
      return {
        question,
        answer:
          'Não encontrei informações suficientes no documento para responder a essa pergunta.',
        source: null,
        excerpt: null,
        reasoning: 'Nenhum trecho teve relevância.',
      };
    }

    return {
      question,
      answer: bestResult.content,
      source: {
        document: bestResult.document,
        section: bestResult.title,
      },
      excerpt: bestResult.content,
      reasoning: this.buildReasoning(bestResult),
    };
  }

  private loadDocumentSections(): DocumentSection[] {
    const documentsDirectory = join(process.cwd(), 'src', 'documents');

    if (!existsSync(documentsDirectory)) {
      throw new Error(
        `Diretório de documentos não encontrado: ${documentsDirectory}`,
      );
    }

    const files = readdirSync(documentsDirectory).filter((file) =>
      file.endsWith('.md'),
    );

    return files.flatMap((file) => {
      const filePath = join(documentsDirectory, file);
      const content = readFileSync(filePath, 'utf-8');

      return this.splitIntoSections(file, content);
    });
  }

  private splitIntoSections(
    document: string,
    content: string,
  ): DocumentSection[] {
    const lines = content.split(/\r?\n/);

    const sections: DocumentSection[] = [];
    let currentTitle = 'Introdução';
    let currentContent: string[] = [];

    const saveCurrentSection = () => {
      const sectionContent = currentContent.join(' ').trim();

      if (sectionContent) {
        sections.push({
          document,
          title: currentTitle,
          content: sectionContent,
        });
      }
    };

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith('## ')) {
        saveCurrentSection();

        currentTitle = trimmedLine.replace(/^##\s+/, '').trim();
        currentContent = [];
        continue;
      }

      if (trimmedLine.startsWith('# ')) {
        continue;
      }

      if (trimmedLine) {
        currentContent.push(trimmedLine);
      }
    }

    saveCurrentSection();

    return sections;
  }

  private findBestResult(
    question: string,
    sections: DocumentSection[],
  ): SearchResult | null {
    const questionTerms = this.extractRelevantTerms(question);

    const results = sections.map((section) => {
      const normalizedTitle = this.normalizeText(section.title);
      const normalizedContent = this.normalizeText(section.content);

      let score = 0;
      const matchedTerms: string[] = [];

      for (const term of questionTerms) {
        const appearsInTitle = normalizedTitle.includes(term);
        const appearsInContent = normalizedContent.includes(term);

        if (appearsInTitle) {
          score += 3;
        }

        if (appearsInContent) {
          score += 1;
        }

        if (appearsInTitle || appearsInContent) {
          matchedTerms.push(term);
        }
      }

      if (matchedTerms.length >= 2) {
        score += 2;
      }

      return {
        ...section,
        score,
        matchedTerms,
      };
    });

    results.sort((a, b) => b.score - a.score);

    return results[0] ?? null;
  }

  private extractRelevantTerms(text: string): string[] {
    const normalizedText = this.normalizeText(text);

    return [
      ...new Set(
        normalizedText
          .split(/\s+/)
          .filter((term) => term.length > 2)
          .filter((term) => !this.stopWords.has(term)),
      ),
    ];
  }

  private normalizeText(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private buildReasoning(result: SearchResult): string {
    return `O trecho foi selecionado por apresentar correspondência com os termos: ${result.matchedTerms.join(
      ', ',
    )}. Pontuação de relevância: ${result.score}.`;
  }
}
