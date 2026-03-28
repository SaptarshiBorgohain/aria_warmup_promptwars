'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Image as ImageIcon, FileText, Send, Square } from 'lucide-react';

interface DropzoneProps {
  onSubmit: (formData: FormData) => void;
  isStreaming: boolean;
}

export function MultimodalDropzone({ onSubmit, isStreaming }: DropzoneProps) {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleVoiceToggle = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioFile = new File([audioBlob], 'voice.webm', { type: 'audio/webm' });
          setFile(audioFile);
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Error accessing microphone:', err);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text && !file) return;

    const formData = new FormData();
    if (text) formData.append('text', text);
    if (file) formData.append('file', file);

    onSubmit(formData);
    setText('');
    setFile(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border bg-card text-card-foreground shadow p-4 space-y-4">
        <Textarea 
          placeholder="Describe symptoms, transcribe medical notes, or paste a disaster feed..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[120px] resize-none border-0 focus-visible:ring-0 shadow-none text-lg"
        />
        
        {file && (
          <div className="rounded-md bg-muted px-3 py-2 text-sm flex items-center justify-between shadow-sm">
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {file.name}
            </span>
            <Button variant="ghost" size="sm" onClick={() => setFile(null)}>Clear</Button>
          </div>
        )}

        <div className="flex items-center gap-2 justify-between border-t pt-4">
          <div className="flex items-center gap-2">
            <Button 
              type="button" 
              onClick={handleVoiceToggle}
              variant={isRecording ? 'destructive' : 'secondary'}
              size="icon"
              title={isRecording ? "Stop Recording" : "Start Voice Recording"}
            >
              {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            
            <div className="relative">
              <Button type="button" variant="secondary" size="icon" onClick={() => document.getElementById('file-upload')?.click()}>
                <ImageIcon className="h-4 w-4" />
              </Button>
              <input 
                id="file-upload" 
                type="file" 
                className="hidden" 
                accept="image/*,application/pdf"
                onChange={handleFileChange}
              />
            </div>
          </div>
          
          <Button 
            type="submit"
            disabled={(!text && !file) || isStreaming}
            className="flex items-center gap-2 font-bold"
          >
            {isStreaming ? (
              <>Processing...</>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Analyze Threat
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
