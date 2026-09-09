import { LLMProvider, LLMGenerateOptions, AIProviderType } from '../types';

export class ClaudeProvider implements LLMProvider {
  readonly name: AIProviderType = 'claude';
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'claude-3-5-haiku-20241022') {
    this.apiKey = apiKey;
    this.model = process.env.ANTHROPIC_MODEL || process.env.CLAUDE_MODEL || model;
  }

  async generateText(options: LLMGenerateOptions): Promise<string> {
    const url = 'https://api.anthropic.com/v1/messages';

    const userContent = options.jsonMode
      ? `${options.userPrompt}\n\nIMPORTANT: Return ONLY a valid JSON object matching the requested schema. No markdown code blocks, no conversational preamble or postscript.`
      : options.userPrompt;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: options.maxTokens ?? 2048,
        system: options.systemPrompt,
        messages: [{ role: 'user', content: userContent }],
        temperature: options.temperature ?? 0.2,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Claude API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text;
    if (!text) throw new Error('Claude returned empty content');
    return text;
  }

  async generateJSON<T = any>(options: LLMGenerateOptions): Promise<T> {
    const text = await this.generateText({ ...options, jsonMode: true });
    const cleaned = text.replace(/```(?:json)?\n?/g, '').replace(/```\n?$/g, '').trim();
    return JSON.parse(cleaned) as T;
  }
}
