<script lang="ts">
  import { onMount } from 'svelte';

  export let findingId: string;
  export let onClose: () => void;

  let finding: any = null;
  let loading = true;
  let error = false;
  let findingSource: 'topic' | 'strategy' | null = null;

  const GRAPH_API_BASE = import.meta.env.VITE_GRAPH_API_URL || 'http://localhost:8001';
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

  // Determine finding type from ID prefix
  $: findingType = findingId?.startsWith('R_') ? 'risk' : 'opportunity';
  $: typeLabel = findingType === 'risk' ? 'Risk' : 'Opportunity';
  $: typeEmoji = findingType === 'risk' ? '🚨' : '✨';

  onMount(async () => {
    try {
      // Try graph API first (topic findings in Neo4j)
      let response = await fetch(`${GRAPH_API_BASE}/findings/${findingId}`);
      if (response.ok) {
        finding = await response.json();
        findingSource = 'topic';
      } else {
        // Fallback to backend API (strategy findings in JSON files)
        response = await fetch(`${API_BASE}/findings/${findingId}`);
        if (response.ok) {
          finding = await response.json();
          findingSource = 'strategy';
        } else {
          throw new Error('Finding not found in either location');
        }
      }
    } catch (e) {
      console.error('Error loading finding:', e);
      error = true;
    } finally {
      loading = false;
    }
  });
</script>

<div class="modal-overlay" on:click={onClose} role="presentation">
  <div class="modal-content {findingType}" on:click|stopPropagation role="dialog" aria-modal="true">
    <button class="close-button" on:click={onClose} aria-label="Close finding">×</button>

    {#if loading}
      <div class="loading">Loading finding...</div>
    {:else if error}
      <div class="error">Failed to load finding</div>
    {:else if finding}
      <div class="finding-content">
        <!-- Type badge -->
        <div class="type-badge {findingType}">
          {typeEmoji} {typeLabel}
        </div>

        <!-- Headline -->
        <h1 class="finding-headline">{finding.headline || 'Untitled Finding'}</h1>

        <!-- Metadata bar -->
        <div class="metadata-bar">
          <span class="metadata-item finding-id">ID: {finding.id || findingId}</span>
          <span class="metadata-item">Topic: {finding.topic_name || finding.topic_id || '-'}</span>
          {#if finding.confidence}
            <span class="metadata-item confidence {finding.confidence}">
              Confidence: {finding.confidence}
            </span>
          {/if}
          {#if finding.saved_at}
            <span class="metadata-item">Saved: {new Date(finding.saved_at).toLocaleDateString()}</span>
          {/if}
        </div>

        <!-- Rationale -->
        {#if finding.rationale}
          <div class="finding-section rationale">
            <h3>Rationale</h3>
            <p>{finding.rationale}</p>
          </div>
        {/if}

        <!-- Flow Path (causal chain) -->
        {#if finding.flow_path}
          <div class="finding-section flow-path">
            <h3>Causal Chain</h3>
            <div class="flow-path-content">
              {finding.flow_path}
            </div>
          </div>
        {/if}

        <!-- Evidence -->
        {#if finding.evidence && finding.evidence.length > 0}
          <div class="finding-section evidence">
            <h3>Evidence</h3>
            <ul class="evidence-list">
              {#each finding.evidence as item}
                <li>{item}</li>
              {/each}
            </ul>
          </div>
        {/if}

        <!-- Footer links -->
        <div class="finding-footer">
          {#if findingSource === 'topic' && finding.topic_id}
            <a href="/topics/{finding.topic_id}" class="context-link topic-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              View Topic: {finding.topic_name || finding.topic_id}
            </a>
          {:else if findingSource === 'strategy' && finding.strategy_id}
            <span class="context-link strategy-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              From Strategy: {finding.strategy_asset || finding.strategy_id}
            </span>
          {/if}
          {#if finding.target_topic}
            <span class="context-badge">
              Target: {finding.target_topic}
            </span>
          {/if}
        </div>
      </div>
    {/if}
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
    padding: 2rem;
  }

  .modal-content {
    background: var(--bg-color, white);
    border-radius: 12px;
    padding: 2rem;
    max-width: 700px;
    width: 100%;
    max-height: 85vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  .modal-content.risk {
    border-top: 4px solid #dc3545;
  }

  .modal-content.opportunity {
    border-top: 4px solid #28a745;
  }

  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 2rem;
    line-height: 1;
    cursor: pointer;
    color: var(--text-muted, #666);
    padding: 0.5rem;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s;
  }

  .close-button:hover {
    background: var(--hover-bg, #f0f0f0);
  }

  .loading,
  .error {
    text-align: center;
    padding: 3rem 2rem;
    color: var(--text-muted, #666);
    font-size: 1.1rem;
  }

  .error {
    color: #d32f2f;
  }

  .finding-content {
    padding-right: 2rem;
  }

  .type-badge {
    display: inline-block;
    padding: 0.4rem 0.9rem;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.5px;
    margin-bottom: 1rem;
  }

  .type-badge.risk {
    background: #ffeef0;
    color: #dc3545;
  }

  .type-badge.opportunity {
    background: #e6f7e9;
    color: #28a745;
  }

  .finding-headline {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-color, black);
    margin: 0 0 1rem 0;
    line-height: 1.3;
  }

  .metadata-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--border-color, #e0e0e0);
  }

  .metadata-item {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-muted, #666);
    font-size: 0.9rem;
  }

  .finding-id {
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 0.85rem;
  }

  .confidence.high {
    color: #28a745;
    font-weight: 600;
  }

  .confidence.medium {
    color: #ffc107;
    font-weight: 600;
  }

  .confidence.low {
    color: #dc3545;
    font-weight: 600;
  }

  .finding-section {
    margin-bottom: 1.5rem;
  }

  .finding-section h3 {
    margin: 0 0 0.75rem 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-color, black);
  }

  .finding-section p {
    margin: 0;
    line-height: 1.7;
    color: var(--text-color, black);
  }

  .rationale {
    background: var(--hover-bg, #f8f9fa);
    padding: 1.5rem;
    border-radius: 8px;
    border-left: 4px solid var(--primary, #1976d2);
  }

  .flow-path {
    background: #f0f4f8;
    padding: 1.5rem;
    border-radius: 8px;
  }

  .flow-path-content {
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 0.9rem;
    color: var(--text-color, black);
    line-height: 1.6;
    white-space: pre-wrap;
  }

  .evidence-list {
    margin: 0;
    padding-left: 1.5rem;
    line-height: 1.7;
  }

  .evidence-list li {
    margin-bottom: 0.5rem;
    color: var(--text-color, black);
  }

  .finding-footer {
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-color, #e0e0e0);
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
  }

  .context-link {
    color: var(--primary, #1976d2);
    text-decoration: none;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: var(--hover-bg, #f8f9fa);
    border-radius: 8px;
    transition: background-color 0.2s;
  }

  .context-link.topic-link:hover {
    background: var(--border-color, #e0e0e0);
  }

  .context-link.strategy-link {
    color: var(--text-muted, #666);
    cursor: default;
  }

  .context-badge {
    font-size: 0.85rem;
    padding: 0.4rem 0.8rem;
    background: var(--hover-bg, #f8f9fa);
    border-radius: 6px;
    color: var(--text-muted, #666);
  }

  :global(.dark) .modal-content {
    background: var(--bg-color, #1a1a1a);
  }

  :global(.dark) .rationale {
    background: var(--card-bg, #2a2a2a);
  }

  :global(.dark) .flow-path {
    background: var(--card-bg, #2a2a2a);
  }

  :global(.dark) .type-badge.risk {
    background: #3d1f22;
  }

  :global(.dark) .type-badge.opportunity {
    background: #1f3d22;
  }

  :global(.dark) .topic-link {
    background: var(--card-bg, #2a2a2a);
  }

  :global(.dark) .topic-link:hover {
    background: #3a3a3a;
  }
</style>
