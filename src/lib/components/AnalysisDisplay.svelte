<!-- AnalysisDisplay.svelte - Shared analysis sections display for strategies and topics -->
<script lang="ts">
  import { simpleMarkdown } from '$lib/utils/simpleMarkdown';
  import { linkifyIds } from '$lib/utils/linkifyIds';
  import { createEventDispatcher } from 'svelte';

  // Props
  export let sections: Record<string, string> = {};
  export let heroKey: string = 'executive_summary'; // Single hero key - caller decides which section is the hero
  export let showEditButtons: boolean = false;
  export let timestamp: string | null = null;
  export let openSections: Record<string, boolean> = {};

  const dispatch = createEventDispatcher();

  // Section title formatting
  const sectionTitleMap: Record<string, string> = {
    executive_summary: 'Executive Summary',
    house_view: 'House View',
    position_analysis: 'Position Analysis',
    risk_analysis: 'Risk Analysis',
    opportunity_analysis: 'Opportunity Analysis',
    recommendation: 'Recommendation',
    scenarios_and_catalysts: 'Scenarios & Catalysts',
    structuring_and_risk_management: 'Structuring & Risk Management',
    context_and_alignment: 'Context & Alignment',
    key_developments: 'Key Developments',
    market_dynamics: 'Market Dynamics',
    outlook: 'Outlook'
  };

  function formatSectionTitle(key: string): string {
    if (sectionTitleMap[key]) return sectionTitleMap[key];
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  function handleSuggestEdit(sectionKey: string, content: string) {
    dispatch('suggestEdit', {
      section: sectionKey,
      title: formatSectionTitle(sectionKey),
      content
    });
  }

  function handleSectionToggle(sectionName: string, isOpen: boolean) {
    dispatch('sectionToggle', { section: sectionName, isOpen });
  }

  function handleContentClick(event: MouseEvent) {
    dispatch('contentClick', event);
  }

  // Hero is shown if it exists in sections
  $: hasHero = sections[heroKey] && sections[heroKey].trim();

  // Format timestamp
  $: formattedTimestamp = timestamp
    ? new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;
</script>

{#if sections && Object.keys(sections).length > 0}
  <!-- Hero Section (always expanded) -->
  {#if hasHero}
    <div class="executive-summary-section">
      <h3 class="section-heading">{formatSectionTitle(heroKey)}</h3>
      <div class="executive-summary-content" on:click={handleContentClick}>
        {#each sections[heroKey].split('\n') as line}
          {@html linkifyIds(simpleMarkdown(line))}
        {/each}
      </div>
    </div>
  {/if}

  <!-- Analysis Sections Container -->
  <div class="analysis-sections-container">
    <div class="analysis-sections-header">
      <span class="analysis-sections-label">Analysis Sections</span>
      {#if formattedTimestamp}
        <span class="analysis-timestamp">Updated {formattedTimestamp}</span>
      {/if}
    </div>

    <!-- Collapsible sections (everything except the hero) -->
    {#each Object.entries(sections) as [sectionKey, content]}
      {#if sectionKey !== heroKey && content && content.trim()}
        <details
          class="analysis-card"
          open={!!openSections[sectionKey]}
          on:toggle={(event) => handleSectionToggle(sectionKey, event.currentTarget.open)}
        >
          <summary class="analysis-card-header">
            <span class="analysis-card-title">{formatSectionTitle(sectionKey)}</span>
            <span class="analysis-card-actions">
              {#if showEditButtons}
                <button
                  type="button"
                  class="suggest-changes-btn"
                  on:click|stopPropagation={() => handleSuggestEdit(sectionKey, content)}
                >
                  Suggest edits
                </button>
              {/if}
              <span class="analysis-card-chevron">›</span>
            </span>
          </summary>
          <div class="analysis-card-content" on:click={handleContentClick}>
            {#each content.split('\n') as line}
              {@html linkifyIds(simpleMarkdown(line))}
            {/each}
          </div>
        </details>
      {/if}
    {/each}
  </div>
{:else}
  <div class="no-analysis">
    <p>No analysis content available</p>
  </div>
{/if}

<style>
  /* Executive Summary - Hero card style */
  .executive-summary-section {
    margin-top: 1.75rem;
    padding: 2rem 2.25rem;
    background: linear-gradient(145deg, var(--card-bg, #ffffff) 0%, var(--hover-bg, #fafafa) 100%);
    border: 1px solid var(--border-color, #e5e5e7);
    border-radius: 20px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.03);
    position: relative;
    overflow: hidden;
  }

  .executive-summary-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary, #007aff) 0%, #5856d6 50%, #af52de 100%);
    border-radius: 20px 20px 0 0;
  }

  .executive-summary-section .section-heading {
    font-size: 1.25rem;
    font-weight: 700;
    text-transform: none;
    letter-spacing: -0.02em;
    color: var(--text-color, #1d1d1f);
    margin-bottom: 1.25rem;
  }

  :global(.dark) .executive-summary-section .section-heading {
    color: var(--text-color, #f5f5f7);
  }

  .executive-summary-content {
    font-size: 1.0625rem;
    line-height: 1.8;
    color: var(--text-color, #1d1d1f);
    font-weight: 400;
  }

  :global(.dark) .executive-summary-section {
    background: linear-gradient(145deg, var(--card-bg, #1c1c1e) 0%, #232326 100%);
    border-color: var(--border-color, #38383a);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
  }

  :global(.dark) .executive-summary-section::before {
    background: linear-gradient(90deg, #0a84ff 0%, #5e5ce6 50%, #bf5af2 100%);
  }

  :global(.dark) .executive-summary-content {
    color: var(--text-color, #f5f5f7);
  }

  /* Analysis Sections Container */
  .analysis-sections-container {
    margin-top: 1.75rem;
    padding: 1.75rem 2rem 2rem 2rem;
    border-radius: 20px;
    border: 1px solid var(--border-color, #e5e5e7);
    background: linear-gradient(145deg, var(--card-bg, #ffffff) 0%, var(--hover-bg, #fafafa) 100%);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
  }

  .analysis-sections-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color, #e5e5e7);
    margin-bottom: 0.5rem;
  }

  .analysis-sections-label {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted, #86868b);
  }

  .analysis-timestamp {
    font-size: 0.75rem;
    color: var(--text-muted, #86868b);
    font-weight: 500;
  }

  /* Individual analysis card */
  .analysis-card {
    background: var(--card-bg, #ffffff);
    border: 1px solid var(--border-color, #e5e5e7);
    border-radius: 14px;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .analysis-card:hover {
    border-color: var(--border-hover, #d1d1d6);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .analysis-card[open] {
    background: linear-gradient(145deg, var(--card-bg, #ffffff) 0%, #f8f9fa 100%);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04);
    border-color: rgba(0, 122, 255, 0.25);
  }

  .analysis-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.125rem 1.5rem;
    cursor: pointer;
    user-select: none;
    list-style: none;
    background: transparent;
    transition: background 0.2s ease;
  }

  .analysis-card-header::-webkit-details-marker {
    display: none;
  }

  .analysis-card-header:hover {
    background: var(--hover-bg, #f5f5f7);
  }

  .analysis-card-title {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--text-color, #1d1d1f);
    letter-spacing: -0.01em;
  }

  .analysis-card-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .suggest-changes-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    background: var(--primary, #007aff);
    color: #fff;
    border: none;
    border-radius: 999px;
    padding: 0.35rem 0.85rem;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    box-shadow: 0 4px 10px rgba(0, 122, 255, 0.25);
  }

  .suggest-changes-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 14px rgba(0, 122, 255, 0.35);
  }

  :global(.dark) .suggest-changes-btn {
    background: linear-gradient(90deg, #0a84ff 0%, #5e5ce6 100%);
    box-shadow: 0 6px 16px rgba(10, 132, 255, 0.35);
  }

  .analysis-card-chevron {
    font-size: 1.25rem;
    font-weight: 400;
    color: var(--text-muted, #86868b);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    line-height: 1;
  }

  .analysis-card[open] .analysis-card-chevron {
    transform: rotate(90deg);
    color: var(--primary, #007aff);
  }

  .analysis-card-content {
    padding: 1.5rem 2.25rem 2.25rem 2.25rem;
    font-size: 1.0625rem;
    line-height: 1.8;
    color: var(--text-color, #1d1d1f);
    animation: slideDown 0.25s ease-out;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Dark mode */
  :global(.dark) .analysis-sections-container {
    background: linear-gradient(145deg, var(--card-bg, #1c1c1e) 0%, #232326 100%);
    border-color: var(--border-color, #38383a);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  }

  :global(.dark) .analysis-card {
    background: var(--card-bg, #1c1c1e);
    border-color: var(--border-color, #38383a);
  }

  :global(.dark) .analysis-card:hover {
    border-color: var(--border-hover, #48484a);
  }

  :global(.dark) .analysis-card[open] {
    background: linear-gradient(145deg, #1c1c1e 0%, #252528 100%);
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.25);
    border-color: rgba(10, 132, 255, 0.4);
  }

  :global(.dark) .analysis-card-header:hover {
    background: var(--hover-bg, #2c2c2e);
  }

  :global(.dark) .analysis-card-title {
    color: var(--text-color, #f5f5f7);
  }

  :global(.dark) .analysis-card[open] .analysis-card-chevron {
    color: #0a84ff;
  }

  :global(.dark) .analysis-card-content {
    color: var(--text-color, #f5f5f7);
  }

  /* No analysis state */
  .no-analysis {
    margin-top: 1.75rem;
    padding: 3rem 2rem;
    text-align: center;
    background: var(--hover-bg, #f5f5f7);
    border-radius: 16px;
    color: var(--text-muted, #86868b);
  }

  :global(.dark) .no-analysis {
    background: var(--card-bg, #1c1c1e);
  }
</style>
