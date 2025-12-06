'use client';

/**
 * Message Attribution Component
 * Displays which AI model generated a response
 */

import { Sparkles, Code, Calculator, MessageCircle, Image as ImageIcon, Zap } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { ModelCategory } from '@/lib/types';

interface MessageAttributionProps {
  modelUsed?: string;
  modelCategory?: ModelCategory;
  autoRouted?: boolean;
  routingReasoning?: string;
}

// Model display names
const MODEL_NAMES: Record<string, string> = {
  'gemini-2.5-flash': 'Gemini 2.5 Flash',
  'gemini-1.5-pro': 'Gemini 1.5 Pro',
  'gemini-1.5-flash': 'Gemini 1.5 Flash',
  'gemini-pro': 'Gemini Pro',
  'gemini-pro-vision': 'Gemini Pro Vision',
  'qwen-72b': 'Qwen 2.5 72B',
  'deepseek-coder-33b': 'DeepSeek Coder',
  'wizardcoder-python-34b': 'WizardCoder Python',
  'wizardmath-70b': 'WizardMath 70B',
  'llama-2-70b': 'Llama 2 70B',
  'dialogpt-large': 'DialoGPT',
  'blenderbot-400m': 'BlenderBot',
  'kosmos-2': 'Kosmos-2',
  'blip2': 'BLIP-2',
};

// Category icons and colors
const CATEGORY_CONFIG: Record<ModelCategory, { icon: typeof Sparkles; color: string; label: string }> = {
  general: { icon: Sparkles, color: 'text-blue-500', label: 'General' },
  coding: { icon: Code, color: 'text-green-500', label: 'Coding' },
  math: { icon: Calculator, color: 'text-purple-500', label: 'Math' },
  conversation: { icon: MessageCircle, color: 'text-orange-500', label: 'Conversation' },
  multimodal: { icon: ImageIcon, color: 'text-pink-500', label: 'Multimodal' },
};

export function MessageAttribution({
  modelUsed,
  modelCategory,
  autoRouted,
  routingReasoning,
}: MessageAttributionProps) {
  if (!modelUsed) {
    return null;
  }

  const displayName = MODEL_NAMES[modelUsed] || modelUsed;
  const category = modelCategory || 'general';
  const config = CATEGORY_CONFIG[category];
  const Icon = config.icon;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
            <Icon className={cn('h-3 w-3', config.color)} />
            <span>{displayName}</span>
            {autoRouted && (
              <span className="flex items-center gap-0.5 text-muted-foreground/70">
                <Zap className="h-3 w-3" />
                <span>auto</span>
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[250px]">
          <div className="space-y-1">
            <p className="font-medium">{displayName}</p>
            <p className="text-xs text-muted-foreground">
              Category: {config.label}
            </p>
            {autoRouted && routingReasoning && (
              <p className="text-xs text-muted-foreground">
                {routingReasoning}
              </p>
            )}
            {autoRouted && !routingReasoning && (
              <p className="text-xs text-muted-foreground">
                Automatically selected based on your query
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default MessageAttribution;
