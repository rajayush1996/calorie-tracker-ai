import { LLMProvider, FactoryConfig, AIProviderType } from './types';
import { OpenAIProvider } from './providers/openai';
import { GeminiProvider } from './providers/gemini';
import { GroqProvider } from './providers/groq';
import { ClaudeProvider } from './providers/claude';

export * from './types';

/**
 * Multi-Provider AI Factory
 * Dynamically instantiates the requested or available LLM provider:
 * - OpenAI (gpt-4o-mini)
 * - Google Gemini (gemini-1.5-flash / gemini-2.0-flash)
 * - Groq (llama-3.3-70b-versatile)
 * - Anthropic Claude (claude-3-5-haiku)
 *
 * If no key is provided, returns null to allow seamless offline heuristic fallback.
 */
export function getAIProvider(config: FactoryConfig = {}): LLMProvider | null {
  // 1. Explicit provider requested by caller
  if (config.preferredProvider === 'gemini') {
    const key = config.customApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (key) return new GeminiProvider(key);
  }

  if (config.preferredProvider === 'groq') {
    const key = config.customApiKey || process.env.GROQ_API_KEY;
    if (key) return new GroqProvider(key);
  }

  if (config.preferredProvider === 'claude') {
    const key = config.customApiKey || process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
    if (key) return new ClaudeProvider(key);
  }

  if (config.preferredProvider === 'openai') {
    const key = config.customApiKey || process.env.OPENAI_API_KEY;
    if (key) return new OpenAIProvider(key);
  }

  // 2. Custom API key signature auto-detection (when provider is not explicitly chosen)
  if (config.customApiKey) {
    const key = config.customApiKey.trim();
    if (key.startsWith('AIza')) {
      return new GeminiProvider(key);
    }
    if (key.startsWith('gsk_')) {
      return new GroqProvider(key);
    }
    if (key.startsWith('sk-ant')) {
      return new ClaudeProvider(key);
    }
    return new OpenAIProvider(key);
  }

  // 3. Server environment provider selection
  const envProvider = (process.env.AI_PROVIDER?.toLowerCase() as AIProviderType) || undefined;
  if (envProvider === 'gemini') {
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (key) return new GeminiProvider(key);
  }

  if (envProvider === 'groq') {
    const key = process.env.GROQ_API_KEY;
    if (key) return new GroqProvider(key);
  }

  if (envProvider === 'claude') {
    const key = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
    if (key) return new ClaudeProvider(key);
  }

  if (envProvider === 'openai') {
    const key = process.env.OPENAI_API_KEY;
    if (key) return new OpenAIProvider(key);
  }

  // 4. Auto-detect from available environment keys
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (geminiKey) return new GeminiProvider(geminiKey);

  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) return new GroqProvider(groqKey);

  const openAiKey = process.env.OPENAI_API_KEY;
  if (openAiKey) return new OpenAIProvider(openAiKey);

  const claudeKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
  if (claudeKey) return new ClaudeProvider(claudeKey);

  // No key available -> return null for offline heuristic fallback
  return null;
}
