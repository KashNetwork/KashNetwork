// Real AI providers, picked by AI_PROVIDER (+ AI_API_KEY, optional AI_MODEL).
// Plain fetch, no SDKs — one small request each. Used only when
// config.ai.enabled; otherwise the fake provider answers.

import type { AiCompleteInput, AiCompleteResult, AiProvider } from '@/shared';
import { config } from '../config';

const TIMEOUT_MS = 30_000;

const RETRY_STATUSES = new Set([429, 500, 502, 503, 504]);
const RETRY_DELAYS_MS = [1500, 4000];

async function postJson(url: string, headers: Record<string, string>, body: unknown) {
  // providers answer 429/503 during demand spikes — a short backoff usually clears it
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const text = await res.text();
    if (res.ok) return JSON.parse(text) as Record<string, any>;
    if (RETRY_STATUSES.has(res.status) && attempt < RETRY_DELAYS_MS.length) {
      await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt]));
      continue;
    }
    throw new Error(`AI provider ${res.status}: ${text.slice(0, 300)}`);
  }
}

class AnthropicProvider implements AiProvider {
  async complete(input: AiCompleteInput): Promise<AiCompleteResult> {
    const j = await postJson(
      'https://api.anthropic.com/v1/messages',
      { 'x-api-key': config.ai.apiKey, 'anthropic-version': '2023-06-01' },
      {
        model: config.ai.model || 'claude-haiku-4-5-20251001',
        max_tokens: input.maxOutputTokens,
        system: input.system,
        messages: input.messages,
      },
    );
    const text = (j.content ?? []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('');
    return { text: text.trim(), usage: { inputTokens: j.usage?.input_tokens ?? 0, outputTokens: j.usage?.output_tokens ?? 0 } };
  }
}

class OpenAiProvider implements AiProvider {
  async complete(input: AiCompleteInput): Promise<AiCompleteResult> {
    const j = await postJson(
      'https://api.openai.com/v1/chat/completions',
      { authorization: `Bearer ${config.ai.apiKey}` },
      {
        model: config.ai.model || 'gpt-4o-mini',
        max_tokens: input.maxOutputTokens,
        messages: [{ role: 'system', content: input.system }, ...input.messages],
      },
    );
    return {
      text: String(j.choices?.[0]?.message?.content ?? '').trim(),
      usage: { inputTokens: j.usage?.prompt_tokens ?? 0, outputTokens: j.usage?.completion_tokens ?? 0 },
    };
  }
}

class GoogleProvider implements AiProvider {
  async complete(input: AiCompleteInput): Promise<AiCompleteResult> {
    const model = config.ai.model || 'gemini-3.5-flash-lite';
    const j = await postJson(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      { 'x-goog-api-key': config.ai.apiKey },
      {
        systemInstruction: { parts: [{ text: input.system }] },
        contents: input.messages.map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
        generationConfig: { maxOutputTokens: input.maxOutputTokens },
      },
    );
    const text = (j.candidates?.[0]?.content?.parts ?? []).map((p: any) => p.text ?? '').join('');
    return {
      text: text.trim(),
      usage: { inputTokens: j.usageMetadata?.promptTokenCount ?? 0, outputTokens: j.usageMetadata?.candidatesTokenCount ?? 0 },
    };
  }
}

export function createRealAiProvider(): AiProvider {
  switch (config.ai.provider) {
    case 'anthropic':
      return new AnthropicProvider();
    case 'openai':
      return new OpenAiProvider();
    case 'google':
      return new GoogleProvider();
    default:
      throw new Error(`Unknown AI_PROVIDER "${config.ai.provider}" (use anthropic, openai or google)`);
  }
}
