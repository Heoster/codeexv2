'use server';

/**
 * Hugging Face Provider Adapter
 * Implements API calls to Hugging Face Inference API
 */

import { BaseProviderAdapter, type GenerateRequest, type GenerateResponse, type MessageData } from './types';
import { createUserFriendlyError } from '@/lib/model-config';

const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models';

interface HuggingFaceResponse {
  generated_text?: string;
  error?: string;
}

export class HuggingFaceAdapter extends BaseProviderAdapter {
  readonly provider = 'huggingface' as const;
  
  isAvailable(): boolean {
    return !!process.env.HUGGINGFACE_API_KEY;
  }
  
  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const { model, prompt, systemPrompt, history, params } = request;
    const mergedParams = this.mergeParams(model, params);
    
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      throw createUserFriendlyError(
        new Error('HUGGINGFACE_API_KEY not configured'),
        'huggingface',
        model.id
      );
    }
    
    // Build the full prompt with system prompt and history
    const fullPrompt = this.buildPrompt(prompt, systemPrompt, history);
    
    try {
      const response = await fetch(`${HUGGINGFACE_API_URL}/${model.modelId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: fullPrompt,
          parameters: {
            temperature: mergedParams.temperature,
            top_p: mergedParams.topP,
            top_k: mergedParams.topK,
            max_new_tokens: mergedParams.maxOutputTokens,
            return_full_text: false,
          },
          options: {
            wait_for_model: true,
          },
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        
        if (response.status === 401 || response.status === 403) {
          throw createUserFriendlyError(
            new Error(`Authentication failed: ${errorText}`),
            'huggingface',
            model.id
          );
        }
        
        if (response.status === 429) {
          throw createUserFriendlyError(
            new Error(`Rate limit exceeded: ${errorText}`),
            'huggingface',
            model.id
          );
        }
        
        throw createUserFriendlyError(
          new Error(`API error: ${response.status} - ${errorText}`),
          'huggingface',
          model.id
        );
      }
      
      const data = await response.json() as HuggingFaceResponse | HuggingFaceResponse[];
      
      // Handle array response (common for text generation)
      const result = Array.isArray(data) ? data[0] : data;
      
      if (result.error) {
        throw createUserFriendlyError(
          new Error(result.error),
          'huggingface',
          model.id
        );
      }
      
      const generatedText = result.generated_text || '';
      
      return this.createResponse(generatedText, model.id);
    } catch (error) {
      if (error instanceof Error && error.name === 'AIServiceError') {
        throw error;
      }
      throw createUserFriendlyError(error, 'huggingface', model.id);
    }
  }
  
  /**
   * Build a complete prompt including system prompt and history
   */
  private buildPrompt(prompt: string, systemPrompt?: string, history?: MessageData[]): string {
    const parts: string[] = [];
    
    if (systemPrompt) {
      parts.push(`System: ${systemPrompt}\n`);
    }
    
    if (history && history.length > 0) {
      for (const msg of history) {
        const role = msg.role === 'user' ? 'User' : 'Assistant';
        const content = typeof msg.content === 'string' 
          ? msg.content 
          : msg.content.map(c => c.text).join('');
        parts.push(`${role}: ${content}`);
      }
    }
    
    parts.push(`User: ${prompt}`);
    parts.push('Assistant:');
    
    return parts.join('\n');
  }
}

// Singleton instance
let instance: HuggingFaceAdapter | null = null;

export function getHuggingFaceAdapter(): HuggingFaceAdapter {
  if (!instance) {
    instance = new HuggingFaceAdapter();
  }
  return instance;
}
