'use server';
/**
 * @fileOverview A primary Genkit flow that routes user messages to the appropriate tool or generates a conversational response.
 * Now with multi-model support, auto-routing, and command routing.
 *
 * - processUserMessage - The main function that handles user input.
 * - ProcessUserMessageInput - The input type for the processUserMessage function.
 * - ProcessUserMessageOutput - The return type for the processUserMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {generateAnswerFromContext} from './generate-answer-from-context';
import type {ProcessUserMessageInput} from '@/lib/types';
import {solveQuiz} from './solve-quizzes';
import {summarizeInformation} from './summarize-information';
import {searchTheWeb} from './web-search';
import {getAutoRouter} from '@/ai/auto-router';
import {getCommandRouter} from '@/ai/command-router';

// Extended schema to support all model IDs
const ProcessUserMessageInputSchema = z.object({
  message: z.string().describe('The latest message from the user.'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .describe('The conversation history.'),
  settings: z.object({
    model: z.string().describe('Model ID or "auto" for automatic selection'),
    preferredCategory: z.enum(['general', 'coding', 'math', 'conversation', 'multimodal']).optional(),
    tone: z.enum(['helpful', 'formal', 'casual']),
    technicalLevel: z.enum(['beginner', 'intermediate', 'expert']),
    enableSpeech: z.boolean(),
    voice: z.enum(['Algenib', 'Enceladus', 'Achernar', 'Heka']),
  }),
});

const ProcessUserMessageOutputSchema = z.object({
  answer: z.string().describe('The generated response to the user message.'),
  modelUsed: z.string().optional().describe('The model that generated this response.'),
  autoRouted: z.boolean().optional().describe('Whether auto-routing was used.'),
  routingReasoning: z.string().optional().describe('Explanation of why this model was selected.'),
});

export type ProcessUserMessageOutput = z.infer<
  typeof ProcessUserMessageOutputSchema
>;

export async function processUserMessage(
  input: ProcessUserMessageInput
): Promise<ProcessUserMessageOutput> {
  return processUserMessageFlow(input);
}

const processUserMessageFlow = ai.defineFlow(
  {
    name: 'processUserMessageFlow',
    inputSchema: ProcessUserMessageInputSchema,
    outputSchema: ProcessUserMessageOutputSchema,
  },
  async ({message, history, settings}) => {
    const isAutoMode = settings.model === 'auto';
    const autoRouter = getAutoRouter();
    const commandRouter = getCommandRouter();
    
    // Check for special commands first
    const commandResult = commandRouter.routeCommand(message, settings.model, isAutoMode);
    
    if (commandResult) {
      const { command, content, model, reasoning } = commandResult;
      
      // Format model for Genkit (Google AI models need prefix)
      const genkitModel = model.provider === 'googleai' 
        ? `googleai/${model.modelId}` 
        : `googleai/gemini-2.5-flash`; // Fallback for non-Google models
      
      if (command === 'solve') {
        const {solution} = await solveQuiz({
          quiz: content, 
          model: genkitModel,
          tone: settings.tone,
          technicalLevel: settings.technicalLevel,
        });
        return {
          answer: solution,
          modelUsed: model.id,
          autoRouted: isAutoMode,
          routingReasoning: reasoning,
        };
      }
      
      if (command === 'summarize') {
        const {summary} = await summarizeInformation({text: content, model: genkitModel});
        return {
          answer: summary,
          modelUsed: model.id,
          autoRouted: isAutoMode,
          routingReasoning: reasoning,
        };
      }
      
      if (command === 'search') {
        const {answer} = await searchTheWeb({query: content});
        return {
          answer,
          modelUsed: model.id,
          autoRouted: isAutoMode,
          routingReasoning: reasoning,
        };
      }
    }
    
    // Default conversational response with auto-routing
    const routeResult = autoRouter.route(
      message, 
      settings.model, 
      settings.preferredCategory
    );
    
    // Format model for Genkit
    const genkitModel = routeResult.model.provider === 'googleai'
      ? `googleai/${routeResult.model.modelId}`
      : `googleai/gemini-2.5-flash`; // Fallback for non-Google models in Genkit
    
    const {answer} = await generateAnswerFromContext({
      messages: history,
      tone: settings.tone,
      technicalLevel: settings.technicalLevel,
      model: genkitModel,
    });

    return {
      answer,
      modelUsed: routeResult.model.id,
      autoRouted: routeResult.autoRouted,
      routingReasoning: routeResult.classification.reasoning,
    };
  }
);
