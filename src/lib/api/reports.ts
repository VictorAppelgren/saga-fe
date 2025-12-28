import { api } from "$lib/api/client";

export interface Finding {
  headline: string;
  rationale?: string;
  confidence?: string;
  flow_path?: string;
  evidence?: string;
  added_at?: string;
}

export interface ExplorationFindings {
  risks: Finding[];
  opportunities: Finding[];
}

export type Report = {
  topic_id: string;
  topic_name: string;
  sections: Record<string, string>;
  exploration_findings?: ExplorationFindings | null;
};

export async function getReport(topic_id: string): Promise<Report> {
  return api<Report>(`/reports/${topic_id}`);
}
