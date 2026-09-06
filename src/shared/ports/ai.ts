// AiProvider port (OpenAI / Google AI Studio).

export interface AiCompleteInput {
  system: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  maxOutputTokens: number;
}

export interface AiCompleteResult {
  text: string;
  usage: { inputTokens: number; outputTokens: number };
}

export interface AiProvider {
  complete(input: AiCompleteInput): Promise<AiCompleteResult>;
}
