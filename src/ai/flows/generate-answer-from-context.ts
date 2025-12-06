'use server';

/**
 * @fileOverview Enhanced Genkit flow for intelligent conversation with context awareness.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type {MessageData} from 'genkit';

const GenerateAnswerFromContextInputSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .describe('The conversation history.'),
  model: z.string().optional(),
  tone: z.enum(['helpful', 'formal', 'casual']).optional(),
  technicalLevel: z.enum(['beginner', 'intermediate', 'expert']).optional(),
});
export type GenerateAnswerFromContextInput = z.infer<
  typeof GenerateAnswerFromContextInputSchema
>;

const GenerateAnswerFromContextOutputSchema = z.object({
  answer: z.string().describe('The answer to the user question.'),
});
export type GenerateAnswerFromContextOutput = z.infer<
  typeof GenerateAnswerFromContextOutputSchema
>;

export async function generateAnswerFromContext(
  input: GenerateAnswerFromContextInput
): Promise<GenerateAnswerFromContextOutput> {
  return generateAnswerFromContextFlow(input);
}

// Enhanced system prompts based on tone and technical level
const getToneInstructions = (tone: string) => {
  switch (tone) {
    case 'formal':
      return 'Use professional language, proper grammar, and a respectful tone. Avoid contractions and casual expressions.';
    case 'casual':
      return 'Be friendly and conversational. Use simple language, contractions are fine, and feel free to use appropriate emojis occasionally.';
    default:
      return 'Be warm, approachable, and supportive. Balance professionalism with friendliness.';
  }
};

const getTechnicalInstructions = (level: string) => {
  switch (level) {
    case 'beginner':
      return 'Explain concepts in simple terms. Avoid jargon, use analogies, and break down complex ideas into easy steps. Assume no prior knowledge.';
    case 'expert':
      return 'Use technical terminology freely. Provide in-depth explanations, include advanced concepts, and assume strong foundational knowledge.';
    default:
      return 'Balance technical accuracy with accessibility. Define specialized terms when first used and provide moderate detail.';
  }
};

const generateAnswerFromContextFlow = ai.defineFlow(
  {
    name: 'generateAnswerFromContextFlow',
    inputSchema: GenerateAnswerFromContextInputSchema,
    outputSchema: GenerateAnswerFromContextOutputSchema,
  },
  async input => {
    const {messages, tone = 'helpful', technicalLevel = 'intermediate', model} = input;

    const systemInstruction = `You are CODEEX AI, an intelligent and versatile assistant created by Heoster. You excel at helping users with coding, problem-solving, learning, and general questions.

## Your Personality & Communication Style
${getToneInstructions(tone)}

## Technical Depth
${getTechnicalInstructions(technicalLevel)}

## Core Capabilities
- **Coding Help**: Debug code, explain concepts, suggest best practices, and help with algorithms
- **Problem Solving**: Break down complex problems, provide step-by-step solutions
- **Learning**: Explain topics clearly, provide examples, and adapt to the user's level
- **General Knowledge**: Answer questions accurately and cite limitations when uncertain

## Response Guidelines
1. **Be Accurate**: If unsure, say so. Don't make up information.
2. **Be Concise**: Get to the point, but provide enough detail to be helpful.
3. **Use Formatting**: Use markdown for code blocks, lists, and emphasis when helpful.
4. **Stay Focused**: Address the user's actual question, not tangential topics.
5. **Be Proactive**: Anticipate follow-up questions and address them when relevant.

## Special Instructions
- For code: Always specify the language in code blocks, explain key parts, and mention potential edge cases.
- For math: Show your work step-by-step when solving problems.
- For errors: Explain what went wrong and how to fix it.
- Remember context from the conversation to provide coherent, continuous assistance.`;

    // Map roles: 'assistant' -> 'model'
    let history: MessageData[] = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      content: [{text: msg.content}],
    }));

    // The Google Generative API expects the first message in the conversation
    // to be from the user. If the client-supplied history starts with assistant
    // messages (mapped to 'model'), trim those leading model entries so the
    // first entry we send is a user message.
    while (history.length > 0 && history[0].role !== 'user') {
      history.shift();
    }

    const lastMessage = history.pop();
    if (!lastMessage || lastMessage.role !== 'user') {
      throw new Error('The last message must be from the user.');
    }

    try {
      // Extract the text from the last message content
      const promptText = Array.isArray(lastMessage.content) 
        ? lastMessage.content.map((c: any) => c.text || '').join('') 
        : String(lastMessage.content);

      const response = await ai.generate({
        model: model,
        prompt: promptText,
        messages: history.length > 0 ? history : undefined,
        system: systemInstruction,
        config: {
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 4096,
        },
      });

      return {answer: response.text};
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Provide helpful error messages
      if (errorMessage.includes('API key')) {
        throw new Error('AI service unavailable. Please check your Google AI API key configuration.');
      }
      if (errorMessage.includes('quota') || errorMessage.includes('rate')) {
        throw new Error('AI service is temporarily busy. Please try again in a moment.');
      }
      if (errorMessage.includes('safety')) {
        throw new Error('I cannot respond to that request. Please try rephrasing your question.');
      }
      
      throw error;
    }
  }
);
