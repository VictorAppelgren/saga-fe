<script lang="ts">
  import { onMount } from 'svelte';

  export let width = 700;
  export let height = 420;
  export let accentColor = '#2563eb';

  // THE STORY: SAGA is at the CENTER of the knowledge graph
  // Events flow in from the edges, propagate through entities,
  // SAGA at center sees ALL paths and identifies what affects YOUR portfolio

  interface GraphNode {
    id: number;
    x: number;
    y: number;
    label: string;
    type: 'event' | 'entity' | 'saga';
    ring: number; // 0 = outer (events), 1-2 = middle (entities), 3 = center (SAGA)
    angle: number;
    baseGlow: number;
    currentGlow: number;
    pulsePhase: number;
  }

  interface GraphEdge {
    from: number;
    to: number;
  }

  interface CascadeWave {
    id: number;
    path: number[];
    currentStep: number;
    progress: number;
    color: string;
    intensity: number;
  }

  interface Ripple {
    id: number;
    x: number;
    y: number;
    radius: number;
    opacity: number;
    color: string;
  }

  let nodes: GraphNode[] = [];
  let edges: GraphEdge[] = [];
  let cascades: CascadeWave[] = [];
  let ripples: Ripple[] = [];
  let animationFrame: number;
  let time = 0;
  let cascadeId = 0;
  let rippleId = 0;

  const centerX = width / 2;
  const centerY = height / 2;
  const sagaRadius = 50;
  const ring1Radius = 100; // Inner entity ring
  const ring2Radius = 160; // Outer entity ring
  const eventRadius = 220; // Event sources at edge

  // Event types with colors
  const eventTypes = [
    { label: 'Policy', color: '#8b5cf6' },
    { label: 'Supply', color: '#f59e0b' },
    { label: 'Market', color: '#ef4444' },
    { label: 'Credit', color: '#ec4899' },
    { label: 'Macro', color: '#06b6d4' },
    { label: 'Geo', color: '#22c55e' },
  ];

  onMount(() => {
    nodes = [];
    edges = [];
    let nodeId = 0;

    // SAGA at center (node 0)
    nodes.push({
      id: nodeId++,
      x: centerX,
      y: centerY,
      label: 'SAGA',
      type: 'saga',
      ring: 3,
      angle: 0,
      baseGlow: 0.5,
      currentGlow: 0.5,
      pulsePhase: 0,
    });

    // Inner ring entities (6 nodes)
    const innerLabels = ['Risk', 'Flow', 'Trade', 'Asset', 'Rate', 'FX'];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      nodes.push({
        id: nodeId++,
        x: centerX + Math.cos(angle) * ring1Radius,
        y: centerY + Math.sin(angle) * ring1Radius,
        label: innerLabels[i],
        type: 'entity',
        ring: 1,
        angle,
        baseGlow: 0.2,
        currentGlow: 0.2,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    // Outer ring entities (12 nodes)
    const outerLabels = ['Corp', 'Bank', 'Fund', 'Sector', 'Region', 'Index', 'Bond', 'Equity', 'Comm', 'Deriv', 'Chain', 'Gov'];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 - Math.PI / 2 + Math.PI / 12;
      nodes.push({
        id: nodeId++,
        x: centerX + Math.cos(angle) * ring2Radius,
        y: centerY + Math.sin(angle) * ring2Radius,
        label: outerLabels[i],
        type: 'entity',
        ring: 2,
        angle,
        baseGlow: 0.15,
        currentGlow: 0.15,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    // Event sources at edge (6 nodes)
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      nodes.push({
        id: nodeId++,
        x: centerX + Math.cos(angle) * eventRadius,
        y: centerY + Math.sin(angle) * eventRadius,
        label: eventTypes[i].label,
        type: 'event',
        ring: 0,
        angle,
        baseGlow: 0.3,
        currentGlow: 0.3,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    // Create edges: SAGA connects to inner ring
    for (let i = 1; i <= 6; i++) {
      edges.push({ from: 0, to: i });
    }

    // Inner ring connects to nearby outer ring nodes
    for (let i = 1; i <= 6; i++) {
      const outerStart = 7 + (i - 1) * 2;
      edges.push({ from: i, to: outerStart % 12 + 7 });
      edges.push({ from: i, to: (outerStart + 1) % 12 + 7 });
    }

    // Outer ring connects to events
    for (let i = 7; i <= 18; i++) {
      const eventIdx = Math.floor((i - 7) / 2) % 6;
      edges.push({ from: i, to: 19 + eventIdx });
    }

    // Cross-connections in outer ring
    for (let i = 7; i < 18; i++) {
      if (Math.random() < 0.4) {
        edges.push({ from: i, to: i + 1 });
      }
    }

    // Find path from event toward SAGA
    function findPathToSaga(startId: number): number[] {
      const path = [startId];
      let current = startId;
      const visited = new Set([startId]);

      while (current !== 0 && path.length < 6) {
        const currentNode = nodes.find(n => n.id === current);
        if (!currentNode) break;

        // Find connected nodes closer to center
        const neighbors = edges
          .filter(e => e.from === current || e.to === current)
          .map(e => e.from === current ? e.to : e.from)
          .filter(id => !visited.has(id));

        // Prefer nodes with smaller ring number (closer to SAGA)
        const sorted = neighbors.sort((a, b) => {
          const nodeA = nodes.find(n => n.id === a);
          const nodeB = nodes.find(n => n.id === b);
          return (nodeB?.ring || 0) - (nodeA?.ring || 0);
        });

        if (sorted.length === 0) break;
        const next = sorted[0];
        path.push(next);
        visited.add(next);
        current = next;
      }

      return path;
    }

    const animate = () => {
      time++;

      // Spawn cascades from random events
      if (Math.random() < 0.02) {
        const eventNodeId = 19 + Math.floor(Math.random() * 6);
        const path = findPathToSaga(eventNodeId);

        if (path.length >= 3) {
          const eventNode = nodes.find(n => n.id === eventNodeId);
          const eventType = eventTypes.find(e => e.label === eventNode?.label);

          cascades = [...cascades, {
            id: cascadeId++,
            path,
            currentStep: 0,
            progress: 0,
            color: eventType?.color || accentColor,
            intensity: 0.8 + Math.random() * 0.2,
          }];
        }
      }

      // Animate cascades
      cascades = cascades.map(cascade => {
        let newProgress = cascade.progress + 0.03;
        let newStep = cascade.currentStep;

        if (newProgress >= 1) {
          newProgress = 0;
          newStep++;

          if (newStep < cascade.path.length) {
            const node = nodes.find(n => n.id === cascade.path[newStep]);
            if (node) {
              ripples = [...ripples, {
                id: rippleId++,
                x: node.x,
                y: node.y,
                radius: node.type === 'saga' ? 15 : 8,
                opacity: node.type === 'saga' ? 1 : 0.7,
                color: cascade.color,
              }];
            }
          }
        }

        return { ...cascade, progress: newProgress, currentStep: newStep };
      }).filter(c => c.currentStep < c.path.length - 1);

      // Update node glows
      nodes = nodes.map(node => {
        let maxGlow = node.baseGlow;

        cascades.forEach(cascade => {
          const nodeIdx = cascade.path.indexOf(node.id);
          if (nodeIdx >= 0 && nodeIdx <= cascade.currentStep) {
            const recency = cascade.currentStep - nodeIdx;
            const glowBoost = Math.max(0, 0.7 - recency * 0.15) * cascade.intensity;
            maxGlow = Math.max(maxGlow, node.baseGlow + glowBoost);
          }
        });

        const newPulse = node.pulsePhase + (node.type === 'saga' ? 0.05 : 0.03);

        return {
          ...node,
          currentGlow: node.currentGlow + (maxGlow - node.currentGlow) * 0.1,
          pulsePhase: newPulse,
        };
      });

      // Animate ripples
      ripples = ripples
        .map(r => ({ ...r, radius: r.radius + 1.5, opacity: r.opacity - 0.02 }))
        .filter(r => r.opacity > 0);

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrame);
  });

  function getNodeColor(node: GraphNode): string {
    if (node.type === 'saga') return accentColor;
    if (node.type === 'event') {
      return eventTypes.find(e => e.label === node.label)?.color || accentColor;
    }
    return accentColor;
  }

  function getNodeSize(node: GraphNode): number {
    if (node.type === 'saga') return sagaRadius;
    if (node.type === 'event') return 20;
    if (node.ring === 1) return 16;
    return 12;
  }
</script>

<svg
  class="cascade-story-animation"
  viewBox="0 0 {width} {height}"
  width="100%"
  height="100%"
  preserveAspectRatio="xMidYMid slice"
>
  <defs>
    <filter id="cascadeGlow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>

    <filter id="sagaGlowBig" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="12" result="blur" />
      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>

    <radialGradient id="sagaBgGradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color={accentColor} stop-opacity="0.15" />
      <stop offset="50%" stop-color={accentColor} stop-opacity="0.05" />
      <stop offset="100%" stop-color={accentColor} stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Dark background -->
  <rect x="0" y="0" width={width} height={height} fill="#0a0a0f" />

  <!-- Concentric rings (subtle) -->
  {#each [ring1Radius, ring2Radius, eventRadius] as r, i}
    <circle
      cx={centerX}
      cy={centerY}
      r={r}
      fill="none"
      stroke={accentColor}
      stroke-width="0.5"
      opacity={0.08 - i * 0.02}
      stroke-dasharray="4 8"
    />
  {/each}

  <!-- SAGA glow background -->
  <circle
    cx={centerX}
    cy={centerY}
    r={sagaRadius * 2.5}
    fill="url(#sagaBgGradient)"
  />

  <!-- All edges (background) -->
  {#each edges as edge}
    {@const fromNode = nodes.find(n => n.id === edge.from)}
    {@const toNode = nodes.find(n => n.id === edge.to)}
    {#if fromNode && toNode}
      <line
        x1={fromNode.x}
        y1={fromNode.y}
        x2={toNode.x}
        y2={toNode.y}
        stroke={accentColor}
        stroke-width={fromNode.id === 0 || toNode.id === 0 ? 1 : 0.5}
        opacity={fromNode.id === 0 || toNode.id === 0 ? 0.12 : 0.06}
      />
    {/if}
  {/each}

  <!-- Active cascade paths -->
  {#each cascades as cascade}
    {#each cascade.path.slice(0, cascade.currentStep + 1) as nodeId, stepIdx}
      {#if stepIdx < cascade.currentStep || (stepIdx === cascade.currentStep && cascade.progress > 0)}
        {@const fromNode = nodes.find(n => n.id === cascade.path[stepIdx])}
        {@const toNode = stepIdx < cascade.path.length - 1 ? nodes.find(n => n.id === cascade.path[stepIdx + 1]) : null}
        {#if fromNode && toNode}
          {@const isCurrentStep = stepIdx === cascade.currentStep}
          {@const lineProgress = isCurrentStep ? cascade.progress : 1}
          <line
            x1={fromNode.x}
            y1={fromNode.y}
            x2={fromNode.x + (toNode.x - fromNode.x) * lineProgress}
            y2={fromNode.y + (toNode.y - fromNode.y) * lineProgress}
            stroke={cascade.color}
            stroke-width={toNode.id === 0 ? 3 : 2}
            opacity={0.7 * cascade.intensity}
          />
          {#if isCurrentStep}
            <circle
              cx={fromNode.x + (toNode.x - fromNode.x) * cascade.progress}
              cy={fromNode.y + (toNode.y - fromNode.y) * cascade.progress}
              r={toNode.id === 0 ? 5 : 4}
              fill={cascade.color}
              opacity={0.95}
              filter="url(#cascadeGlow)"
            />
          {/if}
        {/if}
      {/if}
    {/each}
  {/each}

  <!-- Ripples -->
  {#each ripples as ripple}
    <circle
      cx={ripple.x}
      cy={ripple.y}
      r={ripple.radius}
      fill="none"
      stroke={ripple.color}
      stroke-width={ripple.radius < 20 ? 2 : 3}
      opacity={ripple.opacity}
    />
  {/each}

  <!-- Nodes (outer to inner) -->
  {#each nodes.filter(n => n.type === 'event') as node}
    {@const color = getNodeColor(node)}
    {@const size = getNodeSize(node)}
    <circle cx={node.x} cy={node.y} r={size * 1.5} fill={color} opacity={node.currentGlow * 0.3} filter="url(#cascadeGlow)" />
    <circle cx={node.x} cy={node.y} r={size} fill="#0a0a0f" stroke={color} stroke-width="1.5" opacity="0.9" />
    <circle cx={node.x} cy={node.y} r={size - 4} fill={color} opacity={node.currentGlow * 0.5} />
    <circle cx={node.x} cy={node.y} r={size * 0.3} fill={color} opacity={0.6 + node.currentGlow * 0.4} />
    <text x={node.x} y={node.y + size + 14} text-anchor="middle" font-size="8" fill={color} opacity="0.7" font-weight="600">{node.label}</text>
  {/each}

  {#each nodes.filter(n => n.type === 'entity') as node}
    {@const color = getNodeColor(node)}
    {@const size = getNodeSize(node)}
    <circle cx={node.x} cy={node.y} r={size * 1.5} fill={color} opacity={node.currentGlow * 0.25} />
    <circle cx={node.x} cy={node.y} r={size} fill="#0a0a0f" stroke={color} stroke-width={node.currentGlow > 0.3 ? 1.5 : 1} opacity={0.7 + node.currentGlow * 0.3} />
    <circle cx={node.x} cy={node.y} r={size - 3} fill={color} opacity={node.currentGlow * 0.4} />
    <text x={node.x} y={node.y + size + 12} text-anchor="middle" font-size="7" fill={color} opacity="0.5" font-weight="500">{node.label}</text>
  {/each}

  <!-- SAGA at center - PROMINENT -->
  {@const sagaNode = nodes.find(n => n.type === 'saga')}
  {#if sagaNode}
    {@const pulseOffset = Math.sin(sagaNode.pulsePhase) * 5}

    <!-- Outer pulse rings -->
    <circle cx={centerX} cy={centerY} r={sagaRadius + 20 + pulseOffset} fill="none" stroke={accentColor} stroke-width="1" opacity={0.2 + sagaNode.currentGlow * 0.1} />
    <circle cx={centerX} cy={centerY} r={sagaRadius + 35 + pulseOffset * 0.7} fill="none" stroke={accentColor} stroke-width="0.5" opacity={0.1 + sagaNode.currentGlow * 0.05} />

    <!-- Main SAGA circle -->
    <circle cx={centerX} cy={centerY} r={sagaRadius} fill="#0a0a0f" stroke={accentColor} stroke-width="3" opacity="1" />

    <!-- Inner glow -->
    <circle cx={centerX} cy={centerY} r={sagaRadius - 8} fill={accentColor} opacity={0.2 + sagaNode.currentGlow * 0.3} filter="url(#sagaGlowBig)" />

    <!-- Core -->
    <circle cx={centerX} cy={centerY} r={sagaRadius * 0.45} fill={accentColor} opacity={0.5 + sagaNode.currentGlow * 0.3 + Math.sin(sagaNode.pulsePhase * 2) * 0.1} />

    <!-- SAGA label -->
    <text x={centerX} y={centerY + 5} text-anchor="middle" font-size="16" fill="#fff" font-weight="700" opacity="1">SAGA</text>

    <!-- "All-seeing" text -->
    <text x={centerX} y={centerY + sagaRadius + 20} text-anchor="middle" font-size="8" fill={accentColor} opacity="0.5" font-weight="500">KNOWLEDGE GRAPH</text>
  {/if}
</svg>

<style>
  .cascade-story-animation {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
