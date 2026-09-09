import { LLMProvider, LLMGenerateOptions, AIProviderType } from '../types';

export class GeminiProvider implements LLMProvider {
  readonly name: AIProviderType = 'gemini';
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'gemini-1.5-flash') {
    this.apiKey = apiKey;
    this.model = process.env.GEMINI_MODEL || model;
  }

  async generateText(options: LLMGenerateOptions): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const body: Record<string, any> = {
      contents: [
        {
          role: 'user',
          parts: [{ text: options.userPrompt }],
        },
      ],
      systemInstruction: {
        parts: [{ text: options.systemPrompt }],
      },
      generationConfig: {
        temperature: options.temperature ?? 0.2,
      },
    };

    if (options.jsonMode) {
      body.generationConfig.responseMimeType = 'application/json';
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('Gemini API returned no valid content candidates');
    }

    return candidateText;
  }

  async generateJSON<T = any>(options: LLMGenerateOptions): Promise<T> {
    const text = await this.generateText({ ...options, jsonMode: true });
    // Clean potential markdown wrappers like ```json ... ```
    const cleaned = text.replace(/```(?:json)?\n?/g, '').replace(/```\n?$/g, '').trim();
    return JSON.parse(cleaned) as T;
  }
}
