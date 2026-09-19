import { AIProvider, AIConfigurationError } from './types';
import { OpenAIProvider } from './openai-provider';
import { DeterministicFallbackAIProvider } from './fallback-provider';

export function getAIProvider(): AIProvider {
  const apiKey = process.env.AI_API_KEY?.trim();
  const fallbackEnabled = process.env.AI_FALLBACK_ENABLED === 'true';

  if (!apiKey) {
    if (fallbackEnabled) {
      return new DeterministicFallbackAIProvider();
    }
    throw new AIConfigurationError(
      'AI provider is not configured. Please set your AI_API_KEY in environment variables (.env).'
    );
  }

  const model = process.env.AI_MODEL || 'gpt-4o';
  return new OpenAIProvider(apiKey, model);
}

export { AIConfigurationError };
