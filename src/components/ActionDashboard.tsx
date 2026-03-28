import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, MapPin, Activity, ShieldAlert, Clock, Hash } from 'lucide-react';
import { TriageResult } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useMemo } from 'react';

interface ActionDashboardProps {
  triage: Partial<TriageResult> | null;
  isStreaming: boolean;
}

export function ActionDashboard({ triage, isStreaming }: ActionDashboardProps) {
  // Calculate static metadata values right before render on every new triage event if it changes
  const sessionData = useMemo(() => {
    return {
      seq: String(Math.floor(Date.now() / 1000)).slice(-5),
      id: `INCD-${Math.floor(Math.random() * 90000) + 10000}`,
      time: format(new Date(), 'HH:mm:ss')
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triage?.triage_level, triage?.patient_summary]);

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
    <ScrollArea className="h-full rounded-xl border bg-card text-card-foreground shadow overflow-hidden relative">
      <AnimatePresence>
        {isStreaming && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            className="bg-blue-500/10 border-b border-blue-500/20 px-6 py-2 flex items-center justify-between"
          >
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              Neural Processing Active (Gemini 3.1 Pro)
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              LATENCY: 42ms | SEQ: {sessionData.seq}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
              Triage Assessment
            </h2>
            <div className="flex items-center gap-4 mt-2 text-sm font-mono text-muted-foreground">
               <span className="flex items-center gap-1"><Clock className="h-3 w-3"/> {format(new Date(), 'HH:mm:ss')}</span>
               <span className="flex items-center gap-1"><Hash className="h-3 w-3"/> {sessionData.id}</span>
            </div>
          </div>
          <motion.div
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Badge 
              className={`px-6 py-2 text-2xl font-black tracking-widest ${getTriageColor(triage.triage_level)} ${triage.triage_level === 'P1' ? 'animate-pulse ring-4 ring-red-500/30' : ''}`}
            >
              {triage.triage_level || "EVALUATING"}
            </Badge>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardHeader className="py-3 bg-muted/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                Situational Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-base leading-relaxed text-foreground/90">
                {triage.patient_summary || "Awaiting signal details..." }
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900 shadow-sm transition-all hover:shadow-md">
              <CardHeader className="py-3">
                <CardTitle className="text-lg flex items-center gap-2 text-red-600 dark:text-red-400">
                  <ShieldAlert className="h-5 w-5 animate-pulse" />
                  Critical Variables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(triage.critical_flags || []).map((flag, i) => (
                    <motion.li 
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + (i * 0.1) }}
                      key={i} className="text-sm font-medium flex items-start gap-2 bg-red-100 dark:bg-red-900/30 p-2 rounded-md text-red-800 dark:text-red-200"
                    >
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0" />
                      {flag}
                    </motion.li>
                  ))}
                  {!triage.critical_flags?.length && <li className="text-sm text-red-500/70 italic">Scanning...</li>}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900 shadow-sm transition-all hover:shadow-md">
              <CardHeader className="py-3">
                <CardTitle className="text-lg flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-5 w-5" />
                  Response Protocol
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-outside ml-4 text-sm space-y-3 font-medium text-amber-900 dark:text-amber-100">
                  {(triage.immediate_actions || []).map((action, i) => (
                    <motion.li 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + (i * 0.1) }}
                      key={i} className="pl-1 leading-snug"
                    >
                      {action}
                    </motion.li>
                  ))}
                  {!triage.immediate_actions?.length && <li className="text-amber-500/70 italic">Compiling directives...</li>}
                </ol>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Dynamic Resources Injection */}
        {triage.recommended_resources && triage.recommended_resources.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="pt-2"
          >
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Dispatched Resources Map Pin
            </h3>
            <div className="flex flex-wrap gap-2">
               {triage.recommended_resources.map((res, i) => (
                 <Badge key={i} variant="secondary" className="px-3 py-1.5 text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-100 hover:bg-blue-200 border-blue-200 dark:border-blue-800 transition-colors">
                   {res}
                 </Badge>
               ))}
            </div>
          </motion.div>
        )}
      </div>
    </ScrollArea>
  );
}
