'use server';

import {config} from 'dotenv';
config();

import '@/ai/flows/solve-quizzes';
import '@/ai/flows/summarize-information';
import '@/ai/flows/generate-answer-from-context';
import '@/ai/flows/send-welcome-email';
import '@/ai/flows/text-to-speech';
import '@/ai/flows/solve-image-equation';
import '@/ai/flows/web-search';
import '@/ai/flows/analyze-pdf';
import '@/ai/flows/process-user-message';
