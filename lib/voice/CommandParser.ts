export interface VoiceCommand {
  intent: string;
  action?: string;
  slot?: Record<string, any> | null;
  usage_count: number;
  utterances: Record<string, string[]>;
}

export interface ParsedCommand {
  intent: string;
  action?: string;
  slot?: Record<string, any>;
  confidence: number;
  originalText: string;
}

export interface CommandParserOptions {
  confidenceThreshold: number;
  enableFuzzyMatch: boolean;
  enableRegexExtraction: boolean;
}

export class CommandParser {
  private commands: VoiceCommand[] = [];
  private options: CommandParserOptions;

  constructor(
    commands: VoiceCommand[],
    options: Partial<CommandParserOptions> = {}
  ) {
    this.commands = commands;
    this.options = {
      confidenceThreshold: options.confidenceThreshold ?? 0.6,
      enableFuzzyMatch: options.enableFuzzyMatch ?? true,
      enableRegexExtraction: options.enableRegexExtraction ?? true,
    };
  }

  async parse(text: string, language: string): Promise<ParsedCommand | null> {
    if (!text || typeof text !== 'string') {
      return null;
    }

    const normalizedText = text.toLowerCase().trim();
    console.log('[CommandParser] Parsing:', { text: normalizedText, language });

    const exactMatch = this.findExactMatch(normalizedText, language);
    if (exactMatch) {
      console.log('[CommandParser] Exact match found:', exactMatch.intent);
      return {
        intent: exactMatch.intent,
        action: exactMatch.action,
        slot: exactMatch.slot || undefined,
        confidence: 1.0,
        originalText: text,
      };
    }

    if (this.options.enableRegexExtraction) {
      const regexMatch = this.extractWithRegex(normalizedText, language);
      if (regexMatch) {
        console.log('[CommandParser] Regex match found:', regexMatch.intent);
        return {
          ...regexMatch,
          originalText: text,
        };
      }
    }

    if (this.options.enableFuzzyMatch) {
      const fuzzyMatch = this.findFuzzyMatch(normalizedText, language);
      if (fuzzyMatch && fuzzyMatch.confidence >= this.options.confidenceThreshold) {
        console.log('[CommandParser] Fuzzy match found:', fuzzyMatch.intent, 'confidence:', fuzzyMatch.confidence);
        return {
          ...fuzzyMatch,
          originalText: text,
        };
      }
    }

    console.log('[CommandParser] No match found for:', text);
    return null;
  }

  private findExactMatch(text: string, language: string): VoiceCommand | null {
    for (const command of this.commands) {
      if (!command || !command.utterances) continue;

      const utterances = command.utterances[language as keyof typeof command.utterances] || 
                        command.utterances['en' as keyof typeof command.utterances];
      
      if (!Array.isArray(utterances)) continue;

      for (const utterance of utterances) {
        if (typeof utterance !== 'string') continue;
        const normalizedUtterance = utterance.toLowerCase().trim();
        if (text === normalizedUtterance) {
          return command;
        }
      }
    }
    return null;
  }

  private extractWithRegex(text: string, language: string): ParsedCommand | null {
    // 語言特定的數值抽取規則，含型別標記，支援 12 語言
    const numberPatterns: Record<string, Array<{ type: 'forward' | 'rewind' | 'speed'; regex: RegExp }>> = {
      en: [
        { type: 'forward', regex: /(?:forward|skip|fast\s*forward)\s+(\d+)\s*(?:seconds?|secs?)/i },
        { type: 'rewind', regex: /(?:rewind|back|backward)\s+(\d+)\s*(?:seconds?|secs?)/i },
        { type: 'speed', regex: /(\d+(?:\.\d+)?)\s*(?:x|times)\s*speed/i },
        { type: 'speed', regex: /speed\s+(\d+(?:\.\d+)?)\s*(?:x|times)?/i },
      ],
      'zh-TW': [
        { type: 'forward', regex: /(?:快轉|快進|前進)\s*(\d+)\s*秒/i },
        { type: 'rewind', regex: /(?:倒轉|倒退|後退)\s*(\d+)\s*秒/i },
        { type: 'speed', regex: /(\d+(?:\.\d+)?)\s*倍速/i },
      ],
      'zh-CN': [
        { type: 'forward', regex: /(?:快转|快进|前进)\s*(\d+)\s*秒/i },
        { type: 'rewind', regex: /(?:倒转|倒退|后退)\s*(\d+)\s*秒/i },
        { type: 'speed', regex: /(\d+(?:\.\d+)?)\s*倍速/i },
      ],
      es: [
        { type: 'forward', regex: /(?:avanzar|adelantar)\s*(\d+)\s*segundos?/i },
        { type: 'rewind', regex: /(?:retroceder|atrás)\s*(\d+)\s*segundos?/i },
        { type: 'speed', regex: /(?:velocidad\s*)?(\d+(?:\.\d+)?)\s*x/i },
      ],
      'pt-BR': [
        { type: 'forward', regex: /(?:avançar|pular)\s*(\d+)\s*segundos?/i },
        { type: 'rewind', regex: /(?:retroceder|voltar)\s*(\d+)\s*segundos?/i },
        { type: 'speed', regex: /(?:velocidade\s*)?(\d+(?:\.\d+)?)\s*x/i },
      ],
      pt: [
        { type: 'forward', regex: /(?:avançar|saltar)\s*(\d+)\s*segundos?/i },
        { type: 'rewind', regex: /(?:retroceder|recuar)\s*(\d+)\s*segundos?/i },
        { type: 'speed', regex: /(?:velocidade\s*)?(\d+(?:\.\d+)?)\s*x/i },
      ],
      de: [
        { type: 'forward', regex: /(\d+)\s*Sekunden\s*(?:vorspulen|vor)/i },
        { type: 'rewind', regex: /(\d+)\s*Sekunden\s*(?:zurückspulen|zurück)/i },
        // 逗號小數，先捕獲再轉換
        { type: 'speed', regex: /(\d+(?:[\.,]\d+)?)\s*x\s*Geschwindigkeit/i },
        { type: 'speed', regex: /Geschwindigkeit\s*(\d+(?:[\.,]\d+)?)\s*x/i },
      ],
      fr: [
        { type: 'forward', regex: /(avancer|avance)\s*(\d+)\s*secondes?/i },
        { type: 'rewind', regex: /(reculer|retour)\s*(\d+)\s*secondes?/i },
        { type: 'speed', regex: /(\d+(?:[\.,]\d+)?)\s*x\s*vitesse/i },
        { type: 'speed', regex: /vitesse\s*(\d+(?:[\.,]\d+)?)\s*x/i },
      ],
      ru: [
        { type: 'forward', regex: /(?:перемотать\s*на|вперёд\s*на|вперед\s*на)\s*(\d+)\s*секунд/i },
        { type: 'rewind', regex: /(?:назад\s*на|перемотать\s*назад\s*на)\s*(\d+)\s*секунд/i },
        { type: 'speed', regex: /скорость\s*(\d+(?:[\.,]\d+)?)\s*x/i },
      ],
      ar: [
        { type: 'forward', regex: /(?:تقديم|تخطي)\s*(\d+)\s*ث(?:واني|انية)/i },
        { type: 'rewind', regex: /(?:إرجاع|رجوع)\s*(\d+)\s*ث(?:واني|انية)/i },
        { type: 'speed', regex: /سرعة\s*(\d+(?:\.\d+)?)\s*x/i },
      ],
      ja: [
        { type: 'forward', regex: /(\d+)\s*秒(?:早送り|スキップ)/i },
        { type: 'rewind', regex: /(\d+)\s*秒(?:巻き戻し|戻る)/i },
        { type: 'speed', regex: /(\d+(?:\.\d+)?)\s*倍速/i },
      ],
      ko: [
        { type: 'forward', regex: /(\d+)\s*초\s*(?:빨리감기|건너뛰기)/i },
        { type: 'rewind', regex: /(\d+)\s*초\s*(?:되감기|뒤로)/i },
        { type: 'speed', regex: /(\d+(?:\.\d+)?)\s*배속/i },
      ],
    };

    const patterns = numberPatterns[language] || numberPatterns['en'];

    for (const { type, regex } of patterns) {
      const match = text.match(regex);
      if (match) {
        let raw = match[1];
        // 將歐洲語言逗號小數轉為點
        if (raw && /[,]/.test(raw)) raw = raw.replace(',', '.');
        const value = parseFloat(raw);

        if (type === 'forward') {
          return {
            intent: 'seek_control',
            action: 'forward',
            slot: { seconds: value },
            confidence: 0.9,
            originalText: text,
          };
        }

        if (type === 'rewind') {
          return {
            intent: 'seek_control',
            action: 'rewind',
            slot: { seconds: value },
            confidence: 0.9,
            originalText: text,
          };
        }

        if (type === 'speed') {
          return {
            intent: 'speed_control',
            action: 'set',
            slot: { speed: value },
            confidence: 0.9,
            originalText: text,
          };
        }
      }
    }

    return null;
  }

  private findFuzzyMatch(text: string, language: string): ParsedCommand | null {
    let bestMatch: { command: VoiceCommand; score: number } | null = null;

    for (const command of this.commands) {
      if (!command || !command.utterances) continue;

      const utterances = command.utterances[language as keyof typeof command.utterances] || 
                        command.utterances['en' as keyof typeof command.utterances];
      
      if (!Array.isArray(utterances)) continue;

      for (const utterance of utterances) {
        if (typeof utterance !== 'string') continue;
        const normalizedUtterance = utterance.toLowerCase().trim();
        
        if (text.includes(normalizedUtterance) || normalizedUtterance.includes(text)) {
          const score = this.calculateSimilarity(text, normalizedUtterance);
          if (!bestMatch || score > bestMatch.score) {
            bestMatch = { command, score };
          }
        }
      }
    }

    if (bestMatch && bestMatch.score > 0) {
      return {
        intent: bestMatch.command.intent,
        action: bestMatch.command.action,
        slot: bestMatch.command.slot || undefined,
        confidence: bestMatch.score,
        originalText: text,
      };
    }

    return null;
  }

  private calculateSimilarity(text1: string, text2: string): number {
    if (text1 === text2) return 1.0;
    
    const longer = text1.length > text2.length ? text1 : text2;
    const shorter = text1.length > text2.length ? text2 : text1;
    
    const longerLength = longer.length;
    if (longerLength === 0) return 1.0;
    
    const containsScore = longer.includes(shorter) ? shorter.length / longerLength : 0;
    
    const levenshteinDistance = this.levenshtein(text1, text2);
    const levenshteinScore = (longerLength - levenshteinDistance) / longerLength;
    
    return Math.max(containsScore, levenshteinScore);
  }

  private levenshtein(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  updateCommands(commands: VoiceCommand[]): void {
    this.commands = commands;
  }

  getCommands(): VoiceCommand[] {
    return [...this.commands];
  }
}

let globalParser: CommandParser | null = null;

export function getGlobalCommandParser(): CommandParser {
  if (!globalParser) {
    const commands = require('@/constants/voiceCommands.json').commands || [];
    globalParser = new CommandParser(commands, {
      confidenceThreshold: 0.6,
      enableFuzzyMatch: true,
      enableRegexExtraction: true,
    });
  }
  return globalParser;
}

export function setGlobalCommandParser(parser: CommandParser): void {
  globalParser = parser;
}
