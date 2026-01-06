<!-- FlowPathViz.svelte - Vertical flow visualization (nodes only) -->
<script lang="ts">
  export let flowPath: string = '';
  export let compact: boolean = false;

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
  <div class="flow-container" class:compact>
    {#each nodes as node, i}
      <!-- Node -->
      <div class="step-node" class:has-direction={node.direction}>
        <span class="node-label">{node.name}</span>
        {#if node.direction}
          <span class="direction-badge {node.direction}">
            {node.direction === 'up' ? '↑' : '↓'}
          </span>
        {/if}
      </div>

      <!-- Connector arrow between nodes -->
      {#if i < nodes.length - 1}
        <div class="connector">
          <svg class="arrow-svg" viewBox="0 0 24 28" fill="none">
            <path
              d="M12 0 L12 20 M6 14 L12 22 L18 14"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      {/if}
    {/each}
  </div>
{/if}

<style>
  .flow-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
  }

  .step-node {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    max-width: 200px;
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
    max-width: 160px;
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
    line-height: 1.3;
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

  .connector {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 28px;
  }

  .compact .connector {
    height: 22px;
  }

  .arrow-svg {
    width: 24px;
    height: 28px;
    color: var(--arrow-color, #c7c7cc);
  }

  .compact .arrow-svg {
    width: 20px;
    height: 22px;
  }

  /* Dark mode */
  :global(.dark) .flow-container {
    --node-bg: #2c2c2e;
    --node-bg-end: #1c1c1e;
    --border-color: #48484a;
    --text-color: #f5f5f7;
    --arrow-color: #636366;
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
</style>
