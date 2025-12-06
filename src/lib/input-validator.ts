export type InputModality = 'text' | 'image' | 'audio' | 'video';

export interface ValidationResult {
  isValid: boolean;
  modality: InputModality;
  error?: string;
  errors?: string[];
  processedInput?: any;
}

export class InputValidator {
  static validateText(input: string): ValidationResult {
    if (!input || input.trim().length === 0) {
      return { isValid: false, modality: 'text', error: 'Text input cannot be empty' };
    }
    return { isValid: true, modality: 'text', processedInput: input.trim() };
  }

  static validateImage(file: File): ValidationResult {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      return { isValid: false, modality: 'image', error: 'Unsupported image format. Use JPEG, PNG, WebP, or GIF.' };
    }

    if (file.size > maxSize) {
      return { isValid: false, modality: 'image', error: 'Image too large. Maximum size is 10MB.' };
    }

    return { isValid: true, modality: 'image', processedInput: file };
  }

  static validateAudio(file: File): ValidationResult {
    const validTypes = ['audio/wav', 'audio/mp3', 'audio/ogg', 'audio/webm'];
    const maxSize = 25 * 1024 * 1024; // 25MB

    if (!validTypes.includes(file.type)) {
      return { isValid: false, modality: 'audio', error: 'Unsupported audio format. Use WAV, MP3, OGG, or WebM.' };
    }

    if (file.size > maxSize) {
      return { isValid: false, modality: 'audio', error: 'Audio file too large. Maximum size is 25MB.' };
    }

    return { isValid: true, modality: 'audio', processedInput: file };
  }

  static async preprocessImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Resize to standard dimensions for vision models
        const maxSize = 1024;
        let { width, height } = img;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        
        // Convert to RGB (remove alpha channel)
        ctx!.fillStyle = 'white';
        ctx!.fillRect(0, 0, width, height);
        ctx!.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };

      img.onerror = () => reject(new Error('Failed to process image'));
      img.src = URL.createObjectURL(file);
    });
  }
}

/**
 * General input validation function
 */
export function validateInput(input: string | File): ValidationResult {
  if (typeof input === 'string') {
    return InputValidator.validateText(input);
  }
  
  if (input instanceof File) {
    if (input.type.startsWith('image/')) {
      return InputValidator.validateImage(input);
    }
    if (input.type.startsWith('audio/')) {
      return InputValidator.validateAudio(input);
    }
    return { isValid: false, modality: 'text', error: 'Unsupported file type' };
  }
  
  return { isValid: false, modality: 'text', error: 'Invalid input type' };
}