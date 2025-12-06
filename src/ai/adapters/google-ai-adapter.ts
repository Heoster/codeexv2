'use server';

/**
 * Google AI Provider Adapter
 * Wraps the existing Genkit Google AI integration
 */

import { ai } from '@/ai/genkit';
import { BaseProviderAdapter, type GenerateRequest, type GenerateResponse, type MessageData } from './types';
import { createUserFriendlyError } from '@/lib/model-config';
import type { MessageData as GenkitMessageData } from 'genkit';

export class GoogleAIAdapter extends BaseProviderAdapter {
  readonly provider = 'googleai' as const;
  
  isAvailable(): boolean {
    return !!process.env.GOOGLE_GENAI_API_KEY;
  }
  
  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const { model, prompt, systemPrompt, history, params } = request;
    const mergedParams = this.mergeParams(model, params);
    
    // Format model ID for Genkit
    const modelId = `googleai/${model.modelId}`;
    
    // Convert history to Genkit format
    const genkitHistory: GenkitMessageData[] = this.convertToGenkitHistory(history);
    
    try {
      const response = await ai.generate({
        model: modelId,
        prompt,
        messages: genkitHistory.length > 0 ? genkitHistory : undefined,
        system: systemPrompt,
        config: {
          temperature: mergedParams.temperature,
          topP: mergedParams.topP,
          topK: mergedParams.topK,
          maxOutputTokens: mergedParams.maxOutputTokens,
        },
      });
      
      return this.createResponse(response.text, model.id);
    } catch (error) {
      throw createUserFriendlyError(error, 'googleai', model.id);
    }
  }
  
  /**
   * Convert our message format to Genkit's expected format
   */
  private convertToGenkitHistory(history?: MessageData[]): GenkitMessageData[] {
    if (!history || history.length === 0) return [];
    
    return history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      content: typeof msg.content === 'string' 
        ? [{ text: msg.content }]
        : msg.content,
    }));
  }
}

// Singleton instance
let instance: GoogleAIAdapter | null = null;

export function getGoogleAIAdapter(): GoogleAIAdapter {
  if (!instance) {
    instance = new GoogleAIAdapter();
  }
  return instance;
}
