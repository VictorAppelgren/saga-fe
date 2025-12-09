<!-- Chat.svelte -->
<script lang="ts">
  import { simpleMarkdown } from '$lib/utils/simpleMarkdown';
  export let topic_id: string | null = null;
  export let strategy_id: string | null = null;
  export let username: string | null = null;
  export let triggerMessage: string | null = null; // Message to auto-send from dashboard
  import { onMount } from 'svelte';

  interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
  }

  let messages: Message[] = [];
  let inputText = '';
  let chatContainer: HTMLElement;
  let currentChatKey: string | null = null;
  let isInitialized = false;

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
    saveChat();
    console.log('✅ User message added, total messages:', messages.length);
    scrollToBottom();

    const userInput = inputText;
    inputText = '';
    
    // Use the shared sendMessage function
    await sendMessage(userInput);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  }

  // Track last processed trigger to avoid duplicates
  let lastProcessedTrigger: string | null = null;
  
  // Generate chat key based on context
  function getChatKey(): string | null {
    if (strategy_id) return `chat_strategy_${strategy_id}`;
    if (topic_id) return `chat_topic_${topic_id}`;
    return null;
  }
  
  // Save messages to localStorage with proper Date serialization
  function saveChat() {
    const key = getChatKey();
    if (!key) return;
    
    try {
      // Serialize messages with ISO timestamp strings (Date objects don't serialize)
      const serializable = messages.map(m => ({
        id: m.id,
        text: m.text,
        isUser: m.isUser,
        timestamp: m.timestamp.toISOString()
      }));
      
      localStorage.setItem(key, JSON.stringify(serializable));
      console.log(`💾 Saved ${messages.length} messages to ${key}`);
    } catch (e) {
      console.error('❌ Failed to save chat history:', e);
      // Continue gracefully - don't break the app
    }
  }
  
  // Load messages from localStorage with proper Date deserialization
  function loadChat() {
    const key = getChatKey();
    if (!key) {
      messages = [];
      console.log('📭 No chat key - clearing messages');
      return;
    }
    
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Deserialize with proper Date objects
        messages = parsed.map((m: any) => ({
          id: m.id,
          text: m.text,
          isUser: m.isUser,
          timestamp: new Date(m.timestamp)
        }));
        console.log(`📂 Loaded ${messages.length} messages from ${key}`);
        scrollToBottom();
      } else {
        messages = [];
        console.log(`📭 No saved messages for ${key}`);
      }
    } catch (e) {
      console.error('❌ Failed to load chat history:', e);
      messages = [];
    }
  }
  
  // Clear chat history for current context
  function clearChat() {
    const key = getChatKey();
    if (key && confirm('Clear this conversation? This cannot be undone.')) {
      try {
        localStorage.removeItem(key);
        messages = [];
        console.log(`🗑️ Cleared chat: ${key}`);
      } catch (e) {
        console.error('❌ Failed to clear chat:', e);
      }
    }
  }
  
  // Initialize on mount
  onMount(() => {
    currentChatKey = getChatKey();
    loadChat();
    isInitialized = true;
    console.log(`🚀 Chat mounted with key: ${currentChatKey}`);
  });
  
  // Watch for context changes and reload chat (only after initialization)
  $: if (isInitialized) {
    const newKey = getChatKey();
    if (newKey !== currentChatKey) {
      console.log(`🔄 Context changed: ${currentChatKey} → ${newKey}`);
      currentChatKey = newKey;
      loadChat();
    }
  }
  
  // Watch for triggerMessage changes from dashboard
  $: if (triggerMessage && triggerMessage !== lastProcessedTrigger) {
    console.log('💬 Chat received trigger message:', triggerMessage);
    lastProcessedTrigger = triggerMessage;
    
    // Add message to conversation
    const userMessage: Message = {
      id: generateId(),
      text: triggerMessage,
      isUser: true,
      timestamp: new Date()
    };
    messages = [...messages, userMessage];
    saveChat();
    console.log('📝 Message added to conversation, total messages:', messages.length);
    scrollToBottom();
    
    // Send to backend
    sendMessage(triggerMessage);
  }

  // Separate function to send message to backend
  async function sendMessage(messageText: string) {
    console.log('📤 sendMessage called with:', messageText);
    loading = true;
    errorMsg = '';

    try {
      // Prepare message history for backend
      const history = messages.map(m => ({
        role: m.isUser ? 'user' : 'assistant',
        content: m.text
      }));
      
      // Build request payload
      const body: any = { 
        message: messageText,
        history
      };
      
      if (topic_id) {
        body.topic_id = topic_id;
      }
      
      if (strategy_id) {
        body.strategy_id = strategy_id;
        if (username) {
          body.username = username;
        }
      }
      
      const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
      const API_KEY = import.meta.env.VITE_API_KEY || '';
      console.log('🌐 Sending to:', API_BASE + '/chat', 'with body:', body);
      
      const resp = await fetch(API_BASE + '/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify(body)
      });
      
      console.log('📨 Response status:', resp.status);
      if (!resp.ok) throw new Error('Server error: ' + resp.status);
      
      const data = await resp.json();
      console.log('✅ Response data:', data);
      
      const botMessage: Message = {
        id: generateId(),
        text: data.response,
        isUser: false,
        timestamp: new Date()
      };
      messages = [...messages, botMessage];
      saveChat();
      console.log('🤖 Bot message added, total messages:', messages.length);
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
      saveChat();
      scrollToBottom();
    } finally {
      loading = false;
      console.log('✅ sendMessage complete, loading:', loading);
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
  </div>

  <div class="input-container">
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
    height: 100vh;
    background: var(--bg-color, #ffffff);
    border-left: 1px solid var(--border-color, #e5e5e7);
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

  .input-container {
    padding: 1rem 1.25rem 1.25rem;
    border-top: 1px solid var(--border-color, #e5e5e7);
    display: flex;
    gap: 0.75rem;
    align-items: flex-end;
    background: var(--card-bg, #ffffff);
  }

  :global(.dark) .input-container {
    background: var(--card-bg, #1c1c1e);
    border-color: var(--border-color, #38383a);
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

  :global(.dark) .send-button:disabled {
    background: #404040;
  }
</style>
