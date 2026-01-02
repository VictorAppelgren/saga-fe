<script lang="ts">
  import { onMount } from 'svelte';

  export let size = 400;
  export let accentColor = '#2563eb';

  let mounted = false;
  let rotation = 0;
  let pulsePhase = 0;

  // Major cities/financial centers spread across the globe
  // Adjusted longitudes to ensure good initial distribution
  const cities = [
    // Americas
    { name: 'New York', lat: 40.7, lng: -74, size: 4 },
    { name: 'Sao Paulo', lat: -23.5, lng: -46.6, size: 3 },
    { name: 'Toronto', lat: 43.7, lng: -79.4, size: 2.5 },
    { name: 'Chicago', lat: 41.9, lng: -87.6, size: 2.5 },
    { name: 'Mexico City', lat: 19.4, lng: -99.1, size: 2 },
    // Europe & Middle East
    { name: 'London', lat: 51.5, lng: 0, size: 4 },
    { name: 'Frankfurt', lat: 50.1, lng: 8.7, size: 3 },
    { name: 'Paris', lat: 48.9, lng: 2.3, size: 3 },
    { name: 'Zurich', lat: 47.4, lng: 8.5, size: 2.5 },
    { name: 'Dubai', lat: 25.3, lng: 55.3, size: 3 },
    { name: 'Moscow', lat: 55.8, lng: 37.6, size: 2.5 },
    // Asia Pacific
    { name: 'Tokyo', lat: 35.7, lng: 139.7, size: 4 },
    { name: 'Singapore', lat: 1.3, lng: 103.8, size: 3 },
    { name: 'Hong Kong', lat: 22.3, lng: 114.2, size: 3 },
    { name: 'Shanghai', lat: 31.2, lng: 121.5, size: 3 },
    { name: 'Mumbai', lat: 19.1, lng: 72.9, size: 2.5 },
    { name: 'Sydney', lat: -33.9, lng: 151.2, size: 3 },
    { name: 'Seoul', lat: 37.6, lng: 127, size: 2.5 },
  ];

  // Connections between financial centers (indices into cities array)
  const connections = [
    // Americas internal
    [0, 2], [0, 3], [0, 1], [1, 4],
    // Americas to Europe
    [0, 5], [0, 7], [2, 5],
    // Europe internal
    [5, 6], [5, 7], [6, 8], [7, 8], [5, 10],
    // Europe to Middle East/Asia
    [5, 9], [9, 15], [10, 9],
    // Asia internal
    [11, 14], [11, 17], [12, 13], [13, 14], [12, 16], [15, 12],
    // Trans-Pacific
    [0, 11], [11, 16], [16, 12],
  ];

  // Convert lat/lng to 3D coordinates on sphere
  function latLngTo3D(lat: number, lng: number, radius: number) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + rotation) * (Math.PI / 180);
    return {
      x: radius * Math.sin(phi) * Math.cos(theta),
      y: radius * Math.cos(phi),
      z: radius * Math.sin(phi) * Math.sin(theta),
    };
  }

  // Project 3D to 2D with perspective
  function project(x: number, y: number, z: number) {
    const perspective = 400;
    const scale = perspective / (perspective + z);
    const radius = size * 0.35;
    return {
      x: x * scale + size / 2,
      y: y * scale + size / 2,
      scale,
      // Show more of the globe - adjusted threshold for better visibility
      visible: z < radius * 0.6,
      // Depth factor for opacity (front = brighter, back = dimmer)
      depth: 1 - (z / radius + 1) / 2,
    };
  }

  // Get projected city positions
  $: projectedCities = cities.map((city) => {
    const pos3d = latLngTo3D(city.lat, city.lng, size * 0.35);
    const proj = project(pos3d.x, pos3d.y, pos3d.z);
    return { ...city, ...proj, z: pos3d.z };
  });

  // Generate globe grid lines (latitude/longitude)
  function generateGridLines() {
    const lines: { points: string; opacity: number }[] = [];
    const radius = size * 0.35;

    // Latitude lines
    for (let lat = -60; lat <= 60; lat += 30) {
      let points = [];
      for (let lng = 0; lng <= 360; lng += 10) {
        const pos3d = latLngTo3D(lat, lng, radius);
        const proj = project(pos3d.x, pos3d.y, pos3d.z);
        if (proj.visible) {
          points.push(`${proj.x},${proj.y}`);
        }
      }
      if (points.length > 2) {
        lines.push({ points: points.join(' '), opacity: 0.15 });
      }
    }

    // Longitude lines
    for (let lng = 0; lng < 360; lng += 30) {
      let points = [];
      for (let lat = -80; lat <= 80; lat += 5) {
        const pos3d = latLngTo3D(lat, lng, radius);
        const proj = project(pos3d.x, pos3d.y, pos3d.z);
        if (proj.visible) {
          points.push(`${proj.x},${proj.y}`);
        }
      }
      if (points.length > 2) {
        lines.push({ points: points.join(' '), opacity: 0.15 });
      }
    }

    return lines;
  }

  $: gridLines = generateGridLines();

  // Traveling data pulses along connections
  let pulses: { connection: number; progress: number; active: boolean }[] = [];

  onMount(() => {
    mounted = true;

    // Slow rotation - start at position showing Americas/Europe
    rotation = -30;

    const rotationInterval = setInterval(() => {
      rotation = (rotation + 0.2) % 360;
    }, 50);

    // Pulse phase for breathing effect
    const pulseInterval = setInterval(() => {
      pulsePhase = (pulsePhase + 0.1) % (Math.PI * 2);
    }, 50);

    // Create traveling pulses
    const pulseCreator = setInterval(() => {
      const connectionIndex = Math.floor(Math.random() * connections.length);
      pulses = [...pulses, { connection: connectionIndex, progress: 0, active: true }];
    }, 500);

    // Animate pulses
    const pulseAnimator = setInterval(() => {
      pulses = pulses
        .map(p => ({ ...p, progress: p.progress + 0.025 }))
        .filter(p => p.progress < 1);
    }, 30);

    return () => {
      clearInterval(rotationInterval);
      clearInterval(pulseInterval);
      clearInterval(pulseCreator);
      clearInterval(pulseAnimator);
    };
  });
</script>

<svg
  class="globe-animation"
  viewBox="0 0 {size} {size}"
  width={size}
  height={size}
>
  <defs>
    <!-- Gradient for globe -->
    <radialGradient id="globeGradient" cx="30%" cy="30%">
      <stop offset="0%" stop-color={accentColor} stop-opacity="0.1" />
      <stop offset="100%" stop-color={accentColor} stop-opacity="0.02" />
    </radialGradient>

    <!-- Glow filter for cities -->
    <filter id="cityGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <!-- Pulse glow -->
    <filter id="pulseGlow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Globe outline -->
  <circle
    cx={size / 2}
    cy={size / 2}
    r={size * 0.35}
    fill="url(#globeGradient)"
    stroke={accentColor}
    stroke-width="1"
    opacity="0.3"
  />

  <!-- Grid lines -->
  {#each gridLines as line}
    <polyline
      points={line.points}
      fill="none"
      stroke={accentColor}
      stroke-width="0.5"
      opacity={line.opacity}
    />
  {/each}

  <!-- Connections between cities -->
  {#each connections as [from, to], i}
    {@const city1 = projectedCities[from]}
    {@const city2 = projectedCities[to]}
    {#if city1.visible && city2.visible}
      {@const avgDepth = (city1.depth + city2.depth) / 2}
      <line
        x1={city1.x}
        y1={city1.y}
        x2={city2.x}
        y2={city2.y}
        stroke={accentColor}
        stroke-width={1.5 * avgDepth + 0.5}
        opacity={(0.35 + Math.sin(pulsePhase + i * 0.5) * 0.15) * avgDepth}
      />
    {/if}
  {/each}

  <!-- Traveling pulses -->
  {#each pulses as pulse}
    {@const [from, to] = connections[pulse.connection]}
    {@const city1 = projectedCities[from]}
    {@const city2 = projectedCities[to]}
    {#if city1.visible && city2.visible}
      {@const px = city1.x + (city2.x - city1.x) * pulse.progress}
      {@const py = city1.y + (city2.y - city1.y) * pulse.progress}
      <circle
        cx={px}
        cy={py}
        r="3"
        fill={accentColor}
        filter="url(#pulseGlow)"
        opacity={1 - pulse.progress}
      />
    {/if}
  {/each}

  <!-- Cities - sorted by z so further ones render first -->
  {#each projectedCities.filter(c => c.visible).sort((a, b) => b.z - a.z) as city}
    <!-- Outer glow -->
    <circle
      cx={city.x}
      cy={city.y}
      r={city.size * city.scale * 2.5}
      fill={accentColor}
      opacity={(0.2 + Math.sin(pulsePhase) * 0.08) * city.depth}
    />
    <!-- City dot -->
    <circle
      cx={city.x}
      cy={city.y}
      r={city.size * city.scale * 1.2}
      fill={accentColor}
      filter="url(#cityGlow)"
      opacity={0.6 + city.depth * 0.3}
    />
    <!-- Bright center -->
    <circle
      cx={city.x}
      cy={city.y}
      r={city.size * city.scale * 0.5}
      fill="white"
      opacity={0.7 + city.depth * 0.25}
    />
  {/each}
</svg>

<style>
  .globe-animation {
    display: block;
  }
</style>
