<script lang="ts">
  import { onMount } from 'svelte';

  export let width = 700;
  export let height = 420;
  export let accentColor = '#2563eb';

  // THE STORY: Generic chain reactions through a knowledge graph
  // Multiple cascades happening continuously - not one specific scenario
  // Shows how ANY event can propagate through connected entities

  interface GraphNode {
    id: number;
    x: number;
    y: number;
    label: string;
    type: 'event' | 'entity' | 'sector' | 'exposure' | 'alert';
    baseGlow: number;
    currentGlow: number;
  }

  interface GraphEdge {
    from: number;
    to: number;
    weight: number;
  }

  interface CascadeWave {
    id: number;
    path: number[]; // Node IDs in order
    currentStep: number;
    progress: number; // 0-1 within current step
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

  // Event types that can trigger cascades (generic)
  const eventTypes = [
    { label: 'Policy', color: '#8b5cf6' },
    { label: 'Supply', color: '#f59e0b' },
    { label: 'Market', color: '#ef4444' },
    { label: 'Credit', color: '#ec4899' },
    { label: 'Macro', color: '#06b6d4' },
  ];

  onMount(() => {
    // Create a more organic knowledge graph layout
    // Left side: Event triggers
    // Middle: Entity network (interconnected)
    // Right side: Portfolio exposure -> SAGA

    const leftX = 70;
    const middleStartX = 160;
    const middleEndX = width - 200;
    const rightX = width - 100;
    const sagaX = width - 50;

    // Event trigger nodes (left side)
    const eventNodes: GraphNode[] = eventTypes.map((evt, i) => ({
      id: i,
      x: leftX,
      y: 80 + i * 65,
      label: evt.label,
      type: 'event' as const,
      baseGlow: 0.3,
      currentGlow: 0.3,
    }));

    // Middle entity network (organic layout)
    const middleNodeCount = 18;
    const middleNodes: GraphNode[] = [];
    const entityLabels = ['Corp A', 'Corp B', 'Supplier', 'Region', 'Sector', 'Index', 'Rate', 'Flow', 'Trade', 'Risk', 'Asset', 'Bond', 'Equity', 'FX', 'Comm', 'Bank', 'Fund', 'Deriv'];

    for (let i = 0; i < middleNodeCount; i++) {
      const row = Math.floor(i / 6);
      const col = i % 6;
      const xOffset = (Math.sin(i * 1.7) * 20);
      const yOffset = (Math.cos(i * 2.3) * 15);

      middleNodes.push({
        id: eventTypes.length + i,
        x: middleStartX + col * ((middleEndX - middleStartX) / 5) + xOffset,
        y: 70 + row * 100 + yOffset,
        label: entityLabels[i],
        type: 'entity' as const,
        baseGlow: 0.15,
        currentGlow: 0.15,
      });
    }

    // Exposure nodes (right side)
    const exposureNodes: GraphNode[] = [
      { id: eventTypes.length + middleNodeCount, x: rightX, y: height / 2 - 50, label: 'Exposure', type: 'exposure' as const, baseGlow: 0.2, currentGlow: 0.2 },
      { id: eventTypes.length + middleNodeCount + 1, x: rightX, y: height / 2 + 50, label: 'Risk', type: 'exposure' as const, baseGlow: 0.2, currentGlow: 0.2 },
    ];

    // SAGA alert node
    const sagaNode: GraphNode = {
      id: eventTypes.length + middleNodeCount + 2,
      x: sagaX,
      y: height / 2,
      label: 'SAGA',
      type: 'alert' as const,
      baseGlow: 0.4,
      currentGlow: 0.4,
    };

    nodes = [...eventNodes, ...middleNodes, ...exposureNodes, sagaNode];

    // Create edges - events connect to nearby middle nodes
    edges = [];

    // Events -> Middle (each event connects to 2-3 middle nodes)
    eventNodes.forEach((evt, i) => {
      const targets = [i * 3, i * 3 + 1, (i * 3 + 6) % middleNodeCount];
      targets.forEach(t => {
        if (t < middleNodeCount) {
          edges.push({ from: evt.id, to: eventTypes.length + t, weight: 0.6 + Math.random() * 0.4 });
        }
      });
    });

    // Middle nodes interconnected
    for (let i = 0; i < middleNodeCount; i++) {
      for (let j = i + 1; j < middleNodeCount; j++) {
        const n1 = middleNodes[i];
        const n2 = middleNodes[j];
        const dist = Math.sqrt((n1.x - n2.x) ** 2 + (n1.y - n2.y) ** 2);
        if (dist < 120 && Math.random() < 0.5) {
          edges.push({ from: n1.id, to: n2.id, weight: 0.4 + Math.random() * 0.3 });
        }
      }
    }

    // Middle -> Exposure
    middleNodes.slice(-6).forEach((n, i) => {
      const targetExposure = i < 3 ? exposureNodes[0] : exposureNodes[1];
      edges.push({ from: n.id, to: targetExposure.id, weight: 0.5 + Math.random() * 0.3 });
    });

    // Exposure -> SAGA
    exposureNodes.forEach(exp => {
      edges.push({ from: exp.id, to: sagaNode.id, weight: 0.8 });
    });

    // Find path through graph using BFS-like approach
    function findCascadePath(startId: number): number[] {
      const path = [startId];
      let current = startId;
      const visited = new Set([startId]);

      for (let step = 0; step < 6; step++) {
        const nextOptions = edges
          .filter(e => e.from === current || e.to === current)
          .map(e => e.from === current ? e.to : e.from)
          .filter(id => !visited.has(id));

        if (nextOptions.length === 0) break;

        const next = nextOptions[Math.floor(Math.random() * nextOptions.length)];
        path.push(next);
        visited.add(next);
        current = next;
      }

      return path;
    }

    // Spawn new cascades periodically
    const spawnCascade = () => {
      const eventIdx = Math.floor(Math.random() * eventTypes.length);
      const path = findCascadePath(eventIdx);

      if (path.length >= 3) {
        cascades = [...cascades, {
          id: cascadeId++,
          path,
          currentStep: 0,
          progress: 0,
          color: eventTypes[eventIdx].color,
          intensity: 0.7 + Math.random() * 0.3,
        }];
      }
    };

    const animate = () => {
      time++;

      // Spawn new cascades randomly (multiple can be active)
      if (Math.random() < 0.025) {
        spawnCascade();
      }

      // Animate cascades
      cascades = cascades.map(cascade => {
        let newProgress = cascade.progress + 0.025;
        let newStep = cascade.currentStep;

        if (newProgress >= 1) {
          newProgress = 0;
          newStep++;

          // Create ripple at reached node
          if (newStep < cascade.path.length) {
            const node = nodes.find(n => n.id === cascade.path[newStep]);
            if (node) {
              ripples = [...ripples, {
                id: rippleId++,
                x: node.x,
                y: node.y,
                radius: 5,
                opacity: 0.7,
                color: cascade.color,
              }];
            }
          }
        }

        return { ...cascade, progress: newProgress, currentStep: newStep };
      }).filter(c => c.currentStep < c.path.length - 1);

      // Update node glows based on active cascades
      nodes = nodes.map(node => {
        let maxGlow = node.baseGlow;

        cascades.forEach(cascade => {
          const nodeIdx = cascade.path.indexOf(node.id);
          if (nodeIdx >= 0 && nodeIdx <= cascade.currentStep) {
            const recency = cascade.currentStep - nodeIdx;
            const glowBoost = Math.max(0, 0.6 - recency * 0.15) * cascade.intensity;
            maxGlow = Math.max(maxGlow, node.baseGlow + glowBoost);
          }
        });

        return { ...node, currentGlow: node.currentGlow + (maxGlow - node.currentGlow) * 0.1 };
      });

      // Animate ripples
      ripples = ripples
        .map(r => ({ ...r, radius: r.radius + 1.2, opacity: r.opacity - 0.02 }))
        .filter(r => r.opacity > 0);

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  });

  function getNodeColor(node: GraphNode): string {
    if (node.type === 'event') {
      const evt = eventTypes.find(e => e.label === node.label);
      return evt?.color || accentColor;
    }
    if (node.type === 'alert') return '#22c55e';
    if (node.type === 'exposure') return '#f59e0b';
    return accentColor;
  }

  function getNodeSize(node: GraphNode): number {
    if (node.type === 'event') return 18;
    if (node.type === 'alert') return 28;
    if (node.type === 'exposure') return 20;
    return 12;
  }
</script>

<svg
  class="cascade-story-animation"
  viewBox="0 0 {width} {height}"
  width={width}
  height={height}
>
  <defs>
    <filter id="cascadeGlow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>

    <filter id="sagaGlow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
  </defs>

  <!-- Dark background -->
  <rect x="0" y="0" width={width} height={height} fill="#0a0a0f" />

  <!-- Subtle grid -->
  {#each Array(Math.floor(width / 60)) as _, i}
    <line x1={i * 60} y1="0" x2={i * 60} y2={height} stroke={accentColor} stroke-width="0.3" opacity="0.08" />
  {/each}
  {#each Array(Math.floor(height / 60)) as _, i}
    <line x1="0" y1={i * 60} x2={width} y2={i * 60} stroke={accentColor} stroke-width="0.3" opacity="0.08" />
  {/each}

  <!-- Section labels -->
  <text x="70" y="35" text-anchor="middle" font-size="9" fill={accentColor} opacity="0.4" font-weight="600">EVENTS</text>
  <text x={width / 2} y="35" text-anchor="middle" font-size="9" fill={accentColor} opacity="0.4" font-weight="600">KNOWLEDGE GRAPH</text>
  <text x={width - 75} y="35" text-anchor="middle" font-size="9" fill={accentColor} opacity="0.4" font-weight="600">PORTFOLIO</text>

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
        stroke-width="1"
        opacity="0.08"
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
            stroke-width="2"
            opacity={0.6 * cascade.intensity}
          />
          <!-- Traveling particle -->
          {#if isCurrentStep}
            <circle
              cx={fromNode.x + (toNode.x - fromNode.x) * cascade.progress}
              cy={fromNode.y + (toNode.y - fromNode.y) * cascade.progress}
              r="4"
              fill={cascade.color}
              opacity={0.9}
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
      stroke-width="2"
      opacity={ripple.opacity}
    />
  {/each}

  <!-- Nodes -->
  {#each nodes as node}
    {@const color = getNodeColor(node)}
    {@const size = getNodeSize(node)}
    {@const isAlert = node.type === 'alert'}

    <!-- Glow -->
    <circle
      cx={node.x}
      cy={node.y}
      r={size * 1.8}
      fill={color}
      opacity={node.currentGlow * 0.3}
      filter={isAlert ? 'url(#sagaGlow)' : 'url(#cascadeGlow)'}
    />

    <!-- Node body -->
    <circle
      cx={node.x}
      cy={node.y}
      r={size}
      fill="#0a0a0f"
      stroke={color}
      stroke-width={node.currentGlow > 0.3 ? 2 : 1}
      opacity={0.6 + node.currentGlow * 0.4}
    />

    <!-- Inner fill -->
    <circle
      cx={node.x}
      cy={node.y}
      r={size - 3}
      fill={color}
      opacity={node.currentGlow * 0.4}
    />

    <!-- Center bright spot -->
    <circle
      cx={node.x}
      cy={node.y}
      r={size * 0.3}
      fill={isAlert ? '#fff' : color}
      opacity={0.5 + node.currentGlow * 0.5}
    />

    <!-- Label -->
    <text
      x={node.x}
      y={node.y + size + 12}
      text-anchor="middle"
      font-size={node.type === 'alert' ? '9' : '7'}
      fill={color}
      opacity={0.6 + node.currentGlow * 0.3}
      font-weight={node.type === 'alert' ? '700' : '500'}
    >
      {node.label}
    </text>
  {/each}
</svg>

<style>
  .cascade-story-animation {
    display: block;
  }
</style>
