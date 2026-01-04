<!-- StrategySuggestion.svelte - AI-enhanced strategy suggestion display -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  // Props
  export let originalText: string;
  export let improvedText: string;
  export let changesSummary: string;
  export let isLoading: boolean = false;

  const dispatch = createEventDispatcher();

  function handleAccept() {
    dispatch('accept', { improvedText });
  }

  function handleRegenerate() {
    dispatch('regenerate');
  }

  function handleDiscard() {
    dispatch('discard');
  }
</script>

{#if isLoading}
  <div class="suggestion-card loading">
    <div class="suggestion-header">
      <span class="suggestion-badge">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
        </svg>
        Improving your strategy...
      </span>
    </div>
    <div class="loading-content">
      <div class="spinner"></div>
      <p>Saga is analyzing your thesis and enhancing it while preserving your voice...</p>
    </div>
  </div>
{:else if improvedText}
  <div class="suggestion-card">
    <div class="suggestion-header">
      <span class="suggestion-badge">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
        </svg>
        AI-Enhanced Version
      </span>
      <button class="btn-close" on:click={handleDiscard} title="Discard suggestion">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </div>

    <div class="suggestion-content">
      <p class="improved-text">{improvedText}</p>
    </div>

    {#if changesSummary}
      <div class="changes-summary">
        <strong>Changes:</strong> {changesSummary}
      </div>
    {/if}

    <div class="suggestion-actions">
      <button class="btn-secondary" on:click={handleRegenerate}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
        </svg>
        Try Again
      </button>
      <button class="btn-primary" on:click={handleAccept}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
        Use This Version
      </button>
    </div>
  </div>
{/if}

<style>
  .suggestion-card {
    margin-top: 1rem;
    background: linear-gradient(145deg, rgba(10, 132, 255, 0.08) 0%, rgba(10, 132, 255, 0.03) 100%);
    border: 1px solid rgba(10, 132, 255, 0.3);
    border-radius: 12px;
    padding: 1rem 1.25rem;
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  :global(.dark) .suggestion-card {
    background: linear-gradient(145deg, rgba(10, 132, 255, 0.12) 0%, rgba(10, 132, 255, 0.05) 100%);
    border-color: rgba(10, 132, 255, 0.4);
  }

  .suggestion-card.loading {
    background: linear-gradient(145deg, rgba(255, 204, 0, 0.08) 0%, rgba(255, 204, 0, 0.03) 100%);
    border-color: rgba(255, 204, 0, 0.3);
  }

  :global(.dark) .suggestion-card.loading {
    background: linear-gradient(145deg, rgba(255, 204, 0, 0.12) 0%, rgba(255, 204, 0, 0.05) 100%);
    border-color: rgba(255, 204, 0, 0.4);
  }

  .suggestion-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .suggestion-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.625rem;
    background: rgba(10, 132, 255, 0.15);
    color: #0a84ff;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  .loading .suggestion-badge {
    background: rgba(255, 204, 0, 0.15);
    color: #cc9900;
  }

  :global(.dark) .loading .suggestion-badge {
    color: #ffcc00;
  }

  .btn-close {
    background: transparent;
    border: none;
    color: var(--text-muted, #86868b);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .btn-close:hover {
    background: var(--hover-bg, #f5f5f5);
    color: var(--text-color, #1d1d1f);
  }

  :global(.dark) .btn-close:hover {
    background: var(--hover-bg, #3a3a3c);
    color: var(--text-color, #f5f5f7);
  }

  .suggestion-content {
    margin-bottom: 0.75rem;
  }

  .improved-text {
    font-size: 1rem;
    line-height: 1.6;
    color: var(--text-color, #1d1d1f);
    margin: 0;
    white-space: pre-wrap;
  }

  :global(.dark) .improved-text {
    color: var(--text-color, #f5f5f7);
  }

  .changes-summary {
    font-size: 0.8125rem;
    color: var(--text-muted, #86868b);
    padding: 0.5rem 0.75rem;
    background: var(--surface-variant, #f5f5f7);
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  :global(.dark) .changes-summary {
    background: var(--surface-variant, #2c2c2e);
  }

  .changes-summary strong {
    color: var(--text-color, #1d1d1f);
  }

  :global(.dark) .changes-summary strong {
    color: var(--text-color, #f5f5f7);
  }

  .suggestion-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
  }

  .suggestion-actions button {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }

  .btn-secondary {
    background: var(--surface-variant, #f5f5f7);
    color: var(--text-color, #1d1d1f);
    border: 1px solid var(--border-color, #e5e5e7);
  }

  .btn-secondary:hover {
    background: var(--hover-bg, #e8e8ed);
  }

  :global(.dark) .btn-secondary {
    background: var(--surface-variant, #2c2c2e);
    color: var(--text-color, #f5f5f7);
    border-color: var(--border-color, #48484a);
  }

  :global(.dark) .btn-secondary:hover {
    background: var(--hover-bg, #3a3a3c);
  }

  .btn-primary {
    background: #0a84ff;
    color: white;
  }

  .btn-primary:hover {
    background: #0066cc;
  }

  /* Loading state */
  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.5rem 0;
    gap: 1rem;
  }

  .loading-content p {
    font-size: 0.875rem;
    color: var(--text-muted, #86868b);
    margin: 0;
    text-align: center;
  }

  .spinner {
    width: 24px;
    height: 24px;
    border: 2px solid rgba(255, 204, 0, 0.3);
    border-top-color: #cc9900;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  :global(.dark) .spinner {
    border-color: rgba(255, 204, 0, 0.3);
    border-top-color: #ffcc00;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
