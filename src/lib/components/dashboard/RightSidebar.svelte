<!-- RightSidebar.svelte - Chat sidebar -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Chat from '$lib/components/Chat.svelte';
  import type { Strategy } from '$lib/api/strategies';

  // Props
  export let isOpen: boolean = true;
  export let isMobile: boolean = false;
  export let currentSelection: { type: string; value: string };
  export let username: string | null = null;
  export let triggerMessage: string | null = null;
  export let feedbackContext: any = null;
  export let strategies: Strategy[] = [];
  export let interests: { id: string; name: string }[] = [];

  const dispatch = createEventDispatcher();

  function handleToggle() {
    dispatch('toggle');
  }

  function handleClearFeedback() {
    dispatch('clearFeedback');
  }

  function handleSectionRewritten(section: string, newContent: string) {
    dispatch('sectionRewritten', { section, newContent });
  }

  function handleSelectStrategy(strategy: Strategy) {
    dispatch('selectStrategy', strategy);
  }

  function handleSelectInterest(interest: { id: string; name: string }) {
    dispatch('selectInterest', interest);
  }

  function handleTriggerChat(message: string) {
    dispatch('triggerChat', message);
  }
</script>

<aside
  class="sidebar right-sidebar"
  class:open={isOpen}
  class:mobile={isMobile}
  on:touchstart|stopPropagation
  on:touchmove|stopPropagation
>
  <!-- Desktop toggle button for chat -->
  {#if !isMobile}
    <button class="chat-toggle-btn" on:click={handleToggle} aria-label="Toggle chat panel">
      {#if isOpen}
        <span class="toggle-text">Hide</span>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
        </svg>
      {:else}
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
        <span class="toggle-text">Chat</span>
      {/if}
    </button>
  {/if}

  <div class="chat-wrapper">
    {#if currentSelection?.type === 'interest' || currentSelection?.type === 'strategy'}
      {#key currentSelection?.value}
        <Chat
          topic_id={currentSelection?.type === 'interest' ? currentSelection?.value : null}
          strategy_id={currentSelection?.type === 'strategy' ? currentSelection?.value : null}
          {username}
          {triggerMessage}
          {feedbackContext}
          onClearFeedback={handleClearFeedback}
          onSectionRewritten={handleSectionRewritten}
        />
      {/key}
    {:else}
      <div class="chat-placeholder">
        <div class="chat-placeholder-content">
          <h3>Ask Saga Anything</h3>
          <p>Select a <strong>watchlist</strong> or <strong>topic</strong> from the sidebar to start chatting.</p>
        </div>
      </div>
    {/if}
  </div>
</aside>

<style>
  .sidebar {
    height: 100vh;
    background: var(--surface-variant, #f5f5f7);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s ease;
  }

  .right-sidebar {
    width: 320px;
    border-left: 1px solid var(--border-color, #d2d2d7);
    position: relative;
    overflow: visible;
    display: flex;
    flex-direction: column;
  }

  .right-sidebar:not(.open) {
    width: 0 !important;
    min-width: 0 !important;
    max-width: 0 !important;
    border: none;
    visibility: hidden;
    padding: 0;
  }

  .right-sidebar:not(.open) .chat-toggle-btn {
    visibility: visible;
  }

  .chat-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }

  .chat-toggle-btn {
    position: absolute;
    top: 1rem;
    left: -70px;
    height: 32px;
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    background: var(--card-bg, #ffffff);
    border: 1px solid var(--border-color, #d2d2d7);
    border-radius: 8px;
    cursor: pointer;
    color: var(--text-muted, #86868b);
    font-size: 0.8125rem;
    font-weight: 500;
    transition: all 0.2s;
    z-index: 10;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    white-space: nowrap;
  }

  .chat-toggle-btn .toggle-text {
    font-size: 0.8125rem;
  }

  .chat-toggle-btn:hover {
    background: var(--hover-bg, #f5f5f7);
    color: var(--text-color, #1d1d1f);
  }

  .right-sidebar:not(.open) .chat-toggle-btn {
    left: -75px;
    background: var(--primary, #007aff);
    color: white;
    border-color: var(--primary, #007aff);
  }

  .right-sidebar:not(.open) .chat-toggle-btn:hover {
    background: var(--primary-hover, #0066d6);
    color: white;
  }

  :global(.dark) .chat-toggle-btn {
    background: var(--card-bg, #1c1c1e);
    border-color: var(--border-color, #38383a);
  }

  /* Chat Placeholder */
  .chat-placeholder {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1.5rem;
    background: var(--bg-color, #ffffff);
  }

  .chat-placeholder-content {
    text-align: center;
    max-width: 260px;
  }

  .chat-placeholder-content h3 {
    margin: 0 0 1rem 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-color, #1d1d1f);
  }

  .chat-placeholder-content p {
    margin: 0 0 0.75rem 0;
    color: var(--text-muted, #86868b);
    line-height: 1.5;
    font-size: 0.9375rem;
  }

  :global(.dark) .chat-placeholder {
    background: var(--bg-color, #000000);
  }

  /* Mobile styles */
  .sidebar.mobile {
    position: fixed;
    top: 56px;
    bottom: 0;
    height: calc(100vh - 56px);
    height: calc(100dvh - 56px);
    width: 85vw !important;
    max-width: 320px;
    z-index: 100;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.25);
    background: var(--surface-variant, #f5f5f7);
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    touch-action: pan-y;
  }

  .right-sidebar.mobile {
    right: 0;
    left: auto;
    transform: translateX(100%);
    border-left: none;
    background: var(--bg-color, #ffffff);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .right-sidebar.mobile.open {
    transform: translateX(0);
    width: 85vw !important;
    max-width: 350px;
    height: calc(100vh - 56px);
    height: calc(100dvh - 56px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .right-sidebar.mobile .chat-wrapper {
    flex: 1;
    min-height: 0;
    height: 100%;
    max-height: 100%;
    position: relative;
    overflow: hidden;
  }

  @media (max-width: 768px) {
    .chat-toggle-btn {
      display: none;
    }
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    .right-sidebar {
      width: 280px;
    }
  }
</style>
