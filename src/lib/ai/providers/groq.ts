import OpenAI from 'openai';
import { LLMProvider, LLMGenerateOptions, AIProviderType } from '../types';

export class GroqProvider implements LLMProvider {
  readonly name: AIProviderType = 'groq';
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'llama-3.3-70b-versatile') {
    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });
    this.model = process.env.GROQ_MODEL || model;
  }

  async generateText(options: LLMGenerateOptions): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: options.systemPrompt },
        { role: 'user', content: options.userPrompt },
      ],
      temperature: options.temperature ?? 0.2,
      max_tokens: options.maxTokens,
    });

    return response.choices[0]?.message?.content || '';
  }

  async generateJSON<T = any>(options: LLMGenerateOptions): Promise<T> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: options.systemPrompt },
        { role: 'user', content: options.userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: options.temperature ?? 0.2,
      max_tokens: options.maxTokens,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Groq returned empty response');
    return JSON.parse(content) as T;
  }
}
