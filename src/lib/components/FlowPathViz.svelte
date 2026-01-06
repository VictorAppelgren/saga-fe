<!-- FlowPathViz.svelte - Vertical flow path with motivations -->
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
  <div class="flow-vertical" class:compact>
    {#each nodes as node, i}
      <div class="flow-step">
        <div class="step-line">
          <div class="step-node" class:has-direction={node.direction}>
            <span class="node-label">{node.name}</span>
            {#if node.direction}
              <span class="direction-indicator {node.direction}">
                {node.direction === 'up' ? '↑' : '↓'}
              </span>
            {/if}
          </div>
          {#if i < nodes.length - 1}
            <div class="connector">
              <svg viewBox="0 0 24 40" class="arrow-svg">
                <path d="M12 0 L12 32 M6 26 L12 34 L18 26"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"/>
              </svg>
            </div>
          {/if}
        </div>
      </div>
    {/each}
  </div>
{/if}

<style>
  .flow-vertical {
    display: flex;
    flex-direction: column;
    gap: 0;
    padding: 0.5rem 0;
  }

  .flow-vertical.compact {
    padding: 0.25rem 0;
  }

  .flow-step {
    display: flex;
    align-items: flex-start;
  }

  .step-line {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 180px;
  }

  .compact .step-line {
    min-width: 140px;
  }

  .step-node {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    background: linear-gradient(145deg, var(--node-bg-start, #ffffff) 0%, var(--node-bg-end, #f8f8fa) 100%);
    border: 1px solid var(--border-color, #e5e5e7);
    border-radius: 10px;
    min-width: 160px;
    justify-content: center;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  }

  .compact .step-node {
    padding: 0.5rem 0.75rem;
    min-width: 120px;
    border-radius: 8px;
  }

  .step-node:hover {
    border-color: var(--primary, #007aff);
    box-shadow: 0 2px 8px rgba(0, 122, 255, 0.12);
  }

  .node-label {
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--text-color, #1d1d1f);
    text-transform: capitalize;
  }

  .compact .node-label {
    font-size: 0.75rem;
  }

  .direction-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .compact .direction-indicator {
    width: 16px;
    height: 16px;
    font-size: 0.625rem;
  }

  .direction-indicator.up {
    background: rgba(52, 199, 89, 0.15);
    color: #34c759;
  }

  .direction-indicator.down {
    background: rgba(255, 59, 48, 0.15);
    color: #ff3b30;
  }

  .connector {
    display: flex;
    justify-content: center;
    padding: 0.25rem 0;
  }

  .arrow-svg {
    width: 20px;
    height: 32px;
    color: var(--arrow-color, #c7c7cc);
  }

  .compact .arrow-svg {
    width: 16px;
    height: 24px;
  }

  /* Dark mode */
  :global(.dark) .flow-vertical {
    --node-bg-start: #2c2c2e;
    --node-bg-end: #1c1c1e;
    --border-color: #48484a;
    --text-color: #f5f5f7;
    --arrow-color: #636366;
  }

  :global(.dark) .step-node:hover {
    border-color: #0a84ff;
    box-shadow: 0 2px 8px rgba(10, 132, 255, 0.2);
  }

  :global(.dark) .direction-indicator.up {
    background: rgba(48, 209, 88, 0.2);
    color: #30d158;
  }

  :global(.dark) .direction-indicator.down {
    background: rgba(255, 69, 58, 0.2);
    color: #ff453a;
  }
</style>
