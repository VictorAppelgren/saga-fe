// src/lib/api/chat.ts

import { api } from "./client";

export type ChatMessage = {
  message: string;
  asset_id: string;
  history: Array<{ message: string; response: string }>;
};

export type ChatResponse = {
  response: string;
  asset_id: string;
  sources: string[];
};

/**
 * Sends a chat message with optional asset_id and history.
 * @param messagePayload - Object containing message, asset_id, and history
 */
export async function sendMessage(messagePayload: ChatMessage): Promise<ChatResponse> {
  return api<ChatResponse>('/chat', {
    method: 'POST',
    body: JSON.stringify(messagePayload),
  });
}