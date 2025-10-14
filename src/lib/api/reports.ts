import { api } from "$lib/api/client";

export type Report = {
  topic_id: string;
  topic_name: string;
  sections: Record<string, string>;
};

export async function getReport(topic_id: string): Promise<Report> {
  return api<Report>(`/reports/${topic_id}`);
}
