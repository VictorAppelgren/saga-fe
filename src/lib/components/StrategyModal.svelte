<script lang="ts">
  import type { StrategyDetail, ImproveStrategyTextResponse } from '$lib/api/strategies';
  import { createEventDispatcher } from 'svelte';

  export let mode: 'create' | 'edit' = 'create';
  export let strategy: StrategyDetail | null = null;
  export let onSave: (data: any) => void;
  export let onCancel: () => void;

  // AI Improvement props (only available in edit mode with existing strategy)
  export let onImproveThesis: ((strategy: StrategyDetail) => Promise<ImproveStrategyTextResponse | null>) | null = null;

  let asset_primary = strategy?.asset.primary || '';
  let strategy_text = strategy?.user_input.strategy_text || '';
  let position_text = strategy?.user_input.position_text || '';
  let target = strategy?.user_input.target || '';

  // Advanced settings toggle
  let showAdvanced = !!(position_text || target);

  // AI Improvement state
  let isImproving = false;
  let suggestion: ImproveStrategyTextResponse | null = null;
  let copySuccess = false;

  function handleSubmit() {
    onSave({
      asset_primary,
      strategy_text,
      position_text,
      target
    });
  }

  async function handleImproveThesis() {
    if (!strategy || !onImproveThesis) return;

    isImproving = true;
    suggestion = null;

    try {
      // Create a temporary strategy object with current form values
      const currentStrategy = {
        ...strategy,
        user_input: {
          ...strategy.user_input,
          strategy_text,
          position_text,
          target
        }
      };
      suggestion = await onImproveThesis(currentStrategy);
    } catch (error) {
      console.error('Failed to improve thesis:', error);
    } finally {
      isImproving = false;
    }
  }

  async function copyToClipboard() {
    if (!suggestion?.improved_text) return;

    try {
      await navigator.clipboard.writeText(suggestion.improved_text);
      copySuccess = true;
      setTimeout(() => copySuccess = false, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }

  function acceptSuggestion() {
    if (suggestion?.improved_text) {
      strategy_text = suggestion.improved_text;
      suggestion = null;
    }
  }

  function discardSuggestion() {
    suggestion = null;
  }
</script>

<div class="modal-overlay" on:click={onCancel} role="presentation">
  <div class="modal-content" on:click|stopPropagation role="dialog" aria-modal="true">
    <h2>{mode === 'create' ? 'Create New Strategy' : 'Edit Strategy'}</h2>

    <!-- Helper Tips Section -->
    <div class="helper-tips">
      <div class="tip-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 16v-4M12 8h.01"/>
        </svg>
      </div>
      <div class="tip-content">
        <p><strong>Write your thesis in your own words.</strong> Saga's AI will monitor the world and surface what matters to your view.</p>
        <p class="tip-subtle">Focus on <em>what</em> you believe and <em>why</em> — we'll handle the rest.</p>
      </div>
    </div>

    <form on:submit|preventDefault={handleSubmit}>
      <div class="form-group">
        <label for="asset">
          Asset <span class="required">*</span>
        </label>
        <input
          id="asset"
          type="text"
          bind:value={asset_primary}
          placeholder="e.g., EURUSD, AAPL, BTC"
          required
          disabled={mode === 'edit'}
        />
        <span class="help-text">The primary asset for this strategy</span>
      </div>

      <div class="form-group">
        <div class="label-row">
          <label for="strategy">
            Strategy Thesis <span class="required">*</span>
          </label>
          {#if mode === 'edit' && strategy && onImproveThesis}
            <button
              type="button"
              class="btn-improve"
              on:click={handleImproveThesis}
              disabled={isImproving || !strategy_text.trim()}
            >
              {#if isImproving}
                <span class="spinner"></span>
                Improving...
              {:else}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                Help Me Improve This
              {/if}
            </button>
          {/if}
        </div>
        <textarea
          id="strategy"
          bind:value={strategy_text}
          placeholder="Describe your investment thesis, market view, and reasoning..."
          rows="6"
          required
        ></textarea>
        <span class="help-text">Your analysis and reasoning — be specific about your view and the drivers behind it</span>
      </div>

      <!-- AI Suggestion Display -->
      {#if suggestion}
        <div class="suggestion-box">
          <div class="suggestion-header">
            <span class="suggestion-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              Suggested Improvement
            </span>
            <button type="button" class="btn-copy" on:click={copyToClipboard}>
              {#if copySuccess}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Copied!
              {:else}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy
              {/if}
            </button>
          </div>
          <div class="suggestion-text">
            {suggestion.improved_text}
          </div>
          <div class="suggestion-actions">
            <button type="button" class="btn-accept" on:click={acceptSuggestion}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Use This
            </button>
            <button type="button" class="btn-discard" on:click={discardSuggestion}>
              Discard
            </button>
          </div>
        </div>
      {/if}

      <!-- Advanced Settings (Collapsible) -->
      <div class="advanced-section">
        <button
          type="button"
          class="advanced-toggle"
          on:click={() => showAdvanced = !showAdvanced}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class:rotated={showAdvanced}
          >
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          Advanced Settings
          {#if position_text || target}
            <span class="has-values-indicator"></span>
          {/if}
        </button>

        {#if showAdvanced}
          <div class="advanced-content">
            <div class="form-group">
              <label for="position">
                Target Outlook
              </label>
              <textarea
                id="position"
                bind:value={position_text}
                placeholder="What scenario are you expecting? Price targets, timeline, key levels to watch..."
                rows="3"
              ></textarea>
              <span class="help-text">Your expected scenario — whether you're in a position or just monitoring</span>
            </div>

            <div class="form-group">
              <label for="target">
                Key Level or Milestone
              </label>
              <input
                id="target"
                type="text"
                bind:value={target}
                placeholder="e.g., 1.1200, $180, Q2 earnings, Fed meeting"
              />
              <span class="help-text">A specific price, date, or event you're watching for</span>
            </div>
          </div>
        {/if}
      </div>

      <div class="modal-actions">
        <button type="button" class="btn-secondary" on:click={onCancel}>
          Cancel
        </button>
        <button type="submit" class="btn-primary">
          {mode === 'create' ? 'Create Strategy' : 'Save Changes'}
        </button>
      </div>
    </form>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
  }

  .modal-content {
    background: var(--card-bg, white);
    border-radius: 12px;
    padding: 2rem;
    max-width: 900px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  @media (min-width: 1024px) {
    .modal-content {
      width: 70%;
      min-width: 700px;
    }
  }

  h2 {
    margin: 0 0 1rem 0;
    color: var(--text-color, black);
    font-size: 1.5rem;
  }

  /* Helper Tips Section */
  .helper-tips {
    display: flex;
    gap: 0.75rem;
    padding: 1rem;
    background: var(--hover-bg, #f8f9fa);
    border-radius: 8px;
    margin-bottom: 1.5rem;
    border-left: 3px solid var(--primary, #1976d2);
  }

  .tip-icon {
    color: var(--primary, #1976d2);
    flex-shrink: 0;
  }

  .tip-content p {
    margin: 0;
    font-size: 0.9rem;
    color: var(--text-color, black);
    line-height: 1.5;
  }

  .tip-content .tip-subtle {
    margin-top: 0.25rem;
    color: var(--text-muted, #666);
    font-size: 0.85rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .label-row label {
    margin-bottom: 0;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: var(--text-color, black);
  }

  .required {
    color: #e53935;
  }

  input, textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 8px;
    font-size: 1rem;
    font-family: inherit;
    background: var(--bg-color, white);
    color: var(--text-color, black);
    transition: border-color 0.2s;
  }

  input:focus, textarea:focus {
    outline: none;
    border-color: var(--primary, #1976d2);
  }

  input:disabled {
    background: var(--hover-bg, #f5f5f5);
    cursor: not-allowed;
  }

  textarea {
    resize: vertical;
    min-height: 100px;
  }

  .help-text {
    display: block;
    margin-top: 0.25rem;
    font-size: 0.875rem;
    color: var(--text-muted, #666);
  }

  /* Improve Button */
  .btn-improve {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.75rem;
    font-size: 0.85rem;
    font-weight: 500;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-improve:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .btn-improve:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Suggestion Box */
  .suggestion-box {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
    border: 1px solid rgba(102, 126, 234, 0.3);
    border-radius: 10px;
    padding: 1rem;
    margin-bottom: 1.5rem;
  }

  .suggestion-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .suggestion-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: #667eea;
    font-size: 0.9rem;
  }

  .btn-copy {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.6rem;
    font-size: 0.8rem;
    background: white;
    color: var(--text-muted, #666);
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-copy:hover {
    background: var(--hover-bg, #f5f5f5);
    color: var(--text-color, black);
  }

  .suggestion-text {
    background: white;
    border-radius: 6px;
    padding: 1rem;
    font-size: 0.95rem;
    line-height: 1.6;
    color: var(--text-color, black);
    white-space: pre-wrap;
    max-height: 200px;
    overflow-y: auto;
  }

  .suggestion-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 0.75rem;
  }

  .btn-accept {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
    font-weight: 600;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-accept:hover {
    background: #5a6fd6;
  }

  .btn-discard {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
    font-weight: 500;
    background: transparent;
    color: var(--text-muted, #666);
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-discard:hover {
    background: var(--hover-bg, #f5f5f5);
    color: var(--text-color, black);
  }

  /* Advanced Settings */
  .advanced-section {
    margin-bottom: 1.5rem;
    border-top: 1px solid var(--border-color, #e0e0e0);
    padding-top: 1rem;
  }

  .advanced-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0;
    background: transparent;
    border: none;
    color: var(--text-muted, #666);
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.2s;
  }

  .advanced-toggle:hover {
    color: var(--text-color, black);
  }

  .advanced-toggle svg {
    transition: transform 0.2s;
  }

  .advanced-toggle svg.rotated {
    transform: rotate(90deg);
  }

  .has-values-indicator {
    width: 6px;
    height: 6px;
    background: var(--primary, #1976d2);
    border-radius: 50%;
    margin-left: 0.25rem;
  }

  .advanced-content {
    margin-top: 1rem;
    padding-left: 1.5rem;
    border-left: 2px solid var(--border-color, #e0e0e0);
  }

  .advanced-content .form-group {
    margin-bottom: 1rem;
  }

  .advanced-content textarea {
    min-height: 80px;
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-color, #e0e0e0);
  }

  button {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }

  .btn-secondary {
    background: var(--hover-bg, #f5f5f5);
    color: var(--text-color, black);
  }

  .btn-secondary:hover {
    background: var(--border-color, #e0e0e0);
  }

  .btn-primary {
    background: var(--primary, #1976d2);
    color: white;
  }

  .btn-primary:hover {
    background: #1565c0;
  }
</style>
