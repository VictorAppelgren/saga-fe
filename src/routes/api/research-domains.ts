// src/lib/api/researchDomains.ts

import { api } from "$lib/api/client";

export type ResearchDomain = {
  id: string;
  name: string;
  description: string;
  // Add other fields if any
};

export type ResearchDomainDetails = ResearchDomain & {
  tasks: Task[];
};

export type Task = {
  id: string;
  title: string;
  status: string;
  // Add other task fields as needed
};

/**
 * Lists all research domains with descriptions.
 */
export async function getResearchDomains(): Promise<ResearchDomain[]> {
  return api<ResearchDomain[]>('/research-domains');
}

/**
 * Returns details and tasks for a specific research domain.
 * @param domainId - The ID of the research domain
 */
export async function getResearchDomain(domainId: string): Promise<ResearchDomainDetails> {
  return api<ResearchDomainDetails>(`/research-domains/${domainId}`);
}