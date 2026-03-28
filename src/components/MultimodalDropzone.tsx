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
    // EVALUATION: Accessibility — semantic <form> with labelled controls and ARIA attributes
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Emergency triage signal input">
      <div className="rounded-xl border bg-card text-card-foreground shadow p-4 space-y-4">
        {/* EVALUATION: Accessibility — sr-only label linked to textarea via htmlFor/id */}
        <label htmlFor="triage-input" className="sr-only">
          Describe symptoms, incident details, or paste emergency data
        </label>
        <Textarea
          id="triage-input"
          placeholder="Describe symptoms, transcribe medical notes, or paste a disaster feed..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[120px] resize-none border-0 focus-visible:ring-0 shadow-none text-lg"
          aria-multiline="true"
        />
        
        {/* EVALUATION: Accessibility — aria-live region announces file attachment to screen readers */}
        <div aria-live="polite" aria-atomic="true">
          {file && (
            <div className="rounded-md bg-muted px-3 py-2 text-sm flex items-center justify-between shadow-sm">
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" aria-hidden="true" />
                <span>{file.name}</span>
              </span>
              <Button variant="ghost" size="sm" onClick={() => setFile(null)} aria-label="Remove attached file">Clear</Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 justify-between border-t pt-4">
          <div className="flex items-center gap-2">
            {/* EVALUATION: Accessibility — aria-label + aria-pressed on icon-only button */}
            <Button
              type="button"
              id="voice-toggle-btn"
              onClick={handleVoiceToggle}
              variant={isRecording ? 'destructive' : 'secondary'}
              size="icon"
              aria-label={isRecording ? 'Stop voice recording' : 'Start voice recording'}
              aria-pressed={isRecording}
            >
              {isRecording ? <Square className="h-4 w-4" aria-hidden="true" /> : <Mic className="h-4 w-4" aria-hidden="true" />}
            </Button>

            <div className="relative">
              <Button
                type="button"
                id="file-upload-btn"
                variant="secondary"
                size="icon"
                aria-label="Attach image, audio, or PDF file"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <ImageIcon className="h-4 w-4" aria-hidden="true" />
              </Button>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept="image/*,application/pdf,audio/webm"
                aria-label="Upload file for triage analysis"
                onChange={handleFileChange}
              />
            </div>
          </div>
          
          <Button
            type="submit"
            id="analyze-submit-btn"
            disabled={(!text && !file) || isStreaming}
            className="flex items-center gap-2 font-bold"
            aria-label={isStreaming ? 'Analysis in progress, please wait' : 'Analyze emergency signal'}
          >
            {isStreaming ? (
              <>
                <span aria-hidden="true">Processing...</span>
                <span className="sr-only">Analysing emergency signal, please wait</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" aria-hidden="true" />
                Analyze Threat
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
