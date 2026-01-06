<!-- FlowPathViz.svelte - Vertical flow with aligned evidence -->
<script lang="ts">
  export let flowPath: string = '';
  export let evidence: ParsedEvidence[] = [];
  export let compact: boolean = false;

  interface ParsedEvidence {
    excerpt: string;
    source: string;
    relevance?: string;
  }

  interface FlowNode {
    name: string;
    direction: 'up' | 'down' | null;
  }

  function parseFlowPath(path: string): FlowNode[] {
    if (!path) return [];

    return path.split('→').map(segment => {
      const trimmed = segment.trim();
      const hasUp = trimmed.includes('↑');
      const hasDown = trimmed.includes('↓');
      const direction: 'up' | 'down' | null = hasUp ? 'up' : hasDown ? 'down' : null;

      return {
        name: trimmed.replace(/[↑↓]/g, '').trim().replace(/_/g, ' '),
        direction
      };
    }).filter(node => node.name.length > 0);
  }

  $: nodes = parseFlowPath(flowPath);
</script>

{#if nodes.length > 0}
  <div class="flow-evidence-grid" class:compact>
    {#each nodes as node, i}
      <div class="flow-row">
        <!-- Left: Flow node -->
        <div class="flow-node-col">
          <div class="node-wrapper">
            <div class="step-node" class:has-direction={node.direction}>
              <span class="node-label">{node.name}</span>
              {#if node.direction}
                <span class="direction-badge {node.direction}">
                  {node.direction === 'up' ? '↑' : '↓'}
                </span>
              {/if}
            </div>
            {#if i < nodes.length - 1}
              <div class="connector-line"></div>
            {/if}
          </div>
        </div>

        <!-- Right: Evidence for this node -->
        <div class="evidence-col">
          {#if evidence[i]}
            <div class="evidence-card">
              <p class="evidence-text">"{evidence[i].excerpt}"</p>
              {#if evidence[i].relevance}
                <p class="evidence-link">→ {evidence[i].relevance}</p>
              {/if}
            </div>
          {:else}
            <div class="evidence-placeholder"></div>
          {/if}
        </div>
      </div>
    {/each}
  </div>
{/if}

<style>
  .flow-evidence-grid {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .flow-row {
    display: grid;
    grid-template-columns: minmax(140px, 200px) 1fr;
    gap: 1.5rem;
    align-items: flex-start;
  }

  .compact .flow-row {
    grid-template-columns: minmax(120px, 160px) 1fr;
    gap: 1rem;
  }

  .flow-node-col {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .node-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  .step-node {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.75rem 1rem;
    background: linear-gradient(145deg, var(--node-bg, #ffffff) 0%, var(--node-bg-end, #f8f8fa) 100%);
    border: 1px solid var(--border-color, #e5e5e7);
    border-radius: 10px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    transition: all 0.2s ease;
  }

  .compact .step-node {
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
  }

  .step-node:hover {
    border-color: var(--primary, #007aff);
    box-shadow: 0 2px 8px rgba(0, 122, 255, 0.1);
  }

  .node-label {
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--text-color, #1d1d1f);
    text-transform: capitalize;
    text-align: center;
  }

  .compact .node-label {
    font-size: 0.75rem;
  }

  .direction-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    font-size: 0.6875rem;
    font-weight: 700;
    flex-shrink: 0;
  }

  .compact .direction-badge {
    width: 16px;
    height: 16px;
    font-size: 0.625rem;
  }

  .direction-badge.up {
    background: rgba(52, 199, 89, 0.15);
    color: #34c759;
  }

  .direction-badge.down {
    background: rgba(255, 59, 48, 0.15);
    color: #ff3b30;
  }

  .connector-line {
    width: 2px;
    height: 24px;
    background: linear-gradient(to bottom, var(--border-color, #d1d1d6), var(--border-color, #d1d1d6) 60%, transparent);
    margin: 0.25rem 0;
  }

  .compact .connector-line {
    height: 16px;
  }

  .evidence-col {
    display: flex;
    align-items: flex-start;
    min-height: 60px;
    padding: 0.25rem 0;
  }

  .evidence-card {
    flex: 1;
  }

  .evidence-text {
    font-size: 0.8125rem;
    color: var(--text-color, #1d1d1f);
    line-height: 1.5;
    margin: 0 0 0.375rem 0;
    font-style: italic;
  }

  .compact .evidence-text {
    font-size: 0.75rem;
  }

  .evidence-link {
    font-size: 0.75rem;
    color: var(--primary, #007aff);
    font-weight: 500;
    margin: 0;
  }

  .compact .evidence-link {
    font-size: 0.6875rem;
  }

  .evidence-placeholder {
    height: 1px;
  }

  /* Dark mode */
  :global(.dark) .flow-evidence-grid {
    --node-bg: #2c2c2e;
    --node-bg-end: #1c1c1e;
    --border-color: #48484a;
    --text-color: #f5f5f7;
  }

  :global(.dark) .step-node:hover {
    border-color: #0a84ff;
    box-shadow: 0 2px 8px rgba(10, 132, 255, 0.15);
  }

  :global(.dark) .direction-badge.up {
    background: rgba(48, 209, 88, 0.2);
    color: #30d158;
  }

  :global(.dark) .direction-badge.down {
    background: rgba(255, 69, 58, 0.2);
    color: #ff453a;
  }

  :global(.dark) .evidence-text {
    color: var(--text-color, #f5f5f7);
  }

  :global(.dark) .evidence-link {
    color: #0a84ff;
  }

  /* Mobile: stack vertically */
  @media (max-width: 640px) {
    .flow-row {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }

    .flow-node-col {
      align-items: flex-start;
    }

    .step-node {
      width: auto;
      display: inline-flex;
    }

    .connector-line {
      display: none;
    }

    .evidence-col {
      padding-left: 1rem;
      border-left: 2px solid var(--border-color, #e5e5e7);
      margin-bottom: 1rem;
    }
  }
</style>
