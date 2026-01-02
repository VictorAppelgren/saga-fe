<script lang="ts">
  import { onMount } from 'svelte';

  export let nodeCount = 35;
  export let accentColor = '#0066FF';

  interface Node {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
  }

  interface Connection {
    from: number;
    to: number;
    opacity: number;
  }

  let nodes: Node[] = [];
  let connections: Connection[] = [];
  let pulses: { x: number; y: number; progress: number; targetX: number; targetY: number }[] = [];
  let mounted = false;
  let animationFrame: number;

  onMount(() => {
    mounted = true;
    initializeNodes();
    animate();

    // Add pulses periodically
    const pulseInterval = setInterval(() => {
      if (connections.length > 0) {
        const randomConn = connections[Math.floor(Math.random() * connections.length)];
        const fromNode = nodes.find(n => n.id === randomConn.from);
        const toNode = nodes.find(n => n.id === randomConn.to);
        if (fromNode && toNode) {
          pulses = [...pulses, {
            x: fromNode.x,
            y: fromNode.y,
            targetX: toNode.x,
            targetY: toNode.y,
            progress: 0
          }];
        }
      }
    }, 800);

    return () => {
      cancelAnimationFrame(animationFrame);
      clearInterval(pulseInterval);
    };
  });

  function initializeNodes() {
    // Create nodes with random positions
    nodes = Array.from({ length: nodeCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.02,
      vy: (Math.random() - 0.5) * 0.02,
      size: Math.random() * 2 + 1.5,
      opacity: Math.random() * 0.5 + 0.3
    }));

    // Create connections between nearby nodes
    updateConnections();
  }

  function updateConnections() {
    connections = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 25) {
          connections.push({
            from: nodes[i].id,
            to: nodes[j].id,
            opacity: Math.max(0, 1 - dist / 25) * 0.3
          });
        }
      }
    }
  }

  function animate() {
    // Update node positions
    nodes = nodes.map(node => {
      let newX = node.x + node.vx;
      let newY = node.y + node.vy;

      // Bounce off edges
      if (newX < 0 || newX > 100) node.vx *= -1;
      if (newY < 0 || newY > 100) node.vy *= -1;

      newX = Math.max(0, Math.min(100, newX));
      newY = Math.max(0, Math.min(100, newY));

      return { ...node, x: newX, y: newY };
    });

    // Update connections
    updateConnections();

    // Update pulses
    pulses = pulses
      .map(p => ({ ...p, progress: p.progress + 0.025 }))
      .filter(p => p.progress < 1);

    animationFrame = requestAnimationFrame(animate);
  }

  function getPulsePosition(pulse: typeof pulses[0]) {
    return {
      x: pulse.x + (pulse.targetX - pulse.x) * pulse.progress,
      y: pulse.y + (pulse.targetY - pulse.y) * pulse.progress
    };
  }
</script>

<svg
  class="network-svg"
  viewBox="0 0 100 100"
  preserveAspectRatio="xMidYMid slice"
>
  <defs>
    <!-- Gradient for connections -->
    <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color={accentColor} stop-opacity="0.1" />
      <stop offset="50%" stop-color={accentColor} stop-opacity="0.3" />
      <stop offset="100%" stop-color={accentColor} stop-opacity="0.1" />
    </linearGradient>

    <!-- Glow filter for pulses -->
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Radial gradient for nodes -->
    <radialGradient id="nodeGradient">
      <stop offset="0%" stop-color={accentColor} stop-opacity="0.8" />
      <stop offset="100%" stop-color={accentColor} stop-opacity="0.2" />
    </radialGradient>
  </defs>

  <!-- Connection lines -->
  {#each connections as conn}
    {@const fromNode = nodes.find(n => n.id === conn.from)}
    {@const toNode = nodes.find(n => n.id === conn.to)}
    {#if fromNode && toNode}
      <line
        x1={fromNode.x}
        y1={fromNode.y}
        x2={toNode.x}
        y2={toNode.y}
        stroke={accentColor}
        stroke-width="0.15"
        opacity={conn.opacity}
      />
    {/if}
  {/each}

  <!-- Nodes -->
  {#each nodes as node}
    <circle
      cx={node.x}
      cy={node.y}
      r={node.size}
      fill="url(#nodeGradient)"
      opacity={node.opacity}
    />
    <!-- Inner bright core -->
    <circle
      cx={node.x}
      cy={node.y}
      r={node.size * 0.3}
      fill={accentColor}
      opacity={node.opacity * 0.8}
    />
  {/each}

  <!-- Traveling pulses -->
  {#each pulses as pulse}
    {@const pos = getPulsePosition(pulse)}
    <circle
      cx={pos.x}
      cy={pos.y}
      r="1.2"
      fill={accentColor}
      opacity={1 - pulse.progress}
      filter="url(#glow)"
    />
  {/each}
</svg>

<style>
  .network-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
</style>
