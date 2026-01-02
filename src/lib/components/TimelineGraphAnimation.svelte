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
    activity: number; // 0-1 for glow intensity
  }

  interface Connection {
    from: number;
    to: number;
    strength: number;
    active: boolean;
  }

  interface TimeEvent {
    x: number;
    y: number;
    age: number;
    targetEntity: number;
    id: number;
  }

  let entities: Entity[] = [];
  let connections: Connection[] = [];
  let timeEvents: TimeEvent[] = [];
  let currentTime = 0;
  let animationFrame: number;
  let eventId = 0;

  // Timeline position
  const timelineY = height - 40;
  const graphAreaHeight = height - 80;
  const graphAreaTop = 30;

  // Seeded random
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };

  onMount(() => {
    // Create entity nodes (graph DB style)
    const entityCount = 12;
    const layers = 3;
    const entitiesPerLayer = Math.ceil(entityCount / layers);

    entities = Array.from({ length: entityCount }, (_, i) => {
      const layer = Math.floor(i / entitiesPerLayer);
      const indexInLayer = i % entitiesPerLayer;
      const layerWidth = width - 100;
      const layerHeight = graphAreaHeight / layers;

      return {
        id: i,
        x: 50 + (indexInLayer / (entitiesPerLayer - 1 || 1)) * layerWidth + (seededRandom(i * 7) - 0.5) * 40,
        y: graphAreaTop + layer * layerHeight + layerHeight / 2 + (seededRandom(i * 13) - 0.5) * 30,
        size: 8 + seededRandom(i * 19) * 8,
        label: ['Co', 'Mkt', 'Pol', 'Sup', 'Reg', 'Eco', 'Geo', 'Fin', 'Ind', 'Com', 'Gov', 'Res'][i] || 'E',
        activity: 0.3 + seededRandom(i * 31) * 0.4
      };
    });

    // Create connections between entities
    connections = [];
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const dx = entities[i].x - entities[j].x;
        const dy = entities[i].y - entities[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 180 && seededRandom(i * 100 + j) > 0.4) {
          connections.push({
            from: i,
            to: j,
            strength: 0.2 + seededRandom(i * 50 + j * 3) * 0.5,
            active: false
          });
        }
      }
    }

    // Generate time events periodically
    const eventInterval = setInterval(() => {
      const targetEntity = Math.floor(Math.random() * entities.length);
      const entity = entities[targetEntity];

      timeEvents = [...timeEvents, {
        x: currentTime,
        y: timelineY,
        age: 0,
        targetEntity,
        id: eventId++
      }];

      // Activate connections to this entity
      connections = connections.map(c => ({
        ...c,
        active: c.from === targetEntity || c.to === targetEntity ? true : c.active
      }));

      // Boost entity activity
      entities = entities.map((e, i) =>
        i === targetEntity ? { ...e, activity: Math.min(1, e.activity + 0.4) } : e
      );

      // Deactivate after delay
      setTimeout(() => {
        connections = connections.map(c => ({
          ...c,
          active: false
        }));
      }, 800);
    }, 400);

    const animate = () => {
      currentTime = (currentTime + 0.8) % (width - 60);

      // Age events and remove old ones
      timeEvents = timeEvents
        .map(e => ({ ...e, age: e.age + 1 }))
        .filter(e => e.age < 150);

      // Decay entity activity
      entities = entities.map(e => ({
        ...e,
        activity: Math.max(0.2, e.activity * 0.995)
      }));

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      clearInterval(eventInterval);
    };
  });
</script>

<svg
  class="timeline-graph-animation"
  viewBox="0 0 {width} {height}"
  {width}
  {height}
>
  <defs>
    <!-- Entity glow -->
    <filter id="entityGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <!-- Connection gradient -->
    <linearGradient id="connGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color={accentColor} stop-opacity="0.2" />
      <stop offset="50%" stop-color={accentColor} stop-opacity="0.6" />
      <stop offset="100%" stop-color={accentColor} stop-opacity="0.2" />
    </linearGradient>

    <!-- Event pulse -->
    <radialGradient id="eventPulse">
      <stop offset="0%" stop-color={accentColor} stop-opacity="0.8" />
      <stop offset="100%" stop-color={accentColor} stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Background grid -->
  {#each Array(Math.floor(width / 50)) as _, i}
    <line
      x1={i * 50}
      y1="0"
      x2={i * 50}
      y2={timelineY - 20}
      stroke={accentColor}
      stroke-width="0.5"
      opacity="0.05"
    />
  {/each}
  {#each Array(Math.floor(graphAreaHeight / 50)) as _, i}
    <line
      x1="0"
      y1={graphAreaTop + i * 50}
      x2={width}
      y2={graphAreaTop + i * 50}
      stroke={accentColor}
      stroke-width="0.5"
      opacity="0.05"
    />
  {/each}

  <!-- Connections between entities -->
  {#each connections as conn}
    {@const fromEntity = entities[conn.from]}
    {@const toEntity = entities[conn.to]}
    <line
      x1={fromEntity.x}
      y1={fromEntity.y}
      x2={toEntity.x}
      y2={toEntity.y}
      stroke={accentColor}
      stroke-width={conn.active ? 2 : 1}
      opacity={conn.active ? 0.8 : conn.strength * 0.4}
    />
    {#if conn.active}
      <!-- Animated pulse along connection -->
      <circle r="3" fill={accentColor} opacity="0.9">
        <animateMotion
          dur="0.5s"
          repeatCount="1"
          path="M {fromEntity.x} {fromEntity.y} L {toEntity.x} {toEntity.y}"
        />
      </circle>
    {/if}
  {/each}

  <!-- Entity nodes -->
  {#each entities as entity}
    <!-- Outer glow based on activity -->
    <circle
      cx={entity.x}
      cy={entity.y}
      r={entity.size * 1.8}
      fill={accentColor}
      opacity={entity.activity * 0.4}
      filter="url(#entityGlow)"
    />
    <!-- Main node -->
    <circle
      cx={entity.x}
      cy={entity.y}
      r={entity.size}
      fill={accentColor}
      opacity={0.4 + entity.activity * 0.5}
    />
    <!-- Inner bright core -->
    <circle
      cx={entity.x}
      cy={entity.y}
      r={entity.size * 0.5}
      fill="white"
      opacity={0.5 + entity.activity * 0.4}
    />
    <!-- Label -->
    <text
      x={entity.x}
      y={entity.y + 3}
      text-anchor="middle"
      font-size="8"
      fill={accentColor}
      opacity={0.6 + entity.activity * 0.4}
      font-weight="600"
    >
      {entity.label}
    </text>
  {/each}

  <!-- Timeline base -->
  <line
    x1="30"
    y1={timelineY}
    x2={width - 30}
    y2={timelineY}
    stroke={accentColor}
    stroke-width="2"
    opacity="0.3"
  />

  <!-- Timeline tick marks -->
  {#each Array(10) as _, i}
    <line
      x1={30 + i * ((width - 60) / 9)}
      y1={timelineY - 5}
      x2={30 + i * ((width - 60) / 9)}
      y2={timelineY + 5}
      stroke={accentColor}
      stroke-width="1"
      opacity="0.3"
    />
  {/each}

  <!-- Current time indicator (moving marker) -->
  <line
    x1={30 + currentTime}
    y1={timelineY - 15}
    x2={30 + currentTime}
    y2={timelineY + 15}
    stroke={accentColor}
    stroke-width="2"
    opacity="0.8"
  />
  <circle
    cx={30 + currentTime}
    cy={timelineY}
    r="5"
    fill={accentColor}
    opacity="0.9"
  />

  <!-- Time events (ripples from timeline to entities) -->
  {#each timeEvents as event}
    {@const targetEntity = entities[event.targetEntity]}
    {@const progress = Math.min(1, event.age / 30)}
    {@const fadeOpacity = Math.max(0, 1 - event.age / 150)}

    {#if progress < 1}
      <!-- Rising connection from timeline to entity -->
      <line
        x1={30 + event.x}
        y1={timelineY}
        x2={30 + event.x + (targetEntity.x - 30 - event.x) * progress}
        y2={timelineY + (targetEntity.y - timelineY) * progress}
        stroke={accentColor}
        stroke-width="1.5"
        opacity={fadeOpacity * 0.6}
        stroke-dasharray="4 2"
      />
    {/if}

    <!-- Event marker on timeline -->
    <circle
      cx={30 + event.x}
      cy={timelineY}
      r={3 + event.age * 0.1}
      fill="url(#eventPulse)"
      opacity={fadeOpacity * 0.5}
    />
  {/each}

  <!-- Labels -->
  <text
    x="15"
    y={timelineY + 4}
    font-size="10"
    fill={accentColor}
    opacity="0.5"
  >
    t
  </text>
  <text
    x={width - 25}
    y={timelineY + 4}
    font-size="10"
    fill={accentColor}
    opacity="0.5"
  >
    now
  </text>
</svg>

<style>
  .timeline-graph-animation {
    display: block;
  }
</style>
