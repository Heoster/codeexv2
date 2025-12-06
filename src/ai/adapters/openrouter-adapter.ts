'use server';

/**
 * OpenRouter Provider Adapter
 * Implements API calls to OpenRouter API for accessing various models
 */

import { BaseProviderAdapter, type GenerateRequest, type GenerateResponse, type MessageData } from './types';
import { createUserFriendlyError } from '@/lib/model-config';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: {
    message: string;
    code: string;
  };
}

export class OpenRouterAdapter extends BaseProviderAdapter {
  readonly provider = 'openrouter' as const;
  
  isAvailable(): boolean {
    return !!process.env.OPENROUTER_API_KEY;
  }
  
  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const { model, prompt, systemPrompt, history, params } = request;
    const mergedParams = this.mergeParams(model, params);
    
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw createUserFriendlyError(
        new Error('OPENROUTER_API_KEY not configured'),
        'openrouter',
        model.id
      );
    }
    
    // Build messages array for chat completion
    const messages = this.buildMessages(prompt, systemPrompt, history);
    
    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'CodeEx AI',
        },
        body: JSON.stringify({
          model: model.modelId,
          messages,
          temperature: mergedParams.temperature,
          top_p: mergedParams.topP,
          max_tokens: mergedParams.maxOutputTokens,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        
        if (response.status === 401 || response.status === 403) {
          throw createUserFriendlyError(
            new Error(`Authentication failed: ${errorText}`),
            'openrouter',
            model.id
          );
        }
        
        if (response.status === 429) {
          throw createUserFriendlyError(
            new Error(`Rate limit exceeded: ${errorText}`),
            'openrouter',
            model.id
          );
        }
        
        throw createUserFriendlyError(
          new Error(`API error: ${response.status} - ${errorText}`),
          'openrouter',
          model.id
        );
      }
      
      const data = await response.json() as OpenRouterResponse;
      
      if (data.error) {
        throw createUserFriendlyError(
          new Error(data.error.message),
          'openrouter',
          model.id
        );
      }
      
      const generatedText = data.choices[0]?.message?.content || '';
      const usage = data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
      } : undefined;
      
      return this.createResponse(generatedText, model.id, usage);
    } catch (error) {
      if (error instanceof Error && error.name === 'AIServiceError') {
        throw error;
      }
      throw createUserFriendlyError(error, 'openrouter', model.id);
    }
  }
  
  /**
   * Build messages array for OpenRouter chat completion API
   */
  private buildMessages(prompt: string, systemPrompt?: string, history?: MessageData[]): OpenRouterMessage[] {
    const messages: OpenRouterMessage[] = [];
    
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      });
    }
    
    if (history && history.length > 0) {
      for (const msg of history) {
        const content = typeof msg.content === 'string' 
          ? msg.content 
          : msg.content.map(c => c.text).join('');
        
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content,
        });
      }
    }
    
    messages.push({
      role: 'user',
      content: prompt,
    });
    
    return messages;
  }
}

// Singleton instance
let instance: OpenRouterAdapter | null = null;

export function getOpenRouterAdapter(): OpenRouterAdapter {
  if (!instance) {
    instance = new OpenRouterAdapter();
  }
  return instance;
}
