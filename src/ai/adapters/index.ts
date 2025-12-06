/**
 * Provider Adapters Index
 * Exports all adapters and provides a factory function
 */

export * from './types';
export { GoogleAIAdapter, getGoogleAIAdapter } from './google-ai-adapter';
export { HuggingFaceAdapter, getHuggingFaceAdapter } from './huggingface-adapter';
export { OpenRouterAdapter, getOpenRouterAdapter } from './openrouter-adapter';

import type { ProviderAdapter } from './types';
import type { ProviderType } from '@/lib/model-config';
import { getGoogleAIAdapter } from './google-ai-adapter';
import { getHuggingFaceAdapter } from './huggingface-adapter';
import { getOpenRouterAdapter } from './openrouter-adapter';

/**
 * Get the appropriate adapter for a provider type
 */
export function getAdapter(providerType: ProviderType): ProviderAdapter {
  switch (providerType) {
    case 'googleai':
      return getGoogleAIAdapter();
    case 'huggingface':
      return getHuggingFaceAdapter();
    case 'openrouter':
      return getOpenRouterAdapter();
    default:
      throw new Error(`Unknown provider type: ${providerType}`);
  }
}

/**
 * Check if any provider is available
 */
export function hasAnyProviderAvailable(): boolean {
  return (
    getGoogleAIAdapter().isAvailable() ||
    getHuggingFaceAdapter().isAvailable() ||
    getOpenRouterAdapter().isAvailable()
  );
}
