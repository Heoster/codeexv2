export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  modelUsed?: string;
  modelCategory?: 'general' | 'coding' | 'math' | 'conversation' | 'multimodal';
  autoRouted?: boolean;
};

export type Chat = {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

// All available model IDs
export type ModelId =
  // Google Models
  | 'gemini-2.5-flash'
  | 'gemini-1.5-pro'
  | 'gemini-1.5-flash'
  | 'gemini-pro'
  | 'gemini-pro-vision'
  // Qwen Models
  | 'qwen-72b'
  // DeepSeek Models
  | 'deepseek-coder-33b'
  // WizardLM Models
  | 'wizardcoder-python-34b'
  | 'wizardmath-70b'
  // Meta Models
  | 'llama-2-70b'
  // Conversation Models
  | 'dialogpt-large'
  | 'blenderbot-400m'
  // Multimodal Models
  | 'kosmos-2'
  | 'blip2';

// Alias for backward compatibility
export type Model = ModelId;

export type Voice = 'Algenib' | 'Enceladus' | 'Achernar' | 'Heka';

// Model category type
export type ModelCategory = 'general' | 'coding' | 'math' | 'conversation' | 'multimodal';

export type Settings = {
  model: 'auto' | ModelId;
  preferredCategory?: ModelCategory;
  tone: 'helpful' | 'formal' | 'casual';
  technicalLevel: 'beginner' | 'intermediate' | 'expert';
  enableSpeech: boolean;
  voice: Voice;
};

// Types for Genkit flows
export interface ProcessUserMessageInput {
  message: string;
  // Use a simpler history type that only includes what the AI needs.
  // This prevents schema validation errors from extra fields like id or createdAt.
  history: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  settings: Settings;
}

export interface TextToSpeechInput {
  text: string;
  voice: Voice;
}

export interface TextToSpeechOutput {
  audio: string;
}

export interface SolveImageEquationInput {
  photoDataUri: string;
}

export interface SolveImageEquationOutput {
  recognizedEquation: string;
  solutionSteps: string;
  isSolvable: boolean;
}

export interface AnalyzePdfInput {
  pdfDataUri: string;
  question: string;
}

export interface AnalyzePdfOutput {
  answer: string;
}
