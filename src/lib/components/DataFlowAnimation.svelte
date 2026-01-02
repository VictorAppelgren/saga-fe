<script lang="ts">
  import { onMount } from 'svelte';

  export let width = 400;
  export let height = 300;
  export let accentColor = '#2563eb';

  interface Particle {
    id: number;
    x: number;
    y: number;
    speed: number;
    size: number;
    opacity: number;
    lane: number;
  }

  interface StreamLine {
    y: number;
    opacity: number;
    amplitude: number;
    frequency: number;
    phase: number;
  }

  let particles: Particle[] = [];
  let streamLines: StreamLine[] = [];
  let animationFrame: number;
  let time = 0;
  let particleId = 0;

  // Seeded random for consistent patterns
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };

  onMount(() => {
    // Initialize stream lines (horizontal flowing paths)
    const numStreams = 8;
    streamLines = Array.from({ length: numStreams }, (_, i) => ({
      y: (height / (numStreams + 1)) * (i + 1),
      opacity: 0.15 + seededRandom(i * 7) * 0.2,
      amplitude: 8 + seededRandom(i * 13) * 12,
      frequency: 0.02 + seededRandom(i * 19) * 0.015,
      phase: seededRandom(i * 31) * Math.PI * 2
    }));

    // Spawn particles regularly with randomness
    const spawnInterval = setInterval(() => {
      const numToSpawn = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < numToSpawn; i++) {
        const laneIndex = Math.floor(Math.random() * streamLines.length);
        particles = [...particles, {
          id: particleId++,
          x: -10 - Math.random() * 30,
          y: streamLines[laneIndex].y,
          speed: 1.5 + Math.random() * 2,
          size: 2 + Math.random() * 3,
          opacity: 0.5 + Math.random() * 0.5,
          lane: laneIndex
        }];
      }
    }, 80);

    const animate = () => {
      time += 0.03;

      // Update particles
      particles = particles
        .map(p => {
          const stream = streamLines[p.lane];
          const waveY = stream.y + Math.sin(p.x * stream.frequency + stream.phase + time) * stream.amplitude;
          return {
            ...p,
            x: p.x + p.speed,
            y: waveY
          };
        })
        .filter(p => p.x < width + 20);

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      clearInterval(spawnInterval);
    };
  });

  // Generate wave path for stream line
  function getStreamPath(stream: StreamLine): string {
    const points: string[] = [];
    for (let x = 0; x <= width; x += 5) {
      const y = stream.y + Math.sin(x * stream.frequency + stream.phase + time) * stream.amplitude;
      points.push(x === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
    }
    return points.join(' ');
  }
</script>

<svg
  class="data-flow-animation"
  viewBox="0 0 {width} {height}"
  {width}
  {height}
>
  <defs>
    <!-- Glow filter for particles -->
    <filter id="dataGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <!-- Gradient for stream lines -->
    <linearGradient id="streamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color={accentColor} stop-opacity="0" />
      <stop offset="20%" stop-color={accentColor} stop-opacity="1" />
      <stop offset="80%" stop-color={accentColor} stop-opacity="1" />
      <stop offset="100%" stop-color={accentColor} stop-opacity="0" />
    </linearGradient>

    <!-- Gradient for particles (comet tail effect) -->
    <linearGradient id="particleGradient" x1="100%" y1="0%" x2="0%" y2="0%">
      <stop offset="0%" stop-color={accentColor} stop-opacity="1" />
      <stop offset="100%" stop-color={accentColor} stop-opacity="0" />
    </linearGradient>
  </defs>

  <!-- Background subtle grid -->
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

  <!-- Stream lines (flowing paths) -->
  {#each streamLines as stream}
    <path
      d={getStreamPath(stream)}
      fill="none"
      stroke="url(#streamGradient)"
      stroke-width="1"
      opacity={stream.opacity}
    />
  {/each}

  <!-- Particles with tails -->
  {#each particles as particle}
    <!-- Tail -->
    <ellipse
      cx={particle.x - particle.size * 2}
      cy={particle.y}
      rx={particle.size * 4}
      ry={particle.size * 0.6}
      fill="url(#particleGradient)"
      opacity={particle.opacity * 0.4}
    />
    <!-- Main particle -->
    <circle
      cx={particle.x}
      cy={particle.y}
      r={particle.size}
      fill={accentColor}
      opacity={particle.opacity}
      filter="url(#dataGlow)"
    />
    <!-- Bright core -->
    <circle
      cx={particle.x}
      cy={particle.y}
      r={particle.size * 0.4}
      fill="white"
      opacity={particle.opacity * 0.8}
    />
  {/each}

  <!-- Entry/exit indicators -->
  <rect
    x="0"
    y="0"
    width="3"
    height={height}
    fill={accentColor}
    opacity="0.15"
  />
  <rect
    x={width - 3}
    y="0"
    width="3"
    height={height}
    fill={accentColor}
    opacity="0.15"
  />
</svg>

<style>
  .data-flow-animation {
    display: block;
  }
</style>
