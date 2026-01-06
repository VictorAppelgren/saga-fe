<!-- FlowPathViz.svelte - Clean Apple-style SVG flow path visualization -->
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

      return {
        name: trimmed.replace(/[↑↓]/g, '').trim().replace(/_/g, ' '),
        direction: hasUp ? 'up' : hasDown ? 'down' : null
      };
    }).filter(node => node.name.length > 0);
  }

  $: nodes = parseFlowPath(flowPath);
  $: nodeWidth = compact ? 100 : 140;
  $: nodeHeight = compact ? 36 : 48;
  $: nodeGap = compact ? 24 : 36;
  $: totalWidth = nodes.length * nodeWidth + (nodes.length - 1) * nodeGap;
  $: viewBoxWidth = Math.max(totalWidth + 40, 200);
  $: viewBoxHeight = compact ? 56 : 72;
</script>

{#if nodes.length > 0}
  <div class="flow-path-container" class:compact>
    <svg
      viewBox="0 0 {viewBoxWidth} {viewBoxHeight}"
      class="flow-svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <!-- Gradient for nodes -->
        <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:var(--node-bg-start, #f8f8fa);stop-opacity:1" />
          <stop offset="100%" style="stop-color:var(--node-bg-end, #f0f0f2);stop-opacity:1" />
        </linearGradient>

        <!-- Arrow marker -->
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          <polygon
            points="0 0, 8 3, 0 6"
            fill="var(--arrow-color, #c7c7cc)"
          />
        </marker>
      </defs>

      {#each nodes as node, i}
        {@const x = 20 + i * (nodeWidth + nodeGap)}
        {@const y = (viewBoxHeight - nodeHeight) / 2}

        <!-- Node rectangle -->
        <g class="flow-node" transform="translate({x}, {y})">
          <rect
            width={nodeWidth}
            height={nodeHeight}
            rx={compact ? 8 : 10}
            ry={compact ? 8 : 10}
            class="node-rect"
          />

          <!-- Node text -->
          <text
            x={nodeWidth / 2}
            y={nodeHeight / 2}
            class="node-text"
            dominant-baseline="central"
            text-anchor="middle"
          >
            {node.name.length > (compact ? 12 : 16)
              ? node.name.slice(0, compact ? 11 : 15) + '…'
              : node.name}
          </text>

          <!-- Direction indicator -->
          {#if node.direction}
            <g transform="translate({nodeWidth - (compact ? 14 : 18)}, {(nodeHeight - (compact ? 16 : 20)) / 2})">
              <circle
                cx={compact ? 8 : 10}
                cy={compact ? 8 : 10}
                r={compact ? 8 : 10}
                class="direction-bg {node.direction}"
              />
              <text
                x={compact ? 8 : 10}
                y={compact ? 9 : 11}
                class="direction-arrow"
                dominant-baseline="central"
                text-anchor="middle"
              >
                {node.direction === 'up' ? '↑' : '↓'}
              </text>
            </g>
          {/if}
        </g>

        <!-- Connecting arrow -->
        {#if i < nodes.length - 1}
          {@const arrowStartX = x + nodeWidth + 4}
          {@const arrowEndX = x + nodeWidth + nodeGap - 4}
          {@const arrowY = viewBoxHeight / 2}
          <line
            x1={arrowStartX}
            y1={arrowY}
            x2={arrowEndX}
            y2={arrowY}
            class="arrow-line"
            marker-end="url(#arrowhead)"
          />
        {/if}
      {/each}
    </svg>
  </div>
{/if}

<style>
  .flow-path-container {
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 0.5rem 0;
    scrollbar-width: thin;
    scrollbar-color: var(--border-color, #e5e5e7) transparent;
  }

  .flow-path-container::-webkit-scrollbar {
    height: 4px;
  }

  .flow-path-container::-webkit-scrollbar-track {
    background: transparent;
  }

  .flow-path-container::-webkit-scrollbar-thumb {
    background: var(--border-color, #e5e5e7);
    border-radius: 2px;
  }

  .compact {
    padding: 0.25rem 0;
  }

  .flow-svg {
    display: block;
    min-width: 100%;
    height: auto;
    max-height: 72px;
  }

  .compact .flow-svg {
    max-height: 56px;
  }

  .node-rect {
    fill: url(#nodeGradient);
    stroke: var(--border-color, #e5e5e7);
    stroke-width: 1;
    transition: all 0.2s ease;
  }

  .flow-node:hover .node-rect {
    stroke: var(--primary, #007aff);
    stroke-width: 1.5;
  }

  .node-text {
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
    font-size: 11px;
    font-weight: 500;
    fill: var(--text-color, #1d1d1f);
    pointer-events: none;
  }

  .direction-bg {
    transition: all 0.2s ease;
  }

  .direction-bg.up {
    fill: rgba(52, 199, 89, 0.15);
  }

  .direction-bg.down {
    fill: rgba(255, 59, 48, 0.15);
  }

  .direction-arrow {
    font-size: 10px;
    font-weight: 700;
    pointer-events: none;
  }

  .direction-bg.up + .direction-arrow {
    fill: #34c759;
  }

  .direction-bg.down + .direction-arrow {
    fill: #ff3b30;
  }

  .arrow-line {
    stroke: var(--arrow-color, #c7c7cc);
    stroke-width: 1.5;
    stroke-linecap: round;
  }

  /* Dark mode */
  :global(.dark) .flow-path-container {
    --node-bg-start: #2c2c2e;
    --node-bg-end: #1c1c1e;
    --arrow-color: #48484a;
    --border-color: #48484a;
    --text-color: #f5f5f7;
  }

  :global(.dark) .direction-bg.up {
    fill: rgba(48, 209, 88, 0.2);
  }

  :global(.dark) .direction-bg.down {
    fill: rgba(255, 69, 58, 0.2);
  }

  :global(.dark) .direction-bg.up + .direction-arrow {
    fill: #30d158;
  }

  :global(.dark) .direction-bg.down + .direction-arrow {
    fill: #ff453a;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .flow-svg {
      max-height: 56px;
    }

    .node-text {
      font-size: 10px;
    }
  }
</style>
