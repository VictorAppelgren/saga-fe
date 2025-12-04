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
  
  // Save messages to localStorage
  function saveChat() {
    const key = getChatKey();
    if (key) {
      localStorage.setItem(key, JSON.stringify(messages));
    }
  }
  
  // Load messages from localStorage
  function loadChat() {
    const key = getChatKey();
    if (key) {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          messages = JSON.parse(saved);
          scrollToBottom();
        } catch (e) {
          console.error('Failed to load chat history:', e);
          messages = [];
        }
      } else {
        messages = [];
      }
    } else {
      messages = [];
    }
  }
  
  // Watch for context changes and reload chat
  $: {
    const newKey = getChatKey();
    if (newKey !== currentChatKey) {
      currentChatKey = newKey;
      loadChat();
    }
  }
  
  // Load chat on mount
  onMount(() => {
    loadChat();
  });
  
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
    <h2>Dialogue</h2>
  </div>
  
  <div class="messages" bind:this={chatContainer}>
    {#each messages as message (message.id)}
      <div class="message {message.isUser ? 'user' : 'bot'}">
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
  .chat-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: var(--card-bg, #f5f5f5);
    border-right: 1px solid var(--border-color, #e0e0e0);
  }

  .chat-header {
    padding: 1rem;
    border-bottom: 1px solid var(--border-color, #e0e0e0);
  }

  .chat-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 500;
    color: var(--text-color, black);
  }

  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .message {
    display: flex;
    flex-direction: column;
    max-width: 80%;
    gap: 0.25rem;
  }

  .message.user {
    align-self: flex-end;
  }

  .message.bot {
    align-self: flex-start;
  }

  .message-bubble {
    padding: 0.75rem 1rem;
    border-radius: 18px;
    word-break: break-word;
  }

  .message.user .message-bubble {
    background: #007AFF;
    color: white;
    border-bottom-right-radius: 4px;
  }

  .message.bot .message-bubble {
    background: #E9E9EB;
    color: black;
    border-bottom-left-radius: 4px;
  }

  :global(.dark) .message.bot .message-bubble {
    background: #303030;
    color: white;
  }

  .message-time {
    font-size: 0.75rem;
    color: #666;
    align-self: flex-end;
  }

  :global(.dark) .message-time {
    color: #999;
  }

  .input-container {
    padding: 1rem;
    border-top: 1px solid var(--border-color, #e0e0e0);
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  textarea {
    flex: 1;
    padding: 8px 16px;
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 20px;
    background: var(--bg-color, white);
    color: var(--text-color, black);
    resize: none;
    height: 40px;
    line-height: 24px;
    outline: none;
    font-family: inherit;
    font-size: 0.875rem;
  }

  .send-button {
    background: #007AFF;
    border: none;
    border-radius: 16px;
    height: 40px;
    padding: 0 1.25rem;
    cursor: pointer;
    color: white;
    font-weight: 500;
    font-size: 0.875rem;
    transition: opacity 0.2s, background-color 0.2s;
    white-space: nowrap;
  }

  .send-button:hover:not(:disabled) {
    background: #0056b3;
  }

  .send-button:disabled {
    background: #cccccc;
    cursor: default;
  }

  :global(.dark) .send-button {
    background: #0056b3;
  }

  :global(.dark) .send-button:hover:not(:disabled) {
    background: #003d80;
  }

  :global(.dark) .send-button:disabled {
    background: #404040;
  }
</style>
