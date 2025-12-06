import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Check for API key and provide helpful guidance
const hasApiKey = !!process.env.GOOGLE_GENAI_API_KEY;

if (!hasApiKey) {
  console.warn(
    '⚠️  GOOGLE_GENAI_API_KEY environment variable is not set.\n' +
    'AI functionality will be limited. To enable full AI features:\n' +
    '1. Get your API key from: https://makersuite.google.com/app/apikey\n' +
    '2. Add it to your .env.local file: GOOGLE_GENAI_API_KEY=your_key_here\n' +
    '3. Restart your development server.'
  );
}

let plugins: any[] = [];
try {
  if (hasApiKey) {
    plugins = [googleAI()];
  }
} catch (error) {
  console.error('Failed to initialize Google AI plugin:', error);
  console.warn('Continuing without AI plugin. Some features will be unavailable.');
  plugins = [];
}

export const ai = genkit({
  plugins,
});

// Export a flag indicating whether AI is available
export const isAIAvailable = hasApiKey && plugins.length > 0;

