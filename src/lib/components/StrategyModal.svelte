<script lang="ts">
  import type { StrategyDetail, ImproveStrategyTextResponse, Stance, PositionStatus, TimeHorizon } from '$lib/api/strategies';
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
  let stance: Stance = strategy?.stance || null;
  let positionStatus: PositionStatus = strategy?.position_status || null;
  let timeHorizon: TimeHorizon = strategy?.time_horizon || null;

  // Advanced settings toggle
  let showAdvanced = !!(position_text || target);

  // AI Improvement state
  let isImproving = false;
  let suggestion: ImproveStrategyTextResponse | null = null;
  let improveError: string | null = null;
  let copySuccess = false;

  function handleSubmit() {
    onSave({
      asset_primary,
      strategy_text,
      position_text,
      target,
      stance,
      position_status: positionStatus,
      time_horizon: timeHorizon
    });
  }

  function selectStance(newStance: Stance) {
    stance = newStance;
  }

  async function handleImproveThesis() {
    if (!strategy || !onImproveThesis) return;

    isImproving = true;
    suggestion = null;
    improveError = null;

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
      // Show user-friendly error message
      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('504')) {
          improveError = 'Request timed out. The AI is taking longer than expected. Please try again.';
        } else if (error.message.includes('500')) {
          improveError = 'Server error. Please try again in a moment.';
        } else {
          improveError = 'Failed to improve thesis. Please try again.';
        }
      } else {
        improveError = 'An unexpected error occurred. Please try again.';
      }
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

      <!-- Stance Selector -->
      <div class="form-group">
        <label>
          Your View
        </label>
        <div class="stance-selector">
          <button
            type="button"
            class="stance-btn stance-bull"
            class:selected={stance === 'bull'}
            on:click={() => selectStance('bull')}
          >
            <span class="stance-icon">&#8593;</span>
            <span class="stance-label">Bullish</span>
            <span class="stance-desc">I believe it goes UP</span>
          </button>
          <button
            type="button"
            class="stance-btn stance-neutral"
            class:selected={stance === 'neutral' || stance === null}
            on:click={() => selectStance('neutral')}
          >
            <span class="stance-icon">&#8596;</span>
            <span class="stance-label">Neutral</span>
            <span class="stance-desc">Monitoring / No view</span>
          </button>
          <button
            type="button"
            class="stance-btn stance-bear"
            class:selected={stance === 'bear'}
            on:click={() => selectStance('bear')}
          >
            <span class="stance-icon">&#8595;</span>
            <span class="stance-label">Bearish</span>
            <span class="stance-desc">I believe it goes DOWN</span>
          </button>
        </div>
        <span class="help-text">Your directional view helps Saga tailor analysis to validate or challenge your thesis</span>
      </div>

      <!-- Position Status Selector -->
      <div class="form-group">
        <label>
          Position Status
        </label>
        <div class="position-selector">
          <button
            type="button"
            class="position-btn"
            class:selected={positionStatus === 'monitoring' || positionStatus === null}
            on:click={() => positionStatus = 'monitoring'}
          >
            <span class="position-icon">&#128065;</span>
            <span class="position-label">Monitoring</span>
            <span class="position-desc">Gathering intel, no thesis yet</span>
          </button>
          <button
            type="button"
            class="position-btn"
            class:selected={positionStatus === 'looking_to_enter'}
            on:click={() => positionStatus = 'looking_to_enter'}
          >
            <span class="position-icon">&#127919;</span>
            <span class="position-label">Looking to Enter</span>
            <span class="position-desc">Have thesis, seeking confirmation</span>
          </button>
          <button
            type="button"
            class="position-btn"
            class:selected={positionStatus === 'in_position'}
            on:click={() => positionStatus = 'in_position'}
          >
            <span class="position-icon">&#9989;</span>
            <span class="position-label">In Position</span>
            <span class="position-desc">Holding, watch for invalidation</span>
          </button>
        </div>
        <span class="help-text">Where are you in your investment journey with this asset?</span>
      </div>

      <!-- Time Horizon Selector (only show when looking to enter or in position) -->
      {#if positionStatus === 'looking_to_enter' || positionStatus === 'in_position'}
        <div class="form-group">
          <label>
            Time Horizon
          </label>
          <div class="horizon-selector">
            <button
              type="button"
              class="horizon-btn"
              class:selected={timeHorizon === 'weeks'}
              on:click={() => timeHorizon = 'weeks'}
            >
              <span class="horizon-label">Weeks</span>
              <span class="horizon-desc">1-4 weeks</span>
            </button>
            <button
              type="button"
              class="horizon-btn"
              class:selected={timeHorizon === 'months'}
              on:click={() => timeHorizon = 'months'}
            >
              <span class="horizon-label">Months</span>
              <span class="horizon-desc">1-6 months</span>
            </button>
            <button
              type="button"
              class="horizon-btn"
              class:selected={timeHorizon === 'quarters'}
              on:click={() => timeHorizon = 'quarters'}
            >
              <span class="horizon-label">Quarters</span>
              <span class="horizon-desc">6+ months</span>
            </button>
          </div>
          <span class="help-text">Swing trading to buy-and-hold (no intraday)</span>
        </div>
      {/if}

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

      <!-- AI Error Display -->
      {#if improveError}
        <div class="error-box">
          <span class="error-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </span>
          <span class="error-text">{improveError}</span>
          <button type="button" class="error-dismiss" on:click={() => improveError = null}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      {/if}

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

  /* Stance Selector */
  .stance-selector {
    display: flex;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  .stance-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 1rem 0.75rem;
    border: 2px solid var(--border-color, #e0e0e0);
    border-radius: 12px;
    background: var(--bg-color, white);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .stance-btn:hover {
    border-color: var(--text-muted, #999);
  }

  .stance-btn.selected {
    border-width: 2px;
  }

  .stance-icon {
    font-size: 1.5rem;
    font-weight: bold;
    line-height: 1;
  }

  .stance-label {
    font-weight: 600;
    font-size: 0.95rem;
  }

  .stance-desc {
    font-size: 0.75rem;
    color: var(--text-muted, #666);
    text-align: center;
  }

  /* Bull stance */
  .stance-bull.selected {
    border-color: #22c55e;
    background: rgba(34, 197, 94, 0.08);
  }

  .stance-bull.selected .stance-icon,
  .stance-bull.selected .stance-label {
    color: #16a34a;
  }

  .stance-bull:hover:not(.selected) {
    border-color: rgba(34, 197, 94, 0.5);
  }

  /* Bear stance */
  .stance-bear.selected {
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.08);
  }

  .stance-bear.selected .stance-icon,
  .stance-bear.selected .stance-label {
    color: #dc2626;
  }

  .stance-bear:hover:not(.selected) {
    border-color: rgba(239, 68, 68, 0.5);
  }

  /* Neutral stance */
  .stance-neutral.selected {
    border-color: #6b7280;
    background: rgba(107, 114, 128, 0.08);
  }

  .stance-neutral.selected .stance-icon,
  .stance-neutral.selected .stance-label {
    color: #4b5563;
  }

  .stance-neutral:hover:not(.selected) {
    border-color: rgba(107, 114, 128, 0.5);
  }

  /* Position Status Selector */
  .position-selector {
    display: flex;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  .position-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.85rem 0.5rem;
    border: 2px solid var(--border-color, #e0e0e0);
    border-radius: 12px;
    background: var(--bg-color, white);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .position-btn:hover {
    border-color: var(--text-muted, #999);
  }

  .position-btn.selected {
    border-color: #3b82f6;
    background: rgba(59, 130, 246, 0.08);
  }

  .position-icon {
    font-size: 1.25rem;
    line-height: 1;
  }

  .position-label {
    font-weight: 600;
    font-size: 0.85rem;
    color: var(--text-color, black);
  }

  .position-btn.selected .position-label {
    color: #2563eb;
  }

  .position-desc {
    font-size: 0.7rem;
    color: var(--text-muted, #666);
    text-align: center;
    line-height: 1.2;
  }

  /* Time Horizon Selector */
  .horizon-selector {
    display: flex;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  .horizon-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
    padding: 0.75rem 0.5rem;
    border: 2px solid var(--border-color, #e0e0e0);
    border-radius: 10px;
    background: var(--bg-color, white);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .horizon-btn:hover {
    border-color: var(--text-muted, #999);
  }

  .horizon-btn.selected {
    border-color: #8b5cf6;
    background: rgba(139, 92, 246, 0.08);
  }

  .horizon-label {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--text-color, black);
  }

  .horizon-btn.selected .horizon-label {
    color: #7c3aed;
  }

  .horizon-desc {
    font-size: 0.75rem;
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

  /* Error Box */
  .error-box {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    margin-bottom: 1rem;
    color: #dc2626;
  }

  .error-icon {
    flex-shrink: 0;
  }

  .error-text {
    flex: 1;
    font-size: 0.9rem;
  }

  .error-dismiss {
    flex-shrink: 0;
    padding: 0.25rem;
    background: transparent;
    border: none;
    color: #dc2626;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s;
  }

  .error-dismiss:hover {
    opacity: 1;
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
