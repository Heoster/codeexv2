'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Image as ImageIcon, Mic, Video, X, Send } from 'lucide-react';
import { InputValidator, InputModality } from '@/lib/input-validator';
import { cn } from '@/lib/utils';

interface MultimodalInputProps {
  onSubmit: (input: string | File, modality: InputModality) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function MultimodalInput({ onSubmit, isLoading, placeholder }: MultimodalInputProps) {
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [modality, setModality] = useState<InputModality>('text');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    
    // Determine modality from file type
    let fileModality: InputModality = 'image';
    if (file.type.startsWith('audio/')) fileModality = 'audio';
    else if (file.type.startsWith('video/')) fileModality = 'video';

    // Validate file
    const validation = fileModality === 'image' 
      ? InputValidator.validateImage(file)
      : InputValidator.validateAudio(file);

    if (!validation.isValid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setSelectedFile(file);
    setModality(fileModality);
  };

  const handleSubmit = () => {
    if (modality === 'text') {
      const validation = InputValidator.validateText(textInput);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid input');
        return;
      }
      onSubmit(textInput, 'text');
      setTextInput('');
    } else if (selectedFile) {
      onSubmit(selectedFile, modality);
      setSelectedFile(null);
      setModality('text');
    }
    setError(null);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setModality('text');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getModalityIcon = (mod: InputModality) => {
    switch (mod) {
      case 'image': return <ImageIcon className="h-4 w-4" />;
      case 'audio': return <Mic className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      default: return null;
    }
  };

  const getModalityColor = (mod: InputModality) => {
    switch (mod) {
      case 'image': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'audio': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'video': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-3">
      {selectedFile && (
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={getModalityColor(modality)}>
                {getModalityIcon(modality)}
                <span className="ml-1 capitalize">{modality}</span>
              </Badge>
              <span className="text-sm text-muted-foreground truncate">
                {selectedFile.name}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={clearFile}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      <div className="flex gap-2">
        <div className="flex-1">
          {modality === 'text' ? (
            <Textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={placeholder || "Type your message..."}
              className="min-h-[44px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-[44px] border rounded-md bg-muted/50">
              <span className="text-sm text-muted-foreground">
                File selected: {selectedFile?.name}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,audio/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <Upload className="h-4 w-4" />
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={isLoading || (modality === 'text' && !textInput.trim()) || (modality !== 'text' && !selectedFile)}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}