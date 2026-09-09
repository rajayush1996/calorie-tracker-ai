import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getAIProvider } from '../src/lib/ai/factory';

describe('Multi-Model AI Factory Architecture', () => {
  it('should instantiate GeminiProvider when gemini is requested', () => {
    const provider = getAIProvider({
      preferredProvider: 'gemini',
      customApiKey: 'AIzaSyFakeGeminiKey123',
    });

    assert.ok(provider, 'Provider should be instantiated');
    assert.strictEqual(provider?.name, 'gemini');
  });

  it('should instantiate GroqProvider when groq is requested', () => {
    const provider = getAIProvider({
      preferredProvider: 'groq',
      customApiKey: 'gsk_fakeGroqKey456',
    });

    assert.ok(provider, 'Provider should be instantiated');
    assert.strictEqual(provider?.name, 'groq');
  });

  it('should instantiate OpenAIProvider when openai is requested', () => {
    const provider = getAIProvider({
      preferredProvider: 'openai',
      customApiKey: 'sk-proj-fakeOpenAIKey789',
    });

    assert.ok(provider, 'Provider should be instantiated');
    assert.strictEqual(provider?.name, 'openai');
  });

  it('should instantiate ClaudeProvider when claude is requested', () => {
    const provider = getAIProvider({
      preferredProvider: 'claude',
      customApiKey: 'sk-ant-fakeClaudeKey999',
    });

    assert.ok(provider, 'Provider should be instantiated');
    assert.strictEqual(provider?.name, 'claude');
  });

  it('should auto-detect Gemini provider from AIza key prefix', () => {
    const provider = getAIProvider({
      customApiKey: 'AIzaSyExampleKeyAutoDetect',
    });

    assert.ok(provider, 'Provider should be auto-detected');
    assert.strictEqual(provider?.name, 'gemini');
  });

  it('should auto-detect Groq provider from gsk_ key prefix', () => {
    const provider = getAIProvider({
      customApiKey: 'gsk_exampleKeyAutoDetect',
    });

    assert.ok(provider, 'Provider should be auto-detected');
    assert.strictEqual(provider?.name, 'groq');
  });

  it('should return null when no key is configured to allow offline heuristic fallback', () => {
    // Ensure no ambient env keys interfere with this specific test
    const oldOpenAI = process.env.OPENAI_API_KEY;
    const oldGemini = process.env.GEMINI_API_KEY;
    const oldGroq = process.env.GROQ_API_KEY;
    const oldClaude = process.env.ANTHROPIC_API_KEY;

    delete process.env.OPENAI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.GROQ_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.GOOGLE_API_KEY;

    const provider = getAIProvider({});
    assert.strictEqual(provider, null, 'Provider should be null without keys');

    // Restore
    if (oldOpenAI) process.env.OPENAI_API_KEY = oldOpenAI;
    if (oldGemini) process.env.GEMINI_API_KEY = oldGemini;
    if (oldGroq) process.env.GROQ_API_KEY = oldGroq;
    if (oldClaude) process.env.ANTHROPIC_API_KEY = oldClaude;
  });
});
