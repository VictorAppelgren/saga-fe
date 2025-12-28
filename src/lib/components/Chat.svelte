<!-- Chat.svelte -->
<script lang="ts">
  import { simpleMarkdown } from '$lib/utils/simpleMarkdown';
  export let topic_id: string | null = null;
  export let strategy_id: string | null = null;
  export let username: string | null = null;
  export let triggerMessage: string | null = null; // Message to auto-send from dashboard
  import { onMount } from 'svelte';

  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
  const API_KEY = import.meta.env.VITE_API_KEY || '';

  interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
  }

  let messages: Message[] = [];
  let inputText = '';
  let chatContainer: HTMLElement;
  let conversationId: string | null = null;

  export let feedbackContext: {
    section: string;
    sectionTitle: string;
    strategyId: string;
    currentContent: string;
  } | null = null;
  export let onClearFeedback: () => void = () => {};
  export let onSectionRewritten: (section: string, content: string) => void = () => {};

  // Generate unique ID (fallback for browsers without crypto.randomUUID)
  function generateId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback: generate random ID
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  function scrollToBottom() {
    setTimeout(() => {
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 0);
  }

  let loading = false;
  let errorMsg = '';

  async function handleSubmit() {
    console.log('🔵 handleSubmit called, inputText:', inputText, 'loading:', loading);
    if (!inputText.trim() || loading) {
      console.log('⚠️ Skipping submit - empty or loading');
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: generateId(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };
    messages = [...messages, userMessage];
    console.log('✅ User message added, total messages:', messages.length);
    scrollToBottom();

    const userInput = inputText;
    inputText = '';
    
    if (feedbackContext) {
      await handleRewrite(userInput);
    } else {
      await sendMessage(userInput);
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  }

  // Track last processed trigger to avoid duplicates
  let lastProcessedTrigger: string | null = null;

  // Clear chat - starts fresh conversation (next message will create new one)
  function clearChat() {
    if (confirm('Clear this conversation? This cannot be undone.')) {
      messages = [];
      conversationId = null;
      console.log('🗑️ Cleared chat - next message starts fresh');
    }
  }

  // Initialize on mount - messages come from backend on first chat
  onMount(() => {
    console.log('🚀 Chat mounted - backend manages conversation state');
  });

  // Watch for triggerMessage changes from dashboard
  $: if (triggerMessage && triggerMessage !== lastProcessedTrigger) {
    console.log('💬 Chat received trigger message:', triggerMessage);
    lastProcessedTrigger = triggerMessage;

    // Optimistically add user message
    const userMessage: Message = {
      id: generateId(),
      text: triggerMessage,
      isUser: true,
      timestamp: new Date()
    };
    messages = [...messages, userMessage];
    scrollToBottom();

    // Send to backend
    sendMessage(triggerMessage);
  }

  // Send message to backend - backend manages conversation state
  async function sendMessage(messageText: string) {
    console.log('📤 sendMessage called with:', messageText);
    loading = true;
    errorMsg = '';

    try {
      // Build request payload - no history needed, backend manages it
      const body: any = { message: messageText };

      if (topic_id) body.topic_id = topic_id;
      if (strategy_id) body.strategy_id = strategy_id;
      if (username) body.username = username;

      console.log('🌐 Sending to:', API_BASE + '/chat');

      const resp = await fetch(API_BASE + '/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify(body)
      });

      if (!resp.ok) throw new Error('Server error: ' + resp.status);

      const data = await resp.json();
      console.log('✅ Response:', data.conversation_id);

      // Store conversation ID for reference
      conversationId = data.conversation_id;

      // Backend returns visible messages - use them as source of truth
      if (data.messages && Array.isArray(data.messages)) {
        messages = data.messages.map((m: any) => ({
          id: generateId(),
          text: m.content,
          isUser: m.role === 'user',
          timestamp: new Date(m.timestamp)
        }));
      } else {
        // Fallback: just add bot response
        const botMessage: Message = {
          id: generateId(),
          text: data.response,
          isUser: false,
          timestamp: new Date()
        };
        messages = [...messages, botMessage];
      }

      scrollToBottom();
    } catch (err: any) {
      console.error('❌ Error in sendMessage:', err);
      errorMsg = err.message || 'Unknown error';
      const botMessage: Message = {
        id: generateId(),
        text: '[Error] ' + errorMsg,
        isUser: false,
        timestamp: new Date()
      };
      messages = [...messages, botMessage];
      scrollToBottom();
    } finally {
      loading = false;
    }
  }

  async function handleRewrite(feedback: string) {
    if (!feedbackContext) return;

    // 1. Add user's feedback as a message
    const userMessage: Message = {
      id: generateId(),
      text: `✏️ **Rewrite ${feedbackContext.sectionTitle}:** ${feedback}`,
      isUser: true,
      timestamp: new Date()
    };
    messages = [...messages, userMessage];

    // 2. Add immediate "working" message
    const workingMessage: Message = {
      id: generateId(),
      text: `🔄 Working on your rewrite of **${feedbackContext.sectionTitle}**... this takes about 30 seconds.`,
      isUser: false,
      timestamp: new Date()
    };
    messages = [...messages, workingMessage];
    scrollToBottom();

    loading = true;
    errorMsg = '';

    // 3. Prepare conversation history for context
    const conversationHistory = messages
      .slice(-10) // Last 10 messages for context
      .map(m => ({ role: m.isUser ? 'user' : 'assistant', content: m.text }));

    try {
      const response = await fetch(`${API_BASE}/strategy/rewrite-section`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify({
          strategy_id: feedbackContext.strategyId,
          section: feedbackContext.section,
          section_title: feedbackContext.sectionTitle,
          feedback,
          current_content: feedbackContext.currentContent,
          username: username,
          messages: conversationHistory
        })
      });

      if (!response.ok) {
        throw new Error('Rewrite request failed');
      }

      const data = await response.json();
      const newContent = data?.new_content ?? '';
      const comment = data?.comment ?? `✅ Done! I've updated the ${feedbackContext.sectionTitle} section.`;

      onSectionRewritten(feedbackContext.section, newContent);

      // 4. Show the contextual comment from backend
      const confirmation: Message = {
        id: generateId(),
        text: comment,
        isUser: false,
        timestamp: new Date()
      };
      messages = [...messages, confirmation];
      scrollToBottom();
    } catch (err: any) {
      const errorText = err?.message || 'Failed to rewrite section.';
      const failure: Message = {
        id: generateId(),
        text: `❌ ${errorText}`,
        isUser: false,
        timestamp: new Date()
      };
      messages = [...messages, failure];
      scrollToBottom();
    } finally {
      loading = false;
      onClearFeedback();
    }
  }
</script>

<div class="chat-container">
  <div class="chat-header">
    <h2>Chat with Saga</h2>
    {#if messages.length > 0}
      <button class="clear-chat-btn" on:click={clearChat} title="Clear conversation">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
        </svg>
      </button>
    {/if}
  </div>
  
  <div class="messages" bind:this={chatContainer}>
    {#each messages as message (message.id)}
      <div class="message {message.isUser ? 'user' : 'bot'}">
        <div class="message-sender">{message.isUser ? (username || 'You') : 'Saga'}</div>
        <div class="message-bubble">
          {#if message.isUser}
              {message.text}
            {:else}
              {@html simpleMarkdown(message.text)}
            {/if}
        </div>
        <div class="message-time">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    {/each}

    <!-- Typing indicator when loading -->
    {#if loading}
      <div class="message bot">
        <div class="message-sender">Saga</div>
        <div class="message-bubble typing-indicator">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      </div>
    {/if}
  </div>

  <div class="input-container">
    {#if feedbackContext}
      <div class="feedback-chip">
        <span>✏️ Rewrite: <strong>{feedbackContext.sectionTitle}</strong></span>
        <button class="chip-close" on:click={onClearFeedback} aria-label="Cancel rewrite">×</button>
      </div>
    {/if}
    <textarea
      bind:value={inputText}
      on:keydown={handleKeydown}
      placeholder="Type a message..."
      rows="1"
    ></textarea>
    <button 
      class="send-button" 
      on:click={handleSubmit} 
      disabled={!inputText.trim()}
    >
      Send
    </button>
  </div>
</div>

<style>
  /* ═══════════════════════════════════════════════════════════════════════════
     CHAT - Apple iMessage-inspired design
     ═══════════════════════════════════════════════════════════════════════════ */

  .chat-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    flex: 1;
    background: var(--bg-color, #ffffff);
  }

  .chat-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--border-color, #e5e5e7);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--card-bg, #ffffff);
  }

  .chat-header h2 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-color, #1d1d1f);
    letter-spacing: -0.01em;
  }

  .clear-chat-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: var(--surface-variant, #f5f5f7);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    color: var(--text-muted, #86868b);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .clear-chat-btn:hover {
    background: var(--hover-bg, #e8e8ed);
    color: var(--text-color, #1d1d1f);
  }

  :global(.dark) .chat-container {
    background: var(--bg-color, #000000);
  }

  :global(.dark) .chat-header {
    background: var(--card-bg, #1c1c1e);
    border-color: var(--border-color, #38383a);
  }

  :global(.dark) .chat-header h2 {
    color: var(--text-color, #f5f5f7);
  }

  :global(.dark) .clear-chat-btn {
    background: var(--surface-variant, #2c2c2e);
    color: var(--text-muted, #98989d);
  }

  :global(.dark) .clear-chat-btn:hover {
    background: var(--hover-bg, #3a3a3c);
    color: var(--text-color, #f5f5f7);
  }

  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 1.25rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    background: var(--bg-color, #ffffff);
  }

  :global(.dark) .messages {
    background: var(--bg-color, #000000);
  }

  .message {
    display: flex;
    flex-direction: column;
    max-width: 88%;
    gap: 0.25rem;
  }

  .message-sender {
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: var(--text-muted, #86868b);
    margin-bottom: 0.25rem;
    padding: 0 0.5rem;
  }

  .message.user .message-sender {
    text-align: right;
    color: var(--primary, #007aff);
  }

  .message.bot .message-sender {
    color: var(--text-muted, #86868b);
  }

  .message.user {
    align-self: flex-end;
  }

  .message.bot {
    align-self: flex-start;
  }

  .message-bubble {
    padding: 0.875rem 1.125rem;
    border-radius: 20px;
    word-break: break-word;
    font-size: 0.9375rem;
    line-height: 1.5;
  }

  .message.user .message-bubble {
    background: linear-gradient(135deg, #007AFF 0%, #0066d6 100%);
    color: white;
    border-bottom-right-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 122, 255, 0.2);
  }

  .message.bot .message-bubble {
    background: var(--surface-variant, #f0f0f2);
    color: var(--text-color, #1d1d1f);
    border-bottom-left-radius: 6px;
  }

  :global(.dark) .message.bot .message-bubble {
    background: var(--surface-variant, #2c2c2e);
    color: var(--text-color, #f5f5f7);
  }

  .message-time {
    font-size: 0.6875rem;
    color: var(--text-muted, #86868b);
    padding: 0 0.5rem;
    margin-top: 0.125rem;
  }

  .message.user .message-time {
    text-align: right;
  }

  :global(.dark) .message-time {
    color: var(--text-muted, #98989d);
  }

  /* Typing indicator animation */
  .typing-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0.875rem 1.25rem !important;
  }

  .typing-dot {
    width: 8px;
    height: 8px;
    background: var(--text-muted, #86868b);
    border-radius: 50%;
    animation: typingBounce 1.4s infinite ease-in-out both;
  }

  .typing-dot:nth-child(1) {
    animation-delay: 0s;
  }

  .typing-dot:nth-child(2) {
    animation-delay: 0.2s;
  }

  .typing-dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes typingBounce {
    0%, 80%, 100% {
      transform: scale(0.6);
      opacity: 0.4;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }

  :global(.dark) .typing-dot {
    background: var(--text-muted, #98989d);
  }

  .input-container {
    display: flex;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    padding-bottom: max(1rem, env(safe-area-inset-bottom));
    border-top: 1px solid var(--border-color, #e5e5e7);
    background: var(--card-bg, #ffffff);
    flex-direction: column;
    flex-shrink: 0;
  }

  textarea {
    flex: 1;
    padding: 0.75rem 1rem;
    border: 1px solid var(--border-color, #e5e5e7);
    border-radius: 20px;
    background: var(--surface-variant, #f5f5f7);
    color: var(--text-color, #1d1d1f);
    resize: none;
    min-height: 40px;
    max-height: 120px;
    line-height: 1.4;
    outline: none;
    font-family: inherit;
    font-size: 0.9375rem;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  textarea:focus {
    border-color: var(--primary, #007aff);
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
  }

  textarea::placeholder {
    color: var(--text-muted, #86868b);
  }

  :global(.dark) textarea {
    background: var(--surface-variant, #2c2c2e);
    border-color: var(--border-color, #48484a);
    color: var(--text-color, #f5f5f7);
  }

  :global(.dark) textarea:focus {
    border-color: var(--primary, #0a84ff);
    box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.15);
  }

  :global(.dark) textarea::placeholder {
    color: var(--text-muted, #98989d);
  }

  .send-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #007AFF 0%, #0066d6 100%);
    border: none;
    border-radius: 20px;
    height: 40px;
    padding: 0 1.5rem;
    cursor: pointer;
    color: white;
    font-weight: 600;
    font-size: 0.875rem;
    letter-spacing: -0.01em;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    white-space: nowrap;
    box-shadow: 0 1px 3px rgba(0, 122, 255, 0.2);
  }

  .send-button:hover:not(:disabled) {
    background: linear-gradient(135deg, #0066d6 0%, #0052a3 100%);
    transform: scale(1.02);
    box-shadow: 0 2px 6px rgba(0, 122, 255, 0.3);
  }

  .send-button:active:not(:disabled) {
    transform: scale(0.98);
  }

  .send-button:disabled {
    background: var(--surface-variant, #e5e5e7);
    color: var(--text-muted, #86868b);
    cursor: default;
    box-shadow: none;
  }

  :global(.dark) .send-button {
    background: linear-gradient(135deg, #0a84ff 0%, #0066d6 100%);
    box-shadow: 0 1px 3px rgba(10, 132, 255, 0.3);
  }

  :global(.dark) .send-button:hover:not(:disabled) {
    background: linear-gradient(135deg, #0066d6 0%, #0052a3 100%);
    box-shadow: 0 2px 6px rgba(10, 132, 255, 0.4);
  }

  :global(.dark) .send-button:disabled {
    background: var(--surface-variant, #3a3a3c);
    color: var(--text-muted, #636366);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     MOBILE RESPONSIVE
     ═══════════════════════════════════════════════════════════════════════════ */

  @media (max-width: 768px) {
    .chat-container {
      /* Use absolute positioning to guarantee full height */
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .chat-header {
      padding: 0.875rem 1rem;
      flex-shrink: 0;
    }

    .chat-header h2 {
      font-size: 1rem;
    }

    .messages {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior-y: contain;
      overscroll-behavior-x: none;
      touch-action: pan-y;
      padding: 1rem;
      padding-bottom: 0.5rem;
      scroll-behavior: smooth;
    }

    /* NUCLEAR FIX: Sticky input at bottom, always visible */
    .input-container {
      flex-shrink: 0;
      padding: 0.75rem 1rem;
      padding-bottom: max(0.75rem, calc(env(safe-area-inset-bottom, 0px) + 16px));
      background: var(--card-bg, #ffffff);
      border-top: 1px solid var(--border-color, #e5e5e7);
      /* Row layout for textarea + button */
      display: flex;
      flex-direction: row;
      align-items: flex-end;
      gap: 0.5rem;
      /* Ensure it's always on top */
      position: relative;
      z-index: 100;
    }

    .input-container textarea {
      flex: 1;
      min-width: 0;
      font-size: 16px; /* Prevents iOS zoom */
      max-height: 100px;
    }

    :global(.dark) .input-container {
      background: var(--card-bg, #1c1c1e);
    }

    .send-button {
      min-height: 44px;
      min-width: 60px;
      flex-shrink: 0;
    }
  }
</style>
