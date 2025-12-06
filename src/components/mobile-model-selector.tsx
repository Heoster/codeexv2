"use client";

/**
 * Mobile Model Selector Component
 * A responsive bottom sheet for selecting AI models on mobile devices
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Code, Calculator, MessageCircle, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ModelId, ModelCategory } from '@/lib/types';

interface ModelOption {
  id: 'auto' | ModelId;
  name: string;
  provider: string;
  description: string;
  category: ModelCategory;
}

interface MobileModelSelectorProps {
  value: 'auto' | ModelId;
  onValueChange: (value: 'auto' | ModelId) => void;
  isOpen: boolean;
  onClose: () => void;
}

// Category icons and labels
const CATEGORY_CONFIG: Record<ModelCategory, { icon: typeof Sparkles; label: string; color: string }> = {
  general: { icon: Sparkles, label: 'General', color: 'text-blue-500' },
  coding: { icon: Code, label: 'Coding', color: 'text-green-500' },
  math: { icon: Calculator, label: 'Math', color: 'text-purple-500' },
  conversation: { icon: MessageCircle, label: 'Conversation', color: 'text-orange-500' },
  multimodal: { icon: ImageIcon, label: 'Multimodal', color: 'text-pink-500' },
};

// Default models list
const DEFAULT_MODELS: ModelOption[] = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'Google AI', description: 'Fast and capable', category: 'general' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google AI', description: 'Advanced with long context', category: 'general' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google AI', description: 'Optimized for speed', category: 'general' },
  { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google AI', description: 'Balanced performance', category: 'general' },
  { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', provider: 'Google AI', description: 'Text and images', category: 'multimodal' },
  { id: 'qwen-72b', name: 'Qwen 2.5 72B', provider: 'Hugging Face', description: 'Code, math, multilingual', category: 'general' },
  { id: 'deepseek-coder-33b', name: 'DeepSeek Coder 33B', provider: 'Hugging Face', description: 'Superior code generation', category: 'coding' },
  { id: 'wizardcoder-python-34b', name: 'WizardCoder Python', provider: 'Hugging Face', description: 'Python-focused', category: 'coding' },
  { id: 'wizardmath-70b', name: 'WizardMath 70B', provider: 'Hugging Face', description: 'Mathematical reasoning', category: 'math' },
  { id: 'llama-2-70b', name: 'Llama 2 70B', provider: 'Hugging Face', description: 'Strong analytics', category: 'general' },
  { id: 'dialogpt-large', name: 'DialoGPT Large', provider: 'Hugging Face', description: 'Optimized for chat', category: 'conversation' },
  { id: 'blenderbot-400m', name: 'BlenderBot 400M', provider: 'Hugging Face', description: 'Lightweight chat', category: 'conversation' },
  { id: 'kosmos-2', name: 'Kosmos-2', provider: 'Hugging Face', description: 'Vision + language', category: 'multimodal' },
  { id: 'blip2', name: 'BLIP-2', provider: 'Hugging Face', description: 'Image understanding', category: 'multimodal' },
];

export function MobileModelSelector({
  value,
  onValueChange,
  isOpen,
  onClose,
}: MobileModelSelectorProps) {
  const models = DEFAULT_MODELS;
  const selectedModel = value;
  const [touchStart, setTouchStart] = useState<number | null>(null);
  
  // Group models by category
  const modelsByCategory = models.reduce((acc, model) => {
    if (!acc[model.category]) {
      acc[model.category] = [];
    }
    acc[model.category].push(model);
    return acc;
  }, {} as Record<ModelCategory, ModelOption[]>);
  
  // Handle swipe to dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    
    const touchEnd = e.changedTouches[0].clientY;
    const diff = touchEnd - touchStart;
    
    // If swiped down more than 100px, close the dialog
    if (diff > 100) {
      onClose();
    }
    
    setTouchStart(null);
  };
  
  const handleSelect = (modelId: 'auto' | ModelId) => {
    onValueChange(modelId);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="sm:max-w-[425px] max-h-[80vh] overflow-hidden flex flex-col p-0"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Swipe indicator */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
        </div>
        
        <DialogHeader className="px-4 pb-2">
          <DialogTitle>Select AI Model</DialogTitle>
        </DialogHeader>
        
        {/* Auto option */}
        <div className="px-4 pb-2">
          <Button
            variant={selectedModel === 'auto' ? 'default' : 'outline'}
            className="w-full justify-start min-h-[44px] gap-3"
            onClick={() => handleSelect('auto')}
          >
            <Sparkles className="h-5 w-5" />
            <div className="flex-1 text-left">
              <div className="font-medium">Auto</div>
              <div className="text-xs text-muted-foreground">
                Automatically select the best model
              </div>
            </div>
            {selectedModel === 'auto' && <Check className="h-5 w-5" />}
          </Button>
        </div>
        
        {/* Model categories accordion */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <Accordion type="multiple" className="w-full">
            {(Object.keys(CATEGORY_CONFIG) as ModelCategory[]).map((category) => {
              const categoryModels = modelsByCategory[category] || [];
              if (categoryModels.length === 0) return null;
              
              const config = CATEGORY_CONFIG[category];
              const Icon = config.icon;
              
              return (
                <AccordionItem key={category} value={category}>
                  <AccordionTrigger className="min-h-[44px]">
                    <div className="flex items-center gap-2">
                      <Icon className={cn('h-5 w-5', config.color)} />
                      <span>{config.label}</span>
                      <span className="text-xs text-muted-foreground">
                        ({categoryModels.length})
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-2">
                      {categoryModels.map((model) => (
                        <Button
                          key={model.id}
                          variant={selectedModel === model.id ? 'secondary' : 'ghost'}
                          className="w-full justify-start min-h-[44px] h-auto py-2 px-3"
                          onClick={() => handleSelect(model.id)}
                        >
                          <div className="flex-1 text-left">
                            <div className="font-medium">{model.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {model.provider} • {model.description}
                            </div>
                          </div>
                          {selectedModel === model.id && (
                            <Check className="h-5 w-5 shrink-0" />
                          )}
                        </Button>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default MobileModelSelector;
