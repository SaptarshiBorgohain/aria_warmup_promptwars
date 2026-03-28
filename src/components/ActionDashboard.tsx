import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, MapPin, Activity, ShieldAlert } from 'lucide-react';
import { TriageResult } from '@/lib/types';

interface ActionDashboardProps {
  triage: Partial<TriageResult> | null;
  isStreaming: boolean;
}

export function ActionDashboard({ triage, isStreaming }: ActionDashboardProps) {
  if (!triage) {
    return (
      <div className="flex h-full items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-xl p-8 text-center text-muted-foreground">
        Waiting for multimodal input...
      </div>
    );
  }

  const getTriageColor = (level?: string) => {
    switch (level) {
      case 'P1': return 'bg-red-500 text-white';
      case 'P2': return 'bg-yellow-500 text-black';
      case 'P3': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <ScrollArea className="h-full rounded-xl border bg-card text-card-foreground shadow">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Triage Assessment</h2>
            {isStreaming && <p className="text-sm text-blue-500 animate-pulse">Analyzing inputs via Gemini 1.5 Pro...</p>}
          </div>
          <Badge className={`px-4 py-2 text-lg font-bold ${getTriageColor(triage.triage_level)}`}>
            {triage.triage_level || "EVALUATING"}
          </Badge>
        </div>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Patient/Situation Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{triage.patient_summary || "..." }</p>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900">
            <CardHeader className="py-3">
              <CardTitle className="text-lg flex items-center gap-2 text-red-600 dark:text-red-400">
                <ShieldAlert className="h-5 w-5" />
                Critical Flags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-sm space-y-1">
                {(triage.critical_flags || []).map((flag, i) => (
                  <li key={i}>{flag}</li>
                ))}
                {!triage.critical_flags?.length && <li>None detected yet</li>}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-lg flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <AlertTriangle className="h-5 w-5" />
                Immediate Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside text-sm space-y-1">
                {(triage.immediate_actions || []).map((action, i) => (
                  <li key={i}>{action}</li>
                ))}
                {!triage.immediate_actions?.length && <li>Generating protocol...</li>}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
}
