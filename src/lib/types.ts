export type TriageLevel = "P1" | "P2" | "P3" | "UNKNOWN";

export interface TriageResult {
  triage_level: TriageLevel;
  patient_summary: string;
  critical_flags: string[];
  immediate_actions: string[];
  recommended_resources: string[];
  confidence_score: number;
}
