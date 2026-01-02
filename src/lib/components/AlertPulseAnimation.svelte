<script lang="ts">
  import { onMount } from 'svelte';

  export let width = 400;
  export let height = 280;
  export let accentColor = '#2563eb';

  interface AlertSource {
    id: number;
    x: number;
    y: number;
    label: string;
    intensity: number;
  }

  interface PulseRing {
    id: number;
    sourceId: number;
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    opacity: number;
  }

  let alertSources: AlertSource[] = [];
  let pulseRings: PulseRing[] = [];
  let animationFrame: number;
  let ringId = 0;

  const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };

  onMount(() => {
    // Create alert sources (monitored positions/entities)
    const sourceLabels = ['Chile Policy', 'TSMC Supply', 'Fed Rate', 'EUR/USD', 'Oil Shock', 'Credit Event'];
    alertSources = sourceLabels.map((label, i) => ({
      id: i,
      x: 60 + (i % 3) * ((width - 120) / 2) + seededRandom(i * 7) * 40,
      y: 50 + Math.floor(i / 3) * ((height - 80) / 1.5) + seededRandom(i * 13) * 30,
      label,
      intensity: 0.3 + seededRandom(i * 19) * 0.4
    }));

    // Spawn pulse rings periodically
    const pulseInterval = setInterval(() => {
      // Pick 1-2 sources to pulse
      const numPulses = 1 + Math.floor(Math.random() * 2);
      for (let p = 0; p < numPulses; p++) {
        const source = alertSources[Math.floor(Math.random() * alertSources.length)];
        pulseRings = [...pulseRings, {
          id: ringId++,
          sourceId: source.id,
          x: source.x,
          y: source.y,
          radius: 8,
          maxRadius: 50 + Math.random() * 30,
          opacity: 0.8
        }];

        // Boost source intensity
        alertSources = alertSources.map(s =>
          s.id === source.id ? { ...s, intensity: Math.min(1, s.intensity + 0.3) } : s
        );
      }
    }, 600);

    const animate = () => {
      // Expand and fade pulse rings
      pulseRings = pulseRings
        .map(ring => ({
          ...ring,
          radius: ring.radius + 1.5,
          opacity: Math.max(0, ring.opacity - 0.015)
        }))
        .filter(ring => ring.opacity > 0);

      // Decay source intensity
      alertSources = alertSources.map(s => ({
        ...s,
        intensity: Math.max(0.3, s.intensity * 0.98)
      }));

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      clearInterval(pulseInterval);
    };
  });
</script>

<svg
  class="alert-pulse-animation"
  viewBox="0 0 {width} {height}"
  width={width}
  height={height}
>
  <defs>
    <filter id="alertGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Subtle grid background -->
  {#each Array(Math.floor(width / 40)) as _, i}
    <line
      x1={i * 40}
      y1="0"
      x2={i * 40}
      y2={height}
      stroke={accentColor}
      stroke-width="0.5"
      opacity="0.05"
    />
  {/each}
  {#each Array(Math.floor(height / 40)) as _, i}
    <line
      x1="0"
      y1={i * 40}
      x2={width}
      y2={i * 40}
      stroke={accentColor}
      stroke-width="0.5"
      opacity="0.05"
    />
  {/each}

  <!-- Pulse rings -->
  {#each pulseRings as ring}
    <circle
      cx={ring.x}
      cy={ring.y}
      r={ring.radius}
      fill="none"
      stroke={accentColor}
      stroke-width="2"
      opacity={ring.opacity}
    />
    <!-- Second ring offset -->
    {#if ring.radius > 15}
      <circle
        cx={ring.x}
        cy={ring.y}
        r={ring.radius - 10}
        fill="none"
        stroke={accentColor}
        stroke-width="1"
        opacity={ring.opacity * 0.5}
      />
    {/if}
  {/each}

  <!-- Alert sources -->
  {#each alertSources as source}
    <!-- Glow based on intensity -->
    <circle
      cx={source.x}
      cy={source.y}
      r={15 * source.intensity}
      fill={accentColor}
      opacity={source.intensity * 0.3}
      filter="url(#alertGlow)"
    />
    <!-- Main dot -->
    <circle
      cx={source.x}
      cy={source.y}
      r="8"
      fill={accentColor}
      opacity={0.5 + source.intensity * 0.4}
    />
    <!-- Bright center -->
    <circle
      cx={source.x}
      cy={source.y}
      r="3"
      fill="white"
      opacity={0.6 + source.intensity * 0.3}
    />
    <!-- Label -->
    <text
      x={source.x}
      y={source.y + 20}
      text-anchor="middle"
      font-size="8"
      fill={accentColor}
      opacity={0.6 + source.intensity * 0.3}
      font-weight="500"
    >
      {source.label}
    </text>
  {/each}

  <!-- Title -->
  <text
    x={width / 2}
    y={height - 10}
    text-anchor="middle"
    font-size="10"
    fill={accentColor}
    opacity="0.5"
    font-weight="600"
  >
    ALERT DETECTION
  </text>
</svg>

<style>
  .alert-pulse-animation {
    display: block;
  }
</style>
