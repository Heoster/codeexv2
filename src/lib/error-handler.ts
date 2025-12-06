export interface AIError {
  code: string;
  message: string;
  userMessage: string;
  retryable: boolean;
}

export class ErrorHandler {
  static handle(error: unknown): AIError {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // API Key errors
    if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
      return {
        code: 'AUTH_ERROR',
        message: errorMessage,
        userMessage: 'AI service is not properly configured. Please check your API keys.',
        retryable: false
      };
    }

    // Rate limiting
    if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
      return {
        code: 'RATE_LIMIT',
        message: errorMessage,
        userMessage: 'AI service is temporarily busy. Please try again in a moment.',
        retryable: true
      };
    }

    // Network errors
    if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
      return {
        code: 'NETWORK_ERROR',
        message: errorMessage,
        userMessage: 'Connection issue. Please check your internet and try again.',
        retryable: true
      };
    }

    // Content safety
    if (errorMessage.includes('safety') || errorMessage.includes('blocked')) {
      return {
        code: 'SAFETY_ERROR',
        message: errorMessage,
        userMessage: 'Unable to process this content due to safety restrictions.',
        retryable: false
      };
    }

    // File format errors
    if (errorMessage.includes('format') || errorMessage.includes('unsupported')) {
      return {
        code: 'FORMAT_ERROR',
        message: errorMessage,
        userMessage: 'Unsupported file format. Please use a different file type.',
        retryable: false
      };
    }

    // Generic error
    return {
      code: 'UNKNOWN_ERROR',
      message: errorMessage,
      userMessage: 'Something went wrong. Please try again.',
      retryable: true
    };
  }

  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 2,
    delay: number = 1000
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        const aiError = this.handle(error);
        
        if (!aiError.retryable || attempt === maxRetries) {
          throw error;
        }

        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
      }
    }

    throw lastError;
  }
}