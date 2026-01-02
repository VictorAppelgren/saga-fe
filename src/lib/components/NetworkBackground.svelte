<script lang="ts">
  import { onMount } from 'svelte';

  export let opacity = 0.15;
  export let color = '#000000';

  // Static nodes for a cleaner, more subtle effect
  const nodes = [
    { x: 10, y: 20, size: 2 },
    { x: 25, y: 15, size: 1.5 },
    { x: 40, y: 25, size: 2.5 },
    { x: 55, y: 10, size: 1.8 },
    { x: 70, y: 22, size: 2 },
    { x: 85, y: 18, size: 1.5 },
    { x: 15, y: 45, size: 2.2 },
    { x: 30, y: 50, size: 1.8 },
    { x: 50, y: 40, size: 3 },
    { x: 65, y: 48, size: 2 },
    { x: 80, y: 42, size: 1.5 },
    { x: 92, y: 50, size: 2 },
    { x: 8, y: 70, size: 1.8 },
    { x: 22, y: 75, size: 2 },
    { x: 38, y: 68, size: 2.5 },
    { x: 52, y: 72, size: 1.5 },
    { x: 68, y: 65, size: 2.2 },
    { x: 82, y: 78, size: 1.8 },
    { x: 95, y: 70, size: 2 },
    { x: 18, y: 90, size: 1.5 },
    { x: 45, y: 88, size: 2 },
    { x: 75, y: 92, size: 1.8 },
  ];

  const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
    [0, 6], [1, 7], [2, 8], [3, 8], [4, 9], [5, 10],
    [6, 7], [7, 8], [8, 9], [9, 10], [10, 11],
    [6, 12], [7, 13], [8, 14], [9, 15], [10, 16], [11, 17],
    [12, 13], [13, 14], [14, 15], [15, 16], [16, 17], [17, 18],
    [12, 19], [14, 20], [17, 21],
  ];

  let pulseIndex = 0;
  let mounted = false;

  onMount(() => {
    mounted = true;
    // Cycle through connections for pulse effect
    const interval = setInterval(() => {
      pulseIndex = (pulseIndex + 1) % connections.length;
    }, 2000);
    return () => clearInterval(interval);
  });
</script>

<svg
  class="network-bg"
  viewBox="0 0 100 100"
  preserveAspectRatio="xMidYMid slice"
  style="opacity: {opacity}"
>
  <defs>
    <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color={color} stop-opacity="0">
        <animate attributeName="stop-opacity" values="0;0.5;0" dur="2s" repeatCount="indefinite" />
      </stop>
      <stop offset="50%" stop-color={color} stop-opacity="0.5">
        <animate attributeName="stop-opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
      </stop>
      <stop offset="100%" stop-color={color} stop-opacity="0">
        <animate attributeName="stop-opacity" values="0;0.5;0" dur="2s" repeatCount="indefinite" />
      </stop>
    </linearGradient>
  </defs>

  <!-- Connection lines -->
  {#each connections as [from, to], i}
    <line
      x1={nodes[from].x}
      y1={nodes[from].y}
      x2={nodes[to].x}
      y2={nodes[to].y}
      stroke={color}
      stroke-width="0.2"
      opacity="0.3"
    >
      {#if i === pulseIndex}
        <animate
          attributeName="stroke-width"
          values="0.2;0.6;0.2"
          dur="2s"
          repeatCount="1"
        />
        <animate
          attributeName="opacity"
          values="0.3;0.8;0.3"
          dur="2s"
          repeatCount="1"
        />
      {/if}
    </line>
  {/each}

  <!-- Nodes -->
  {#each nodes as node, i}
    <circle
      cx={node.x}
      cy={node.y}
      r={node.size}
      fill={color}
      opacity="0.2"
    >
      <animate
        attributeName="opacity"
        values="0.2;0.4;0.2"
        dur="{3 + i * 0.2}s"
        repeatCount="indefinite"
      />
    </circle>
    <!-- Bright center -->
    <circle
      cx={node.x}
      cy={node.y}
      r={node.size * 0.4}
      fill={color}
      opacity="0.5"
    >
      <animate
        attributeName="opacity"
        values="0.5;0.8;0.5"
        dur="{3 + i * 0.2}s"
        repeatCount="indefinite"
      />
    </circle>
  {/each}
</svg>

<style>
  .network-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
</style>
