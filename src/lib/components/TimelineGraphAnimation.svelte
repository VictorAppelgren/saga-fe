<script lang="ts">
  import { onMount } from 'svelte';

  export let width = 500;
  export let height = 350;
  export let accentColor = '#2563eb';

  interface Entity {
    id: number;
    x: number;
    y: number;
    size: number;
    label: string;
    activity: number;
  }

  interface Connection {
    from: number;
    to: number;
    strength: number;
  }

  interface ChainReaction {
    id: number;
    path: number[]; // entity IDs in order
    currentStep: number;
    progress: number; // 0-1 within current step
  }

  let entities: Entity[] = [];
  let connections: Connection[] = [];
  let chainReactions: ChainReaction[] = [];
  let animationFrame: number;
  let reactionId = 0;

  const timelineY = height - 35;
  const graphTop = 25;
  const graphHeight = height - 70;

  const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };

  // Find path through graph using BFS
  function findPath(start: number, depth: number): number[] {
    const path = [start];
    let current = start;

    for (let d = 0; d < depth; d++) {
      const neighbors = connections
        .filter(c => c.from === current || c.to === current)
        .map(c => c.from === current ? c.to : c.from)
        .filter(n => !path.includes(n));

      if (neighbors.length === 0) break;
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      path.push(next);
      current = next;
    }
    return path;
  }

  onMount(() => {
    // Create entities in a more organic layout
    const labels = ['TSMC', 'Apple', 'Chile', 'LiMiner', 'EV', 'Policy', 'Supply', 'Market', 'Risk', 'Trade'];

    entities = labels.map((label, i) => {
      const angle = (i / labels.length) * Math.PI * 2 + seededRandom(i * 7) * 0.5;
      const radius = 80 + seededRandom(i * 13) * 50;
      return {
        id: i,
        x: width / 2 + Math.cos(angle) * radius * (width / 400),
        y: graphTop + graphHeight / 2 + Math.sin(angle) * radius * 0.6,
        size: 12 + seededRandom(i * 19) * 8,
        label,
        activity: 0.3
      };
    });

    // Create connections
    connections = [];
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        if (seededRandom(i * 100 + j * 7) > 0.55) {
          connections.push({
            from: i,
            to: j,
            strength: 0.3 + seededRandom(i * 50 + j) * 0.4
          });
        }
      }
    }

    // Start chain reactions periodically
    const reactionInterval = setInterval(() => {
      const startEntity = Math.floor(Math.random() * entities.length);
      const path = findPath(startEntity, 3 + Math.floor(Math.random() * 3));

      if (path.length > 1) {
        chainReactions = [...chainReactions, {
          id: reactionId++,
          path,
          currentStep: 0,
          progress: 0
        }];
      }
    }, 800);

    const animate = () => {
      // Animate chain reactions
      chainReactions = chainReactions
        .map(r => {
          const newProgress = r.progress + 0.04;
          if (newProgress >= 1) {
            // Move to next step
            if (r.currentStep < r.path.length - 2) {
              return { ...r, currentStep: r.currentStep + 1, progress: 0 };
            }
            return null; // Finished
          }
          return { ...r, progress: newProgress };
        })
        .filter((r): r is ChainReaction => r !== null);

      // Update entity activity based on active chain reactions
      entities = entities.map((e, i) => {
        const isActive = chainReactions.some(r =>
          r.path[r.currentStep] === i || r.path[r.currentStep + 1] === i
        );
        return {
          ...e,
          activity: isActive ? Math.min(1, e.activity + 0.15) : Math.max(0.3, e.activity * 0.96)
        };
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      clearInterval(reactionInterval);
    };
  });

  function getConnectionOpacity(from: number, to: number): number {
    const isActive = chainReactions.some(r => {
      const fromIdx = r.path.indexOf(from);
      const toIdx = r.path.indexOf(to);
      return (fromIdx !== -1 && toIdx !== -1 && Math.abs(fromIdx - toIdx) === 1 &&
              (r.path[r.currentStep] === from || r.path[r.currentStep] === to));
    });
    return isActive ? 0.9 : 0.15;
  }
</script>

<svg
  class="timeline-graph-animation"
  viewBox="0 0 {width} {height}"
  width={width}
  height={height}
>
  <defs>
    <filter id="chainGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <linearGradient id="timelineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color={accentColor} stop-opacity="0" />
      <stop offset="50%" stop-color={accentColor} stop-opacity="0.5" />
      <stop offset="100%" stop-color={accentColor} stop-opacity="0" />
    </linearGradient>
  </defs>

  <!-- Connections -->
  {#each connections as conn}
    {@const from = entities[conn.from]}
    {@const to = entities[conn.to]}
    {@const opacity = getConnectionOpacity(conn.from, conn.to)}
    <line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke={accentColor}
      stroke-width={opacity > 0.5 ? 2.5 : 1}
      opacity={opacity}
    />
  {/each}

  <!-- Chain reaction pulses -->
  {#each chainReactions as reaction}
    {@const fromEntity = entities[reaction.path[reaction.currentStep]]}
    {@const toEntity = entities[reaction.path[reaction.currentStep + 1]]}
    {#if fromEntity && toEntity}
      {@const px = fromEntity.x + (toEntity.x - fromEntity.x) * reaction.progress}
      {@const py = fromEntity.y + (toEntity.y - fromEntity.y) * reaction.progress}

      <!-- Pulse trail -->
      <line
        x1={fromEntity.x}
        y1={fromEntity.y}
        x2={px}
        y2={py}
        stroke={accentColor}
        stroke-width="3"
        opacity="0.6"
      />

      <!-- Main pulse -->
      <circle
        cx={px}
        cy={py}
        r="6"
        fill={accentColor}
        filter="url(#chainGlow)"
        opacity="0.95"
      />
      <circle
        cx={px}
        cy={py}
        r="3"
        fill="white"
        opacity="0.9"
      />
    {/if}
  {/each}

  <!-- Entity nodes -->
  {#each entities as entity}
    <!-- Outer glow -->
    <circle
      cx={entity.x}
      cy={entity.y}
      r={entity.size * 1.5}
      fill={accentColor}
      opacity={entity.activity * 0.35}
    />
    <!-- Main node -->
    <circle
      cx={entity.x}
      cy={entity.y}
      r={entity.size}
      fill={accentColor}
      opacity={0.5 + entity.activity * 0.4}
    />
    <!-- Bright center -->
    <circle
      cx={entity.x}
      cy={entity.y}
      r={entity.size * 0.45}
      fill="white"
      opacity={0.6 + entity.activity * 0.3}
    />
    <!-- Label -->
    <text
      x={entity.x}
      y={entity.y + entity.size + 12}
      text-anchor="middle"
      font-size="9"
      fill={accentColor}
      opacity={0.7 + entity.activity * 0.3}
      font-weight="500"
    >
      {entity.label}
    </text>
  {/each}

  <!-- Timeline at bottom -->
  <line
    x1="20"
    y1={timelineY}
    x2={width - 20}
    y2={timelineY}
    stroke="url(#timelineGrad)"
    stroke-width="2"
  />

  <!-- Active reaction indicators on timeline -->
  {#each chainReactions as reaction, i}
    {@const xPos = 40 + (i * 30) % (width - 80)}
    <circle
      cx={xPos}
      cy={timelineY}
      r="4"
      fill={accentColor}
      opacity="0.8"
    >
      <animate
        attributeName="r"
        values="4;6;4"
        dur="0.8s"
        repeatCount="indefinite"
      />
    </circle>
  {/each}

  <!-- Labels -->
  <text x="25" y={timelineY + 15} font-size="9" fill={accentColor} opacity="0.5">
    Chain Reactions
  </text>
</svg>

<style>
  .timeline-graph-animation {
    display: block;
  }
</style>
