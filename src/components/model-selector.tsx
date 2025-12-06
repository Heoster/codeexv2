'use client';

/**
 * Model Selector Component
 * A dropdown selector for AI models on desktop
 */

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, Code, Calculator, MessageCircle, Image as ImageIcon } from 'lucide-react';
import type { ModelId, ModelCategory } from '@/lib/types';

interface ModelSelectorProps {
  value: 'auto' | ModelId;
  onValueChange: (value: 'auto' | ModelId) => void;
}

// Model definitions with categories
const MODELS: Array<{
  id: 'auto' | ModelId;
  name: string;
  category: ModelCategory | 'auto';
  description: string;
}> = [
  { id: 'auto', name: 'Auto (Smart Routing)', category: 'auto', description: 'Automatically select the best model' },
  // Google Models
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', category: 'general', description: 'Fast and capable' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', category: 'general', description: 'Advanced with long context' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', category: 'general', description: 'Optimized for speed' },
  { id: 'gemini-pro', name: 'Gemini Pro', category: 'general', description: 'Balanced performance' },
  { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', category: 'multimodal', description: 'Text and images' },
  // Qwen
  { id: 'qwen-72b', name: 'Qwen 2.5 72B', category: 'general', description: 'Code, math, multilingual' },
  // Coding
  { id: 'deepseek-coder-33b', name: 'DeepSeek Coder 33B', category: 'coding', description: 'Superior code generation' },
  { id: 'wizardcoder-python-34b', name: 'WizardCoder Python', category: 'coding', description: 'Python-focused' },
  // Math
  { id: 'wizardmath-70b', name: 'WizardMath 70B', category: 'math', description: 'Mathematical reasoning' },
  // General
  { id: 'llama-2-70b', name: 'Llama 2 70B', category: 'general', description: 'Strong analytics' },
  // Conversation
  { id: 'dialogpt-large', name: 'DialoGPT Large', category: 'conversation', description: 'Optimized for chat' },
  { id: 'blenderbot-400m', name: 'BlenderBot 400M', category: 'conversation', description: 'Lightweight chat' },
  // Multimodal
  { id: 'kosmos-2', name: 'Kosmos-2', category: 'multimodal', description: 'Vision + language' },
  { id: 'blip2', name: 'BLIP-2', category: 'multimodal', description: 'Image understanding' },
];

// Group models by category
const groupedModels = MODELS.reduce((acc, model) => {
  const category = model.category;
  if (!acc[category]) {
    acc[category] = [];
  }
  acc[category].push(model);
  return acc;
}, {} as Record<string, typeof MODELS>);

export function ModelSelector({ value, onValueChange }: ModelSelectorProps) {
  const selectedModel = MODELS.find(m => m.id === value);
  
  return (
    <Select value={value} onValueChange={onValueChange as (value: string) => void}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select model">
          {selectedModel?.name || 'Select model'}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {/* Auto option */}
        <SelectGroup>
          <SelectItem value="auto" className="py-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <div>
                <div className="font-medium">Auto (Smart Routing)</div>
                <div className="text-xs text-muted-foreground">
                  Automatically select the best model
                </div>
              </div>
            </div>
          </SelectItem>
        </SelectGroup>
        
        {/* General Models */}
        {groupedModels.general && (
          <SelectGroup>
            <SelectLabel className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              General
            </SelectLabel>
            {groupedModels.general.map(model => (
              <SelectItem key={model.id} value={model.id} className="py-2">
                <div>
                  <div className="font-medium">{model.name}</div>
                  <div className="text-xs text-muted-foreground">{model.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        )}
        
        {/* Coding Models */}
        {groupedModels.coding && (
          <SelectGroup>
            <SelectLabel className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Coding
            </SelectLabel>
            {groupedModels.coding.map(model => (
              <SelectItem key={model.id} value={model.id} className="py-2">
                <div>
                  <div className="font-medium">{model.name}</div>
                  <div className="text-xs text-muted-foreground">{model.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        )}
        
        {/* Math Models */}
        {groupedModels.math && (
          <SelectGroup>
            <SelectLabel className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Math
            </SelectLabel>
            {groupedModels.math.map(model => (
              <SelectItem key={model.id} value={model.id} className="py-2">
                <div>
                  <div className="font-medium">{model.name}</div>
                  <div className="text-xs text-muted-foreground">{model.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        )}
        
        {/* Conversation Models */}
        {groupedModels.conversation && (
          <SelectGroup>
            <SelectLabel className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Conversation
            </SelectLabel>
            {groupedModels.conversation.map(model => (
              <SelectItem key={model.id} value={model.id} className="py-2">
                <div>
                  <div className="font-medium">{model.name}</div>
                  <div className="text-xs text-muted-foreground">{model.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        )}
        
        {/* Multimodal Models */}
        {groupedModels.multimodal && (
          <SelectGroup>
            <SelectLabel className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Multimodal
            </SelectLabel>
            {groupedModels.multimodal.map(model => (
              <SelectItem key={model.id} value={model.id} className="py-2">
                <div>
                  <div className="font-medium">{model.name}</div>
                  <div className="text-xs text-muted-foreground">{model.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  );
}

export default ModelSelector;
