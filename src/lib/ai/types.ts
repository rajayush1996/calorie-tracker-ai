export type AIProviderType = 'openai' | 'gemini' | 'claude' | 'groq';

export interface LLMGenerateOptions {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface LLMProvider {
  readonly name: AIProviderType;
  generateText(options: LLMGenerateOptions): Promise<string>;
  generateJSON<T = any>(options: LLMGenerateOptions): Promise<T>;
}

export interface FactoryConfig {
  preferredProvider?: AIProviderType;
  customApiKey?: string;
}
