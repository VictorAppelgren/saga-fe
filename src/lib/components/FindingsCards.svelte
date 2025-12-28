<!-- FindingsCards.svelte - Display risk and opportunity findings as cards -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export interface Finding {
    headline: string;
    rationale?: string;
    confidence?: string; // "high" | "medium" | "low"
    flow_path?: string;
    evidence?: string;
    added_at?: string;
  }

  // Props
  export let risks: Finding[] = [];
  export let opportunities: Finding[] = [];

  const dispatch = createEventDispatcher();

  function handleDiscuss(finding: Finding, type: 'risk' | 'opportunity') {
    dispatch('discuss', { finding, type });
  }

  function getConfidenceClass(confidence: string | undefined): string {
    if (!confidence) return '';
    const lower = confidence.toLowerCase();
    if (lower === 'high') return 'confidence-high';
    if (lower === 'medium') return 'confidence-medium';
    if (lower === 'low') return 'confidence-low';
    return '';
  }

  function formatConfidence(confidence: string | undefined): string {
    if (!confidence) return '';
    return confidence.charAt(0).toUpperCase() + confidence.slice(1).toLowerCase();
  }

  $: hasFindings = risks.length > 0 || opportunities.length > 0;
</script>

{#if hasFindings}
  <div class="findings-container">
    <!-- Risks Section -->
    {#if risks.length > 0}
      <div class="findings-section risks-section">
        <div class="findings-header">
          <span class="findings-icon">⚠️</span>
          <h3 class="findings-title">Active Risks</h3>
          <span class="findings-count">{risks.length}</span>
        </div>
        <div class="findings-grid">
          {#each risks as risk}
            <div class="finding-card risk-card">
              <div class="finding-header">
                {#if risk.confidence}
                  <span class="confidence-badge {getConfidenceClass(risk.confidence)}">
                    {formatConfidence(risk.confidence)}
                  </span>
                {/if}
              </div>
              <h4 class="finding-headline">{risk.headline}</h4>
              {#if risk.rationale}
                <p class="finding-rationale">{risk.rationale}</p>
              {/if}
              <button class="discuss-btn" on:click={() => handleDiscuss(risk, 'risk')}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                </svg>
                Discuss with Saga
              </button>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Opportunities Section -->
    {#if opportunities.length > 0}
      <div class="findings-section opportunities-section">
        <div class="findings-header">
          <span class="findings-icon">💡</span>
          <h3 class="findings-title">Opportunities</h3>
          <span class="findings-count">{opportunities.length}</span>
        </div>
        <div class="findings-grid">
          {#each opportunities as opportunity}
            <div class="finding-card opportunity-card">
              <div class="finding-header">
                {#if opportunity.confidence}
                  <span class="confidence-badge {getConfidenceClass(opportunity.confidence)}">
                    {formatConfidence(opportunity.confidence)}
                  </span>
                {/if}
              </div>
              <h4 class="finding-headline">{opportunity.headline}</h4>
              {#if opportunity.rationale}
                <p class="finding-rationale">{opportunity.rationale}</p>
              {/if}
              <button class="discuss-btn" on:click={() => handleDiscuss(opportunity, 'opportunity')}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                </svg>
                Discuss with Saga
              </button>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .findings-container {
    margin-top: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .findings-section {
    background: linear-gradient(145deg, var(--card-bg, #ffffff) 0%, var(--hover-bg, #fafafa) 100%);
    border: 1px solid var(--border-color, #e5e5e7);
    border-radius: 16px;
    padding: 1.25rem 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }

  .risks-section {
    border-left: 4px solid #ff3b30;
  }

  .opportunities-section {
    border-left: 4px solid #34c759;
  }

  :global(.dark) .findings-section {
    background: linear-gradient(145deg, var(--card-bg, #1c1c1e) 0%, #232326 100%);
    border-color: var(--border-color, #38383a);
  }

  :global(.dark) .risks-section {
    border-left-color: #ff453a;
  }

  :global(.dark) .opportunities-section {
    border-left-color: #30d158;
  }

  .findings-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .findings-icon {
    font-size: 1.125rem;
  }

  .findings-title {
    font-size: 0.875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-color, #1d1d1f);
    margin: 0;
  }

  :global(.dark) .findings-title {
    color: var(--text-color, #f5f5f7);
  }

  .findings-count {
    background: var(--surface-variant, #f0f0f2);
    color: var(--text-muted, #86868b);
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.125rem 0.5rem;
    border-radius: 999px;
  }

  :global(.dark) .findings-count {
    background: var(--surface-variant, #3a3a3c);
  }

  .findings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
  }

  .finding-card {
    background: var(--card-bg, #ffffff);
    border: 1px solid var(--border-color, #e5e5e7);
    border-radius: 12px;
    padding: 1rem 1.25rem;
    transition: all 0.2s ease;
  }

  .finding-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }

  .risk-card {
    border-top: 3px solid #ff3b30;
  }

  .opportunity-card {
    border-top: 3px solid #34c759;
  }

  :global(.dark) .finding-card {
    background: var(--card-bg, #1c1c1e);
    border-color: var(--border-color, #48484a);
  }

  :global(.dark) .risk-card {
    border-top-color: #ff453a;
  }

  :global(.dark) .opportunity-card {
    border-top-color: #30d158;
  }

  .finding-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 0.5rem;
  }

  .confidence-badge {
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
  }

  .confidence-high {
    background: rgba(255, 59, 48, 0.12);
    color: #ff3b30;
  }

  .confidence-medium {
    background: rgba(255, 149, 0, 0.12);
    color: #ff9500;
  }

  .confidence-low {
    background: rgba(52, 199, 89, 0.12);
    color: #34c759;
  }

  :global(.dark) .confidence-high {
    background: rgba(255, 69, 58, 0.2);
    color: #ff453a;
  }

  :global(.dark) .confidence-medium {
    background: rgba(255, 159, 10, 0.2);
    color: #ff9f0a;
  }

  :global(.dark) .confidence-low {
    background: rgba(48, 209, 88, 0.2);
    color: #30d158;
  }

  .finding-headline {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-color, #1d1d1f);
    margin: 0 0 0.5rem 0;
    line-height: 1.4;
  }

  :global(.dark) .finding-headline {
    color: var(--text-color, #f5f5f7);
  }

  .finding-rationale {
    font-size: 0.875rem;
    color: var(--text-muted, #86868b);
    margin: 0 0 1rem 0;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .discuss-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    background: transparent;
    border: 1px solid var(--border-color, #e5e5e7);
    border-radius: 8px;
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--primary, #007aff);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .discuss-btn:hover {
    background: var(--primary, #007aff);
    color: white;
    border-color: var(--primary, #007aff);
  }

  :global(.dark) .discuss-btn {
    border-color: var(--border-color, #48484a);
    color: #0a84ff;
  }

  :global(.dark) .discuss-btn:hover {
    background: #0a84ff;
    border-color: #0a84ff;
    color: white;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .findings-section {
      padding: 1rem;
    }

    .findings-grid {
      grid-template-columns: 1fr;
    }

    .finding-card {
      padding: 0.875rem 1rem;
    }
  }
</style>
