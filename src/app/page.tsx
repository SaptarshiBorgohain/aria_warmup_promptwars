'use client';

import { useState } from 'react';
import { MultimodalDropzone } from '@/components/MultimodalDropzone';
import { ActionDashboard } from '@/components/ActionDashboard';
import { EmergencyMap } from '@/components/EmergencyMap';
import { TriageResult } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

export default function Home() {
  const [triage, setTriage] = useState<Partial<TriageResult> | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async (formData: FormData) => {
    setIsStreaming(true);
    setTriage(null);
    setError('');
    let accumulated = '';
    
    try {
      const response = await fetch('/api/triage', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const txt = await response.text();
        throw new Error(txt || 'Request failed');
      }
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          accumulated += decoder.decode(value, { stream: true });
          
          try {
            // Attempt to parse intermediate valid JSON
            const parsed = JSON.parse(accumulated);
            setTriage(parsed);
          } catch {
            // Ignore partial JSON parsing errors
          }
        }
        
        try {
          // Final parse
          const parsed = JSON.parse(accumulated);
          setTriage(parsed);
        } catch {
          console.error("Failed to parse the final response:", accumulated);
          setError("Data parsing error: The response model didn't return perfect JSON.");
        }
      }

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(err);
      setError(message);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card px-8 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-black dark:bg-white rounded-full flex justify-center items-center">
             <ShieldAlert className="h-5 w-5 text-white dark:text-black" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">ARIA</h1>
        </div>
        <div className="flex items-center gap-2 max-md:hidden">
          <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mr-4">Google Hackathon</span>
          <span className="text-xs bg-muted px-2 py-1 rounded-md font-medium text-muted-foreground">Adaptive Real-world Intelligence Assistant</span>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Main Content Column */}
        <div className="space-y-6 flex flex-col">
          <section aria-label="Input Section">
            <h2 className="text-lg font-bold mb-3">Incoming Signal Feed</h2>
            <MultimodalDropzone onSubmit={handleAnalyze} isStreaming={isStreaming} />
          </section>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>System Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <section className="flex-1" aria-label="System Analysis Result">
             <ActionDashboard triage={triage} isStreaming={isStreaming} />
          </section>
        </div>

        {/* Side Sidebar Column */}
        <div className="space-y-6 flex flex-col h-full h-[600px] lg:h-auto">
          <section className="flex flex-col h-full" aria-label="Routing & Logistics Map">
             <div className="flex items-center justify-between mb-3 shadow-none">
                <h2 className="text-lg font-bold">Emergency Routing</h2>
             </div>
             <div className="flex-1">
                <EmergencyMap />
             </div>
          </section>
        </div>
      </main>
    </div>
  );
}
