'use server';

import {analyzePdf} from '@/ai/flows/analyze-pdf';
import {processUserMessage} from '@/ai/flows/process-user-message';
import {sendWelcomeEmail} from '@/ai/flows/send-welcome-email';
import {solveImageEquation} from '@/ai/flows/solve-image-equation';
import type {
  AnalyzePdfInput,
  AnalyzePdfOutput,
  ProcessUserMessageInput,
  SolveImageEquationInput,
  SolveImageEquationOutput,
} from '@/lib/types';

function handleGenkitError(error: unknown): {error: string} {
  const message = error instanceof Error ? error.message : String(error);
  console.error('Genkit flow failed:', error);

  // Check for the specific API key error from Google AI and provide a helpful message.
  if (message.includes('API key') || message.includes('API_KEY')) {
    return {
      error: `AI processing failed. Your Google AI API key is missing. Please create a key in Google AI Studio and add it to the GOOGLE_API_KEY variable in your .env file.`,
    };
  }

  return {error: `AI processing failed: ${message}`};
}

export async function generateResponse(
  input: ProcessUserMessageInput
): Promise<{content: string; modelUsed?: string; autoRouted?: boolean; routingReasoning?: string} | {error: string}> {
  try {
    const response = await processUserMessage(input);
    return {
      content: response.answer,
      modelUsed: response.modelUsed,
      autoRouted: response.autoRouted,
      routingReasoning: response.routingReasoning,
    };
  } catch (error) {
    return handleGenkitError(error);
  }
}

export async function getSpeechAudio(
  _text: string,
  _voice: string
): Promise<{audio: string} | {error: string}> {
  // This function is deprecated - use browserTTS from lib/browser-tts.ts instead
  // Text-to-speech is now handled client-side using Web Speech API
  return {error: 'Speech synthesis has been moved to client-side. Use browserTTS utility instead.'};
}

export async function solveEquationFromImage(
  input: SolveImageEquationInput
): Promise<SolveImageEquationOutput | {error: string}> {
  try {
    const response = await solveImageEquation(input);
    return response;
  } catch (error) {
    return handleGenkitError(error);
  }
}

export async function analyzeDocumentFromPdf(
  input: AnalyzePdfInput
): Promise<AnalyzePdfOutput | {error: string}> {
  try {
    const response = await analyzePdf(input);
    return response;
  } catch (error) {
    return handleGenkitError(error);
  }
}

export async function triggerWelcomeEmail(input: {
  email: string;
  displayName: string;
}): Promise<void | {error: string}> {
  try {
    await sendWelcomeEmail(input);
  } catch (error) {
    return handleGenkitError(error);
  }
}
